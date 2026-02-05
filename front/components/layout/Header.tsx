import React, { useState, forwardRef, useRef, useEffect } from 'react'
import { Search, Plus, Calendar, Settings, ChevronLeft, Moon, Sun } from 'lucide-react'
import {
  MainView, ShotLayout, InventoryLayout,
  InventoryFilters, PostProdFilters, NotesFilters, Currency, Equipment, PostProdTask
} from '@/types'
import { useHeaderActions } from '@/context/HeaderActionsContext'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { IconContainer } from '@/components/atoms/IconContainer'

// Atomic components
import { ShotsFilterBar } from '@/components/organisms/header/ShotsFilterBar'
import { InventoryFilterBar } from '@/components/organisms/header/InventoryFilterBar'
import { PostProdFilterBar } from '@/components/organisms/header/PostProdFilterBar'
import { NotesFilterBar } from '@/components/organisms/header/NotesFilterBar'
import { DetailViewHeader } from '@/components/organisms/header/DetailViewHeader'
import { ProjectSelector } from '@/components/molecules/ProjectSelector'

interface HeaderProps {
  filterTranslateY?: number
  currentProject: string
  setCurrentProject: (name: string) => void
  projects: Record<string, any>
  onAddProject: (name: string) => void
  viewTitle: string
  mainView: MainView
  setMainView: (view: MainView) => void
  projectProgress: number
  activeDate: string
  shotLayout?: ShotLayout
  setShotLayout?: (layout: ShotLayout) => void
  isDateSelectorOpen: boolean
  setIsDateSelectorOpen: (isOpen: boolean) => void
  handleDateSelect: (date: string | null) => void
  inventoryFilters: InventoryFilters
  setInventoryFilters: (filters: InventoryFilters) => void
  dates: string[]
  groupedShots: Record<string, any[]>
  currency: Currency
  setCurrency: (currency: Currency) => void

  // Shots Props
  shotSearchQuery: string
  setShotSearchQuery: (query: string) => void
  shotStatusFilter: 'all' | 'pending' | 'done'
  setShotStatusFilter: (status: 'all' | 'pending' | 'done') => void

  // PostProd Props
  postProdFilters?: PostProdFilters
  setPostProdFilters?: (filters: Partial<PostProdFilters>) => void
  onAddPostProdTask?: () => void
  postProdLayout?: 'grid' | 'list'
  setPostProdLayout?: (layout: 'grid' | 'list') => void

  // Inventory Layout
  inventoryLayout?: InventoryLayout
  setInventoryLayout?: (layout: InventoryLayout) => void

  // Notes Props
  notesFilters?: NotesFilters
  setNotesFilters?: (filters: NotesFilters) => void
  notesLayout?: 'grid' | 'list'
  setNotesLayout?: (layout: 'grid' | 'list') => void

  // Wide Mode
  isWideMode: boolean
  onToggleWideMode: () => void

  // Dark Mode
  darkMode: boolean
  onToggleDarkMode: () => void

  // Add Action
  onAdd: () => void
  inventory?: Equipment[]
  tasks?: PostProdTask[]
}

