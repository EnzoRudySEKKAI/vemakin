import React from 'react'
import { LayoutDashboard, Zap, Package, StickyNote, Plus, Film } from 'lucide-react'
import { MainView } from '@/types'
import { Logo } from '@/components/atoms'

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
        className={`flex items-center lg:justify-center xl:justify-start gap-4 px-4 lg:px-2 xl:px-6 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 group w-full xl:w-auto
          ${isActive
            ? 'text-white bg-white/10 shadow-sm shadow-white/5'
            : 'text-white/40 hover:text-white/90 hover:bg-white/5'
          }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2.2} className="transition-transform group-hover:scale-105" />
        <span className="hidden xl:inline tracking-tight">{label}</span>
      </button>
    )
  }

  const MobileNavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all duration-200 pointer-events-auto ${active ? 'text-white' : 'text-white/30'}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  )

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
          <div className="flex items-center justify-between gap-1 p-2 px-4 bg-[#16181D] border border-white/[0.08] rounded-2xl pointer-events-auto w-full max-w-[400px]">
            <MobileNavItem active={mainView === 'overview'} onClick={() => setMainView('overview')} icon={LayoutDashboard} label="Home" />
            <MobileNavItem active={mainView === 'shots'} onClick={() => setMainView('shots')} icon={Film} label="Timeline" />
            <MobileNavItem active={mainView === 'inventory'} onClick={() => setMainView('inventory')} icon={Package} label="Inventory" />
            <MobileNavItem active={mainView === 'postprod'} onClick={() => setMainView('postprod')} icon={Zap} label="Pipeline" />
            <MobileNavItem active={mainView === 'notes'} onClick={() => setMainView('notes')} icon={StickyNote} label="Notes" />
          </div>
        </div>
      </nav>

      {/* DESKTOP SIDEBAR NAVIGATION (>= 1024px) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] xl:w-[280px] flex-col z-[1000] px-4 py-8 bg-[#0F1116]">
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
          className="mt-auto mx-auto xl:mx-0 w-12 h-12 xl:w-full xl:h-14 flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.96] text-white/90 rounded-2xl transition-all font-semibold group shadow-xl shadow-black/20"
        >
          <Plus size={24} strokeWidth={2.8} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden xl:inline text-[15px]">New</span>
        </button>
      </nav>
    </>
  )
})

Navigation.displayName = 'Navigation'
