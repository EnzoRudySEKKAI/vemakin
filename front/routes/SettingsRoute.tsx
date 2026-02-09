import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { SettingsView } from '@/components/settings/SettingsView'

export const SettingsRoute = () => {
    const ctx = useRouteContext()

    return (
        <SettingsView
            user={ctx.currentUser}
            onLogin={() => { }} // Handled by auth flow
            onLogout={ctx.logout}
            onNavigateToProjects={() => ctx.navigate('/dashboard/projects')}
            onOpenNews={ctx.showNews}
            onOpenTutorial={ctx.showTutorial}
        />
    )
}
