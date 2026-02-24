import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AUTH_PATHS = ['/auth', '/auth/login', '/auth/register', '/auth/forgot-password']
const HUB_PATH = '/dashboard'
const AUTH_FALLBACK = '/auth'

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.some(authPath => path === authPath || path.startsWith(`${authPath}/`))
}

export function useNavigateBack(fallbackPath?: string) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateBack = useCallback(() => {
    // Check if we have history to go back to
    // window.history.length includes the current page, so > 1 means there's a previous page
    const hasHistory = window.history.length > 1

    if (!hasHistory) {
      // No history - user entered via direct URL
      // Navigate to appropriate fallback
      const fallback = fallbackPath || (isAuthPath(location.pathname) ? AUTH_FALLBACK : HUB_PATH)
      navigate(fallback, { replace: true })
      return
    }

    // We have history - go back
    navigate(-1)
  }, [navigate, location.pathname, fallbackPath])

  return navigateBack
}
