import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    const unsubscribe = initAuth()
    setIsInitialized(true)
    return () => unsubscribe()
  }, [initAuth])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
