import React from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusType = 'pending' | 'completed' | 'in-progress' | 'done'

interface StatusToggleProps {
  status: StatusType
  onToggle: () => void
  className?: string
}

const statusConfig: Record<StatusType, { label: string; dotColor: string; borderColor: string; textColor: string }> = {
  pending: {
    label: 'PENDING',
    dotColor: 'bg-primary animate-pulse',
    borderColor: 'border-primary/30 hover:border-primary/50',
    textColor: 'text-primary'
  },
  'in-progress': {
    label: 'IN_PROGRESS',
    dotColor: 'bg-primary animate-pulse',
    borderColor: 'border-primary/30 hover:border-primary/50',
    textColor: 'text-primary'
  },
  completed: {
    label: 'COMPLETED',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  done: {
    label: 'COMPLETED',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  }
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  onToggle,
  className = ''
}) => {
  const config = statusConfig[status]
  const isCompleted = status === 'completed' || status === 'done'

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      className={cn(
        "group flex items-center justify-center gap-3",
        "w-full px-4 py-3",
        "border bg-primary/5",
        "transition-all duration-200",
        config.borderColor,
        className
      )}
      title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("w-1.5 h-1.5", config.dotColor)} />
        <span className={cn(
          "font-mono text-xs tracking-widest",
          config.textColor
        )}>
          {config.label}
        </span>
      </div>

      <div className="opacity-40 group-hover:opacity-100 transition-opacity">
        {isCompleted ? (
          <RotateCcw size={14} strokeWidth={2} className={config.textColor} />
        ) : (
          <Check size={14} strokeWidth={2.5} className={config.textColor} />
        )}
      </div>
    </motion.button>
  )
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = ''
}) => {
  const config = statusConfig[status]

  return (
    <span className={cn(
      "inline-flex items-center gap-2",
      "px-3 py-1.5",
      "border bg-primary/5",
      config.borderColor,
      className
    )}>
      <span className={cn("w-1.5 h-1.5", config.dotColor)} />
      <span className={cn(
        "font-mono text-[10px] tracking-widest",
        config.textColor
      )}>
        {config.label}
      </span>
    </span>
  )
}
