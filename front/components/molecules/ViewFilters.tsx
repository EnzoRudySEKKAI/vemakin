import React, { ReactNode } from 'react'
import { Search, ChevronDown, LayoutGrid, List, Plus, X } from 'lucide-react'
import { TerminalButton } from '../ui/TerminalButton'
import { Input } from '../atoms/Input'
import { FilterDropdown } from './FilterDropdown'

export type ViewLayout = 'grid' | 'list'

export interface FilterConfigItem {
  type: 'search' | 'select' | 'multiselect' | 'sort' | 'date'
  field?: string
  label?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface ViewFiltersProps {
  config?: FilterConfigItem[]
  filters: {
    query?: string
    category?: string
    status?: string
    priority?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }
  onFilterChange: (updates: Record<string, unknown>) => void
  layoutToggle?: {
    value: ViewLayout
    onChange: (layout: ViewLayout) => void
    options?: ViewLayout[]
  }
  addButton?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const ViewFilters: React.FC<ViewFiltersProps> = ({
  config = [],
  filters,
  onFilterChange,
  layoutToggle,
  addButton,
  className = ''
}) => {
  const hasSearchConfig = config.some(c => c.type === 'search')
  const hasFilters = config.length > 0 || layoutToggle || addButton

  if (!hasFilters) return null

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {hasSearchConfig && (
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Input
            type="search"
            value={filters.query || ''}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder={config.find(c => c.type === 'search')?.placeholder || 'Search...'}
            leftIcon={<Search size={14} className="text-muted-foreground" />}
            fullWidth
            size="sm"
          />
        </div>
      )}

      {config.filter(c => c.type === 'select').map((filterConfig) => {
        const currentValue = filters[filterConfig.field as keyof FilterState] || 'All'
        
        return (
          <FilterDropdown
            key={filterConfig.field}
            label={filterConfig.label}
            value={currentValue}
            options={[
              { value: 'All', label: `All ${filterConfig.label}s` },
              ...(filterConfig.options || [])
            ]}
            onChange={(value) => onFilterChange({ [filterConfig.field!]: value })}
          />
        )
      })}

      {config.filter(c => c.type === 'sort').map((sortConfig) => {
        const currentSortBy = filters.sortBy || 'alpha'
        const currentDirection = filters.sortDirection || 'asc'
        
        return (
          <FilterDropdown
            key="sort"
            label="Sort"
            value={`${currentSortBy}-${currentDirection}`}
            options={[
              { value: 'alpha-asc', label: 'A → Z' },
              { value: 'alpha-desc', label: 'Z → A' },
              { value: 'status-asc', label: 'Status ↑' },
              { value: 'status-desc', label: 'Status ↓' },
              { value: 'priority-asc', label: 'Priority ↑' },
              { value: 'priority-desc', label: 'Priority ↓' },
              { value: 'dueDate-asc', label: 'Due Date ↑' },
              { value: 'dueDate-desc', label: 'Due Date ↓' },
              { value: 'created-asc', label: 'Created ↑' },
              { value: 'created-desc', label: 'Created ↓' },
            ]}
            onChange={(value) => {
              const [sortBy, sortDirection] = value.split('-')
              onFilterChange({ sortBy, sortDirection })
            }}
          />
        )
      })}

      <div className="flex items-center gap-2 ml-auto">
        {layoutToggle && (
          <div className="flex border border-border">
            <button
              onClick={() => layoutToggle.onChange('grid')}
              className={`p-2 transition-colors ${
                layoutToggle.value === 'grid'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => layoutToggle.onChange('list')}
              className={`p-2 transition-colors ${
                layoutToggle.value === 'list'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        )}

        {addButton && (
          <TerminalButton
            variant="primary"
            size="sm"
            onClick={addButton.onClick}
          >
            <Plus size={14} strokeWidth={2.5} />
            {addButton.label}
          </TerminalButton>
        )}
      </div>
    </div>
  )
}

type FilterState = {
  query: string
  category: string
  status: string
  priority: string
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

interface ViewHeaderProps {
  title?: string
  count?: number
  subtitle?: string
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  count,
  subtitle,
  filters,
  actions,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {filters}
    </div>
  )
}
