import React from 'react'
import { ChevronDown } from 'lucide-react'
import { typography } from '../../design-system'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize
  error?: string
  label?: string
  options: SelectOption[]
  fullWidth?: boolean
  /** If true, label is treated as a sentence (only first word capitalized) */
  sentenceLabel?: boolean
  /** Placeholder option shown when no value selected */
  placeholder?: string
}

const sizeStyles: Record<SelectSize, { height: string; padding: string }> = {
  sm: { height: 'h-10', padding: 'py-2' },
  md: { height: 'h-12', padding: 'py-3' },
  lg: { height: 'h-14', padding: 'py-4' },
}

/**
 * Format label text
 * - If sentenceLabel is true: Only first word capitalized
 * - Otherwise: All words capitalized (Pascal Case)
 */
function formatLabel(text: string, isSentence: boolean): string {
  if (isSentence) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const Select: React.FC<SelectProps> = ({
  size = 'md',
  error,
  label,
  options,
  fullWidth = true,
  className = '',
  id,
  sentenceLabel = false,
  placeholder,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const sizeClasses = sizeStyles[size]

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block mb-2 ${typography.size.xs} ${typography.weight.semibold} text-gray-500 dark:text-gray-400`}
        >
          {formatLabel(label, sentenceLabel)}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full
            ${sizeClasses.height}
            ${sizeClasses.padding}
            bg-transparent
            border-0 border-b-2 border-gray-200 dark:border-white/10
            text-lg font-semibold
            text-gray-900 dark:text-white
            appearance-none
            focus:outline-none
            focus:border-blue-500 dark:focus:border-indigo-400
            focus:bg-transparent
            focus-visible:bg-transparent
            focus-visible:outline-none
            focus-visible:ring-0
            active:bg-transparent
            -webkit-tap-highlight-color: transparent
            tap-highlight-color: transparent
            autofill:bg-transparent
            autofill:text-inherit
            transition-all duration-200
            cursor-pointer
          `}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
          <ChevronDown size={20} strokeWidth={2.5} />
        </div>
      </div>
      {error && (
        <p className={`mt-1.5 ${typography.size.xs} ${typography.weight.semibold} text-red-500`}>
          {error}
        </p>
      )}
    </div>
  )
}
