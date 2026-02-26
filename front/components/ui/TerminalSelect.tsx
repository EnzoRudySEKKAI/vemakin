import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface TerminalSelectOption {
  value: number | string
  label: string
}

interface TerminalSelectProps {
  value: number | string
  options: TerminalSelectOption[]
  onChange: (value: number | string) => void
  className?: string
}

export const TerminalSelect: React.FC<TerminalSelectProps> = ({
  value,
  options,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(opt => opt.value === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  const handleSelect = (optionValue: number | string) => {
    onChange(optionValue)
    setIsOpen(false)
  }
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          cursor-pointer w-full h-9 px-3 py-1
          flex items-center justify-between gap-2
          bg-transparent
          border border-gray-300 dark:border-white/20
          font-mono text-sm
          focus:outline-none focus:border-primary
          transition-colors
          ${isOpen ? 'border-primary' : ''}
        `}
      >
        <span className="flex items-center gap-2">
          <span className="text-primary">
            {isOpen ? '>' : ''}
          </span>
          <span>{selectedOption?.label || value}</span>
        </span>
        <ChevronDown 
          size={14} 
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div 
          className="
            absolute z-50 w-full mt-1
            bg-background
            border border-gray-300 dark:border-white/20
            shadow-lg
          "
          style={{ maxHeight: '200px', overflowY: 'auto' }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                cursor-pointer w-full px-3 py-2
                flex items-center gap-2
                font-mono text-sm text-left
                hover:bg-gray-100 dark:hover:bg-white/5
                border-b border-gray-200 dark:border-white/10 last:border-b-0
                ${option.value === value ? 'bg-gray-100 dark:bg-white/5' : ''}
              `}
            >
              <span className="text-primary w-3">
                {option.value === value ? '>' : ''}
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
