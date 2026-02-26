import React, { useState, forwardRef, useRef, useEffect } from 'react'
import { Plus, Settings, ChevronLeft } from 'lucide-react'
import {
  MainView, ShotLayout, InventoryLayout,
  InventoryFilters, PostProdFilters, NotesFilters, Currency, Equipment, PostProdTask
} from '@/types'
import { useHeaderActions } from '@/context/HeaderActionsContext'

// Atomic components
import { ShotsFilterBar } from '@/components/organisms/header/ShotsFilterBar'
import { InventoryFilterBar } from '@/components/organisms/header/InventoryFilterBar'
import { PostProdFilterBar } from '@/components/organisms/header/PostProdFilterBar'
import { NotesFilterBar } from '@/components/organisms/header/NotesFilterBar'
import { DetailViewHeader } from '@/components/organisms/header/DetailViewHeader'
import { ProjectSelector } from '@/components/molecules/ProjectSelector'

interface HeaderProps {
  filterTranslateY?: number
  currentProject: string | null
  setCurrentProject: (name: string) => void
  projects: string[]
  onNavigateToCreateProject: () => void
  viewTitle: string
  mainView: MainView
  setMainView: (view: MainView) => void
  projectProgress: number
  activeDate: string
  dateFilter: string | null
  shotLayout?: ShotLayout
  setShotLayout?: (layout: ShotLayout) => void
  isDateSelectorOpen: boolean
  setIsDateSelectorOpen: (isOpen: boolean) => void
  handleDateSelect: (date: string | null) => void
  inventoryFilters: InventoryFilters
  setInventoryFilters: (filters: InventoryFilters) => void
  dates: string[]
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
  setNotesFilters?: (filters: Partial<NotesFilters>) => void
  notesLayout?: 'grid' | 'list'
  setNotesLayout?: (layout: 'grid' | 'list') => void

  // Wide Mode
  isWideMode: boolean
  onToggleWideMode: () => void

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
  onNavigateToCreateProject,
  projectProgress,
  onAdd,
  setMainView,
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
  dateFilter,
  inventory = [],
  tasks = []
}, ref) => {
  const { backAction, detailLabel } = useHeaderActions()
  const headerBottomRef = useRef<HTMLDivElement>(null)

  const getSubtitle = () => {
    switch (mainView) {
      case 'overview': return 'What\'s new ?'
      case 'shots': return 'Production schedule'
      case 'inventory': return 'Equipment management'
      case 'postprod': return 'Post-production tasks'
      case 'notes': return 'Production notes'
      default: return ''
    }
  }

  const isDetailView = mainView === 'shot-detail' || mainView === 'task-detail' || mainView === 'note-detail' || mainView === 'equipment-detail'
  const isSettingsView = mainView === 'settings' || mainView === 'manage-projects'
  const showFilterBar = mainView !== 'overview' && !isSettingsView && !isDetailView

  return (
    <>
      {/* HeaderTop - Fixed title row */}
      <header
        ref={ref}
        data-header-row="1"
        className="fixed top-0 left-0 right-0 z-[51] bg-[#F2F2F7] dark:bg-[#0F1116]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        }}
      >
        <div className={`${isSettingsView ? '' : 'lg:pl-[calc(88px+1.5rem)] 2xl:pl-[calc(280px+1.5rem)]'}`}>
          <div className="mx-auto w-full max-w-[90%]">
            <div className="flex items-center justify-between h-14">
              {/* Left: Title & Subtitle */}
              <div className="flex items-center gap-3">
                {isSettingsView && (
                  <button
                    onClick={() => setMainView('overview')}
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:border-primary/30 bg-[#f5f5f5] hover:bg-[#eeeeee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white/70 transition-colors"
                  >
                    <ChevronLeft size={20} strokeWidth={2} />
                  </button>
                )}
                <div className="flex flex-col justify-center">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {backAction ? (detailLabel || 'Detail View') : viewTitle}
                  </h1>
                  {!backAction && (
                    <span className="text-sm font-mono tracking-wider text-muted-foreground">
                      {getSubtitle()}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Actions Group */}
              <div className="flex items-center gap-2">
                {!isSettingsView && (
                  <button
                    onClick={() => setMainView('settings')}
                    className="cursor-pointer w-9 h-9 flex items-center justify-center border border-gray-300 hover:border-primary/30 bg-[#f5f5f5] hover:bg-[#eeeeee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white/70 transition-colors"
                  >
                    <Settings size={18} />
                  </button>
                )}

                <button
                  onClick={onAdd}
                  className="cursor-pointer w-9 h-9 flex items-center justify-center border border-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-colors"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HeaderBottom - Fixed filter row */}
      <div
        ref={headerBottomRef}
        data-header-row="2"
        className="fixed left-0 right-0 z-[50] bg-[#F2F2F7] dark:bg-[#0F1116] pt-2 overflow-visible"
        style={{
          top: 'calc(env(safe-area-inset-top) + 68px)',
          transform: `translateY(${filterTranslateY}px)`
        }}
      >
        <div className={`${isSettingsView ? '' : 'lg:pl-[calc(88px+1.5rem)] 2xl:pl-[calc(280px+1.5rem)]'}`}>
          <div className="mx-auto w-full max-w-[90%]">
            <div className="flex flex-col gap-2 pb-3">
              {isDetailView || backAction ? (
                <DetailViewHeader />
              ) : (
                <>
                  {mainView === 'overview' && (
                    <ProjectSelector
                      currentProject={currentProject}
                      projects={projects}
                      onSelect={setCurrentProject}
                      onNavigateToCreate={onNavigateToCreateProject}
                    />
                  )}

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
                          activeDate={activeDate}
                          dateFilter={dateFilter}
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
                          dateFilter={dateFilter}
                          isDatePickerOpen={isDateSelectorOpen}
                          onDatePickerToggle={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                          onDateSelect={handleDateSelect}
                        />
                      )}

                      {mainView === 'notes' && notesFilters && setNotesFilters && notesLayout && setNotesLayout && (
                        <NotesFilterBar
                          searchQuery={notesFilters.query}
                          onSearchChange={(query) => setNotesFilters({ query })}
                          categoryFilter={notesFilters.category}
                          onCategoryChange={(category) => setNotesFilters({ category })}
                          filters={notesFilters}
                          layout={notesLayout}
                          onLayoutChange={setNotesLayout}
                          onSortChange={(sortBy) => setNotesFilters({ sortBy, sortDirection: sortBy === 'alpha' ? 'asc' : 'desc' })}
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
    </>
  )
})

Header.displayName = 'Header'
