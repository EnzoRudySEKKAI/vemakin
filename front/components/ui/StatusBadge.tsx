import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  status?: "online" | "offline" | "warning" | "error"
  className?: string
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ text, status = "online", className, ...props }, ref) => {
    const statusColors = {
      online: "bg-emerald-500",
      offline: "bg-gray-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5",
          "border border-primary/30 bg-primary/5",
          "dark:border-primary/30 dark:bg-primary/5",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 animate-pulse",
            statusColors[status]
          )}
        />
        <span className="font-mono text-[10px] text-primary tracking-widest uppercase">
          {text}
        </span>
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"
