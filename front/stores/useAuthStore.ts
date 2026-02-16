import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth } from '@/firebase'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { User } from '@/types'
import { userService } from '@/api/services'

interface AuthState {
  currentUser: User | null
  isGuest: boolean
  isLoadingAuth: boolean
  authPromise: Promise<void> | null
  resolveAuth: (() => void) | null

  initAuth: () => () => void
  login: (name: string, email: string) => void
  enterGuest: () => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isGuest: false,
      isLoadingAuth: true,
      authPromise: null,
      resolveAuth: null,

      initAuth: () => {
        if (get().authPromise) return () => {}

        let resolver: () => void
        const promise = new Promise<void>((resolve) => {
          resolver = resolve
        })

        set({ authPromise: promise, resolveAuth: () => resolver() })

        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
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
              isGuest: false,
              isLoadingAuth: false
            })
          } else if (get().isGuest) {
            set({ isLoadingAuth: false })
          } else {
            set({ currentUser: null, isLoadingAuth: false })
          }

          const { resolveAuth } = get()
          if (resolveAuth) resolveAuth()
        })
        return unsubscribe
      },

      login: (name: string, email: string) => {
        set({ currentUser: { name, email } })
      },

      enterGuest: () => {
        set({ isGuest: true, isLoadingAuth: false })
      },

      logout: async () => {
        try {
          await signOut(auth)
          set({ currentUser: null, isGuest: false })
        } catch {
          // Silently fail
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoadingAuth: loading })
      }
    }),
    {
      name: 'vemakin-auth',
      partialize: (state) => ({ currentUser: state.currentUser, isGuest: state.isGuest })
    }
  )
)
