import { useOutletContext } from 'react-router-dom'
import type { Shot, Equipment, PostProdTask, Note, Currency, ShotLayout, InventoryLayout, InventoryFilters, PostProdFilters, NotesFilters, User } from '@/types'

// Define the context shape passed from RootLayout to route components
export interface RouteContext {
    activeData: {
        shots: Shot[]
        tasks: PostProdTask[]
        notes: Note[]
    }
    allInventory: Equipment[]
    currentProject: string
    setCurrentProject: (name: string) => void
    currency: Currency
    projectData: Record<string, unknown>
    dynamicDates: string[]
    displayedDates: string[]
    activeDate: string
    setActiveDate: (date: string) => void
    groupedShots: Record<string, Shot[]>
    projects: string[]
    shotLayout: ShotLayout
    inventoryLayout: InventoryLayout
    postProdLayout: 'grid' | 'list'
    notesLayout: 'grid' | 'list'
    shotSearchQuery: string
    shotStatusFilter: string
    inventoryFilters: InventoryFilters
    postProdFilters: PostProdFilters
    notesFilters: NotesFilters
    toggleShotStatus: (id: string) => void
    toggleEquipmentStatus: (shotId: string, equipmentId: string) => void
    addShot: (shot: Shot) => void
    updateShot: (shot: Shot) => void
    deleteShot: (id: string) => void
    addTask: (task: PostProdTask) => void
    updateTask: (task: PostProdTask) => void
    deleteTask: (id: string) => void
    activePostProdTasks: PostProdTask[]
    addGear: (gear: Equipment) => void
    updateGear: (gear: Equipment) => void
    deleteGear: (id: string) => void
    addNote: (note: Note) => void
    updateNote: (note: Note) => void
    deleteNote: (id: string) => void
    addProject: (name: string, options: unknown) => void
    deleteProject: (name: string) => void
    exportProject: (name: string) => unknown
    importProject: (data: unknown) => void
    currentUser: User | null
    logout: () => void
    darkMode: boolean
    toggleDarkMode: () => void
    handleOpenActionSuite: (config?: { view: string, link?: { type: 'shot' | 'task', id: string } }) => void
    navigate: (path: string) => void
    showNews: () => void
    showTutorial: () => void
}

// Hook for route components to access shared state
export function useRouteContext() {
    return useOutletContext<RouteContext>()
}
