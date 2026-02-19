/**
 * Route prefetching utility for React Router
 * Prefetches route chunks on link hover and idle time
 */

// Route chunk imports map - matches the lazy imports in router/index.tsx
const routeChunks: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/routes/OverviewRoute'),
  '/dashboard/shots': () => import('@/routes/ShotsRoute'),
  '/dashboard/shots/new': () => import('@/routes/ShotFormRoute'),
  '/dashboard/inventory': () => import('@/routes/InventoryRoute'),
  '/dashboard/inventory/new': () => import('@/routes/GearFormRoute'),
  '/dashboard/notes': () => import('@/routes/NotesRoute'),
  '/dashboard/notes/new': () => import('@/routes/NoteFormRoute'),
  '/dashboard/pipeline': () => import('@/routes/PipelineRoute'),
  '/dashboard/pipeline/new': () => import('@/routes/TaskFormRoute'),
  '/dashboard/settings': () => import('@/routes/SettingsRoute'),
  '/dashboard/projects': () => import('@/routes/ProjectsRoute'),
  '/dashboard/projects/new': () => import('@/routes/ProjectFormRoute'),
}

const prefetchedRoutes = new Set<string>()

/**
 * Prefetch a route chunk if not already prefetched
 */
export function prefetchRoute(path: string): void {
  // Normalize path
  const normalizedPath = path.replace(/\/$/, '') || '/dashboard'
  
  // Check exact match first
  let chunkLoader = routeChunks[normalizedPath]
  
  // Check parent route for detail pages (e.g., /dashboard/shots/123 -> /dashboard/shots)
  if (!chunkLoader) {
    const parentPath = normalizedPath.replace(/\/[^/]+$/, '')
    chunkLoader = routeChunks[parentPath]
  }
  
  if (!chunkLoader || prefetchedRoutes.has(normalizedPath)) {
    return
  }
  
  // Mark as prefetched immediately to prevent duplicate requests
  prefetchedRoutes.add(normalizedPath)
  
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePrefetch = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
  
  schedulePrefetch(() => {
    chunkLoader().catch(() => {
      // Silently fail - prefetch shouldn't block navigation
      prefetchedRoutes.delete(normalizedPath)
    })
  })
}

/**
 * Prefetch multiple routes at once
 */
export function prefetchRoutes(paths: string[]): void {
  paths.forEach(prefetchRoute)
}

/**
 * Prefetch routes that are likely to be visited next
 * Call this after initial page load
 */
export function prefetchLikelyRoutes(currentPath: string): void {
  const likelyRoutes = getLikelyRoutes(currentPath)
  
  // Stagger prefetches to avoid network congestion
  likelyRoutes.forEach((route, index) => {
    setTimeout(() => prefetchRoute(route), index * 100)
  })
}

/**
 * Get likely next routes based on current route
 */
function getLikelyRoutes(currentPath: string): string[] {
  const routeMap: Record<string, string[]> = {
    '/dashboard': ['/dashboard/shots', '/dashboard/pipeline', '/dashboard/inventory', '/dashboard/notes'],
    '/dashboard/shots': ['/dashboard/shots/new', '/dashboard/pipeline', '/dashboard/inventory'],
    '/dashboard/inventory': ['/dashboard/inventory/new', '/dashboard/shots', '/dashboard/notes'],
    '/dashboard/notes': ['/dashboard/notes/new', '/dashboard/shots', '/dashboard/pipeline'],
    '/dashboard/pipeline': ['/dashboard/pipeline/new', '/dashboard/shots', '/dashboard/inventory'],
    '/dashboard/settings': ['/dashboard', '/dashboard/projects'],
    '/dashboard/projects': ['/dashboard/projects/new', '/dashboard/settings'],
  }
  
  return routeMap[currentPath] || ['/dashboard/shots', '/dashboard/inventory']
}
