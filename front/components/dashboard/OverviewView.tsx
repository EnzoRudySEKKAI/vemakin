import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, StickyNote, Package, Film,
  Clock, PenLine, Scissors, Music, Layers, Palette
} from 'lucide-react'
import { Shot, Equipment, PostProdTask, Note } from '@/types'
import { DashboardCard } from './DashboardCard'
import { DashboardListItem } from './DashboardListItem'

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
          <DashboardCard
            title="Timeline"
            count={shots.filter(s => s.status === 'pending').length}
            countLabel="Shots left"
            onViewAll={() => onNavigateToShotsView?.() || (window.location.hash = '#/shots')}
          >
            <div className="space-y-2">
              {upcomingShots.length > 0 ? (
                upcomingShots.map((shot) => {
                  const status = getTimelineStatus(shot, shots)
                  const barColor = status === 'done' ? 'bg-primary' : status === 'current' ? 'bg-primary' : 'bg-white/20'

                  return (
                    <DashboardListItem
                      key={shot.id}
                      onClick={() => onNavigateToShot(shot)}
                      leftContent={
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-10 rounded-full ${barColor}`} />
                          {shot.startTime && <span className="text-xs text-white/30 font-mono pr-1">{shot.startTime}</span>}
                        </div>
                      }
                      title={shot.title}
                      subtitle={
                        <span className="flex items-center gap-1.5">
                          {new Date(shot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="opacity-30">•</span>
                          {shot.duration || '5min'}
                        </span>
                      }
                    />
                  )
                })
              ) : (
                <div className="py-12 text-center text-white/20">
                  <Film size={24} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">No upcoming shots</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Equipment Stats */}
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Equipment"
            count={inventory.length}
            countLabel="Items"
            onViewAll={onNavigateToInventory}
          >
            {inventory.length > 0 ? (
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Summary Rows */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#16181D] border border-white/[0.05] group hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="text-xs text-white/40 font-medium">Total gear</div>
                    <div className="text-2xl text-white font-semibold leading-none">{inventoryStats.total}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#16181D] border border-white/[0.05] group hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="text-xs text-white/40 font-medium">Categories</div>
                    <div className="text-2xl text-white font-semibold leading-none">{inventoryStats.topCategories.length}</div>
                  </div>
                </div>

                {/* Ownership Breakdown */}
                <div className="flex gap-6 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-sm text-white/50">{inventoryStats.owned} <span className="text-white/20 ml-1">Owned</span></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="text-sm text-white/50">{inventoryStats.rented} <span className="text-white/20 ml-1">Rented</span></span>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs text-white/40 font-medium tracking-wide uppercase">Top distributions</div>
                  {inventoryStats.topCategories.map((cat, idx) => (
                    <div key={cat.name} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60 font-medium">{cat.name}</span>
                        <span className="text-white/30 font-mono">{cat.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
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
              <div className="flex-1 flex flex-col items-center justify-center text-white/20 py-12">
                <Package size={28} className="mb-3 opacity-30" />
                <p className="text-base font-medium">No equipment found</p>
              </div>
            )}
          </DashboardCard>
        </motion.div>

        {/* Tasks */}
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Tasks"
            count={tasks.filter(t => t.status !== 'done').length}
            countLabel="Tasks left"
            onViewAll={onNavigateToPostProd}
          >
            <div className="space-y-2">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((task) => {
                  const getTaskIcon = () => {
                    switch (task.category) {
                      case 'Script': return <PenLine size={18} />
                      case 'Editing': return <Scissors size={18} />
                      case 'Sound': return <Music size={18} />
                      case 'VFX': return <Layers size={18} />
                      case 'Color': return <Palette size={18} />
                      default: return <Zap size={18} />
                    }
                  }

                  const getPriorityColor = () => {
                    switch (task.priority) {
                      case 'critical':
                      case 'high': return 'bg-red-500/10 text-red-400 border border-red-500/20'
                      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      default: return 'bg-primary/10 text-primary border border-primary/20'
                    }
                  }

                  return (
                    <DashboardListItem
                      key={task.id}
                      onClick={() => onSelectTask?.(task.id)}
                      leftContent={
                        <div className="text-white/40">
                          {getTaskIcon()}
                        </div>
                      }
                      title={
                        <span className={task.status === 'done' ? 'text-white/30 line-through' : 'text-white/90'}>
                          {task.title}
                        </span>
                      }
                      subtitle={task.category}
                      rightContent={
                        <div className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${getPriorityColor()}`}>
                          {task.priority}
                        </div>
                      }
                    />
                  )
                })
              ) : (
                <div className="py-12 text-center text-white/20">
                  <Zap size={24} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">All caught up</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Notes"
            count={notes.length}
            countLabel="Notes"
            onViewAll={onNavigateToNotes}
          >
            <div className="space-y-2">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <DashboardListItem
                    key={note.id}
                    onClick={() => onSelectNote?.(note.id)}
                    title={note.title}
                    subtitle={note.content}
                    className="flex-col !items-start gap-1"
                    rightContent={
                      <div className="text-xs text-white/20 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="py-12 text-center text-white/20">
                  <StickyNote size={24} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">No notes</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

OverviewView.displayName = 'OverviewView'

