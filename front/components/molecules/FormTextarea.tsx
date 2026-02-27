import React from 'react'
import { Textarea, TextareaProps } from '@/components/atoms/Textarea'

export interface FormTextareaProps extends Omit<TextareaProps, 'label'> {
  label: string
  hint?: string
  error?: string
  required?: boolean
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  hint,
  error,
  required = false,
  className = '',
  ...textareaProps
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
      
      <Textarea
        {...textareaProps}
        className={error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
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
