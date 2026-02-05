import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ProjectsManagerView } from '@/components/projects/ProjectsManagerView'

export const ProjectsRoute = () => {
    const ctx = useRouteContext()

    return (
        <ProjectsManagerView
            projects={ctx.projects}
            activeProject={ctx.currentProject}
            onSelectProject={ctx.setCurrentProject}
            onAddProject={(name) => ctx.addProject(name, {})}
            onDeleteProject={ctx.deleteProject}
            onExportProject={ctx.exportProject}
            onImportProject={ctx.importProject}
        />
    )
}
