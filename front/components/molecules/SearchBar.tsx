import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, Calendar, X } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'

export type SearchView = 'shots' | 'inventory' | 'postprod' | 'notes' | 'default'

interface SearchBarProps {
  view: SearchView
  value: string
  onChange: (value: string) => void
  showDatePicker?: boolean
  isDatePickerOpen?: boolean
  onDatePickerToggle?: () => void
  activeDate?: string
  onDateSelect?: (date: string | null) => void
  className?: string
}

const placeholders: Record<SearchView, string> = {
  shots: 'Search scenes, locations...',
  inventory: 'Search gear, specs, categories...',
  postprod: 'Search pipeline tasks...',
  notes: 'Search notes, ideas, feedback...',
  default: 'Search...'
}

export const SearchBar: React.FC<SearchBarProps> = ({
  view,
  value,
  onChange,
  showDatePicker = false,
  isDatePickerOpen = false,
  onDatePickerToggle,
  activeDate,
  onDateSelect,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDateSelect = (date: string | null) => {
    onDateSelect?.(date)
    if (date) {
      setTimeout(() => {
        const element = document.getElementById(date)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // Portal-based overlay that blocks all clicks underneath
  const Overlay = isDatePickerOpen ? (
    createPortal(
      <div 
        className="fixed inset-0 z-[9998]"
        style={{ 
          backgroundColor: 'transparent',
          cursor: 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDatePickerToggle?.()
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      />,
      document.body
    )
  ) : null

  return (
    <div ref={containerRef} className={`relative h-12 ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30">
        <Search size={18} strokeWidth={2} />
      </div>
      <input
        type="text"
        placeholder={placeholders[view] || placeholders.default}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/[0.05] pl-11 pr-12 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary dark:focus:border-white/[0.1] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="cursor-pointer absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
      {showDatePicker && (
        <>
          <button
            onClick={onDatePickerToggle}
            title="Filter by date"
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors"
          >
            <Calendar size={16} strokeWidth={2} />
          </button>
          {isDatePickerOpen && onDateSelect && (
            <>
              {Overlay}
              <DatePicker
                isOpen={isDatePickerOpen}
                onClose={() => onDatePickerToggle?.()}
                selectedDate={activeDate}
                onSelectDate={handleDateSelect}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default SearchBar
