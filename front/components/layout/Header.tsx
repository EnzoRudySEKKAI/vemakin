import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { Search, Plus, Calendar, Settings, ChevronLeft, Moon, Sun } from 'lucide-react';
import {
  MainView, ShotLayout, InventoryLayout,
  InventoryFilters, PostProdFilters, NotesFilters, Currency, Equipment, PostProdTask
} from '../../types';
import { useHeaderActions } from '../../context/HeaderActionsContext';

// Atomic components
import { ShotsFilterBar } from '../organisms/header/ShotsFilterBar';
import { InventoryFilterBar } from '../organisms/header/InventoryFilterBar';
import { PostProdFilterBar } from '../organisms/header/PostProdFilterBar';
import { NotesFilterBar } from '../organisms/header/NotesFilterBar';
import { DetailViewHeader } from '../organisms/header/DetailViewHeader';
import { ProjectSelector } from '../molecules/ProjectSelector';

interface HeaderProps {
  filterTranslateY?: number;
  currentProject: string;
  setCurrentProject: (name: string) => void;
  projects: Record<string, any>;
  onAddProject: (name: string) => void;
  viewTitle: string;
  mainView: MainView;
  setMainView: (view: MainView) => void;
  projectProgress: number;
  activeDate: string;
  shotLayout?: ShotLayout;
  setShotLayout?: (layout: ShotLayout) => void;
  isDateSelectorOpen: boolean;
  setIsDateSelectorOpen: (isOpen: boolean) => void;
  handleDateSelect: (date: string | null) => void;
  inventoryFilters: InventoryFilters;
  setInventoryFilters: (filters: InventoryFilters) => void;
  dates: string[];
  groupedShots: Record<string, Shot[]>;
  currency: Currency;
  setCurrency: (currency: Currency) => void;

  // Shots Props
  shotSearchQuery: string;
  setShotSearchQuery: (query: string) => void;
  shotStatusFilter: 'all' | 'pending' | 'done';
  setShotStatusFilter: (status: 'all' | 'pending' | 'done') => void;

  // PostProd Props
  postProdFilters?: PostProdFilters;
  setPostProdFilters?: (filters: Partial<PostProdFilters>) => void;
  onAddPostProdTask?: () => void;
  postProdLayout?: 'grid' | 'list';
  setPostProdLayout?: (layout: 'grid' | 'list') => void;

  // Inventory Layout
  inventoryLayout?: InventoryLayout;
  setInventoryLayout?: (layout: InventoryLayout) => void;

  // Notes Props
  notesFilters?: NotesFilters;
  setNotesFilters?: (filters: NotesFilters) => void;
  notesLayout?: 'grid' | 'list';
  setNotesLayout?: (layout: 'grid' | 'list') => void;

  // Wide Mode
  isWideMode: boolean;
  onToggleWideMode: () => void;

  // Dark Mode
  darkMode: boolean;
  onToggleDarkMode: () => void;

  // Add Action
  onAdd: () => void;
  inventory?: Equipment[];
  tasks?: PostProdTask[];
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
  const { backAction, detailLabel } = useHeaderActions();
  const headerBottomRef = useRef<HTMLDivElement>(null);
  const [fadeThreshold, setFadeThreshold] = useState(-90);

  // Measure HeaderBottom height to calculate exact fade transfer threshold
  useEffect(() => {
    const measureHeight = () => {
      if (headerBottomRef.current) {
        const height = headerBottomRef.current.offsetHeight;
        // Transfer fade when HeaderBottom is almost fully hidden (95% hidden)
        setFadeThreshold(-(height * 0.95));
      }
    };

    measureHeight();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureHeight);
    if (headerBottomRef.current) {
      resizeObserver.observe(headerBottomRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [mainView]); // Re-measure when view changes

  // Subtitles map based on screenshots
  const getSubtitle = () => {
    switch (mainView) {
      case 'overview': return 'Production hub';
      case 'shots': return 'Production schedule';
      case 'inventory': return 'Equipment management';
      case 'postprod': return 'Post-production tasks';
      case 'notes': return 'Production knowledge base';
      default: return '';
    }
  };

  const isDetailView = mainView === 'shot-detail' || mainView === 'task-detail' || mainView === 'note-detail' || mainView === 'equipment-detail';
  const isSettingsView = mainView === 'settings' || mainView === 'manage-projects';
  const showFilterBar = mainView !== 'overview' && !isSettingsView && !isDetailView;

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
                  <button
                    onClick={() => setMainView('overview')}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-white transition-all hover:bg-gray-100 dark:hover:bg-white/20 shrink-0"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                )}
                <div className="flex flex-col justify-center leading-none">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white leading-none">
                    {backAction ? (detailLabel || 'Detail view') : viewTitle}
                  </h1>
                  <div className="flex items-center">
                    {!backAction && (
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                        {getSubtitle()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions Group */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleDarkMode}
                  className="w-9 h-9 rounded-[12px] bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-indigo-400 transition-all hover:scale-105 active:scale-95"
                >
                  {darkMode ? <Moon size={18} fill="currentColor" /> : <Sun size={18} />}
                </button>

                {/* Hide settings button when on settings or manage-projects */}
                {!isSettingsView && (
                  <button
                    onClick={() => setMainView('settings')}
                    className="w-9 h-9 rounded-[12px] bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-[#4E47DD] transition-all hover:scale-105 active:scale-95"
                  >
                    <Settings size={18} />
                  </button>
                )}

                <button
                  onClick={onAdd}
                  className="w-9 h-9 rounded-[12px] bg-[#3762E3] dark:bg-[#4E47DD] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
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
  );
});

Header.displayName = 'Header';
