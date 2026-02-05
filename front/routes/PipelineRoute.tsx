import React from 'react'
import { useRouteContext } from '@/hooks/useRouteContext'
import { PostProdView } from '@/components/postprod/PostProdView'

export const PipelineRoute = () => {
    const ctx = useRouteContext()

    return (
        <PostProdView
            tasks={ctx.activePostProdTasks}
            onAddTask={() => ctx.navigate('/pipeline/new')}
            onUpdateTask={ctx.updateTask}
            onSelectTask={(id) => ctx.navigate(`/pipeline/${id}`)}
            filters={ctx.postProdFilters}
            layout={ctx.postProdLayout}
        />
    )
}
