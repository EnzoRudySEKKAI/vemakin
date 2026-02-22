import React, { useState, useRef, useEffect } from 'react'
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
  maxHeight?: string
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
  className = '',
  maxHeight
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(opt => opt.value === value)
  const isActive = activeColor && value && value !== 'All'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 text-xs font-mono tracking-wider transition-all
          bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/[0.05]
          ${isOpen ? 'border-primary dark:border-white/[0.1]' : ''}
          ${isActive ? 'text-primary dark:text-white' : 'text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'}
        `}
      >
        <span>{selectedOption?.label || label}</span>
        <ChevronDown 
          size={16} 
          strokeWidth={2}
          className={`transition-transform duration-100 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 bg-[#fafafa] dark:bg-[#16181D] border border-gray-300 dark:border-white/[0.08] p-1.5 z-[70] overflow-hidden ${maxHeight ? 'overflow-y-auto' : ''}`}
            style={maxHeight ? { maxHeight } : undefined}
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
                      w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono tracking-wider transition-all
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {Icon && <Icon size={14} strokeWidth={2} />}
                      {option.label}
                    </span>
                    {showDirectionToggle && isSelected && (
                      <ArrowUpDown 
                        size={14} 
                        strokeWidth={2}
                        className={direction === 'desc' ? 'rotate-180' : ''} 
                      />
                    )}
                  </button>
                )
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterDropdown
