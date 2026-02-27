import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Check, Package } from 'lucide-react'
import { Input } from '@/components/atoms/Input'
import { LucideIcon } from 'lucide-react'

export interface SelectableItem {
  id: string
  name?: string
  title?: string
  category?: string
  [key: string]: unknown
}

export interface ItemSelectorProps<T extends SelectableItem> {
  label: string
  items: T[]
  selectedIds?: string[]
  selectedId?: string
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  multiSelect?: boolean
  searchFields?: string[]
  categoryFilter?: boolean
  placeholder?: string
  emptyMessage?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  renderItem?: (item: T) => React.ReactNode
}

const defaultRenderItem = <T extends SelectableItem>(item: T) => (
  <div className="flex items-center justify-between">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">
        {item.name || item.title || 'Untitled'}
      </p>
      {item.category && (
        <p className="text-[10px] font-mono tracking-wider text-muted-foreground">
          {item.category}
        </p>
      )}
    </div>
  </div>
)

export function ItemSelector<T extends SelectableItem>({
  label,
  items,
  selectedIds = [],
  selectedId,
  onToggle,
  onSelect,
  multiSelect = false,
  searchFields = ['name', 'title', 'category'],
  categoryFilter = false,
  placeholder = 'Search...',
  emptyMessage = 'No items found',
  hint,
  error,
  required = false,
  disabled = false,
  className = '',
  renderItem
}: ItemSelectorProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    if (!categoryFilter) return null
    const cats = new Set(items.map(item => item.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [items, categoryFilter])

  const filteredItems = useMemo(() => {
    let result = items

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field]
          return typeof value === 'string' && value.toLowerCase().includes(query)
        })
      )
    }

    if (categoryFilter && expandedCategory) {
      result = result.filter(item => item.category === expandedCategory)
    }

    return result
  }, [items, searchQuery, searchFields, categoryFilter, expandedCategory])

  const isSelected = (id: string) => {
    if (multiSelect) return selectedIds.includes(id)
    return selectedId === id
  }

  const handleToggle = (id: string) => {
    if (multiSelect && onToggle) {
      onToggle(id)
    } else if (!multiSelect && onSelect) {
      onSelect(id)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono border border-red-500/50 bg-red-500/10 text-red-500">
            *
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          leftIcon={<Search size={14} className="text-muted-foreground" />}
          fullWidth
          size="sm"
        />

        {categoryFilter && categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setExpandedCategory(null)}
              className={`px-2 py-1 text-[10px] font-mono tracking-wider border transition-all
                ${!expandedCategory 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'border-border text-muted-foreground hover:text-foreground'
                }
              `}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                className={`px-2 py-1 text-[10px] font-mono tracking-wider border transition-all
                  ${expandedCategory === cat 
                    ? 'bg-primary/10 border-primary/30 text-primary' 
                    : 'border-border text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-white/10">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const selected = isSelected(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  disabled={disabled}
                  className={`
                    w-full flex items-center justify-between p-3 text-left
                    border-b border-gray-200 dark:border-white/5 last:border-b-0
                    transition-all
                    ${selected 
                      ? 'bg-primary/10 border-l-2 border-l-primary' 
                      : 'hover:bg-secondary/50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="min-w-0 flex-1">
                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                  </div>
                  <div className={`
                    w-5 h-5 flex items-center justify-center ml-2 shrink-0
                    border transition-all
                    ${selected 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-border'
                    }
                  `}>
                    {selected && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="p-4 text-center">
              <Package size={24} className="mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground">
                {emptyMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
