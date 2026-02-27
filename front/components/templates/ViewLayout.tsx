import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ViewFilters, ViewHeader, type ViewLayout } from './ViewFilters'
import { CardGrid } from './CardGrid'
import { EmptyState } from './EmptyState'
import { LucideIcon } from 'lucide-react'

export interface ViewLayoutProps<T> {
  title?: string
  subtitle?: string
  count?: number
  items: T[]
  filters?: {
    config?: ViewFiltersProps['config']
    values: ViewFiltersProps['filters']
    onChange: (updates: Record<string, unknown>) => void
  }
  layoutToggle?: {
    value: ViewLayout
    onChange: (layout: ViewLayout) => void
  }
  addButton?: {
    label: string
    onClick: () => void
  }
  emptyState?: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  children: (items: T[]) => ReactNode
  keyExtractor?: (item: T) => string
  className?: string
}

export interface ViewFiltersProps {
  config?: FilterConfigItem[]
  filters: {
    query?: string
    category?: string
    status?: string
    priority?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }
  onFilterChange: (updates: Record<string, unknown>) => void
  layoutToggle?: {
    value: ViewLayout
    onChange: (layout: ViewLayout) => void
  }
  addButton?: {
    label: string
    onClick: () => void
  }
  className?: string
}

interface FilterConfigItem {
  type: 'search' | 'select' | 'multiselect' | 'sort' | 'date'
  field?: string
  label?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

export function ViewLayout<T>({
  title,
  subtitle,
  count,
  items,
  filters,
  layoutToggle,
  addButton,
  emptyState,
  children,
  keyExtractor = (item) => (item as unknown as { id?: string })?.id || String(item),
  className = ''
}: ViewLayoutProps<T>) {
  const hasFilters = filters || layoutToggle || addButton
  const isEmpty = items.length === 0

  if (isEmpty && emptyState) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={className}
      >
        {(title || subtitle || addButton) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
                {title}
                {count !== undefined && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({count})
                  </span>
                )}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
          variant="default"
          size="lg"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {(title || subtitle || hasFilters) && (
        <div className="mb-6 space-y-4">
          {title && (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
                {title}
                {count !== undefined && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({count})
                  </span>
                )}
              </h1>
              {addButton && (
                <button
                  onClick={addButton.onClick}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-mono tracking-wider hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  {addButton.label}
                </button>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground font-mono">
              {subtitle}
            </p>
          )}
          
          {filters && (
            <ViewFilters
              config={filters.config}
              filters={filters.values}
              onFilterChange={filters.onChange}
              layoutToggle={layoutToggle}
              addButton={addButton}
            />
          )}
        </div>
      )}

      {children(items)}
    </motion.div>
  )
}

export function SimpleCardGrid<T>({
  items,
  columns = 2,
  animate = true,
  keyExtractor = (item) => (item as unknown as { id?: string })?.id || String(item),
  emptyState,
  renderItem,
  className = ''
}: {
  items: T[]
  columns?: 1 | 2 | 3 | 4
  animate?: boolean
  keyExtractor?: (item: T) => string
  emptyState?: ReactNode
  renderItem: (item: T) => ReactNode
  className?: string
}) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  if (items.length === 0) {
    return null
  }

  return (
    <CardGrid
      items={items}
      columns={columns}
      animate={animate}
      keyExtractor={keyExtractor}
      className={className}
    >
      {(item) => renderItem(item)}
    </CardGrid>
  )
}
