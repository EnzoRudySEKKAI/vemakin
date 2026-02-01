import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowUpDown } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

interface FilterDropdownProps {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
  activeColor?: boolean
  showDirectionToggle?: boolean
  direction?: 'asc' | 'desc'
  onDirectionChange?: () => void
  className?: string
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  activeColor = true,
  showDirectionToggle = false,
  direction = 'asc',
  onDirectionChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === value)
  const isActive = activeColor && value && value !== 'All'

  return (
    <div className={`flex-1 relative min-w-0 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cf-control cf-btn-fluid ${isOpen ? 'active' : ''}`}
      >
        <span className={`truncate ${isActive ? 'text-[#3762E3] dark:text-[#4E47DD]' : 'text-gray-500 dark:text-gray-300'}`}>
          {selectedOption?.label || label}
        </span>
        <ChevronDown 
          size={18} 
          className={`shrink-0 transition-transform duration-100 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
            >
              {options.map((option) => {
                const Icon = option.icon
                const isSelected = value === option.value
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (showDirectionToggle && isSelected && onDirectionChange) {
                        onDirectionChange()
                      } else {
                        onChange(option.value)
                      }
                      setIsOpen(false)
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-colors
                      flex items-center justify-between
                      ${isSelected 
                        ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {Icon && <Icon size={14} />}
                      {option.label}
                    </span>
                    {showDirectionToggle && isSelected && (
                      <ArrowUpDown 
                        size={14} 
                        className={direction === 'desc' ? 'rotate-180' : ''} 
                      />
                    )}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
