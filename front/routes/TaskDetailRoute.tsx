import React from 'react'
import { useParams } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { TaskDetailView } from '@/components/postprod/TaskDetailView'
import { DetailViewSkeleton } from '@/components/ui/DetailViewSkeleton'

export const TaskDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()

    const task = ctx.activeData.tasks.find(t => t.id === id)

    // Show skeleton while data is loading, not "not found" error
    if (ctx.isLoading.tasks) {
        return <DetailViewSkeleton />
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Task not found</p>
            </div>
        )
    }

    return (
        <TaskDetailView
            task={task}
            notes={ctx.activeData.notes}
            onClose={navigateBack}
            onUpdateTask={ctx.updateTask}
            onDeleteTask={(id) => {
                ctx.deleteTask(id)
                ctx.navigate('/dashboard/pipeline')
            }}
            onAddNote={() => ctx.handleOpenActionSuite({ view: 'note', link: { type: 'task', id: id! } })}
            onOpenNote={(noteId) => ctx.navigate(`/dashboard/notes/${noteId}`)}
        />
    )
}
