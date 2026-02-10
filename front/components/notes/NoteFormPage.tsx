import React, { useState, useRef } from 'react';
import { Paperclip, ArrowUpRight, Image as ImageIcon, File, Trash2, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Shot, PostProdTask, Attachment } from '../../types';
import { Card } from '../ui/Card';
import { Plus } from 'lucide-react';

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
      <Card title="Note details" className="mb-8">
        <div className="p-6 space-y-10">
          {/* Title */}
          <div className="w-full">
            <span className="text-[10px] text-white/40 font-medium mb-2 block">Note title</span>
            <Input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Idea title..."
              variant="underline"
              fullWidth
            />
          </div>

          {/* Content */}
          <div className="w-full">
            <span className="text-[10px] text-white/40 font-medium mb-2 block">Remarks & observations</span>
            <Textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="What are you thinking? Describe your thoughts or observations..."
              className="min-h-[200px]"
            />
          </div>

          {/* Context Link */}
          <div className="w-full">
            <span className="text-[10px] text-white/40 font-medium mb-4 block">Context association</span>

            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => setForm({ ...form, linkType: 'none', linkedId: '' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-medium transition-all ${form.linkType === 'none' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                Standalone
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, linkType: 'shot', linkedId: '' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-medium transition-all ${form.linkType === 'shot' ? 'bg-indigo-500/20 text-indigo-400 shadow-xl' : 'text-white/30 hover:text-indigo-400/50'}`}
              >
                Link Shot
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, linkType: 'task', linkedId: '' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-medium transition-all ${form.linkType === 'task' ? 'bg-orange-500/20 text-orange-400 shadow-xl' : 'text-white/30 hover:text-orange-400/50'}`}
              >
                Link Task
              </button>
            </div>

            {form.linkType !== 'none' && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/20">
                  <LinkIcon size={16} />
                </div>
                <select
                  value={form.linkedId}
                  onChange={e => setForm({ ...form, linkedId: e.target.value })}
                  className="w-full appearance-none bg-transparent border-b border-white/5 pl-10 pr-10 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer text-white/80"
                >
                  <option value="" className="bg-[#0A0A0A]">Choose a reference point...</option>
                  {form.linkType === 'shot' && existingShots.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#0A0A0A]">SCENE {s.sceneNumber}: {s.title}</option>
                  ))}
                  {form.linkType === 'task' && existingTasks.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0A0A0A]">[{t.category}] {t.title}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/20 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Reference assets"
        subtitle={
          <span className="text-white/40">
            {form.attachments.length} Required
          </span>
        }
        headerRight={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus size={12} strokeWidth={3} />
            Add Image/PDF
          </button>
        }
      >
        <div className="p-6">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.attachments.length > 0 ? (
              form.attachments.map(att => (
                <div key={att.id} className="group relative bg-white/5 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-white/20 group-hover:text-indigo-400 transition-all">
                    {att.type === 'image' ? <ImageIcon size={18} /> : <File size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white/80 group-hover:text-white block truncate">{att.name}</span>
                    <span className="text-[10px] text-white/40 font-medium">{att.size || 'N/A'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-2 text-white/5 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Paperclip size={24} />
                </div>
                <span className="text-[10px] font-medium">No documentation attached</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </FormLayout>
  );
};
