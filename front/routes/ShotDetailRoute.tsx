import React from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { ShotDetailView } from '@/components/shots/ShotDetailView'
import { DetailViewSkeleton } from '@/components/ui/DetailViewSkeleton'

export const ShotDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()

    const selectedShot = ctx.activeData.shots.find(s => s.id === id)

    // Show skeleton while data is loading, not "not found" error
    if (ctx.isLoading.shots) {
        return <DetailViewSkeleton />
    }

    if (!selectedShot) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Shot not found</p>
            </div>
        )
    }

    return (
        <ShotDetailView
            selectedShot={selectedShot}
            allShots={ctx.activeData.shots}
            notes={ctx.activeData.notes}
            onClose={() => ctx.navigate('/dashboard/shots')}
            onToggleStatus={ctx.toggleShotStatus}
            onToggleEquipment={ctx.toggleEquipmentStatus}
            onUpdateShot={ctx.updateShot}
            onDeleteShot={(id) => {
                ctx.deleteShot(id)
                ctx.navigate('/dashboard/shots')
            }}
            onRetakeShot={(id, newDate, newTime) => {
                const original = ctx.activeData.shots.find(s => s.id === id)
                if (original) {
                    ctx.addShot({
                        ...original,
                        id: crypto.randomUUID(),
                        date: newDate,
                        startTime: newTime,
                        status: 'pending'
                    })
                }
            }}
            onAddNote={(note) => ctx.addNote({
                ...note,
                shotId: id!,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as any)}
            onOpenNote={(noteId) => ctx.navigate(`/dashboard/notes/${noteId}`)}
            inventory={ctx.allInventory}
            currency={ctx.currency}
        />
    )
}
