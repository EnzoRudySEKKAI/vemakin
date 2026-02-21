import { useRef } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { 
  projectsApi, 
  shotsApi, 
  notesApi, 
  tasksApi, 
  inventoryApi, 
  catalogApi,
  bulkApi,
  InitialDataResponse,
  ProjectDataResponse,
} from '@/api'
import { 
  Project, 
  Shot, 
  Note, 
  PostProdTask, 
  Equipment, 
  CatalogCategory,
  CatalogBrand,
  CatalogItem,
  PaginationParams,
  PaginatedResponse,
} from '@/types'

// Query keys for cache management
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  shots: (projectId: string) => ['shots', projectId] as const,
  notes: (projectId: string) => ['notes', projectId] as const,
  tasks: (projectId: string) => ['tasks', projectId] as const,
  inventory: ['inventory'] as const,
  catalog: {
    categories: ['catalog', 'categories'] as const,
    brands: (categoryId: string) => ['catalog', 'brands', categoryId] as const,
    items: (categoryId: string, brandId: string) => ['catalog', 'items', categoryId, brandId] as const,
    specs: (itemId: string) => ['catalog', 'specs', itemId] as const,
  },
  projectData: (projectId: string) => ['projectData', projectId] as const,
  initialData: (projectId?: string) => ['initialData', projectId || 'all'] as const,
}

// Default stale times for different data types
const STALE_TIMES = {
  projects: 5 * 60 * 1000,        // 5 minutes
  projectData: 2 * 60 * 1000,     // 2 minutes
  inventory: 5 * 60 * 1000,       // 5 minutes
  catalog: 24 * 60 * 60 * 1000,   // 24 hours - backend cache handles it
}

// Projects Hooks
export const useProjects = (options?: UseQueryOptions<Project[], Error>) => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.getAll,
    staleTime: STALE_TIMES.projects,
    ...options,
  })
}

export const useProject = (id: string, options?: UseQueryOptions<Project, Error>) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => projectsApi.getById(id),
    staleTime: STALE_TIMES.projects,
    enabled: !!id,
    ...options,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (name: string) => projectsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

// Shots Hooks with pagination
export const useShots = (
  projectId: string, 
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<Shot>, Error>
) => {
  return useQuery({
    queryKey: [...queryKeys.shots(projectId), params],
    queryFn: () => shotsApi.getAll(projectId, params),
    staleTime: STALE_TIMES.projectData,
    enabled: !!projectId,
    ...options,
  })
}

export const useAllShots = (projectId: string, options?: UseQueryOptions<PaginatedResponse<Shot>, Error>) => {
  return useShots(projectId, { limit: 1000 }, options)
}

export const useCreateShot = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (shot: Partial<Shot>) => shotsApi.create(projectId, shot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shots(projectId) })
    },
  })
}

export const useUpdateShot = (projectId: string) => {
  const queryClient = useQueryClient()
  const queryKey = [...queryKeys.shots(projectId), { limit: 1000 }]
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shot> }) => 
      shotsApi.update(id, projectId, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.shots(projectId) })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)
      
      // Optimistically update - handle both array and { data: [...] } structures
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        
        // If it's an array, map directly
        if (Array.isArray(old)) {
          return old.map((shot: Shot) => 
            shot.id === id ? { ...shot, ...data } : shot
          )
        }
        
        // If it has .data property (PaginatedResponse-like)
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((shot: Shot) => 
              shot.id === id ? { ...shot, ...data } : shot
            )
          }
        }
        
        return old
      })
      
      return { previousData }
    },
    onError: (err, variables, context: any) => {
      // Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    // Update cache with server response - no invalidation to avoid heavy API call
    onSuccess: (returnedShot, variables) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          return old.map((shot: Shot) => 
            shot.id === variables.id ? returnedShot : shot
          )
        }
        
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((shot: Shot) => 
              shot.id === variables.id ? returnedShot : shot
            )
          }
        }
        
        return old
      })
    },
  })
}

export const useDeleteShot = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => shotsApi.delete(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shots(projectId) })
    },
  })
}

// Notes Hooks with pagination
export const useNotes = (
  projectId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<Note>, Error>
) => {
  return useQuery({
    queryKey: [...queryKeys.notes(projectId), params],
    queryFn: () => notesApi.getAll(projectId, params),
    staleTime: STALE_TIMES.projectData,
    enabled: !!projectId,
    ...options,
  })
}

export const useAllNotes = (projectId: string, options?: UseQueryOptions<PaginatedResponse<Note>, Error>) => {
  return useNotes(projectId, { limit: 1000 }, options)
}

export const useCreateNote = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (note: Partial<Note>) => notesApi.create(projectId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(projectId) })
    },
  })
}

export const useUpdateNote = (projectId: string) => {
  const queryClient = useQueryClient()
  const queryKey = [...queryKeys.notes(projectId), { limit: 1000 }]
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => 
      notesApi.update(id, projectId, data),
    onSuccess: (returnedNote, variables) => {
      // Update cache with server response - no invalidation to avoid heavy API call
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          return old.map((note: Note) => 
            note.id === variables.id ? returnedNote : note
          )
        }
        
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((note: Note) => 
              note.id === variables.id ? returnedNote : note
            )
          }
        }
        
        return old
      })
    },
  })
}

