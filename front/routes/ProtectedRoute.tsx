import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export function ProtectedRoute() {
  const { currentUser, isLoadingAuth } = useAuthStore()

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}
