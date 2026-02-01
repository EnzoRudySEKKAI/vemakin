import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { NotesFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'
import { Button } from '../../atoms/Button'

const NOTES_CATEGORIES = ['All', 'General', 'Shots', 'Script', 'Editing', 'Sound', 'VFX', 'Color']

interface NotesFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  onSort?: () => void
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
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Search Bar */}
      <SearchBar
        view="notes"
        value={searchQuery}
        onChange={onSearchChange}
      />

      {/* Filters Row */}
      <div className="h-[48px] flex items-center w-full gap-4">
        <div className="flex-1 min-w-0">
          <FilterPills
            options={NOTES_CATEGORIES}
            value={categoryFilter}
            onChange={onCategoryChange}
            scrollKey="notes"
          />
        </div>
      </div>

      {/* Secondary Row */}
      <div className="h-[48px] flex items-center gap-2 w-full">
        <div className="flex w-full gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowUpDown size={18} />}
            onClick={onSort}
            className="cf-control cf-btn-fluid cf-btn-center flex-1"
          >
            Last Modified
          </Button>

          <LayoutToggle
            value={layout}
            onChange={onLayoutChange}
          />
        </div>
      </div>
    </div>
  )
}
