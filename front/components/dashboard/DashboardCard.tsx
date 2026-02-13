import React from 'react'
import { Card } from '@/components/ui/Card'

interface DashboardCardProps {
  title: string
  count?: number | string
  countLabel?: string
  onViewAll?: () => void
  children: React.ReactNode
  className?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  countLabel,
  onViewAll,
  children,
  className = ""
}) => {
  const HeaderTitle = (
    <div className="flex items-center gap-3">
      <span className="text-lg font-semibold text-white tracking-tight">{title}</span>
      {(count !== undefined) && (
        <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs text-white/60 font-mono">
          {count} {countLabel}
        </span>
      )}
    </div>
  )

  const ViewAllButton = (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onViewAll?.()
      }}
      className="text-xs text-white/40 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg font-medium flex items-center gap-1"
    >
      View all
    </button>
  )

  return (
    <Card
      title={HeaderTitle}
      headerRight={onViewAll ? ViewAllButton : undefined}
      className={`h-full ${className}`}
    >
      <div className="p-4 h-full flex flex-col">
        {children}
      </div>
    </Card>
  )
}
