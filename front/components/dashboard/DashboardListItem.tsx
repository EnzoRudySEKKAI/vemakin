import React from 'react'

interface DashboardListItemProps {
  leftContent?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  rightContent?: React.ReactNode
  onClick?: () => void
  className?: string
}

export const DashboardListItem: React.FC<DashboardListItemProps> = ({
  leftContent,
  title,
  subtitle,
  rightContent,
  onClick,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#1A1D23] transition-all cursor-pointer ${className}`}
    >
      {leftContent && (
        <div className="shrink-0 flex items-center justify-center">
          {leftContent}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="text-base text-white/90 group-hover:text-white font-medium truncate leading-tight transition-colors">{title}</div>
        {subtitle && <div className="text-sm text-white/40 group-hover:text-white/60 truncate leading-tight transition-colors">{subtitle}</div>}
      </div>

      {rightContent && (
        <div className="shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  )
}
