import React, { useState } from 'react';
import { PenLine, Scissors, Music, Layers, Palette, Calendar, Flag, ChevronDown, Clock, Crop, Hash } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { ProjectRequiredBanner } from '../molecules/ProjectRequiredBanner';
import { PostProdTask } from '../../types';
import { TerminalCard } from '../ui/TerminalCard';

interface TaskFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (task: PostProdTask) => void;
  hasProjects?: boolean;
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

const TASK_CATEGORIES = [
  { id: 'Script', icon: PenLine, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'Editing', icon: Scissors, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'Sound', icon: Music, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'VFX', icon: Layers, color: 'text-primary', bg: 'bg-primary/5' },
  { id: 'Color', icon: Palette, color: 'text-primary', bg: 'bg-primary/5' },
];

export const TaskFormPage: React.FC<TaskFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  hasProjects = true
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
      submitDisabled={!isValid || !hasProjects}
      submitLabel={hasProjects ? "Create Task" : "Create a project first"}
    >
      {!hasProjects && (
        <ProjectRequiredBanner
          onCreateProject={() => onSwitchForm('gear')}
          message="You need to create a project before you can save tasks"
        />
      )}
      <TerminalCard header="Department selection" className="mb-8">
        <div className>
          <div className="grid grid-cols-5 gap-2">
            {TASK_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id as any, metadata: {} }))}
                  className={`flex flex-col items-center gap-3 p-4 border transition-all duration-300 group ${isActive
                    ? 'bg-primary/10 border-primary/50 text-primary'
                    : 'bg-[#fafafa] dark:bg-[#0a0a0a]/40 border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/30 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-700 dark:hover:text-white/50'
                    }`}
                >
                  <div className={`p-2 border transition-all duration-300 ${isActive ? 'bg-primary/20 border-primary/30' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20'}`}>
                    <CatIcon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${isActive ? 'text-primary' : 'text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/50'}`}>
                    {cat.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </TerminalCard>

      <TerminalCard header="Core specification" className="mb-8">
        <div className="p-6 space-y-12">
          <div className="w-full">
            <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Task objective</span>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Master Grade Assembly"
              variant="underline"
              fullWidth
              className="text-lg font-bold tracking-tight"
            />
          </div>

          <div className="w-full">
            <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Briefing & requirements</span>
            <Textarea
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Define specific technical instructions or creative context..."
              className="min-h-[160px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Timeline deadline</span>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                variant="underline"
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Priority level</span>
                <div className="relative group">
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-white/10 py-3 text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white focus:outline-none focus:border-primary appearance-none cursor-pointer pr-10 text-sm font-bold tracking-tight transition-all"
                >
                  <option value="low" className="bg-white dark:bg-[#0F1116]">Low Tier</option>
                  <option value="medium" className="bg-white dark:bg-[#0F1116]">Medium Tier</option>
                  <option value="high" className="bg-white dark:bg-[#0F1116]">High Priority</option>
                  <option value="critical" className="bg-white dark:bg-[#0F1116]">Mission Critical</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-white/20 group-hover:text-primary transition-colors pointer-events-none">
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TerminalCard>

      <TerminalCard header="Pipeline parameters">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
            {form.category === 'Script' && (
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Scene reference</span>
                <Input
                  type="text"
                  value={form.metadata['scene'] as string || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, scene: e.target.value } }))}
                  placeholder="e.g. 14B"
                  leftIcon={<Hash size={16} className="text-gray-400 dark:text-white/20" />}
                  variant="underline"
                  fullWidth
                />
              </div>
            )}
            {form.category === 'Editing' && (
              <>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Target duration</span>
                  <Input
                    type="text"
                    value={form.metadata['duration'] as string || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, duration: e.target.value } }))}
                    placeholder="e.g. 2m 30s"
                    leftIcon={<Clock size={16} className="text-gray-400 dark:text-white/20" />}
                    variant="underline"
                    fullWidth
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Aspect ratio</span>
                  <div className="relative group">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-white/20 group-hover:text-primary transition-colors pointer-events-none">
                      <Crop size={16} />
                    </div>
                    <select
                      value={form.metadata['aspectRatio'] as string || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, aspectRatio: e.target.value } }))}
                      className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 pl-10 pr-10 py-3 text-sm font-bold tracking-tight focus:outline-none focus:border-primary transition-all cursor-pointer text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white"
                    >
                      <option value="" className="bg-white dark:bg-[#0F1116]">Select Ratio</option>
                      <option value="16:9" className="bg-white dark:bg-[#0F1116]">16:9 (Widescreen)</option>
                      <option value="9:16" className="bg-white dark:bg-[#0F1116]">9:16 (Vertical)</option>
                      <option value="2.39:1" className="bg-white dark:bg-[#0F1116]">2.39:1 (Cinema)</option>
                      <option value="4:3" className="bg-white dark:bg-[#0F1116]">4:3 (Classic)</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-white/20 pointer-events-none group-hover:text-primary transition-colors">
                      <ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </>
            )}
            {(!['Script', 'Editing'].includes(form.category)) && (
              <div className="col-span-2 py-16 flex flex-col items-center justify-center text-center opacity-10">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Layers size={24} />
                </div>
                <span className="text-[10px] font-medium text-gray-900 dark:text-white">Standard parameters applied</span>
              </div>
            )}
          </div>
        </div>
      </TerminalCard>
    </FormLayout>
  );
};
