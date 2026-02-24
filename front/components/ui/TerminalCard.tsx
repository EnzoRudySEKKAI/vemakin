import * as React from "react"
import { cn } from "@/lib/utils"

interface TerminalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  headerRight?: React.ReactNode
  className?: string
  contentClassName?: string
}

export const TerminalCard = React.forwardRef<HTMLDivElement, TerminalCardProps>(
  ({ children, header, headerRight, className, contentClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-gray-300 dark:border-white/10 bg-transparent",
          className
        )}
        {...props}
      >
        {(header || headerRight) && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-300 dark:border-white/10">
            {header && (
              <span className="font-mono text-xs  tracking-widest text-muted-foreground">
                {header}
              </span>
            )}
            {headerRight && <div className="flex items-center">{headerRight}</div>}
          </div>
        )}
        <div className={cn("p-2", contentClassName)}>{children}</div>
      </div>
    )
  }
)
TerminalCard.displayName = "TerminalCard"

interface TerminalCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const TerminalCardHeader = React.forwardRef<HTMLDivElement, TerminalCardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-4 py-1.5 border-b border-gray-300 dark:border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TerminalCardHeader.displayName = "TerminalCardHeader"

interface TerminalCardTitleProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  className?: string
}

export const TerminalCardTitle = React.forwardRef<HTMLSpanElement, TerminalCardTitleProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-mono text-xs  tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)
TerminalCardTitle.displayName = "TerminalCardTitle"

interface TerminalCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const TerminalCardContent = React.forwardRef<HTMLDivElement, TerminalCardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} {...props} className={cn("", className)}>
      {children}
    </div>
  )
)
TerminalCardContent.displayName = "TerminalCardContent"
