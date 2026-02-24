import React, { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { DatePicker } from './DatePicker'

export interface DatePickerInputProps {
  value?: string | null
  onChange?: (date: string | null) => void
  label?: string
  placeholder?: string
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'YYYY-MM-DD',
  fullWidth = false,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Format date for display (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDisplayDate = (isoDate: string | null | undefined): string => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    if (!year || !month || !day) return isoDate
    return `${day}/${month}/${year}`
  }

  const handleSelectDate = (date: string | null) => {
    onChange?.(date)
    setIsOpen(false)
  }

  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div 
      ref={containerRef}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-xs font-mono tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="text"
          readOnly
          value={formatDisplayDate(value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onClick={() => !disabled && setIsOpen(true)}
          className={`
            w-full h-12 py-3 px-3
            bg-[#f5f5f5] dark:bg-[#16181D]
            border border-gray-300 dark:border-white/10
            text-base font-mono
            text-foreground
            placeholder:text-muted-foreground
            focus:outline-none
            focus:border-primary
            focus:ring-1 focus:ring-primary/20
            disabled:pointer-events-none disabled:opacity-50
            cursor-pointer
          `}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Calendar size={18} strokeWidth={2} />
        </button>

        <DatePicker
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedDate={value}
          onSelectDate={handleSelectDate}
        />
      </div>
    </div>
  )
}
