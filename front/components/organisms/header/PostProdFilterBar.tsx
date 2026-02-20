import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { PostProdTask, PostProdFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'
import { FilterDropdown } from '../../molecules/FilterDropdown'

const POST_PROD_CATEGORIES = ['All', 'Script', 'Editing', 'Sound', 'VFX', 'Color']

const statusOptions = [
  { value: 'All', label: 'All status' },
  { value: 'todo', label: 'To do' },
  { value: 'progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'done', label: 'Done' }
]

const priorityOptions = [
  { value: 'All', label: 'All priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

interface PostProdFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: PostProdFilters
  onFiltersChange: (filters: Partial<PostProdFilters>) => void
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  tasks: PostProdTask[]
  activeDate: string
  isDatePickerOpen: boolean
  onDatePickerToggle: () => void
  onDateSelect: (date: string | null) => void
  className?: string
}

export const PostProdFilterBar: React.FC<PostProdFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  layout,
  onLayoutChange,
  tasks,
  activeDate,
  isDatePickerOpen,
  onDatePickerToggle,
  onDateSelect,
  className = ''
}) => {

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchBar
        view="postprod"
        value={searchQuery}
        onChange={onSearchChange}
        showDatePicker
        isDatePickerOpen={isDatePickerOpen}
        onDatePickerToggle={onDatePickerToggle}
        activeDate={activeDate}
        onDateSelect={onDateSelect}
      />

      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="flex-1 min-w-0">
          <FilterPills
            options={POST_PROD_CATEGORIES}
            value={filters.category || 'All'}
            onChange={(cat) => onFiltersChange({ category: cat })}
            scrollKey="postprod"
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1 flex items-start gap-2 min-w-0">
          <div className="flex-1">
            <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-3">
              Status
            </div>
            <FilterDropdown
              label="All status"
              value={filters.status || 'All'}
              options={statusOptions}
              onChange={(status) => onFiltersChange({ status })}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-3">
              Priority
            </div>
            <FilterDropdown
              label="All priority"
              value={filters.priority || 'All'}
              options={priorityOptions}
              onChange={(priority) => onFiltersChange({ priority })}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-3">
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

export default PostProdFilterBar
