import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { GearFormPage } from '@/components/inventory/GearFormPage'

export const GearFormRoute = () => {
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
        <GearFormPage
            onClose={() => ctx.navigate('/dashboard/inventory')}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addGear}
        />
    )
}
