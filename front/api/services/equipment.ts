import { apiClient } from '../client'
import { bulkApi } from '../index'
import { Equipment } from '@/types'

export const equipmentService = {
  // Use bulk endpoint for fetching all inventory (reduces API calls)
  getAll: async (): Promise<Equipment[]> => {
    return bulkApi.getInitialData().then(d => d.inventory)
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
