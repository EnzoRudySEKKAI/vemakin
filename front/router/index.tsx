import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'

// Import route wrapper components
import { OverviewRoute } from '@/routes/OverviewRoute'
import { ShotsRoute } from '@/routes/ShotsRoute'
import { ShotDetailRoute } from '@/routes/ShotDetailRoute'
import { ShotFormRoute } from '@/routes/ShotFormRoute'
import { InventoryRoute } from '@/routes/InventoryRoute'
import { EquipmentDetailRoute } from '@/routes/EquipmentDetailRoute'
import { GearFormRoute } from '@/routes/GearFormRoute'
import { NotesRoute } from '@/routes/NotesRoute'
import { NoteDetailRoute } from '@/routes/NoteDetailRoute'
import { NoteFormRoute } from '@/routes/NoteFormRoute'
import { PipelineRoute } from '@/routes/PipelineRoute'
import { TaskDetailRoute } from '@/routes/TaskDetailRoute'
import { TaskFormRoute } from '@/routes/TaskFormRoute'
import { SettingsRoute } from '@/routes/SettingsRoute'
import { ProjectsRoute } from '@/routes/ProjectsRoute'

// Import loaders
import { rootLoader, shotsLoader, inventoryLoader, notesLoader, pipelineLoader, detailLoader } from './loaders'

// Router configuration with nested routes
// The RootLayout wraps all routes and provides persistent Header/Navigation
export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<RootLayout />} loader={rootLoader}>
            {/* Main views */}
            <Route index element={<OverviewRoute />} />
            <Route path="shots" element={<ShotsRoute />} loader={shotsLoader} />
            <Route path="shots/new" element={<ShotFormRoute />} />
            <Route path="shots/:id" element={<ShotDetailRoute />} loader={detailLoader} />
            <Route path="inventory" element={<InventoryRoute />} loader={inventoryLoader} />
            <Route path="inventory/new" element={<GearFormRoute />} />
            <Route path="inventory/:id" element={<EquipmentDetailRoute />} loader={detailLoader} />
            <Route path="notes" element={<NotesRoute />} loader={notesLoader} />
            <Route path="notes/new" element={<NoteFormRoute />} />
            <Route path="notes/:id" element={<NoteDetailRoute />} loader={detailLoader} />
            <Route path="pipeline" element={<PipelineRoute />} loader={pipelineLoader} />
            <Route path="pipeline/new" element={<TaskFormRoute />} />
            <Route path="pipeline/:id" element={<TaskDetailRoute />} loader={detailLoader} />
            <Route path="settings" element={<SettingsRoute />} />
            <Route path="projects" element={<ProjectsRoute />} />
        </Route>
    )
)

// Route path mappings for navigation (used by header and other components)
export const ROUTE_PATHS = {
    overview: '/',
    shots: '/shots',
    'shot-detail': '/shots',
    inventory: '/inventory',
    'equipment-detail': '/inventory',
    notes: '/notes',
    'note-detail': '/notes',
    postprod: '/pipeline',
    'task-detail': '/pipeline',
    settings: '/settings',
    'manage-projects': '/projects',
    'new-shot': '/shots/new',
    'new-gear': '/inventory/new',
    'new-task': '/pipeline/new',
    'new-note': '/notes/new',
} as const

// Helper to get current view from pathname (for header/nav styling)
export function getViewFromPath(pathname: string): string {
    if (pathname === '/') return 'overview'
    if (pathname === '/shots/new') return 'new-shot'
    if (pathname.match(/^\/shots\/[^/]+$/)) return 'shot-detail'
    if (pathname === '/shots') return 'shots'
    if (pathname === '/inventory/new') return 'new-gear'
    if (pathname.match(/^\/inventory\/[^/]+$/)) return 'equipment-detail'
    if (pathname === '/inventory') return 'inventory'
    if (pathname === '/notes/new') return 'new-note'
    if (pathname.match(/^\/notes\/[^/]+$/)) return 'note-detail'
    if (pathname === '/notes') return 'notes'
    if (pathname === '/pipeline/new') return 'new-task'
    if (pathname.match(/^\/pipeline\/[^/]+$/)) return 'task-detail'
    if (pathname === '/pipeline') return 'postprod'
    if (pathname === '/settings') return 'settings'
    if (pathname === '/projects') return 'manage-projects'
    return 'overview'
}
