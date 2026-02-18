import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@/firebase'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { User } from '@/types'
import { userService } from '@/api/services'
import { useProjectStore } from './useProjectStore'
import { queryClient } from '@/providers/QueryProvider'

interface AuthState {
  currentUser: User | null
  isLoadingAuth: boolean
  authPromise: Promise<void> | null
  resolveAuth: (() => void) | null
  previousUserId: string | null

  initAuth: () => () => void
  login: (name: string, email: string) => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoadingAuth: true,
      authPromise: null,
      resolveAuth: null,
      previousUserId: null,

      initAuth: () => {
        if (get().authPromise) return () => {}

        let resolver: () => void
        const promise = new Promise<void>((resolve) => {
          resolver = resolve
        })

        set({ authPromise: promise, resolveAuth: () => resolver() })

        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
          const previousUserId = get().previousUserId
          const newUserId = user?.uid || null

          if (previousUserId && previousUserId !== newUserId) {
            useProjectStore.getState().reset()
            queryClient.clear()
          }

          if (user) {
            let userProfile: User | null = null
            try {
              userProfile = await userService.getProfile()
            } catch (error) {
              console.error('Failed to fetch user profile:', error)
            }

            set({
              currentUser: {
                id: user.uid,
                name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                darkMode: userProfile?.darkMode ?? false
              },
              previousUserId: user.uid,
              isLoadingAuth: false
            })
          } else {
            set({
              currentUser: null,
              previousUserId: null,
              isLoadingAuth: false
            })
          }

          const { resolveAuth } = get()
          if (resolveAuth) resolveAuth()
        })
        return unsubscribe
      },

      login: (name: string, email: string) => {
        set({ currentUser: { name, email } })
      },

      logout: async () => {
        try {
          await signOut(auth)
        } catch {
          // Silently fail
        }
        
        set({
          currentUser: null,
          previousUserId: null,
          isLoadingAuth: false
        })
        
        useProjectStore.getState().reset()
        
        queryClient.clear()

        localStorage.removeItem('vemakin-auth')
        localStorage.removeItem('vemakin-project')

        window.location.href = '/auth'
      },

      setLoading: (loading: boolean) => {
        set({ isLoadingAuth: loading })
      }
    }),
    {
      name: 'vemakin-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        previousUserId: state.previousUserId
      })
    }
  )
)
