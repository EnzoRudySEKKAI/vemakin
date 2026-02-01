import React from 'react'
import { Shot } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { SegmentControl, LayoutToggle } from '../../molecules/SegmentControl'
import { MetricsGroup } from '../../molecules/MetricBadge'

interface ShotsFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'pending' | 'done'
  onStatusChange: (status: 'all' | 'pending' | 'done') => void
  layout: 'timeline' | 'list'
  onLayoutChange: (layout: 'timeline' | 'list') => void
  projectProgress: number
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
  projectProgress,
  groupedShots,
  activeDate,
  isDatePickerOpen,
  onDatePickerToggle,
  onDateSelect,
  className = ''
}) => {
  const allShots = Object.values(groupedShots).flat()
  const doneCount = allShots.filter(s => s.status === 'done').length
  const totalCount = allShots.length

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Search Bar */}
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

      {/* Stats Widget */}
      <div className="w-full bg-white dark:bg-[#1C1C1E]/50 backdrop-blur-md rounded-[16px] px-4 flex items-center gap-4 border border-gray-200 dark:border-white/5 shadow-sm h-[48px]">
        {/* Progress Bar Section */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-gray-500">Progress</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
              {Math.round(projectProgress)}%
            </span>
          </div>
          <div className="relative flex-1 h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-indigo-500 dark:to-purple-500"
              style={{ width: `${projectProgress}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />

        {/* Stats */}
        <MetricsGroup
          metrics={[
            { label: 'shots', value: totalCount },
            { label: 'done', value: doneCount },
            { label: 'remain', value: totalCount - doneCount }
          ]}
          className="shrink-0"
        />
      </div>

      {/* Filters Row */}
      <div className="h-[48px] flex items-center w-full gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 w-full">
            <div className="flex-1 cf-segment-container">
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
    </div>
  )
}
