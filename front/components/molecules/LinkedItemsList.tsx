import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react'
import { TerminalCard } from '../ui/TerminalCard'
import { TerminalButton } from '../ui/TerminalButton'
import { EmptyState, EmptyStateProps } from './EmptyState'

export type LinkedItemsListVariant = 'list' | 'grid'

export interface LinkedItem {
  id: string
  title: string
  subtitle?: string
  icon?: LucideIcon
  badge?: string | number
}

export interface LinkedItemsListProps {
  title: string
  items?: LinkedItem[]
  onItemClick?: (id: string) => void
  variant?: LinkedItemsListVariant
  headerRight?: React.ReactNode
  emptyMessage?: string
  emptyIcon?: EmptyStateProps['icon']
  expandable?: boolean
  expandedContent?: Record<string, React.ReactNode>
  getInitialExpanded?: (item: LinkedItem) => boolean
  gridCols?: 1 | 2 | 3
  className?: string
}

export const LinkedItemsList: React.FC<LinkedItemsListProps> = ({
  title,
  items = [],
  onItemClick,
  variant = 'list',
  headerRight,
  emptyMessage = 'No items',
  emptyIcon,
  expandable = false,
  expandedContent = {},
  getInitialExpanded = () => false,
  gridCols = 1,
  className = ''
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => 
    new Set(items.filter(getInitialExpanded).map(item => item.id))
  )

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }[gridCols]

  const renderItem = (item: LinkedItem) => {
    const Icon = item.icon
    const isExpanded = expandedIds.has(item.id)
    const hasExpandedContent = expandable && expandedContent[item.id]

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => hasExpandedContent ? toggleExpanded(item.id) : onItemClick?.(item.id)}
          className={`
            w-full flex items-center justify-between p-3 transition-all group
            ${isExpanded 
              ? 'bg-primary/5 border border-primary/30' 
              : 'hover:bg-secondary/50 border border-transparent'
            }
            ${!expandable ? 'cursor-pointer' : ''}
          `}
        >
          <div className="flex items-center gap-4 min-w-0">
            {Icon && (
              <div className={`
                p-2.5 transition-all
                ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground group-hover:text-primary'}
              `}>
                <Icon size={16} strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className={`
                text-sm font-medium truncate transition-colors
                ${isExpanded ? 'text-primary' : 'text-foreground group-hover:text-primary'}
              `}>
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[10px] font-mono tracking-wider text-muted-foreground mt-0.5">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {item.badge !== undefined && (
              <span className={`
                text-[10px] font-mono tracking-wider px-2 py-0.5 border transition-all
                ${isExpanded 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-secondary border-border text-muted-foreground'
                }
              `}>
                {item.badge}
              </span>
            )}
            {hasExpandedContent && (
              <div className={`
                transition-transform duration-300
                ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground'}
              `}>
                <ChevronDown size={14} strokeWidth={2} />
              </div>
            )}
            {!hasExpandedContent && onItemClick && (
              <ChevronRight size={12} className="text-border group-hover:text-primary transition-colors" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {hasExpandedContent && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-3 pt-1">
                {expandedContent[item.id]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const renderGridItem = (item: LinkedItem) => {
    const Icon = item.icon

    return (
      <button
        key={item.id}
        onClick={() => onItemClick?.(item.id)}
        className="cursor-pointer flex flex-col items-start text-left p-5 bg-secondary/30 border border-border hover:border-primary/30 transition-all group"
      >
        <div className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </div>
        {item.subtitle && (
          <div className="text-[11px] text-muted-foreground truncate w-full font-mono">
            {item.subtitle}
          </div>
        )}
        {Icon && (
          <div className="mt-3 p-2 bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
            <Icon size={14} />
          </div>
        )}
      </button>
    )
  }

  return (
    <TerminalCard 
      header={title} 
      headerRight={headerRight}
      className={className}
    >
      {items.length > 0 ? (
        variant === 'grid' ? (
          <div className={`grid ${gridColsClass} gap-4`}>
            {items.map(renderGridItem)}
          </div>
        ) : (
          <div className="space-y-1">
            {items.map(renderItem)}
          </div>
        )
      ) : (
        <EmptyState 
          icon={emptyIcon || (() => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ))}
          message={emptyMessage}
        />
      )}
    </TerminalCard>
  )
}
