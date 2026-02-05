import React from 'react'
import { Text } from '@/components/atoms/Text'
import { typography } from '@/design-system'

interface MetricBadgeProps {
  label: string
  value: number | string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const colorStyles = {
  default: 'text-gray-900 dark:text-white',
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-orange-600 dark:text-orange-400',
  danger: 'text-red-600 dark:text-red-400'
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  color = 'default',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Text variant="label" color="muted" className="leading-none mb-0.5">
        {label}
      </Text>
      <span className={`${typography.size.lg} ${typography.weight.semibold} leading-none ${colorStyles[color]}`}>
        {value}
      </span>
    </div>
  )
}

interface MetricsGroupProps {
  metrics: Array<{
    label: string
    value: number | string
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  }>
  className?: string
}

export const MetricsGroup: React.FC<MetricsGroupProps> = ({
  metrics,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-4 px-2 ${className}`}>
      {metrics.map((metric, index) => (
        <React.Fragment key={metric.label}>
          <MetricBadge
            label={metric.label}
            value={metric.value}
            color={metric.color}
          />
          {index < metrics.length - 1 && (
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
