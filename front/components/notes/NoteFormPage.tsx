import React, { useState } from 'react';
import { FormLayout, type FormType } from '@/components/organisms';
import { FormField, FormTextarea, FormSection, LinkedEntitySelector, ProjectRequiredBanner } from '@/components/molecules';
import type { Shot, PostProdTask } from '@/types';

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

  const contextSidebar = (
    <div className="hidden xl:block">
      <FormSection title="Context association">
        <LinkedEntitySelector
          label=""
          linkType={form.linkType}
          onLinkTypeChange={(type) => setForm(prev => ({ ...prev, linkType: type, linkedId: '' }))}
          linkedId={form.linkedId}
          onLinkedIdChange={(id) => setForm(prev => ({ ...prev, linkedId: id }))}
          entities={{
            shot: existingShots.map(s => ({ id: s.id, label: `SCENE ${s.sceneNumber}: ${s.title}`, type: 'shot' as const })),
            task: existingTasks.map(t => ({ id: t.id, label: `[${t.category}] ${t.title}`, type: 'task' as const }))
          }}
          placeholder="Choose a reference..."
        />
      </FormSection>
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

      <FormSection title="Note details" className="mb-8">
        <div className="space-y-6">
          <FormField
            label="Note title"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Idea title..."
            required
          />

          <div className="xl:hidden">
            <LinkedEntitySelector
              label="Context"
              linkType={form.linkType}
              onLinkTypeChange={(type) => setForm(prev => ({ ...prev, linkType: type, linkedId: '' }))}
              linkedId={form.linkedId}
              onLinkedIdChange={(id) => setForm(prev => ({ ...prev, linkedId: id }))}
              entities={{
                shot: existingShots.map(s => ({ id: s.id, label: `SCENE ${s.sceneNumber}: ${s.title}`, type: 'shot' as const })),
                task: existingTasks.map(t => ({ id: t.id, label: `[${t.category}] ${t.title}`, type: 'task' as const }))
              }}
              placeholder="Choose a reference..."
            />
          </div>

          <FormTextarea
            label="Remarks & observations"
            value={form.content}
            onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="What are you thinking? Describe your thoughts or observations..."
            rows={4}
            required
          />
        </div>
      </FormSection>
    </FormLayout>
  );
};
