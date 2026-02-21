import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { EquipmentDetailView } from '@/components/inventory/EquipmentDetailView'
import { DetailViewSkeleton } from '@/components/ui/DetailViewSkeleton'
import { Equipment } from '@/types'
import { equipmentService } from '@/api/services/equipment'

export const EquipmentDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()
    const [isLoading, setIsLoading] = useState(true)
    const [itemWithSpecs, setItemWithSpecs] = useState<Equipment | null>(null)

    // Get item from inventory cache - this updates automatically when mutations complete
    const item = ctx.allInventory.find(e => e.id === id)

    useEffect(() => {
        const loadSpecs = async () => {
            if (!id || !item) {
                setIsLoading(false)
                return
            }

            // If we already have specs, use them
            if (item.specs && Object.keys(item.specs).length > 0) {
                setItemWithSpecs(item)
                setIsLoading(false)
                return
            }

            // Fetch full details including specs from API
            try {
                const detailedItem = await equipmentService.getById(id)
                if (detailedItem) {
                    setItemWithSpecs(detailedItem)
                }
            } catch (error) {
                console.error('Failed to load equipment specs:', error)
                // Fall back to item without specs
                setItemWithSpecs(item)
            }
            setIsLoading(false)
        }

        loadSpecs()
    }, [id, item])

    // Show skeleton while data is loading
    if (ctx.isLoading.inventory || isLoading) {
        return <DetailViewSkeleton />
    }

    if (!item) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Equipment not found</p>
            </div>
        )
    }

    // Use item with specs if available, otherwise use basic item
    const displayItem = itemWithSpecs || item

    // Find shots that use this equipment in the current project
    const shotsUsingEquipment = ctx.activeData.shots
        .filter(s => s.equipmentIds && s.equipmentIds.includes(id!))

    // Build projectData record with current project's shots
    const projectData: Record<string, { shots: typeof shotsUsingEquipment }> = {}
    if (shotsUsingEquipment.length > 0 && ctx.currentProject) {
        projectData[ctx.currentProject] = { shots: shotsUsingEquipment }
    }

    // Get involved projects (currently only current project since we only have its shots)
    const involvedProjects = shotsUsingEquipment.length > 0 ? [ctx.currentProject] : []

    return (
        <EquipmentDetailView
            item={displayItem}
            onClose={() => ctx.navigate('/dashboard/inventory')}
            projectData={projectData}
            involvedProjects={involvedProjects}
            onNavigateToShot={(projectName, shotId) => {
                ctx.setCurrentProject(projectName)
                ctx.navigate(`/dashboard/shots/${shotId}`)
            }}
            currency={ctx.currency}
            onUpdate={ctx.updateGear}
            onDelete={(id) => {
                ctx.deleteGear(id)
                ctx.navigate('/dashboard/inventory')
            }}
        />
    )
}