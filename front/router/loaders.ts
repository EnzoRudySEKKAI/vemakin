import { queryClient } from '@/providers/QueryProvider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { bulkApi, projectsApi, catalogApi } from '@/api'
import { 
  queryKeys, 
  prefetchProjectData, 
  prefetchInitialData,
} from '@/hooks/useApi'

// Helper to ensure auth is initialized before proceeding
const ensureAuth = async () => {
  const { initAuth, authPromise } = useAuthStore.getState()
  
  if (!authPromise) {
    initAuth()
  }
  
  const currentPromise = useAuthStore.getState().authPromise
  if (currentPromise) {
    await currentPromise
  }
}

/**
 * Loader for the root route.
 * Prefetches initial data (projects, inventory) if not already in cache.
 */
export const rootLoader = async () => {
  await ensureAuth()
  
  // Prefetch initial data in background
  const { currentUser } = useAuthStore.getState()
  
  if (currentUser) {
    // Check if we already have the data cached
    const cachedData = queryClient.getQueryData(queryKeys.initialData)
    if (!cachedData) {
      prefetchInitialData(queryClient)
    }
  }
  
  return null
}

/**
 * Loader for shots route.
 * Prefetches shots and related data for the current project.
 */
export const shotsLoader = async () => {
  await ensureAuth()
  
  const { currentProjectId } = useProjectStore.getState()
  
  if (currentProjectId) {
    // Prefetch project data if not cached
    const cachedData = queryClient.getQueryData(queryKeys.projectData(currentProjectId))
    if (!cachedData) {
      prefetchProjectData(queryClient, currentProjectId)
    }
  }
  
  return null
}

/**
 * Loader for inventory route.
 * Prefetches inventory and catalog categories.
 */
export const inventoryLoader = async () => {
  await ensureAuth()
  
  // Prefetch inventory if not cached
  const cachedInventory = queryClient.getQueryData(queryKeys.inventory)
  if (!cachedInventory) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory,
      queryFn: () => bulkApi.getInitialData().then(d => d.inventory),
      staleTime: 5 * 60 * 1000,
    })
  }
  
  // Prefetch catalog categories if not cached
  const cachedCategories = queryClient.getQueryData(queryKeys.catalog.categories)
  if (!cachedCategories) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.catalog.categories,
      queryFn: catalogApi.getCategories,
      staleTime: 60 * 60 * 1000, // 1 hour - catalog rarely changes
    })
  }
  
  return null
}

/**
 * Loader for notes route.
 */
export const notesLoader = async () => {
  await ensureAuth()
  
  const { currentProjectId } = useProjectStore.getState()
  
  if (currentProjectId) {
    const cachedData = queryClient.getQueryData(queryKeys.projectData(currentProjectId))
    if (!cachedData) {
      prefetchProjectData(queryClient, currentProjectId)
    }
  }
  
  return null
}

/**
 * Loader for pipeline/tasks route.
 */
export const pipelineLoader = async () => {
  await ensureAuth()
  
  const { currentProjectId } = useProjectStore.getState()
  
  if (currentProjectId) {
    const cachedData = queryClient.getQueryData(queryKeys.projectData(currentProjectId))
    if (!cachedData) {
      prefetchProjectData(queryClient, currentProjectId)
    }
  }
  
  return null
}

/**
 * Loader for specific item details (Shot, Task, Note, Gear).
 */
export const detailLoader = async ({ params }: { params: Record<string, string> }) => {
  await ensureAuth()
  
  // Detail pages don't need to prefetch - they'll fetch their own data
  // This keeps initial page load fast
  
  return null
}

/**
 * Loader for projects management route.
 */
export const projectsLoader = async () => {
  await ensureAuth()
  
  // Ensure projects are loaded
  const cachedProjects = queryClient.getQueryData(queryKeys.projects)
  if (!cachedProjects) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.projects,
      queryFn: projectsApi.getAll,
      staleTime: 5 * 60 * 1000,
    })
  }
  
  return null
}
