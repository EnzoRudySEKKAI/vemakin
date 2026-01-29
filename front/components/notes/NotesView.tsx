
import React, { useMemo } from 'react';
import { FileText, Calendar, LayoutGrid, Film, StickyNote, Zap, ArrowRight, Paperclip, ChevronRight, CheckCircle2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../utils/animations.ts';
import { Shot, Note, PostProdTask, NotesFilters } from '../../types.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { HoverCard } from '../ui/HoverCard.tsx';
import { formatDateToNumeric } from '../../utils.ts';
import { POST_PROD_CATEGORIES } from '../../constants.ts';

interface NotesViewProps {
 shots: Shot[];
 notes: Note[];
 tasks?: PostProdTask[];
 isAdding: boolean;
 setIsAdding: (val: boolean) => void;
 onAddNote: (note: Partial<Note>) => void;
 onUpdateNote: (note: Note) => void;
 onDeleteNote: (id: string) => void;
 onSelectShot: (id: string) => void;
 onSelectNote: (id: string) => void;
 onSelectTask: (id: string) => void;
 filters: NotesFilters;
 layout?: 'grid' | 'list';
}

export const NotesView: React.FC<NotesViewProps> = React.memo(({
 shots,
 notes,
 tasks = [],
 isAdding,
 setIsAdding,
 onAddNote,
 onUpdateNote,
 onDeleteNote,
 onSelectShot,
 onSelectNote,
 onSelectTask,
 filters,
 layout = 'grid'
}) => {

 const aggregatedNotes = useMemo(() => {
  // 1. Get manually created notes (from store)
  const manualNotes = notes.map(n => ({ ...n, isAuto: false }));

  // 2. Generate"Auto-Notes"from shots that have content in 'generalNotes'
  const shotAutoNotes: (Note & { isAuto: boolean })[] = shots
   .filter(s => s.generalNotes && s.generalNotes.trim().length > 0)
   .map(s => ({
    id: `auto-shot-${s.id}`,
    title: `Scene Memo: ${s.title}`,
    content: s.generalNotes || '',
    createdAt: s.date,
    updatedAt: s.date,
    shotId: s.id,
    attachments: [],
    isAuto: true
   }));

  const combined = [...manualNotes, ...shotAutoNotes].sort((a, b) => {
   const dir = filters.sortDirection === 'asc' ? 1 : -1;
   if (filters.sortBy === 'created') {
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
   }
   if (filters.sortBy === 'alpha') {
    return a.title.localeCompare(b.title) * dir;
   }
   // Default to 'updated'
   return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
  });

  return combined.filter(n => {
   // 1. Search Query
   if (filters.query) {
    const q = filters.query.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    if (!matchesSearch) return false;
   }

   // 2. Date Filter
   if (filters.date && filters.date !== 'All') {
    const noteDate = new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (noteDate !== filters.date) return false;
   }

   // 3. Category Filter
   if (filters.category === 'All') return true;
   if (filters.category === 'Shots') return !!n.shotId || n.isAuto;
   if (filters.category === 'General') return !n.shotId && !n.taskId && !n.isAuto;

   // Pipeline Categories (linked to tasks - implicit if we had task filters, but currently main toggle handles main 3)
   if (n.taskId) {
    const task = tasks.find(t => t.id === n.taskId);
    if (task && task.category === filters.category) return true;
   }

   return false;
  });
 }, [shots, notes, tasks, filters]);

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
   className="space-y-6"
  >
   {/* Notes Container */}
   <div
    className={layout === 'grid' ?"grid grid-cols-1 md:grid-cols-2 gap-4":"flex flex-col gap-2"}
   >
    {aggregatedNotes.map(note => {
     // Contextual Logic
     let ContextIcon = StickyNote;
     let contextLabel ="General Note";

     // Unified Icon Theme
     const themeBg ="bg-gray-50 dark:bg-white/5";
     const themeText ="text-blue-600 dark:text-indigo-400";
     const themeBorder ="border border-gray-100 dark:border-white/5";
     const headerBg ="bg-blue-50/30 dark:bg-indigo-500/5";

     const linkedShot = note.shotId ? shots.find(s => s.id === note.shotId) : null;
     const linkedTask = note.taskId ? tasks.find(t => t.id === note.taskId) : null;

     if (linkedShot || (note as any).isAuto) {
      ContextIcon = Film;
      contextLabel = linkedShot ? `Sequence ${linkedShot.sceneNumber}` :"Shot Auto-Note";
     } else if (linkedTask) {
      const catInfo = POST_PROD_CATEGORIES.find(c => c.label === linkedTask.category);
      contextLabel = `${linkedTask.category} Task`;
      if (catInfo) {
       ContextIcon = catInfo.icon;
      } else {
       ContextIcon = Zap;
      }
     }

     if (layout === 'list') {
      // Placeholder for missing variables, assuming default values or context from parent
      const iconBg = themeBg; // Using themeBg for consistency
      const iconColor = themeText; // Using themeText for consistency
      const activeClass = ''; // No active class by default
      const isActiveMenu = false; // Not an active menu item by default

      return (
       <motion.div key={note.id} variants={itemVariants}>
        <GlassCard
         onClick={() => onSelectNote?.(note.id)}
         className={`px-4 py-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-white/10 rounded-[24px] group border-l-0 shadow-sm cursor-pointer ${activeClass} ${isActiveMenu ? 'bg-white dark:bg-[#2C2C30] z-[20] ring-2 ring-blue-500 dark:ring-indigo-500/10 dark:ring-indigo-400/20' : 'bg-white/90 dark:bg-[#1C1C1E]/90'}`}
        >
         <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-3 rounded-2xl ${themeBg} ${themeText} ${themeBorder} shrink-0 shadow-sm group-hover:scale-105`}>
           <ContextIcon size={20} strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
           <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
             {note.title}
            </h4>
            {/* Assuming 'priority' exists on Note type for this update */}
            {(note as any).priority && (
             <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${(note as any).priority === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-indigo-500/10 border-blue-100 dark:border-indigo-500/20 text-blue-600 dark:text-[#4E47DD]'
              }`}>
              {(note as any).priority}
             </span>
            )}
           </div>
           <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 truncate">{note.content}</p>
          </div>
         </div>

         <div className="flex items-center gap-4 pl-4 border-l border-gray-100 dark:border-white/10 ml-4">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 whitespace-nowrap">
           {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <ChevronRight size={16} className="text-gray-300 dark:text-gray-600"/>
         </div>
        </GlassCard>
       </motion.div>
      );
     }

     return (
      <motion.div key={note.id} variants={itemVariants} className="h-full">
       <HoverCard
        onClick={() => onSelectNote(note.id)}
        blobColor="from-indigo-400 to-indigo-500"
        className="p-0 flex flex-col hover:border-blue-200 dark:hover:border-indigo-400/30 cursor-pointer group bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-black/40 rounded-[32px] h-full min-h-[260px]"
       >
        <div className="flex flex-col h-full">
         <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
           <div className={`p-2.5 rounded-xl ${themeBg} ${themeText} ${themeBorder}`}>
            <ContextIcon size={20} strokeWidth={2.5} />
           </div>
           <span className={`text-[9px] font-semibold ${themeText.replace('text-', 'text-opacity-80 text-')}`}>
            {contextLabel}
           </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{note.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-3">{note.content}</p>
         </div>

         <div className="px-6 pb-6 mt-auto">
          <div className="flex items-center gap-3">
           <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <Calendar size={14} className="opacity-70"/> {formatDateToNumeric(note.updatedAt)}
           </span>
          </div>
         </div>
        </div>
       </HoverCard>
      </motion.div>
     );
    })}
   </div>


   {
    aggregatedNotes.length === 0 && (
     <div className="py-32 flex flex-col items-center justify-center select-none">
      <div className="w-20 h-20 bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[32px] flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6 shadow-sm">
       <Package size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">No notes found</h3>
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-2">Adjust filters to see content in your repository</p>
     </div>
    )
   }
  </motion.div >
 );
});

NotesView.displayName = 'NotesView';
