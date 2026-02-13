import { useOutletContext } from 'react-router-dom'
import type { Shot, Equipment, PostProdTask, Note, Currency, ShotLayout, InventoryLayout, InventoryFilters, PostProdFilters, NotesFilters, User } from '@/types'

// Define the context shape passed from RootLayout to route components
export interface RouteContext {
    // Data
    activeData: {
        shots: Shot[]
        tasks: PostProdTask[]
        notes: Note[]
    }
    allInventory: Equipment[]
    currentProject: string
    setCurrentProject: (name: string) => void
    currency: Currency
    projectData: Record<string, any>
    dynamicDates: string[]
    displayedDates: string[]
    activeDate: string
    setActiveDate: (date: string) => void
    groupedShots: Record<string, Shot[]>
    projects: string[]

    // Layouts
    shotLayout: ShotLayout
    inventoryLayout: InventoryLayout
    postProdLayout: 'grid' | 'list'
    notesLayout: 'grid' | 'list'

    // Filters
    shotSearchQuery: string
    shotStatusFilter: string
    inventoryFilters: InventoryFilters
    postProdFilters: PostProdFilters
    notesFilters: NotesFilters

    // Actions - Shots
    toggleShotStatus: (id: string) => void
    toggleEquipmentStatus: (shotId: string, equipmentId: string) => void
    addShot: (shot: Shot) => void
    updateShot: (shot: Shot) => void
    deleteShot: (id: string) => void

    // Actions - Tasks
    addTask: (task: PostProdTask) => void
    updateTask: (task: PostProdTask) => void
    deleteTask: (id: string) => void
    activePostProdTasks: PostProdTask[]

    // Actions - Gear
    addGear: (gear: Equipment) => void
    updateGear: (gear: Equipment) => void
    deleteGear: (id: string) => void
    fetchEquipmentDetail: (id: string) => Promise<Equipment | null>

    // Actions - Notes
    addNote: (note: Note) => void
    updateNote: (note: Note) => void
    deleteNote: (id: string) => void

    // Actions - Projects
    addProject: (name: string, options: any) => void
    deleteProject: (name: string) => void
    exportProject: (name: string) => any
    importProject: (data: any) => void

    // User
    currentUser: User | null
    logout: () => void

    // Utilities
    handleOpenActionSuite: (config?: { view: string, link?: { type: 'shot' | 'task', id: string } }) => void
    navigate: (path: string) => void
    showNews: () => void
    showTutorial: () => void
}

// Hook for route components to access shared state
export function useRouteContext() {
    return useOutletContext<RouteContext>()
}
