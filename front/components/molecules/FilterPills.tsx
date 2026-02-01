import React from 'react'
import { ScrollFade } from '../ui/ScrollFade'

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
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`
            cf-control cf-pill
            ${value === option ? 'active' : 'inactive'}
          `}
        >
          {option}
        </button>
      ))}
    </ScrollFade>
  )
}
