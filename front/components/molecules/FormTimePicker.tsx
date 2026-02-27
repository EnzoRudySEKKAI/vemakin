import React from 'react'
import { Clock } from 'lucide-react'
import { TimeSelector, TimeSelectorProps } from '@/components/ui/TimeSelector'

export interface FormTimePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  minTime?: string
  maxTime?: string
  className?: string
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const FormTimePicker: React.FC<FormTimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select time...',
  hint,
  error,
  required = false,
  disabled = false,
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
      
      <TimeSelector
        label=""
        value={value}
        onChange={onChange}
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
