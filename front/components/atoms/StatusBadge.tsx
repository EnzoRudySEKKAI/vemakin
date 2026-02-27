import React from 'react'
import { LucideIcon } from 'lucide-react'

export type StatusBadgeVariant = 'status' | 'priority' | 'ownership' | 'generic'
export type StatusValue = 'todo' | 'progress' | 'review' | 'done' | 'pending' | 'critical' | 'high' | 'medium' | 'low' | 'owned' | 'rented' | string

interface StatusBadgeProps {
  variant?: StatusBadgeVariant
  value: StatusValue
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  done: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  progress: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
  review: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  todo: { bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border' },
  pending: { bg: 'bg-secondary', text: 'text-muted-foreground', border: 'border-border' },
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
  owned: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
  rented: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
}

const statusLabels: Record<string, string> = {
  todo: 'To do',
  progress: 'Progress',
  review: 'In review',
  done: 'Done',
  pending: 'Pending',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  owned: 'Owned',
  rented: 'Rented',
}

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: { container: 'px-1.5 py-0.5', text: 'text-[9px]' },
  md: { container: 'px-2 py-0.5', text: 'text-[10px]' },
  lg: { container: 'px-3 py-1', text: 'text-xs' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'generic',
  value,
  icon: Icon,
  size = 'md',
  className = ''
}) => {
  const normalizedValue = value?.toLowerCase() || ''
  const colors = statusColors[normalizedValue] || statusColors.todo
  const label = statusLabels[normalizedValue] || value
  const sizeStyle = sizeStyles[size]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizeStyle.container}
        ${colors.bg} ${colors.text}
        border ${colors.border}
        font-mono tracking-wider
        ${sizeStyle.text}
        ${className}
      `}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} strokeWidth={2.5} />}
      <span className="capitalize">{label}</span>
    </span>
  )
}

export const getStatusColor = (variant: StatusBadgeVariant, value: string): string => {
  const normalizedValue = value?.toLowerCase() || ''
  return statusColors[normalizedValue]?.text || 'text-muted-foreground'
}

export const getStatusBgColor = (variant: StatusBadgeVariant, value: string): string => {
  const normalizedValue = value?.toLowerCase() || ''
  return statusColors[normalizedValue]?.bg || 'bg-secondary'
}
