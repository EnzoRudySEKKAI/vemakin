import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ProjectFormPage } from '@/components/projects/ProjectFormPage'

export const ProjectFormRoute = () => {
    const ctx = useRouteContext()

    return (
        <ProjectFormPage
            onClose={() => ctx.navigate('/dashboard/projects')}
            onSubmit={ctx.addProject}
        />
    )
}
