import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { TaskFormPage } from '@/components/postprod/TaskFormPage'

export const TaskFormRoute = () => {
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
        <TaskFormPage
            onClose={() => ctx.navigate('/dashboard/pipeline')}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addTask}
        />
    )
}
