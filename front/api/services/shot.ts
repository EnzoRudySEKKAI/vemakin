import { apiClient } from '../client'
import { Shot } from '@/types'

export const shotService = {
  getAll: async (projectId: string, skip = 0, limit = 100): Promise<Shot[]> => {
    return apiClient.get<Shot[]>(`/shots?project_id=${projectId}&skip=${skip}&limit=${limit}`)
  },

  getById: async (id: string, projectId: string): Promise<Shot> => {
    return apiClient.get<Shot>(`/shots/${id}?project_id=${projectId}`)
  },

  create: async (projectId: string, data: Partial<Shot>): Promise<Shot> => {
    return apiClient.post<Shot>(`/shots?project_id=${projectId}`, data)
  },

  update: async (id: string, projectId: string, data: Partial<Shot>): Promise<Shot> => {
    return apiClient.patch<Shot>(`/shots/${id}?project_id=${projectId}`, data)
  },

  delete: async (id: string, projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/shots/${id}?project_id=${projectId}`)
  },
}
