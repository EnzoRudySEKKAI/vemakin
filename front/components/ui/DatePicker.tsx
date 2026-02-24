import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/components/atoms'

interface DatePickerProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: string | null
  onSelectDate: (date: string | null) => void
}

export const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate
}) => {
  // Parse initial date or default to today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date()
  // Handle invalid date strings
  const safeDate = isNaN(initialDate.getTime()) ? new Date() : initialDate

  const [viewDate, setViewDate] = useState(safeDate)

  const daysOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

  // Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const formatDate = (year: number, month: number, day: number) => {
    // Return ISO format: YYYY-MM-DD
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))
  }

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))
  }

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (year: number, month: number, day: number) => {
    if (!selectedDate) return false
    const clickedDate = formatDate(year, month, day)
    return clickedDate === selectedDate
  }

  // Generate Calendar Grid
  const renderCalendarDays = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const selected = isSelected(year, month, d)
      const today = isToday(year, month, d)

      days.push(
        <button
          key={d}
          onClick={() => {
            onSelectDate(formatDate(year, month, d))
            onClose()
          }}
          className={`
            w-8 h-8 flex items-center justify-center
            font-mono text-sm tracking-wider
            transition-colors duration-150
            ${selected
              ? 'border border-primary text-primary bg-primary/5 dark:bg-primary/10'
              : 'border border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
            }
            ${today && !selected ? 'text-primary font-bold' : ''}
          `}
        >
          {today && !selected ? (
            <span className="text-primary">[{d.toString().padStart(2, '0')}]</span>
          ) : (
            d.toString().padStart(2, '0')
          )}
        </button>
      )
    }
    return days
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full right-0 mt-2 z-[9999]
              w-[320px]
              bg-white dark:bg-[#16181D]
              border border-gray-300 dark:border-white/10
              shadow-lg
              overflow-hidden
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-white/10">
              <Text 
                variant="body" 
                className="font-mono text-xs tracking-widest text-gray-900 dark:text-white uppercase"
              >
                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <div className="flex gap-0">
                <button
                  onClick={handlePrevYear}
                  className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-mono text-xs"
                  title="Previous year"
                >
                  {'<<'}
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="w-7 h-7 flex items-center justify-center border-l-0 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-7 h-7 flex items-center justify-center border-l-0 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  title="Next month"
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={handleNextYear}
                  className="w-7 h-7 flex items-center justify-center border-l-0 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-mono text-xs"
                  title="Next year"
                >
                  {'>>'}
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 px-2 pt-3 pb-2">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className="w-8 h-6 flex items-center justify-center font-mono text-[10px] tracking-widest text-gray-500 dark:text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 px-2 pb-3 justify-items-center">
              {renderCalendarDays()}
            </div>

            {/* Selected Date Footer */}
            <div className="px-4 py-3 border-t border-gray-300 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#0F1116]">
              <Text 
                variant="caption" 
                className="font-mono text-xs tracking-wider text-gray-500 dark:text-gray-500"
              >
                {selectedDate ? (
                  <>
                    SELECTED: <span className="text-gray-900 dark:text-white">{selectedDate}</span>
                  </>
                ) : (
                  'NO DATE SELECTED'
                )}
              </Text>

              <button
                onClick={() => {
                  onSelectDate(null)
                  onClose()
                }}
                className="font-mono text-xs tracking-wider text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                [CLEAR]
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
