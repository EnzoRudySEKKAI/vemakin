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
          className={`block mb-2 ${typography.size.xs} ${typography.weight.semibold} text-gray-500 dark:text-gray-400`}
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
          bg-transparent
          border-0 border-b-2 border-gray-200 dark:border-white/10
          text-lg font-semibold
          text-gray-900 dark:text-white
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none
          focus:border-primary dark:focus:border-primary
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
          resize-none
        `}
        style={{
          minHeight: sizeClasses.minHeight,
          WebkitTapHighlightColor: 'transparent',
          caretColor: 'currentColor'
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
