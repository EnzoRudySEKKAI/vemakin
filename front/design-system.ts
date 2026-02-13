/**
 * Vemakin Design System Tokens
 * 
 * This file contains all design tokens for consistent UI/UX across the application.
 * All components should reference these tokens instead of using arbitrary values.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    light: '#3762E3',
    dark: '#4E47DD',
    lightHover: '#2952D1',
    darkHover: '#3F39D1',
  },

  // Traffic Light Colors (macOS style)
  trafficLights: {
    red: '#FF5F56',
    yellow: '#FFBD2E',
    green: '#27CA40',
  },

  // Background Colors - Pure black theme
  background: {
    light: '#F2F2F7',
    dark: '#0F1116',      // Dark blue-grey background
    darker: '#090A0D',    // Even darker for contrast
  },

  // Surface/Card Colors
  surface: {
    light: '#FFFFFF',
    lightGlass: 'rgba(255, 255, 255, 0.8)',
    dark: '#16181D',      // Slightly lighter than background for cards
    darker: '#0F1116',    // For nested elements
    darkGlass: 'rgba(22, 24, 29, 0.95)',
  },

  // Border Colors
  border: {
    light: '#E5E5E5',
    lightGlass: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(255, 255, 255, 0.08)',      // Subtle borders
    darkGlass: 'rgba(255, 255, 255, 0.05)', // Very subtle
    darkHover: 'rgba(255, 255, 255, 0.12)', // Hover state
  },

  // Text Colors
  text: {
    primary: {
      light: '#111827', // gray-900
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#374151', // gray-700
      dark: '#E5E5E5', // gray-200
    },
    muted: {
      light: '#6B7280', // gray-500
      dark: '#9CA3AF', // gray-400
    },
    placeholder: {
      light: '#9CA3AF', // gray-400
      dark: '#6B7280', // gray-500
    },
  },

  // Semantic Colors
  success: {
    light: '#22C55E',
    dark: '#27CA40',      // Match traffic light green
  },
  warning: {
    light: '#F97316',
    dark: '#FFBD2E',      // Match traffic light yellow
  },
  danger: {
    light: '#EF4444',
    dark: '#FF5F56',      // Match traffic light red
  },
  info: {
    light: '#3B82F6',
    dark: '#4E47DD',
  },

  // Timeline Status Colors
  timeline: {
    done: '#27CA40',      // Green for completed
    current: '#4E47DD',   // Indigo for current/active
    pending: '#3A3A3C',   // Gray for pending
  },
} as const

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const radius = {
  none: 'rounded-none',
  sm: 'rounded-xl',        // 12px - small buttons, tags
  md: 'rounded-2xl',       // 16px - inputs, small cards
  lg: 'rounded-[20px]',    // 20px - cards, containers
  xl: 'rounded-[24px]',    // 24px - large cards, modals
  '2xl': 'rounded-[32px]', // 32px - full modals, containers
  full: 'rounded-full',    // pills, avatars
} as const

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  // Font Sizes - 6 steps
  size: {
    xs: 'text-[10px]',     // Labels, timestamps, badges
    sm: 'text-xs',         // Captions, small buttons
    base: 'text-sm',       // Body text, inputs
    lg: 'text-base',       // Emphasis, larger body
    xl: 'text-lg',         // Subheadings
    '2xl': 'text-xl',      // Section headings
    '3xl': 'text-2xl',     // Page headings
    '4xl': 'text-3xl',     // Hero text
  },
  
  // Font Weights
  weight: {
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600 - PRIMARY
    bold: 'font-bold',       // 700
  },
  
  // Line Heights
  leading: {
    tight: 'leading-tight',    // 1.25
    snug: 'leading-snug',      // 1.375
    normal: 'leading-normal',  // 1.5
    relaxed: 'leading-relaxed', // 1.625
  },
} as const

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Gap/Space between elements
  gap: {
    1: 'gap-1',    // 4px
    2: 'gap-2',    // 8px
    3: 'gap-3',    // 12px
    4: 'gap-4',    // 16px
    5: 'gap-5',    // 20px
    6: 'gap-6',    // 24px
    8: 'gap-8',    // 32px
    10: 'gap-10',  // 40px
  },
  
  // Padding
  padding: {
    1: 'p-1',      // 4px
    2: 'p-2',      // 8px
    3: 'p-3',      // 12px
    4: 'p-4',      // 16px
    5: 'p-5',      // 20px
    6: 'p-6',      // 24px
    8: 'p-8',      // 32px
  },
  
  // Margin
  margin: {
    1: 'm-1',
    2: 'm-2',
    3: 'm-3',
    4: 'm-4',
    5: 'm-5',
    6: 'm-6',
    8: 'm-8',
  },
} as const

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  primary: 'shadow-lg shadow-primary/20',
  primarySm: 'shadow-md shadow-primary/10',
} as const

// ============================================================================
// ICON TOKENS
// ============================================================================

export const icons = {
  // Icon Sizes
  size: {
    xs: 12,      // Inline, small buttons
    sm: 14,      // Buttons, badges
    md: 16,      // Inputs, list items
    lg: 20,      // Navigation, actions
    xl: 24,      // Featured icons
    '2xl': 32,   // Empty states
    '3xl': 40,   // Large empty states
  },
  
  // Stroke Width - Always 2.5 for consistency
  strokeWidth: 2.5,
  
  // Icon Container Sizes
  container: {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  },
} as const

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const componentTokens = {
  // Button Heights
  button: {
    height: {
      sm: 'h-9',     // 36px - Small buttons
      md: 'h-11',    // 44px - Standard buttons
      lg: 'h-12',    // 48px - Large buttons, header
    },
    padding: {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-6',
    },
  },
  
  // Input Heights
  input: {
    height: {
      sm: 'h-10',    // 40px
      md: 'h-12',    // 48px - Standard
      lg: 'h-14',    // 56px
    },
  },
  
  // Card Padding
  card: {
    padding: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
} as const

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animations = {
  duration: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
  },
  ease: {
    default: 'ease-out',
    bounce: 'ease-spring',
  },
  scale: {
    hover: 'hover:scale-[1.02]',
    active: 'active:scale-[0.98]',
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color class based on theme
 */
