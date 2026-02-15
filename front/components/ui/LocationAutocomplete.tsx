import React, { useState, useRef, useEffect } from 'react'
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'
import { MapPin, X, Loader2 } from 'lucide-react'

export interface LocationSuggestion {
  displayName: string
  lat: number
  lng: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, location?: LocationSuggestion) => void
  placeholder?: string
  label?: string
}

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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const justSelectedRef = useRef(false)

  const { refs, floatingStyles, placement } = useFloating({
    open: showSuggestions && suggestions.length > 0,
    onOpenChange: (open) => {
      if (!open) setShowSuggestions(false)
    },
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate
  })

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
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs.reference, refs.floating])

  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'Vemakin/1.0'
          }
        }
      )
      const data = await response.json()
      
      const results: LocationSuggestion[] = data.map((item: any) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }))
      
      setSuggestions(results)
    } catch (error) {
      console.error('Location search error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedLocation(null)
    onChange(newValue, undefined)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchLocation(newValue)
      setShowSuggestions(true)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion: LocationSuggestion, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    justSelectedRef.current = true
    setInputValue(suggestion.displayName)
    setSelectedLocation(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    onChange(suggestion.displayName, suggestion)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    justSelectedRef.current = true
    setInputValue('')
    setSelectedLocation(null)
    setSuggestions([])
    onChange('', undefined)
  }

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
            inputValue.length >= 3 && setShowSuggestions(true)
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full h-12 py-3 pl-8 pr-10
            bg-transparent
            border-0 border-b-2 border-gray-200 dark:border-white/10
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
          `}
          style={{ caretColor: 'currentColor' }}
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
          {isLoading && <Loader2 size={14} className="text-primary animate-spin" />}
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

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={refs.setFloating as any}
          style={floatingStyles}
          className="z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => handleSelectSuggestion(suggestion, e)}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
            >
              <div className="truncate font-medium">{suggestion.displayName.split(',')[0]}</div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {suggestion.displayName.split(',').slice(1).join(',').trim()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
