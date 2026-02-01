import React from 'react'
import { motion } from 'framer-motion'
import { Check, RotateCcw } from 'lucide-react'
import { Text } from '../atoms/Text'

export type StatusType = 'pending' | 'completed' | 'in-progress' | 'done'

interface StatusToggleProps {
  status: StatusType
  onToggle: () => void
  className?: string
}

const statusConfig: Record<StatusType, { label: string; color: string; dotColor: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-[#3762E3]/5 dark:bg-[#4E47DD]/10 border-[#3762E3]/20 dark:border-[#4E47DD]/30 text-[#3762E3] dark:text-[#4E47DD]',
    dotColor: 'bg-[#3762E3] dark:bg-[#4E47DD] animate-pulse shadow-[0_0_8px_rgba(55,98,227,0.4)]'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400',
    dotColor: 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400',
    dotColor: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
  },
  done: {
    label: 'Completed',
    color: 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400',
    dotColor: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
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
        <Text variant="title" color={isCompleted ? 'success' : 'primary'} className="!text-base">
          {config.label}
        </Text>
      </div>
      
      <div className="opacity-40 group-hover:opacity-100 transition-opacity">
        {isCompleted ? (
          <RotateCcw size={16} />
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
