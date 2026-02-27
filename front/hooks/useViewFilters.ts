import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'
export type SortBy = 'status' | 'priority' | 'dueDate' | 'created' | 'modified' | 'alpha' | string

export interface FilterState {
  query: string
  category: string
  status: string
  priority: string
  sortBy: SortBy
  sortDirection: SortDirection
}

export interface FilterConfig<T> {
  searchFields?: (keyof T | string)[]
  filterFields?: {
    [K in keyof T]?: (value: T[K], item: T) => boolean
  }
  sortOptions?: SortBy[]
  defaultSort?: { by: SortBy; direction: SortDirection }
}

interface UseViewFiltersOptions<T> {
  data: T[]
  initialFilters?: Partial<FilterState>
  config?: FilterConfig<T>
}

interface UseViewFiltersReturn<T> {
  filteredData: T[]
  filters: FilterState
  setQuery: (query: string) => void
  setCategory: (category: string) => void
  setStatus: (status: string) => void
  setPriority: (priority: string) => void
  setSortBy: (sortBy: SortBy) => void
  setSortDirection: (direction: SortDirection) => void
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  updateFilters: (updates: Partial<FilterState>) => void
}

const defaultFilters: FilterState = {
  query: '',
  category: 'All',
  status: 'All',
  priority: 'All',
  sortBy: 'alpha',
  sortDirection: 'asc'
}

export function useViewFilters<T>({
  data,
  initialFilters,
  config
}: UseViewFiltersOptions<T>): UseViewFiltersReturn<T> {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
    sortBy: initialFilters?.sortBy || config?.defaultSort?.by || 'alpha',
    sortDirection: initialFilters?.sortDirection || config?.defaultSort?.direction || 'asc'
  })

  const filteredData = useMemo(() => {
    let result = [...data]

    if (filters.query && config?.searchFields) {
      const lowerQuery = filters.query.toLowerCase()
      result = result.filter(item => {
        return config.searchFields!.some(field => {
          const value = item[field as keyof T]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerQuery)
          }
          if (typeof value === 'number') {
            return String(value).includes(lowerQuery)
          }
          return false
        })
      })
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(item => {
        const categoryValue = item.category
        if (typeof categoryValue === 'string') {
          return categoryValue === filters.category || 
                 categoryValue.toLowerCase() === filters.category.toLowerCase()
        }
        return true
      })
    }

    if (filters.status && filters.status !== 'All') {
      result = result.filter(item => {
        const statusValue = (item as unknown as { status?: string }).status
        if (typeof statusValue === 'string') {
          return statusValue.toLowerCase() === filters.status.toLowerCase()
        }
        return true
      })
    }

    if (filters.priority && filters.priority !== 'All') {
      result = result.filter(item => {
        const priorityValue = (item as unknown as { priority?: string }).priority
        if (typeof priorityValue === 'string') {
          return priorityValue.toLowerCase() === filters.priority.toLowerCase()
        }
        return true
      })
    }

    const sortBy = filters.sortBy
    const sortDir = filters.sortDirection === 'asc' ? 1 : -1

    result.sort((a, b) => {
      let aVal: string | number | Date = ''
      let bVal: string | number | Date = ''

      switch (sortBy) {
        case 'alpha':
          aVal = String((a as unknown as { title?: string }).title || '').toLowerCase()
          bVal = String((b as unknown as { title?: string }).title || '').toLowerCase()
          break
        case 'status': {
          const statusOrder = { done: 4, review: 3, progress: 2, todo: 1, pending: 0 }
          aVal = statusOrder[(a as unknown as { status?: string }).status as keyof typeof statusOrder] ?? 0
          bVal = statusOrder[(b as unknown as { status?: string }).status as keyof typeof statusOrder] ?? 0
          break
        }
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          aVal = priorityOrder[(a as unknown as { priority?: string }).priority as keyof typeof priorityOrder] ?? 0
          bVal = priorityOrder[(b as unknown as { priority?: string }).priority as keyof typeof priorityOrder] ?? 0
          break
        }
        case 'dueDate':
          aVal = new Date((a as unknown as { dueDate?: string }).dueDate || '9999-12-31')
          bVal = new Date((b as unknown as { dueDate?: string }).dueDate || '9999-12-31')
          break
        case 'created':
          aVal = new Date((a as unknown as { createdAt?: string }).createdAt || '1970-01-01')
          bVal = new Date((b as unknown as { createdAt?: string }).createdAt || '1970-01-01')
          break
        case 'modified':
        case 'updated':
          aVal = new Date((a as unknown as { updatedAt?: string }).updatedAt || '1970-01-01')
          bVal = new Date((b as unknown as { updatedAt?: string }).updatedAt || '1970-01-01')
          break
        default:
          aVal = String((a as Record<string, unknown>)[sortBy as string] || '').toLowerCase()
          bVal = String((b as Record<string, unknown>)[sortBy as string] || '').toLowerCase()
      }

      if (aVal < bVal) return -1 * sortDir
      if (aVal > bVal) return 1 * sortDir
      return 0
    })

    return result
  }, [data, filters, config])

  const setQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }))
  }, [])

  const setStatus = useCallback((status: string) => {
    setFilters(prev => ({ ...prev, status }))
  }, [])

  const setPriority = useCallback((priority: string) => {
    setFilters(prev => ({ ...prev, priority }))
  }, [])

  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }, [])

  const setSortDirection = useCallback((sortDirection: SortDirection) => {
    setFilters(prev => ({ ...prev, sortDirection }))
  }, [])

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      sortBy: config?.defaultSort?.by || 'alpha',
      sortDirection: config?.defaultSort?.direction || 'asc'
    })
  }, [config])

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    filteredData,
    filters,
    setQuery,
    setCategory,
    setStatus,
    setPriority,
    setSortBy,
    setSortDirection,
    setFilter,
    resetFilters,
    updateFilters
  }
}

export function useSimpleSearch<T>({
  data,
  searchFields = ['title']
}: {
  data: T[]
  searchFields?: (keyof T | string)[]
}) {
  const [query, setQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!query.trim()) return data

    const lowerQuery = query.toLowerCase()
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field as keyof T]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery)
        }
        return false
      })
    })
  }, [data, query, searchFields])

  return { filteredData, query, setQuery }
}