export const useDeleteNote = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes(projectId) })
    },
  })
}

// Tasks Hooks with pagination
export const useTasks = (
  projectId: string,
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<PostProdTask>, Error>
) => {
  return useQuery({
    queryKey: [...queryKeys.tasks(projectId), params],
    queryFn: () => tasksApi.getAll(projectId, params),
    staleTime: STALE_TIMES.projectData,
    enabled: !!projectId,
    ...options,
  })
}

export const useAllTasks = (projectId: string, options?: UseQueryOptions<PaginatedResponse<PostProdTask>, Error>) => {
  return useTasks(projectId, { limit: 1000 }, options)
}

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (task: Partial<PostProdTask>) => tasksApi.create(projectId, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) })
    },
  })
}

export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient()
  const queryKey = [...queryKeys.tasks(projectId), { limit: 1000 }]
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PostProdTask> }) => 
      tasksApi.update(id, projectId, data),
    onSuccess: (returnedTask, variables) => {
      // Update cache with server response - no invalidation to avoid heavy API call
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old
        
        if (Array.isArray(old)) {
          return old.map((task: PostProdTask) => 
            task.id === variables.id ? returnedTask : task
          )
        }
        
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.map((task: PostProdTask) => 
              task.id === variables.id ? returnedTask : task
            )
          }
        }
        
        return old
      })
    },
  })
}

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) })
    },
  })
}

// Inventory Hooks
export const useInventory = (options?: UseQueryOptions<Equipment[], Error>) => {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => bulkApi.getInitialData().then(d => d.inventory),
    staleTime: STALE_TIMES.inventory,
    ...options,
  })
}

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (equipment: Partial<Equipment>) => inventoryApi.create(equipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory })
    },
  })
}

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) => 
      inventoryApi.update(id, data),
    onSuccess: (returnedEquipment) => {
      // Update cache immediately with returned data - no invalidation to avoid heavy API call
      queryClient.setQueryData(queryKeys.inventory, (old: Equipment[] | undefined) => {
        if (!old) return old
        return old.map(item => item.id === returnedEquipment.id ? returnedEquipment : item)
      })
    },
  })
}

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory })
    },
  })
}

// Catalog Hooks - Extended cache since backend handles catalog caching
export const useCatalogCategories = (options?: UseQueryOptions<CatalogCategory[], Error>) => {
  return useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: catalogApi.getCategories,
    staleTime: STALE_TIMES.catalog,
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    ...options,
  })
}

export const useCatalogBrands = (categoryId: string, options?: UseQueryOptions<CatalogBrand[], Error>) => {
  return useQuery({
    queryKey: queryKeys.catalog.brands(categoryId),
    queryFn: () => catalogApi.getBrands(categoryId),
    staleTime: STALE_TIMES.catalog,
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    enabled: !!categoryId,
    ...options,
  })
}

export const useCatalogItems = (
  categoryId: string,
  brandId: string,
  options?: UseQueryOptions<CatalogItem[], Error>
) => {
  return useQuery({
    queryKey: queryKeys.catalog.items(categoryId, brandId),
    queryFn: () => catalogApi.getItems(categoryId, brandId),
    staleTime: STALE_TIMES.catalog,
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    enabled: !!categoryId && !!brandId,
    ...options,
  })
}

export const useItemSpecs = (itemId: string, options?: UseQueryOptions<Record<string, unknown>, Error>) => {
  return useQuery({
    queryKey: queryKeys.catalog.specs(itemId),
    queryFn: () => catalogApi.getItemSpecs(itemId),
    staleTime: STALE_TIMES.catalog,
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    enabled: !!itemId,
    ...options,
  })
}

// Bulk data fetching hooks using the optimized /bulk/initial endpoint

export const useProjectData = (projectId: string, options?: UseQueryOptions<ProjectDataResponse, Error>) => {
  return useQuery({
    queryKey: queryKeys.projectData(projectId),
    queryFn: () => bulkApi.getProjectData(projectId),
    staleTime: STALE_TIMES.projectData,
    enabled: !!projectId,
    ...options,
  })
}

// Optimized initial data hook - fetches projects + inventory + (optionally) project data in ONE request
export const useInitialData = (projectId?: string, options?: UseQueryOptions<InitialDataResponse, Error>) => {
  return useQuery({
    queryKey: queryKeys.initialData(projectId),
    queryFn: () => bulkApi.getInitialData(projectId),
    staleTime: Math.min(STALE_TIMES.projects, STALE_TIMES.inventory),
    enabled: true,
    ...options,
  })
}

// Prefetch helpers for route loaders
export const prefetchProjectData = async (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projectData(projectId),
    queryFn: () => bulkApi.getProjectData(projectId),
    staleTime: STALE_TIMES.projectData,
  })
}

// Prefetch initial data with optional project data
export const prefetchInitialData = async (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: string
) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.initialData(projectId),
    queryFn: () => bulkApi.getInitialData(projectId),
    staleTime: Math.min(STALE_TIMES.projects, STALE_TIMES.inventory),
  })
}
