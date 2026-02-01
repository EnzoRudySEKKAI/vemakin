import React from 'react'
import { Input, InputProps } from '../atoms/Input'
import { Text } from '../atoms/Text'

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
      
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-2xl
          bg-white dark:bg-[#1C1C1E]
          border ${error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'}
          text-sm font-semibold text-gray-900 dark:text-white
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#3762E3]/20
          transition-all duration-200 resize-none
          ${className}
        `}
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