export const Header = forwardRef<HTMLElement, HeaderProps>(({
  filterTranslateY = 0,
  viewTitle,
  mainView,
  currentProject,
  setCurrentProject,
  projects,
  onAddProject,
  // Helper props
  projectProgress,
  groupedShots,
  // Actions
  onToggleDarkMode,
  darkMode,
  onAdd,
  setMainView,
  // Filters & State
  shotSearchQuery,
  setShotSearchQuery,
  shotStatusFilter,
  setShotStatusFilter,
  shotLayout,
  setShotLayout,
  inventoryFilters,
  setInventoryFilters,
  inventoryLayout,
  setInventoryLayout,
  postProdFilters,
  setPostProdFilters,
  postProdLayout,
  setPostProdLayout,
  notesFilters,
  setNotesFilters,
  notesLayout,
  setNotesLayout,
  isWideMode,
  isDateSelectorOpen,
  setIsDateSelectorOpen,
  activeDate,
  handleDateSelect,
  inventory = [],
  tasks = []
}, ref) => {
  const { backAction, detailLabel } = useHeaderActions()
  const headerBottomRef = useRef<HTMLDivElement>(null)
  const [fadeThreshold, setFadeThreshold] = useState(-90)

  // Measure HeaderBottom height to calculate exact fade transfer threshold
  useEffect(() => {
    const measureHeight = () => {
      if (headerBottomRef.current) {
        const height = headerBottomRef.current.offsetHeight
        // Transfer fade when HeaderBottom is almost fully hidden (95% hidden)
        setFadeThreshold(-(height * 0.95))
      }
    }

    measureHeight()

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureHeight)
    if (headerBottomRef.current) {
      resizeObserver.observe(headerBottomRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [mainView])

  // Subtitles map based on screenshots
  const getSubtitle = () => {
    switch (mainView) {
      case 'overview': return 'Production Hub'
      case 'shots': return 'Production Schedule'
      case 'inventory': return 'Equipment Management'
      case 'postprod': return 'Post-production Tasks'
      case 'notes': return 'Production Knowledge Base'
      default: return ''
    }
  }

  const isDetailView = mainView === 'shot-detail' || mainView === 'task-detail' || mainView === 'note-detail' || mainView === 'equipment-detail'
  const isSettingsView = mainView === 'settings' || mainView === 'manage-projects'
  const showFilterBar = mainView !== 'overview' && !isSettingsView && !isDetailView

  return (
    <>
      {/* HeaderTop - Fixed title row (z-[51]) */}
      <header
        ref={ref}
        className="fixed top-0 left-0 right-0 z-[51] bg-[#F2F2F7] dark:bg-[#141417] transition-colors duration-150 overflow-visible"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + var(--header-padding-top, 12px))',
        }}
      >
        <div className="px-4 md:px-6 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)]">
          <div className={`mx-auto w-full ${isWideMode ? 'max-w-[90%]' : 'max-w-7xl'}`}>
            {/* --- ROW 1: Title & Main Actions --- */}
            <div data-header-row="1" className="flex items-center justify-between min-h-[50px] pb-3">
              {/* Left: Title & Subtitle */}
              <div className="flex items-center gap-3">
                {/* Back button for Settings and Manage Projects */}
                {isSettingsView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMainView('overview')}
                    leftIcon={<ChevronLeft size={20} strokeWidth={2.5} />}
                    className="shrink-0"
                  />
                )}
                <div className="flex flex-col justify-center leading-none">
                  <Text variant="h2" className="text-gray-900 dark:text-white">
                    {backAction ? (detailLabel || 'Detail View') : viewTitle}
                  </Text>
                  <div className="flex items-center">
                    {!backAction && (
                      <Text variant="caption" color="muted">
                        {getSubtitle()}
                      </Text>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions Group */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onToggleDarkMode}
                  leftIcon={darkMode ? <Moon size={18} fill="currentColor" strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
                />

                {/* Hide settings button when on settings or manage-projects */}
                {!isSettingsView && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMainView('settings')}
                    leftIcon={<Settings size={18} strokeWidth={2.5} />}
                  />
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAdd}
                  leftIcon={<Plus size={20} strokeWidth={2.5} />}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Fade effect on HeaderTop - only visible when HeaderBottom is hidden */}
        <div
          className="absolute left-0 right-0 bottom-0 h-6 pointer-events-none translate-y-full transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to bottom, var(--header-fade-color) 0%, transparent 100%)',
            opacity: filterTranslateY < -5 ? 1 : 0
          }}
        />
        <style>{`
          :root { --header-fade-color: #F2F2F7; }
          .dark { --header-fade-color: #141417; }
        `}</style>
      </header>

      {/* HeaderBottom - Fixed filter row (z-[50]) - slides behind HeaderTop */}
      <div
        ref={headerBottomRef}
        className="fixed left-0 right-0 z-[50] will-change-transform bg-[#F2F2F7] dark:bg-[#141417] pt-3 overflow-visible"
        style={{
          top: 'calc(env(safe-area-inset-top) + var(--header-padding-top, 12px) + 50px)',
          transform: `translateY(${filterTranslateY}px)`
        }}
      >
        <div className="px-4 md:px-6 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)]">
          <div className={`mx-auto w-full ${isWideMode ? 'max-w-[90%]' : 'max-w-7xl'}`}>
            {/* --- ROW 2: Dynamic Controls (Drawer Effect) --- */}
            <div data-header-row="2">
              <div className="flex flex-col gap-2">
                {/* Detail Mode Controls */}
                {isDetailView || backAction ? (
                  <DetailViewHeader />
                ) : (
                  <>
                    {/* Project Selector Card */}
                    {mainView === 'overview' && (
                      <ProjectSelector
                        currentProject={currentProject}
                        projects={projects}
                        onSelect={setCurrentProject}
                        onCreate={onAddProject}
                      />
                    )}

                    {/* Filter Bars for different views */}
                    {showFilterBar && (
                      <>
                        {mainView === 'shots' && shotLayout && setShotLayout && (
                          <ShotsFilterBar
                            searchQuery={shotSearchQuery}
                            onSearchChange={setShotSearchQuery}
                            statusFilter={shotStatusFilter}
                            onStatusChange={setShotStatusFilter}
                            layout={shotLayout}
                            onLayoutChange={setShotLayout}
                            projectProgress={projectProgress}
                            groupedShots={groupedShots}
                            activeDate={activeDate}
                            isDatePickerOpen={isDateSelectorOpen}
                            onDatePickerToggle={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                            onDateSelect={handleDateSelect}
                          />
                        )}

                        {mainView === 'inventory' && inventoryLayout && setInventoryLayout && (
                          <InventoryFilterBar
                            searchQuery={inventoryFilters.query}
                            onSearchChange={(query) => setInventoryFilters({ ...inventoryFilters, query })}
                            categoryFilter={inventoryFilters.category}
                            onCategoryChange={(category) => setInventoryFilters({ ...inventoryFilters, category })}
                            ownershipFilter={inventoryFilters.ownership}
                            onOwnershipChange={(ownership) => setInventoryFilters({ ...inventoryFilters, ownership })}
                            layout={inventoryLayout}
                            onLayoutChange={setInventoryLayout}
                            inventory={inventory}
                          />
                        )}

                        {mainView === 'postprod' && postProdFilters && setPostProdFilters && postProdLayout && setPostProdLayout && (
                          <PostProdFilterBar
                            searchQuery={postProdFilters.searchQuery || ''}
                            onSearchChange={(searchQuery) => setPostProdFilters({ searchQuery })}
                            filters={postProdFilters}
                            onFiltersChange={setPostProdFilters}
                            layout={postProdLayout}
                            onLayoutChange={setPostProdLayout}
                            tasks={tasks}
                            activeDate={activeDate}
                            isDatePickerOpen={isDateSelectorOpen}
                            onDatePickerToggle={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                            onDateSelect={handleDateSelect}
                          />
                        )}

                        {mainView === 'notes' && notesFilters && setNotesFilters && notesLayout && setNotesLayout && (
                          <NotesFilterBar
                            searchQuery={notesFilters.query}
                            onSearchChange={(query) => setNotesFilters({ ...notesFilters, query })}
                            categoryFilter={notesFilters.category}
                            onCategoryChange={(category) => setNotesFilters({ ...notesFilters, category })}
                            layout={notesLayout}
                            onLayoutChange={setNotesLayout}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Fade effect on HeaderBottom - visible when not hidden */}
        <div
          className="absolute left-0 right-0 bottom-0 h-6 pointer-events-none translate-y-full transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to bottom, var(--header-fade-color) 0%, transparent 100%)',
            opacity: filterTranslateY >= -5 ? 1 : 0
          }}
        />
      </div>
    </>
  )
})

Header.displayName = 'Header'
