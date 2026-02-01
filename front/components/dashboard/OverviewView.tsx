import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Zap, StickyNote, Package,
  ChevronRight, Film, Clock, MapPin, Users,
  ArrowUpRight, AlertCircle, Calendar,
  ListTodo, Grid, CheckCircle2, Check, Plus, Folder,
  PenLine, Scissors, Music, Layers, Palette
} from 'lucide-react';
import { HoverCard } from '../ui/HoverCard';
import { Shot, Equipment, Currency, PostProdTask, Note, User } from '../../types';

interface OverviewViewProps {
  shots: Shot[];
  tasks: PostProdTask[];
  notes: Note[];
  inventory: Equipment[];
  currency: Currency;
  user: User | null;
  projects: string[];
  currentProject: string;
  onSelectProject: (project: string) => void;
  onAddProject: (name: string) => void;
  onAddClick: () => void;
  onNavigateToShot: (shot: Shot) => void;
  onNavigateToShotsView: () => void;
  onNavigateToInventory: () => void;
  onNavigateToPostProd: () => void;
  onNavigateToNotes: () => void;
  onNavigateToSettings: () => void;
  onSelectTask?: (taskId: string) => void;
  onSelectNote?: (noteId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = React.memo(({
  shots,
  tasks,
  notes,
  inventory,
  projects,
  currentProject,
  onSelectProject,
  onAddProject,
  user,
  onNavigateToShot,
  onNavigateToShotsView,
  onNavigateToInventory,
  onNavigateToPostProd,
  onNavigateToNotes,
  onNavigateToSettings,
  onSelectTask,
  onSelectNote
}) => {
  // Data Processing
  // ... existing shots/tasks/notes processing ...
  const upcomingShots = useMemo(() => {
    return shots
      .filter(s => s.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [shots]);

  const nextShot = upcomingShots[0];

  const pendingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (b.priority === 'critical' && a.priority !== 'critical') return 1;
        return 0;
      })
      .slice(0, 3);
  }, [tasks]);

  const recentNotes = useMemo(() => {
    return notes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);
  }, [notes]);

  const inventoryStats = useMemo(() => {
    // Sum quantities instead of counting items for accurate statistics
    const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Group by category with quantities
    const byCategory: Record<string, number> = {};
    inventory.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + (item.quantity || 1);
    });

    // Count unique gear types (categories)
    const gearTypesCount = Object.keys(byCategory).length;

