import React, { useState } from 'react';
import { PenLine, Scissors, Music, Layers, Palette, Calendar, Flag, ChevronDown, Clock, Crop, Hash } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { PostProdTask } from '../../types';
import { Card } from '../ui/Card';

interface TaskFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (task: PostProdTask) => void;
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

const TASK_CATEGORIES = [
  { id: 'Script', icon: PenLine, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'Editing', icon: Scissors, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'Sound', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'VFX', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'Color', icon: Palette, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export const TaskFormPage: React.FC<TaskFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit
}) => {
  const [form, setForm] = useState({
    title: '',
    category: 'Script' as PostProdTask['category'],
    status: 'todo' as PostProdTask['status'],
    priority: 'medium' as PostProdTask['priority'],
    dueDate: toISODate(new Date().toLocaleDateString()),
    description: '',
    metadata: {} as Record<string, string | number | boolean>
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    const newTask: PostProdTask = {
      id: `task-${Date.now()}`,
      title: form.title,
      category: form.category,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      description: form.description,
      metadata: form.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(newTask);
    onClose();
  };

  const isValid = form.title.trim();

  return (
    <FormLayout
      title="New Task"
      subtitle="Create a pipeline task"
      detailLabel="Create new"
      formType="task"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid}
      submitLabel="Create Task"
    >
      <Card title="Department selection" className="mb-8">
        <div className="p-6">
          <div className="grid grid-cols-5 gap-3">
            {TASK_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id as any, metadata: {} })}
                  className={`flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all duration-500 group ${isActive
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(78,71,221,0.1)]'
                    : 'bg-white/5 border-white/5 text-white/20 hover:border-white/10 hover:text-white/40'
                    }`}
                >
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-indigo-500/20 scale-110' : 'group-hover:scale-105 group-hover:bg-white/5'}`}>
                    <CatIcon size={24} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-indigo-300' : 'text-white/20 group-hover:text-white/40'}`}>
                    {cat.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card title="Core specification" className="mb-8">
        <div className="p-6 space-y-12">
          <div className="w-full">
            <span className="text-[10px] text-white/40 font-medium mb-3 block">Task objective</span>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Master Grade Assembly"
              variant="underline"
              fullWidth
              className="text-lg font-bold tracking-tight"
            />
          </div>

          <div className="w-full">
            <span className="text-[10px] text-white/40 font-medium mb-3 block">Briefing & requirements</span>
            <Textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Define specific technical instructions or creative context..."
              className="min-h-[160px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-3 block">Timeline deadline</span>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                variant="underline"
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-3 block">Priority level</span>
              <div className="relative group">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                  className="w-full bg-transparent border-b border-white/10 py-3 text-white/80 focus:text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer pr-10 text-sm font-bold tracking-tight transition-all"
                >
                  <option value="low" className="bg-[#0A0A0A]">Low Tier</option>
                  <option value="medium" className="bg-[#0A0A0A]">Medium Tier</option>
                  <option value="high" className="bg-[#0A0A0A]">High Priority</option>
                  <option value="critical" className="bg-[#0A0A0A]">Mission Critical</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/20 group-hover:text-indigo-400 transition-colors pointer-events-none">
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Pipeline parameters">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
            {form.category === 'Script' && (
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] text-white/40 font-medium mb-3 block">Scene reference</span>
                <Input
                  type="text"
                  value={form.metadata['scene'] as string || ''}
                  onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, scene: e.target.value } })}
                  placeholder="e.g. 14B"
                  leftIcon={<Hash size={16} className="text-white/20" />}
                  variant="underline"
                  fullWidth
                />
              </div>
            )}
            {form.category === 'Editing' && (
              <>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] text-white/40 font-medium mb-3 block">Target duration</span>
                  <Input
                    type="text"
                    value={form.metadata['duration'] as string || ''}
                    onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, duration: e.target.value } })}
                    placeholder="e.g. 2m 30s"
                    leftIcon={<Clock size={16} className="text-white/20" />}
                    variant="underline"
                    fullWidth
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] text-white/40 font-medium mb-3 block">Aspect ratio</span>
                  <div className="relative group">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/20 group-hover:text-indigo-400 transition-colors pointer-events-none">
                      <Crop size={16} />
                    </div>
                    <select
                      value={form.metadata['aspectRatio'] as string || ''}
                      onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, aspectRatio: e.target.value } })}
                      className="w-full appearance-none bg-transparent border-b border-white/10 pl-10 pr-10 py-3 text-sm font-bold tracking-tight focus:outline-none focus:border-indigo-500 transition-all cursor-pointer text-white/80 focus:text-white"
                    >
                      <option value="" className="bg-[#0A0A0A]">Select Ratio</option>
                      <option value="16:9" className="bg-[#0A0A0A]">16:9 (Widescreen)</option>
                      <option value="9:16" className="bg-[#0A0A0A]">9:16 (Vertical)</option>
                      <option value="2.39:1" className="bg-[#0A0A0A]">2.39:1 (Cinema)</option>
                      <option value="4:3" className="bg-[#0A0A0A]">4:3 (Classic)</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/20 pointer-events-none group-hover:text-indigo-400 transition-colors">
                      <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </>
            )}
            {(!['Script', 'Editing'].includes(form.category)) && (
              <div className="col-span-2 py-16 flex flex-col items-center justify-center text-center opacity-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Layers size={24} />
                </div>
                <span className="text-[10px] font-medium">Standard parameters applied</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </FormLayout>
  );
};
