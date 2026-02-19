import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ShotsView } from '@/components/shots/ShotsView'

export const ShotsRoute = () => {
    const ctx = useRouteContext()

    return (
        <ShotsView
            groupedShots={ctx?.groupedShots || {}}
            dates={ctx?.displayedDates || []}
            shotLayout={ctx?.shotLayout || 'timeline'}
            searchQuery={ctx?.shotSearchQuery || ''}
            statusFilter={(ctx?.shotStatusFilter as any) || 'all'}
            onShotClick={(s) => ctx?.navigate(`/dashboard/shots/${s.id}`)}
            onToggleStatus={ctx?.toggleShotStatus || (() => {})}
            onToggleEquipment={ctx?.toggleEquipmentStatus || (() => {})}
            onAddShot={() => ctx?.navigate('/dashboard/shots/new')}
            onDateInView={ctx?.setActiveDate}
            inventory={ctx?.allInventory || []}
        />
    )
}
