import React from 'react'
import { Input, InputProps } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'

interface FormFieldProps extends InputProps {
  label: string
  hint?: string
  required?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  error,
  required = false,
  ...inputProps
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono border border-red-500/50 bg-red-500/10 text-red-500">
            *
          </span>
        )}
      </div>
      
      <Input
        error={error}
        {...inputProps}
      />
      
      {hint && !error && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
  required?: boolean
  rows?: number
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  hint,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono border border-red-500/50 bg-red-500/10 text-red-500">
            *
          </span>
        )}
      </div>
      
      <Textarea
        rows={rows}
        className={className}
        {...props}
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
