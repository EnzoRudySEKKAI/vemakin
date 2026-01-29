
import React, { useState, useMemo, useRef } from 'react';
import {
  Search, Plus, Calendar, Scissors, ChevronDown, Check, Activity, Clock, LayoutGrid, List as ListIcon, Trash2, Edit2, AlertCircle, CheckCircle2, MoreHorizontal, Flag, Hash, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../../utils/animations.ts';
import { PostProdTask, PostProdFilters } from '../../types.ts';
import { HoverCard } from '../ui/HoverCard.tsx';
import { POST_PROD_CATEGORIES } from '../../constants.ts';
import { useClickOutside } from '../../hooks/useClickOutside';
import { getPriorityColor, getStatusColor } from '../../utils.ts';

interface PostProdViewProps {
  tasks: PostProdTask[];
  onAddTask?: () => void;
  onUpdateTask?: (task: PostProdTask) => void;
  onSelectTask?: (taskId: string) => void;
  filters: PostProdFilters; // Receives global filters
  layout?: 'grid' | 'list';
}

export const PostProdView: React.FC<PostProdViewProps> = React.memo(({
  tasks,
  onAddTask,
  onUpdateTask,
  onSelectTask,
  filters,
  layout = 'grid'
}) => {
  const [activeStatusMenuId, setActiveStatusMenuId] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Use shared hook for click outside detection
  useClickOutside(statusMenuRef, () => setActiveStatusMenuId(null), activeStatusMenuId !== null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return CheckCircle2;
      case 'progress': return Activity;
      case 'review': return Flag;
      default: return Circle;
    }
  };

  const activeCategoryData = POST_PROD_CATEGORIES.find(c => c.label === filters.category);
  const ActiveIcon = activeCategoryData ? activeCategoryData.icon : LayoutGrid;

  // Filter tasks for the list view based on all active filters
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      // Allow if category is All OR matches specific category
      if (filters.category !== 'All' && t.category !== filters.category) return false;
      const q = filters.searchQuery.toLowerCase();
      const matchesSearch = t.title.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'All' || t.status.toLowerCase() === filters.status.toLowerCase();
      const matchesPriority = filters.priority === 'All' || t.priority.toLowerCase() === filters.priority.toLowerCase();
      const matchesDate = filters.date === 'All' || t.dueDate === filters.date;
      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });

    const statusOrder = { todo: 0, progress: 1, review: 2, done: 3 };
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return result.sort((a, b) => {
      const dir = filters.sortDirection === 'asc' ? 1 : -1;

      if (filters.sortBy === 'status') return (statusOrder[a.status] - statusOrder[b.status]) * dir;
      if (filters.sortBy === 'priority') return (priorityOrder[a.priority] - priorityOrder[b.priority]) * dir;
      if (filters.sortBy === 'dueDate') {
        const timeA = new Date(a.dueDate || '9999-12-31').getTime();
        const timeB = new Date(b.dueDate || '9999-12-31').getTime();
        return (timeA - timeB) * dir;
      }
      if (filters.sortBy === 'created') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      if (filters.sortBy === 'modified') return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      if (filters.sortBy === 'alpha') return a.title.localeCompare(b.title) * dir;

      return 0;
    });
  }, [tasks, filters]);

  // Calculate stats directly from filteredTasks to ensure it respects ALL filters including status
  const pendingCount = filteredTasks.filter(t => t.status !== 'done').length;
  const totalCount = filteredTasks.length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div
          className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2'}`}
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, idx) => {
              const categoryData = POST_PROD_CATEGORIES.find(c => c.label === task.category);
              const CategoryIcon = categoryData?.icon || Activity;
              const StatusIcon = getStatusIcon(task.status);

              const isActiveMenu = activeStatusMenuId === task.id;
              // Ensure z-index is handled for the dropdown overlap
              const activeClass = isActiveMenu ? 'z-[2000] relative ring-2 ring-blue-500 dark:ring-[#4E47DD]/40 !transition-none' : 'z-0 relative';

              if (layout === 'grid') {
                return (
                  <HoverCard
                    key={task.id}
                    onClick={() => onSelectTask?.(task.id)}
                    className={`p-6 flex flex-col justify-between bg-white dark:bg-[#1C1C1E] rounded-[28px] group overflow-visible ${activeClass}`}
                    blobColor="from-blue-400 to-indigo-500"
                  >
                    <div>
                      {/* Header: Icon on Left, Meta on Right */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-indigo-400 shrink-0 border border-gray-100 dark:border-white/5">
                            <CategoryIcon size={20} strokeWidth={2} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{task.category}</span>
                              <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold capitalize ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </div>
                            </div>
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Calendar size={10} strokeWidth={2.5} />
                                <span className="text-[10px] font-medium">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Body: Title + Description */}
                      <div className="mb-6 pl-1">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-2 capitalize transition-colors duration-200">
                          {task.title}
                        </h4>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-2">
                          {task.description || "No specific details provided for this task."}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Status Controller */}
                    <div className="relative mt-auto" ref={isActiveMenu ? statusMenuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStatusMenuId(isActiveMenu ? null : task.id);
                        }}
                        className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-black uppercase tracking-wider bg-gray-50 dark:bg-[#2C2C30] text-gray-500 dark:text-gray-400 border border-transparent hover:bg-gray-100 dark:hover:bg-[#3A3A3E] transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span>{task.status}</span>
                        </div>
                        <ChevronDown size={14} className={`${isActiveMenu ? 'rotate-180 transition-transform' : 'transition-transform'}`} />
                      </button>

                      {/* Floating Dropdown */}
                      {isActiveMenu && (
                        <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-[2001] animate-in fade-in slide-in-from-bottom-2 duration-200">
                          {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateTask?.({ ...task, status: s });
                                setActiveStatusMenuId(null);
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-[10px] font-bold capitalize tracking-wide mb-0.5 flex items-center justify-between transition-colors duration-200 ${task.status === s
                                ? 'bg-blue-600 dark:bg-[#4E47DD] text-white'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                            >
                              {s}
                              {task.status === s && <CheckCircle2 size={12} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </HoverCard>
                );
              }

              // List Layout Implementation
              return (
                <HoverCard
                  key={task.id}
                  onClick={() => onSelectTask?.(task.id)}
                  className={`px-6 py-4 flex items-center rounded-[24px] cursor-pointer group overflow-visible ${isActiveMenu ? 'z-[2000] relative bg-white dark:bg-[#1C1C1E] ring-2 ring-blue-50 dark:ring-[#4E47DD]/40' : 'bg-white/80 dark:bg-[#1C1C1E]/80 z-0 relative'}`}
                  blobColor="from-blue-400 to-indigo-500 dark:from-indigo-400 dark:to-[#4E47DD]"
                  enableHoverScale={true}
                >
                  <div className="w-full flex items-center justify-between gap-8">
                    {/* Left: Icon + Title (Expanded & Wide) */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-indigo-400 shrink-0 border border-gray-100 dark:border-white/5">
                        <CategoryIcon size={20} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors capitalize truncate">
                          {task.title}
                        </h4>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                          {task.description || "No specific details provided."}
                        </p>
                      </div>
                    </div>

                    {/* Right Group: Badges & Controls */}
                    <div className="flex items-center gap-6 shrink-0 ml-auto mr-2">
                      {/* Category Badge */}
                      <div className="hidden lg:flex items-center">
                        <span className="w-28 flex justify-center px-3 py-1.5 bg-gray-50 dark:bg-white/5 backdrop-blur-md text-gray-400 dark:text-gray-400 text-[10px] font-black uppercase rounded-xl border border-gray-100 dark:border-white/5 whitespace-nowrap tracking-wider">
                          {task.category}
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <div className="hidden md:flex items-center">
                        <span className={`w-28 flex justify-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="hidden sm:flex items-center w-24 justify-center">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize flex items-center gap-1.5">
                          <Calendar size={12} strokeWidth={2.5} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                        </span>
                      </div>

                      {/* Status Controller */}
                      <div className="flex items-center gap-1">
                        <div className="relative" ref={isActiveMenu ? statusMenuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusMenuId(isActiveMenu ? null : task.id);
                            }}
                            className="w-32 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-white/5 flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="text-xs font-black uppercase tracking-wider">{task.status}</span>
                          </button>

                          {isActiveMenu && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white/95 backdrop-blur-xl border border-white rounded-[20px] shadow-xl z-[5000] p-1.5 animate-in fade-in zoom-in-95 duration-200">
                              {(['todo', 'progress', 'review', 'done'] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateTask?.({ ...task, status: s });
                                    setActiveStatusMenuId(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold capitalize tracking-wide mb-1 transition-all duration-200 ${task.status === s
                                    ? 'bg-blue-600 dark:bg-[#4E47DD] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-[#4E47DD]'
                                    }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-white dark:bg-[#2C2C30] rounded-[32px] shadow-xl shadow-blue-100 dark:shadow-indigo-900/20 dark:shadow-none flex items-center justify-center text-blue-600 dark:text-[#4E47DD] mb-8 border border-white/20 dark:border-white/5">
                <ActiveIcon size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white mb-2 uppercase">Empty Pipeline</h3>
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 leading-relaxed max-w-sm mb-8">
                No active tasks found in the {filters.category === 'All' ? 'Pipeline' : filters.category} stage. Add your first task to get started.
              </p>

              <button
                onClick={() => onAddTask?.()}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 dark:bg-[#4E47DD] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-indigo-900/20 hover:bg-blue-700 dark:hover:bg-[#5A54E6] active:scale-95 transition-all"
              >
                <Plus size={18} strokeWidth={3} />
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
});

PostProdView.displayName = 'PostProdView';
