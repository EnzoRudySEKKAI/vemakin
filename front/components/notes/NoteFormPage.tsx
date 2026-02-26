import React, { useState } from 'react';
import { Link as LinkIcon, ChevronDown } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Input } from '@/components/atoms';
import { Textarea } from '@/components/atoms';
import { ProjectRequiredBanner } from '@/components/molecules/ProjectRequiredBanner';
import { Shot, PostProdTask } from '../../types';
import { TerminalCard } from '../ui/TerminalCard';

interface NoteFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (title: string, content: string, linkedId?: string, linkType?: 'shot' | 'task') => void;
  existingShots: Shot[];
  existingTasks: PostProdTask[];
  hasProjects?: boolean;
}

export const NoteFormPage: React.FC<NoteFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  existingShots,
  existingTasks,
  hasProjects = true
}) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    linkType: 'none' as 'none' | 'shot' | 'task',
    linkedId: '',
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit(
      form.title,
      form.content,
      form.linkedId,
      form.linkType === 'none' ? undefined : form.linkType
    );
    onClose();
  };

  const isValid = form.title.trim() && form.content.trim();

  const renderContextAssociation = () => (
    <div className="space-y-4">
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => setForm(prev => ({ ...prev, linkType: 'none', linkedId: '' }))}
          className={`flex-1 py-2.5 text-[10px] font-medium transition-all ${form.linkType === 'none' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20' : 'text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/50'}`}
        >
          Standalone
        </button>
        <button
          type="button"
          onClick={() => setForm(prev => ({ ...prev, linkType: 'shot', linkedId: '' }))}
          className={`flex-1 py-2.5 text-[10px] font-medium transition-all ${form.linkType === 'shot' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-500 dark:text-white/30 hover:text-primary/50'}`}
        >
          Link Shot
        </button>
        <button
          type="button"
          onClick={() => setForm(prev => ({ ...prev, linkType: 'task', linkedId: '' }))}
          className={`flex-1 py-2.5 text-[10px] font-medium transition-all ${form.linkType === 'task' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-500 dark:text-white/30 hover:text-orange-400/50'}`}
        >
          Link Task
        </button>
      </div>

      {form.linkType !== 'none' && (
        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 dark:text-white/20">
            <LinkIcon size={16} />
          </div>
          <select
            value={form.linkedId}
            onChange={e => setForm(prev => ({ ...prev, linkedId: e.target.value }))}
            className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 pl-10 pr-10 py-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all cursor-pointer text-gray-800 dark:text-white/80"
          >
            <option value="" className="bg-white dark:bg-[#0F1116]">Choose a reference point...</option>
            {form.linkType === 'shot' && existingShots.map(s => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-[#0F1116]">SCENE {s.sceneNumber}: {s.title}</option>
            ))}
            {form.linkType === 'task' && existingTasks.map(t => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-[#0F1116]">[{t.category}] {t.title}</option>
            ))}
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 dark:text-white/20 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
      )}
    </div>
  );

  const contextSidebar = (
    <div className="hidden xl:block">
      <TerminalCard header="Context association">
        {renderContextAssociation()}
      </TerminalCard>
    </div>
  );

  return (
    <FormLayout
      title="New Note"
      subtitle="Create a creative note"
      detailLabel="Create new"
      formType="note"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid || !hasProjects}
      submitLabel={hasProjects ? "Save Note" : "Create a project first"}
      size="wide"
      sidebar={contextSidebar}
    >
      {!hasProjects && (
        <ProjectRequiredBanner
          onCreateProject={() => onSwitchForm('gear')}
          message="You need to create a project before you can save notes"
        />
      )}
      <TerminalCard header="Note details" className="mb-8">
        <div className="space-y-8">
          <div className="w-full">
            <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Note title</span>
            <Input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Idea title..."
              variant="underline"
              fullWidth
            />
          </div>

          <div className="xl:hidden">
            <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-4 block">Context association</span>
            {renderContextAssociation()}
          </div>

          <div className="w-full">
            <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Remarks & observations</span>
            <Textarea
              value={form.content}
              onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What are you thinking? Describe your thoughts or observations..."
            />
          </div>
        </div>
      </TerminalCard>
    </FormLayout>
  );
};
