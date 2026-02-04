
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Plus, Sun, Moon } from 'lucide-react';
import { Shot, ShotLayout, Equipment } from '../../types.ts';
import { calculateEndTime, timeToMinutes, getSunTimes } from '../../utils.ts';
import { pageVariants } from '../../utils/animations.ts';
import { TravelIndicator } from '../ui/TravelIndicator.tsx';
import { GearTransition } from '../ui/GearTransition.tsx';
import { ShotCard } from './ShotCard.tsx';

interface ShotsViewProps {
 groupedShots: Record<string, Shot[]>;
 dates: string[];
 shotLayout: ShotLayout;
 onShotClick: (s: Shot) => void;
 onToggleStatus: (id: string) => void;
 onToggleEquipment: (shotId: string, equipmentId: string) => void;
 onAddShot: () => void;
 onDateInView?: (date: string) => void;
 inventory: Equipment[];
 searchQuery?: string;
 statusFilter?: 'all' | 'pending' | 'done';
}

export const ShotsView: React.FC<ShotsViewProps> = React.memo(({
 groupedShots,
 dates,
 shotLayout,
 onShotClick,
 onToggleStatus,
 onToggleEquipment,
 onAddShot,
 onDateInView,
 inventory,
 searchQuery = '',
 statusFilter = 'all'
}) => {
 const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
 const observerRef = useRef<IntersectionObserver | null>(null);

 const filteredGroupedShots = useMemo(() => {
  // Start with all shots
  const filtered: Record<string, Shot[]> = {};

  Object.keys(groupedShots).forEach(date => {
   let shots = groupedShots[date];

   // 1. Apply Search Filter
   if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    shots = shots.filter(s =>
     s.title.toLowerCase().includes(lowerQuery) ||
     s.location.toLowerCase().includes(lowerQuery) ||
     s.sceneNumber.toLowerCase().includes(lowerQuery)
    );
   }

   // 2. Apply Status Filter
   if (statusFilter !== 'all') {
    shots = shots.filter(s => s.status === statusFilter);
   }

   // Only add date group if it has matching shots
   if (shots.length > 0) {
    filtered[date] = shots;
   }
  });
  return filtered;
 }, [groupedShots, searchQuery, statusFilter]);

 const totalShots = useMemo(() => {
  return Object.values(filteredGroupedShots).reduce((acc: number, shots: Shot[]) => acc + shots.length, 0);
 }, [filteredGroupedShots]);

 useEffect(() => {
  if (!onDateInView) return;

  observerRef.current = new IntersectionObserver((entries) => {
   const activeEntry = entries.find(entry => entry.isIntersecting);

   if (activeEntry && activeEntry.target.id) {
    onDateInView(activeEntry.target.id);
   }
  }, {
   root: null,
   rootMargin: '-180px 0px -75% 0px',
   threshold: 0
  });

  const sections = document.querySelectorAll('.date-section');
  sections.forEach(section => observerRef.current?.observe(section));

  return () => {
   if (observerRef.current) {
    observerRef.current.disconnect();
   }
  };
 }, [onDateInView, filteredGroupedShots]);

 const handleToggleChecklist = (id: string) => {
  setExpandedChecklist(prev => prev === id ? null : id);
 };

 if (totalShots === 0) {
   return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] w-full overflow-hidden px-6 select-none">
    <div className="w-24 h-24 bg-white dark:bg-[#2C2C30] rounded-[32px] shadow-xl shadow-blue-100 dark:shadow-indigo-900/20/50 dark:shadow-none flex items-center justify-center mb-8 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400">
     <Film size={40} strokeWidth={1.5} />
    </div>
    <div className="text-center max-w-sm">
     <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      {searchQuery || statusFilter !== 'all' ?"No matches found":"Empty timeline"}
     </h3>
     <p className="text-sm font-medium text-gray-400 dark:text-gray-500 leading-relaxed mb-8">
      {searchQuery || statusFilter !== 'all' ?"Try adjusting your filters to find the scene you're looking for.":"The set is quiet. Begin your production by scheduling the first scene for your project."}
     </p>
     <button
      onClick={onAddShot}
      className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 dark:bg-indigo-600 dark:bg-blue-600 dark:bg-indigo-600 text-white text-white rounded-2xl font-semibold text-[11px] shadow-xl shadow-blue-100 dark:shadow-indigo-900/20 dark:shadow-blue-500 dark:shadow-indigo-500/20 hover:bg-blue-700 dark:bg-indigo-700 dark:hover:bg-blue-700 dark:bg-indigo-700 active:scale-95 transition-all"
     >
      <Plus size={18} strokeWidth={3} />
      Schedule first shot
     </button>
    </div>
   </div>
  );
 }

 return (
  <div>


   {dates.map((dateString) => {
    const dayShots = filteredGroupedShots[dateString];
    if (!dayShots?.length) return null;

    const { sunrise, sunset } = getSunTimes(dateString);

    return (
     <div
      key={dateString}
      id={dateString}
      className="date-section mb-8 last:mb-0 scroll-mt-[180px]"
     >
      <div className="flex items-center gap-3 px-2 py-2 mb-4">
       <div className="h-px flex-1 bg-gray-300/50 dark:bg-white/10"/>
       <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{dateString}</span>
        <div className="flex items-center gap-4">
         <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400">
          <Sun size={16} strokeWidth={2.5} /> {sunrise}
         </div>
         <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 dark:text-indigo-500 dark:text-blue-400 dark:text-indigo-400">
          <Moon size={16} strokeWidth={2.5} /> {sunset}
         </div>
        </div>
       </div>
       <div className="h-px flex-1 bg-gray-300/50 dark:bg-white/10"/>
      </div>

      <div className={`relative ${shotLayout === 'list' ? 'space-y-2' : 'space-y-2'}`}>
       {dayShots.map((shot, idx) => {
        let availableMinutes = undefined;
        // Only calculate travel if we are looking at the full list (no search filter affecting order heavily)
        if (idx > 0 && !searchQuery && statusFilter === 'all') {
         const prevShot = dayShots[idx - 1];
         const prevEndTime = calculateEndTime(prevShot.startTime, prevShot.duration);
         availableMinutes = timeToMinutes(shot.startTime) - timeToMinutes(prevEndTime);
        }

        return (
         <div
          key={`${shot.id}`}
         >
          {idx > 0 && shotLayout !== 'list' && !searchQuery && statusFilter === 'all' && (
           <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 mt-4 mb-4">
            <TravelIndicator
             from={dayShots[idx - 1].location}
             to={shot.location}
             availableMinutes={availableMinutes}
            />
            <GearTransition
             prevShot={dayShots[idx - 1]}
             nextShot={shot}
             inventory={inventory}
            />
           </div>
          )}

          <ShotCard
           shot={shot}
           shotLayout={shotLayout}
           isChecklistOpen={expandedChecklist === shot.id}
           onShotClick={onShotClick}
           onToggleStatus={onToggleStatus}
           onToggleChecklist={handleToggleChecklist}
           onToggleEquipment={onToggleEquipment}
           inventory={inventory}
          />
         </div>
        );
       })}
      </div>
     </div>
    );
   })}
  </div>
 );
});

ShotsView.displayName = 'ShotsView';
