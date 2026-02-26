/**
 * Vemakin Design System Tokens
 * 
 * This file contains all design tokens for consistent UI/UX across the application.
 * All components should reference these tokens instead of using arbitrary values.
 */

export const colors = {
  primary: {
    light: '#3762E3',
    dark: '#4E47DD',
    lightHover: '#2952D1',
    darkHover: '#3F39D1',
  },
  trafficLights: {
    red: '#FF5F56',
    yellow: '#FFBD2E',
    green: '#27CA40',
  },
  background: {
    light: '#F2F2F7',
    dark: '#0F1116',
    darker: '#090A0D',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#16181D',
    darker: '#0F1116',
  },
  border: {
    light: '#E5E5E5',
    dark: 'rgba(255, 255, 255, 0.08)',
    darkHover: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    primary: {
      light: '#111827',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#374151',
      dark: '#E5E5E5',
    },
    muted: {
      light: '#6B7280',
      dark: '#9CA3AF',
    },
    placeholder: {
      light: '#9CA3AF',
      dark: '#6B7280',
    },
  },
  success: {
    light: '#22C55E',
    dark: '#27CA40',
  },
  warning: {
    light: '#F97316',
    dark: '#FFBD2E',
  },
  danger: {
    light: '#EF4444',
    dark: '#FF5F56',
  },
  info: {
    light: '#3B82F6',
    dark: '#4E47DD',
  },
  timeline: {
    done: '#27CA40',
    current: '#4E47DD',
    pending: '#3A3A3C',
  },
} as const

export const radius = {
  none: 'rounded-none',
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-[20px]',
  xl: 'rounded-[24px]',
  '2xl': 'rounded-[32px]',
  full: 'rounded-full',
} as const

export const typography = {
  size: {
    xs: 'text-[10px]',
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
    '3xl': 'text-2xl',
    '4xl': 'text-3xl',
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  leading: {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
  },
} as const

export const spacing = {
  gap: {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
  },
  padding: {
    1: 'p-1',
    2: 'p-2',
    3: 'p-3',
    4: 'p-4',
    5: 'p-5',
    6: 'p-6',
    8: 'p-8',
  },
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

export const icons = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  strokeWidth: 2.5,
  container: {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  },
} as const

export const componentTokens = {
  button: {
    height: {
      sm: 'h-9',
      md: 'h-11',
      lg: 'h-12',
    },
    padding: {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-6',
    },
  },
  input: {
    height: {
      sm: 'h-10',
      md: 'h-12',
      lg: 'h-14',
    },
  },
  card: {
    padding: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
} as const

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

export function getColorClass(
  token: keyof typeof colors,
  subtoken: string,
  type: 'text' | 'bg' | 'border' = 'text'
): string {
  const colorGroup = colors[token]
  if (!colorGroup || typeof colorGroup !== 'object') return ''
  const colorValue = (colorGroup as Record<string, string>)[subtoken]
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

export function formatText(text: string, type: 'sentence' | 'title' = 'title'): string {
  if (!text) return ''
  
  if (type === 'sentence') {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

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
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim().replace(/\s+/g, ' ')
}

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
    cursor-pointer
  `.trim().replace(/\s+/g, ' ')
}

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
    cursor-pointer
  `.trim().replace(/\s+/g, ' ')
}

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
    cursor-pointer
  `.trim().replace(/\s+/g, ' ')
}

export function inputClasses(): string {
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
  
  return `${base} bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10 focus:border-primary`
}

export function cardClasses(
  variant: 'default' | 'flat' | 'window' = 'default',
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
    case 'flat':
      return `${base} bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5`
    case 'window':
      return `${base} bg-[#16181D] border border-white/[0.08] overflow-hidden`
    default:
      return `${base} bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10`
  }
}

export function windowCardHeaderClasses(): string {
  return `
    flex items-center justify-between
    px-4 py-3
    border-b border-white/[0.08]
    bg-[#16181D]
  `.trim().replace(/\s+/g, ' ')
}

export function windowCardContentClasses(): string {
  return `
    p-4
    bg-[#0F1116]
  `.trim().replace(/\s+/g, ' ')
}

export function timelineItemClasses(status: 'done' | 'current' | 'pending' = 'pending'): string {
  return `
    flex items-center gap-3
    p-3 rounded-xl
    bg-[#16181D] border border-white/[0.05]
    transition-all duration-200
    hover:border-white/[0.12]
    group
  `.trim().replace(/\s+/g, ' ')
}

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
  primaryButtonClasses,
  secondaryButtonClasses,
  ghostButtonClasses,
  dangerButtonClasses,
  inputClasses,
  cardClasses,
}
