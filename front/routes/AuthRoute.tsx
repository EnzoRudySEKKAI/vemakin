import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { FullPageLoader } from '@/components/ui/FullPageLoader'

export function AuthRoute() {
  const { currentUser, isLoadingAuth } = useAuthStore()

  if (isLoadingAuth) {
    return <FullPageLoader />
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
