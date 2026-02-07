// Domain-specific stores for Vemakin
// These stores handle local UI state, while data is fetched via React Query

export { useAuthStore } from './useAuthStore'
export { useUIStore } from './useUIStore'
export { useProjectStore } from './useProjectStore'

// Re-export selectors and hooks from the old store for backward compatibility
// These can be gradually migrated to use the new hooks

import { useMemo } from 'react'
import { useProjectStore } from './useProjectStore'
import { useShots, useNotes, useTasks } from '@/hooks/useApi'

// Combined hook for backward compatibility
export const useActiveData = (projectId: string) => {
  const shotsQuery = useShots(projectId, { limit: 1000 })
  const notesQuery = useNotes(projectId, { limit: 1000 })
  const tasksQuery = useTasks(projectId, { limit: 1000 })

  const isLoading = shotsQuery.isLoading || notesQuery.isLoading || tasksQuery.isLoading
  const isError = shotsQuery.isError || notesQuery.isError || tasksQuery.isError

  const data = useMemo(() => {
    return {
      shots: shotsQuery.data?.items || [],
      notes: notesQuery.data?.items || [],
      tasks: tasksQuery.data?.items || []
    }
  }, [shotsQuery.data, notesQuery.data, tasksQuery.data])

  return {
    ...data,
    isLoading,
    isError,
    refetch: () => {
      shotsQuery.refetch()
      notesQuery.refetch()
      tasksQuery.refetch()
    }
  }
}
