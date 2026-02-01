import React, { useRef, useMemo, useCallback } from 'react'
import { Plus, Paperclip, Image as ImageIcon, File, Film, Briefcase, ExternalLink, ArrowUpRight, Clock, Trash2 } from 'lucide-react'
import { Note, Shot, PostProdTask, Attachment } from '../../types'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { FormTextarea } from '../../components/molecules/FormField'
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
        <div className="p-8 border border-white/60 dark:border-white/5 shadow-sm rounded-[32px] bg-white dark:bg-[#1C1C1E] h-fit">
          <Text variant="h4" className="mb-6">Linked context</Text>
          <div className="space-y-4">
            {linkedShot && (
              <button 
                onClick={() => onNavigateToShot(linkedShot.id)} 
                className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                className="w-full bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98]"
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
              <div className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-100 dark:border-white/5">
                <ExternalLink size={24} className="text-gray-300 mb-2"/>
                <Text variant="caption" color="muted">No linked items</Text>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Clock size={14} />
              <Text variant="caption" color="muted">Metadata</Text>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <Text variant="caption" color="muted" className="mb-1">Last modified</Text>
                <Text variant="body">
                  {new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <Text variant="caption" color="muted" className="mb-1">Created</Text>
                <Text variant="body">
                  {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-[28px] p-8 shadow-sm mb-6">
        <Text variant="label" color="muted" className="ml-1 block mb-3">Note content</Text>
        {isEditing ? (
          <div className="space-y-4">
            <Input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
              placeholder="Note title"
              fullWidth
            />
            <FormTextarea
              value={editedItem.content}
              onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
              placeholder="Write something..."
              rows={8}
              className="min-h-[300px]"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Text variant="h3">{note.title || 'Untitled note'}</Text>
            <div className="h-px bg-gray-100 dark:bg-white/5 w-full"/>
            <Text variant="body" color="secondary" className="whitespace-pre-wrap">
              {note.content || 'No content provided.'}
            </Text>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 rounded-[28px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center text-blue-600 dark:text-[#4E47DD]">
              <Paperclip size={18} />
            </div>
            <div>
              <Text variant="body">Attachments</Text>
              <Text variant="caption" color="muted">{editedItem.attachments?.length || 0} files</Text>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all border border-gray-200 dark:border-white/10"
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
                className="group relative bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-indigo-500/30 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 shadow-sm">
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
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/[0.01] rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
              <Paperclip size={32} className="text-gray-300 mb-3"/>
              <Text variant="caption" color="muted">No files attached yet</Text>
              <Text variant="caption" color="muted" className="mt-1">Images, documents, and references</Text>
            </div>
          )}
        </div>
      </div>

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
