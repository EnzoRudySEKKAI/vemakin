import React from 'react'
import { Search, Calendar, X } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input, Button } from '@/components/atoms'

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
      <Input
        type="text"
        placeholder={placeholders[view] || placeholders.default}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        leftIcon={<Search size={18} strokeWidth={2.5} className="text-gray-400" />}
        className="text-sm shadow-none"
        style={{ paddingRight: showDatePicker ? 48 : 16 }}
      />
      {value && (
        <Button
          onClick={() => onChange('')}
          variant="ghost"
          size="sm"
          className="absolute right-12 top-1/2 -translate-y-1/2 p-1"
        >
          <X size={14} strokeWidth={2.5} />
        </Button>
      )}
      {showDatePicker && (
        <>
          <Button
            className="cf-input-action-right"
            onClick={onDatePickerToggle}
            title="Filter by date"
            variant="ghost"
            size="sm"
          >
            <Calendar size={16} strokeWidth={2.5} />
          </Button>
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
