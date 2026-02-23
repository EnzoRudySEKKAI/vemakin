import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { InventoryView } from '@/components/inventory/InventoryView'

export const InventoryRoute = () => {
    const ctx = useRouteContext()
    
    return (
        <InventoryView
            inventory={ctx.allInventory}
            shots={ctx.activeData.shots}
            onEquipmentClick={(id) => ctx.navigate(`/dashboard/inventory/${id}`)}
            filters={ctx.inventoryFilters}
            currency={ctx.currency}
            layout={ctx.inventoryLayout}
            onAddEquipment={() => ctx.navigate('/dashboard/inventory/new')}
            gridColumns={ctx.inventoryGridColumns}
        />
    )
}
