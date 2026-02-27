import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export interface FormConflictWarningProps {
  conflict?: unknown
  message?: string
  suggestion?: string
  onDismiss?: () => void
  className?: string
}

export const FormConflictWarning: React.FC<FormConflictWarningProps> = ({
  conflict,
  message = 'Conflict detected',
  suggestion,
  onDismiss,
  className = ''
}) => {
  if (!conflict) return null

  return (
    <div className={`
      flex items-start gap-3 p-4 
      bg-orange-500/10 border border-orange-500/30
      text-orange-400
      ${className}
    `}>
      <AlertTriangle size={20} strokeWidth={2} className="shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {message}
        </p>
        {suggestion && (
          <p className="text-[10px] font-mono tracking-wider text-orange-300 mt-1">
            {suggestion}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 hover:bg-orange-500/20 rounded transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
