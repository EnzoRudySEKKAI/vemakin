import React from 'react'

export type InputVariant = 'default' | 'glass' | 'underline'
export type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  size?: InputSize
  error?: string
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#3762E3]/20',
  glass: 'backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1E]/90 border border-white/20 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-white/30',
  underline: 'bg-transparent border-b border-gray-200 dark:border-white/10 rounded-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] focus:ring-0'
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base'
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  error,
  label,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const widthStyles = fullWidth ? 'w-full' : ''
  const hasIcon = leftIcon || rightIcon
  const iconPadding = hasIcon ? (leftIcon ? 'pl-12' : '') + (rightIcon ? ' pr-12' : '') : ''
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            ${variantStyles[variant]}
            ${sizeStyles[size]}
            ${iconPadding}
            ${widthStyles}
            font-semibold text-gray-900 dark:text-white
            placeholder:text-gray-400
            focus:outline-none
            transition-all duration-200
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  )
}
