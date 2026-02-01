import React, { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { PostProdTask, PostProdFilters } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'
import { FilterDropdown } from '../../molecules/FilterDropdown'
import { MetricsGroup } from '../../molecules/MetricBadge'

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

const sortOptions = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'created', label: 'Created' },
  { value: 'alpha', label: 'Name' }
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
  const [showMobileCategoryDropdown, setShowMobileCategoryDropdown] = useState(false)
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false)

  const doneCount = tasks.filter(t => t.status === 'done').length

  const handleSortChange = (sortBy: string) => {
    if (filters.sortBy === sortBy) {
      onFiltersChange({
        sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
      })
    } else {
      onFiltersChange({
        sortBy: sortBy as any,
        sortDirection: 'asc'
      })
    }
  }

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === filters.sortBy)
    return option?.label || 'Sort'
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Search Bar */}
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

      {/* Filters Row */}
      <div className="h-[48px] flex items-center w-full gap-4">
        <div className="flex-1 min-w-0">
          {/* Mobile Dropdowns */}
          <div className="flex md:hidden w-full gap-2 relative z-[70] mb-0.5">
            <FilterDropdown
              label="All categories"
              value={filters.category || 'All'}
              options={POST_PROD_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              onChange={(cat) => onFiltersChange({ category: cat })}
              className="flex-1"
            />
            <FilterDropdown
              label={`Sort: ${getSortLabel()}`}
              value={filters.sortBy || 'status'}
              options={sortOptions}
              onChange={handleSortChange}
              showDirectionToggle
              direction={filters.sortDirection}
              className="flex-1"
            />
          </div>

          {/* Desktop Pills */}
          <div className="hidden md:flex items-center gap-4 w-full justify-between">
            <div className="flex gap-2">
              <FilterPills
                options={POST_PROD_CATEGORIES}
                value={filters.category || 'All'}
                onChange={(cat) => onFiltersChange({ category: cat })}
                scrollKey="postprod"
              />
            </div>

            {/* Metrics */}
            <MetricsGroup
              metrics={[
                { label: 'Total', value: tasks.length },
                { label: 'Done', value: doneCount },
                { label: 'Remain', value: tasks.length - doneCount }
              ]}
              className="hidden sm:flex shrink-0 px-2 h-10"
            />
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="h-[48px] flex items-center gap-2 w-full relative">
        {/* Status Selector */}
        <FilterDropdown
          label="All status"
          value={filters.status || 'All'}
          options={statusOptions}
          onChange={(status) => onFiltersChange({ status })}
          className="flex-1"
        />

        {/* Priority Selector */}
        <FilterDropdown
          label="All priority"
          value={filters.priority || 'All'}
          options={priorityOptions}
          onChange={(priority) => onFiltersChange({ priority })}
          className="flex-1"
        />

        {/* Desktop Sort Dropdown */}
        <div className="hidden md:block flex-1 relative min-w-0">
          <FilterDropdown
            label={`Sort: ${getSortLabel()}`}
            value={filters.sortBy || 'status'}
            options={sortOptions.map(opt => ({ ...opt, icon: filters.sortBy === opt.value ? ArrowUpDown : undefined }))}
            onChange={handleSortChange}
            showDirectionToggle
            direction={filters.sortDirection}
          />
        </div>

        {/* Layout Toggle */}
        <LayoutToggle
          value={layout}
          onChange={onLayoutChange}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
