import React, { useState } from 'react';
import { PenLine, Scissors, Music, Layers, Palette, Calendar, Flag, ChevronDown, Clock, Crop, Hash } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { PostProdTask } from '../../types';

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
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        {/* Department */}
        <div className="w-full">
          <span className="detail-subtitle dark:text-white mb-4 block text-center sm:text-left">Department</span>
          
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {TASK_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isActive = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.id as any, metadata: {} })}
                  className={`flex flex-col items-center gap-3 p-4 rounded-[24px] border-2 transition-all duration-300 group ${isActive
                    ? 'bg-white dark:bg-[#2C2C30] border-blue-500 shadow-xl ring-8 ring-blue-500/5'
                    : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 text-gray-300 dark:text-gray-600 hover:border-gray-200 dark:hover:border-white/20'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-transform ${isActive ? 'scale-110 text-blue-500' : 'group-hover:scale-105'}`}>
                    <CatIcon size={24} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[8px] font-semibold ${isActive ? 'text-blue-600' : ''}`}>{cat.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Task title</Text>
          
          <Input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Master Grade Assembly"
            variant="underline"
            fullWidth
          />
        </div>

        {/* Description */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Description</Text>
          
          <Textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add specific instructions or context..."
            size="md"
            rows={6}
          />
        </div>

        {/* Due Date & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col gap-1 min-w-0">
            <Text variant="subtitle" color="muted" className="dark:text-white">Due date</Text>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              variant="underline"
              fullWidth
            />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <Text variant="subtitle" color="muted" className="dark:text-white">Priority</Text>
            <div className="relative group">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all text-sm font-semibold appearance-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Fields */}
      <section>
        <div className="mb-10">
          <Text variant="subtitle" color="muted" className="dark:text-white">Pipeline parameters</Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
          {form.category === 'Script' && (
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Scene reference</Text>
              <Input
                type="text"
                value={form.metadata['scene'] as string || ''}
                onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, scene: e.target.value } })}
                placeholder="e.g. 14B"
                leftIcon={<Hash size={16} className="text-gray-400 dark:text-gray-500" />}
                variant="underline"
                fullWidth
              />
            </div>
          )}
          {form.category === 'Editing' && (
            <>
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Target duration</Text>
                <Input
                  type="text"
                  value={form.metadata['duration'] as string || ''}
                  onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, duration: e.target.value } })}
                  placeholder="e.g. 2m 30s"
                  leftIcon={<Clock size={16} className="text-gray-400 dark:text-gray-500" />}
                  variant="underline"
                  fullWidth
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Aspect ratio</Text>
                <div className="relative">
                  <Crop className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                  <select
                    value={form.metadata['aspectRatio'] as string || ''}
                    onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, aspectRatio: e.target.value } })}
                    className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 pl-8 pr-8 py-2 text-sm font-semibold focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-gray-900 dark:text-white"
                  >
                    <option value="">Select ratio</option>
                    <option value="16:9">16:9 (widescreen)</option>
                    <option value="9:16">9:16 (vertical)</option>
                    <option value="2.39:1">2.39:1 (cinema)</option>
                    <option value="4:3">4:3 (classic)</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </FormLayout>
  );
};
