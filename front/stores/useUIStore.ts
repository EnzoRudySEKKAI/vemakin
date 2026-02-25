import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  MainView, 
  ShotLayout, 
  PostProdFilters, 
  NotesFilters,
  HubCardType 
} from '@/types'
import { userService } from '@/api/services'
import { useAuthStore } from './useAuthStore'

interface UIState {
  mainView: MainView
  shotLayout: ShotLayout
  notesLayout: 'grid' | 'list'
  shotStatusFilter: 'all' | 'pending' | 'done'
  postProdFilters: PostProdFilters
  notesFilters: NotesFilters
  darkMode: boolean
  showCreateProjectPrompt: boolean
  postProdGridColumns: 2 | 3
  notesGridColumns: 2 | 3
  inventoryGridColumns: 2 | 3
  hubCardOrder: HubCardType[]
  hubShotsLimit: number
  hubTasksLimit: number
  hubNotesLimit: number
  hubEquipmentLimit: number

  setMainView: (view: MainView) => void
  setShotLayout: (layout: ShotLayout) => void
  setNotesLayout: (layout: 'grid' | 'list') => void
  setShotStatusFilter: (filter: 'all' | 'pending' | 'done') => void
  setPostProdFilters: (updater: (prev: PostProdFilters) => PostProdFilters) => void
  setNotesFilters: (updater: (prev: NotesFilters) => NotesFilters) => void
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setShowCreateProjectPrompt: (show: boolean) => void
  setPostProdGridColumns: (columns: 2 | 3, skipSync?: boolean) => void
  setNotesGridColumns: (columns: 2 | 3, skipSync?: boolean) => void
  setInventoryGridColumns: (columns: 2 | 3, skipSync?: boolean) => void
  setHubCardOrder: (order: HubCardType[], skipSync?: boolean) => void
  setHubShotsLimit: (limit: number, skipSync?: boolean) => void
  setHubTasksLimit: (limit: number, skipSync?: boolean) => void
  setHubNotesLimit: (limit: number, skipSync?: boolean) => void
  setHubEquipmentLimit: (limit: number, skipSync?: boolean) => void
}

const defaultPostProdFilters: PostProdFilters = {
  category: 'All',
  searchQuery: '',
  status: 'All',
  priority: 'All',
  date: 'All',
  sortBy: 'status',
  sortDirection: 'asc'
}

const defaultNotesFilters: NotesFilters = {
  query: '',
  category: 'All',
  sortBy: 'updated',
  sortDirection: 'desc'
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      mainView: 'overview',
      shotLayout: 'timeline',
      notesLayout: 'grid',
      shotStatusFilter: 'all',
      postProdFilters: defaultPostProdFilters,
      notesFilters: defaultNotesFilters,
      darkMode: false,
      showCreateProjectPrompt: false,
      postProdGridColumns: 2,
      notesGridColumns: 2,
      inventoryGridColumns: 2,
      hubCardOrder: ['timeline', 'equipment', 'tasks', 'notes'],
      hubShotsLimit: 3,
      hubTasksLimit: 3,
      hubNotesLimit: 3,
      hubEquipmentLimit: 3,

      setMainView: (view) => set({ mainView: view }),
      setShotLayout: (layout) => set({ shotLayout: layout }),
      setNotesLayout: (layout) => set({ notesLayout: layout }),
      setShotStatusFilter: (filter) => set({ shotStatusFilter: filter }),
      setPostProdFilters: (updater) => set((state) => ({ 
        postProdFilters: updater(state.postProdFilters) 
      })),
      setNotesFilters: (updater) => set((state) => ({ 
        notesFilters: updater(state.notesFilters) 
      })),
      toggleDarkMode: () => {
        const newMode = !get().darkMode
        set({ darkMode: newMode })
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ darkMode: newMode }).catch((error) => {
            console.error('Failed to sync theme preference:', error)
          })
        }
      },
      setDarkMode: (value) => set({ darkMode: value }),
      setShowCreateProjectPrompt: (show) => set({ showCreateProjectPrompt: show }),
      setPostProdGridColumns: (columns, skipSync) => {
        set({ postProdGridColumns: columns })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ postProdGridColumns: columns }).catch((error) => {
            console.error('Failed to sync post-prod grid columns:', error)
          })
        }
      },
      setNotesGridColumns: (columns, skipSync) => {
        set({ notesGridColumns: columns })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ notesGridColumns: columns }).catch((error) => {
            console.error('Failed to sync notes grid columns:', error)
          })
        }
      },
      setInventoryGridColumns: (columns, skipSync) => {
        set({ inventoryGridColumns: columns })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ inventoryGridColumns: columns }).catch((error) => {
            console.error('Failed to sync inventory grid columns:', error)
          })
        }
      },
      setHubCardOrder: (order, skipSync) => {
        set({ hubCardOrder: order })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ hubCardOrder: order }).catch((error) => {
            console.error('Failed to sync hub card order:', error)
          })
        }
      },
      setHubShotsLimit: (limit, skipSync) => {
        set({ hubShotsLimit: limit })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ hubShotsLimit: limit }).catch((error) => {
            console.error('Failed to sync hub shots limit:', error)
          })
        }
      },
      setHubTasksLimit: (limit, skipSync) => {
        set({ hubTasksLimit: limit })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ hubTasksLimit: limit }).catch((error) => {
            console.error('Failed to sync hub tasks limit:', error)
          })
        }
      },
      setHubNotesLimit: (limit, skipSync) => {
        set({ hubNotesLimit: limit })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ hubNotesLimit: limit }).catch((error) => {
            console.error('Failed to sync hub notes limit:', error)
          })
        }
      },
      setHubEquipmentLimit: (limit, skipSync) => {
        set({ hubEquipmentLimit: limit })
        
        if (skipSync) return
        
        const { currentUser } = useAuthStore.getState()
        if (currentUser) {
          userService.updateProfile({ hubEquipmentLimit: limit }).catch((error) => {
            console.error('Failed to sync hub equipment limit:', error)
          })
        }
      },
    }),
    {
      name: 'vemakin-ui',
      partialize: (state) => ({
        darkMode: state.darkMode,
        shotLayout: state.shotLayout,
        notesLayout: state.notesLayout,
        shotStatusFilter: state.shotStatusFilter,
        // Grid columns are synced from database, not localStorage
      })
    }
  )
)
