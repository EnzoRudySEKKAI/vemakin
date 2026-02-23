import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { SettingsView } from '@/components/settings/SettingsView'
import { useUIStore } from '@/stores/useUIStore'

export const SettingsRoute = () => {
    const ctx = useRouteContext()
    const {
        postProdGridColumns,
        notesGridColumns,
        inventoryGridColumns,
        hubCardOrder,
        setPostProdGridColumns,
        setNotesGridColumns,
        setInventoryGridColumns,
        setHubCardOrder
    } = useUIStore()

    return (
        <SettingsView
            user={ctx.currentUser}
            onLogin={() => { }}
            onLogout={ctx.logout}
            onNavigateToProjects={() => ctx.navigate('/dashboard/projects')}
            onOpenTutorial={ctx.showTutorial}
            darkMode={ctx.darkMode}
            onToggleDarkMode={ctx.toggleDarkMode}
            postProdGridColumns={postProdGridColumns}
            notesGridColumns={notesGridColumns}
            inventoryGridColumns={inventoryGridColumns}
            hubCardOrder={hubCardOrder}
            onPostProdGridColumnsChange={setPostProdGridColumns}
            onNotesGridColumnsChange={setNotesGridColumns}
            onInventoryGridColumnsChange={setInventoryGridColumns}
            onHubCardOrderChange={setHubCardOrder}
        />
    )
}
