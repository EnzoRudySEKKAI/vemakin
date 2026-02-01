import React from 'react'
import { motion } from 'framer-motion'

interface FilterPillProps {
  label: string
  isActive?: boolean
  onClick: () => void
  count?: number
  className?: string
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  isActive = false,
  onClick,
  count,
  className = ''
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        h-12 px-5 rounded-2xl font-bold text-sm whitespace-nowrap
        transition-all duration-200
        border shadow-sm
        ${isActive 
          ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white border-[#3762E3] dark:border-[#4E47DD]' 
          : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
        }
        ${className}
      `}
    >
      <span className="flex items-center gap-2">
        {label}
        {count !== undefined && (
          <span className={`
            px-1.5 py-0.5 rounded-md text-xs font-bold
            ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}
          `}>
            {count}
          </span>
        )}
      </span>
    </motion.button>
  )
}

interface FilterBarProps {
  filters: Array<{
    key: string
    label: string
    count?: number
  }>
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeKey,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {filters.map((filter) => (
        <FilterPill
          key={filter.key}
          label={filter.label}
          isActive={activeKey === filter.key}
          onClick={() => onChange(filter.key)}
          count={filter.count}
        />
      ))}
    </div>
  )
}
