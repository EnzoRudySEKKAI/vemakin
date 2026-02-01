import React from 'react'
import { motion } from 'framer-motion'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  clickable?: boolean
  isActive?: boolean
  count?: number
  className?: string
  onClick?: () => void
}

const variantStyles: Record<BadgeVariant, { base: string; active: string }> = {
  default: {
    base: 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
    active: 'bg-[#3762E3] dark:bg-[#4E47DD] text-white border-[#3762E3] dark:border-[#4E47DD]'
  },
  primary: {
    base: 'bg-[#3762E3]/10 dark:bg-[#4E47DD]/10 text-[#3762E3] dark:text-[#4E47DD] border-[#3762E3]/20 dark:border-[#4E47DD]/20',
    active: 'bg-[#3762E3] dark:bg-[#4E47DD] text-white border-[#3762E3] dark:border-[#4E47DD]'
  },
  success: {
    base: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    active: 'bg-green-500 text-white border-green-500'
  },
  warning: {
    base: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    active: 'bg-orange-500 text-white border-orange-500'
  },
  danger: {
    base: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    active: 'bg-red-500 text-white border-red-500'
  },
  info: {
    base: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    active: 'bg-blue-500 text-white border-blue-500'
  },
  ghost: {
    base: 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent',
    active: 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border-gray-200 dark:border-white/10'
  }
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  clickable = false,
  isActive = false,
  count,
  className = '',
  onClick
}) => {
  const Component = clickable || onClick ? motion.button : 'span'
  const currentVariant = isActive ? variantStyles[variant].active : variantStyles[variant].base
  
  return (
    <Component
      {...(clickable || onClick ? {
        onClick,
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 }
      } : {})}
      className={`
        inline-flex items-center gap-1.5 font-semibold
        border rounded-xl
        transition-all duration-200
        ${sizeStyles[size]}
        ${currentVariant}
        ${clickable || onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
    >
      {children}
      {count !== undefined && (
        <span className={`
          ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold
          ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'}
        `}>
          {count}
        </span>
      )}
    </Component>
  )
}
