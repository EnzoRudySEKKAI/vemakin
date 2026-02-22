import React, { useRef } from 'react'
import {
  Save, ChevronDown, Paperclip, ArrowUpRight,
  Image as ImageIcon, File, Trash2, Link as LinkIcon
} from 'lucide-react'
import { Shot, PostProdTask, Attachment } from '@/types'
import { Button, Text, Input, Textarea, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

export interface NoteFormData {
  title: string
  content: string
  linkType: 'none' | 'shot' | 'task'
  linkedId: string
  attachments: Attachment[]
}

interface NoteFormProps {
  form: NoteFormData
  setForm: React.Dispatch<React.SetStateAction<NoteFormData>>
  existingShots: Shot[]
  existingTasks: PostProdTask[]
  onSubmit: () => void
}

export const NoteForm: React.FC<NoteFormProps> = ({
  form,
  setForm,
  existingShots,
  existingTasks,
  onSubmit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const isImage = file.type.startsWith('image/')
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString()
      }
      setForm(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }))
    }
  }

  const removeAttachment = (attId: string) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attId) }))
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1 min-w-0">
        <Text variant="label" color="muted">Title</Text>
        <Input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          fullWidth
          placeholder="Idea Title"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0">
        <Text variant="label" color="muted">Content</Text>
        <Textarea
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Write your note..."
          size="md"
        />
      </div>

      {/* Linkage Section */}
      <div>
        <Text variant="label" color="muted" className="mb-2 block">Context Link</Text>
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => setForm({ ...form, linkType: 'none', linkedId: '' })}
            variant={form.linkType === 'none' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
          >
            General
          </Button>
          <Button
            onClick={() => setForm({ ...form, linkType: 'shot', linkedId: '' })}
            variant={form.linkType === 'shot' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
          >
            Shot
          </Button>
          <Button
            onClick={() => setForm({ ...form, linkType: 'task', linkedId: '' })}
            variant={form.linkType === 'task' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
          >
            Task
          </Button>
        </div>

        {form.linkType !== 'none' && (
          <div className="relative animate-in slide-in-from-top-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
            <select
              value={form.linkedId}
              onChange={e => setForm({ ...form, linkedId: e.target.value })}
              className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-primary dark:focus:border-primary transition-all cursor-pointer text-gray-900 dark:text-white"
            >
              <option value="">Select reference...</option>
              {form.linkType === 'shot' && existingShots.map(s => (
                <option key={s.id} value={s.id}>Scene {s.sceneNumber}: {s.title}</option>
              ))}
              {form.linkType === 'task' && existingTasks.map(t => (
                <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Paperclip size={14} strokeWidth={2.5} className="text-gray-400" />
            <Text variant="label" color="muted">Attachments</Text>
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-semibold">{form.attachments.length}</span>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="sm"
            leftIcon={<ArrowUpRight size={10} strokeWidth={2.5} />}
          >
            Add File
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>

        {form.attachments.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {form.attachments.map(att => (
              <div key={att.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <IconContainer
                  icon={att.type === 'image' ? ImageIcon : File}
                  size="sm"
                  variant={att.type === 'image' ? 'accent' : 'warning'}
                />
                <div className="flex-1 min-w-0">
                  <Text variant="caption" className="truncate">{att.name}</Text>
                  <Text variant="label" color="muted">{att.size || 'Unknown Size'}</Text>
                </div>
                <Button
                  onClick={() => removeAttachment(att.id)}
                  variant="ghost"
                  size="sm"
                  className="p-1.5"
                >
                  <Trash2 size={12} strokeWidth={2.5} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#16181D] flex justify-center pb-6">
        <Button
          onClick={onSubmit}
          disabled={!form.title.trim()}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<Save size={18} strokeWidth={2.5} />}
        >
          Add Note
        </Button>
      </div>
    </div>
  )
}
