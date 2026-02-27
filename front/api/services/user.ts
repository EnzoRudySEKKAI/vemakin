import { apiClient } from '../client'
import { User } from '@/types'

export const userService = {
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/users/profile')
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.patch<User>('/users/profile', data)
  },

  verifyEmail: async (verified: boolean): Promise<User> => {
    return apiClient.patch<User>('/users/profile/email-verified', { verified })
  },
}
