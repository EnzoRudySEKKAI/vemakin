import React, { useEffect } from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { InventoryView } from '@/components/inventory/InventoryView'
import { Loader2 } from 'lucide-react'

export const InventoryRoute = () => {
    const ctx = useRouteContext()
    
    // Check if specs are loaded when entering the page
    useEffect(() => {
        const hasSpecs = ctx.allInventory.some(item => 
            item.specs && Object.keys(item.specs).length > 0
        )
        
        if (!hasSpecs && !ctx.isLoadingInventorySpecs) {
            console.log('[InventoryRoute] Specs not loaded, fetching...')
            ctx.fetchInventorySpecs()
        }
    }, [])
    
    // Show loading spinner if specs are being loaded
    if (ctx.isLoadingInventorySpecs && ctx.allInventory.length > 0) {
        const hasSpecs = ctx.allInventory.some(item => 
            item.specs && Object.keys(item.specs).length > 0
        )
        
        if (!hasSpecs) {
            return (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full">
                    <Loader2 size={32} className="text-white/40 animate-spin mb-4" />
                    <p className="text-white/40 text-sm">Loading equipment specs...</p>
                </div>
            )
        }
    }

    return (
        <InventoryView
            inventory={ctx.allInventory}
            shots={ctx.activeData.shots}
            onEquipmentClick={(id) => ctx.navigate(`/dashboard/inventory/${id}`)}
            filters={ctx.inventoryFilters}
            currency={ctx.currency}
            layout={ctx.inventoryLayout}
            onAddEquipment={() => ctx.navigate('/dashboard/inventory/new')}
        />
    )
}
