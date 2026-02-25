import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { CustomizationView } from '@/components/settings/CustomizationView'
import { useUIStore } from '@/stores/useUIStore'

export const CustomizationRoute = () => {
    const ctx = useRouteContext()
    const {
        postProdGridColumns,
        notesGridColumns,
        inventoryGridColumns,
        hubCardOrder,
        hubShotsLimit,
        hubTasksLimit,
        hubNotesLimit,
        hubEquipmentLimit,
        setPostProdGridColumns,
        setNotesGridColumns,
        setInventoryGridColumns,
        setHubCardOrder,
        setHubShotsLimit,
        setHubTasksLimit,
        setHubNotesLimit,
        setHubEquipmentLimit
    } = useUIStore()

    return (
        <CustomizationView
            onNavigateBack={() => ctx.navigate('/dashboard/settings')}
            postProdGridColumns={postProdGridColumns}
            notesGridColumns={notesGridColumns}
            inventoryGridColumns={inventoryGridColumns}
            hubCardOrder={hubCardOrder}
            hubShotsLimit={hubShotsLimit}
            hubTasksLimit={hubTasksLimit}
            hubNotesLimit={hubNotesLimit}
            hubEquipmentLimit={hubEquipmentLimit}
            onPostProdGridColumnsChange={setPostProdGridColumns}
            onNotesGridColumnsChange={setNotesGridColumns}
            onInventoryGridColumnsChange={setInventoryGridColumns}
            onHubCardOrderChange={setHubCardOrder}
            onHubShotsLimitChange={setHubShotsLimit}
            onHubTasksLimitChange={setHubTasksLimit}
            onHubNotesLimitChange={setHubNotesLimit}
            onHubEquipmentLimitChange={setHubEquipmentLimit}
        />
    )
}
