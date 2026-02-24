import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'
import { MapPin, X, Loader2, AlertCircle, WifiOff } from 'lucide-react'

export interface LocationSuggestion {
  displayName: string
  lat: number
  lng: number
}

interface CacheEntry {
  results: LocationSuggestion[]
  timestamp: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, location?: LocationSuggestion) => void
  placeholder?: string
  label?: string
}

// Simple in-memory cache
const memoryCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 1 // Reduced from 3 to minimize failed requests
const RETRY_DELAY = 800 // Slightly faster retry
const DEBOUNCE_MS = 600 // Increased from 400 to reduce requests

// Request deduplication
let currentAbortController: AbortController | null = null
const pendingRequests = new Map<string, Promise<LocationSuggestion[]>>()

// Batch debounce ref at module level for better control
let globalDebounceRef: ReturnType<typeof setTimeout> | null = null

// Geocoding services configuration - using Photon only (Nominatim removed due to connection issues)
const GEOCODING_SERVICES = [
  {
    name: 'Photon',
    url: (query: string) => 
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
    headers: {},
    transform: (data: any): LocationSuggestion[] => 
      (data.features || []).map((feature: any) => ({
        displayName: feature.properties.name + 
          (feature.properties.city ? `, ${feature.properties.city}` : '') +
          (feature.properties.country ? `, ${feature.properties.country}` : ''),
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      }))
  }
]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search location...',
  label
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const justSelectedRef = useRef(false)

  const { refs, floatingStyles, placement } = useFloating({
    open: showSuggestions && (suggestions.length > 0 || !!error),
    onOpenChange: (open) => {
      if (!open) {
        setShowSuggestions(false)
        setError(null)
      }
    },
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate
  })

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('locationAutocompleteCache')
      if (savedCache) {
        const parsed = JSON.parse(savedCache)
        Object.entries(parsed).forEach(([key, entry]) => {
          if (Date.now() - (entry as CacheEntry).timestamp < CACHE_DURATION) {
            memoryCache.set(key, entry as CacheEntry)
          }
        })
      }
    } catch (e) {
      console.warn('Failed to load location cache:', e)
    }
  }, [])

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }
      pendingRequests.clear()
      if (globalDebounceRef) {
        clearTimeout(globalDebounceRef)
        globalDebounceRef = null
      }
    }
  }, [])

  // Save cache to localStorage periodically
  useEffect(() => {
    const saveCache = () => {
      try {
        const cacheObj = Object.fromEntries(memoryCache.entries())
        localStorage.setItem('locationAutocompleteCache', JSON.stringify(cacheObj))
      } catch (e) {
        console.warn('Failed to save location cache:', e)
      }
    }

    const interval = setInterval(saveCache, 30000) // Save every 30 seconds
    return () => {
      clearInterval(interval)
      saveCache()
    }
  }, [])

  useEffect(() => {
    if (!isFocused && !justSelectedRef.current) {
      setInputValue(value)
    }
    if (justSelectedRef.current) {
      justSelectedRef.current = false
    }
  }, [value, isFocused])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        refs.reference.current && 
        !refs.reference.current.contains(event.target as Node) &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setError(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs.reference, refs.floating])

  const fetchWithRetry = useCallback(async (
    service: typeof GEOCODING_SERVICES[0],
    query: string,
    attempt: number = 1
  ): Promise<LocationSuggestion[]> => {
    try {
      // Check if request was aborted before starting
      if (currentAbortController?.signal.aborted) {
        throw new Error('Request cancelled')
      }

      const timeoutId = setTimeout(() => {
        if (currentAbortController && !currentAbortController.signal.aborted) {
          currentAbortController.abort()
        }
      }, 10000) // 10 second timeout

      const response = await fetch(service.url(query), {
        headers: service.headers,
        signal: currentAbortController?.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const results = service.transform(data)
      
      if (results.length === 0) {
        throw new Error('No results found')
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1) // Exponential backoff
        await sleep(delay)
        return fetchWithRetry(service, query, attempt + 1)
      }
      
      throw new Error(`${service.name}: ${errorMessage}`)
    }
  }, [])

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      setError(null)
      return
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim()
    const cached = memoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSuggestions(cached.results)
      setError(null)
      return
    }

    // Request deduplication: check if same query is already being fetched
    if (pendingRequests.has(cacheKey)) {
      try {
        const results = await pendingRequests.get(cacheKey)!
        setSuggestions(results)
        setError(null)
        return
      } catch {
        // If the pending request fails, we'll try again below
      }
    }

    // Cancel any previous request
    if (currentAbortController) {
      currentAbortController.abort()
    }
    currentAbortController = new AbortController()

    setIsLoading(true)
    setError(null)
    setRetryCount(0)

    // Create a promise for this search to enable deduplication
    const searchPromise = (async () => {
      let lastError: Error | null = null

      // Try each service in order
      for (let serviceIndex = 0; serviceIndex < GEOCODING_SERVICES.length; serviceIndex++) {
        const service = GEOCODING_SERVICES[serviceIndex]
        
        try {
          // Check if aborted before making request
          if (currentAbortController?.signal.aborted) {
            throw new Error('Request cancelled')
          }
          
          setRetryCount(serviceIndex > 0 ? serviceIndex : 0)
          const results = await fetchWithRetry(service, query)
          
          // Cache successful results
          memoryCache.set(cacheKey, {
            results,
            timestamp: Date.now()
          })
          
          return results
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Search failed')
          // Silently handle failures - no console warnings
          
          // Continue to next service
          if (serviceIndex < GEOCODING_SERVICES.length - 1) {
            setRetryCount(serviceIndex + 1)
          }
        }
      }

      throw lastError || new Error('All services failed')
    })()

    // Store promise for deduplication
    pendingRequests.set(cacheKey, searchPromise)

    try {
      const results = await searchPromise
      setSuggestions(results)
      setError(null)
    } catch {
      setSuggestions([])
      setError('Unable to search locations. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
      pendingRequests.delete(cacheKey)
      if (currentAbortController?.signal.aborted === false) {
        currentAbortController = null
      }
    }
  }, [fetchWithRetry])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedLocation(null)
    setError(null)
    onChange(newValue, undefined)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(newValue)
      setShowSuggestions(true)
    }, DEBOUNCE_MS) // Increased debounce to reduce API calls
  }

  const handleSelectSuggestion = (suggestion: LocationSuggestion, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    justSelectedRef.current = true
    setInputValue(suggestion.displayName)
    setSelectedLocation(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    setError(null)
    onChange(suggestion.displayName, suggestion)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    justSelectedRef.current = true
    setInputValue('')
    setSelectedLocation(null)
    setSuggestions([])
    setError(null)
    onChange('', undefined)
  }

  const handleRetry = () => {
    if (inputValue.length >= 3) {
      searchLocation(inputValue)
    }
  }

  const showDropdown = showSuggestions && (suggestions.length > 0 || !!error)

  return (
    <div className="relative w-full">
      {label && (
        <span className="text-[10px] text-white/40 font-medium mb-2 block">{label}</span>
      )}
      
      <div className="relative group">
        <MapPin 
          size={14} 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors pointer-events-none z-10" 
        />
        
        <input
          ref={refs.setReference as any}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true)
            if (inputValue.length >= 3 && !error) {
              setShowSuggestions(true)
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full h-12 py-3 pl-8 pr-10
            bg-transparent
            border-0 border-b-2 
            ${error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}
            text-lg font-semibold
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none
            focus:border-primary dark:focus:border-primary
            focus:bg-transparent
            focus-visible:bg-transparent
            focus-visible:outline-none
            focus-visible:ring-0
            active:bg-transparent
            -webkit-tap-highlight-color-transparent
            transition-colors
          `}
          style={{ caretColor: 'currentColor' }}
        />
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          {isLoading && (
            <div className="flex items-center gap-1">
              {retryCount > 0 && (
                <span className="text-[10px] text-white/40">Retry {retryCount}/{GEOCODING_SERVICES.length}</span>
              )}
              <Loader2 size={14} className="text-primary animate-spin" />
            </div>
          )}
          {error && !isLoading && (
            <AlertCircle size={14} className="text-red-500" />
          )}
          {(inputValue || selectedLocation) && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Error or Suggestions Dropdown - Terminal Style */}
      {showDropdown && (
        <div
          ref={refs.setFloating as any}
          style={floatingStyles}
          className="z-[9999] bg-[#fafafa] dark:bg-[#0a0a0a] border border-gray-300 dark:border-white/20 rounded-none max-h-60 overflow-y-auto font-mono"
        >
          {error ? (
            <div className="px-4 py-6 text-center">
              <WifiOff size={20} className="mx-auto mb-2 text-red-500 dark:text-red-400 opacity-80" />
              <p className="text-sm text-gray-900 dark:text-white/80 mb-1 font-mono">
                [ERROR] {error}
              </p>
              <p className="text-xs text-gray-500 dark:text-white/40 mb-3 font-mono">
                connection_failed
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 text-xs font-mono text-gray-900 dark:text-white border border-gray-400 dark:border-white/30 hover:border-gray-600 dark:hover:border-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                &gt; retry
              </button>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => handleSelectSuggestion(suggestion, e)}
                className="w-full px-4 py-2.5 text-left text-sm font-mono text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-white/10 last:border-0"
              >
                <div className="truncate">{suggestion.displayName.split(',')[0]}</div>
                <div className="truncate text-xs text-gray-500 dark:text-white/40">
                  {suggestion.displayName.split(',').slice(1).join(',').trim()}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
