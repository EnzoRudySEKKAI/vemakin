import React from 'react'
import { motion } from 'framer-motion'
import { cardClasses, radius, typography } from '../../design-system'

export type CardVariant = 'default' | 'flat'
export type CardSize = 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  children: React.ReactNode
  className?: string
  /** Enable hover animation for hover variant */
  interactive?: boolean
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Header action element */
  headerAction?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  interactive = false,
  title,
  subtitle,
  headerAction,
  ...props
}) => {
  const cardContent = (
    <div
      className={`
        ${cardClasses(variant, size)}
        ${className}
      `}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className={`${typography.size.lg} ${typography.weight.semibold} text-gray-900 dark:text-white`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`${typography.size.sm} ${typography.weight.medium} text-gray-500 dark:text-gray-400 mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  )

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

/**
 * Card Header component for consistent header layout
 */
export interface CardHeaderProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-primary/10 rounded-xl">
            {icon}
          </div>
        )}
        <div>
          <h3 className={`${typography.size.base} ${typography.weight.semibold} text-gray-900 dark:text-white`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`${typography.size.xs} ${typography.weight.medium} text-gray-500 dark:text-gray-400`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * Card Section component for dividing card content
 */
export interface CardSectionProps {
  children: React.ReactNode
  className?: string
  bordered?: boolean
}

export const CardSection: React.FC<CardSectionProps> = ({
  children,
  className = '',
  bordered = false,
}) => {
  return (
    <div
      className={`
        py-4
        ${bordered ? 'border-t border-gray-100 dark:border-white/5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
