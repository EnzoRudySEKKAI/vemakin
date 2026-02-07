import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Shot, Equipment } from '@/types'

interface ProjectState {
  // Current project
  currentProjectId: string | null
  currentProjectName: string | null
  
  // Local state for optimistic updates (UI only)
  preparedEquipmentIds: Record<string, string[]> // shotId -> equipmentIds
  
  // Actions
  setCurrentProject: (id: string | null, name: string | null) => void
  toggleEquipmentPrepared: (shotId: string, equipmentId: string) => void
  isEquipmentPrepared: (shotId: string, equipmentId: string) => boolean
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentProjectId: null,
      currentProjectName: null,
      preparedEquipmentIds: {},

      // Actions
      setCurrentProject: (id, name) => set({ 
        currentProjectId: id, 
        currentProjectName: name,
        preparedEquipmentIds: {} // Reset when switching projects
      }),

      toggleEquipmentPrepared: (shotId: string, equipmentId: string) => {
        set((state) => {
          const currentIds = state.preparedEquipmentIds[shotId] || []
          const isPrepared = currentIds.includes(equipmentId)
          
          return {
            preparedEquipmentIds: {
              ...state.preparedEquipmentIds,
              [shotId]: isPrepared
                ? currentIds.filter(id => id !== equipmentId)
                : [...currentIds, equipmentId]
            }
          }
        })
      },

      isEquipmentPrepared: (shotId: string, equipmentId: string) => {
        const ids = get().preparedEquipmentIds[shotId] || []
        return ids.includes(equipmentId)
      }
    }),
    {
      name: 'vemakin-project',
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        currentProjectName: state.currentProjectName,
      })
    }
  )
)
