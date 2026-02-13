import { apiClient } from './client'
import {
  Project,
  Shot,
  Note,
  PostProdTask,
  Equipment,
  CatalogCategory,
  CatalogBrand,
  CatalogItem,
  PaginatedResponse,
  PaginationParams,
} from '@/types'

export { apiClient }

// Projects API
export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),
  
  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`),
  
  create: (name: string) => 
    apiClient.post<Project>('/projects', { name }),
  
  update: (id: string, data: Partial<Project>) => 
    apiClient.patch<Project>(`/projects/${id}`, data),
  
  delete: (id: string) => apiClient.delete<void>(`/projects/${id}`),
}

// Shots API with pagination
export const shotsApi = {
  getAll: (projectId: string, params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Shot>>(`/shots?project_id=${projectId}`, { params }),
  
  create: (projectId: string, shot: Partial<Shot>) => 
    apiClient.post<Shot>(`/shots?project_id=${projectId}`, shot),
  
  update: (id: string, shot: Partial<Shot>) => 
    apiClient.patch<Shot>(`/shots/${id}`, shot),
  
  delete: (id: string) => apiClient.delete<void>(`/shots/${id}`),
}

// Notes API with pagination
export const notesApi = {
  getAll: (projectId: string, params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<Note>>(`/notes?project_id=${projectId}`, { params }),
  
  create: (projectId: string, note: Partial<Note>) => 
    apiClient.post<Note>(`/notes?project_id=${projectId}`, note),
  
  update: (id: string, note: Partial<Note>) => 
    apiClient.patch<Note>(`/notes/${id}`, note),
  
  delete: (id: string) => apiClient.delete<void>(`/notes/${id}`),
}

// Post Production Tasks API with pagination
export const tasksApi = {
  getAll: (projectId: string, params?: PaginationParams) => 
    apiClient.get<PaginatedResponse<PostProdTask>>(`/postprod?project_id=${projectId}`, { params }),
  
  create: (projectId: string, task: Partial<PostProdTask>) => 
    apiClient.post<PostProdTask>(`/postprod?project_id=${projectId}`, task),
  
  update: (id: string, task: Partial<PostProdTask>) => 
    apiClient.patch<PostProdTask>(`/postprod/${id}`, task),
  
  delete: (id: string) => apiClient.delete<void>(`/postprod/${id}`),
}

// Inventory API
export const inventoryApi = {
  getAll: () => apiClient.get<Equipment[]>('/inventory'),
  
  create: (equipment: Partial<Equipment>) => 
    apiClient.post<Equipment>('/inventory', equipment),
  
  update: (id: string, equipment: Partial<Equipment>) => 
    apiClient.patch<Equipment>(`/inventory/${id}`, equipment),
  
  delete: (id: string) => apiClient.delete<void>(`/inventory/${id}`),
}

// Catalog API
export const catalogApi = {
  getCategories: () => apiClient.get<CatalogCategory[]>('/catalog/categories'),
  
  getBrands: (categoryId: string) => 
    apiClient.get<CatalogBrand[]>(`/catalog/brands?category_id=${categoryId}`),
  
  getItems: (categoryId: string, brandId: string) => 
    apiClient.get<CatalogItem[]>(`/catalog/items?category_id=${categoryId}&brand_id=${brandId}`),
  
  getItemSpecs: (itemId: string) => 
    apiClient.get<Record<string, unknown>>(`/catalog/items/${itemId}/specs`),
}

// Bulk operations for efficient data fetching
export interface InitialDataResponse {
  projects: Project[]
  inventory: Equipment[]
  shots?: Shot[]
  notes?: Note[]
  tasks?: PostProdTask[]
}

export interface ProjectDataResponse {
  shots: Shot[]
  notes: Note[]
  tasks: PostProdTask[]
}

export const bulkApi = {
  // Single request to fetch all data: projects + inventory + (optionally project data)
  getInitialData: async (projectId?: string): Promise<InitialDataResponse> => {
    const params = projectId ? `?project_id=${projectId}` : ''
    return apiClient.get<InitialDataResponse>(`/bulk/initial${params}`)
  },
  
  // Fetch all project data (shots, notes, tasks) in a single request
  getProjectData: async (projectId: string): Promise<ProjectDataResponse> => {
    return apiClient.get<ProjectDataResponse>(`/bulk/project/${projectId}`)
  },
}
