import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 X, MapPin, Clock, Calendar, CheckCircle2, Film,
 Trash2, Edit3, Save, RotateCcw, Package, AlertCircle,
 Check, ListChecks, MessageSquare, ExternalLink,
 ChevronDown, ChevronUp, Plus, Search, Layers, Box,
 MoreVertical, CalendarPlus, FileText, Hourglass,
 ArrowRight, ChevronLeft, ChevronRight, Home, MoreHorizontal
} from 'lucide-react';
import { useHeaderActions } from '../../context/HeaderActionsContext';
import { Shot, Note, Equipment, Currency } from '../../types';
import { calculateEndTime, formatDateToNumeric, timeToMinutes } from '../../utils.ts';
import { GlassCard } from '../ui/GlassCard';
import { HoverCard } from '../ui/HoverCard';
import { EmptyState } from '../ui/EmptyState';
import { TimeSelector } from '../ui/TimeSelector';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CATEGORY_ICONS } from '../../constants';

import { useClickOutside } from '../../hooks/useClickOutside';

interface ShotDetailViewProps {
 selectedShot: Shot;
 allShots: Shot[];
 notes: Note[];
 onClose: () => void;
 onToggleStatus: (id: string) => void;
 onToggleEquipment: (shotId: string, equipmentId: string) => void;
 onUpdateShot: (updated: Shot) => void;
 onDeleteShot: (id: string) => void;
 onRetakeShot: (id: string, newDate: string, newTime: string) => void;
 onAddNote: (note: Partial<Note>) => void;
 onOpenNote?: (id: string) => void;
 inventory: Equipment[];
 currency: Currency;
}

