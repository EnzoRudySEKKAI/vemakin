import React from 'react'
import { typography, colors } from '../../design-system'

export type TextVariant = 
  | 'hero'      // Page title - 3xl
  | 'h1'        // Section heading - 2xl
  | 'h2'        // Subsection - xl
  | 'h3'        // Card title - lg
  | 'body'      // Body text - base
  | 'caption'   // Small text - sm
  | 'label'     // Labels - xs
  | 'button'    // Button text - sm semibold

export type TextColor = 
  | 'primary'   // Main text (gray-900/white)
  | 'secondary' // Secondary text (gray-700/gray-200)
  | 'muted'     // Muted text (gray-500/gray-400)
  | 'accent'    // Brand color (#3762E3/#4E47DD)
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse'   // White on dark, dark on light

export interface TextProps {
  children: React.ReactNode
  variant?: TextVariant
  color?: TextColor
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'label'
  className?: string
  truncate?: boolean
  center?: boolean
  /** If true, text is treated as a sentence (only first word capitalized) */
  sentence?: boolean
  /** If true, no automatic formatting (Title/Sentence case) is applied */
  noFormat?: boolean
}

// Map variants to typography classes
const variantStyles: Record<TextVariant, string> = {
  hero: `${typography.size['4xl']} ${typography.weight.semibold} ${typography.leading.tight}`,
  h1: `${typography.size['3xl']} ${typography.weight.semibold} ${typography.leading.tight}`,
  h2: `${typography.size['2xl']} ${typography.weight.semibold} ${typography.leading.snug}`,
  h3: `${typography.size.xl} ${typography.weight.semibold} ${typography.leading.snug}`,
  body: `${typography.size.base} ${typography.weight.semibold} ${typography.leading.normal}`,
  caption: `${typography.size.sm} ${typography.weight.semibold} ${typography.leading.normal}`,
  label: `${typography.size.xs} ${typography.weight.semibold} ${typography.leading.normal}`,
  button: `${typography.size.sm} ${typography.weight.semibold}`,
}

// Map color to actual classes
const colorStyles: Record<TextColor, string> = {
  primary: `text-gray-900 dark:text-white`,
  secondary: `text-gray-700 dark:text-gray-200`,
  muted: `text-gray-500 dark:text-gray-400`,
  accent: `text-primary`,
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400',
  inverse: 'text-white dark:text-gray-900',
}

/**
 * Format text based on type
 * - Title: All words capitalized (Pascal Case)
 * - Sentence: Only first word capitalized
 */
function formatTextContent(text: React.ReactNode, isSentence: boolean): React.ReactNode {
  if (typeof text !== 'string') return text
  
  if (isSentence) {
    // Sentence case: Only first word capitalized
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
  
  // Title case: All words capitalized (Pascal Case)
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  as,
  className = '',
  truncate = false,
  center = false,
  sentence = false,
  noFormat = false,
}) => {
  const formattedChildren = noFormat ? children : formatTextContent(children, sentence)
  const classes = `
    ${variantStyles[variant]}
    ${colorStyles[color]}
    ${truncate ? 'truncate' : ''}
    ${center ? 'text-center' : ''}
    ${className}
  `

  // Determine which element to render based on variant or 'as' prop
  const elementType = as || (() => {
    switch (variant) {
      case 'hero': return 'h1'
      case 'h1': return 'h2'
      case 'h2': return 'h3'
      case 'h3': return 'h4'
      case 'body': return 'p'
      default: return 'span'
    }
  })()

  // Use React.createElement to avoid JSX variable issues
  return React.createElement(
    elementType,
    { className: classes },
    formattedChildren
  )
}
