import React from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { Text, Button, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

export type StatusType = 'pending' | 'completed' | 'in-progress' | 'done'

interface StatusToggleProps {
  status: StatusType
  onToggle: () => void
  className?: string
}

const statusConfig: Record<StatusType, { label: string; color: string; dotColor: string; variant: 'default' | 'accent' | 'success' | 'warning' | 'danger' }> = {
  pending: {
    label: 'Pending',
    color: 'bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 text-primary',
    dotColor: 'bg-primary animate-pulse shadow-[0_0_8px_rgba(55,98,227,0.4)]',
    variant: 'default'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-primary/5 border-primary/20 text-primary dark:text-primary',
    dotColor: 'bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]',
    variant: 'accent'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400',
    dotColor: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]',
    variant: 'success'
  },
  done: {
    label: 'Completed',
    color: 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400',
    dotColor: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]',
    variant: 'success'
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
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        group flex items-center justify-center gap-3 
        px-5 py-3 rounded-2xl border 
        transition-all duration-300 w-full
        ${config.color}
        ${className}
      `}
      title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
        <Text variant="h3" color={isCompleted ? 'success' : 'primary'}>
          {config.label}
        </Text>
      </div>
      
      <div className="opacity-40 group-hover:opacity-100 transition-opacity">
        {isCompleted ? (
          <RotateCcw size={16} strokeWidth={2.5} />
        ) : (
          <Check size={16} strokeWidth={3} />
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
    <span className={`
      inline-flex items-center gap-2 
      px-3 py-1.5 rounded-xl text-xs font-bold
      border
      ${config.color}
      ${className}
    `}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  )
}
