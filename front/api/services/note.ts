import { apiClient } from '../client'
import { Note } from '@/types'

export const noteService = {
  getAll: async (projectId: string, skip = 0, limit = 100): Promise<Note[]> => {
    return apiClient.get<Note[]>(`/notes?project_id=${projectId}&skip=${skip}&limit=${limit}`)
  },

  getById: async (id: string, projectId: string): Promise<Note> => {
    return apiClient.get<Note>(`/notes/${id}?project_id=${projectId}`)
  },

  create: async (projectId: string, data: Partial<Note>): Promise<Note> => {
    return apiClient.post<Note>(`/notes?project_id=${projectId}`, data)
  },

  update: async (id: string, projectId: string, data: Partial<Note>): Promise<Note> => {
    return apiClient.patch<Note>(`/notes/${id}?project_id=${projectId}`, data)
  },

  delete: async (id: string, projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/notes/${id}?project_id=${projectId}`)
  },
}
