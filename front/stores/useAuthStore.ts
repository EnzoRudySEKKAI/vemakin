import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { User } from '@/types'

interface AuthState {
  // State
  currentUser: User | null
  isLoadingAuth: boolean
  authPromise: Promise<void> | null
  resolveAuth: (() => void) | null

  // Actions
  initAuth: () => () => void
  logout: () => Promise<void>
  login: (name: string, email: string) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentUser: null,
      isLoadingAuth: true,
      authPromise: null,
      resolveAuth: null,

      // Actions
      initAuth: () => {
        if (get().authPromise) return () => {}

        let resolver: () => void
        const promise = new Promise<void>((resolve) => {
          resolver = resolve
        })

        set({ authPromise: promise, resolveAuth: () => resolver() })

        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
          if (user) {
            set({
              currentUser: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || ''
              },
              isLoadingAuth: false
            })
          } else {
            set({ currentUser: null, isLoadingAuth: false })
          }

          const { resolveAuth } = get()
          if (resolveAuth) resolveAuth()
        })
        return unsubscribe
      },

      logout: async () => {
        try {
          await signOut(auth)
          set({ currentUser: null })
        } catch {
          // Silently fail - user will see they're still logged in
        }
      },

      login: (name: string, email: string) => {
        set({
          currentUser: { name, email }
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoadingAuth: loading })
      }
    }),
    {
      name: 'vemakin-auth',
      partialize: (state) => ({ currentUser: state.currentUser })
    }
  )
)
