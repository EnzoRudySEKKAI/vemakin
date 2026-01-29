
import React from 'react';
import {
  Save, Calendar, ChevronDown, Flag, Clock, Hash,
  PenLine, Scissors, Music, Layers, Palette, Crop
} from 'lucide-react';
import { PostProdTask } from '../../types.ts';

export interface TaskFormData {
  title: string;
  category: PostProdTask['category'];
  status: PostProdTask['status'];
  priority: PostProdTask['priority'];
  dueDate: string;
  description: string;
  metadata: Record<string, string | number | boolean>;
}

interface TaskFormProps {
  form: TaskFormData;
  setForm: React.Dispatch<React.SetStateAction<TaskFormData>>;
  onSubmit: () => void;
}

const TASK_CATEGORIES = [
  { id: 'Script', icon: PenLine, color: 'text-blue-500 dark:text-indigo-500', bg: 'bg-blue-50' },
  { id: 'Editing', icon: Scissors, color: 'text-blue-500 dark:text-indigo-500', bg: 'bg-blue-50' },
  { id: 'Sound', icon: Music, color: 'text-blue-500 dark:text-indigo-500', bg: 'bg-blue-50' },
  { id: 'VFX', icon: Layers, color: 'text-blue-500 dark:text-indigo-500', bg: 'bg-blue-50' },
  { id: 'Color', icon: Palette, color: 'text-blue-500 dark:text-indigo-500', bg: 'bg-blue-50' },
];

export const TaskForm: React.FC<TaskFormProps> = ({ form, setForm, onSubmit }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-8">
        {/* Department */}
        <div>
          <label className="text-[10px] font-semibold text-gray-400 mb-4 block ml-1">Department</label>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {TASK_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id as any, metadata: {} })}
                  className={`flex flex-col items-center gap-3 p-4 rounded-[24px] border-2 transition-all duration-300 group ${isActive
                    ? `bg-white dark:bg-[#2C2C30] border-blue-500 dark:border-indigo-500 dark:border-yellow-400 shadow-xl ring-8 ring-blue-500 dark:ring-indigo-500/5 dark:ring-yellow-400/10 ${cat.color} dark:text-blue-400 dark:text-indigo-400`
                    : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 text-gray-300 dark:text-gray-600 hover:border-gray-200 dark:hover:border-white/20'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <CatIcon size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[8px] font-semibold">{cat.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Task title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] px-6 py-5 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all placeholder-gray-200 dark:placeholder-gray-500"
              placeholder="e.g. Master Grade Assembly"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Brief / Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] px-6 py-4 text-sm font-medium focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all placeholder-gray-300 dark:placeholder-gray-500 min-h-[100px] text-gray-900 dark:text-white"
              placeholder="Add specific instructions or context..."
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Due date</label>
              <div className="relative group min-w-0">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full max-w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all text-gray-900 dark:text-white appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Priority</label>
              <div className="relative group">
                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-8 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="p-6 bg-blue-50/50 dark:bg-yellow-500/5 rounded-[32px] border border-blue-100/50 dark:border-yellow-500/20 animate-in slide-in-from-top-4 duration-500">
          <p className="text-[8px] font-semibold text-blue-400 dark:text-indigo-400 dark:text-blue-400 dark:text-indigo-400 mb-4">Pipeline parameters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {form.category === 'Script' && (
              <div>
                <label className="text-[9px] font-semibold text-indigo-700/60 dark:text-blue-400 dark:text-indigo-400/60 mb-2 block">Scene reference</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-yellow-500/50"size={14} />
                  <input
                    type="text"
                    value={form.metadata['scene'] as string || ''}
                    onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, scene: e.target.value } })}
                    placeholder="e.g. 14B"
                    className="w-full bg-white dark:bg-[#2C2C30] border border-blue-100 dark:border-yellow-500/20 rounded-xl pl-10 pr-4 py-3 text-[11px] font-semibold focus:outline-none shadow-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
            {form.category === 'Editing' && (
              <>
                <div>
                  <label className="text-[9px] font-semibold text-indigo-700/60 dark:text-blue-400 dark:text-indigo-400/60 mb-2 block">Target duration</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-yellow-500/50"size={14} />
                    <input
                      type="text"
                      value={form.metadata['duration'] as string || ''}
                      onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, duration: e.target.value } })}
                      placeholder="e.g. 2m 30s"
                      className="w-full bg-white dark:bg-[#2C2C30] border border-blue-100 dark:border-yellow-500/20 rounded-xl pl-10 pr-4 py-3 text-[11px] font-semibold focus:outline-none shadow-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-indigo-700/60 dark:text-blue-400 dark:text-indigo-400/60 mb-2 block">Aspect ratio</label>
                  <div className="relative">
                    <Crop className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-yellow-500/50"size={14} />
                    <select
                      value={form.metadata['aspectRatio'] as string || ''}
                      onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, aspectRatio: e.target.value } })}
                      className="w-full bg-white dark:bg-[#2C2C30] border border-blue-100 dark:border-yellow-500/20 rounded-xl pl-10 pr-4 py-3 text-[11px] font-semibold focus:outline-none shadow-sm appearance-none cursor-pointer text-gray-900 dark:text-white"
                    >
                      <option value="">Select ratio</option>
                      <option value="16:9">16:9 (widescreen)</option>
                      <option value="9:16">9:16 (vertical)</option>
                      <option value="2.39:1">2.39:1 (cinema)</option>
                      <option value="4:3">4:3 (classic)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-yellow-500/50 pointer-events-none"size={14} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#1C1C1E] flex justify-center pb-6">
          <button
            onClick={onSubmit}
            disabled={!form.title.trim()}
            className="w-full sm:w-auto sm:px-24 py-4 rounded-full font-semibold text-[12px] bg-blue-400 dark:bg-indigo-400/60 dark:bg-blue-600 dark:bg-indigo-600/60 text-white text-white shadow-2xl shadow-blue-500 dark:shadow-indigo-500/10 dark:shadow-yellow-400/10 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:grayscale hover:bg-blue-500 dark:bg-indigo-500 dark:hover:bg-blue-700 dark:bg-indigo-700"
          >
            Add task <Save size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
