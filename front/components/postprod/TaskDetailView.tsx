import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Trash2, Calendar, Clock, AlertCircle, CheckCircle2,
  Hash, Zap, Layers, Activity, Check, Crop, Monitor,
  Share2, Archive, MoreHorizontal, ArrowLeft, Pencil, FileText, Volume2, Edit3, Plus, MessageSquare
} from 'lucide-react';
import { useHeaderActions } from '../../context/HeaderActionsContext';
import { PostProdTask, Note } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EmptyState } from '../ui/EmptyState';
import { POST_PROD_CATEGORIES } from '../../constants';

import { useClickOutside } from '../../hooks/useClickOutside';

interface TaskDetailViewProps {
  task: PostProdTask;
  notes: Note[];
  onClose: () => void;
  onUpdateTask: (task: PostProdTask) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: () => void;
  onOpenNote: (id: string) => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  notes,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddNote,
  onOpenNote
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<PostProdTask>(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { setActions, setOnBack, setTitle, setDetailLabel } = useHeaderActions();

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = useCallback(() => {
    onUpdateTask({
      ...editedTask,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
  }, [editedTask, onUpdateTask]);

  const handleDelete = useCallback(() => {
    onDeleteTask(task.id);
    onClose();
  }, [onDeleteTask, task.id, onClose]);

  useEffect(() => {
    setTitle(task.title);
    setDetailLabel('Task Detail');
    setOnBack(onClose);

    return () => {
      setTitle(null);
      setDetailLabel(null);
      setActions(null);
      setOnBack(undefined);
    };
  }, [task.title, setTitle, setActions, setOnBack, onClose, setDetailLabel]);

  useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all shadow-sm"
              title="Edit Task"
            >
              <Edit3 size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"
              title="Delete Task"
            >
              <Trash2 size={20} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setEditedTask(task); }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
              title="Cancel Changes"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#3762E3] dark:bg-[#4E47DD] text-white shadow-lg shadow-[#3762E3]/20 dark:shadow-[#4E47DD]/20 hover:scale-105 active:scale-95 transition-all"
              title="Save Changes"
            >
              <Check size={20} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    );
  }, [isEditing, task, handleSave, setActions]);

  const updateMetadata = (key: string, value: string) => {
    setEditedTask(prev => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        [key]: value
      }
    }));
  };

  const linkedNotes = notes.filter(n => n.taskId === task.id);
  const categoryInfo = POST_PROD_CATEGORIES.find(c => c.label === task.category);
  const CategoryIcon = categoryInfo ? categoryInfo.icon : Zap;

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#141417] min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1920px] ml-0 p-4 md:p-6 pt-10 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-32">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-8 shadow-sm border border-gray-100/50 dark:border-white/5">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="w-full text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 focus:outline-none focus:border-blue-500 dark:border-indigo-500 bg-transparent placeholder-gray-300"
                    placeholder="Task Title"
                  />
                  <div className="flex gap-3">
                    <select
                      value={editedTask.priority}
                      onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                      className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 dark:text-white focus:outline-none uppercase"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <input
                      type="date"
                      value={editedTask.dueDate || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                      className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 dark:text-white focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none min-h-[100px] resize-none"
                    placeholder="Add description..."
                  />

                  <div className="pt-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-3 ml-1">Pipeline Parameters</p>
                    <div className="grid grid-cols-2 gap-4">
                      {editedTask.category === 'Script' && (
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Scene Reference</label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                            <input
                              type="text"
                              value={editedTask.metadata?.scene as string || ''}
                              onChange={(e) => updateMetadata('scene', e.target.value)}
                              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 dark:text-white"
                              placeholder="e.g. 12A"
                            />
                          </div>
                        </div>
                      )}

                      {editedTask.category === 'Editing' && (
                        <>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Target Duration</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <input
                                type="text"
                                value={editedTask.metadata?.duration as string || ''}
                                onChange={(e) => updateMetadata('duration', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 dark:text-white"
                                placeholder="e.g. 2m 30s"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Aspect Ratio</label>
                            <div className="relative">
                              <Crop className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <select
                                value={editedTask.metadata?.aspectRatio as string || ''}
                                onChange={(e) => updateMetadata('aspectRatio', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 appearance-none dark:text-white"
                              >
                                <option value="">Select...</option>
                                <option value="16:9">16:9</option>
                                <option value="9:16">9:16</option>
                                <option value="2.39:1">2.39:1</option>
                                <option value="4:3">4:3</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {editedTask.category === 'Sound' && (
                        <>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Sample Rate</label>
                            <div className="relative">
                              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <select
                                value={editedTask.metadata?.sampleRate as string || ''}
                                onChange={(e) => updateMetadata('sampleRate', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 appearance-none dark:text-white"
                              >
                                <option value="">Select...</option>
                                <option value="44.1kHz">44.1kHz</option>
                                <option value="48kHz">48kHz</option>
                                <option value="96kHz">96kHz</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Bit Depth</label>
                            <div className="relative">
                              <Volume2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <select
                                value={editedTask.metadata?.bitDepth as string || ''}
                                onChange={(e) => updateMetadata('bitDepth', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 appearance-none dark:text-white"
                              >
                                <option value="">Select...</option>
                                <option value="16-bit">16-bit</option>
                                <option value="24-bit">24-bit</option>
                                <option value="32-bit float">32-bit float</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      {editedTask.category === 'VFX' && (
                        <>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Shot Type</label>
                            <div className="relative">
                              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <select
                                value={editedTask.metadata?.shotType as string || ''}
                                onChange={(e) => updateMetadata('shotType', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none appearance-none dark:text-white"
                              >
                                <option value="">Select...</option>
                                <option value="Cleanup">Cleanup</option>
                                <option value="Keying">Keying</option>
                                <option value="CGI">CGI Integration</option>
                                <option value="Compositing">Compositing</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 mb-1.5 block">Resolution</label>
                            <div className="relative">
                              <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <input
                                type="text"
                                value={editedTask.metadata?.resolution as string || ''}
                                onChange={(e) => updateMetadata('resolution', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold focus:outline-none dark:text-white"
                                placeholder="e.g. 4K"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-4 capitalize">
                    {task.title}
                  </h2>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {task.priority} Priority
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[10px] font-bold border border-gray-100 dark:border-white/10">
                        <Calendar size={12} strokeWidth={2.5} /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {task.description || "No description provided."}
                  </p>
                  {task.metadata && Object.keys(task.metadata).length > 0 && (
                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-4">
                      {Object.entries(task.metadata).map(([key, val]) => (
                        val ? (
                          <div key={key}>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{String(val)}</span>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Linked Notes ({linkedNotes.length})</h4>
                <button onClick={onAddNote} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-all">
                  <Plus size={12} strokeWidth={3} /> Add note
                </button>
              </div>

              {linkedNotes.length > 0 ? (
                <div className="space-y-3">
                  {linkedNotes.map(note => (
                    <div key={note.id} onClick={() => onOpenNote(note.id)} className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-gray-100 dark:border-white/10 shadow-sm flex items-start gap-4 cursor-pointer hover:border-blue-200 transition-all group">
                      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl">
                        <MessageSquare size={16} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{note.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No notes attached" icon={MessageSquare} compact iconColor="gray" />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-1 space-y-6">
            <div className="p-8 border border-white/60 dark:border-white/5 shadow-sm rounded-[32px] bg-white dark:bg-[#1C1C1E]">
              <h5 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-6">Status</h5>
              <div className="space-y-2">
                {['todo', 'progress', 'review', 'done'].map((status) => {
                  const isActive = task.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => onUpdateTask({ ...task, status: status as any })}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="text-sm font-bold capitalize tracking-wide">{status === 'progress' ? 'In Progress' : status}</span>
                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-white/10" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
