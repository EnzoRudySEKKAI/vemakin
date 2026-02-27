import React from 'react'

export type ToggleVariant = 'default' | 'primary' | 'warning' | 'danger' | 'success'

export interface ToggleOption<T> {
  value: T
  label: string
  variant?: ToggleVariant
  disabled?: boolean
}

export interface FormToggleGroupProps<T extends string | number | boolean> {
  label?: string
  value: T
  onChange: (value: T) => void
  options: ToggleOption<T>[]
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const variantStyles: Record<ToggleVariant, { active: string; inactive: string }> = {
  default: {
    active: 'bg-primary text-primary-foreground border-primary',
    inactive: 'text-muted-foreground hover:text-foreground hover:bg-secondary'
  },
  primary: {
    active: 'bg-primary text-primary-foreground border-primary',
    inactive: 'text-muted-foreground hover:text-foreground hover:bg-secondary'
  },
  warning: {
    active: 'bg-orange-500 text-white border-orange-500',
    inactive: 'text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10'
  },
  danger: {
    active: 'bg-red-500 text-white border-red-500',
    inactive: 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10'
  },
  success: {
    active: 'bg-emerald-500 text-white border-emerald-500',
    inactive: 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10'
  }
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function FormToggleGroup<T extends string | number | boolean>({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  required = false,
  disabled = false,
  className = ''
}: FormToggleGroupProps<T>) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {formatLabel(label)}
          </label>
          {required && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-red-500">
              *
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1 p-1 bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/10">
        {options.map((option, index) => {
          const isActive = value === option.value
          const variant = option.variant || 'default'
          const styles = variantStyles[variant]
          
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => !option.disabled && onChange(option.value)}
              disabled={disabled || option.disabled}
              className={`
                flex-1 min-w-[80px] py-3 px-2
                text-[10px] font-medium uppercase tracking-wider
                border transition-all
                ${isActive 
                  ? styles.active 
                  : `${styles.inactive} bg-transparent border-transparent`
                }
                ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${index > 0 && !isActive ? 'border-l border-gray-300 dark:border-white/10' : ''}
              `}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
