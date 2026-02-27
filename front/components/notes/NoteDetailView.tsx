import React, { useMemo, useCallback } from 'react'
import { Film, Briefcase, ExternalLink } from 'lucide-react'
import type { Note, Shot, PostProdTask } from '@/types'
import { useDetailView } from '@/hooks/useDetailView'
import { DetailViewLayout } from '@/components/organisms'
import { ActionButtonGroup } from '@/components/molecules'
import { DetailItem, EditableField, LinkedItemsList, EmptyState, MetadataGrid } from '@/components/molecules'
import { TerminalCard, ConfirmModal } from '@/components/ui'

interface NoteDetailViewProps {
  note: Note
  shots: Shot[]
  tasks: PostProdTask[]
  onClose: () => void
  onUpdateNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onNavigateToShot: (shotId: string) => void
  onNavigateToTask: (taskId: string) => void
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  note,
  shots,
  tasks,
  onClose,
  onUpdateNote,
  onDeleteNote,
  onNavigateToShot,
  onNavigateToTask
}) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    setEditedItem,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave: handleSaveBase,
    handleCancel,
    handleDelete: handleDeleteBase
  } = useDetailView<Note>({
    item: note,
    onUpdate: onUpdateNote,
    onDelete: onDeleteNote
  })

  const handleSave = useCallback(() => {
    onUpdateNote({
      ...editedItem,
      updatedAt: new Date().toISOString()
    })
    setIsEditing(false)
  }, [editedItem, onUpdateNote, setIsEditing])

  const handleDelete = useCallback(() => {
    onDeleteNote(note.id)
    setShowDeleteConfirm(false)
    onClose()
  }, [note.id, onDeleteNote, onClose, setShowDeleteConfirm])

  const linkedShot = useMemo(() => shots.find(s => s.id === note.shotId), [note.shotId, shots])
  const linkedTask = useMemo(() => tasks.find(t => t.id === note.taskId), [note.taskId, tasks])

  const dateString = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString()
    : (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '')

  const linkedItems = useMemo(() => {
    const items = []
    if (linkedShot) {
      items.push({
        id: linkedShot.id,
        title: linkedShot.title,
        subtitle: 'Sequence',
        icon: Film
      })
    }
    if (linkedTask) {
      items.push({
        id: linkedTask.id,
        title: linkedTask.title,
        subtitle: 'Task',
        icon: Briefcase
      })
    }
    return items
  }, [linkedShot, linkedTask])

  const headerActions = (
    <ActionButtonGroup
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onDelete={() => setShowDeleteConfirm(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )

  const renderLinkedItemContent = (item: { id: string }) => {
    if (item.id === linkedShot?.id) {
      return (
        <button
          onClick={() => onNavigateToShot(linkedShot.id)}
          className="w-full text-left p-2 hover:bg-secondary/50 transition-colors text-sm text-foreground"
        >
          View shot details →
        </button>
      )
    }
    if (item.id === linkedTask?.id) {
      return (
        <button
          onClick={() => onNavigateToTask(linkedTask.id)}
          className="w-full text-left p-2 hover:bg-secondary/50 transition-colors text-sm text-foreground"
        >
          View task details →
        </button>
      )
    }
    return null
  }

  return (
    <DetailViewLayout
      title={note.title || 'Untitled note'}
      subtitle={`Note • Updated ${dateString}`}
      detailLabel="Note detail"
      onBack={onClose}
      actions={headerActions}
      size="wide"
      sidebar={
        <div className="space-y-4">
          <LinkedItemsList
            title="Linked context"
            items={linkedItems}
            onItemClick={(id) => {
              if (id === linkedShot?.id) onNavigateToShot(id)
              if (id === linkedTask?.id) onNavigateToTask(id)
            }}
            expandable
            expandedContent={Object.fromEntries(linkedItems.map(item => [item.id, renderLinkedItemContent(item)]))}
            emptyMessage="Unlinked"
            emptyIcon={ExternalLink}
          />

          <TerminalCard header="Note details">
            <div className="p-2">
              <MetadataGrid cols={2} gapX={6} gapY={6}>
                <DetailItem
                  label="Last modified"
                  value={new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                />
                <DetailItem
                  label="Timestamp"
                  value={new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                />
              </MetadataGrid>
            </div>
          </TerminalCard>
        </div>
      }
    >
      <TerminalCard header="Core content" className="mb-4 md:mb-8">
        <div className="p-2 space-y-10">
          <EditableField
            label="Note title"
            value={editedItem.title}
            isEditing={isEditing}
            onChange={(value) => setEditedItem(prev => ({ ...prev, title: value }))}
            placeholder="Name your note..."
          />

          <EditableField
            label="Remarks & observations"
            value={editedItem.content}
            isEditing={isEditing}
            onChange={(value) => setEditedItem(prev => ({ ...prev, content: value }))}
            type="textarea"
            placeholder="Share your thoughts or observations..."
          />
        </div>
      </TerminalCard>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </DetailViewLayout>
  )
}
