import { lazy, Suspense } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AuthRoute } from '@/routes/AuthRoute'

const LandingPage = lazy(() => import('@/components/landing/LandingPage'))
const LandingView = lazy(() => import('@/components/auth/LandingView').then(m => ({ default: m.LandingView })))
const SignInView = lazy(() => import('@/components/auth/SignInView').then(m => ({ default: m.SignInView })))
const SignUpView = lazy(() => import('@/components/auth/SignUpView').then(m => ({ default: m.SignUpView })))
const ForgotPasswordView = lazy(() => import('@/components/auth/ForgotPasswordView').then(m => ({ default: m.ForgotPasswordView })))
const OverviewRoute = lazy(() => import('@/routes/OverviewRoute').then(m => ({ default: m.OverviewRoute })))
const ShotsRoute = lazy(() => import('@/routes/ShotsRoute').then(m => ({ default: m.ShotsRoute })))
const ShotDetailRoute = lazy(() => import('@/routes/ShotDetailRoute').then(m => ({ default: m.ShotDetailRoute })))
const ShotFormRoute = lazy(() => import('@/routes/ShotFormRoute').then(m => ({ default: m.ShotFormRoute })))
const InventoryRoute = lazy(() => import('@/routes/InventoryRoute').then(m => ({ default: m.InventoryRoute })))
const EquipmentDetailRoute = lazy(() => import('@/routes/EquipmentDetailRoute').then(m => ({ default: m.EquipmentDetailRoute })))
const GearFormRoute = lazy(() => import('@/routes/GearFormRoute').then(m => ({ default: m.GearFormRoute })))
const NotesRoute = lazy(() => import('@/routes/NotesRoute').then(m => ({ default: m.NotesRoute })))
const NoteDetailRoute = lazy(() => import('@/routes/NoteDetailRoute').then(m => ({ default: m.NoteDetailRoute })))
const NoteFormRoute = lazy(() => import('@/routes/NoteFormRoute').then(m => ({ default: m.NoteFormRoute })))
const PipelineRoute = lazy(() => import('@/routes/PipelineRoute').then(m => ({ default: m.PipelineRoute })))
const TaskDetailRoute = lazy(() => import('@/routes/TaskDetailRoute').then(m => ({ default: m.TaskDetailRoute })))
const TaskFormRoute = lazy(() => import('@/routes/TaskFormRoute').then(m => ({ default: m.TaskFormRoute })))
const SettingsRoute = lazy(() => import('@/routes/SettingsRoute').then(m => ({ default: m.SettingsRoute })))
const ProjectsRoute = lazy(() => import('@/routes/ProjectsRoute').then(m => ({ default: m.ProjectsRoute })))

import { rootLoader, shotsLoader, inventoryLoader, notesLoader, pipelineLoader, detailLoader } from './loaders'

const PageLoader = () => (
  <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={withSuspense(LandingPage)} />
            
            <Route element={<AuthRoute />}>
                <Route path="/auth" element={<AuthLandingRoute />} />
                <Route path="/auth/login" element={<SignInPageRoute />} />
                <Route path="/auth/register" element={<SignUpPageRoute />} />
                <Route path="/auth/forgot-password" element={withSuspense(ForgotPasswordView)} />
            </Route>
            
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<RootLayout />} loader={rootLoader} hydrateFallbackElement={<PageLoader />}>
                    <Route index element={withSuspense(OverviewRoute)} />
                    <Route path="shots" element={withSuspense(ShotsRoute)} loader={shotsLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="shots/new" element={withSuspense(ShotFormRoute)} />
                    <Route path="shots/:id" element={withSuspense(ShotDetailRoute)} loader={detailLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="inventory" element={withSuspense(InventoryRoute)} loader={inventoryLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="inventory/new" element={withSuspense(GearFormRoute)} />
                    <Route path="inventory/:id" element={withSuspense(EquipmentDetailRoute)} loader={detailLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="notes" element={withSuspense(NotesRoute)} loader={notesLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="notes/new" element={withSuspense(NoteFormRoute)} />
                    <Route path="notes/:id" element={withSuspense(NoteDetailRoute)} loader={detailLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="pipeline" element={withSuspense(PipelineRoute)} loader={pipelineLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="pipeline/new" element={withSuspense(TaskFormRoute)} />
                    <Route path="pipeline/:id" element={withSuspense(TaskDetailRoute)} loader={detailLoader} hydrateFallbackElement={<PageLoader />} />
                    <Route path="settings" element={withSuspense(SettingsRoute)} />
                    <Route path="projects" element={withSuspense(ProjectsRoute)} />
                </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </>
    ),
    {
        future: {
            v7_partialHydration: true,
        },
    }
)

import { useNavigate } from 'react-router-dom'

function SignInPageRoute() {
  const navigate = useNavigate()
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInView 
        onBack={() => navigate('/auth')} 
        onSignIn={() => navigate('/dashboard')} 
      />
    </Suspense>
  )
}

function SignUpPageRoute() {
  const navigate = useNavigate()
  return (
    <Suspense fallback={<PageLoader />}>
      <SignUpView 
        onBack={() => navigate('/auth')} 
        onSignUp={() => navigate('/dashboard')} 
      />
    </Suspense>
  )
}

function AuthLandingRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LandingView />
    </Suspense>
  )
}

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
    auth: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
} as const

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
