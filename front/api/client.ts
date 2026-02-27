import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getFirebaseAuth } from '@/firebase'
import { camelizeKeys, decamelizeKeys } from 'humps'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth and transform to snake_case
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = getFirebaseAuth().currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }

    // Transform request body from camelCase to snake_case
    if (config.data && typeof config.data === 'object') {
      config.data = decamelizeKeys(config.data)
    }

    // Transform params from camelCase to snake_case
    if (config.params && typeof config.params === 'object') {
      config.params = decamelizeKeys(config.params)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Transform from snake_case to camelCase
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object') {
      response.data = camelizeKeys(response.data)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.message === 'email not verified') {
      window.location.href = '/auth/verify-required'
    }
    return Promise.reject(error)
  }
)

export default api

// Generic API methods with type safety
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    api.get<T>(url, config).then(res => res.data),
  
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    api.post<T>(url, data, config).then(res => res.data),
  
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => 
    api.patch<T>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T>(url, config).then(res => res.data),
}
