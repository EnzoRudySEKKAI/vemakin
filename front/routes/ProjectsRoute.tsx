import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ProjectsManagerView } from '@/components/projects/ProjectsManagerView'

export const ProjectsRoute = () => {
    const ctx = useRouteContext()

    return (
        <ProjectsManagerView
            projects={ctx.projects}
            currentProject={ctx.currentProject}
            onSelectProject={ctx.setCurrentProject}
            onDeleteProject={ctx.deleteProject}
            onRenameProject={(oldName, newName) => {
                // TODO: Implement rename project
            }}
            onBack={() => ctx.navigate('/dashboard/settings')}
            onCreateProject={() => ctx.navigate('/dashboard/projects/new')}
        />
    )
}
