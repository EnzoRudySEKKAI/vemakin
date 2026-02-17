import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { EquipmentDetailView } from '@/components/inventory/EquipmentDetailView'
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-white/10 rounded-full mb-4"></div>
                    <p className="text-white/40 text-sm">Loading equipment details...</p>
                </div>
            </div>
        )
    }

    if (!item) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Equipment not found</p>
            </div>
        )
    }

    // Find all projects that use this equipment
    const involvedProjects = Array.from(new Set(
        ctx.activeData.shots
            .filter(s => s.equipmentIds && s.equipmentIds.includes(id!))
            .map(() => ctx.currentProject)
    ))

    return (
        <EquipmentDetailView
            item={item}
            onClose={() => ctx.navigate('/dashboard/inventory')}
            projectData={ctx.projectData}
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
