import React from 'react'
import { SearchBar } from '../../molecules/SearchBar'
import { SegmentControl } from '../../molecules/SegmentControl'
import { FilterDropdown } from '../../molecules/FilterDropdown'

interface ShotsFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'pending' | 'done'
  onStatusChange: (status: 'all' | 'pending' | 'done') => void
  layout: 'timeline' | 'list'
  onLayoutChange: (layout: 'timeline' | 'list') => void
  activeDate: string
  isDatePickerOpen: boolean
  onDatePickerToggle: () => void
  onDateSelect: (date: string | null) => void
  className?: string
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'To do' },
  { value: 'done', label: 'Done' }
]

export const ShotsFilterBar: React.FC<ShotsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  layout,
  onLayoutChange,
  activeDate,
  isDatePickerOpen,
  onDatePickerToggle,
  onDateSelect,
  className = ''
}) => {

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchBar
        view="shots"
        value={searchQuery}
        onChange={onSearchChange}
        showDatePicker
        isDatePickerOpen={isDatePickerOpen}
        onDatePickerToggle={onDatePickerToggle}
        activeDate={activeDate}
        onDateSelect={onDateSelect}
      />

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-4">
            Status
          </div>
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(v) => onStatusChange(v as 'all' | 'pending' | 'done')}
            options={statusOptions}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-4">
            View
          </div>
          <SegmentControl
            options={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'list', label: 'List' }
            ]}
            value={layout}
            onChange={(v) => onLayoutChange(v as any)}
            variant="fluid"
          />
        </div>
      </div>
    </div>
  )
}

export default ShotsFilterBar
