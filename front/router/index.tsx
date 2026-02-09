import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { LandingPage } from '@/components/landing/LandingPage'

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

// Router configuration
// Landing page at /, dashboard routes under /dashboard
export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth redirect - points to dashboard which handles auth flow */}
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard/App Routes - wrapped by RootLayout */}
            <Route path="/dashboard" element={<RootLayout />} loader={rootLoader}>
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
        </>
    )
)

// Route path mappings for navigation (used by header and other components)
// Updated to include /dashboard prefix
export const ROUTE_PATHS = {
    overview: '/dashboard',
    shots: '/dashboard/shots',
    'shot-detail': '/dashboard/shots',
    inventory: '/dashboard/inventory',
    'equipment-detail': '/dashboard/inventory',
    notes: '/dashboard/notes',
    'note-detail': '/dashboard/notes',
    postprod: '/dashboard/pipeline',
    'task-detail': '/dashboard/pipeline',
    settings: '/dashboard/settings',
    'manage-projects': '/dashboard/projects',
    'new-shot': '/dashboard/shots/new',
    'new-gear': '/dashboard/inventory/new',
    'new-task': '/dashboard/pipeline/new',
    'new-note': '/dashboard/notes/new',
} as const

// Helper to get current view from pathname (for header/nav styling)
export function getViewFromPath(pathname: string): string {
    if (pathname === '/dashboard' || pathname === '/dashboard/') return 'overview'
    if (pathname === '/dashboard/shots/new') return 'new-shot'
    if (pathname.match(/^\/dashboard\/shots\/[^/]+$/)) return 'shot-detail'
    if (pathname === '/dashboard/shots') return 'shots'
    if (pathname === '/dashboard/inventory/new') return 'new-gear'
    if (pathname.match(/^\/dashboard\/inventory\/[^/]+$/)) return 'equipment-detail'
    if (pathname === '/dashboard/inventory') return 'inventory'
    if (pathname === '/dashboard/notes/new') return 'new-note'
    if (pathname.match(/^\/dashboard\/notes\/[^/]+$/)) return 'note-detail'
    if (pathname === '/dashboard/notes') return 'notes'
    if (pathname === '/dashboard/pipeline/new') return 'new-task'
    if (pathname.match(/^\/dashboard\/pipeline\/[^/]+$/)) return 'task-detail'
    if (pathname === '/dashboard/pipeline') return 'postprod'
    if (pathname === '/dashboard/settings') return 'settings'
    if (pathname === '/dashboard/projects') return 'manage-projects'
    return 'overview'
}
