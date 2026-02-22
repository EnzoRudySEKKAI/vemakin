import React from 'react'
import {
  Save, Calendar, Flag, Clock, Hash,
  PenLine, Scissors, Music, Layers, Palette, Crop
} from 'lucide-react'
import { PostProdTask } from '@/types'
import { Button, Text, Input, IconContainer, Textarea, Select } from '@/components/atoms'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { radius, typography } from '@/design-system'

export interface TaskFormData {
  title: string
  category: PostProdTask['category']
  status: PostProdTask['status']
  priority: PostProdTask['priority']
  dueDate: string
  description: string
  metadata: Record<string, string | number | boolean>
}

interface TaskFormProps {
  form: TaskFormData
  setForm: React.Dispatch<React.SetStateAction<TaskFormData>>
  onSubmit: () => void
}

const TASK_CATEGORIES = [
  { id: 'Script', icon: PenLine, color: 'text-primary dark:text-primary', bg: 'bg-primary/5' },
  { id: 'Editing', icon: Scissors, color: 'text-primary dark:text-primary', bg: 'bg-primary/5' },
  { id: 'Sound', icon: Music, color: 'text-primary dark:text-primary', bg: 'bg-primary/5' },
  { id: 'VFX', icon: Layers, color: 'text-primary dark:text-primary', bg: 'bg-primary/5' },
  { id: 'Color', icon: Palette, color: 'text-primary dark:text-primary', bg: 'bg-primary/5' },
]

export const TaskForm: React.FC<TaskFormProps> = ({ form, setForm, onSubmit }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-8">
        {/* Department */}
        <div>
          <Text variant="label" color="muted" className="mb-4 block">Department</Text>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {TASK_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon
              const isActive = form.category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id as any, metadata: {} }))}
                  className={`flex flex-col items-center gap-3 p-4 ${radius.xl} border-2 transition-all duration-300 group ${isActive
                    ? `bg-white dark:bg-[#2C2C30] border-primary dark:border-primary shadow-xl ring-8 ring-primary/5 dark:ring-primary/5 ${cat.color}`
                    : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 text-gray-300 dark:text-gray-600 hover:border-gray-200 dark:hover:border-white/20'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <CatIcon size={24} strokeWidth={2.5} />
                  </div>
                  <Text variant="label">{cat.id}</Text>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Text variant="label" color="muted" className="mb-2 block">Task Title</Text>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              placeholder="E.g. Master Grade Assembly"
            />
          </div>

          {/* Description */}
          <div>
            <Text variant="label" color="muted" className="mb-2 block">Brief / Description</Text>
            <Textarea
              value={form.description || ''}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add specific instructions or context..."
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Text variant="label" color="muted" className="mb-2 block">Due Date</Text>
              <div className="relative group min-w-0">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  fullWidth
                  className="pl-12"
                />
              </div>
            </div>

            <div>
              <Text variant="label" color="muted" className="mb-2 block">Priority</Text>
              <div className="relative group">
                <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
                <Select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                  fullWidth
                  className="pl-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Fields */}
        <TerminalCard header="Pipeline parameters" className="animate-in slide-in-from-top-4 duration-500">
          <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {form.category === 'Script' && (
              <div>
                <Text variant="label" color="muted" className="mb-2 block">Scene Reference</Text>
                <Input
                  type="text"
                  value={form.metadata['scene'] as string || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, scene: e.target.value } }))}
                  placeholder="E.g. 14B"
                  leftIcon={<Hash size={14} strokeWidth={2.5} className="text-gray-400" />}
                  fullWidth
                />
              </div>
            )}
            {form.category === 'Editing' && (
              <>
                <div>
                  <Text variant="label" color="muted" className="mb-2 block">Target Duration</Text>
                  <Input
                    type="text"
                    value={form.metadata['duration'] as string || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, duration: e.target.value } }))}
                    placeholder="E.g. 2m 30s"
                    leftIcon={<Clock size={14} strokeWidth={2.5} className="text-gray-400" />}
                    fullWidth
                  />
                </div>
                <div>
                  <Text variant="label" color="muted" className="mb-2 block">Aspect Ratio</Text>
                  <Select
                    value={form.metadata['aspectRatio'] as string || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, aspectRatio: e.target.value } }))}
                    options={[
                      { value: '', label: 'Select Ratio' },
                      { value: '16:9', label: '16:9 (Widescreen)' },
                      { value: '9:16', label: '9:16 (Vertical)' },
                      { value: '2.39:1', label: '2.39:1 (Cinema)' },
                      { value: '4:3', label: '4:3 (Classic)' },
                    ]}
                    leftIcon={<Crop size={14} strokeWidth={2.5} className="text-gray-400" />}
                    fullWidth
                  />
                </div>
              </>
            )}
          </div>
          </div>
        </TerminalCard>

        {/* Submit */}
        <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#16181D] flex justify-center pb-6">
          <Button
            onClick={onSubmit}
            disabled={!form.title.trim()}
            variant="primary"
            size="lg"
            rightIcon={<Save size={18} strokeWidth={2.5} />}
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  )
}
