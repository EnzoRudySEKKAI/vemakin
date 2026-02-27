import React from 'react'
import { TerminalCard } from '@/components/ui/TerminalCard'

export interface FormSectionProps {
  children: React.ReactNode
  title?: string
  headerRight?: React.ReactNode
  className?: string
  noPadding?: boolean
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  headerRight,
  className = '',
  noPadding = false
}) => {
  if (!title) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <TerminalCard 
      header={title} 
      headerRight={headerRight}
      className={className}
    >
      <div className={noPadding ? '' : 'p-2'}>
        {children}
      </div>
    </TerminalCard>
  )
}
