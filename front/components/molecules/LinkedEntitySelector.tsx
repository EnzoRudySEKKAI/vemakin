import React from 'react'
import { Link as LinkIcon, ChevronDown, Film, Zap } from 'lucide-react'

export type LinkType = 'none' | 'shot' | 'task'

export interface EntityOption {
  id: string
  label: string
  type: 'shot' | 'task'
}

export interface LinkedEntitySelectorProps {
  label?: string
  linkType: LinkType
  onLinkTypeChange: (type: LinkType) => void
  linkedId: string
  onLinkedIdChange: (id: string) => void
  entities: {
    shot?: EntityOption[]
    task?: EntityOption[]
  }
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const LinkedEntitySelector: React.FC<LinkedEntitySelectorProps> = ({
  label = 'Link to',
  linkType,
  onLinkTypeChange,
  linkedId,
  onLinkedIdChange,
  entities,
  placeholder = 'Select an item...',
  hint,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const linkTypes: { value: LinkType; label: string; icon?: React.ElementType }[] = [
    { value: 'none', label: 'Standalone' },
    { value: 'shot', label: 'Scene', icon: Film },
    { value: 'task', label: 'Task', icon: Zap },
  ]

  const availableEntities = linkType !== 'none' ? entities[linkType] || [] : []

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {formatLabel(label)}
        </label>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-red-500">
            *
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex p-1 bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/10">
          {linkTypes.map((type, index) => {
            const Icon = type.icon
            const isActive = linkType === type.value
            
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onLinkTypeChange(type.value)}
                disabled={disabled}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5
                  text-[10px] font-medium uppercase tracking-wider
                  border transition-all
                  ${isActive 
                    ? type.value === 'none' 
                      ? 'bg-white dark:bg-white/10 text-foreground border-gray-300 dark:border-white/20'
                      : type.value === 'shot'
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                  ${index > 0 && !isActive ? 'border-l border-gray-300 dark:border-white/10' : ''}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {Icon && <Icon size={12} />}
                {type.label}
              </button>
            )
          })}
        </div>

        {linkType !== 'none' && (
          <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <LinkIcon size={16} />
            </div>
            <select
              value={linkedId}
              onChange={(e) => onLinkedIdChange(e.target.value)}
              disabled={disabled}
              className={`
                w-full appearance-none
                bg-[#f5f5f5] dark:bg-[#16181D]
                border ${error ? 'border-destructive' : 'border-gray-300 dark:border-white/10'}
                pl-10 pr-10 py-3
                text-sm font-mono
                text-foreground
                focus:outline-none
                ${error ? 'focus:border-destructive' : 'focus:border-primary'}
                disabled:pointer-events-none disabled:opacity-50
                transition-all
                cursor-pointer
              `}
            >
              <option value="" className="bg-white dark:bg-[#0F1116]">
                {placeholder}
              </option>
              {availableEntities.map(entity => (
                <option key={entity.id} value={entity.id} className="bg-white dark:bg-[#0F1116]">
                  {entity.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors">
              <ChevronDown size={16} />
            </div>
          </div>
        )}
      </div>

      {error ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
