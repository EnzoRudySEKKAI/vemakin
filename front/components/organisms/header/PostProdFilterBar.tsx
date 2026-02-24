import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { PostProdTask, PostProdFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'
import { FilterDropdown } from '../../molecules/FilterDropdown'

const POST_PROD_CATEGORIES = ['All', 'Script', 'Editing', 'Sound', 'VFX', 'Color']

const statusOptions = [
  { value: 'All', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'progress', label: 'Progress' },
  { value: 'review', label: 'In review' },
  { value: 'done', label: 'Done' }
]

const priorityOptions = [
  { value: 'All', label: 'All' },
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
  dateFilter: string | null
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
  dateFilter,
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
        activeDate={dateFilter}
        onDateSelect={onDateSelect}
      />

      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-1 px-1">
            Category
          </div>
          <FilterDropdown
            label="All"
            value={filters.category || 'All'}
            onChange={(cat) => onFiltersChange({ category: cat })}
            options={POST_PROD_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            maxHeight="280px"
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 overflow-x-auto">
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
            <div className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-1 px-1">
              Status
            </div>
            <FilterDropdown
              label="All"
              value={filters.status || 'All'}
              options={statusOptions}
              onChange={(status) => onFiltersChange({ status })}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <div className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-1 px-1">
              Priority
            </div>
            <FilterDropdown
              label="All"
              value={filters.priority || 'All'}
              options={priorityOptions}
              onChange={(priority) => onFiltersChange({ priority })}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-1 px-1">
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
