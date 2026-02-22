import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, StickyNote, Package, Film,
  Clock, PenLine, Scissors, Music, Layers, Palette
} from 'lucide-react'
import { Shot, Equipment, PostProdTask, Note } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

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

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'Script': return <PenLine size={14} />
      case 'Editing': return <Scissors size={14} />
      case 'Sound': return <Music size={14} />
      case 'VFX': return <Layers size={14} />
      case 'Color': return <Palette size={14} />
      default: return <Zap size={14} />
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'default'
    }
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
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {shots.filter(s => s.status === 'pending').length} Shots left
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToShotsView}
                className="text-[10px] h-6 px-2"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {upcomingShots.length > 0 ? (
                  upcomingShots.map((shot) => {
                    const status = getTimelineStatus(shot, shots)
                    const barColor = status === 'done' ? 'bg-primary' : status === 'current' ? 'bg-primary' : 'bg-muted'

                    return (
                      <div
                        key={shot.id}
                        onClick={() => onNavigateToShot(shot)}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1 h-8 rounded-full ${barColor}`} />
                          {shot.startTime && <span className="text-[10px] text-muted-foreground font-mono pr-1">{shot.startTime}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{shot.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(shot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {shot.duration || '5min'}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Film size={20} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming shots</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Equipment Stats */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Equipment</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {inventory.length} Items
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToInventory}
                className="text-[10px] h-6 px-2"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {inventory.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary Rows */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground font-medium">Total gear</div>
                      <div className="text-xl font-semibold leading-none">{inventoryStats.total}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground font-medium">Categories</div>
                      <div className="text-xl font-semibold leading-none">{inventoryStats.topCategories.length}</div>
                    </div>
                  </div>

                  {/* Ownership Breakdown */}
                  <div className="flex gap-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">{inventoryStats.owned} <span className="text-muted-foreground/50">Owned</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{inventoryStats.rented} <span className="text-muted-foreground/50">Rented</span></span>
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] text-muted-foreground font-medium">Top distributions</div>
                    {inventoryStats.topCategories.map((cat, idx) => (
                      <div key={cat.name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                          <span>{cat.name}</span>
                          <span className="font-mono">{cat.count}</span>
                        </div>
                        <Progress 
                          value={(cat.count / inventoryStats.total) * 100} 
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package size={24} className="mb-2 opacity-20" />
                  <p className="text-sm">No equipment found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Tasks</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {tasks.filter(t => t.status !== 'done').length} Tasks left
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToPostProd}
                className="text-[10px] h-6 px-2"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask?.(task.id)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="text-muted-foreground shrink-0">
                        {getTaskIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm leading-tight truncate ${task.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">{task.category}</div>
                      </div>
                      <Badge 
                        variant={getPriorityVariant(task.priority)} 
                        className="text-[10px] shrink-0"
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Zap size={20} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All caught up</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Notes</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {notes.length} Notes
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToNotes}
                className="text-[10px] h-6 px-2"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote?.(note.id)}
                      className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-medium leading-tight">{note.title}</div>
                        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{note.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <StickyNote size={20} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

OverviewView.displayName = 'OverviewView'
