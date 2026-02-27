import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}

export interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  optionGroups?: SelectOptionGroup[]
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options = [],
  optionGroups = [],
  placeholder = 'Select an option...',
  hint,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const hasGroups = optionGroups.length > 0
  const displayOptions = hasGroups ? optionGroups.flatMap(g => g.options) : options

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

      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full appearance-none
            bg-[#f5f5f5] dark:bg-[#16181D]
            border ${error ? 'border-destructive' : 'border-gray-300 dark:border-white/10'}
            px-3 py-3
            text-sm font-mono
            text-foreground
            placeholder:text-muted-foreground
            focus:outline-none
            ${error ? 'focus:border-destructive focus:ring-1 focus:ring-destructive/20' : 'focus:border-primary focus:ring-1 focus:ring-primary/20'}
            disabled:pointer-events-none disabled:opacity-50
            transition-all
            cursor-pointer
          `}
        >
          <option value="" disabled className="bg-white dark:bg-[#0F1116]">
            {placeholder}
          </option>
          
          {hasGroups ? (
            optionGroups.map(group => (
              <optgroup key={group.label} label={group.label} className="bg-white dark:bg-[#0F1116]">
                {group.options.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                    className="bg-white dark:bg-[#0F1116]"
                  >
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))
          ) : (
            options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="bg-white dark:bg-[#0F1116]"
              >
                {option.label}
              </option>
            ))
          )}
        </select>
        
        <ChevronDown 
          size={16} 
          strokeWidth={3}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" 
        />
      </div>

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
