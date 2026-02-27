import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { FullPageLoader } from '@/components/ui/FullPageLoader'

export function AuthRoute() {
  const { currentUser, isLoadingAuth } = useAuthStore()
  const location = useLocation()

  if (isLoadingAuth) {
    return <FullPageLoader />
  }

  // Don't redirect if already on a verification page
  const isOnVerificationPage = location.pathname.includes('/auth/verify')

  if (currentUser && !isOnVerificationPage) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
