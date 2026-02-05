import React from 'react'
import { motion } from 'framer-motion'
import {
  primaryButtonClasses,
  secondaryButtonClasses,
  ghostButtonClasses,
  dangerButtonClasses,
  radius,
  typography,
} from '../../design-system'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return primaryButtonClasses(size)
      case 'secondary':
        return secondaryButtonClasses(size)
      case 'ghost':
        return ghostButtonClasses(size)
      case 'danger':
        return dangerButtonClasses(size)
      default:
        return secondaryButtonClasses(size)
    }
  }

  const baseStyles = 'inline-flex items-center justify-center gap-2'
  const widthStyles = fullWidth ? 'w-full' : ''

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${getVariantClasses()}
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
          <span className={typography.size.sm}>{children}</span>
          {rightIcon}
        </>
      )}
    </motion.button>
  )
}
