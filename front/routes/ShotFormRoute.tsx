import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ShotFormPage } from '@/components/shots/ShotFormPage'

export const ShotFormRoute = () => {
    const ctx = useRouteContext()

    // Redirect to project creation if no projects exist
    if (!ctx.hasProjects) {
        ctx.navigate('/dashboard/projects/new')
        return null
    }

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
        <ShotFormPage
            onClose={() => ctx.navigate('/dashboard/shots')}
            onSwitchForm={handleSwitchForm}
            onSubmit={ctx.addShot}
            inventory={ctx.allInventory}
            existingShots={ctx.activeData.shots}
            hasProjects={ctx.hasProjects}
        />
    )
}
