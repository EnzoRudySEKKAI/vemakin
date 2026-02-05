import React from 'react'
import { icons, radius, typography } from '../../design-system'
import type { LucideIcon } from 'lucide-react'

export type IconContainerSize = 'sm' | 'md' | 'lg' | 'xl'
export type IconContainerVariant = 'default' | 'accent' | 'muted' | 'success' | 'warning' | 'danger'

export interface IconContainerProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Container size */
  size?: IconContainerSize
  /** Color variant */
  variant?: IconContainerVariant
  /** Custom className */
  className?: string
  /** Icon stroke width - defaults to 2.5 */
  strokeWidth?: number
}

const sizeStyles: Record<IconContainerSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
}

const iconSizes: Record<IconContainerSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
}

const variantStyles: Record<IconContainerVariant, string> = {
  default: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400',
  accent: 'bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400',
  muted: 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500',
  success: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
}

export const IconContainer: React.FC<IconContainerProps> = ({
  icon: Icon,
  size = 'md',
  variant = 'default',
  className = '',
  strokeWidth = icons.strokeWidth,
}) => {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${radius.md}
        ${variantStyles[variant]}
        flex items-center justify-center
        ${className}
      `}
    >
      <Icon size={iconSizes[size]} strokeWidth={strokeWidth} />
    </div>
  )
}

/**
 * Icon Badge - Small circular icon for inline use
 */
export interface IconBadgeProps {
  icon: LucideIcon
  variant?: IconContainerVariant
  className?: string
  strokeWidth?: number
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  variant = 'default',
  className = '',
  strokeWidth = icons.strokeWidth,
}) => {
  const badgeVariantStyles: Record<IconContainerVariant, string> = {
    default: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
    accent: 'bg-blue-100 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400',
    muted: 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500',
    success: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
    warning: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    danger: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
  }

  return (
    <div
      className={`
        w-6 h-6
        ${radius.sm}
        ${badgeVariantStyles[variant]}
        flex items-center justify-center
        ${className}
      `}
    >
      <Icon size={12} strokeWidth={strokeWidth} />
    </div>
  )
}

/**
 * Icon Stack - Multiple icons in a row with overlap
 */
export interface IconStackProps {
  icons: LucideIcon[]
  size?: IconContainerSize
  className?: string
}

export const IconStack: React.FC<IconStackProps> = ({
  icons,
  size = 'sm',
  className = '',
}) => {
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {icons.map((Icon, index) => (
        <div
          key={index}
          className={`
            ${sizeStyles[size]}
            ${radius.full}
            bg-white dark:bg-[#1C1C1E]
            border-2 border-white dark:border-[#141417]
            flex items-center justify-center
          `}
        >
          <Icon size={iconSizes[size] - 4} strokeWidth={icons.strokeWidth} />
        </div>
      ))}
    </div>
  )
}
