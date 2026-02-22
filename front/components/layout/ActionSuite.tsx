import { useState } from 'react'
import { X, Film, Package, Zap, StickyNote } from 'lucide-react'
import { PostProdTask, Equipment, Shot, Attachment } from '@/types'
import { NoteForm, NoteFormData } from '@/components/notes/NoteForm'
import { TaskForm, TaskFormData } from '@/components/postprod/TaskForm'
import { GearForm, GearFormData } from '@/components/inventory/GearForm'
import { ShotForm } from '@/components/action-suite/ShotForm'
import { ProjectForm } from '@/components/action-suite/ProjectForm'

interface ActionSuiteProps {
  onClose: () => void
  onCommitProject: (name: string, startDate: string, endDate: string, location: string, description: string) => void
  onCommitShot: (shot: Shot) => void
  onCommitGear: (gear: Equipment) => void
  onCommitTask: (task: PostProdTask) => void
  onCommitNote: (title: string, content: string, linkedId?: string, linkType?: 'shot' | 'task', attachments?: Attachment[]) => void
  inventory: Equipment[]
  currentProject: string
  existingShots: Shot[]
  existingTasks?: PostProdTask[]
  initialView?: ViewMode
  initialLink?: { type: 'shot' | 'task'; id: string }
}

type ViewMode = 'hub' | 'shot' | 'gear' | 'task' | 'note' | 'project'

const VIEWS = [
  { id: 'gear' as const, label: 'Gear', icon: Package, color: 'text-primary dark:text-bg-primary' },
  { id: 'shot' as const, label: 'Scene', icon: Film, color: 'text-primary dark:text-bg-primary' },
  { id: 'task' as const, label: 'Task', icon: Zap, color: 'text-orange-600' },
  { id: 'note' as const, label: 'Note', icon: StickyNote, color: 'text-gray-600' },
]

const VIEW_TITLES: Record<ViewMode, string> = {
  hub: 'Entry',
  gear: 'Register Gear',
  shot: 'Schedule Scene',
  project: 'Production',
  task: 'Pipeline Task',
  note: 'Creative Note'
}

export const ActionSuite = ({
  onClose,
  onCommitProject,
  onCommitShot,
  onCommitGear,
  onCommitTask,
  onCommitNote,
  inventory,
  existingShots,
  existingTasks = [],
  initialView,
  initialLink
}: ActionSuiteProps) => {
  const [view, setView] = useState<ViewMode>(initialView && initialView !== 'hub' ? initialView : 'shot')

  const handleCommitNote = (form: NoteFormData) => {
    onCommitNote(
      form.title,
      form.content,
      form.linkedId,
      form.linkType === 'none' ? undefined : form.linkType,
      form.attachments
    )
    onClose()
  }

  const handleCommitTask = (form: TaskFormData) => {
    onCommitTask({
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
    })
    onClose()
  }

  const handleCommitGear = (form: GearFormData) => {
    const modelName = form.modelName || form.brandName || form.categoryName || 'New Equipment'

    onCommitGear({
      id: `e-${Date.now()}`,
      name: modelName,
      catalogItemId: form.model || undefined,
      customName: form.name.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      category: form.category || 'Other',
      pricePerDay: form.isOwned ? 0 : form.price,
      rentalPrice: form.isOwned ? undefined : form.price,
      rentalFrequency: form.isOwned ? undefined : form.frequency,
      quantity: 1,
      isOwned: form.isOwned,
      status: 'operational',
      specs: form.specs || {}
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[2000] bg-[#F2F2F7] dark:bg-[#0F1116] flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-hidden"
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      }}
      onClick={onClose}
    >
      <div
        className="w-full md:w-[85vw] lg:max-w-5xl xl:max-w-6xl h-full md:h-auto flex flex-col justify-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative max-h-[95vh] md:max-h-[92vh] lg:max-h-[90vh] flex flex-col overflow-hidden border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40">
          <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-gray-300 dark:border-white/10 flex flex-col gap-6 shrink-0 bg-[#fafafa] dark:bg-[#0a0a0a]/40 z-20">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 p-1 bg-[#f5f5f5] dark:bg-[#16181D] border border-gray-300 dark:border-white/10 overflow-x-auto no-scrollbar">
                {view !== 'project' && VIEWS.map(v => {
                  const Icon = v.icon
                  const isActive = view === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={() => setView(v.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70 hover:bg-white dark:hover:bg-white/5'
                        }`}
                    >
                      <Icon size={14} strokeWidth={2.5} />
                      <span>{v.label}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Create New</span>
              <h1 className="text-2xl font-semibold mt-1">{VIEW_TITLES[view]}</h1>
            </div>
          </div>

          <div className="space-y-8 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 no-scrollbar pb-0 flex-1">
            {view === 'shot' && (
              <ShotForm
                inventory={inventory}
                existingShots={existingShots}
                onSubmit={(shot) => {
                  onCommitShot(shot)
                  onClose()
                }}
              />
            )}

            {view === 'note' && (
              <NoteForm
                form={{
                  title: '',
                  content: '',
                  linkType: initialLink?.type || 'none',
                  linkedId: initialLink?.id || '',
                  attachments: []
                }}
                setForm={() => {}}
                existingShots={existingShots}
                existingTasks={existingTasks}
                onSubmit={handleCommitNote}
              />
            )}

            {view === 'task' && (
              <TaskForm
                form={{
                  title: '',
                  category: 'Script',
                  status: 'todo',
                  priority: 'medium',
                  dueDate: new Date().toISOString().split('T')[0],
                  description: '',
                  metadata: {}
                }}
                setForm={() => {}}
                onSubmit={handleCommitTask}
              />
            )}

            {view === 'project' && (
              <ProjectForm onSubmit={onCommitProject} />
            )}

            {view === 'gear' && (
              <GearForm
                form={{
                  name: '',
                  serialNumber: '',
                  category: '',
                  categoryName: '',
                  brand: '',
                  brandName: '',
                  mount: '',
                  model: '',
                  modelName: '',
                  isOwned: true,
                  price: 0,
                  frequency: 'day',
                  customSpecs: [],
                  specs: {}
                }}
                setForm={() => {}}
                onSubmit={handleCommitGear}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
