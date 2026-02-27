import React from 'react'

export type PriorityValue = 'critical' | 'high' | 'medium' | 'low'

export interface FormPrioritySelectorProps {
  label?: string
  value: PriorityValue
  onChange: (value: PriorityValue) => void
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const priorityConfig: Record<PriorityValue, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  high: { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { label: 'Medium', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { label: 'Low', bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
}

export const FormPrioritySelector: React.FC<FormPrioritySelectorProps> = ({
  label = 'Priority',
  value,
  onChange,
  hint,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const priorities: PriorityValue[] = ['critical', 'high', 'medium', 'low']

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-red-500">
            *
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {priorities.map((priority) => {
          const isActive = value === priority
          const config = priorityConfig[priority]

          return (
            <button
              key={priority}
              type="button"
              onClick={() => !disabled && onChange(priority)}
              disabled={disabled}
              className={`
                flex-1 py-2.5 px-3
                text-[10px] font-mono uppercase tracking-wider
                border transition-all
                ${isActive 
                  ? `${config.bg} ${config.text} ${config.border}` 
                  : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {config.label}
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
