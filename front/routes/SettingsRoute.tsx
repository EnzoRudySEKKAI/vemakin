import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { SettingsView } from '@/components/settings/SettingsView'

export const SettingsRoute = () => {
    const ctx = useRouteContext()

    return (
        <SettingsView
            user={ctx.currentUser}
            onLogin={() => { }}
            onLogout={ctx.logout}
            onNavigateToProjects={() => ctx.navigate('/dashboard/projects')}
            onOpenTutorial={ctx.showTutorial}
            darkMode={ctx.darkMode}
            onToggleDarkMode={ctx.toggleDarkMode}
        />
    )
}
