import React from 'react'
import { Calendar } from 'lucide-react'
import { DatePickerInput } from '@/components/ui/DatePickerInput'

export interface FormDatePickerProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minDate?: string
  maxDate?: string
  className?: string
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  hint,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {formatLabel(label)}
        </label>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-red-500">
            *
          </span>
        )}
      </div>
      
      <DatePickerInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftIcon={<Calendar size={16} className="text-muted-foreground" />}
        fullWidth
        disabled={disabled}
      />
      
      {error ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
