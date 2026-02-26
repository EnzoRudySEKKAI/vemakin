import React from 'react'
import { Aperture } from 'lucide-react'
import { radius } from '../../design-system'

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
  variant?: 'default' | 'primary'
  withContainer?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
  variant = 'default',
  withContainer = true
}) => {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  const getContainerStyles = () => {
    if (!withContainer) return ''
    
    const base = `${containerSizes[size]} ${radius.md} flex items-center justify-center`
    
    if (variant === 'primary') {
       return `${base} bg-primary shadow-lg shadow-primary/20`
    }
    
    // Default: Subtle primary
    return `${base} bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5`
  }

  const getIconColor = () => {
    if (variant === 'primary') return 'text-white'
    return 'text-primary'
  }
  
  const getTextColor = () => {
     return 'text-gray-900 dark:text-white'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={getContainerStyles()}>
        <Aperture 
          size={iconSizes[size]} 
          className={getIconColor()} 
          strokeWidth={2.5}
        />
      </div>
      
      {showText && (
        <span className={`font-bold tracking-tight ${textSizes[size]} ${getTextColor()} ${textClassName}`}>
          Vemakin
        </span>
      )}
    </div>
  )
}
