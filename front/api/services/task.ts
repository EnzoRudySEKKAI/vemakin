import { apiClient } from '../client'
import { PostProdTask } from '@/types'

export const taskService = {
  getAll: async (projectId: string, skip = 0, limit = 100): Promise<PostProdTask[]> => {
    return apiClient.get<PostProdTask[]>(`/postprod?project_id=${projectId}&skip=${skip}&limit=${limit}`)
  },

  getById: async (id: string, projectId: string): Promise<PostProdTask> => {
    return apiClient.get<PostProdTask>(`/postprod/${id}?project_id=${projectId}`)
  },

  create: async (projectId: string, data: Partial<PostProdTask>): Promise<PostProdTask> => {
    return apiClient.post<PostProdTask>(`/postprod?project_id=${projectId}`, data)
  },

  update: async (id: string, projectId: string, data: Partial<PostProdTask>): Promise<PostProdTask> => {
    return apiClient.patch<PostProdTask>(`/postprod/${id}?project_id=${projectId}`, data)
  },

  delete: async (id: string, projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/postprod/${id}?project_id=${projectId}`)
  },
}
