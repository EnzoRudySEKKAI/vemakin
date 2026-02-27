import React from 'react'
import { LucideIcon } from 'lucide-react'
import { TerminalButton } from '../ui/TerminalButton'

export type EmptyStateVariant = 'default' | 'subtle'

export interface EmptyStateProps {
  icon: LucideIcon
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: EmptyStateVariant
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  message,
  action,
  variant = 'subtle',
  className = ''
}) => {
  const containerStyles = variant === 'subtle'
    ? 'py-12 flex flex-col items-center justify-center text-center opacity-40'
    : 'py-16 flex flex-col items-center justify-center text-center'

  const iconStyles = variant === 'subtle'
    ? 'mb-3'
    : 'mb-4'

  const textStyles = variant === 'subtle'
    ? 'text-[10px] font-mono tracking-wider'
    : 'text-sm font-mono tracking-wider text-muted-foreground'

  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={iconStyles}>
        <Icon size={variant === 'subtle' ? 24 : 32} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <span className={textStyles}>
        {message}
      </span>
      {action && (
        <TerminalButton
          variant="ghost"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </TerminalButton>
      )}
    </div>
  )
}
