import React, { useRef, useMemo, useCallback } from 'react'
import { Plus, Image as ImageIcon, File, Film, Briefcase, ExternalLink, ArrowUpRight, Trash2 } from 'lucide-react'
import { Note, Shot, PostProdTask, Attachment } from '../../types'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { Textarea } from '../../components/atoms/Textarea'

import { ConfirmModal } from '../ui/ConfirmModal'

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

  const fileInputRef = useRef<HTMLInputElement>(null)

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

      setEditedItem(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }))

      if (!isEditing) {
        onUpdateNote({
          ...editedItem,
          attachments: [...(editedItem.attachments || []), newAttachment],
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  const removeAttachment = (attId: string) => {
    setEditedItem(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }))

    if (!isEditing) {
      onUpdateNote({
        ...editedItem,
        attachments: editedItem.attachments.filter(a => a.id !== attId),
        updatedAt: new Date().toISOString()
      })
    }
  }

  const linkedShot = useMemo(() => shots.find(s => s.id === note.shotId), [note.shotId, shots])
  const linkedTask = useMemo(() => tasks.find(t => t.id === note.taskId), [note.taskId, tasks])

  const dateString = note.updatedAt 
    ? new Date(note.updatedAt).toLocaleDateString() 
    : (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '')

  const headerActions = (
    <ActionButtonGroup
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onDelete={() => setShowDeleteConfirm(true)}
      onSave={handleSave}
      onCancel={() => {
        handleCancel()
      }}
    />
  )

  return (
    <DetailViewLayout
      title={note.title || 'Untitled note'}
      subtitle={`Note • Updated ${dateString}`}
      detailLabel="Note detail"
      onBack={onClose}
      actions={headerActions}
      size="wide"
      sidebar={
        <div className="p-2">
          <div className="mb-10">
            <Text variant="title" className="mb-2">Linked context</Text>
          </div>

          <div className="space-y-4">
            {linkedShot && (
              <button 
                onClick={() => onNavigateToShot(linkedShot.id)} 
                className="w-full p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Film size={20} />
                  </div>
                  <div className="text-left">
                    <Text variant="caption" color="muted">Sequence</Text>
                    <Text variant="body" className="group-hover:text-blue-600 transition-colors line-clamp-1">
                      Sc {linkedShot.sceneNumber} • {linkedShot.title}
                    </Text>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors"/>
              </button>
            )}
            {linkedTask && (
              <button 
                onClick={() => onNavigateToTask(linkedTask.id)} 
                className="w-full p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Briefcase size={20} />
                  </div>
                  <div className="text-left">
                    <Text variant="caption" color="muted">Task</Text>
                    <Text variant="body" className="group-hover:text-orange-500 transition-colors line-clamp-1">
                      {linkedTask.title}
                    </Text>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors"/>
              </button>
            )}
            {!linkedShot && !linkedTask && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ExternalLink size={32} className="text-gray-300 mb-3"/>
                <Text variant="caption" color="muted">No linked items</Text>
              </div>
            )}
          </div>

          <div className="mt-10 pt-10 border-t border-gray-100 dark:border-white/5">
            <Text variant="title" className="mb-6">Metadata</Text>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-1">
                <Text variant="subtitle" color="muted" className="dark:text-white">Last modified</Text>
                <Text variant="title" className="block leading-tight py-1.5">
                  {new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
              <div className="flex flex-col gap-1">
                <Text variant="subtitle" color="muted" className="dark:text-white">Created</Text>
                <Text variant="title" className="block leading-tight py-1.5">
                  {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        <div className="flex flex-col gap-1 min-w-0">
          <Text variant="subtitle" color="muted" className="dark:text-white">Title</Text>
          {isEditing ? (
            <Input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Note title"
              variant="underline"
              fullWidth
              className="text-2xl"
            />
          ) : (
            <Text variant="title" className="block leading-tight py-1.5">
              {note.title || 'Untitled note'}
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <Text variant="subtitle" color="muted" className="dark:text-white">Content</Text>
          {isEditing ? (
            <Textarea
              value={editedItem.content}
              onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
              placeholder="Write something..."
              size="lg"
              rows={8}
            />
          ) : (
            <Text variant="body" color="secondary" className="whitespace-pre-wrap max-w-3xl py-1.5">
              {note.content || 'No content provided.'}
            </Text>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <Text variant="subtitle" color="muted">Attachments ({editedItem.attachments?.length || 0})</Text>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:bg-blue-500/10 transition-all"
          >
            <Plus size={14} /> Add file
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {editedItem.attachments && editedItem.attachments.length > 0 ? (
            editedItem.attachments.map(att => (
              <div 
                key={att.id} 
                className="group relative bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-indigo-500/30 transition-all flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5">
                  {att.type === 'image' ? <ImageIcon size={20} className="text-blue-500"/> : <File size={20} className="text-gray-400"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <Text variant="caption" className="truncate">{att.name}</Text>
                  <Text variant="caption" color="muted">{att.size || 'N/A'}</Text>
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 bg-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
              <Text variant="caption" color="muted">No attachments for this note yet.</Text>
            </div>
          )}
        </div>
      </section>

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
