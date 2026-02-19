
import React from 'react';
import { Clock, MapPin, CheckCircle2, Film, Check, ListChecks, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Shot, ShotLayout, Equipment } from '../../types.ts';
import { calculateEndTime } from '../../utils.ts';
import { GlassCard } from '../ui/GlassCard.tsx';
import { HoverCard } from '../ui/HoverCard';

interface ShotCardProps {
 shot: Shot;
 shotLayout: ShotLayout;
 isChecklistOpen: boolean;
 onShotClick: (s: Shot) => void;
 onToggleStatus: (id: string) => void;
 onToggleChecklist: (id: string) => void;
 onToggleEquipment: (shotId: string, equipmentId: string) => void;
 inventory: Equipment[];
}

export const ShotCard: React.FC<ShotCardProps> = ({
 shot,
 shotLayout,
 isChecklistOpen,
 onShotClick,
 onToggleStatus,
 onToggleChecklist,
 onToggleEquipment,
 inventory
}) => {
 const isChecklistComplete = shot.equipmentIds.length > 0 &&
  shot.preparedEquipmentIds.length === shot.equipmentIds.length;

 const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
 };

 if (shotLayout === 'list') {
  return (
   <HoverCard
    className="px-6 py-3 flex flex-col gap-0 rounded-[24px] cursor-pointer bg-white/80 dark:bg-[#16181D]/80"
    blobColor="from-primary/70 to-primary dark:from-primary/70 dark:to-primary"
    enableHoverScale={!isChecklistOpen}
    onClick={() => onShotClick(shot)}
   >
    {/* Header: Tags */}
    <div className="flex items-center flex-wrap gap-2">
     <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-semibold rounded-lg border border-gray-200 dark:border-white/10">
      Scene {shot.sceneNumber}
     </span>
     <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 flex items-center gap-1.5 text-[10px] font-semibold">
      {formatDate(shot.date)}
     </span>
     <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 flex items-center gap-1.5 text-[10px] font-semibold">
      <Clock size={10} strokeWidth={2.5} /> {shot.startTime}
     </span>
     <span className="hidden md:block px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 text-[10px] font-semibold">
      {shot.duration}
     </span>
    </div>

    {/* Title */}
    <div className="mt-3">
     <h3 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
      {shot.title}
     </h3>
    </div>

    {/* Location & Actions Row */}
    <div className="flex items-end justify-between gap-4 mt-1 md:-mt-2">
     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 font-medium text-base flex-1 min-w-0">
      <MapPin size={16} strokeWidth={2.5} className="shrink-0"/>
      <span className="truncate">{shot.location}</span>
     </div>

     {/* Actions */}
     <div className="hidden md:flex items-center gap-3 shrink-0">
      {/* Gear Badge (Visual) */}
      {shot.equipmentIds.length > 0 && (
       <div className="hidden md:flex items-center gap-2 py-1.5 rounded-xl text-primary dark:text-primary text-xs font-semibold">
        <Package size={14} strokeWidth={2.5} />
        <span>Gear {shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
       </div>
      )}

      {/* Checklist Button */}
      <button
       onClick={(e) => {
        e.stopPropagation();
        onToggleChecklist(shot.id);
       }}
       className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all border ${isChecklistOpen
        ? 'bg-primary dark:bg-primary text-white border-blue-600 dark:border-primary shadow-lg shadow-primary/20'
        : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
        }`}
      >
       <span>Checklist</span>
       {isChecklistOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Status Checkbox */}
      <button
       onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id); }}
       className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${shot.status === 'done'
        ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/20'
        : 'bg-white/40 dark:bg-white/5 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-400 dark:hover:text-white border-gray-200 dark:border-white/10'
        }`}
      >
       <Check size={18} strokeWidth={3} />
      </button>
     </div>
    </div>

    {/* Expanded Checklist in List Mode */}
    {isChecklistOpen && (
     <div className="w-full mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
       {shot.equipmentIds.map(eId => {
        const equip = inventory.find(e => e.id === eId);
        const isPrepared = shot.preparedEquipmentIds.includes(eId);
        return (
         <button
          key={eId}
          onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId); }}
          className={`
             flex items-center justify-between p-3 rounded-xl text-xs font-medium border text-left
             ${isPrepared
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-gray-50/50 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400'
           }
            `}
         >
          <span className="truncate mr-2">{equip?.name || 'Unknown Item'}</span>
          <div className={`
             w-4 h-4 rounded-full flex items-center justify-center border
             ${isPrepared
            ? 'bg-primary dark:bg-primary border-blue-600 dark:border-primary text-white'
            : 'border-gray-300 dark:border-white/20'
           }
            `}>
           {isPrepared && <Check size={10} strokeWidth={4} />}
          </div>
         </button>
        );
       })}
      </div>
     </div>
    )}
   </HoverCard>
  );
 }

 // Grid Layout (Timeline Card)
 return (
  <div
   className={`relative w-full group ${isChecklistOpen ? 'z-10' : 'z-0'}`}
   onClick={() => onShotClick(shot)}
  >
   <HoverCard
    className={`
    ${isChecklistOpen
      ? 'border-primary/50 dark:border-primary/50 shadow-xl ring-1 ring-primary/50 dark:ring-primary/50 rounded-[32px]'
      : 'rounded-[32px] hover:shadow-lg shadow-sm'
     }
    bg-white/80 dark:bg-[#16181D]/80
   `}
    blobColor="from-primary/70 to-primary dark:from-primary/70 dark:to-primary"
    enableHoverScale={!isChecklistOpen}
   >

    {/* Main Card Content */}
    <div className="p-6 relative z-10">
     <div className="flex flex-col gap-2">

      {/* Header Tags */}
      <div className="flex items-center justify-between">
       <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-semibold rounded-lg border border-gray-200 dark:border-white/10">
         Scene {shot.sceneNumber}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent dark:border-white/5 flex items-center gap-1.5 text-[10px] font-semibold">
         {formatDate(shot.date)}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-transparent dark:border-white/5 flex items-center gap-1.5 text-[10px] font-semibold">
         <Clock size={10} strokeWidth={2.5} />
         {shot.startTime}
        </span>
       </div>
      </div>

      {/* Title & Location Group */}
      <div>
       {/* Title */}
       <h3 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
        {shot.title}
       </h3>

       {/* Location Row (Dedicated) */}
       <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm">
        <MapPin size={14} strokeWidth={2.5} className="shrink-0"/>
        <span className="truncate">{shot.location}</span>
       </div>
      </div>

      {/* Footer Actions Row */}
      <div className="flex items-center justify-between gap-4">
       {/* Left: Gear Badge + Checklist */}
       <div className="flex items-center gap-2">
        <button
         onClick={(e) => {
          e.stopPropagation();
          onToggleChecklist(shot.id);
         }}
         className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-semibold border transition-colors ${isChecklistOpen
          ? 'bg-primary dark:bg-primary text-white border-transparent'
          : 'bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
         <span>Checklist</span>
         {isChecklistOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Gear Badge (Moved from top-right) */}
        {shot.equipmentIds.length > 0 && (
         <div className="flex items-center gap-2 py-1.5 rounded-lg text-primary dark:text-primary text-xs font-semibold">
          <Package size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Gear {shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
          <span className="sm:hidden">{shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
         </div>
        )}
       </div>

       {/* Right: Status Check */}
       <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id); }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all shrink-0 ${shot.status === 'done'
         ? 'bg-primary text-white border-transparent shadow-md'
         : 'bg-white/50 dark:bg-white/5 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 hover:text-gray-600 dark:hover:text-white'
         }`}
       >
        <Check size={14} strokeWidth={3} />
       </button>
      </div>

     </div>

     {/* Expanded Checklist */}
     {isChecklistOpen && (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
       <div className="grid grid-cols-2 gap-2">
        {shot.equipmentIds.map(eId => {
         const equip = inventory.find(e => e.id === eId);
         const isPrepared = shot.preparedEquipmentIds.includes(eId);
         return (
          <button
           key={eId}
           onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId); }}
           className={`
            group flex items-center justify-between p-3 rounded-xl text-xs font-medium border text-left transition-all
            ${isPrepared
             ? 'bg-primary/10 border-primary/20 text-primary'
             : 'bg-gray-50/50 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-300'
            }
           `}
          >
           <span className="truncate mr-2">{equip?.name || 'Unknown item'}</span>
           <div className={`
            w-4 h-4 rounded-full flex items-center justify-center border transition-colors
            ${isPrepared
             ? 'bg-primary dark:bg-primary border-blue-600 dark:border-primary text-white'
             : 'border-gray-300 dark:border-white/20 group-hover:border-gray-400 dark:group-hover:border-white/40'
            }
           `}>
            {isPrepared && <Check size={10} strokeWidth={4} />}
           </div>
          </button>
         );
        })}
       </div>
       {shot.equipmentIds.length === 0 && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs italic">
         No gear assigned to this shot.
        </div>
       )}
      </div>
     )}
    </div>
   </HoverCard>
  </div>
 );
};
