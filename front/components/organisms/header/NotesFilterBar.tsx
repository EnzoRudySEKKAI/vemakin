import React from 'react'
import { NotesFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterDropdown } from '../../molecules/FilterDropdown'

const NOTES_CATEGORIES = ['All', 'General', 'Shots', 'Script', 'Editing', 'Sound', 'VFX', 'Color']

const sortOptions = [
  { value: 'updated', label: 'Modified' },
  { value: 'created', label: 'Creation' },
  { value: 'alpha', label: 'Alphabetical' }
]

interface NotesFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  onSortChange?: (sortBy: 'updated' | 'created' | 'alpha') => void
  filters?: NotesFilters
  className?: string
}

export const NotesFilterBar: React.FC<NotesFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  layout,
  onLayoutChange,
  onSortChange,
  filters,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchBar
        view="notes"
        value={searchQuery}
        onChange={onSearchChange}
      />

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-4">
            Sort By
          </div>
          <FilterDropdown
            label="Sort"
            value={filters?.sortBy || 'updated'}
            onChange={(v) => onSortChange?.(v as 'updated' | 'created' | 'alpha')}
            options={sortOptions}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-4">
            Category
          </div>
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            options={NOTES_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            maxHeight="280px"
          />
        </div>

        <div>
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-4">
            View
          </div>
          <LayoutToggle
            value={layout}
            onChange={onLayoutChange}
          />
        </div>
      </div>
    </div>
  )
}

export default NotesFilterBar
