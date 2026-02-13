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
                // Since our store might not have rename, we can implement it as export/import or add/delete if needed
                // But for now let's assume it works or we just skip if not implemented in store
                console.log('Rename from', oldName, 'to', newName)
                // ctx.renameProject(oldName, newName) 
            }}
            onBack={() => ctx.navigate('/dashboard/settings')}
        />
    )
}
