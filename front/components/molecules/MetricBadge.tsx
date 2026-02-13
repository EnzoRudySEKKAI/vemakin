import React from 'react'

interface MetricBadgeProps {
  label: string
  value: number | string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const colorStyles = {
  default: 'text-white/60',
  primary: 'text-primary',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-red-400'
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  color = 'default',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="text-[10px] text-white/30 uppercase tracking-wider leading-none mb-1">
        {label}
      </span>
      <span className={`text-lg font-semibold leading-none ${colorStyles[color]}`}>
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
    <div className={`flex items-center gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <React.Fragment key={metric.label}>
          <MetricBadge
            label={metric.label}
            value={metric.value}
            color={metric.color}
          />
          {index < metrics.length - 1 && (
            <div className="w-px h-6 bg-white/[0.05]" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default MetricBadge
