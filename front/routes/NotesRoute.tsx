import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { NotesView } from '@/components/notes/NotesView'

export const NotesRoute = () => {
    const ctx = useRouteContext()

    return (
        <NotesView
            shots={ctx.activeData.shots}
            notes={ctx.activeData.notes}
            tasks={ctx.activeData.tasks}
            isAdding={false}
            setIsAdding={() => ctx.navigate('/dashboard/notes/new')}
            onAddNote={() => { }}
            onUpdateNote={ctx.updateNote}
            onDeleteNote={ctx.deleteNote}
            onSelectShot={(id) => ctx.navigate(`/dashboard/shots/${id}`)}
            onSelectNote={(id) => ctx.navigate(`/dashboard/notes/${id}`)}
            onSelectTask={(id) => ctx.navigate(`/dashboard/pipeline/${id}`)}
            filters={ctx.notesFilters}
            layout={ctx.notesLayout}
            gridColumns={ctx.notesGridColumns}
        />
    )
}
