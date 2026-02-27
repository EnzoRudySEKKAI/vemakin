import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFirebaseAuth } from '@/firebase'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { User } from '@/types'
import { userService } from '@/api/services'
import { useProjectStore } from './useProjectStore'
import { useUIStore } from './useUIStore'
import { queryClient } from '@/providers/QueryProvider'

interface AuthState {
  currentUser: User | null
  isLoadingAuth: boolean
  authPromise: Promise<void> | null
  resolveAuth: (() => void) | null
  previousUserId: string | null
  needsEmailVerification: boolean

  initAuth: () => () => void
  login: (name: string, email: string) => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
  updateFirstConnection: (value: boolean) => void
  updateEmailVerified: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoadingAuth: true,
      authPromise: null,
      resolveAuth: null,
      previousUserId: null,
      needsEmailVerification: false,

      initAuth: () => {
        if (get().authPromise) return () => {}

        let resolver: () => void
        const promise = new Promise<void>((resolve) => {
          resolver = resolve
        })

        set({ authPromise: promise, resolveAuth: () => resolver() })

        const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user: FirebaseUser | null) => {
          const previousUserId = get().previousUserId
          const newUserId = user?.uid || null

          if (previousUserId && previousUserId !== newUserId) {
            useProjectStore.getState().reset()
            queryClient.clear()
          }

          if (user) {
            // Reload user to get latest emailVerified status from Firebase
            await user.reload()
            
            let userProfile: User | null = null
            try {
              userProfile = await userService.getProfile()
            } catch (error) {
              console.error('Failed to fetch user profile:', error)
            }

            // Check emailVerified from Firebase user object first, fallback to database
            const firebaseEmailVerified = user.emailVerified ?? false
            const dbEmailVerified = userProfile?.emailVerified ?? false
            const emailVerified = firebaseEmailVerified || dbEmailVerified
            const needsEmailVerification = !emailVerified

            set({
              currentUser: {
                id: user.uid,
                name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                darkMode: userProfile?.darkMode ?? false,
                postProdGridColumns: userProfile?.postProdGridColumns,
                notesGridColumns: userProfile?.notesGridColumns,
                inventoryGridColumns: userProfile?.inventoryGridColumns,
                hubCardOrder: userProfile?.hubCardOrder,
                hubShotsLimit: userProfile?.hubShotsLimit,
                hubTasksLimit: userProfile?.hubTasksLimit,
                hubNotesLimit: userProfile?.hubNotesLimit,
                hubEquipmentLimit: userProfile?.hubEquipmentLimit,
                firstConnection: userProfile?.firstConnection ?? true,
                emailVerified: emailVerified
              },
              previousUserId: user.uid,
              isLoadingAuth: false,
              needsEmailVerification
            })

            // Sync grid columns from user profile to UI store (skip server sync since we just got the data from server)
            if (userProfile) {
              const uiStore = useUIStore.getState()
              if (userProfile.postProdGridColumns !== undefined && userProfile.postProdGridColumns !== null) {
                uiStore.setPostProdGridColumns(userProfile.postProdGridColumns as 2 | 3, true)
              }
              if (userProfile.notesGridColumns !== undefined && userProfile.notesGridColumns !== null) {
                uiStore.setNotesGridColumns(userProfile.notesGridColumns as 2 | 3, true)
              }
              if (userProfile.inventoryGridColumns !== undefined && userProfile.inventoryGridColumns !== null) {
                uiStore.setInventoryGridColumns(userProfile.inventoryGridColumns as 2 | 3, true)
              }
              if (userProfile.hubCardOrder !== undefined && userProfile.hubCardOrder !== null && userProfile.hubCardOrder.length > 0) {
                uiStore.setHubCardOrder(userProfile.hubCardOrder, true)
              }
              if (userProfile.hubShotsLimit !== undefined && userProfile.hubShotsLimit !== null) {
                uiStore.setHubShotsLimit(userProfile.hubShotsLimit, true)
              }
              if (userProfile.hubTasksLimit !== undefined && userProfile.hubTasksLimit !== null) {
                uiStore.setHubTasksLimit(userProfile.hubTasksLimit, true)
              }
              if (userProfile.hubNotesLimit !== undefined && userProfile.hubNotesLimit !== null) {
                uiStore.setHubNotesLimit(userProfile.hubNotesLimit, true)
              }
              if (userProfile.hubEquipmentLimit !== undefined && userProfile.hubEquipmentLimit !== null) {
                uiStore.setHubEquipmentLimit(userProfile.hubEquipmentLimit, true)
              }
            }
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
          await signOut(getFirebaseAuth())
        } catch {
          // Silently fail
        }
        
        set({
          currentUser: null,
          previousUserId: null,
          isLoadingAuth: false,
          needsEmailVerification: false
        })
        
        useProjectStore.getState().reset()
        
        queryClient.clear()

        localStorage.removeItem('vemakin-auth')
        localStorage.removeItem('vemakin-project')

        window.location.href = '/auth'
      },

      setLoading: (loading: boolean) => {
        set({ isLoadingAuth: loading })
      },

      updateFirstConnection: (value: boolean) => {
        const { currentUser } = get()
        if (currentUser) {
          set({
            currentUser: {
              ...currentUser,
              firstConnection: value
            }
          })
        }
      },

      updateEmailVerified: (value: boolean) => {
        const { currentUser } = get()
        if (currentUser) {
          set({
            currentUser: {
              ...currentUser,
              emailVerified: value
            },
            needsEmailVerification: !value
          })
        }
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
