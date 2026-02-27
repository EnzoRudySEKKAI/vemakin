import React, { useCallback, useMemo } from 'react'
import { Plus, Check, FileText, MessageSquare } from 'lucide-react'
import { PostProdTask, Note } from '../../types'
import { POST_PROD_CATEGORIES } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { DetailItem, EditableField, LinkedItemsList, EmptyState, MetadataGrid } from '../../components/molecules'
import { Text } from '../../components/atoms/Text'
import { ConfirmModal } from '../ui/ConfirmModal'
import { TerminalCard } from '../ui/TerminalCard'
import { DatePickerInput } from '../ui/DatePickerInput'

interface TaskDetailViewProps {
  task: PostProdTask
  notes: Note[]
  onClose: () => void
  onUpdateTask: (task: PostProdTask) => void
  onDeleteTask: (id: string) => void
  onAddNote: () => void
  onOpenNote: (id: string) => void
}

const categoryFields: Record<string, Array<{ key: string; label: string; type: 'text' | 'select'; options?: string[] }>> = {
  Script: [
    { key: 'scene', label: 'Scene reference', type: 'text' }
  ],
  Editing: [
    { key: 'duration', label: 'Target duration', type: 'text' },
    { key: 'aspectRatio', label: 'Aspect ratio', type: 'select', options: ['16:9', '9:16', '2.39:1', '4:3'] }
  ],
  Sound: [
    { key: 'sampleRate', label: 'Sample rate', type: 'select', options: ['44.1kHz', '48kHz', '96kHz'] },
    { key: 'bitDepth', label: 'Bit depth', type: 'select', options: ['16-bit', '24-bit', '32-bit float'] }
  ],
  VFX: [
    { key: 'shotType', label: 'Shot type', type: 'select', options: ['Cleanup', 'Keying', 'CGI', 'Compositing'] },
    { key: 'resolution', label: 'Resolution', type: 'text' }
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

  const linkedNotes = useMemo(() => 
    notes.filter(n => n.taskId === task.id),
    [notes, task.id]
  )

  const noteItems = useMemo(() => 
    linkedNotes.map(note => ({
      id: note.id,
      title: note.title || 'Untitled entry',
      subtitle: note.content
    })),
    [linkedNotes]
  )

  const categoryInfo = POST_PROD_CATEGORIES.find(c => c.label === task.category)

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

  const priorityVariant = task.priority === 'critical' || task.priority === 'high'
    ? 'danger'
    : task.priority === 'medium'
      ? 'warning'
      : 'default'

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
            <div className="space-y-1">
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

          <LinkedItemsList
            title="Related notes"
            items={noteItems}
            onItemClick={onOpenNote}
            variant="list"
            headerRight={
              <button
                onClick={onAddNote}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-mono tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Plus size={12} strokeWidth={3} /> New
              </button>
            }
            emptyMessage="No notes"
            emptyIcon={MessageSquare}
          />
        </div>
      }
    >
      <TerminalCard header="Goal & details" className="mb-4 md:mb-8">
        <div className="p-2">
          {isEditing ? (
            <div className="space-y-10">
              <EditableField
                label="Production title"
                value={editedItem.title}
                isEditing={isEditing}
                onChange={(value) => setEditedItem(prev => ({ ...prev, title: value }))}
                placeholder="Task title"
              />

              <MetadataGrid cols={1} colsMd={2} gapX={8} gapY={6}>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-3 block">Priority tier</span>
                  <select
                    value={editedItem.priority}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-transparent border border-border text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer pr-10 text-sm font-bold tracking-tight transition-all px-3 py-3"
                  >
                    <option value="low" className="bg-card">Low Tier</option>
                    <option value="medium" className="bg-card">Medium Tier</option>
                    <option value="high" className="bg-card">High Priority</option>
                    <option value="critical" className="bg-card">Mission Critical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-2">Completion deadline</span>
                  <DatePickerInput
                    value={editedItem.dueDate}
                    onChange={(date) => setEditedItem(prev => ({ ...prev, dueDate: date || '' }))}
                    fullWidth
                  />
                </div>
              </MetadataGrid>

              <EditableField
                label="Description"
                value={editedItem.description || ''}
                isEditing={isEditing}
                onChange={(value) => setEditedItem(prev => ({ ...prev, description: value }))}
                type="textarea"
                placeholder="Define the scope and technical requirements..."
              />

              {categoryFields[editedItem.category] && (
                <div className="pt-8 border-t border-border">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-6 block">Pipeline parameters</span>
                  <MetadataGrid cols={1} colsMd={2} gapX={8} gapY={6}>
                    {categoryFields[editedItem.category].map((field) => (
                      <EditableField
                        key={field.key}
                        label={field.label}
                        value={editedItem.metadata?.[field.key] as string || ''}
                        isEditing={isEditing}
                        onChange={(value) => updateMetadata(field.key, value)}
                        type={field.type as 'text' | 'select'}
                        options={(field.options || []).map(opt => ({ value: opt, label: opt }))}
                        placeholder={field.type === 'select' ? 'Select option...' : `e.g. ${field.key === 'scene' ? '12A' : field.key === 'duration' ? '2m 30s' : '4K'}`}
                      />
                    ))}
                  </MetadataGrid>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <MetadataGrid cols={3} gapX={8} gapY={6}>
                <DetailItem
                  label="Task name"
                  value={task.title}
                />
                <DetailItem
                  label="Due date"
                  value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline'}
                />
                <DetailItem
                  label="Department"
                  value={task.category}
                />
              </MetadataGrid>

              <div className={`flex items-center gap-4 px-5 py-3 border transition-all duration-500 ${
                priorityVariant === 'danger'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : priorityVariant === 'warning'
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-secondary/50 border-border text-muted-foreground'
              }`}>
                <div className={`w-2 h-2 ${
                  priorityVariant === 'danger'
                    ? 'bg-red-500'
                    : priorityVariant === 'warning'
                      ? 'bg-orange-500'
                      : 'bg-muted-foreground'
                }`} />
                <span className="text-[10px] font-mono tracking-wider">
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              </div>

              <DetailItem
                label="Description"
                value={task.description || "No specific objectives defined for this module."}
                valueClassName="whitespace-pre-wrap"
              />
            </div>
          )}
        </div>
      </TerminalCard>

      {task.metadata && Object.keys(task.metadata).length > 0 && (
        <TerminalCard header="Technical parameters">
          <div className="p-2">
            <MetadataGrid cols={2} colsMd={3} gapX={12} gapY={10}>
              {Object.entries(task.metadata).map(([key, val]) => (
                val ? (
                  <DetailItem
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    value={String(val)}
                  />
                ) : null
              ))}
            </MetadataGrid>
          </div>
        </TerminalCard>
      )}

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