export function getColorClass(
  token: keyof typeof colors,
  subtoken: string,
  type: 'text' | 'bg' | 'border' = 'text'
): string {
  const colorValue = (colors as any)[token]?.[subtoken]
  if (!colorValue) return ''
  
  switch (type) {
    case 'bg':
      return `bg-[${colorValue}]`
    case 'border':
      return `border-[${colorValue}]`
    default:
      return `text-[${colorValue}]`
  }
}

/**
 * Format text with Pascal case
 * If it's a sentence, only the first word is capitalized
 * If it's a title/label, all words are capitalized
 */
export function formatText(text: string, type: 'sentence' | 'title' = 'title'): string {
  if (!text) return ''
  
  if (type === 'sentence') {
    // Only first word capitalized, rest lowercase
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
  
  // Title case - all words capitalized
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// ============================================================================
// CSS CLASS BUILDERS
// ============================================================================

/**
 * Build glass effect classes
 */
export function glassClasses(variant: 'light' | 'dark' = 'light'): string {
  if (variant === 'dark') {
    return 'bg-[#16181D]/90 backdrop-blur-xl border border-white/5'
  }
  return 'bg-white/80 backdrop-blur-xl border border-white/20'
}

/**
 * Build primary button classes
 */
export function primaryButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: `${componentTokens.button.height.sm} ${componentTokens.button.padding.sm}`,
    md: `${componentTokens.button.height.md} ${componentTokens.button.padding.md}`,
    lg: `${componentTokens.button.height.lg} ${componentTokens.button.padding.lg}`,
  }
  
  return `
    ${sizes[size]}
    ${radius.md}
    bg-primary
    text-white
    ${typography.weight.semibold}
    ${typography.size.sm}
    ${shadows.primary}
    transition-all ${animations.duration.normal}
    hover:opacity-90
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build secondary button classes
 */
export function secondaryButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: `${componentTokens.button.height.sm} ${componentTokens.button.padding.sm}`,
    md: `${componentTokens.button.height.md} ${componentTokens.button.padding.md}`,
    lg: `${componentTokens.button.height.lg} ${componentTokens.button.padding.lg}`,
  }
  
  return `
    ${sizes[size]}
    ${radius.md}
    bg-white dark:bg-[#16181D]
    border border-gray-200 dark:border-white/10
    text-gray-700 dark:text-gray-200
    ${typography.weight.semibold}
    ${typography.size.sm}
    transition-all ${animations.duration.normal}
    hover:bg-gray-50 dark:hover:bg-white/5
    active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build ghost button classes
 */
export function ghostButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: `${componentTokens.button.height.sm} ${componentTokens.button.padding.sm}`,
    md: `${componentTokens.button.height.md} ${componentTokens.button.padding.md}`,
    lg: `${componentTokens.button.height.lg} ${componentTokens.button.padding.lg}`,
  }
  
  return `
    ${sizes[size]}
    ${radius.md}
    bg-transparent
    text-gray-500 dark:text-gray-400
    ${typography.weight.semibold}
    ${typography.size.sm}
    transition-all ${animations.duration.normal}
    hover:bg-gray-100 dark:hover:bg-white/5
    active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build danger button classes
 */
export function dangerButtonClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: `${componentTokens.button.height.sm} ${componentTokens.button.padding.sm}`,
    md: `${componentTokens.button.height.md} ${componentTokens.button.padding.md}`,
    lg: `${componentTokens.button.height.lg} ${componentTokens.button.padding.lg}`,
  }
  
  return `
    ${sizes[size]}
    ${radius.md}
    bg-red-500 dark:bg-red-600
    text-white
    ${typography.weight.semibold}
    ${typography.size.sm}
    transition-all ${animations.duration.normal}
    hover:bg-red-600 dark:hover:bg-red-700
    active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build input classes
 */
export function inputClasses(variant: 'default' | 'glass' = 'default'): string {
  const base = `
    w-full
    ${componentTokens.input.height.md}
    ${radius.md}
    px-4
    ${typography.size.base}
    ${typography.weight.semibold}
    text-gray-900 dark:text-white
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:outline-none
    transition-all ${animations.duration.normal}
  `.trim().replace(/\s+/g, ' ')
  
  if (variant === 'glass') {
    return `${base} bg-white/80 dark:bg-[#16181D]/90 backdrop-blur-xl border border-white/20 dark:border-white/5 focus:border-primary`
  }
  
  return `${base} bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10 focus:border-primary`
}

/**
 * Build card classes
 */
export function cardClasses(
  variant: 'default' | 'glass' | 'hover' | 'flat' | 'window' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const sizes = {
    sm: componentTokens.card.padding.sm,
    md: componentTokens.card.padding.md,
    lg: componentTokens.card.padding.lg,
  }

  const base = `
    ${radius.xl}
    ${sizes[size]}
    transition-all ${animations.duration.normal}
  `.trim().replace(/\s+/g, ' ')

  switch (variant) {
    case 'glass':
      return `${base} ${glassClasses('light')} dark:${glassClasses('dark')}`
    case 'hover':
      return `${base} ${glassClasses('light')} dark:${glassClasses('dark')} hover:scale-[1.02] hover:shadow-lg cursor-pointer`
    case 'flat':
      return `${base} bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5`
    case 'window':
      return `${base} bg-[#16181D] border border-white/[0.08] overflow-hidden`
    default:
      return `${base} bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10`
  }
}

/**
 * Build window card header classes
 */
export function windowCardHeaderClasses(): string {
  return `
    flex items-center justify-between
    px-4 py-3
    border-b border-white/[0.08]
    bg-[#16181D]
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build window card content classes
 */
export function windowCardContentClasses(): string {
  return `
    p-4
    bg-[#0F1116]
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Build timeline item classes
 */
export function timelineItemClasses(status: 'done' | 'current' | 'pending' = 'pending'): string {
  const barColors = {
    done: 'bg-[#27CA40]',
    current: 'bg-primary',
    pending: 'bg-[#3A3A3C]',
  }

  return `
    flex items-center gap-3
    p-3 rounded-xl
    bg-[#16181D] border border-white/[0.05]
    transition-all duration-200
    hover:border-white/[0.12]
    group
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Get timeline bar color class
 */
export function timelineBarColor(status: 'done' | 'current' | 'pending'): string {
  switch (status) {
    case 'done':
      return 'bg-[#27CA40]'
    case 'current':
      return 'bg-primary'
    default:
      return 'bg-[#3A3A3C]'
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  colors,
  radius,
  typography,
  spacing,
  shadows,
  icons,
  componentTokens,
  animations,
  formatText,
  glassClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
  ghostButtonClasses,
  dangerButtonClasses,
  inputClasses,
  cardClasses,
}
