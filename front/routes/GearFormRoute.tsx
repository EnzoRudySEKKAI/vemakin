import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { GearFormPage } from '@/components/inventory/GearFormPage'

export const GearFormRoute = () => {
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
        <GearFormPage
            onClose={() => ctx.navigate('/inventory')}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addGear}
        />
    )
}
