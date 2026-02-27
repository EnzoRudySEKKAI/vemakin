import React from 'react'
import { LucideIcon } from 'lucide-react'
import { TerminalButton } from '../ui/TerminalButton'

export type EmptyStateVariant = 'default' | 'subtle' | 'centered' | 'full'
export type EmptyStateSize = 'sm' | 'md' | 'lg'

export interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  }
  variant?: EmptyStateVariant
  size?: EmptyStateSize
  className?: string
}

const sizeStyles: Record<EmptyStateSize, { container: string; icon: number; title: string; desc: string }> = {
  sm: { 
    container: 'py-8', 
    icon: 20, 
    title: 'text-sm', 
    desc: 'text-[10px]' 
  },
  md: { 
    container: 'py-12', 
    icon: 24, 
    title: 'text-base', 
    desc: 'text-xs' 
  },
  lg: { 
    container: 'py-16', 
    icon: 32, 
    title: 'text-xl', 
    desc: 'text-sm' 
  },
}

const variantStyles: Record<EmptyStateVariant, string> = {
  subtle: 'opacity-30',
  default: '',
  centered: '',
  full: 'min-h-[400px]',
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  message,
  action,
  variant = 'subtle',
  size = 'md',
  className = ''
}) => {
  const sizeStyle = sizeStyles[size]
  const variantStyle = variantStyles[variant]

  const titleText = title || message

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      ${sizeStyle.container}
      ${variantStyle}
      ${className}
    `}>
      {Icon && (
        <div className="mb-4">
          <div className={`
            w-14 h-14 
            border border-white/10 bg-[#0a0a0a]/40 
            flex items-center justify-center
            mx-auto
          `}>
            <Icon 
              size={sizeStyle.icon} 
              strokeWidth={1.5} 
              className="text-muted-foreground" 
            />
          </div>
        </div>
      )}
      
      {titleText && (
        <h2 className={`
          ${sizeStyle.title} 
          font-semibold text-foreground 
          mb-2 font-mono tracking-wider
        `}>
          {titleText}
        </h2>
      )}
      
      {description && (
        <p className={`
          ${sizeStyle.desc} 
          text-muted-foreground 
          mb-6 
          font-mono
          max-w-sm
        `}>
          {description}
        </p>
      )}
      
      {action && (
        <TerminalButton
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </TerminalButton>
      )}
    </div>
  )
}

export const EmptyStateInline: React.FC<{
  icon?: LucideIcon
  message: string
  className?: string
}> = ({
  icon: Icon,
  message,
  className = ''
}) => {
  return (
    <div className={`
      py-4 
      flex flex-col items-center justify-center text-center 
      opacity-10
      ${className}
    `}>
      {Icon && (
        <Icon size={24} className="mb-2" />
      )}
      <span className="text-[10px] font-mono tracking-wider">
        {message}
      </span>
    </div>
  )
}
