import React from 'react'
import { typography } from '../../design-system'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize
  error?: string
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  /** If true, label is treated as a sentence (only first word capitalized) */
  sentenceLabel?: boolean
}

const sizeStyles: Record<InputSize, { height: string; padding: string }> = {
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

export const Input: React.FC<InputProps> = ({
  size = 'md',
  error,
  label,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  sentenceLabel = false,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const widthStyles = fullWidth ? 'w-full' : ''
  const sizeClasses = sizeStyles[size]

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block mb-2 ${typography.size.xs} font-mono  tracking-wider text-muted-foreground`}
        >
          {formatLabel(label, sentenceLabel)}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            ${widthStyles}
            ${sizeClasses.height}
            ${sizeClasses.padding}
            bg-[#f5f5f5] dark:bg-[#16181D]
            border border-gray-300 dark:border-white/10
            text-base font-mono
            text-foreground
            placeholder:text-muted-foreground
            focus:outline-none
            focus:border-primary
            focus:ring-1 focus:ring-primary/20
            disabled:pointer-events-none disabled:opacity-50
            ${leftIcon ? 'pl-10' : 'px-3'}
            ${rightIcon ? 'pr-10' : ''}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className={`mt-1.5 ${typography.size.xs} font-mono  tracking-wider text-destructive`}>
          {error}
        </p>
      )}
    </div>
  )
}
