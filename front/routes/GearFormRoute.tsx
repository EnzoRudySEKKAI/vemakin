import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { GearFormPage } from '@/components/inventory/GearFormPage'

export const GearFormRoute = () => {
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()

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
            onClose={navigateBack}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addGear}
        />
    )
}
