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
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl ${variant === 'fluid' ? 'flex-1' : ''} ${className}`}>
      {options.map((option) => {
        const Icon = option.icon
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex items-center justify-center gap-2 px-2.5 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70 hover:bg-white dark:hover:bg-white/5'
              }
              ${variant === 'icon-only' || (!option.label && Icon) ? 'w-10 px-0' : 'flex-1'}
            `}
          >
            {Icon && <Icon size={18} strokeWidth={2} />}
            {option.label && <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

// Layout Toggle Preset
export const LayoutToggle: React.FC<{
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
  className?: string
}> = ({ value, onChange, className }) => (
  <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl ${className}`}>
    <button
      onClick={() => onChange('grid')}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${value === 'grid'
          ? 'bg-primary text-white'
          : 'text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70 hover:bg-white dark:hover:bg-white/5'
        }`}
    >
      <LayoutGrid size={18} strokeWidth={2} />
    </button>
    <button
      onClick={() => onChange('list')}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${value === 'list'
          ? 'bg-primary text-white'
          : 'text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70 hover:bg-white dark:hover:bg-white/5'
        }`}
    >
      <ListIcon size={18} strokeWidth={2} />
    </button>
  </div>
)

export default SegmentControl
