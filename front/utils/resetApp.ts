import { queryClient } from '@/providers/QueryProvider'

const STORAGE_KEYS = [
  'vemakin-auth',
  'vemakin-project',
  'vemakin-ui',
]

export function resetApp(): void {
  STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  })

  queryClient.clear()
}

export function clearAllCachedData(): void {
  resetApp()
}
