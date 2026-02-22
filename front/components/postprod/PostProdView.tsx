import React, { useState, useMemo, useRef } from 'react'
import {
  Plus, Calendar, Scissors, ChevronDown, Check, Activity, Clock,
  PenLine, Music, Layers, Palette, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostProdTask, PostProdFilters } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { POST_PROD_CATEGORIES } from '@/constants'
import { useClickOutside } from '@/hooks/useClickOutside'

interface PostProdViewProps {
  tasks: PostProdTask[]
  onAddTask?: () => void
  onUpdateTask?: (task: PostProdTask) => void
  onSelectTask?: (taskId: string) => void
  filters: PostProdFilters
  layout?: 'grid' | 'list'
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Script': return PenLine
    case 'Editing': return Scissors
    case 'Sound': return Music
    case 'VFX': return Layers
    case 'Color': return Palette
    default: return Zap
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-500/20 text-red-400'
    case 'high': return 'bg-orange-500/20 text-orange-400'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400'
    default: return 'bg-primary/20 text-primary'
  }
}

export const PostProdView: React.FC<PostProdViewProps> = React.memo(({
  tasks,
  onAddTask,
  onUpdateTask,
  onSelectTask,
  filters,
  layout = 'grid'
}) => {
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  useClickOutside(statusMenuRef, () => setActiveStatusMenuId(null), activeStatusMenuId !== null)

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      if (filters.category !== 'All' && t.category !== filters.category) return false
      const q = filters.searchQuery.toLowerCase()
      const matchesSearch = t.title.toLowerCase().includes(q)
      const matchesStatus = filters.status === 'All' || t.status.toLowerCase() === filters.status.toLowerCase()
      const matchesPriority = filters.priority === 'All' || t.priority.toLowerCase() === filters.priority.toLowerCase()
      return matchesSearch && matchesStatus && matchesPriority
    })

    const statusOrder = { todo: 0, progress: 1, review: 2, done: 3 }
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

    return result.sort((a, b) => {
      const dir = filters.sortDirection === 'asc' ? 1 : -1

      if (filters.sortBy === 'status') return (statusOrder[a.status] - statusOrder[b.status]) * dir
      if (filters.sortBy === 'priority') return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir
      if (filters.sortBy === 'dueDate') {
        const timeA = new Date(a.dueDate || '9999-12-31').getTime()
        const timeB = new Date(b.dueDate || '9999-12-31').getTime()
        return (timeA - timeB) * dir
      }
      if (filters.sortBy === 'alpha') return a.title.localeCompare(b.title) * dir

      return 0
    })
  }, [tasks, filters])

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] w-full overflow-hidden px-6 select-none">
        <div className="w-14 h-14 border border-white/10 bg-[#0a0a0a]/40 flex items-center justify-center mb-6">
          <Scissors size={24} className="text-muted-foreground" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2 font-mono  tracking-wider">Empty Pipeline</h2>
          <p className="text-muted-foreground mb-8 text-sm font-mono">No active tasks found. Add your first task.</p>
          <TerminalButton variant="primary" onClick={onAddTask}>
            Add Task
          </TerminalButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const CategoryIcon = getCategoryIcon(task.category)
            const isActiveMenu = activeStatusMenuId === task.id

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask?.(task.id)}
                className="group p-4 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f5f5f5] dark:bg-[#16181D] flex items-center justify-center border border-gray-300 dark:border-white/10">
                      <CategoryIcon size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-mono  tracking-wider text-muted-foreground">{task.category}</div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <Calendar size={10} />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-mono  tracking-wider shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm text-foreground font-medium mb-1">{task.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description || "No specific details provided."}
                  </p>
                </div>

                <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveStatusMenuId(isActiveMenu ? null : task.id)
                    }}
                    className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-mono  tracking-wider bg-[#f5f5f5] dark:bg-[#16181D] text-muted-foreground border border-gray-300 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${task.status === 'done' ? 'bg-emerald-500' :
                          task.status === 'progress' ? 'bg-primary' :
                            'bg-muted-foreground'
                        }`} />
                      <span className="capitalize">{task.status}</span>
                    </div>
                    <ChevronDown size={14} className={`${isActiveMenu ? 'rotate-180' : ''} transition-transform`} />
                  </button>

                  <AnimatePresence>
                    {isActiveMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 bottom-full mb-2 bg-[#fafafa] dark:bg-[#16181D] border border-gray-300 dark:border-white/10 p-1.5 z-50"
                      >
                        {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateTask?.({ ...task, status: s })
                              setActiveStatusMenuId(null)
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-mono  tracking-wider mb-0.5 flex items-center justify-between transition-colors ${task.status === s
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-secondary'
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
              </div>
            )
          })}
        </div>
      ) : (
        <TerminalCard header="Tasks">
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const CategoryIcon = getCategoryIcon(task.category)
              const isActiveMenu = activeStatusMenuId === task.id

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask?.(task.id)}
                className="flex items-center gap-4 p-3 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 bg-[#f5f5f5] dark:bg-[#16181D] flex items-center justify-center border border-gray-300 dark:border-white/10 shrink-0">
                    <CategoryIcon size={16} className="text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{task.title}</div>
                    <div className="text-xs font-mono  tracking-wider text-muted-foreground">{task.category}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}

                    <span className={`px-2 py-0.5 text-[10px] font-mono  tracking-wider shrink-0 ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>

                  <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveStatusMenuId(isActiveMenu ? null : task.id)
                      }}
                      className="w-24 py-2 px-2 flex items-center justify-center gap-2 text-xs font-mono  tracking-wider bg-[#f5f5f5] dark:bg-[#16181D] text-muted-foreground border border-gray-300 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all"
                    >
                      <div className={`w-1.5 h-1.5 ${task.status === 'done' ? 'bg-emerald-500' :
                          task.status === 'progress' ? 'bg-primary' :
                            'bg-muted-foreground'
                        }`} />
                      <span className="capitalize">{task.status}</span>
                    </button>

                    <AnimatePresence>
                      {isActiveMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full right-0 mt-2 w-32 bg-[#fafafa] dark:bg-[#16181D] border border-gray-300 dark:border-white/10 p-1.5 z-50"
                        >
                          {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation()
                                onUpdateTask?.({ ...task, status: s })
                                setActiveStatusMenuId(null)
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-mono  tracking-wider mb-0.5 transition-colors ${task.status === s
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-[#f5f5f5] dark:hover:bg-white/5'
                                }`}
                            >
                              <span className="capitalize">{s}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
