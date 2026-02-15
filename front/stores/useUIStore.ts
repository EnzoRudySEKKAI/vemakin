import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  MainView, 
  ShotLayout, 
  PostProdFilters, 
  NotesFilters 
} from '@/types'

interface UIState {
  // View State
  mainView: MainView
  shotLayout: ShotLayout
  notesLayout: 'grid' | 'list'
  
  // Filters
  shotStatusFilter: 'all' | 'pending' | 'done'
  postProdFilters: PostProdFilters
  notesFilters: NotesFilters
  
  // Theme
  darkMode: boolean
  
  // Project Creation Prompt
  showCreateProjectPrompt: boolean
  
  // Actions
  setMainView: (view: MainView) => void
  setShotLayout: (layout: ShotLayout) => void
  setNotesLayout: (layout: 'grid' | 'list') => void
  setShotStatusFilter: (filter: 'all' | 'pending' | 'done') => void
  setPostProdFilters: (updater: (prev: PostProdFilters) => PostProdFilters) => void
  setNotesFilters: (updater: (prev: NotesFilters) => NotesFilters) => void
  toggleDarkMode: () => void
  setShowCreateProjectPrompt: (show: boolean) => void
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
    (set) => ({
      // Initial State
      mainView: 'overview',
      shotLayout: 'timeline',
      notesLayout: 'grid',
      shotStatusFilter: 'all',
      postProdFilters: defaultPostProdFilters,
      notesFilters: defaultNotesFilters,
      darkMode: true,
      showCreateProjectPrompt: false,

      // Actions
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
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setShowCreateProjectPrompt: (show) => set({ showCreateProjectPrompt: show })
    }),
    {
      name: 'vemakin-ui',
      partialize: (state) => ({
        darkMode: state.darkMode,
        shotLayout: state.shotLayout,
        notesLayout: state.notesLayout,
        shotStatusFilter: state.shotStatusFilter,
      })
    }
  )
)
