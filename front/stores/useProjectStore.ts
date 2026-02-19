import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Shot, Equipment } from '@/types'
import { userService } from '@/api/services/user'

interface ProjectState {
  currentProjectId: string | null
  currentProjectName: string | null
  preparedEquipmentIds: Record<string, string[]>
  setCurrentProject: (id: string | null, name: string | null) => void
  toggleEquipmentPrepared: (shotId: string, equipmentId: string) => void
  isEquipmentPrepared: (shotId: string, equipmentId: string) => boolean
  reset: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      currentProjectId: null,
      currentProjectName: null,
      preparedEquipmentIds: {},
      setCurrentProject: (id, name) => {
        // Update local state
        set({ 
          currentProjectId: id, 
          currentProjectName: name,
          preparedEquipmentIds: {} // Reset when switching projects
        })
        
        // Update lastProjectId on the server
        if (id) {
          userService.updateProfile({ lastProjectId: id }).catch(() => {
            // Silently fail - the project switch still works
          })
        }
      },

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
      },

      reset: () => set({
        currentProjectId: null,
        currentProjectName: null,
        preparedEquipmentIds: {}
      })
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
