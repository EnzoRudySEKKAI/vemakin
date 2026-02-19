import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { HTMLMotionProps } from 'framer-motion'

interface HoverCardProps extends HTMLMotionProps<"div"> {
  blobColor?: string // e.g. "from-primary/70 to-primary"
  showBlob?: boolean
  enableHoverScale?: boolean
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = "",
  blobColor = "from-primary/70 to-primary",
  showBlob = true,
  enableHoverScale = true,
  ...props
}) => {
  return (
    <GlassCard
      className={`
        group relative transition-all duration-300
        ${enableHoverScale ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
        hover:shadow-md shadow-sm
        border-white/20 dark:border-white/5
        ${className}
      `}
      {...props}
    >
      {/* Decorative Background */}
      {showBlob && (
        <div className={`liquid-blob-1 absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${blobColor} opacity-0 group-hover:opacity-20 dark:opacity-0 dark:group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />
      )}

      {/* Content Wrapper to ensure z-index above blob */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </GlassCard>
  )
}
