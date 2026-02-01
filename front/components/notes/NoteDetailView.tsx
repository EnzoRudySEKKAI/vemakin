import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 X, Save, Trash2, Calendar, Clock, Paperclip, FileText, Plus,
 Image as ImageIcon, MoreVertical, Edit3, ArrowUpRight,
 Download, File, Film, Briefcase, ExternalLink, ArrowRight,
 ChevronLeft, ChevronRight, Home, MessageSquare, Check
} from 'lucide-react';
import { useHeaderActions } from '../../context/HeaderActionsContext';
import { Note, Shot, PostProdTask, Attachment } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EmptyState } from '../ui/EmptyState';
import { CATEGORY_ICONS } from '../../constants';

import { useClickOutside } from '../../hooks/useClickOutside';

interface NoteDetailViewProps {
 note: Note;
 shots: Shot[];
 tasks: PostProdTask[];
 onClose: () => void;
 onUpdateNote: (note: Note) => void;
 onDeleteNote: (id: string) => void;
 onNavigateToShot: (shotId: string) => void;
 onNavigateToTask: (taskId: string) => void;
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
 note,
 shots,
 tasks,
 onClose,
 onUpdateNote,
 onDeleteNote,
 onNavigateToShot,
 onNavigateToTask
}) => {
 const [isEditing, setIsEditing] = useState(false);
 const [editedNote, setEditedNote] = useState<Note>(note);
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions();

 useEffect(() => {
  setEditedNote(note);
 }, [note]);

 // Header integration
 useEffect(() => {
  setTitle(note.title || 'Untitled note');
  // Assuming 'category' and 'date' might be derived or added to Note type if needed for subtitle
  // For now, using updatedAt if available, otherwise createdAt
  const dateString = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '');
  setSubtitle(`Note • Updated ${dateString}`);
  setDetailLabel('Note detail');
  setOnBack(onClose);

  return () => {
   setTitle('');
   setSubtitle('');
   setDetailLabel(null);
   setActions(null);
   setOnBack(undefined);
  };
 }, [note, setTitle, setSubtitle, setActions, setOnBack, onClose, setDetailLabel]);

 const handleSave = useCallback(() => {
  onUpdateNote({
   ...editedNote,
   updatedAt: new Date().toISOString()
  });
  setIsEditing(false);
 }, [editedNote, onUpdateNote]);

 const handleDelete = useCallback(() => {
  setShowDeleteConfirm(true);
 }, []);

 const confirmDelete = useCallback(() => {
  onDeleteNote(note.id);
  setShowDeleteConfirm(false);
  onClose();
 }, [note.id, onDeleteNote, onClose]);

 useEffect(() => {
  setActions(
   <div className="flex items-center gap-2">
    {!isEditing ? (
     <div className="flex gap-3">
      <button
       onClick={() => setIsEditing(true)}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all shadow-sm"
       title="Edit note"
      >
       <Edit3 size={20} strokeWidth={2.5} />
      </button>
      <button
       onClick={() => setShowDeleteConfirm(true)}
       className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"
       title="Delete note"
      >
       <Trash2 size={20} strokeWidth={2.5} />
      </button>
     </div>
    ) : (
     <div className="flex gap-3">
      <button
       onClick={() => { setIsEditing(false); setEditedNote(note); }}
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
 }, [isEditing, note, handleSave, setActions]);

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
   const file = e.target.files[0];
   const isImage = file.type.startsWith('image/');

   const newAttachment: Attachment = {
    id: `att-${Date.now()}`,
    name: file.name,
    type: isImage ? 'image' : 'document',
    url: URL.createObjectURL(file),
    size: `${(file.size / 1024).toFixed(1)} KB`,
    createdAt: new Date().toISOString()
   };

   setEditedNote(prev => ({
    ...prev,
    attachments: [...(prev.attachments || []), newAttachment]
   }));

   if (!isEditing) {
    onUpdateNote({
     ...editedNote,
     attachments: [...(editedNote.attachments || []), newAttachment],
     updatedAt: new Date().toISOString()
    });
   }
  }
 };

 const removeAttachment = (attId: string) => {
  setEditedNote(prev => ({
   ...prev,
   attachments: prev.attachments.filter(a => a.id !== attId)
  }));

  if (!isEditing) {
   onUpdateNote({
    ...editedNote,
    attachments: editedNote.attachments.filter(a => a.id !== attId),
    updatedAt: new Date().toISOString()
   });
  }
 };

 const linkedShot = useMemo(() => shots.find(s => s.id === note.shotId), [note.shotId, shots]);
 const linkedTask = useMemo(() => tasks.find(t => t.id === note.taskId), [note.taskId, tasks]);

 return (
  <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#141417] min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1920px] ml-0 p-4 md:p-6 pt-0 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-32">
     {/* LEFT COLUMN */}
     <div className="xl:col-span-2 space-y-6">
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-[28px] p-8 shadow-sm">
       <label className="text-[10px] font-semibold text-gray-400 ml-1 block mb-3">Note content</label>
       {isEditing ? (
        <div className="space-y-4">
         <input
          type="text"
          value={editedNote.title}
          onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
          className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
          placeholder="Note title"
         />
         <textarea
          value={editedNote.content}
          onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
          className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl p-5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none min-h-[300px] leading-relaxed resize-none"
          placeholder="Write something..."
         />
        </div>
       ) : (
        <div className="space-y-4">
         <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{note.title || 'Untitled note'}</h3>
         <div className="h-px bg-gray-100 dark:bg-white/5 w-full"/>
         <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content || 'No content provided.'}</p>
        </div>
       )}
      </div>

      {/* ATTACHMENTS SECTION */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-[28px] p-8 shadow-sm">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center text-blue-600 dark:text-[#4E47DD]">
          <Paperclip size={18} />
         </div>
         <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Attachments</h4>
          <p className="text-[10px] font-semibold text-gray-400">{editedNote.attachments?.length || 0} files</p>
         </div>
        </div>
        <button
         onClick={() => fileInputRef.current?.click()}
         className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all border border-gray-200 dark:border-white/10"
        >
         <Plus size={14} /> Add file
        </button>
        <input type="file"ref={fileInputRef} className="hidden"onChange={handleFileUpload} />
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {editedNote.attachments && editedNote.attachments.length > 0 ? (
         editedNote.attachments.map(att => (
          <div key={att.id} className="group relative bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-indigo-500/30 transition-all flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 shadow-sm">
            {att.type === 'image' ? <ImageIcon size={20} className="text-blue-500"/> : <File size={20} className="text-gray-400"/>}
           </div>
           <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{att.name}</p>
            <p className="text-[10px] text-gray-400 font-medium">{att.size || 'N/A'}</p>
           </div>
           <button
            onClick={() => removeAttachment(att.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
           >
            <Trash2 size={14} />
           </button>
          </div>
         ))
        ) : (
         <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/[0.01] rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
          <Paperclip size={32} className="text-gray-300 mb-3"/>
          <p className="text-sm font-semibold text-gray-400">No files attached yet</p>
          <p className="text-[10px] text-gray-400 mt-1">Images, documents, and references</p>
         </div>
        )}
       </div>
      </div>
     </div>

     {/* RIGHT COLUMN */}
     <div className="xl:col-span-1 space-y-6">
      <div className="p-8 border border-white/60 dark:border-white/5 shadow-sm rounded-[32px] bg-white dark:bg-[#1C1C1E] h-fit">
       <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Linked context</h5>
       <div className="space-y-4">
        {linkedShot && (
         <button onClick={() => onNavigateToShot(linkedShot.id)} className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Film size={20} />
           </div>
           <div className="text-left">
            <p className="text-[10px] font-semibold text-gray-400">Sequence</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">Sc {linkedShot.sceneNumber} • {linkedShot.title}</p>
           </div>
          </div>
          <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors"/>
         </button>
        )}
        {linkedTask && (
         <button onClick={() => onNavigateToTask(linkedTask.id)} className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Briefcase size={20} />
           </div>
           <div className="text-left">
            <p className="text-[10px] font-semibold text-gray-400">Task</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1">{linkedTask.title}</p>
           </div>
          </div>
          <ArrowUpRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors"/>
         </button>
        )}
        {!linkedShot && !linkedTask && (
         <div className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-100 dark:border-white/5">
          <ExternalLink size={24} className="text-gray-300 mb-2"/>
          <p className="text-xs font-semibold text-gray-400">No linked items</p>
         </div>
        )}
       </div>

       <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4 text-gray-400">
         <Clock size={14} />
         <span className="text-[10px] font-semibold">Metadata</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
         <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5">
          <p className="text-[9px] font-semibold text-gray-400 mb-1">Last modified</p>
          <p className="text-xs font-semibold text-gray-700 dark:text-white">{new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
         </div>
         <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5">
          <p className="text-[9px] font-semibold text-gray-400 mb-1">Created</p>
          <p className="text-xs font-semibold text-gray-700 dark:text-white">{new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>

   <ConfirmModal
    isOpen={showDeleteConfirm}
    onClose={() => setShowDeleteConfirm(false)}
    onConfirm={handleDelete}
    title="Delete Note"
    message="Are you sure you want to delete this note? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
   />
  </div>
 );
};
