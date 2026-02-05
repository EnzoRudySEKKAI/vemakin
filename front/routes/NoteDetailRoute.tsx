import React from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { NoteDetailView } from '@/components/notes/NoteDetailView'

export const NoteDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()

    const note = ctx.activeData.notes.find(n => n.id === id)

    if (!note) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Note not found</p>
            </div>
        )
    }

    return (
        <NoteDetailView
            note={note}
            shots={ctx.activeData.shots}
            tasks={ctx.activeData.tasks}
            onClose={() => ctx.navigate('/notes')}
            onUpdateNote={ctx.updateNote}
            onDeleteNote={(id) => {
                ctx.deleteNote(id)
                ctx.navigate('/notes')
            }}
            onNavigateToShot={(shotId) => ctx.navigate(`/shots/${shotId}`)}
            onNavigateToTask={(taskId) => ctx.navigate(`/pipeline/${taskId}`)}
        />
    )
}
