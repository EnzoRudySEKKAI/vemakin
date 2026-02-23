import React, { useCallback } from 'react'
import { Plus, Check, Calendar, Hash, Clock, Crop, Activity, Volume2, Layers, Monitor, ChevronDown } from 'lucide-react'
import { PostProdTask, Note } from '../../types'
import { POST_PROD_CATEGORIES } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { DetailItem } from '../../components/molecules'
import { Text, Input, Textarea, Select } from '../../components/atoms'

import { ConfirmModal } from '../ui/ConfirmModal'
import { TerminalCard } from '../ui/TerminalCard'
import { FileText, MessageSquare } from 'lucide-react'

interface TaskDetailViewProps {
  task: PostProdTask
  notes: Note[]
  onClose: () => void
  onUpdateTask: (task: PostProdTask) => void
  onDeleteTask: (id: string) => void
  onAddNote: () => void
  onOpenNote: (id: string) => void
}

const categoryFields: Record<string, Array<{ key: string; label: string; icon: any; type: 'text' | 'select'; options?: string[] }>> = {
  Script: [
    { key: 'scene', label: 'Scene reference', icon: Hash, type: 'text' }
  ],
  Editing: [
    { key: 'duration', label: 'Target duration', icon: Clock, type: 'text' },
    { key: 'aspectRatio', label: 'Aspect ratio', icon: Crop, type: 'select', options: ['16:9', '9:16', '2.39:1', '4:3'] }
  ],
  Sound: [
    { key: 'sampleRate', label: 'Sample rate', icon: Activity, type: 'select', options: ['44.1kHz', '48kHz', '96kHz'] },
    { key: 'bitDepth', label: 'Bit depth', icon: Volume2, type: 'select', options: ['16-bit', '24-bit', '32-bit float'] }
  ],
  VFX: [
    { key: 'shotType', label: 'Shot type', icon: Layers, type: 'select', options: ['Cleanup', 'Keying', 'CGI', 'Compositing'] },
    { key: 'resolution', label: 'Resolution', icon: Monitor, type: 'text' }
  ]
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  notes,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddNote,
  onOpenNote
}) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    setEditedItem,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleCancel
  } = useDetailView<PostProdTask>({
    item: task,
    onUpdate: onUpdateTask,
    onDelete: onDeleteTask
  })

  const handleSave = useCallback(() => {
    onUpdateTask({
      ...editedItem,
      updatedAt: new Date().toISOString()
    })
    setIsEditing(false)
  }, [editedItem, onUpdateTask, setIsEditing])

  const handleDelete = useCallback(() => {
    onDeleteTask(task.id)
    setShowDeleteConfirm(false)
    onClose()
  }, [onDeleteTask, task.id, onClose, setShowDeleteConfirm])

  const updateMetadata = (key: string, value: string) => {
    setEditedItem(prev => ({
      ...prev,
      metadata: {
        ...(prev.metadata || {}),
        [key]: value
      }
    }))
  }

  const linkedNotes = notes.filter(n => n.taskId === task.id)
  const categoryInfo = POST_PROD_CATEGORIES.find(c => c.label === task.category)
  const CategoryIcon = categoryInfo ? categoryInfo.icon : () => null

  const headerActions = (
    <ActionButtonGroup
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onDelete={() => setShowDeleteConfirm(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )

  const statusOptions = [
    { key: 'todo', label: 'To do' },
    { key: 'progress', label: 'Progress' },
    { key: 'review', label: 'In review' },
    { key: 'done', label: 'Done' }
  ]

  const renderMetadataField = (field: typeof categoryFields['Script'][0]) => {
    const Icon = field.icon
    const value = editedItem.metadata?.[field.key] as string || ''

    return (
      <div key={field.key}>
        <Text variant="subtitle" color="muted" className="mb-1.5 block">{field.label}</Text>
        {field.type === 'select' ? (
          <Select
            value={value}
            onChange={(e) => updateMetadata(field.key, e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              ...(field.options?.map(opt => ({ value: opt, label: opt })) || [])
            ]}
            leftIcon={<Icon size={14} strokeWidth={2.5} className="text-muted-foreground" />}
            fullWidth
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateMetadata(field.key, e.target.value)}
            placeholder={`e.g. ${field.key === 'scene' ? '12A' : field.key === 'duration' ? '2m 30s' : '4K'}`}
            leftIcon={<Icon size={14} strokeWidth={2.5} className="text-muted-foreground" />}
            fullWidth
          />
        )}
      </div>
    )
  }

  return (
    <DetailViewLayout
      title={task.title}
      detailLabel="Task Detail"
      onBack={onClose}
      actions={headerActions}
      size="wide"
      sidebar={
        <div className="space-y-4">
          <TerminalCard header="Status">
            <div className="">
              {statusOptions.map((status) => {
                const isActive = task.status === status.key
                return (
                  <button
                    key={status.key}
                    onClick={() => onUpdateTask({ ...task, status: status.key as any })}
                    className={`w-full flex items-center justify-between p-2 transition-all border ${isActive
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                  >
                    <span className="text-sm font-medium">{status.label}</span>
                    {isActive ? (
                      <div className="w-5 h-5 bg-primary flex items-center justify-center text-primary-foreground">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-border bg-secondary" />
                    )}
                  </button>
                )
              })}
            </div>
          </TerminalCard>
        </div>
      }
    >
      <TerminalCard header="Goal & details" className="mb-8">
        <div className="p-2">
          {isEditing ? (
            <div className="space-y-10">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-2">Production title</span>
                <Input
                  type="text"
                  value={editedItem.title}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                  fullWidth
                  className="text-2xl font-bold tracking-tight"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-3 block">Priority tier</span>
                  <div className="relative group">
                  <select
                    value={editedItem.priority}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-transparent border border-border text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer pr-10 text-sm font-bold tracking-tight transition-all"
                  >
                    <option value="low" className="bg-card">Low Tier</option>
                    <option value="medium" className="bg-card">Medium Tier</option>
                    <option value="high" className="bg-card">High Priority</option>
                    <option value="critical" className="bg-card">Mission Critical</option>
                  </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary pointer-events-none transition-colors" size={16} strokeWidth={3} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-2">Completion deadline</span>
                  <Input
                    type="date"
                    value={editedItem.dueDate || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, dueDate: e.target.value }))}
                    fullWidth
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-2">Description</span>
                <Textarea
                  value={editedItem.description || ''}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Define the scope and technical requirements..."
                  className="min-h-[160px]"
                />
              </div>

              {categoryFields[editedItem.category] && (
                <div className="pt-8 border-t border-border">
                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-6 block">Pipeline parameters</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {categoryFields[editedItem.category].map((field) => (
                      <div key={field.key} className="group">
                        <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-2 block group-hover:text-primary transition-colors">{field.label}</span>
                        {field.type === 'select' ? (
                          <div className="relative">
                          <select
                            value={editedItem.metadata?.[field.key] as string || ''}
                            onChange={(e) => updateMetadata(field.key, e.target.value)}
                            className="w-full bg-transparent border border-border px-3 py-3 text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer pr-10 text-sm font-bold tracking-tight transition-all"
                          >
                            <option value="" className="bg-card">Select option...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt} className="bg-card">{opt}</option>
                            ))}
                          </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <Input
                            type="text"
                            value={editedItem.metadata?.[field.key] as string || ''}
                            onChange={(e) => updateMetadata(field.key, e.target.value)}
                            placeholder="..."
                            fullWidth
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 md:grid-cols-3">
                <div>
                  <DetailItem
                    label="Task name"
                    value={task.title}
                  />
                </div>

                <div >
                  <DetailItem
                    label="Due date"
                    value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline'}
                  />
                </div>
                <div>
                  <DetailItem
                    label="Department"
                    value={task.category}
                  />
                </div>
              </div>

              <div className={`flex items-center gap-4 px-5 py-3 border transition-all duration-500 ${task.priority === 'critical' || task.priority === 'high'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : task.priority === 'medium'
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-secondary/50 border-border text-muted-foreground'
                  }`}
                >
                  <div className={`w-2 h-2 ${task.priority === 'critical' || task.priority === 'high'
                    ? 'bg-red-500'
                    : task.priority === 'medium'
                      ? 'bg-orange-500'
                      : 'bg-muted-foreground'
                    }`} />
                  <span className="text-[10px] font-mono  tracking-wider">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>

              <div className="max-w-3xl">
                <DetailItem
                  label="Description"
                  value={task.description || "No specific objectives defined for this module."}
                  valueClassName="whitespace-pre-wrap"
                />
              </div>

              {task.metadata && Object.keys(task.metadata).length > 0 && (
                <div className="pt-10 border-t border-border">
                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground block mb-8 leading-none">Technical parameters</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-12">
                    {Object.entries(task.metadata).map(([key, val]) => (
                      val ? (
                        <DetailItem
                          key={key}
                          label={key.replace(/([A-Z])/g, ' $1').trim()}
                          value={String(val)}
                        />
                      ) : null
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </TerminalCard>

      <TerminalCard header="Related notes" headerRight={
        <button
          onClick={onAddNote}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-mono  tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Plus size={12} strokeWidth={3} /> New entry
        </button>
      }>
        <div className="">
          {linkedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {linkedNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onOpenNote(note.id)}
                  className="p-6 bg-secondary/30 border border-border cursor-pointer hover:border-primary/30 hover:bg-secondary/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <FileText size={40} />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title || "Untitled entry"}
                  </h4>
                  <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">{note.content}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-mono  tracking-wider text-muted-foreground">
                    <Clock size={10} />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-10">
              <div className="p-4 bg-secondary mb-4">
                <MessageSquare size={32} />
              </div>
              <span className="text-[10px] font-mono  tracking-wider text-foreground">No documentation recorded</span>
            </div>
          )}
        </div>
      </TerminalCard>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </DetailViewLayout>
  )
}
