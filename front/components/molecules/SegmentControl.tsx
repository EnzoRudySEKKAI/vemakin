import React from 'react'
import { LayoutGrid, List as ListIcon } from 'lucide-react'

export type SegmentOption = {
  value: string
  label?: string
  icon?: React.ComponentType<{ size?: number }>
}

interface SegmentControlProps {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  variant?: 'default' | 'icon-only' | 'fluid'
  className?: string
}

export const SegmentControl: React.FC<SegmentControlProps> = ({
  options,
  value,
  onChange,
  variant = 'default',
  className = ''
}) => {
  return (
    <div className={`cf-segment-container ${variant === 'fluid' ? 'flex-1' : ''} ${className}`}>
      {options.map((option) => {
        const Icon = option.icon
        const isActive = value === option.value
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              cf-segment-item
              ${isActive ? 'active' : ''}
              ${variant === 'icon-only' || (!option.label && Icon) ? 'icon-only' : ''}
            `}
            style={variant === 'default' && option.label ? { padding: '0 16px' } : undefined}
          >
            {Icon && <Icon size={variant === 'icon-only' ? 22 : 18} />}
            {option.label && <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

// Presets pour les layouts
export const LayoutToggle: React.FC<{
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
  className?: string
}> = ({ value, onChange, className }) => (
  <SegmentControl
    options={[
      { value: 'grid', icon: LayoutGrid },
      { value: 'list', icon: ListIcon }
    ]}
    value={value}
    onChange={(v) => onChange(v as 'grid' | 'list')}
    variant="icon-only"
    className={className}
  />
)
