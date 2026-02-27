import React, { createContext, useContext, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { CategoryIcon } from '../atoms/CategoryIcon'
import { StatusBadge } from '../atoms/StatusBadge'

export type CardVariant = 'grid' | 'list' | 'compact'

interface CardItemContextValue {
  variant: CardVariant
  animate: boolean
}

const CardItemContext = createContext<CardItemContextValue>({
  variant: 'grid',
  animate: true
})

interface CardItemProps {
  children: ReactNode
  variant?: CardVariant
  animate?: boolean
  onClick?: () => void
  className?: string
  isActive?: boolean
}

export const CardItem: React.FC<CardItemProps> = ({
  children,
  variant = 'grid',
  animate = false,
  onClick,
  className = '',
  isActive = false
}) => {
  const baseClasses = `
    group cursor-pointer border transition-all duration-300
    bg-[#fafafa] dark:bg-[#0a0a0a]/40
    hover:border-primary/30 dark:hover:border-primary/30
    ${isActive ? 'border-primary/50 bg-primary/5' : 'border-gray-300 dark:border-white/10'}
  `

  const variantClasses = {
    grid: 'p-4',
    list: 'p-3 flex items-center gap-4',
    compact: 'p-2'
  }

  const Wrapper = animate ? motion.div : 'div'
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <CardItemContext.Provider value={{ variant, animate }}>
      <Wrapper
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        onClick={onClick}
        {...animationProps}
      >
        {children}
      </Wrapper>
    </CardItemContext.Provider>
  )
}

interface CardItemHeaderProps {
  children: ReactNode
  className?: string
}

const CardItemHeader: React.FC<CardItemHeaderProps> = ({ children, className = '' }) => {
  const { variant } = useContext(CardItemContext)
  
  const classes = variant === 'list' 
    ? 'flex items-center gap-3' 
    : variant === 'compact'
      ? 'flex items-center gap-2 mb-1'
      : 'flex items-start justify-between gap-3 mb-3'

  return (
    <div className={`${classes} ${className}`}>
      {children}
    </div>
  )
}

interface CardItemIconProps {
  icon: LucideIcon | string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
  className?: string
}

const CardItemIcon: React.FC<CardItemIconProps> = ({ 
  icon, 
  size = 'md',
  variant = 'default',
  className = '' 
}) => {
  const { variant: cardVariant } = useContext(CardItemContext)
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  }

  if (typeof icon === 'string') {
    return (
      <div className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        bg-[#f5f5f5] dark:bg-[#16181D]
        border border-gray-300 dark:border-white/10
        ${className}
      `}>
        <CategoryIcon category={icon} size={size} variant={variant === 'filled' ? 'filled' : 'default'} />
      </div>
    )
  }

  const Icon = icon

  return (
    <div className={`
      ${sizeClasses[size]}
      flex items-center justify-center
      bg-[#f5f5f5] dark:bg-[#16181D]
      border border-gray-300 dark:border-white/10
      ${className}
    `}>
      <Icon size={iconSizes[size]} strokeWidth={2} className="text-muted-foreground" />
    </div>
  )
}

interface CardItemBadgeProps {
  children?: ReactNode
  variant?: 'status' | 'priority' | 'ownership' | 'generic'
  value?: string
  className?: string
}

const CardItemBadge: React.FC<CardItemBadgeProps> = ({ 
  children,
  variant = 'generic',
  value,
  className = '' 
}) => {
  if (children) {
    return <div className={className}>{children}</div>
  }

  if (!value) return null

  return (
    <StatusBadge 
      variant={variant} 
      value={value} 
      size="sm"
      className={className}
    />
  )
}

interface CardItemContentProps {
  children: ReactNode
  className?: string
}

const CardItemContent: React.FC<CardItemContentProps> = ({ children, className = '' }) => {
  return <div className={`flex-1 min-w-0 ${className}`}>{children}</div>
}

interface CardItemTitleProps {
  children: ReactNode
  className?: string
  truncate?: boolean
}

const CardItemTitle: React.FC<CardItemTitleProps> = ({ 
  children, 
  className = '',
  truncate = true 
}) => {
  return (
    <h3 className={`
      text-sm font-medium text-foreground
      ${truncate ? 'truncate' : ''}
      ${className}
    `}>
      {children}
    </h3>
  )
}

interface CardItemSubtitleProps {
  children: ReactNode
  className?: string
  truncate?: boolean
}

const CardItemSubtitle: React.FC<CardItemSubtitleProps> = ({ 
  children, 
  className = '',
  truncate = true
}) => {
  return (
    <p className={`
      text-[10px] font-mono tracking-wider text-muted-foreground
      ${truncate ? 'truncate' : ''}
      ${className}
    `}>
      {children}
    </p>
  )
}

interface CardItemDescriptionProps {
  children: ReactNode
  className?: string
  lines?: number
}

const CardItemDescription: React.FC<CardItemDescriptionProps> = ({ 
  children, 
  className = '',
  lines = 2
}) => {
  return (
    <p className={`
      text-xs text-muted-foreground
      ${lines === 1 ? 'truncate' : `line-clamp-${lines}`}
      ${className}
    `}>
      {children}
    </p>
  )
}

interface CardItemFooterProps {
  children: ReactNode
  className?: string
}

const CardItemFooter: React.FC<CardItemFooterProps> = ({ children, className = '' }) => {
  const { variant } = useContext(CardItemContext)
  
  const classes = variant === 'list'
    ? 'flex items-center gap-4 shrink-0'
    : 'flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border'

  return (
    <div className={`${classes} ${className}`}>
      {children}
    </div>
  )
}

interface CardItemMetaProps {
  children: ReactNode
  icon?: LucideIcon
  className?: string
}

const CardItemMeta: React.FC<CardItemMetaProps> = ({ 
  children, 
  icon: Icon,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-muted-foreground ${className}`}>
      {Icon && <Icon size={10} />}
      {children}
    </div>
  )
}

interface CardItemActionsProps {
  children: ReactNode
  className?: string
}

const CardItemActions: React.FC<CardItemActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {children}
    </div>
  )
}

CardItem.Header = CardItemHeader
CardItem.Icon = CardItemIcon
CardItem.Badge = CardItemBadge
CardItem.Content = CardItemContent
CardItem.Title = CardItemTitle
CardItem.Subtitle = CardItemSubtitle
CardItem.Description = CardItemDescription
CardItem.Footer = CardItemFooter
CardItem.Meta = CardItemMeta
CardItem.Actions = CardItemActions

export type { CardItemProps, CardItemHeaderProps, CardItemIconProps, CardItemBadgeProps, CardItemContentProps, CardItemTitleProps, CardItemSubtitleProps, CardItemDescriptionProps, CardItemFooterProps, CardItemMetaProps, CardItemActionsProps }
