import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button, Text, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
  iconColor?: 'blue' | 'orange' | 'indigo' | 'gray'
}

/**
 * Shared empty state component for consistent messaging across views
 * Used when lists/grids have no items to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  iconColor = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 border-blue-100 dark:border-indigo-500/20',
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    gray: 'bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-500/20'
  }

  const iconClass = colorClasses[iconColor]

  return (
    <div className="col-span-full py-24 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className={`w-20 h-20 ${radius.full} shadow-xl flex items-center justify-center mb-8 border ${iconClass}`}>
        <Icon size={40} strokeWidth={2.5} />
      </div>
      <Text variant="h3">
        {title}
      </Text>
      {subtitle && (
        <Text variant="caption" color="muted" className="mt-2">
          {subtitle}
        </Text>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
          size="lg"
          className="mt-8"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
