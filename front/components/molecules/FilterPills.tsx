import React from 'react'
import { ScrollFade } from '@/components/ui/ScrollFade'

interface FilterPillsProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  scrollKey: string
  className?: string
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  value,
  onChange,
  scrollKey,
  className = ''
}) => {
  return (
    <ScrollFade className={`flex gap-2 py-0.5 w-full ${className}`} scrollKey={scrollKey}>
      {options.map(option => {
        const isActive = value === option
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${isActive 
                ? 'bg-primary text-white' 
                : 'bg-[#16181D] text-white/50 border border-white/[0.05] hover:border-white/[0.1] hover:text-white/70'
              }
            `}
          >
            {option}
          </button>
        )
      })}
    </ScrollFade>
  )
}

export default FilterPills
