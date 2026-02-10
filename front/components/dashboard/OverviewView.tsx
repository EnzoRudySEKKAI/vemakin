import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, StickyNote, Package, Film,
  Clock, PenLine, Scissors, Music, Layers, Palette
} from 'lucide-react'
import { Card, SimpleCard } from '@/components/ui/Card'
import { Shot, Equipment, PostProdTask, Note } from '@/types'

interface OverviewViewProps {
  shots: Shot[]
  tasks: PostProdTask[]
  notes: Note[]
  inventory: Equipment[]
  onNavigateToShot: (shot: Shot) => void
  onNavigateToShotsView: () => void
  onNavigateToInventory: () => void
  onNavigateToPostProd: () => void
  onNavigateToNotes: () => void
  onSelectTask?: (taskId: string) => void
  onSelectNote?: (noteId: string) => void
}

// Timeline item status colors
const getTimelineStatus = (shot: Shot, shots: Shot[]): 'done' | 'current' | 'pending' => {
  const pendingShots = shots.filter(s => s.status === 'pending')
  const sortedPending = pendingShots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const isNext = sortedPending[0]?.id === shot.id
  const isDone = shot.status === 'done'

  if (isDone) return 'done'
  if (isNext) return 'current'
  return 'pending'
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  shots,
  tasks,
  notes,
  inventory,
  onNavigateToShot,
  onNavigateToShotsView,
  onNavigateToInventory,
  onNavigateToPostProd,
  onNavigateToNotes,
  onSelectTask,
  onSelectNote,
}) => {
  const ViewAllButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="text-[10px] text-white/20 hover:text-white/50 transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md font-medium"
    >
      View all
    </button>
  )

  const upcomingShots = useMemo(() => {
    return shots
      .filter(s => s.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4)
  }, [shots])

  const pendingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1
        if (b.priority === 'critical' && a.priority !== 'critical') return 1
        return 0
      })
      .slice(0, 4)
  }, [tasks])

  const recentNotes = useMemo(() => {
    return notes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
  }, [notes])

  const inventoryStats = useMemo(() => {
    const total = inventory.length
    const owned = inventory.filter(i => i.isOwned).length
    const rented = total - owned

    // Get top categories
    const categoryCounts: Record<string, number> = {}
    inventory.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    })

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))

    return { total, owned, rented, topCategories }
  }, [inventory])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold">Timeline</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-white/40 font-mono">
                  {shots.filter(s => s.status === 'pending').length} Shots left
                </span>
              </div>
            }
            className="h-full"
            headerRight={<ViewAllButton onClick={() => onNavigateToShotsView?.() || (window.location.hash = '#/shots')} />}
          >
            <div className="p-4 space-y-2">
              {upcomingShots.length > 0 ? (
                upcomingShots.map((shot) => {
                  const status = getTimelineStatus(shot, shots)
                  const barColor = status === 'done' ? 'bg-emerald-500' : status === 'current' ? 'bg-indigo-500' : 'bg-white/20'

                  return (
                    <div
                      key={shot.id}
                      onClick={() => onNavigateToShot(shot)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1 h-8 rounded-full ${barColor}`} />
                        {shot.startTime && <span className="text-[10px] text-white/30 font-mono pr-1">{shot.startTime}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{shot.title}</div>
                        <div className="text-xs text-white/30">
                          {new Date(shot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {shot.duration || '5min'}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-white/30">
                  <Film size={20} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming shots</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Equipment Stats */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold">Equipment</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-white/40 font-mono">
                  {inventory.length} Items
                </span>
              </div>
            }
            className="h-full"
            headerRight={<ViewAllButton onClick={onNavigateToInventory} />}
          >
            <div className="p-4 h-full flex flex-col">
              {inventory.length > 0 ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Summary Rows */}
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] group hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between">
                      <div className="text-[10px] text-white/40 font-medium">Total gear</div>
                      <div className="text-xl text-white font-semibold leading-none">{inventoryStats.total}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] group hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between">
                      <div className="text-[10px] text-white/40 font-medium">Categories</div>
                      <div className="text-xl text-white font-semibold leading-none">{inventoryStats.topCategories.length}</div>
                    </div>
                  </div>

                  {/* Ownership Breakdown */}
                  <div className="flex gap-4 px-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-xs text-white/50">{inventoryStats.owned} <span className="text-white/20">Owned</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-xs text-white/50">{inventoryStats.rented} <span className="text-white/20">Rented</span></span>
                    </div>
                  </div>

                  {/* Top Categories - Distributed vertically */}
                  <div className="flex-1 flex flex-col justify-center space-y-3 pt-2">
                    <div className="text-[10px] text-white/40 font-medium mb-1">Top distributions</div>
                    {inventoryStats.topCategories.map((cat, idx) => (
                      <div key={cat.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] text-white/40">
                          <span>{cat.name}</span>
                          <span className="font-mono">{cat.count}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.count / inventoryStats.total) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                            className="h-full bg-white/20 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                  <Package size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">No equipment found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold">Tasks</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-white/40 font-mono">
                  {tasks.filter(t => t.status !== 'done').length} Tasks left
                </span>
              </div>
            }
            className="h-full"
            headerRight={<ViewAllButton onClick={onNavigateToPostProd} />}
          >
            <div className="p-4 space-y-2">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => {
                  const getTaskIcon = () => {
                    switch (task.category) {
                      case 'Script': return <PenLine size={14} />
                      case 'Editing': return <Scissors size={14} />
                      case 'Sound': return <Music size={14} />
                      case 'VFX': return <Layers size={14} />
                      case 'Color': return <Palette size={14} />
                      default: return <Zap size={14} />
                    }
                  }

                  const getPriorityColor = () => {
                    switch (task.priority) {
                      case 'critical':
                      case 'high': return 'bg-red-500/20 text-red-400'
                      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
                      default: return 'bg-blue-500/20 text-blue-400'
                    }
                  }

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask?.(task.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                    >
                      <div className="text-white/40 shrink-0">
                        {getTaskIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm leading-tight truncate ${task.status === 'done' ? 'text-white/30 line-through' : 'text-white/80'}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-white/30">{task.category}</div>
                      </div>
                      <div className={`text-[10px] w-14 text-center px-2 py-0.5 rounded shrink-0 ${getPriorityColor()}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-white/30">
                  <Zap size={20} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All caught up</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold">Notes</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-white/40 font-mono">
                  {notes.length} Notes
                </span>
              </div>
            }
            className="h-full"
            headerRight={<ViewAllButton onClick={onNavigateToNotes} />}
          >
            <div className="p-4 space-y-2">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote?.(note.id)}
                    className="p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm text-white/80 font-medium leading-tight">{note.title}</div>
                      <div className="text-[10px] text-white/20 whitespace-nowrap">
                        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-xs text-white/30 line-clamp-2">{note.content}</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-white/30">
                  <StickyNote size={20} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

OverviewView.displayName = 'OverviewView'
