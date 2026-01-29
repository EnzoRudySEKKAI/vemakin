
import React, { useRef } from 'react';
import {
  Save, ChevronDown, Paperclip, ArrowUpRight,
  Image as ImageIcon, File, Trash2, Link as LinkIcon
} from 'lucide-react';
import { Shot, PostProdTask, Attachment } from '../../types.ts';

export interface NoteFormData {
  title: string;
  content: string;
  linkType: 'none' | 'shot' | 'task';
  linkedId: string;
  attachments: Attachment[];
}

interface NoteFormProps {
  form: NoteFormData;
  setForm: React.Dispatch<React.SetStateAction<NoteFormData>>;
  existingShots: Shot[];
  existingTasks: PostProdTask[];
  onSubmit: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  form,
  setForm,
  existingShots,
  existingTasks,
  onSubmit
}) => {
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/5 rounded-[20px] px-6 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all placeholder-gray-300 dark:placeholder-gray-500 text-gray-900 dark:text-white"
          placeholder="Idea title"
        />
      </div>

      {/* Linkage Section */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block ml-1">Context link</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setForm({ ...form, linkType: 'none', linkedId: '' })}
            className={`flex-1 py-2 rounded-xl text-[9px] font-semibold border transition-all ${form.linkType === 'none' ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-black' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            General
          </button>
          <button
            onClick={() => setForm({ ...form, linkType: 'shot', linkedId: '' })}
            className={`flex-1 py-2 rounded-xl text-[9px] font-semibold border transition-all ${form.linkType === 'shot' ? 'bg-blue-600 dark:bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-500 dark:bg-indigo-500/10'}`}
          >
            Shot
          </button>
          <button
            onClick={() => setForm({ ...form, linkType: 'task', linkedId: '' })}
            className={`flex-1 py-2 rounded-xl text-[9px] font-semibold border transition-all ${form.linkType === 'task' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
          >
            Task
          </button>
        </div>

        {form.linkType !== 'none' && (
          <div className="relative animate-in slide-in-from-top-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
            <select
              value={form.linkedId}
              onChange={e => setForm({ ...form, linkedId: e.target.value })}
              className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/5 rounded-[20px] pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 transition-all cursor-pointer text-gray-900 dark:text-white"
            >
              <option value="">Select reference...</option>
              {form.linkType === 'shot' && existingShots.map(s => (
                <option key={s.id} value={s.id}>Scene {s.sceneNumber}: {s.title}</option>
              ))}
              {form.linkType === 'task' && existingTasks.map(t => (
                <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"size={16} />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Content</label>
        <textarea
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/5 rounded-[20px] px-6 py-4 text-sm font-medium focus:outline-none focus:border-blue-500 dark:border-indigo-500 transition-all min-h-[150px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Write your note..."
        />
      </div>

      {/* Attachments */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Paperclip size={14} className="text-gray-400"/>
            <label className="text-[9px] font-semibold text-gray-400">Attachments</label>
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[8px] font-semibold">{form.attachments.length}</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[9px] font-semibold text-blue-600 dark:text-indigo-600 hover:text-indigo-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowUpRight size={10} /> Add file
          </button>
          <input type="file"ref={fileInputRef} className="hidden"onChange={handleFileUpload} />
        </div>

        {form.attachments.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {form.attachments.map(att => (
              <div key={att.id} className="group relative bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${att.type === 'image' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'}`}>
                  {att.type === 'image' ? (
                    att.url ? <img src={att.url} alt=""className="w-full h-full object-cover rounded-xl"/> : <ImageIcon size={14} />
                  ) : (
                    <File size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-900 truncate">{att.name}</p>
                  <p className="text-[8px] font-medium text-gray-400">{att.size || 'Unknown size'}</p>
                </div>
                <button onClick={() => removeAttachment(att.id)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#1C1C1E] flex justify-center pb-6">
        <button
          onClick={onSubmit}
          disabled={!form.title.trim()}
          className="w-full sm:w-auto sm:px-24 py-4 rounded-full font-semibold text-[12px] bg-blue-400 dark:bg-indigo-400/60 dark:bg-blue-600 dark:bg-indigo-600/60 text-white text-white shadow-2xl shadow-blue-500 dark:shadow-indigo-500/10 dark:shadow-yellow-400/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale hover:bg-blue-500 dark:bg-indigo-500 dark:hover:bg-yellow-500"
        >
          Add note <Save size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
