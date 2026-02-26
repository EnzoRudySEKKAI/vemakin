import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { FullPageLoader } from '@/components/ui/FullPageLoader'

export function ProtectedRoute() {
  const { currentUser, isLoadingAuth } = useAuthStore()

  if (isLoadingAuth) {
    return <FullPageLoader />
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}
