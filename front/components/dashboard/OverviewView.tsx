import React, { useMemo, memo } from 'react'
import { motion, Variants } from 'framer-motion'
import {
  Zap, StickyNote, Package, Film,
  PenLine, Scissors, Music, Layers, Palette
} from 'lucide-react'
import { Shot, Equipment, PostProdTask, Note, HubCardType } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'

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
  hubCardOrder: HubCardType[]
}

interface TimelineCardProps {
  shots: Shot[]
  upcomingShots: Shot[]
  onNavigateToShot: (shot: Shot) => void
  onNavigateToShotsView: () => void
  itemVariants: Variants
}

interface EquipmentCardProps {
  inventory: Equipment[]
  inventoryStats: {
    total: number
    owned: number
    rented: number
    topCategories: { name: string; count: number }[]
  }
  onNavigateToInventory: () => void
  itemVariants: Variants
}

interface TasksCardProps {
  tasks: PostProdTask[]
  pendingTasks: PostProdTask[]
  onSelectTask?: (taskId: string) => void
  onNavigateToPostProd: () => void
  itemVariants: Variants
}

interface NotesCardProps {
  notes: Note[]
  recentNotes: Note[]
  onSelectNote?: (noteId: string) => void
  onNavigateToNotes: () => void
  itemVariants: Variants
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
    case 'high': return 'text-red-400 border-red-400/30 bg-red-400/10'
    case 'medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    default: return 'text-primary border-primary/30 bg-primary/10'
  }
}

