import React from 'react'
import { LayoutDashboard, Zap, Package, StickyNote, Plus, Film } from 'lucide-react'
import { MainView } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { IconContainer } from '@/components/atoms/IconContainer'

interface NavigationProps {
  mainView: MainView
  setMainView: (view: MainView) => void
  onPlusClick: () => void
  scale?: number
  isAnimating?: boolean
}

export const Navigation: React.FC<NavigationProps> = React.memo(({ mainView, setMainView, onPlusClick, scale = 1, isAnimating = false }) => {
  const NavItem = ({ view, icon: Icon, label, onClick }: { view?: MainView, icon: any, label: string, onClick: () => void }) => {
    const isActive = view ? mainView === view : false
    return (
      <button
        onClick={onClick}
        className={`flex items-center lg:justify-center xl:justify-start gap-4 px-4 lg:px-2 xl:px-4 py-3 rounded-2xl text-xl font-semibold transition-all duration-200 group w-full xl:w-auto
          ${isActive
            ? 'text-black dark:text-white'
            : 'text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/10'
          }`}
      >
        <div className="relative p-2">
          <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
          {isActive && <div className="absolute top-1 right-0 w-2 h-2 bg-blue-600 dark:bg-indigo-600 rounded-full" />}
        </div>
        <span className="hidden xl:inline">{label}</span>
      </button>
    )
  }

  const MobileNavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 gap-1 py-1 transition-all duration-300 pointer-events-auto ${active ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
    >
      <div className={`p-1.5 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-50 dark:bg-indigo-500/10 scale-105 shadow-sm' : ''}`}>
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </div>
      <Text variant="label" className={`transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</Text>
    </button>
  )

  // Disable pointer events when mostly minimized
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
            transition: isAnimating ? 'transform 250ms cubic-bezier(0.33, 1, 0.68, 1), opacity 250ms cubic-bezier(0.33, 1, 0.68, 1)' : 'none'
          }}
        >
          <GlassCard className="flex items-center justify-between gap-1 p-1 px-3 shadow-[0_15px_40px_rgba(0,0,0,0.25)] border-white/60 dark:border-white/10 bg-white/95 dark:bg-[#1C1C1E]/95 rounded-[20px] pointer-events-auto w-full max-w-[480px]">
            <MobileNavItem active={mainView === 'overview'} onClick={() => setMainView('overview')} icon={LayoutDashboard} label="Home" />
            <MobileNavItem active={mainView === 'shots'} onClick={() => setMainView('shots')} icon={Film} label="Timeline" />
            <MobileNavItem active={mainView === 'inventory'} onClick={() => setMainView('inventory')} icon={Package} label="Inventory" />
            <MobileNavItem active={mainView === 'postprod'} onClick={() => setMainView('postprod')} icon={Zap} label="Pipeline" />
            <MobileNavItem active={mainView === 'notes'} onClick={() => setMainView('notes')} icon={StickyNote} label="Notes" />
          </GlassCard>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR NAVIGATION (>= 1024px) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] xl:w-[275px] flex-col z-[1000] px-2 lg:px-2 xl:px-2 py-4 justify-start pt-12 lg:pl-6 lg:pr-0 xl:pl-8 lg:items-center xl:items-start">
        {/* Nav Items Container */}
        <div className="flex flex-col gap-2 w-full">
          {/* Logo Area */}
          <div className="px-4 lg:px-2 xl:px-4 py-2 mb-6 xl:mb-8 flex items-center lg:justify-center xl:justify-start gap-3">
            <IconContainer icon={Film} size="md" variant="default" className="bg-black dark:bg-white text-white dark:text-black" />
            <Text variant="h2" className="hidden xl:block text-gray-900 dark:text-white">Shotdeck</Text>
          </div>

          <NavItem view="overview" icon={LayoutDashboard} label="Home" onClick={() => setMainView('overview')} />
          <NavItem view="shots" icon={Film} label="Timeline" onClick={() => setMainView('shots')} />
          <NavItem view="inventory" icon={Package} label="Equipment" onClick={() => setMainView('inventory')} />
          <NavItem view="postprod" icon={Zap} label="Pipeline" onClick={() => setMainView('postprod')} />
          <NavItem view="notes" icon={StickyNote} label="Notes" onClick={() => setMainView('notes')} />

          <Button
            variant="primary"
            size="lg"
            onClick={onPlusClick}
            leftIcon={<Plus size={24} strokeWidth={2.5} />}
            className="mt-8 mx-auto xl:mx-0 w-12 h-12 xl:w-full xl:h-auto xl:px-4 xl:py-3"
          >
            <span className="hidden xl:inline ml-2">New</span>
          </Button>
        </div>
      </nav>
    </>
  )
})

Navigation.displayName = 'Navigation'
