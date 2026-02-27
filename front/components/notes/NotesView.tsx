import React, { useMemo } from 'react'
import { StickyNote, Calendar, Paperclip, Film } from 'lucide-react'
import { Shot, Note, PostProdTask, NotesFilters } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { CardItem } from '@/components/molecules/CardItem'
import { CardGrid } from '@/components/molecules/CardGrid'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CategoryIcon, getCategoryIcon } from '@/components/atoms/CategoryIcon'
import { formatDateToNumeric } from '@/utils'
import { POST_PROD_CATEGORIES } from '@/constants'

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
  gridColumns?: 2 | 3
}

const getContextIcon = (note: Note & { isAuto?: boolean }, shots: Shot[], tasks: PostProdTask[]) => {
  if (note.shotId || note.isAuto) return Film
  if (note.taskId) {
    const task = tasks.find(t => t.id === note.taskId)
    const catInfo = task ? POST_PROD_CATEGORIES.find(c => c.label === task.category) : null
    return catInfo?.icon || StickyNote
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
  layout = 'grid',
  gridColumns = 2
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
      <div className="centered-empty px-6 select-none">
        <EmptyState
          icon={StickyNote}
          title="No notes found"
          description="Adjust filters or create your first note."
          action={{ label: 'Add Note', onClick: () => setIsAdding(true) }}
          variant="default"
          size="lg"
        />
      </div>
    )
  }

  const renderNoteCard = (note: Note & { isAuto?: boolean }) => {
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
      <CardItem onClick={() => onSelectNote(note.id)}>
        <CardItem.Header>
          <CardItem.Icon icon={ContextIcon} size="sm" />
          <span className="text-xs font-mono tracking-wider text-muted-foreground">
            {contextLabel}
          </span>
        </CardItem.Header>
        
        <CardItem.Content>
          <CardItem.Title>{note.title}</CardItem.Title>
          <CardItem.Description lines={2}>{note.content}</CardItem.Description>
        </CardItem.Content>
        
        <CardItem.Footer>
          <CardItem.Meta icon={Calendar}>
            {formatDateToNumeric(note.updatedAt)}
          </CardItem.Meta>
          {note.attachments && note.attachments.length > 0 && (
            <CardItem.Meta icon={Paperclip}>
              {note.attachments.length}
            </CardItem.Meta>
          )}
        </CardItem.Footer>
      </CardItem>
    )
  }

  return (
    <div className="space-y-4">
      {layout === 'grid' ? (
        <CardGrid
          items={aggregatedNotes}
          columns={gridColumns as 1 | 2 | 3 | 4}
          keyExtractor={(note) => note.id}
        >
          {(note) => renderNoteCard(note)}
        </CardGrid>
      ) : (
        <TerminalCard header="Notes">
          <div className="space-y-2">
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
                  className="flex items-center gap-4 p-3 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CardItem.Icon icon={ContextIcon} />

                  <div className="flex-1 min-w-0">
                    <CardItem.Title>{note.title}</CardItem.Title>
                    <CardItem.Subtitle>{contextLabel}</CardItem.Subtitle>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <CardItem.Meta icon={Calendar}>
                      {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </CardItem.Meta>
                    {note.attachments && note.attachments.length > 0 && (
                      <CardItem.Meta icon={Paperclip}>
                        {note.attachments.length}
                      </CardItem.Meta>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TerminalCard>
      )}
    </div>
  )
})

NotesView.displayName = 'NotesView'
