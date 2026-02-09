import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { NoteFormPage } from '@/components/notes/NoteFormPage'

export const NoteFormRoute = () => {
    const ctx = useRouteContext()

    const handleSwitchForm = (formType: 'gear' | 'shot' | 'task' | 'note') => {
        const paths = {
            gear: '/dashboard/inventory/new',
            shot: '/dashboard/shots/new',
            task: '/dashboard/pipeline/new',
            note: '/dashboard/notes/new'
        }
        ctx.navigate(paths[formType])
    }

    return (
        <NoteFormPage
            onClose={() => ctx.navigate('/dashboard/notes')}
            onSwitchForm={handleSwitchForm}
            onSubmit={(title, content, linkedId, linkType, attachments) => ctx.addNote({
                id: `note-${Date.now()}`,
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                shotId: linkType === 'shot' ? linkedId : undefined,
                taskId: linkType === 'task' ? linkedId : undefined,
                attachments: attachments || []
            })}
            existingShots={ctx.activeData.shots}
            existingTasks={ctx.activeData.tasks}
        />
    )
}
