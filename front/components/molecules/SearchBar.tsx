import React from 'react'
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

  return (
    <div className={`relative h-12 ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
        <Search size={18} strokeWidth={2} />
      </div>
      <input
        type="text"
        placeholder={placeholders[view] || placeholders.default}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-[#0D0D0F] border border-white/[0.05] rounded-xl pl-11 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/[0.1] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/50 transition-colors"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
      {showDatePicker && (
        <>
          <button
            onClick={onDatePickerToggle}
            title="Filter by date"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/50 transition-colors"
          >
            <Calendar size={16} strokeWidth={2} />
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

export default SearchBar
