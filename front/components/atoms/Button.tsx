import React from 'react'
import { motion } from 'framer-motion'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  glass?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#3762E3] dark:bg-[#4E47DD] text-white shadow-lg shadow-[#3762E3]/20 dark:shadow-[#4E47DD]/20 hover:scale-105 active:scale-95',
  secondary: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white',
  ghost: 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white',
  danger: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10',
  success: 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95',
  warning: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95'
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl'
}

const glassStyles = 'backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1E]/90 border border-white/20 dark:border-white/5'

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glass = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
  const widthStyles = fullWidth ? 'w-full' : ''
  
  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${glass ? glassStyles : ''}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </motion.button>
  )
}
