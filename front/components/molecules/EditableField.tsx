import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Input, InputProps } from '../atoms/Input'
import { Textarea, TextareaProps } from '../atoms/Textarea'
import { Select, SelectOption } from '../atoms/Select'
import { DetailItem, DetailItemProps } from './DetailItem'
import { typography } from '@/design-system'

export type EditableFieldType = 'text' | 'textarea' | 'select'

export interface EditableFieldProps {
  label: string
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  type?: EditableFieldType
  options?: SelectOption[]
  placeholder?: string
  subValue?: React.ReactNode
  isLink?: boolean
  onClick?: () => void
  className?: string
  valueClassName?: string
  inputSize?: InputProps['size']
  textareaSize?: TextareaProps['size']
}

function formatLabel(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  subValue,
  isLink = false,
  onClick,
  className = '',
  valueClassName = '',
  inputSize = 'md',
  textareaSize = 'md'
}) => {
  const renderEditMode = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            size={textareaSize}
            fullWidth
            sentenceLabel
          />
        )
      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`
                w-full
                bg-transparent
                border border-border
                px-3 py-3
                text-sm font-bold tracking-tight
                text-foreground
                appearance-none
                cursor-pointer
                focus:outline-none
                focus:border-primary
                transition-all duration-200
              `}
            >
              <option value="" className="bg-card">
                {placeholder || `Select ${label.toLowerCase()}...`}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-card">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={16}
              strokeWidth={3}
            />
          </div>
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            size={inputSize}
            fullWidth
            sentenceLabel
          />
        )
    }
  }

  const renderDisplayMode = () => {
    const displayValue = value || placeholder || `No ${label.toLowerCase()} provided`

    const detailItemProps: DetailItemProps = {
      label,
      value: displayValue,
      subValue,
      isLink,
      onClick,
      className,
      valueClassName
    }

    return <DetailItem {...detailItemProps} />
  }

  return (
    <div className={className}>
      {isEditing ? (
        <div className="flex flex-col gap-1">
          <label
            className={`block mb-2 ${typography.size.xs} font-mono tracking-wider text-muted-foreground`}
          >
            {formatLabel(label)}
          </label>
          {renderEditMode()}
        </div>
      ) : (
        renderDisplayMode()
      )}
    </div>
  )
}
