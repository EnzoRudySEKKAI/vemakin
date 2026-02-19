import React from 'react'
import { Input, InputProps } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { Text } from '@/components/atoms/Text'
import { radius, typography } from '@/design-system'

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
      <div className="flex items-center gap-1">
        <Text variant="label" color="muted">
          {label}
        </Text>
        {required && (
          <span className="text-red-500">*</span>
        )}
      </div>
      
      <Input
        error={error}
        {...inputProps}
      />
      
      {hint && !error && (
        <Text variant="caption" color="muted">
          {hint}
        </Text>
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
      <div className="flex items-center gap-1">
        <Text variant="label" color="muted">
          {label}
        </Text>
        {required && (
          <span className="text-red-500">*</span>
        )}
      </div>
      
      <Textarea
        rows={rows}
        className={className}
        {...props}
      />
      
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="muted">
          {hint}
        </Text>
      ) : null}
    </div>
  )
}
