import React, { useState, useRef } from 'react';
import { Paperclip, ArrowUpRight, Image as ImageIcon, File, Trash2, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Shot, PostProdTask, Attachment } from '../../types';

interface NoteFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (title: string, content: string, linkedId?: string, linkType?: 'shot' | 'task', attachments?: Attachment[]) => void;
  existingShots: Shot[];
  existingTasks: PostProdTask[];
}

export const NoteFormPage: React.FC<NoteFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  existingShots,
  existingTasks
}) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    linkType: 'none' as 'none' | 'shot' | 'task',
    linkedId: '',
    attachments: [] as Attachment[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setForm(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
    }
  };

  const removeAttachment = (attId: string) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attId) }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    onSubmit(
      form.title,
      form.content,
      form.linkedId,
      form.linkType === 'none' ? undefined : form.linkType,
      form.attachments
    );
    onClose();
  };

  const isValid = form.title.trim() && form.content.trim();

  return (
    <FormLayout
      title="New Note"
      subtitle="Create a creative note"
      detailLabel="Create new"
      formType="note"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid}
      submitLabel="Save Note"
    >
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        {/* Title */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Title</Text>
          
          <Input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Idea title"
            variant="underline"
            fullWidth
          />
        </div>

        {/* Content */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Content</Text>
          
          <Textarea
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="Write your note..."
            size="md"
            rows={6}
          />
        </div>

        {/* Context Link */}
        <div className="w-full">
          <span className="detail-subtitle dark:text-white mb-3 block text-center sm:text-left">Context link</span>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setForm({ ...form, linkType: 'none', linkedId: '' })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.linkType === 'none' ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              General
            </button>
            <button
              onClick={() => setForm({ ...form, linkType: 'shot', linkedId: '' })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.linkType === 'shot' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
            >
              Shot
            </button>
            <button
              onClick={() => setForm({ ...form, linkType: 'task', linkedId: '' })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.linkType === 'task' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
            >
              Task
            </button>
          </div>

          {form.linkType !== 'none' && (
            <div className="relative animate-in slide-in-from-top-1">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} />
              <select
                value={form.linkedId}
                onChange={e => setForm({ ...form, linkedId: e.target.value })}
                className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">Select reference...</option>
                {form.linkType === 'shot' && existingShots.map(s => (
                  <option key={s.id} value={s.id}>Scene {s.sceneNumber}: {s.title}</option>
                ))}
                {form.linkType === 'task' && existingTasks.map(t => (
                  <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Paperclip size={14} className="text-gray-400"/>
            <span className="detail-subtitle dark:text-white">Attachments</span>
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-semibold">{form.attachments.length}</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowUpRight size={10} /> Add file
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>

        {form.attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {form.attachments.map(att => (
              <div key={att.id} className="group relative bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5">
                  {att.type === 'image' ? <ImageIcon size={20} className="text-blue-500"/> : <File size={20} className="text-gray-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block truncate">{att.name}</span>
                  <span className="text-xs text-gray-400">{att.size || 'N/A'}</span>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </FormLayout>
  );
};
