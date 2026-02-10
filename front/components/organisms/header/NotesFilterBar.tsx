import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { NotesFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'

const NOTES_CATEGORIES = ['All', 'General', 'Shots', 'Script', 'Editing', 'Sound', 'VFX', 'Color']

interface NotesFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  onSort?: () => void
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
  onSort,
  filters,
  className = ''
}) => {
  const getSortLabel = () => {
    switch (filters?.sortBy) {
      case 'created': return 'Date Created'
      case 'alpha': return 'Alphabetical'
      default: return 'Last Modified'
    }
  }
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchBar
        view="notes"
        value={searchQuery}
        onChange={onSearchChange}
      />

      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="flex-1 min-w-0">
          <FilterPills
            options={NOTES_CATEGORIES}
            value={categoryFilter}
            onChange={onCategoryChange}
            scrollKey="notes"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSort}
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium bg-[#0D0D0F] border border-white/[0.05] text-white/50 hover:text-white/70 transition-colors"
        >
          <span>{getSortLabel()}</span>
          <ArrowUpDown
            size={16}
            strokeWidth={2}
            className={`transition-transform ${filters?.sortDirection === 'asc' ? 'rotate-180' : ''}`}
          />
        </button>

        <LayoutToggle
          value={layout}
          onChange={onLayoutChange}
        />
      </div>
    </div>
  )
}

export default NotesFilterBar
