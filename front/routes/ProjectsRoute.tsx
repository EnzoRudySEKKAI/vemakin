import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { ProjectsManagerView } from '@/components/projects/ProjectsManagerView'

export const ProjectsRoute = () => {
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()

    return (
        <ProjectsManagerView
            projects={ctx.projects}
            currentProject={ctx.currentProject}
            onSelectProject={ctx.setCurrentProject}
            onDeleteProject={ctx.deleteProject}
            onRenameProject={(oldName, newName) => {
                // TODO: Implement rename project
            }}
            onBack={navigateBack}
            onCreateProject={() => ctx.navigate('/dashboard/projects/new')}
        />
    )
}