// Card components defined OUTSIDE OverviewView to have stable references
const TimelineCard = memo<TimelineCardProps>(({
  shots,
  upcomingShots,
  onNavigateToShot,
  onNavigateToShotsView,
  itemVariants
}) => (
  <motion.div variants={itemVariants} layout="position">
    <TerminalCard 
      className="h-full"
      header={`Timeline`}
      headerRight={
        <TerminalButton 
          variant="ghost" 
          size="sm"
          onClick={onNavigateToShotsView}
          showArrow={false}
        >
          View all
        </TerminalButton>
      }
    >
      <div className="space-y-3">
        {upcomingShots.length > 0 ? (
          upcomingShots.map((shot) => (
            <div
              key={shot.id}
              onClick={() => onNavigateToShot(shot)}
              className="flex items-center gap-3 p-3 border border-gray-300 hover:border-primary/50 transition-all cursor-pointer bg-[#fafafa] dark:bg-white/5 dark:border-white/10 dark:hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-primary" />
                {shot.startTime && (
                  <span className="text-[10px] font-mono text-muted-foreground">{shot.startTime}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{shot.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {new Date(shot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}_{shot.duration || '5min'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
            <Film size={20} className="mb-2 opacity-50" />
            <p className="text-sm font-mono">No upcoming shots</p>
          </div>
        )}
      </div>
    </TerminalCard>
  </motion.div>
))
TimelineCard.displayName = 'TimelineCard'

const EquipmentCard = memo<EquipmentCardProps>(({
  inventory,
  inventoryStats,
  onNavigateToInventory,
  itemVariants
}) => (
  <motion.div variants={itemVariants} layout="position">
    <TerminalCard 
      className="h-full"
      header={`Equipment // ${inventory.length} items`}
      headerRight={
        <TerminalButton 
          variant="ghost" 
          size="sm"
          onClick={onNavigateToInventory}
          showArrow={false}
        >
          View all
        </TerminalButton>
      }
    >
      <div className="h-full">
        {inventory.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 border border-gray-300 flex items-center justify-between bg-[#fafafa] dark:bg-white/5 dark:border-white/10">
                <span className="text-sm font-mono text-muted-foreground">Total</span>
                <span className="font-semibold">{inventoryStats.total}</span>
              </div>
              <div className="p-2 border border-gray-300 flex items-center justify-between bg-[#fafafa] dark:bg-white/5 dark:border-white/10">
                <span className="text-sm font-mono text-muted-foreground">Categories</span>
                <span className="font-semibold">{inventoryStats.topCategories.length}</span>
              </div>
            </div>

            <div className="flex gap-4 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-mono text-muted-foreground">Owned:{inventoryStats.owned}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Rented:{inventoryStats.rented}</span>
              </div>
            </div>

            <div className="space-y-3 pb-0.5">
              <div className="text-[12px] font-mono text-muted-foreground">Top categories</div>
              {inventoryStats.topCategories.map((cat) => (
                <div key={cat.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                    <span>{cat.name.toUpperCase()}</span>
                    <span>{cat.count}</span>
                  </div>
                  <div className="h-1 w-full bg-muted/30 dark:bg-white/10">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(cat.count / inventoryStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
            <Package size={24} className="mb-2 opacity-20" />
            <p className="text-sm font-mono">No equipment found</p>
          </div>
        )}
      </div>
    </TerminalCard>
  </motion.div>
))
EquipmentCard.displayName = 'EquipmentCard'

const TasksCard = memo<TasksCardProps>(({
  tasks,
  pendingTasks,
  onSelectTask,
  onNavigateToPostProd,
  itemVariants
}) => (
  <motion.div variants={itemVariants} layout="position">
    <TerminalCard 
      className="h-full"
      header={`Tasks // ${tasks.filter(t => t.status !== 'done').length} pending`}
      headerRight={
        <TerminalButton 
          variant="ghost" 
          size="sm"
          onClick={onNavigateToPostProd}
          showArrow={false}
        >
          View all
        </TerminalButton>
      }
    >
      <div className="space-y-3">
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask?.(task.id)}
              className="flex items-center gap-3 p-3 border border-gray-300 hover:border-primary/50 transition-all cursor-pointer bg-[#fafafa] dark:bg-white/5 dark:border-white/10 dark:hover:border-primary/50"
            >
              <div className="text-muted-foreground shrink-0">
                {getTaskIcon(task.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm leading-tight truncate ${task.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                  {task.title}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">{task.category.toUpperCase()}</div>
              </div>
              <div className={`text-[10px] px-2 py-0.5 border font-mono shrink-0 ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
            <Zap size={20} className="mb-2 opacity-50" />
            <p className="text-sm font-mono">All tasks complete</p>
          </div>
        )}
      </div>
    </TerminalCard>
  </motion.div>
))
TasksCard.displayName = 'TasksCard'

const NotesCard = memo<NotesCardProps>(({
  notes,
  recentNotes,
  onSelectNote,
  onNavigateToNotes,
  itemVariants
}) => (
  <motion.div variants={itemVariants} layout="position">
    <TerminalCard 
      className="h-full"
      header={`Notes // ${notes.length} entries`}
      headerRight={
        <TerminalButton 
          variant="ghost" 
          size="sm"
          onClick={onNavigateToNotes}
          showArrow={false}
        >
          View all
        </TerminalButton>
      }
    >
      <div className="space-y-3">
        {recentNotes.length > 0 ? (
          recentNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote?.(note.id)}
              className="p-3 border border-gray-300 hover:border-primary/50 transition-all cursor-pointer bg-[#fafafa] dark:bg-white/5 dark:border-white/10 dark:hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium leading-tight">{note.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                  {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">{note.content}</div>
            </div>
        ))
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
            <StickyNote size={20} className="mb-2 opacity-50" />
            <p className="text-sm font-mono">No notes</p>
          </div>
        )}
      </div>
    </TerminalCard>
  </motion.div>
))
NotesCard.displayName = 'NotesCard'

// Static card component mapping - never recreates
const cardComponents: Record<HubCardType, React.FC<any>> = {
  timeline: TimelineCard,
  equipment: EquipmentCard,
  tasks: TasksCard,
  notes: NotesCard
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
  hubCardOrder,
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

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }), [])

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }), [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hubCardOrder.map((cardType) => {
          const CardComponent = cardComponents[cardType]
          const cardProps = {
            itemVariants,
            ...(cardType === 'timeline' && {
              shots,
              upcomingShots,
              onNavigateToShot,
              onNavigateToShotsView
            }),
            ...(cardType === 'equipment' && {
              inventory,
              inventoryStats,
              onNavigateToInventory
            }),
            ...(cardType === 'tasks' && {
              tasks,
              pendingTasks,
              onSelectTask,
              onNavigateToPostProd
            }),
            ...(cardType === 'notes' && {
              notes,
              recentNotes,
              onSelectNote,
              onNavigateToNotes
            })
          }
          return <CardComponent key={cardType} {...cardProps} />
        })}
      </div>
    </motion.div>
  )
}

OverviewView.displayName = 'OverviewView'