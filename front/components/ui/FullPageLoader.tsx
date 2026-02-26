import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

interface FullPageLoaderProps {
  className?: string
}

export function FullPageLoader({ className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex flex-col items-center justify-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn("size-4 animate-spin", className)}
      role="status"
      aria-label="Loading"
    />
  )
}
