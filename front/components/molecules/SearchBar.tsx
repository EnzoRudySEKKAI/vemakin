import React from 'react'
import { Search, Calendar, X } from 'lucide-react'
import { DatePicker } from '../ui/DatePicker'

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
  const handleDateSelect = (date: string | null) => {
    onDateSelect?.(date)
    // Scroll to element after selection
    if (date) {
      setTimeout(() => {
        const element = document.getElementById(date)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  return (
    <div className={`cf-input-wrapper h-[48px] ${className}`}>
      <Search className="cf-input-icon" size={18} />
      <input
        type="text"
        placeholder={placeholders[view] || placeholders.default}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cf-input text-sm shadow-none"
        style={{ paddingRight: showDatePicker ? 48 : 16 }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"
        >
          <X size={14} />
        </button>
      )}
      {showDatePicker && (
        <>
          <button
            className="cf-input-action-right"
            onClick={onDatePickerToggle}
            title="Filter by date"
          >
            <Calendar size={16} />
          </button>
          {isDatePickerOpen && onDateSelect && (
            <DatePicker
              isOpen={isDatePickerOpen}
              onClose={() => onDatePickerToggle?.()}
              selectedDate={activeDate}
              onSelectDate={handleDateSelect}
            />
          )}
        </>
      )}
    </div>
  )
}
