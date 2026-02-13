import { apiClient } from '../client'
import { Equipment } from '@/types'

export const equipmentService = {
  getAll: async (skip = 0, limit = 100): Promise<Equipment[]> => {
    return apiClient.get<Equipment[]>(`/inventory?skip=${skip}&limit=${limit}`)
  },

  getById: async (id: string): Promise<Equipment> => {
    return apiClient.get<Equipment>(`/inventory/${id}`)
  },

  create: async (data: Partial<Equipment>): Promise<Equipment> => {
    return apiClient.post<Equipment>('/inventory', data)
  },

  update: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    return apiClient.patch<Equipment>(`/inventory/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/inventory/${id}`)
  },
}
