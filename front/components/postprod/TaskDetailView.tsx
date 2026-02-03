import React, { useCallback } from 'react'
import { Plus, Check, Calendar, Hash, Clock, Crop, Activity, Volume2, Layers, Monitor, ChevronDown } from 'lucide-react'
import { PostProdTask, Note } from '../../types'
import { POST_PROD_CATEGORIES } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'

import { ConfirmModal } from '../ui/ConfirmModal'

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
    { key: 'progress', label: 'In progress' },
    { key: 'review', label: 'Review' },
    { key: 'done', label: 'Done' }
  ]

  const renderMetadataField = (field: typeof categoryFields['Script'][0]) => {
    const Icon = field.icon
    const value = editedItem.metadata?.[field.key] as string || ''

    return (
      <div key={field.key}>
        <Text variant="subtitle" color="muted" className="mb-1.5 block">{field.label}</Text>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          {field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => updateMetadata(field.key, e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 appearance-none dark:text-white"
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => updateMetadata(field.key, e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 dark:focus:border-indigo-500 dark:text-white"
              placeholder={`e.g. ${field.key === 'scene' ? '12A' : field.key === 'duration' ? '2m 30s' : '4K'}`}
            />
          )}
        </div>
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
        <div className="p-2">
          <div className="mb-10">
            <Text variant="title" className="mb-2">Status</Text>
          </div>

          <div className="space-y-1">
            {statusOptions.map((status) => {
              const isActive = task.status === status.key
              return (
                <button
                  key={status.key}
                  onClick={() => onUpdateTask({ ...task, status: status.key as any })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' 
                      : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Text variant="body">{status.label}</Text>
                  {isActive ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-white/10"/>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        {isEditing ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Title</Text>
              <Input
                type="text"
                value={editedItem.title}
                onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                placeholder="Task title"
                variant="underline"
                fullWidth
                className="text-2xl"
              />
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Priority</Text>
                <div className="relative">
                  <select
                    value={editedItem.priority}
                    onChange={(e) => setEditedItem({ ...editedItem, priority: e.target.value as any })}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] appearance-none cursor-pointer pr-8"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Due date</Text>
                <input
                  type="date"
                  value={editedItem.dueDate || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, dueDate: e.target.value })}
                  className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Description</Text>
              <textarea
                value={editedItem.description || ''}
                onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                placeholder="Add description..."
                rows={4}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] resize-none"
              />
            </div>

            {categoryFields[editedItem.category] && (
              <div className="pt-2">
                <Text variant="subtitle" color="muted" className="mb-4 dark:text-white">Pipeline parameters</Text>
                <div className="grid grid-cols-2 gap-4">
                  {categoryFields[editedItem.category].map(renderMetadataField)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="w-full">
              <Text variant="subtitle" color="muted" className="mb-3 block text-center sm:text-left dark:text-white">
                Task info
              </Text>
              <div className={`flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 w-fit ${
                task.priority === 'critical' || task.priority === 'high'
                  ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'
                  : task.priority === 'medium'
                  ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'critical' || task.priority === 'high'
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : task.priority === 'medium'
                      ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                      : 'bg-gray-400'
                  }`} />
                  <Text variant="body">
                    {task.priority === 'critical' || task.priority === 'high' 
                      ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) 
                      : task.priority} priority
                  </Text>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Title</Text>
                <Text variant="title" className="block leading-tight py-1.5">
                  {task.title}
                </Text>
              </div>

              {task.dueDate && (
                <div className="flex flex-col gap-1 min-w-0">
                  <Text variant="subtitle" color="muted" className="dark:text-white">Due date</Text>
                  <Text variant="title" className="block leading-tight py-1.5">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                </div>
              )}

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <Text variant="subtitle" color="muted" className="dark:text-white">Category</Text>
                <Text variant="title" className="block leading-tight py-1.5">
                  {task.category}
                </Text>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Description</Text>
              <Text variant="body" color="secondary" className="whitespace-pre-wrap max-w-3xl">
                {task.description || "No description provided."}
              </Text>
            </div>

            {task.metadata && Object.keys(task.metadata).length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <Text variant="subtitle" color="muted" className="mb-4 dark:text-white">Metadata</Text>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8">
                  {Object.entries(task.metadata).map(([key, val]) => (
                    val ? (
                      <div key={key} className="group">
                        <Text variant="subtitle" color="muted" className="block mb-2.5 leading-none dark:text-white">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text variant="title">{String(val)}</Text>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <Text variant="subtitle" color="muted">Notes ({linkedNotes.length})</Text>
          <button 
            onClick={onAddNote} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:bg-blue-500/10 transition-all"
          >
            <Plus size={14} /> Add note
          </button>
        </div>

        {linkedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => onOpenNote(note.id)} 
                className="p-6 bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {note.title || "Untitled note"}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <Text variant="caption" color="muted">No notes for this task yet.</Text>
          </div>
        )}
      </section>

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
