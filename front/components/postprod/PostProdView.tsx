import React, { useState, useMemo, useRef } from 'react'
import {
  Plus, Calendar, Scissors, ChevronDown, Check, Activity, Clock,
  PenLine, Music, Layers, Palette, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostProdTask, PostProdFilters } from '@/types'
import { Card } from '@/components/ui/Card'
import { POST_PROD_CATEGORIES } from '@/constants'
import { useClickOutside } from '@/hooks/useClickOutside'
import { Button } from '@/components/atoms/Button'

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
        <div className="w-14 h-14 bg-[#16181D] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05]">
          <Scissors size={24} className="text-white/40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-white mb-2">Empty Pipeline</h2>
          <p className="text-white/30 mb-8 text-sm">No active tasks found. Add your first task.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={onAddTask}
            leftIcon={<Plus size={18} strokeWidth={2.5} />}
          >
            Add Task
          </Button>
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
                className="group p-5 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#1A1D23] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0F1116] flex items-center justify-center border border-white/[0.05]">
                      <CategoryIcon size={18} className="text-white/50" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">{task.category}</div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs text-white/30 mt-1">
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shrink-0 border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                <div className="mb-5">
                  <h3 className="text-base text-white/90 group-hover:text-white font-medium mb-1.5 transition-colors">{task.title}</h3>
                  <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                    {task.description || "No specific details provided."}
                  </p>
                </div>

                <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveStatusMenuId(isActiveMenu ? null : task.id)
                    }}
                    className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-sm font-medium bg-[#0F1116] text-white/60 border border-white/[0.05] hover:border-white/10 hover:text-white/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'done' ? 'bg-emerald-500' :
                          task.status === 'progress' ? 'bg-primary' :
                            'bg-white/30'
                        }`} />
                      <span className="capitalize">{task.status}</span>
                    </div>
                    <ChevronDown size={16} className={`${isActiveMenu ? 'rotate-180' : ''} transition-transform`} />
                  </button>

                  <AnimatePresence>
                    {isActiveMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 bottom-full mb-2 bg-[#16181D] rounded-xl border border-white/[0.08] p-2 z-50 shadow-xl"
                      >
                        {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateTask?.({ ...task, status: s })
                              setActiveStatusMenuId(null)
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${task.status === s
                                ? 'bg-primary text-white'
                                : 'text-white/60 hover:bg-white/5'
                              }`}
                          >
                            <span className="capitalize">{s}</span>
                            {task.status === s && <Check size={14} />}
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
        <Card
          title={
            <div className="flex items-center gap-3">
              <Scissors size={20} className="text-white/50" />
              <span className="text-lg font-semibold text-white tracking-tight">Tasks</span>
            </div>
          }
        >
          <div className="p-4 space-y-2">
            {filteredTasks.map((task) => {
              const CategoryIcon = getCategoryIcon(task.category)
              const isActiveMenu = activeStatusMenuId === task.id

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask?.(task.id)}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] hover:bg-[#1A1D23] transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0F1116] flex items-center justify-center border border-white/[0.05] shrink-0">
                    <CategoryIcon size={18} className="text-white/50" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base text-white/90 group-hover:text-white font-medium truncate transition-colors">{task.title}</div>
                    <div className="text-sm text-white/40">{task.category}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4">
                    {task.dueDate && (
                      <div className="text-sm text-white/40 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}

                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shrink-0 border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveStatusMenuId(isActiveMenu ? null : task.id)
                      }}
                      className="w-28 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-[#0F1116] text-white/60 border border-white/[0.05] hover:border-white/10 hover:text-white/80 transition-all"
                    >
                      <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' :
                          task.status === 'progress' ? 'bg-primary' :
                            'bg-white/30'
                        }`} />
                      <span className="capitalize">{task.status}</span>
                    </button>

                    <AnimatePresence>
                      {isActiveMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full right-0 mt-2 w-36 bg-[#16181D] rounded-xl border border-white/[0.08] p-2 z-50 shadow-xl"
                        >
                          {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation()
                                onUpdateTask?.({ ...task, status: s })
                                setActiveStatusMenuId(null)
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${task.status === s
                                  ? 'bg-primary text-white'
                                  : 'text-white/60 hover:bg-white/5'
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
        </Card>
      )}
    </div>
  )
})

PostProdView.displayName = 'PostProdView'
