import React from 'react'
import { typography } from '../../design-system'

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize
  error?: string
  label?: string
  /** Number of rows (default: 4) */
  rows?: number
  fullWidth?: boolean
  /** If true, label is treated as a sentence (only first word capitalized) */
  sentenceLabel?: boolean
}

const sizeStyles: Record<TextareaSize, { minHeight: string; padding: string }> = {
  sm: { minHeight: '80px', padding: 'py-2' },
  md: { minHeight: '120px', padding: 'py-3' },
  lg: { minHeight: '180px', padding: 'py-4' },
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

export const Textarea: React.FC<TextareaProps> = ({
  size = 'md',
  error,
  label,
  rows = 4,
  fullWidth = true,
  className = '',
  id,
  sentenceLabel = false,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const sizeClasses = sizeStyles[size]

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`block mb-2 ${typography.size.xs} font-mono uppercase tracking-wider text-muted-foreground`}
        >
          {formatLabel(label, sentenceLabel)}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`
          w-full
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
          transition-all duration-200
          resize-none
        `}
        style={{
          minHeight: sizeClasses.minHeight,
        }}
        {...props}
      />
      {error && (
        <p className={`mt-1.5 ${typography.size.xs} ${typography.weight.semibold} text-red-500`}>
          {error}
        </p>
      )}
    </div>
  )
}
