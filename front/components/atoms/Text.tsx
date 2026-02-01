import React from 'react'

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'title' | 'subtitle' | 'body' | 'caption' | 'label'
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'inverse' | 'success' | 'warning' | 'danger'

interface TextProps {
  children: React.ReactNode
  variant?: TextVariant
  color?: TextColor
  as?: keyof JSX.IntrinsicElements
  className?: string
  truncate?: boolean
  uppercase?: boolean
  italic?: boolean
  bold?: boolean
  center?: boolean
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl md:text-5xl font-bold leading-tight',
  h2: 'text-3xl md:text-4xl font-bold leading-tight',
  h3: 'text-2xl md:text-3xl font-semibold leading-snug',
  h4: 'text-xl md:text-2xl font-semibold leading-snug',
  title: 'text-lg md:text-xl font-semibold leading-snug',
  subtitle: 'text-sm font-semibold uppercase tracking-wider',
  body: 'text-base font-semibold leading-relaxed',
  caption: 'text-xs font-semibold leading-relaxed',
  label: 'text-xs font-semibold uppercase tracking-wider'
}

const colorStyles: Record<TextColor, string> = {
  default: 'text-gray-900 dark:text-white',
  primary: 'text-[#3762E3] dark:text-[#4E47DD]',
  secondary: 'text-gray-700 dark:text-gray-200',
  muted: 'text-gray-500 dark:text-gray-400',
  inverse: 'text-white dark:text-gray-900',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400'
}

const elementMap: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  title: 'h3',
  subtitle: 'span',
  body: 'p',
  caption: 'span',
  label: 'label'
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'default',
  as,
  className = '',
  truncate = false,
  uppercase = false,
  italic = false,
  bold = false,
  center = false
}) => {
  const Component = as || elementMap[variant]
  
  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${truncate ? 'truncate' : ''}
        ${uppercase ? 'uppercase' : ''}
        ${italic ? 'italic' : ''}
        ${bold ? 'font-bold' : ''}
        ${center ? 'text-center' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}
