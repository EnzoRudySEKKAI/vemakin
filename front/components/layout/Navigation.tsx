import React, { useCallback, useRef } from 'react'
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
}

export const Navigation: React.FC<NavigationProps> = React.memo(({ mainView, setMainView, onPlusClick, scale = 1, isAnimating = false, hasProjects = true }) => {
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
        className={`flex items-center lg:justify-center xl:justify-start gap-4 px-4 lg:px-2 xl:px-6 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 group w-full xl:w-auto
          ${isActive
            ? 'text-primary dark:text-white bg-primary/10 dark:bg-white/10 shadow-sm shadow-primary/10 dark:shadow-white/5'
            : 'text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/90 hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2.2} className="transition-transform group-hover:scale-105" />
        <span className="hidden xl:inline tracking-tight">{label}</span>
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
        className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all duration-200 pointer-events-auto ${active ? 'text-primary dark:text-white' : 'text-gray-500 dark:text-white/30'}`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
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
          <div className="flex items-center justify-between gap-1 p-2 px-4 bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.08] rounded-2xl pointer-events-auto w-full max-w-[400px]">
            <MobileNavItem active={mainView === 'overview'} onClick={() => setMainView('overview')} icon={LayoutDashboard} label="Home" view="overview" />
            <MobileNavItem active={mainView === 'shots'} onClick={() => setMainView('shots')} icon={Film} label="Timeline" view="shots" />
            <MobileNavItem active={mainView === 'inventory'} onClick={() => setMainView('inventory')} icon={Package} label="Inventory" view="inventory" />
            <MobileNavItem active={mainView === 'postprod'} onClick={() => setMainView('postprod')} icon={Zap} label="Pipeline" view="postprod" />
            <MobileNavItem active={mainView === 'notes'} onClick={() => setMainView('notes')} icon={StickyNote} label="Notes" view="notes" />
          </div>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR NAVIGATION (>= 1024px) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] xl:w-[280px] flex-col z-[1000] px-4 py-8 bg-white dark:bg-[#0F1116] border-r border-gray-200 dark:border-white/[0.05]">
        {/* Logo Area */}
        <div className="px-4 mb-10 flex items-center lg:justify-center xl:justify-start">
          <Logo size="lg" showText={false} className="xl:hidden" />
          <Logo size="lg" className="hidden xl:flex" />
        </div>

        {/* Nav Items */}

        <div className="flex flex-col gap-1 flex-1">
          <NavItem view="overview" icon={LayoutDashboard} label="Home" onClick={() => setMainView('overview')} />
          <NavItem view="shots" icon={Film} label="Timeline" onClick={() => setMainView('shots')} />
          <NavItem view="inventory" icon={Package} label="Equipment" onClick={() => setMainView('inventory')} />
          <NavItem view="postprod" icon={Zap} label="Pipeline" onClick={() => setMainView('postprod')} />
          <NavItem view="notes" icon={StickyNote} label="Notes" onClick={() => setMainView('notes')} />
        </div>

        {/* Add Button */}
        <button
          onClick={onPlusClick}
          className="mt-auto mx-auto xl:mx-0 w-12 h-12 xl:w-full xl:h-14 flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.03] border border-gray-300 dark:border-white/10 dark:hover:bg-white/[0.06] dark:hover:border-white/20 active:scale-[0.96] text-gray-900 dark:text-white/90 rounded-2xl transition-all font-semibold group shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20"
        >
          <Plus size={24} strokeWidth={2.8} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden xl:inline text-[15px]">New</span>
        </button>
      </nav>
    </>
  )
})

Navigation.displayName = 'Navigation'
