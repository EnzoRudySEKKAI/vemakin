import React, { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type CardGridVariant = 'grid' | 'list'

interface CardGridProps<T> {
  items: T[]
  children: (item: T, index: number) => ReactNode
  variant?: CardGridVariant
  columns?: 1 | 2 | 3 | 4
  animate?: boolean
  keyExtractor?: (item: T) => string
  emptyState?: ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg'
}

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const gapMap: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
}

export function CardGrid<T>({
  items,
  children,
  variant = 'grid',
  columns = 2,
  animate = false,
  keyExtractor = (item) => (item as unknown as { id?: string })?.id || String(item),
  emptyState,
  className = '',
  gap = 'md'
}: CardGridProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  if (items.length === 0) {
    return null
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-${gap === 'sm' ? '1' : gap === 'md' ? '2' : '3'} ${className}`}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <ListItemWrapper 
              key={keyExtractor(item)} 
              animate={animate}
              index={index}
            >
              {children(item, index)}
            </ListItemWrapper>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`grid ${columnsMap[columns]} ${gapMap[gap]} ${className}`}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <GridItemWrapper 
            key={keyExtractor(item)} 
            animate={animate}
            index={index}
          >
            {children(item, index)}
          </GridItemWrapper>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface GridItemWrapperProps {
  children: ReactNode
  animate: boolean
  index: number
}

const GridItemWrapper: React.FC<GridItemWrapperProps> = ({ 
  children, 
  animate, 
  index 
}) => {
  if (!animate) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1]
      }}
      layout
    >
      {children}
    </motion.div>
  )
}

const ListItemWrapper: React.FC<GridItemWrapperProps> = ({ 
  children, 
  animate, 
  index 
}) => {
  if (!animate) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{
        duration: 0.2,
        delay: index * 0.03
      }}
      layout
    >
      {children}
    </motion.div>
  )
}

export function CardGridSkeleton({ 
  columns = 2, 
  rows = 3,
  className = '' 
}: { 
  columns?: number
  rows?: number
  className?: string
}) {
  return (
    <div className={`grid ${columnsMap[columns]} gap-4 ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-32"
        />
      ))}
    </div>
  )
}