export const ShotDetailView: React.FC<ShotDetailViewProps> = ({
 selectedShot,
 allShots,
 notes,
 onClose,
 onToggleStatus,
 onToggleEquipment,
 onUpdateShot,
 onDeleteShot,
 onRetakeShot,
 onAddNote,
 onOpenNote,
 inventory,
 currency
}) => {
 const [isEditing, setIsEditing] = useState(false);
 const [editedShot, setEditedShot] = useState<Shot>(selectedShot);
 const [retakeDate, setRetakeDate] = useState<string>(selectedShot.date);
 const [retakeTime, setRetakeTime] = useState<string>(selectedShot.startTime);
 const [isRetaking, setIsRetaking] = useState(false);
 const [isEquipmentListOpen, setIsEquipmentListOpen] = useState(true);
 const [gearSearchQuery, setGearSearchQuery] = useState('');
 const [activeGearTab, setActiveGearTab] = useState<'list' | 'pool'>('list');
 const [activeCategory, setActiveCategory] = useState('All');

 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
 const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

 const [showMoreMenu, setShowMoreMenu] = useState(false);
 const menuRef = useRef<HTMLDivElement>(null);

 const { setActions, setTitle, setOnBack, setDetailLabel } = useHeaderActions();

 useClickOutside(menuRef, () => setShowMoreMenu(false), showMoreMenu);

 useEffect(() => {
  setEditedShot(selectedShot);
  setRetakeDate(selectedShot.date);
  setRetakeTime(selectedShot.startTime);
 }, [selectedShot]);

 const handleSave = useCallback(() => {
  onUpdateShot(editedShot);
  setIsEditing(false);
  setGearSearchQuery('');
  setActiveGearTab('list');
  setActiveCategory('All');
 }, [onUpdateShot, editedShot]);

 const handleRetake = () => {
  onRetakeShot(selectedShot.id, retakeDate, retakeTime);
  setIsRetaking(false);
  onClose();
 };

 const addToGoogleCalendar = useCallback(() => {
  const startTimeStr = selectedShot.startTime;
  const durationHours = parseFloat(selectedShot.duration.replace('h', ''));

  const startDate = new Date(`${selectedShot.date} ${startTimeStr}`);
  const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000));

  const formatGCalDate = (date: Date) => {
   return date.toISOString().replace(/-|:|\.\d\d\d/g,"");
  };

  const start = formatGCalDate(startDate);
  const end = formatGCalDate(endDate);

  const title = encodeURIComponent(`SHOOT: ${selectedShot.title}`);
  const details = encodeURIComponent(`${selectedShot.description}\n\nScene: ${selectedShot.sceneNumber}\nStatus: ${selectedShot.status}`);
  const location = encodeURIComponent(selectedShot.location);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;

  window.open(url, '_blank');
  setShowMoreMenu(false);
 }, [selectedShot]);

 useEffect(() => {
  setTitle(selectedShot.title);
  setOnBack(onClose);
  setDetailLabel('Shot detail');

  return () => {
   setTitle(null);
   setActions(null);
   setOnBack(undefined);
   setDetailLabel(null);
  };
 }, [selectedShot.title, setTitle, setActions, setOnBack, onClose, setDetailLabel]);

 useEffect(() => {
  setActions(
   <div className="flex items-center gap-3">
    {!isEditing ? (
     <>
      <button
       onClick={() => { setIsEditing(true); setIsEquipmentListOpen(true); setActiveGearTab('list'); }}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all shadow-sm"
       title="Edit shot"
      >
       <Edit3 size={20} strokeWidth={2.5} />
      </button>

      <button
       onClick={() => setIsRetaking(!isRetaking)}
       className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all shadow-sm ${isRetaking
        ? 'bg-orange-500 text-white border-orange-600'
        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
        }`}
       title="Retake"
      >
       <RotateCcw size={20} strokeWidth={2.5} />
      </button>

      <button
       onClick={addToGoogleCalendar}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all shadow-sm"
       title="Add to calendar"
      >
       <CalendarPlus size={20} strokeWidth={2.5} />
      </button>

      <button
       onClick={() => setShowDeleteConfirm(true)}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"
       title="Delete shot"
      >
       <Trash2 size={20} strokeWidth={2.5} />
      </button>
     </>
    ) : (
     <div className="flex gap-3">
      <button
       onClick={() => { setIsEditing(false); setEditedShot(selectedShot); }}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
       title="Cancel changes"
      >
       <X size={20} strokeWidth={2.5} />
      </button>
      <button
       onClick={handleSave}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#3762E3] dark:bg-[#4E47DD] text-white shadow-lg shadow-[#3762E3]/20 dark:shadow-[#4E47DD]/20 hover:scale-105 active:scale-95 transition-all"
       title="Save changes"
      >
       <Check size={20} strokeWidth={3} />
      </button>
     </div>
    )}
   </div>
  );
 }, [isEditing, isRetaking, selectedShot.title, handleSave, addToGoogleCalendar, setActions]);

 const handleAddEquipment = (equipmentId: string) => {
  if (!editedShot.equipmentIds.includes(equipmentId)) {
   setEditedShot(prev => ({
    ...prev,
    equipmentIds: [...prev.equipmentIds, equipmentId]
   }));
  }
 };

 const handleRemoveEquipment = (equipmentId: string) => {
  setEditedShot(prev => ({
   ...prev,
   equipmentIds: prev.equipmentIds.filter(id => id !== equipmentId)
  }));
 };

 const handleEndTimeChange = (newEndTime: string) => {
  if (!newEndTime) return;
  const startMins = timeToMinutes(editedShot.startTime);
  let endMins = timeToMinutes(newEndTime);

  if (endMins < startMins) endMins += 1440;

  if (endMins - startMins < 5) endMins = startMins + 5;

  const diffMins = endMins - startMins;
  const hours = diffMins / 60;
  const duration = `${parseFloat(hours.toFixed(2))}h`;

  setEditedShot(prev => ({ ...prev, duration }));
 };

 const currentEndTime = calculateEndTime(editedShot.startTime, editedShot.duration);

 const availableGear = inventory.filter(item =>
  !editedShot.equipmentIds.includes(item.id) &&
  ((item.customName || item.name).toLowerCase().includes(gearSearchQuery.toLowerCase()) ||
   item.category.toLowerCase().includes(gearSearchQuery.toLowerCase())) &&
  (activeCategory === 'All' || item.category === activeCategory)
 );

 const isChecklistComplete = selectedShot.equipmentIds.length > 0 &&
  selectedShot.preparedEquipmentIds.length === selectedShot.equipmentIds.length;

 const associatedNotes = notes.filter(n => n.shotId === selectedShot.id);

 const currentEquipmentIds = isEditing ? editedShot.equipmentIds : selectedShot.equipmentIds;

 return (
  <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#141417] min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto p-4 md:p-8 pt-0 pb-32">
     {isRetaking && (
      <div className="mb-8 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-wrap items-center gap-4">
       <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm">Schedule retake:</span>
       <input type="date"value={retakeDate} onChange={e => setRetakeDate(e.target.value)} className="bg-transparent border border-orange-500/30 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-white"/>
       <input type="time"value={retakeTime} onChange={e => setRetakeTime(e.target.value)} className="bg-transparent border border-orange-500/30 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-white"/>
       <button onClick={() => setShowRetakeConfirm(true)} className="px-4 py-1.5 bg-orange-500 text-white rounded-lg font-semibold text-xs hover:bg-orange-600">Confirm</button>
      </div>
     )}

     {/* FLUID CONTEXT BAR */}
     <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
      {/* Status Section - Primary Row */}
      <div className="w-full">
       <span className="detail-subtitle mb-3 block">Current status</span>

       <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onToggleStatus(selectedShot.id)}
        className={`group flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 w-full ${selectedShot.status === 'done'
         ? 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400'
         : 'bg-[#3762E3]/5 dark:bg-[#4E47DD]/10 border-[#3762E3]/20 dark:border-[#4E47DD]/30 text-[#3762E3] dark:text-[#4E47DD]'
         }`}
        title={selectedShot.status === 'done' ?"Mark as Pending":"Mark as Completed"}
       >
        <div className="flex items-center gap-2.5">
         <div className={`w-2 h-2 rounded-full ${selectedShot.status === 'done' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#3762E3] dark:bg-[#4E47DD] animate-pulse shadow-[0_0_8px_rgba(55,98,227,0.4)]'}`} />
         <span className="detail-title">
          {selectedShot.status === 'done' ? 'Completed' : 'Pending'}
         </span>
        </div>

        <div className="opacity-40 group-hover:opacity-100 transition-opacity">
         {selectedShot.status === 'done' ? <RotateCcw size={16} /> : <Check size={16} strokeWidth={3} />}
        </div>
       </motion.button>
      </div>

      {/* Secondary Metadata Row */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
       {/* Schedule Section */}
       <div className="flex flex-col gap-3 min-w-0">
        <span className="detail-subtitle">Schedule</span>
        {isEditing ? (
         <div className="flex flex-col gap-3 max-w-xs">
          <input type="date"value={editedShot.date} onChange={e => setEditedShot({ ...editedShot, date: e.target.value })} className="bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"/>
          <div className="flex gap-4">
           <TimeSelector label="In"value={editedShot.startTime} onChange={v => setEditedShot({ ...editedShot, startTime: v })} />
           <TimeSelector label="Out"value={currentEndTime} onChange={handleEndTimeChange} />
          </div>
         </div>
        ) : (
         <div className="flex flex-col group py-1.5">
          <span className="detail-title block mb-0.5">
           {formatDateToNumeric(selectedShot.date)}
          </span>
          <span className="detail-subtitle">
           {selectedShot.startTime} — {calculateEndTime(selectedShot.startTime, selectedShot.duration)}
          </span>
         </div>
        )}
       </div>

       {/* Location Section */}
       <div className="min-w-0 lg:flex-1">
        <span className="detail-subtitle block mb-3">Location</span>
        {isEditing ? (
         <input type="text"value={editedShot.location} onChange={e => setEditedShot({ ...editedShot, location: e.target.value })} className="w-full max-w-md bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"/>
        ) : (
         <div
          className="flex flex-col group cursor-pointer py-1.5"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShot.location)}`, '_blank')}
         >
          <span className="detail-title block mb-0.5 truncate w-full">
           {selectedShot.location}
          </span>
          <span className="detail-subtitle text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 normal-case">
           View on Google Maps <ExternalLink size={12} />
          </span>
         </div>
        )}
       </div>
      </div>
     </div>

     <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
      {/* MAIN CONTENT AREA */}
      <div className="xl:col-span-8 space-y-12">
       {/* Director's Brief */}
       <section>
        <div className="flex items-center mb-6">
         <h3 className="detail-subtitle">Brief</h3>
        </div>
        {isEditing ? (
         <textarea
          value={editedShot.description}
          onChange={(e) => setEditedShot({ ...editedShot, description: e.target.value })}
          placeholder="Provide direction for this shot..."
          className="w-full h-48 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl p-6 text-base text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
         />
        ) : (
         <p className="detail-text max-w-3xl">
          {selectedShot.description ||"No specific instructions provided for this shot."}
         </p>
        )}
       </section>

       {/* Notes Section */}
       <section className="pt-12 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between mb-8">
         <div className="flex items-center">
          <h3 className="detail-subtitle">Notes ({associatedNotes.length})</h3>
         </div>
         <button
          onClick={() => onAddNote({ title: '', content: '', shotId: selectedShot.id, attachments: [] })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:bg-blue-500/10 transition-all"
         >
          <Plus size={14} /> Add note
         </button>
        </div>

        {associatedNotes.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {associatedNotes.map(note => (
           <div
            key={note.id}
            onClick={() => onOpenNote?.(note.id)}
            className="p-6 bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md"
           >
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 transition-colors">{note.title ||"Untitled note"}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{note.content}</p>
           </div>
          ))}
         </div>
        ) : (
         <div className="py-12 bg-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-gray-400">No notes for this shot yet.</p>
         </div>
        )}
       </section>
      </div>

      {/* SIDEBAR: EQUIPMENT */}
      <aside className="xl:col-span-4 lg:sticky lg:top-8 self-start">
       <div className="p-2">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/5">
         <div className="flex items-center">
          <h3 className="detail-title">Gear</h3>
         </div>
         {!isEditing && (
          <div className="flex flex-col items-end">
           <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Checklist</span>
           <span className="detail-subtitle text-blue-600 dark:text-indigo-400">
            {selectedShot.preparedEquipmentIds.length}/{selectedShot.equipmentIds.length} ready
           </span>
          </div>
         )}
        </div>

        {isEditing && (
         <div className="flex gap-4 border-b border-gray-100 dark:border-white/5 mb-6">
          <button
           onClick={() => setActiveGearTab('list')}
           className={`pb-2 text-xs font-semibold transition-all border-b-2 ${activeGearTab === 'list' ? 'border-blue-600 dark:border-indigo-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-400'}`}
          >
           Assigned
          </button>
          <button
           onClick={() => setActiveGearTab('pool')}
           className={`pb-2 text-xs font-semibold transition-all border-b-2 ${activeGearTab === 'pool' ? 'border-blue-600 dark:border-indigo-500 text-blue-600 dark:text-indigo-400' : 'border-transparent text-gray-400'}`}
          >
           Browse pool
          </button>
         </div>
        )}

        <div className="space-y-1">
         {(!isEditing || activeGearTab === 'list') && (
          currentEquipmentIds.length > 0 ? (
           <div>
            {currentEquipmentIds.map(eId => {
             const item = inventory.find(i => i.id === eId);
             const Icon = item ? (CATEGORY_ICONS as any)[item.category] || Package : Package;
             const isReady = !isEditing && selectedShot.preparedEquipmentIds.includes(eId);

             return (
              <div
               key={eId}
               className={`py-4 transition-all flex items-center justify-between group border-b border-gray-50 dark:border-white/[0.02] last:border-0`}
              >
               <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10/ h-10/ rounded-xl flex items-center justify-center transition-colors ${isReady ? 'text-green-600' : 'text-gray-400 group-hover:text-blue-500'}`}>
                 <Icon size={20} />
                </div>
                <div className="min-w-0">
                 <p className={`text-base font-semibold truncate ${isReady ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>{item ? (item.customName || item.name) : 'Unknown'}</p>
                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item?.category}</p>
                </div>
               </div>
               {isEditing ? (
                <button
                 onClick={() => handleRemoveEquipment(eId)}
                 className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                 <Trash2 size={14} />
                </button>
               ) : (
                <button
                 onClick={() => onToggleEquipment(selectedShot.id, eId)}
                 className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isReady
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-300 hover:bg-green-500/10 hover:text-green-500'
                  }`}
                >
                 <Check size={18} strokeWidth={3} />
                </button>
               )}
              </div>
             );
            })}
           </div>

          ) : (
           <div className="py-12 text-center">
            <Package size={32} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-sm font-semibold text-gray-400">No gear assigned.</p>
           </div>
          )
         )}

         {isEditing && activeGearTab === 'pool' && (
          <div className="space-y-4">
           <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"size={16} />
            <input
             type="text"
             value={gearSearchQuery}
             onChange={(e) => setGearSearchQuery(e.target.value)}
             placeholder="Search pool..."
             className="w-full bg-gray-100 dark:bg-white/5 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
           </div>
           <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {availableGear.length > 0 ? availableGear.map(gear => {
             const Icon = (CATEGORY_ICONS as any)[gear.category] || Package;
             return (
              <button
               key={gear.id}
               onClick={() => handleAddEquipment(gear.id)}
               className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
              >
               <div className="flex items-center gap-4 min-w-0">
                <Icon size={16} className="text-gray-400"/>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{gear.customName || gear.name}</span>
               </div>
               <Plus size={16} className="text-blue-500"/>
              </button>
             );
            }) : (
             <p className="text-center py-8 text-xs font-semibold text-gray-400">No matching gear found.</p>
            )}
           </div>
          </div>
         )}
        </div>
       </div>
      </aside>
     </div>
    </div>
   </div>

   <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={() => onDeleteShot(selectedShot.id)} title="Delete shot"message="Are you sure you want to delete this shot? This action cannot be undone."confirmText="Delete"cancelText="Cancel"variant="danger"/>
   <ConfirmModal isOpen={showRetakeConfirm} onClose={() => setShowRetakeConfirm(false)} onConfirm={handleRetake} title="Schedule retake"message={`Are you sure you want to schedule a retake for this shot on ${retakeDate} at ${retakeTime}?`} confirmText="Schedule retake"cancelText="Cancel"variant="warning"/>
  </div>
 );
};
