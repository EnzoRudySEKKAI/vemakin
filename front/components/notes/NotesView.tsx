import React, { useMemo } from 'react'
import { FileText, Calendar, Film, StickyNote, Zap, Paperclip, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Shot, Note, PostProdTask, NotesFilters } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatDateToNumeric } from '@/utils'
import { POST_PROD_CATEGORIES } from '@/constants'
import { Button } from '@/components/atoms/Button'

interface NotesViewProps {
  shots: Shot[]
  notes: Note[]
  tasks?: PostProdTask[]
  isAdding: boolean
  setIsAdding: (val: boolean) => void
  onAddNote: (note: Partial<Note>) => void
  onUpdateNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onSelectShot: (id: string) => void
  onSelectNote: (id: string) => void
  onSelectTask: (id: string) => void
  filters: NotesFilters
  layout?: 'grid' | 'list'
}

const getContextIcon = (note: Note & { isAuto?: boolean }, shots: Shot[], tasks: PostProdTask[]) => {
  if (note.shotId || note.isAuto) return Film
  if (note.taskId) {
    const task = tasks.find(t => t.id === note.taskId)
    const catInfo = task ? POST_PROD_CATEGORIES.find(c => c.label === task.category) : null
    return catInfo?.icon || Zap
  }
  return StickyNote
}

export const NotesView: React.FC<NotesViewProps> = React.memo(({
  shots,
  notes,
  tasks = [],
  setIsAdding,
  onSelectNote,
  filters,
  layout = 'grid'
}) => {
  const aggregatedNotes = useMemo(() => {
    const manualNotes = notes.map(n => ({ ...n, isAuto: false }))

    const shotAutoNotes: (Note & { isAuto: boolean })[] = shots
      .filter(s => s.generalNotes && s.generalNotes.trim().length > 0)
      .map(s => ({
        id: `auto-shot-${s.id}`,
        title: `Scene Memo: ${s.title}`,
        content: s.generalNotes || '',
        createdAt: s.date,
        updatedAt: s.date,
        shotId: s.id,
        attachments: [],
        isAuto: true
      }))

    const combined = [...manualNotes, ...shotAutoNotes].sort((a, b) => {
      const dir = filters.sortDirection === 'asc' ? 1 : -1
      if (filters.sortBy === 'created') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      }
      if (filters.sortBy === 'alpha') {
        return a.title.localeCompare(b.title) * dir
      }
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir
    })

    return combined.filter(n => {
      if (filters.query) {
        const q = filters.query.toLowerCase()
        const matchesSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      if (filters.category === 'All') return true
      if (filters.category === 'Shots') return !!n.shotId || n.isAuto
      if (filters.category === 'General') return !n.shotId && !n.taskId && !n.isAuto

      if (n.taskId) {
        const task = tasks.find(t => t.id === n.taskId)
        if (task && task.category === filters.category) return true
      }

      return false
    })
  }, [shots, notes, tasks, filters])

  if (aggregatedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] w-full overflow-hidden px-6 select-none">
        <div className="w-14 h-14 bg-[#0D0D0F] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05]">
          <StickyNote size={24} className="text-white/40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-white mb-2">No Notes Found</h2>
          <p className="text-white/30 mb-8 text-sm">Adjust filters or create your first note.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsAdding(true)}
            leftIcon={<Plus size={18} strokeWidth={2.5} />}
          >
            Add Note
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aggregatedNotes.map(note => {
            const ContextIcon = getContextIcon(note, shots, tasks)
            const linkedShot = note.shotId ? shots.find(s => s.id === note.shotId) : null
            const linkedTask = note.taskId ? tasks.find(t => t.id === note.taskId) : null

            let contextLabel = "General Note"
            if (linkedShot || note.isAuto) {
              contextLabel = linkedShot ? `Scene ${linkedShot.sceneNumber}` : "Shot Note"
            } else if (linkedTask) {
              contextLabel = `${linkedTask.category}`
            }

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="group p-4 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] flex items-center justify-center border border-white/[0.05]">
                    <ContextIcon size={14} className="text-white/40" />
                  </div>
                  <div className="text-xs text-white/30 uppercase tracking-wider">{contextLabel}</div>
                </div>

                <div className="mb-3">
                  <h3 className="text-sm text-white font-medium mb-1 line-clamp-1">{note.title}</h3>
                  <p className="text-xs text-white/30 line-clamp-2">{note.content}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                    <Calendar size={10} />
                    {formatDateToNumeric(note.updatedAt)}
                  </div>

                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-white/20">
                      <Paperclip size={10} />
                      <span className="text-[10px]">{note.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card title="Notes">
          <div className="p-4 space-y-2">
            {aggregatedNotes.map(note => {
              const ContextIcon = getContextIcon(note, shots, tasks)
              const linkedShot = note.shotId ? shots.find(s => s.id === note.shotId) : null
              const linkedTask = note.taskId ? tasks.find(t => t.id === note.taskId) : null

              let contextLabel = "General"
              if (linkedShot || note.isAuto) {
                contextLabel = linkedShot ? `Scene ${linkedShot.sceneNumber}` : "Shot"
              } else if (linkedTask) {
                contextLabel = linkedTask.category
              }

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] flex items-center justify-center border border-white/[0.05] shrink-0">
                    <ContextIcon size={16} className="text-white/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{note.title}</div>
                    <div className="text-xs text-white/30">{contextLabel}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="text-xs text-white/30">
                      {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-white/20">
                        <Paperclip size={12} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
})

NotesView.displayName = 'NotesView'
