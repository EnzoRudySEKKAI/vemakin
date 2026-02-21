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
    const [item, setItem] = useState<Equipment | null>(null)

    useEffect(() => {
        const loadEquipment = async () => {
            if (!id) return
            
            // Check if we already have this item in store
            const existingItem = ctx.allInventory.find(e => e.id === id)
            
            if (existingItem && existingItem.specs && Object.keys(existingItem.specs).length > 0) {
                // Already have full details with specs
                setItem(existingItem)
                setIsLoading(false)
            } else {
                // Fetch full details including specs from API
                try {
                    const detailedItem = await equipmentService.getById(id)
                    if (detailedItem) {
                        setItem(detailedItem)
                    }
                } catch (error) {
                    console.error('Failed to load equipment:', error)
                }
                setIsLoading(false)
            }
        }

        loadEquipment()
    }, [id])

    if (isLoading) {
        return <DetailViewSkeleton />
    }

    if (!item) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Equipment not found</p>
            </div>
        )
    }

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
            item={item}
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
