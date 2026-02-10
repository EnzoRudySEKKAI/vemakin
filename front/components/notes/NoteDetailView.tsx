import React, { useRef, useMemo, useCallback } from 'react'
import { Plus, Image as ImageIcon, File, Film, Briefcase, ExternalLink, ArrowUpRight, Trash2 } from 'lucide-react'
import { Note, Shot, PostProdTask, Attachment } from '../../types'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { Textarea } from '../../components/atoms/Textarea'
import { Card, SimpleCard, ListItem } from '../ui/Card'

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
        <div className="space-y-4">
          <Card title="Linked context">
            <div className="p-2 space-y-1">
              {linkedShot && (
                <button
                  onClick={() => onNavigateToShot(linkedShot.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Film size={16} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[10px] text-white/40 font-medium">Sequence</p>
                      <p className="text-sm text-white/50 font-medium truncate group-hover:text-white transition-colors">
                        {linkedShot.title}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={12} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
                </button>
              )}
              {linkedTask && (
                <button
                  onClick={() => onNavigateToTask(linkedTask.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                      <Briefcase size={16} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[10px] text-white/40 font-medium">Task</p>
                      <p className="text-sm text-white/50 font-medium truncate group-hover:text-white transition-colors">
                        {linkedTask.title}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={12} className="text-white/10 group-hover:text-orange-400 transition-colors" />
                </button>
              )}
              {!linkedShot && !linkedTask && (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-10">
                  <ExternalLink size={24} className="mb-2" />
                  <span className="text-[10px] font-medium">Unlinked</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Note details">
            <div className="p-4 space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/40 font-medium">Last modified</span>
                <div className="text-sm text-white/50 font-medium tracking-tight">
                  {new Date(note.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/40 font-medium">Timestamp</span>
                <div className="text-sm text-white/50 font-medium tracking-tight">
                  {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      }
    >
      <Card title="Core content" className="mb-8">
        <div className="p-6 space-y-10">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-white/40 font-medium mb-2">Note title</span>
            {isEditing ? (
              <Input
                type="text"
                value={editedItem.title}
                onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                placeholder="Name your note..."
                variant="underline"
                fullWidth
                className="text-2xl"
              />
            ) : (
              <div className="text-2xl text-white font-semibold leading-tight">
                {note.title || 'Untitled note'}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] text-white/40 font-medium mb-2">Remarks & observations</span>
            {isEditing ? (
              <Textarea
                value={editedItem.content}
                onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
                placeholder="Share your thoughts or observations..."
                className="min-h-[250px]"
              />
            ) : (
              <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-medium">
                {note.content || 'No specific content has been added to this note yet.'}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Production assets"
        subtitle={
          <span className="text-white/40">
            {editedItem.attachments?.length || 0} Files Attached
          </span>
        }
        headerRight={
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus size={12} strokeWidth={3} />
            Append File
          </button>
        }
      >
        <div className="p-6">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editedItem.attachments && editedItem.attachments.length > 0 ? (
              editedItem.attachments.map(att => (
                <div
                  key={att.id}
                  className="group relative bg-white/5 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-white/20 group-hover:text-indigo-400 group-hover:bg-indigo-400/10 transition-all">
                    {att.type === 'image' ? <ImageIcon size={18} /> : <File size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">{att.name}</p>
                    <p className="text-[10px] text-white/40 font-medium">{att.size || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-2 text-white/5 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <File size={24} />
                </div>
                <span className="text-[10px] font-medium">No documentation attached</span>
              </div>
            )}
          </div>
        </div>
      </Card>

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
