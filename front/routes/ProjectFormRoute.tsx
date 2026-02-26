import React from 'react'
import { useLocation } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { ProjectFormPage } from '@/components/projects/ProjectFormPage'
import { useUpdateUserProfile } from '@/hooks/useApi'
import { useAuthStore } from '@/stores/useAuthStore'

export const ProjectFormRoute = () => {
    const ctx = useRouteContext()
    const navigateBack = useNavigateBack()
    const location = useLocation()
    const updateUserProfile = useUpdateUserProfile()

    const isFirstProject = location.state?.isFirstProject === true

    const handleSubmit = async (name: string) => {
        await ctx.addProject(name, {})
        
        // If this is the first project from onboarding, update first_connection to false
        if (isFirstProject) {
            await updateUserProfile.mutateAsync({ firstConnection: false })
            useAuthStore.getState().updateFirstConnection(false)
        }
    }

    return (
        <ProjectFormPage
            onClose={navigateBack}
            onSubmit={handleSubmit}
            isFirstProject={isFirstProject}
        />
    )
}
