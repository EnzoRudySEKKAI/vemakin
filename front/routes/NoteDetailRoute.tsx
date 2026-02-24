import React from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { NoteDetailView } from '@/components/notes/NoteDetailView'
import { DetailViewSkeleton } from '@/components/ui/DetailViewSkeleton'

export const NoteDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()

    const note = ctx.activeData.notes.find(n => n.id === id)

    // Show skeleton while data is loading, not "not found" error
    if (ctx.isLoading.notes) {
        return <DetailViewSkeleton />
    }

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
            onClose={navigateBack}
            onUpdateNote={ctx.updateNote}
            onDeleteNote={(id) => {
                ctx.deleteNote(id)
                ctx.navigate('/dashboard/notes')
            }}
            onNavigateToShot={(shotId) => ctx.navigate(`/dashboard/shots/${shotId}`)}
            onNavigateToTask={(taskId) => ctx.navigate(`/dashboard/pipeline/${taskId}`)}
        />
    )
}
