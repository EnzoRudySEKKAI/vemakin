import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { TaskFormPage } from '@/components/postprod/TaskFormPage'

export const TaskFormRoute = () => {
    const ctx = useRouteContext()

    const handleSwitchForm = (formType: 'gear' | 'shot' | 'task' | 'note') => {
        const paths = {
            gear: '/inventory/new',
            shot: '/shots/new',
            task: '/pipeline/new',
            note: '/notes/new'
        }
        ctx.navigate(paths[formType])
    }

    return (
        <TaskFormPage
            onClose={() => ctx.navigate('/pipeline')}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addTask}
        />
    )
}
