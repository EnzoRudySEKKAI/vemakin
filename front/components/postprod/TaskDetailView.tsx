import React, { useCallback } from 'react'
import { Plus, MessageSquare, Check, Calendar, Hash, Clock, Crop, Activity, Volume2, Layers, Monitor } from 'lucide-react'
import { PostProdTask, Note } from '../../types'
import { POST_PROD_CATEGORIES } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { FormTextarea } from '../../components/molecules/FormField'
import { ConfirmModal } from '../ui/ConfirmModal'
import { EmptyState } from '../ui/EmptyState'

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
        <div className="p-8 border border-white/60 dark:border-white/5 shadow-sm rounded-[32px] bg-white dark:bg-[#1C1C1E]">
          <Text variant="h4" className="mb-6">Status</Text>
          <div className="space-y-2">
            {statusOptions.map((status) => {
              const isActive = task.status === status.key
              return (
                <button
                  key={status.key}
                  onClick={() => onUpdateTask({ ...task, status: status.key as any })}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' 
                      : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50'
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
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-8 shadow-sm border border-gray-100/50 dark:border-white/5 mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <Input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Task title"
              variant="underline"
              fullWidth
              className="text-2xl"
            />
            <div className="flex gap-3">
              <select
                value={editedItem.priority}
                onChange={(e) => setEditedItem({ ...editedItem, priority: e.target.value as any })}
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 dark:text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="date"
                value={editedItem.dueDate || ''}
                onChange={(e) => setEditedItem({ ...editedItem, dueDate: e.target.value })}
                className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 dark:text-white focus:outline-none"
              />
            </div>
            <FormTextarea
              value={editedItem.description || ''}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Add description..."
              rows={4}
              className="min-h-[100px]"
            />

            {categoryFields[editedItem.category] && (
              <div className="pt-2">
                <Text variant="subtitle" color="muted" className="mb-3 ml-1">Pipeline parameters</Text>
                <div className="grid grid-cols-2 gap-4">
                  {categoryFields[editedItem.category].map(renderMetadataField)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Text variant="h3" className="mb-4">{task.title}</Text>
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                task.priority === 'critical' || task.priority === 'high'
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  : task.priority === 'medium'
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400'
              }`}>
                {task.priority === 'critical' || task.priority === 'high' 
                  ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) 
                  : task.priority} priority
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-semibold border border-gray-100 dark:border-white/10">
                  <Calendar size={12} strokeWidth={2.5} /> {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <Text variant="body" color="secondary" className="whitespace-pre-wrap">
              {task.description || "No description provided."}
            </Text>
            {task.metadata && Object.keys(task.metadata).length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-4">
                {Object.entries(task.metadata).map(([key, val]) => (
                  val ? (
                    <div key={key}>
                      <Text variant="subtitle" color="muted" className="block mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Text variant="body">{String(val)}</Text>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-2">
        <div className="flex items-center justify-between mb-3">
          <Text variant="subtitle" color="muted">Linked notes ({linkedNotes.length})</Text>
          <button 
            onClick={onAddNote} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-all"
          >
            <Plus size={12} strokeWidth={3} /> Add note
          </button>
        </div>

        {linkedNotes.length > 0 ? (
          <div className="space-y-3">
            {linkedNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => onOpenNote(note.id)} 
                className="p-4 bg-white dark:bg-[#1C1C1E] rounded-[20px] border border-gray-100 dark:border-white/10 shadow-sm flex items-start gap-4 cursor-pointer hover:border-blue-200 transition-all group"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl">
                  <MessageSquare size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <Text variant="body" className="truncate group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </Text>
                  <Text variant="caption" color="muted" className="truncate">{note.content}</Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No notes attached" icon={MessageSquare} compact iconColor="gray"/>
        )}
      </div>

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
