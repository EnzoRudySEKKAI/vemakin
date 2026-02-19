import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { OverviewView } from '@/components/dashboard/OverviewView'

export const OverviewRoute = () => {
    const ctx = useRouteContext()

    return (
        <OverviewView
            shots={ctx.activeData.shots}
            tasks={ctx.activeData.tasks}
            notes={ctx.activeData.notes}
            inventory={ctx.allInventory}
            currency={ctx.currency}
            user={ctx.currentUser}
            projects={ctx.projects}
            currentProject={ctx.currentProject}
            onSelectProject={ctx.setCurrentProject}
            onAddProject={(name) => ctx.addProject(name, {})}
            onAddClick={() => ctx.handleOpenActionSuite({ view: 'shot' })}
            onNavigateToShot={(s) => {
                ctx.setActiveDate(s.date)
                ctx.navigate(`/dashboard/shots/${s.id}`)
            }}
            onNavigateToShotsView={() => ctx.navigate('/dashboard/shots')}
            onNavigateToInventory={() => ctx.navigate('/dashboard/inventory')}
            onNavigateToPostProd={() => ctx.navigate('/dashboard/pipeline')}
            onNavigateToNotes={() => ctx.navigate('/dashboard/notes')}
            onNavigateToSettings={() => ctx.navigate('/dashboard/settings')}
            onSelectTask={(id) => ctx.navigate(`/dashboard/pipeline/${id}`)}
            onSelectNote={(id) => ctx.navigate(`/dashboard/notes/${id}`)}
        />
    )
}
