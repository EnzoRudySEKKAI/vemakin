import { apiClient } from '../client'
import { Project } from '@/types'

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects')
  },

  getById: async (id: string): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}`)
  },

  create: async (data: { name: string }): Promise<Project> => {
    return apiClient.post<Project>('/projects', data)
  },

  update: async (id: string, data: { name: string }): Promise<Project> => {
    return apiClient.patch<Project>(`/projects/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}`)
  },
}
