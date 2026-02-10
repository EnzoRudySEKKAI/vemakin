import React from 'react'
import { Shot } from '../../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { SegmentControl } from '../../molecules/SegmentControl'

interface ShotsFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'pending' | 'done'
  onStatusChange: (status: 'all' | 'pending' | 'done') => void
  layout: 'timeline' | 'list'
  onLayoutChange: (layout: 'timeline' | 'list') => void
  groupedShots: Record<string, Shot[]>
  activeDate: string
  isDatePickerOpen: boolean
  onDatePickerToggle: () => void
  onDateSelect: (date: string | null) => void
  className?: string
}

export const ShotsFilterBar: React.FC<ShotsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  layout,
  onLayoutChange,
  groupedShots,
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

      <div className="flex items-center gap-3">
        <div className="w-2/3 md:flex-1 flex items-center gap-2 min-w-0">
          <SegmentControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'To do' },
              { value: 'done', label: 'Done' }
            ]}
            value={statusFilter}
            onChange={(v) => onStatusChange(v as any)}
            variant="fluid"
          />
        </div>


        <div className="flex-1 md:flex-initial">
          <SegmentControl
            options={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'list', label: 'List' }
            ]}
            value={layout}
            onChange={(v) => onLayoutChange(v as any)}
          />
        </div>
      </div>
    </div>
  )
}

export default ShotsFilterBar
