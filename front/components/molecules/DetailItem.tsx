import React from 'react'
import { Text } from '@/components/atoms/Text'
import { ExternalLink } from 'lucide-react'

export interface DetailItemProps {
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
  onClick?: () => void
  isLink?: boolean
  className?: string
  valueClassName?: string
}

export const DetailItem: React.FC<DetailItemProps> = ({
  label,
  value,
  subValue,
  onClick,
  isLink = false,
  className = '',
  valueClassName = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <Text 
        variant="body" 
        color="muted" 
        className="mb-1 block font-medium"
        sentence
      >
        {label}
      </Text>
      
      <div 
        className={`flex flex-col group ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <Text 
          variant="body" 
          color="primary" 
          className={`leading-tight ${valueClassName}`}
          noFormat
        >
          {value}
        </Text>
        
        {subValue && (
          <div className="mt-1 flex items-center gap-1.5">
            <Text 
              variant="caption" 
              color={isLink ? 'accent' : 'muted'}
              className={`${isLink ? 'opacity-60 hover:opacity-100 transition-opacity font-medium' : 'font-medium'}`}
            >
              {subValue}
            </Text>
            {isLink && <ExternalLink size={10} strokeWidth={3} className="text-primary opacity-60" />}
          </div>
        )}
      </div>
    </div>
  )
}
