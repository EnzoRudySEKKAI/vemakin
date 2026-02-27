import React, { lazy, Suspense, useEffect } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { useNavigateBack } from '@/hooks/useNavigateBack'
import { RootLayout } from '@/layouts/RootLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AuthRoute } from '@/routes/AuthRoute'
import { AuthProvider } from '@/providers/AuthProvider'
import { prefetchLikelyRoutes } from '@/utils/prefetch'
import { FullPageLoader } from '@/components/ui/FullPageLoader'

const LandingPage = lazy(() => import('@/components/landing/LandingPage'))
const LandingView = lazy(() => import('@/components/auth/LandingView').then(m => ({ default: m.LandingView })))
const SignInView = lazy(() => import('@/components/auth/SignInView').then(m => ({ default: m.SignInView })))
const SignUpView = lazy(() => import('@/components/auth/SignUpView').then(m => ({ default: m.SignUpView })))
const ForgotPasswordView = lazy(() => import('@/components/auth/ForgotPasswordView').then(m => ({ default: m.ForgotPasswordView })))
const EmailVerificationView = lazy(() => import('@/components/auth/EmailVerificationView').then(m => ({ default: m.EmailVerificationView })))
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
const CustomizationRoute = lazy(() => import('@/routes/CustomizationRoute').then(m => ({ default: m.CustomizationRoute })))
const ProjectsRoute = lazy(() => import('@/routes/ProjectsRoute').then(m => ({ default: m.ProjectsRoute })))
const ProjectFormRoute = lazy(() => import('@/routes/ProjectFormRoute').then(m => ({ default: m.ProjectFormRoute })))

import { rootLoader, shotsLoader, inventoryLoader, notesLoader, pipelineLoader, detailLoader } from './loaders'

const PageLoader = () => <FullPageLoader />

// Wrapper component that provides AuthProvider for routes that need authentication
const AuthProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
)

// Prefetch likely routes after initial load - must forward Outlet context from RootLayout
const RoutePrefetcher = () => {
  const location = useLocation()
  // Get context from parent Outlet (RootLayout)
  const outletContext = useOutletContext()
  
  useEffect(() => {
    // Prefetch likely routes after a short delay to not interfere with initial render
    const timer = setTimeout(() => {
      prefetchLikelyRoutes(location.pathname)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [location.pathname])
  
  // Forward context to children
  return <Outlet context={outletContext} />
}

const withSuspense = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={withSuspense(LandingPage)} />
            
            <Route element={<AuthProviderWrapper><AuthRoute /></AuthProviderWrapper>}>
                <Route path="/auth" element={<AuthLandingRoute />} />
                <Route path="/auth/login" element={<SignInPageRoute />} />
                <Route path="/auth/register" element={<SignUpPageRoute />} />
                <Route path="/auth/forgot-password" element={withSuspense(ForgotPasswordView)} />
            </Route>
            
            <Route element={<AuthProviderWrapper><ProtectedRoute /></AuthProviderWrapper>}>
                <Route path="/auth/verify-email" element={<EmailVerificationPageRoute />} />
            </Route>
            
            <Route element={<AuthProviderWrapper><ProtectedRoute /></AuthProviderWrapper>}>
                <Route path="/dashboard" element={<RootLayout />} loader={rootLoader} hydrateFallbackElement={<PageLoader />}>
                    <Route element={<RoutePrefetcher />}>
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
                    <Route path="settings/customization" element={withSuspense(CustomizationRoute)} />
                    <Route path="projects" element={withSuspense(ProjectsRoute)} />
                    <Route path="projects/new" element={withSuspense(ProjectFormRoute)} />
                    </Route>
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

function SignInPageRoute() {
  const navigate = useNavigate()
  const navigateBack = useNavigateBack()
  return (
    <Suspense fallback={<PageLoader />}>
      <SignInView
        onBack={navigateBack}
        onSignIn={() => navigate('/dashboard')}
      />
    </Suspense>
  )
}

function SignUpPageRoute() {
  const navigate = useNavigate()
  const navigateBack = useNavigateBack()
  return (
    <Suspense fallback={<PageLoader />}>
      <SignUpView
        onBack={navigateBack}
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

function EmailVerificationPageRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EmailVerificationView />
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
    'new-project': '/dashboard/projects/new',
    auth: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    verifyEmail: '/auth/verify-email',
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
    if (pathname === '/dashboard/settings/customization') return 'settings'
    if (pathname === '/dashboard/projects') return 'manage-projects'
    if (pathname === '/dashboard/projects/new') return 'new-project'
    return 'overview'
}
