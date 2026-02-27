import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, ChevronDown, Check, Scissors } from 'lucide-react'
import { PostProdTask, PostProdFilters } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { POST_PROD_CATEGORIES } from '@/constants'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useViewFilters } from '@/hooks/useViewFilters'
import { CardItem } from '@/components/molecules/CardItem'
import { CardGrid } from '@/components/molecules/CardGrid'
import { EmptyState } from '@/components/molecules/EmptyState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CategoryIcon, getCategoryIcon } from '@/components/atoms/CategoryIcon'

interface PostProdViewProps {
  tasks: PostProdTask[]
  onAddTask?: () => void
  onUpdateTask?: (task: PostProdTask) => void
  onSelectTask?: (taskId: string) => void
  filters: PostProdFilters
  layout?: 'grid' | 'list'
  gridColumns?: 2 | 3
}

export const PostProdView: React.FC<PostProdViewProps> = React.memo(({
  tasks,
  onAddTask,
  onUpdateTask,
  onSelectTask,
  filters,
  layout = 'grid',
  gridColumns = 2
}) => {
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useClickOutside(statusMenuRef, () => setActiveStatusMenuId(null), activeStatusMenuId !== null)

  const { filteredData } = useViewFilters({
    data: tasks,
    initialFilters: {
      query: filters.searchQuery,
      category: filters.category,
      status: filters.status,
      priority: filters.priority,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection
    }
  })

  const categoryOptions = POST_PROD_CATEGORIES.map(c => ({ value: c.label, label: c.label }))

  if (filteredData.length === 0) {
    return (
      <div className="centered-empty px-6 select-none">
        <EmptyState
          icon={Scissors}
          title="Empty pipeline"
          description="No active tasks found. Add your first task."
          action={{ label: 'Add Task', onClick: onAddTask! }}
          variant="default"
          size="lg"
        />
      </div>
    )
  }

  const renderStatusDropdown = (task: PostProdTask, isListView: boolean = false) => {
    const isActiveMenu = activeStatusMenuId === task.id

    return (
      <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setActiveStatusMenuId(isActiveMenu ? null : task.id)
          }}
          className={`
            flex items-center justify-between gap-2 text-xs font-mono tracking-wider 
            bg-[#f5f5f5] dark:bg-[#16181D] text-muted-foreground 
            border border-gray-300 dark:border-white/10 hover:border-primary/30 
            dark:hover:border-primary/30 transition-all
            ${isListView ? 'w-24 py-2 px-2' : 'w-full py-2.5 px-3'}
          `}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'progress' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            <span className="capitalize">{task.status}</span>
          </div>
          <ChevronDown size={14} className={`${isActiveMenu ? 'rotate-180' : ''} transition-transform`} />
        </button>

        <AnimatePresence>
          {isActiveMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute left-0 right-0 top-full mt-2 bg-[#fafafa] dark:bg-[#16181D] border border-gray-300 dark:border-white/10 p-1.5 z-[100] ${isListView ? 'right-0 w-32' : ''}`}
            >
              {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateTask?.({ ...task, status: s })
                    setActiveStatusMenuId(null)
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono tracking-wider mb-0.5 flex items-center justify-between transition-colors ${
                    task.status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="capitalize">{s}</span>
                  {task.status === s && <Check size={12} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const renderCard = (task: PostProdTask) => {
    const CategoryIconComponent = getCategoryIcon(task.category)

    return (
      <CardItem onClick={() => onSelectTask?.(task.id)}>
        <CardItem.Header>
          <CardItem.Icon icon={CategoryIconComponent} />
          <StatusBadge variant="priority" value={task.priority} />
        </CardItem.Header>
        
        <CardItem.Content>
          <CardItem.Title>{task.title}</CardItem.Title>
          <CardItem.Subtitle>{task.category}</CardItem.Subtitle>
          <CardItem.Description lines={2}>
            {task.description || "No specific details provided."}
          </CardItem.Description>
        </CardItem.Content>
        
        <CardItem.Footer>
          <CardItem.Meta icon={Calendar}>
            {task.dueDate 
              ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'No due date'
            }
          </CardItem.Meta>
          {renderStatusDropdown(task)}
        </CardItem.Footer>
      </CardItem>
    )
  }

  return (
    <div className="space-y-4 overflow-visible pb-32">
      {layout === 'grid' ? (
        <CardGrid
          items={filteredData}
          columns={gridColumns as 1 | 2 | 3 | 4}
          keyExtractor={(task) => task.id}
        >
          {(task) => renderCard(task)}
        </CardGrid>
      ) : (
        <TerminalCard header="Tasks">
          <div className="space-y-2">
            {filteredData.map((task) => {
              const CategoryIconComponent = getCategoryIcon(task.category)

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask?.(task.id)}
                  className="flex items-center gap-4 p-3 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CardItem.Icon icon={CategoryIconComponent} />

                  <div className="flex-1 min-w-0">
                    <CardItem.Title>{task.title}</CardItem.Title>
                    <CardItem.Subtitle>{task.category}</CardItem.Subtitle>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    <CardItem.Meta icon={Calendar}>
                      {task.dueDate 
                        ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'No due date'
                      }
                    </CardItem.Meta>
                    <StatusBadge variant="priority" value={task.priority} />
                  </div>

                  {renderStatusDropdown(task, true)}
                </div>
              )
            })}
          </div>
        </TerminalCard>
      )}
    </div>
  )
})

PostProdView.displayName = 'PostProdView'
