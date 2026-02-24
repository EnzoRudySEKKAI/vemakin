import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { ProjectFormPage } from '@/components/projects/ProjectFormPage'

export const ProjectFormRoute = () => {
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()

    return (
        <ProjectFormPage
            onClose={navigateBack}
            onSubmit={ctx.addProject}
        />
    )
}