    // Prepare Chart Data (Top 4 Categories + Other)
    const sortedCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a);

    let chartData = sortedCategories.slice(0, 4).map(([name, value], index) => ({
      name,
      value,
      color: [
        '#4E47DD', // Indigo 500
        '#3762E3', // Blue 500
        '#8b5cf6', // Violet 500
        '#ec4899', // Pink 500
      ][index] || '#94a3b8'
    }));

    // Handle"Other"
    const otherCount = sortedCategories.slice(4).reduce((sum, [, count]) => sum + count, 0);
    if (otherCount > 0) {
      chartData.push({ name: 'Other', value: otherCount, color: '#94a3b8' }); // Slate 400
    }

    // Calculate Angles for Donut Chart
    let cumulativeAngle = 0;
    const donutSegments = chartData.map(segment => {
      const startAngle = cumulativeAngle;
      const angle = (segment.value / totalItems) * 360;
      cumulativeAngle += angle;
      return { ...segment, startAngle, angle };
    });

    return { totalItems, gearTypesCount, donutSegments };
  }, [inventory]);

  // Helper to create SVG Arc Path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // Handle edge cases
    if (endAngle - startAngle >= 360) {
      // Full circle - draw as a circle path instead of arc
      return `M ${x} ${y - radius} A ${radius} ${radius} 0 1 1 ${x} ${y + radius} A ${radius} ${radius} 0 1 1 ${x} ${y - radius}`;
    }
    if (endAngle <= startAngle) {
      return ''; // No arc to draw
    }
    
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    // Ensure all values are valid numbers
    const sx = Number(start.x.toFixed(3));
    const sy = Number(start.y.toFixed(3));
    const ex = Number(end.x.toFixed(3));
    const ey = Number(end.y.toFixed(3));
    
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${ex} ${ey}`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const greeting = useMemo(() => {
    // ... existing greeting logic ...
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full pb-32"
    >

      {/* Header / Greeting */}

      <div className="flex flex-col gap-6">

        {/* SECTION 1: INVENTORY (Full Width) */}
        <motion.section variants={itemVariants} className="w-full"onClick={onNavigateToInventory}>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={20} className="text-blue-600 dark:text-[#4E47DD]"/>
              Inventory
            </h2>
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 cursor-pointer hover:underline">
              View all <ChevronRight size={16} />
            </div>
          </div>

          <HoverCard className="p-6 cursor-pointer"blobColor="from-indigo-400 to-indigo-500">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Left Side: Summary Stats */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white">{inventoryStats.totalItems}</h3>
                  <span className="text-lg font-semibold text-gray-400">items</span>
                </div>
                <p className="text-gray-500 font-medium">Total equipment managed in inventory</p>
              </div>

              {/* Right Side: Donut Chart */}
              <div className="w-full md:w-1/2 flex items-center justify-center gap-6">
                {/* Label Left */}
                <div className="text-right hidden sm:block">
                  <span className="block text-5xl font-bold text-gray-900 dark:text-white leading-none mb-1">{inventoryStats.gearTypesCount}</span>
                  <span className="block text-xs font-semibold text-gray-400">Gear types</span>
                </div>
                {/* SVG Donut Chart */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 100 100"className="w-full h-full -rotate-90 transform">
                    {/* Background Circle */}
                    <circle cx="50"cy="50"r="40"fill="transparent"stroke="currentColor"strokeWidth="12"className="text-gray-200 dark:text-white/5"/>

                    {/* Animated Segments */}
                    {inventoryStats.donutSegments.map((segment, i) => (
                      <motion.path
                        key={`${segment.name}-${segment.value}-${i}`}
                        d={describeArc(50, 50, 40, segment.startAngle, segment.startAngle + segment.angle)}
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="12"
                        strokeLinecap="butt"
                        initial={{ pathLength: 1 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease:"easeOut"}}
                      />
                    ))}
                  </svg>
                  {/* Center Text (Optional) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Package size={20} className="text-gray-400 dark:text-[#4E47DD] opacity-50"/>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 min-w-[120px]">
                  {inventoryStats.donutSegments.map(segment => (
                    <div key={segment.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full"style={{ backgroundColor: segment.color }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{segment.name}</span>
                      </div>
                      <span className="font-medium text-gray-500">{Math.round((segment.value / inventoryStats.totalItems) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </HoverCard>
        </motion.section>

        {/* SECTION 2: SHOTS (Full Width) */}
        <motion.section variants={itemVariants} className="w-full">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Film size={20} className="text-blue-600 dark:text-[#4E47DD]"/>
                Next up
              </h2>
              <div className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-indigo-500/10 text-[10px] font-semibold border border-blue-100 dark:border-indigo-500/20 text-blue-600 dark:text-[#4E47DD]">
                {shots.filter(s => s.status === 'pending').length} remaining
              </div>
            </div>
            <button
              onClick={onNavigateToShotsView}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 hover:underline"
            >
              View all <ChevronRight size={16} />
            </button>
          </div>

          {nextShot ? (
            <HoverCard className="p-6"blobColor="from-indigo-400 to-indigo-500">
              {/* Main Next Shot (Clickable) */}
              <div
                onClick={() => onNavigateToShot(nextShot)}
                className="cursor-pointer transition-transform active:scale-[0.99]"
              >
                <div className="relative z-10 flex flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white text-xs font-semibold rounded-lg border border-black/5 dark:border-white/10">
                        Scene {nextShot.sceneNumber}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-white/5 px-2 py-1 rounded-lg">
                        <Calendar size={12} />
                        {formatDate(nextShot.date)}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-white/5 px-2 py-1 rounded-lg">
                        <Clock size={12} />
                        {nextShot.startTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white leading-tight truncate">
                        {nextShot.title}
                      </h3>

                      {/* Gear Info (Mobile Only) */}
                      <div className="flex items-center gap-2 md:hidden shrink-0">
                        <Package size={18} className="text-blue-600 dark:text-[#4E47DD]"/>
                        <span className="text-xs font-semibold text-gray-500">Gear</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white ml-0.5">{nextShot.equipmentIds?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium truncate">
                      <MapPin size={18} className="text-gray-400 shrink-0"/>
                      <span className="truncate">{nextShot.location}</span>
                    </div>
                  </div>

                  {/* Gear Info (Desktop Only) */}
                  <div className="hidden md:flex gap-4 shrink-0 self-start mt-1">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-blue-600 dark:text-[#4E47DD]"/>
                      <span className="text-xs font-semibold text-gray-500">Gear</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white ml-0.5">{nextShot.equipmentIds?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Carousel */}
              {upcomingShots.length > 1 && (
                <div
                  className="mt-8 pt-6 border-t border-gray-200/40 dark:border-white/5 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)'
                  }}
                >
                  {/* Spacer for mask fade */}
                  <div className="min-w-[10px] shrink-0"/>
                  {upcomingShots.slice(1).map((shot) => (
                    <div
                      key={shot.id}
                      onClick={() => onNavigateToShot(shot)}
                      className="min-w-[160px] p-4 rounded-2xl bg-indigo-50/30 dark:bg-white/5 active:bg-indigo-50/60 dark:active:bg-white/10 md:hover:bg-indigo-50/60 md:dark:hover:bg-white/10 border border-indigo-100/50 dark:border-white/5 transition-all flex flex-col gap-2 cursor-pointer active:scale-[0.98] md:hover:-translate-y-1 shadow-sm shrink-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-gray-400">Sc {shot.sceneNumber}</span>
                        <span className="text-[10px] font-semibold text-blue-500 dark:text-indigo-500 dark:text-blue-400 dark:text-indigo-400">{formatDate(shot.date)}</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{shot.title}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock size={10} /> {shot.startTime}
                      </div>
                    </div>
                  ))}
                  {/* Spacer for mask fade */}
                  <div className="min-w-[20px] shrink-0"/>
                </div>
              )}
            </HoverCard>
          ) : (
            <div className="glass-card rounded-[32px] p-12 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center text-gray-500 bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 transition-all duration-300">
              <Film size={32} className="mb-2 opacity-50"/>
              <span className="text-xs">No upcoming shots</span>
            </div>
          )}
        </motion.section>

        {/* SECTION 3: TASKS & NOTES (Split 50/50) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Tasks Widget - Dark Glass / List View */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap size={20} className="text-blue-600 dark:text-[#4E47DD]"/>
                  Pipeline
                </h2>
                <div className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-indigo-500/10 text-[10px] font-semibold border border-blue-100 dark:border-indigo-500/20 text-blue-600 dark:text-[#4E47DD]">
                  {tasks.filter(t => t.status !== 'done').length} pending
                </div>
              </div>
              <div
                onClick={onNavigateToPostProd}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 cursor-pointer hover:underline"
              >
                View all <ChevronRight size={16} />
              </div>
            </div>

            <HoverCard className="p-6 flex flex-col flex-1"blobColor="from-indigo-400 to-indigo-500">
              {/* Task List */}
              <div className="flex-1 space-y-2 z-10">
                {pendingTasks.length > 0 ? pendingTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask?.(task.id)}
                    className="flex items-center gap-3 p-2 rounded-xl active:bg-gray-50 dark:active:bg-white/5 md:hover:bg-gray-50 md:dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center text-blue-600 dark:text-[#4E47DD]">
                      {task.category === 'Script' && <PenLine size={18} />}
                      {task.category === 'Editing' && <Scissors size={18} />}
                      {task.category === 'Sound' && <Music size={18} />}
                      {task.category === 'VFX' && <Layers size={18} />}
                      {task.category === 'Color' && <Palette size={18} />}
                      {!['Script', 'Editing', 'Sound', 'VFX', 'Color'].includes(task.category) && <Zap size={18} />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{task.title}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{task.status === 'todo' ? 'To do' : task.status === 'in_progress' ? 'In progress' : task.status}</span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <CheckCircle2 size={32} className="mb-2 opacity-50"/>
                    <span className="text-xs">All caught up</span>
                  </div>
                )}
              </div>
            </HoverCard>
          </div>

          {/* Notes Widget - Light Glass */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <StickyNote size={20} className="text-blue-600 dark:text-[#4E47DD]"/>
                  Notes
                </h2>
                <div className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-indigo-500/10 text-[10px] font-semibold border border-blue-100 dark:border-indigo-500/20 text-blue-600 dark:text-[#4E47DD]">
                  {notes.length} notes
                </div>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); onNavigateToNotes(); }}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-[#4E47DD] cursor-pointer hover:underline"
              >
                View all <ChevronRight size={16} />
              </div>
            </div>

            <HoverCard className="p-6 flex flex-col flex-1"blobColor="from-indigo-400 to-indigo-500">
              <div className="flex-1 space-y-2 z-10">
                {recentNotes.length > 0 ? (
                  <div className="space-y-1">
                    {recentNotes.map(note => (
                      <div
                        key={note.id}
                        onClick={() => onSelectNote?.(note.id)}
                        className="p-3 rounded-2xl border border-transparent active:bg-gray-50 dark:active:bg-white/5 md:hover:bg-gray-50 md:dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1">{note.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 py-4">
                    <StickyNote size={32} className="mb-2 opacity-50"/>
                    <span className="text-xs">No recent notes</span>
                  </div>
                )}
              </div>
            </HoverCard>
          </div>

        </motion.div>

      </div >
    </motion.div >
  );
});

OverviewView.displayName = 'OverviewView';
