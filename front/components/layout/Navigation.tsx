import React, { useCallback } from 'react'
import { LayoutDashboard, Zap, Package, StickyNote, Plus, Film } from 'lucide-react'
import { MainView } from '@/types'
import { Logo } from '@/components/atoms'
import { prefetchRoute } from '@/utils/prefetch'
import { ROUTE_PATHS } from '@/router'

// Track prefetched routes to avoid duplicate requests
const prefetchedRoutes = new Set<string>()

interface NavigationProps {
  mainView: MainView
  setMainView: (view: MainView) => void
  onPlusClick: () => void
  scale?: number
  isAnimating?: boolean
  hasProjects?: boolean
  stats?: {
    shotsCount?: number
    completedShotsCount?: number
    inventoryCount?: number
    rentedCount?: number
    ownedCount?: number
    tasksCount?: number
    tasksByStatus?: { todo: number; progress: number; review: number; done: number }
    notesCount?: number
    tasksByCategory?: Record<string, number>
    inventoryByCategory?: Record<string, number>
    notesByCategory?: Record<string, number>
  }
}

export const Navigation: React.FC<NavigationProps> = React.memo(({ mainView, setMainView, onPlusClick, scale = 1, isAnimating = false, hasProjects = true, stats }) => {
  // Optimized prefetch handler - triggers on interaction start (mousedown/touchstart)
  // This gives ~100ms head start before click event fires, improving perceived performance
  const handlePrefetch = useCallback((view: MainView | undefined, isActive: boolean) => {
    if (!view || isActive) return
    
    const path = ROUTE_PATHS[view as keyof typeof ROUTE_PATHS]
    if (!path || prefetchedRoutes.has(path)) return
    
    // Mark as prefetched to avoid duplicate requests
    prefetchedRoutes.add(path)
    prefetchRoute(path)
  }, [])

  const SidebarStats = () => {
    if (!stats) return null

    const renderStats = () => {
      switch (mainView) {
        case 'shots':
        case 'shot-detail':
          return (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total shots</span>
                <span className="text-xs font-mono font-medium">{stats.shotsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Completed</span>
                <span className="text-xs font-mono font-medium">{stats.completedShotsCount || 0}</span>
              </div>
            </div>
          )
        case 'inventory':
        case 'equipment-detail':
          const inventoryCategories = stats.inventoryByCategory 
            ? Object.entries(stats.inventoryByCategory).filter(([_, count]) => count > 0)
            : []
          return (
            <div className="flex flex-col gap-1">
              {inventoryCategories.length > 0 && (
                <div className="mb-2 pb-2 border-b border-gray-200 dark:border-white/5">
                  {inventoryCategories.map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">{category}</span>
                      <span className="text-xs font-mono font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total items</span>
                <span className="text-xs font-mono font-medium">{stats.inventoryCount || 0}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs text-muted-foreground">Owned</span>
                <span className="text-xs font-mono font-medium">{stats.ownedCount || 0}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-muted-foreground">Rented</span>
                <span className="text-xs font-mono font-medium">{stats.rentedCount || 0}</span>
              </div>
            </div>
          )
        case 'postprod':
        case 'task-detail':
          const taskCategories = stats.tasksByCategory
            ? Object.entries(stats.tasksByCategory).filter(([_, count]) => count > 0)
            : []
          return (
            <div className="flex flex-col gap-1">
              {taskCategories.length > 0 && (
                <div className="mb-2 pb-2 border-b border-gray-200 dark:border-white/5">
                  {taskCategories.map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">{category}</span>
                      <span className="text-xs font-mono font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {stats.tasksByStatus && (
                <div>
                  {stats.tasksByStatus.todo > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">Todo</span>
                      <span className="text-xs font-mono font-medium">{stats.tasksByStatus.todo}</span>
                    </div>
                  )}
                  {stats.tasksByStatus.progress > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-mono font-medium">{stats.tasksByStatus.progress}</span>
                    </div>
                  )}
                  {stats.tasksByStatus.review > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">Review</span>
                      <span className="text-xs font-mono font-medium">{stats.tasksByStatus.review}</span>
                    </div>
                  )}
                  {stats.tasksByStatus.done > 0 && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">Done</span>
                      <span className="text-xs font-mono font-medium">{stats.tasksByStatus.done}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total tasks</span>
                <span className="text-xs font-mono font-medium">{stats.tasksCount || 0}</span>
              </div>
            </div>
          )
        case 'notes':
        case 'note-detail':
          const notesCategories = stats.notesByCategory
            ? Object.entries(stats.notesByCategory).filter(([_, count]) => count > 0)
            : []
          return (
            <div className="flex flex-col gap-1">
              {notesCategories.length > 0 && (
                <div className="mb-2 pb-2 border-b border-gray-200 dark:border-white/5">
                  {notesCategories.map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-0.5">
                      <span className="text-xs text-muted-foreground">{category}</span>
                      <span className="text-xs font-mono font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total notes</span>
                <span className="text-xs font-mono font-medium">{stats.notesCount || 0}</span>
              </div>
            </div>
          )
        default:
          return null
      }
    }

    const content = renderStats()
    if (!content) return null

    return (
      <div className="hidden 2xl:block mt-auto p-2 border-t border-gray-200 dark:border-white/10 max-h-[40vh] overflow-y-auto">
        {content}
      </div>
    )
  }

  const NavItem = ({ view, icon: Icon, label, onClick }: { view?: MainView, icon: any, label: string, onClick: () => void }) => {
    const isActive = view ? mainView === view : false
    
    // Use mousedown for desktop to start prefetch ~100ms before click
    // This is the key optimization for INP - start loading before user releases mouse
    const handleMouseDown = useCallback(() => {
      handlePrefetch(view, isActive)
    }, [view, isActive, handlePrefetch])
    
    // Also prefetch on hover for users who hover before clicking
    const handleMouseEnter = useCallback(() => {
      handlePrefetch(view, isActive)
    }, [view, isActive, handlePrefetch])
    
    return (
      <button
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onFocus={handleMouseEnter}
        className={`flex items-center lg:justify-center 2xl:justify-start gap-4 px-4 lg:px-2 2xl:px-6 py-3.5 text-sm font-mono  tracking-wider transition-all duration-200 group w-full 2xl:w-auto
          ${isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-[#e8e8e8] dark:hover:bg-white/10'
          }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2.2} className="transition-transform group-hover:scale-105" />
        <span className="hidden 2xl:inline">{label}</span>
      </button>
    )
  }

  const MobileNavItem = ({ icon: Icon, label, active, onClick, view }: { icon: any, label: string, active: boolean, onClick: () => void, view?: MainView }) => {
    // Use touchstart for mobile to prefetch as early as possible
    // touchstart fires before click, giving us precious milliseconds
    const handleTouchStart = useCallback(() => {
      handlePrefetch(view, active)
    }, [view, active, handlePrefetch])
    
    // Also prefetch on mouseenter for hybrid devices
    const handleMouseEnter = useCallback(() => {
      handlePrefetch(view, active)
    }, [view, active, handlePrefetch])
    
    return (
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all duration-200 pointer-events-auto hover:bg-[#e8e8e8] dark:hover:bg-white/5 rounded-sm ${active ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-[10px] font-mono  tracking-wider ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      </button>
    )
  }

  const isInteractive = scale > 0.3

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION (< 1024px) */}
      <nav
        className="lg:hidden fixed left-0 right-0 z-[1000]"
        style={{
          bottom: '0.5rem',
          pointerEvents: isInteractive ? 'auto' : 'none'
        }}
      >
        <div
          className="flex items-center justify-center px-4"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'bottom center',
            opacity: Math.max(0.3, scale),
            willChange: isAnimating ? 'transform, opacity' : 'auto',
            transition: isAnimating ? 'transform 250ms ease-out, opacity 250ms ease-out' : 'none'
          }}
        >
          <div className="flex items-center justify-between gap-1 p-2 px-4 bg-[#F2F2F7] dark:bg-[#0F1116] border border-gray-300/50 dark:border-white/10 pointer-events-auto w-full max-w-[400px]">
            <MobileNavItem active={mainView === 'overview'} onClick={() => setMainView('overview')} icon={LayoutDashboard} label="Home" view="overview" />
            <MobileNavItem active={mainView === 'shots'} onClick={() => setMainView('shots')} icon={Film} label="Timeline" view="shots" />
            <MobileNavItem active={mainView === 'inventory'} onClick={() => setMainView('inventory')} icon={Package} label="Inventory" view="inventory" />
            <MobileNavItem active={mainView === 'postprod'} onClick={() => setMainView('postprod')} icon={Zap} label="Pipeline" view="postprod" />
            <MobileNavItem active={mainView === 'notes'} onClick={() => setMainView('notes')} icon={StickyNote} label="Notes" view="notes" />
          </div>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR NAVIGATION (>= 1024px) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] 2xl:w-[280px] flex-col z-[1000] px-4 py-8 bg-[#F2F2F7] dark:bg-[#0F1116]">
        {/* Logo Area */}
        <div className="px-4 mb-10 flex items-center lg:justify-center 2xl:justify-start">
          <Logo size="lg" showText={false} className="2xl:hidden" />
          <Logo size="lg" className="hidden 2xl:flex" />
        </div>

        {/* Nav Items */}

        <div className="flex flex-col gap-1 flex-1">
          <NavItem view="overview" icon={LayoutDashboard} label="Home" onClick={() => setMainView('overview')} />
          <NavItem view="shots" icon={Film} label="Timeline" onClick={() => setMainView('shots')} />
          <NavItem view="inventory" icon={Package} label="Equipment" onClick={() => setMainView('inventory')} />
          <NavItem view="postprod" icon={Zap} label="Pipeline" onClick={() => setMainView('postprod')} />
          <NavItem view="notes" icon={StickyNote} label="Notes" onClick={() => setMainView('notes')} />
        </div>

        <SidebarStats />

        {/* Add Button */}
        <button
          onClick={onPlusClick}
          className="mt-auto mx-auto 2xl:mx-0 w-12 h-12 2xl:w-full 2xl:h-14 flex items-center justify-center gap-3 bg-transparent hover:bg-[#e8e8e8] dark:hover:bg-white/10 active:scale-[0.96] text-foreground transition-all font-mono  tracking-wider group"
        >
          <Plus size={24} strokeWidth={2.8} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden 2xl:inline text-sm">New</span>
        </button>
      </nav>
    </>
  )
})

Navigation.displayName = 'Navigation'
