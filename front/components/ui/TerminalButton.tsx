import * as React from "react"
import { cn } from "@/lib/utils"

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  showArrow?: boolean
}

export const TerminalButton = React.forwardRef<HTMLButtonElement, TerminalButtonProps>(
  ({ children, variant = "primary", size = "default", className, showArrow = true, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      default: "px-4 py-2 text-xs",
      lg: "px-6 py-3 text-sm",
    }

    const variantClasses = {
      primary: cn(
        "border-primary text-primary",
        "hover:bg-primary hover:text-primary-foreground",
        "dark:border-primary dark:text-primary",
        "dark:hover:bg-primary dark:hover:text-primary-foreground"
      ),
      secondary: cn(
        "border-border text-muted-foreground",
        "hover:border-primary/50 hover:text-foreground",
        "dark:border-white/20 dark:text-white/70",
        "dark:hover:border-white/40 dark:hover:text-white"
      ),
      ghost: cn(
        "border-transparent text-muted-foreground",
        "hover:border-border hover:text-foreground",
        "dark:border-transparent dark:text-white/50",
        "dark:hover:border-white/10 dark:hover:text-white"
      ),
    }

    return (
      <button
        ref={ref}
        className={cn(
          "group relative font-mono uppercase tracking-wider border transition-all duration-200",
          sizeClasses[size],
          variantClasses[variant],
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">
          {children}
          {showArrow && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">{">"}</span>
          )}
        </span>
      </button>
    )
  }
)
TerminalButton.displayName = "TerminalButton"
