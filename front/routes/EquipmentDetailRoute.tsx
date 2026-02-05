import React from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { EquipmentDetailView } from '@/components/inventory/EquipmentDetailView'

export const EquipmentDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()

    const item = ctx.allInventory.find(e => e.id === id)

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
            onClose={() => ctx.navigate('/inventory')}
            projectData={ctx.projectData}
            involvedProjects={involvedProjects}
            onNavigateToShot={(projectName, shotId) => {
                ctx.setCurrentProject(projectName)
                ctx.navigate(`/shots/${shotId}`)
            }}
            currency={ctx.currency}
            onUpdate={ctx.updateGear}
            onDelete={(id) => {
                ctx.deleteGear(id)
                ctx.navigate('/inventory')
            }}
        />
    )
}
