import React, { useState } from 'react';
import { PenLine, Scissors, Music, Layers, Palette } from 'lucide-react';
import { FormLayout, type FormType } from '@/components/organisms';
import { FormField, FormTextarea, FormDatePicker, FormSelect, FormSection, FormPrioritySelector, ProjectRequiredBanner } from '@/components/molecules';
import type { PostProdTask } from '@/types';

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
  { id: 'Script', icon: PenLine, color: 'indigo' },
  { id: 'Editing', icon: Scissors, color: 'orange' },
  { id: 'Sound', icon: Music, color: 'blue' },
  { id: 'VFX', icon: Layers, color: 'purple' },
  { id: 'Color', icon: Palette, color: 'red' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Tier' },
  { value: 'medium', label: 'Medium Tier' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Mission Critical' },
];

const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Vertical)' },
  { value: '2.39:1', label: '2.39:1 (Cinema)' },
  { value: '4:3', label: '4:3 (Classic)' },
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

  const pipelineSidebar = (
    <FormSection title="Pipeline parameters">
      {form.category === 'Script' && (
        <FormField
          label="Scene reference"
          value={form.metadata['scene'] as string || ''}
          onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, scene: e.target.value } }))}
          placeholder="e.g. 14B"
        />
      )}
      
      {form.category === 'Editing' && (
        <div className="space-y-4">
          <FormField
            label="Target duration"
            value={form.metadata['duration'] as string || ''}
            onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, duration: e.target.value } }))}
            placeholder="e.g. 2m 30s"
          />
          <FormSelect
            label="Aspect ratio"
            value={form.metadata['aspectRatio'] as string || ''}
            onChange={(value) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, aspectRatio: value } }))}
            options={ASPECT_RATIO_OPTIONS}
            placeholder="Select ratio..."
          />
        </div>
      )}

      {(!['Script', 'Editing'].includes(form.category)) && (
        <div className="py-8 text-center opacity-50">
          <Layers size={24} className="mx-auto mb-2" />
          <span className="text-[10px] font-mono">Standard parameters</span>
        </div>
      )}
    </FormSection>
  );

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
      size="wide"
      sidebar={pipelineSidebar}
    >
      {!hasProjects && (
        <ProjectRequiredBanner
          onCreateProject={() => onSwitchForm('gear')}
          message="You need to create a project before you can save tasks"
        />
      )}

      <FormSection title="Department selection" className="mb-8">
        <div className="grid grid-cols-5 gap-2">
          {TASK_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = form.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setForm(prev => ({ ...prev, category: cat.id as PostProdTask['category'], metadata: {} }))}
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
      </FormSection>

      <FormSection title="Core specification" className="mb-8">
        <div className="space-y-6">
          <FormField
            label="Task objective"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Master Grade Assembly"
            required
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormDatePicker
              label="Timeline deadline"
              value={form.dueDate}
              onChange={(date) => setForm(prev => ({ ...prev, dueDate: date || '' }))}
            />

            <FormSelect
              label="Priority level"
              value={form.priority}
              onChange={(value) => setForm(prev => ({ ...prev, priority: value as PostProdTask['priority'] }))}
              options={PRIORITY_OPTIONS}
            />
          </div>

          <FormTextarea
            label="Briefing & requirements"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Define specific technical instructions or creative context..."
            rows={4}
          />
        </div>
      </FormSection>
    </FormLayout>
  );
};
