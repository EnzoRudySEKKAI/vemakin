import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
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

  const { totalShots, completedShots, completionPercentage } = useMemo(() => {
    const allShots = Object.values(groupedShots).flat()
    const total = allShots.length
    const completed = allShots.filter(s => s.status === 'done').length
    return {
      totalShots: total,
      completedShots: completed,
      completionPercentage: total > 0 ? (completed / total) * 100 : 0
    }
  }, [groupedShots])

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

      <div className="flex flex-col gap-1.5 h-[42px] justify-center">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider font-medium text-gray-500 dark:text-white/40">
          <span>Progress</span>
          <span>{completedShots}/{totalShots} Finished</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
          />
        </div>
      </div>

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
