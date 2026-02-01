
import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Calendar, Film, Package,
  Settings, ChevronLeft, Moon, Sun,
  LayoutGrid, List as ListIcon,
  Filter, MoreHorizontal, ArrowUpDown, ChevronDown, Check, Folder,
  FileText, Scissors, Volume2, Sparkles, Palette, Scroll, StickyNote
} from 'lucide-react';
import {
  MainView, ShotLayout, InventoryLayout,
  Shot, InventoryFilters, PostProdFilters, NotesFilters, Currency, Equipment, PostProdTask
} from '../../types';
import { DatePicker } from '../ui/DatePicker';
import { ScrollFade } from '../ui/ScrollFade';
import { useHeaderActions } from '../../context/HeaderActionsContext';

interface HeaderProps {
  showHeader: boolean;
  showControls: boolean;
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
  showHeader,
  showControls,
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
  onNavigateToSettings, // Assuming this might be needed or we use setMainView('settings')
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
  dates,
  activeDate,
  handleDateSelect,
  inventory = [],
  tasks = []
}, ref) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showPostProdSortDropdown, setShowPostProdSortDropdown] = useState(false);
  const [showPostProdCategoryDropdown, setShowPostProdCategoryDropdown] = useState(false);

  const { actions, backAction, detailTitle, detailLabel } = useHeaderActions();

  // Filter Options
  const statusOptions = ['All', 'todo', 'progress', 'review', 'done'];
  const priorityOptions = ['All', 'low', 'medium', 'high', 'critical'];

  const getStatusLabel = (s: string) => {
    if (s === 'All' || !s) return 'All status';
    const labels: Record<string, string> = {
      todo: 'To do',
      progress: 'In progress',
      review: 'In review',
      done: 'Done'
    };
    return labels[s] || s;
  };

  const getPriorityLabel = (p: string) => {
    if (p === 'All' || !p) return 'All priority';
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

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

  const getPlaceholder = () => {
    switch (mainView) {
      case 'shots': return 'Search scenes, locations...';
      case 'inventory': return 'Search gear, specs, categories...';
      case 'postprod': return 'Search pipeline tasks...';
      case 'notes': return 'Search notes, ideas, feedback...';
      default: return 'Search...';
    }
  };

  return (
    <motion.header
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 bg-[#F2F2F7] dark:bg-[#141417] transition-colors duration-150"
      initial={{ y: 0 }}
      animate={{ y: showHeader ? 0 : -100 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
    >
      <div
        className="transition-all duration-200 ease-in-out px-4 md:px-6 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + var(--header-padding-top, 16px))',
          paddingBottom: 'var(--header-padding-bottom, 4px)'
        }}
      >
        <div className={`mx-auto w-full ${isWideMode ? 'max-w-[90%]' : 'max-w-7xl'}`}>

          {/* --- ROW 1: Title & Main Actions (Fixed Height for Stability) --- */}
          <div data-header-row="1" className="flex items-center justify-between min-h-[50px] mb-2">

            {/* Left: Title & Subtitle */}
            <div className="flex items-center gap-3">
              {/* Back button for Settings and Manage Projects */}
              {(mainView === 'settings' || mainView === 'manage-projects') && (
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
                className="w-9 h-9 rounded-[12px] bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-blue-400 dark:text-indigo-400 transition-all hover:scale-105 active:scale-95"
              >
                {darkMode ? <Moon size={18} fill="currentColor"/> : <Sun size={18} />}
              </button>

              {/* Hide settings button when on settings or manage-projects */}
              {mainView !== 'settings' && mainView !== 'manage-projects' && (
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

          {/* --- ROW 2: Dynamic Controls (Show/Hide on Scroll) --- */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                data-header-row="2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative z-[60]"
              >
                <div className="flex flex-col gap-2">

                  {/* Detail Mode Controls */}
                  {backAction || (mainView === 'shot-detail' || mainView === 'task-detail' || mainView === 'note-detail' || mainView === 'equipment-detail') ? (
                    <div className="flex flex-col w-full gap-2 pb-1">
                      <div className="h-[48px] flex items-center justify-start w-full gap-3">
                        <button
                          onClick={backAction || undefined}
                          className={`w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-white transition-all font-semibold ${backAction ? 'hover:bg-gray-100 dark:hover:bg-white/20' : 'opacity-50 cursor-default'}`}
                        >
                          <ChevronLeft size={20} className="mr-0.5"strokeWidth={2.5} />
                        </button>
                        {detailTitle ? (
                          <div className="flex flex-col justify-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
                              {detailTitle}
                            </span>
                          </div>
                        ) : (
                          // Skeleton Loading Title
                          <div className="flex flex-col justify-center gap-1.5 py-1">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse"/>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        {actions}
                      </div>
                    </div>
                  ) : (
                    <>

                      {/* Project Selector Card */}
                      {mainView === 'overview' && (
                        <div className="relative">
                          <button
                            onClick={() => setShowProjectMenu(!showProjectMenu)}
                            className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/5 p-3 rounded-2xl flex items-center justify-between group active:scale-[0.99] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-blue-500 dark:text-indigo-500">
                                <Folder size={20} fill="currentColor"className="opacity-80"/>
                              </div>
                              <div className="flex flex-col items-start">
                                <span className="text-[9px] font-semibold text-gray-500">Current production</span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  {currentProject} <ChevronDown size={14} className="text-gray-500"/>
                                </span>
                              </div>
                            </div>
                          </button>

                          <AnimatePresence>
                            {showProjectMenu && (
                              <>
                                <div className="fixed inset-0 z-20"onClick={() => setShowProjectMenu(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-3xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-30 overflow-hidden"
                                >
                                  <div className="max-h-[240px] overflow-y-auto">
                                    {Object.keys(projects).map(p => (
                                      <button
                                        key={p}
                                        onClick={() => { setCurrentProject(p); setShowProjectMenu(false); }}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl mb-1 transition-colors ${currentProject === p ? 'bg-blue-50 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                      >
                                        <span className="font-semibold">{p}</span>
                                        {currentProject === p && <Check size={16} />}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="h-px bg-gray-100 dark:bg-white/5 my-2"/>
                                  <button
                                    onClick={() => { onAddProject("New Project"); setShowProjectMenu(false); }}
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                      <Plus size={16} />
                                    </div>
                                    Create new project
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Search Bar */}
                      {mainView !== 'overview' && mainView !== 'settings' && mainView !== 'manage-projects' &&
                        mainView !== 'shot-detail' && mainView !== 'task-detail' &&
                        mainView !== 'note-detail' && mainView !== 'equipment-detail' && (
                          <div className="cf-input-wrapper h-[48px]">
                            <Search className="cf-input-icon"size={18} />
                            <input
                              type="text"
                              placeholder={getPlaceholder()}
                              value={
                                mainView === 'shots' ? shotSearchQuery :
                                  mainView === 'inventory' ? inventoryFilters.query :
                                    mainView === 'postprod' && postProdFilters ? postProdFilters.searchQuery :
                                      mainView === 'notes' && notesFilters ? notesFilters.query : ''
                              }
                              onChange={(e) => {
                                if (mainView === 'shots') setShotSearchQuery(e.target.value);
                                else if (mainView === 'inventory') setInventoryFilters({ ...inventoryFilters, query: e.target.value });
                                else if (mainView === 'postprod' && setPostProdFilters) setPostProdFilters({ searchQuery: e.target.value });
                                else if (mainView === 'notes' && setNotesFilters && notesFilters) setNotesFilters({ ...notesFilters, query: e.target.value });
                              }}
                              className="cf-input text-sm shadow-none"
                              style={{ paddingRight: (mainView === 'shots' || mainView === 'postprod') ? 48 : 16 }}
                            />
                            {(mainView === 'shots' || mainView === 'postprod') && (
                              <>
                                <button
                                  className="cf-input-action-right"
                                  onClick={() => setIsDateSelectorOpen(true)}
                                  title="Filter by date"
                                >
                                  <Calendar size={16} />
                                </button>

                                <DatePicker
                                  isOpen={isDateSelectorOpen}
                                  onClose={() => setIsDateSelectorOpen(false)}
                                  selectedDate={activeDate}
                                  onSelectDate={(newDate) => {
                                    handleDateSelect(newDate);
                                    setTimeout(() => {
                                      const element = document.getElementById(newDate);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }, 100);
                                  }}
                                />
                              </>
                            )}
                          </div>
                        )}

                      {/* Timeline Stats Widget - COMPACT REDESIGN */}
                      {mainView === 'shots' && (
                        <div className="w-full bg-white dark:bg-[#1C1C1E]/50 backdrop-blur-md rounded-[16px] px-4 flex items-center gap-4 border border-gray-200 dark:border-white/5 shadow-sm h-[48px]">
                          {/* Progress Bar Section (Flexible) */}
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-semibold text-gray-500">Progress</span>
                              <span className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">{Math.round(projectProgress)}%</span>
                            </div>
                            <div className="relative flex-1 h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-indigo-500 dark:to-purple-500"
                                style={{ width: `${projectProgress}%` }}
                              />
                            </div>
                          </div>

                          {/* Vertical Divider */}
                          <div className="w-px h-6 bg-gray-200 dark:bg-white/10"/>

                          {/* Stats Section (Compact Row) */}
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">shots</span>
                              <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">{Object.values(groupedShots).flat().length}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">done</span>
                              <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                                {(Object.values(groupedShots).flat() as Shot[]).filter(s => s.status === 'done').length}
                              </span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">remain</span>
                              <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                                {Object.values(groupedShots).flat().length - (Object.values(groupedShots).flat() as Shot[]).filter(s => s.status === 'done').length}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Filters Row */}
                      {mainView !== 'overview' && mainView !== 'settings' && mainView !== 'manage-projects' &&
                        mainView !== 'shot-detail' && mainView !== 'task-detail' &&
                        mainView !== 'note-detail' && mainView !== 'equipment-detail' && (
                          <div className="h-[48px] flex items-center w-full gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Mobile PostProd Controls (Outside ScrollFade to allow overflow) */}
                              {mainView === 'postprod' && (
                                <div className="flex md:hidden w-full gap-2 relative z-[70] mb-0.5">
                                  {/* Mobile Category Dropdown */}
                                  <div className="flex-1 relative min-w-0">
                                    <button
                                      onClick={() => {
                                        if (!showPostProdCategoryDropdown) {
                                          setShowPostProdSortDropdown(false);
                                          setShowStatusDropdown(false);
                                          setShowPriorityDropdown(false);
                                        }
                                        setShowPostProdCategoryDropdown(!showPostProdCategoryDropdown);
                                      }}
                                      className={`cf-control cf-btn-fluid ${showPostProdCategoryDropdown ? 'active' : ''}`}
                                    >
                                      <span className={`truncate ${postProdFilters?.category && postProdFilters.category !== 'All' ? 'text-[#3762E3] dark:text-[#4E47DD]' : 'text-gray-500 dark:text-gray-300'}`}>
                                        {postProdFilters?.category || 'All categories'}
                                      </span>
                                      <ChevronDown size={18} className={`shrink-0 transition-transform duration-100 ${showPostProdCategoryDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                      {showPostProdCategoryDropdown && (
                                        <>
                                          <div className="fixed inset-0 z-[60]"onClick={() => setShowPostProdCategoryDropdown(false)} />
                                          <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
                                          >
                                            {['All', 'Script', 'Editing', 'Sound', 'VFX', 'Color'].map(cat => (
                                              <button
                                                key={cat}
                                                onClick={() => {
                                                  setPostProdFilters?.({ ...postProdFilters, category: cat });
                                                  setShowPostProdCategoryDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${postProdFilters?.category === cat ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                              >
                                                {cat}
                                              </button>
                                            ))}
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  {/* Mobile Sort Dropdown */}
                                  <div className="flex-1 relative min-w-0">
                                    <button
                                      onClick={() => {
                                        if (!showPostProdSortDropdown) {
                                          setShowPostProdCategoryDropdown(false);
                                          setShowStatusDropdown(false);
                                          setShowPriorityDropdown(false);
                                        }
                                        setShowPostProdSortDropdown(!showPostProdSortDropdown);
                                      }}
                                      className={`cf-control cf-btn-fluid ${showPostProdSortDropdown ? 'active' : ''}`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <ArrowUpDown size={16} className={`shrink-0 ${postProdFilters?.sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        <span className="truncate text-gray-500 dark:text-gray-300">
                                          {postProdFilters?.sortBy === 'status' && 'Sort: Status'}
                                          {postProdFilters?.sortBy === 'priority' && 'Sort: Priority'}
                                          {postProdFilters?.sortBy === 'dueDate' && 'Sort: Due Date'}
                                          {postProdFilters?.sortBy === 'created' && 'Sort: Created'}
                                          {postProdFilters?.sortBy === 'alpha' && 'Sort: Name'}
                                        </span>
                                      </div>
                                      <ChevronDown size={18} className={`shrink-0 transition-transform duration-100 ${showPostProdSortDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                      {showPostProdSortDropdown && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-[65]"
                                            onClick={() => setShowPostProdSortDropdown(false)}
                                          />
                                          <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
                                          >
                                            <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                                              Sort By
                                            </div>
                                            {[
                                              { label: 'Status', value: 'status' },
                                              { label: 'Priority', value: 'priority' },
                                              { label: 'Due Date', value: 'dueDate' },
                                              { label: 'Created', value: 'created' },
                                              { label: 'Name', value: 'alpha' }
                                            ].map((opt) => (
                                              <button
                                                key={opt.value}
                                                onClick={() => {
                                                  if (postProdFilters?.sortBy === opt.value) {
                                                    setPostProdFilters?.({
                                                      ...postProdFilters,
                                                      sortDirection: postProdFilters.sortDirection === 'asc' ? 'desc' : 'asc'
                                                    });
                                                  } else {
                                                    setPostProdFilters?.({
                                                      ...postProdFilters,
                                                      sortBy: opt.value as any,
                                                      sortDirection: 'asc'
                                                    });
                                                  }
                                                  setShowPostProdSortDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${postProdFilters?.sortBy === opt.value
                                                  ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white'
                                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                                  }`}
                                              >
                                                <span>{opt.label}</span>
                                                {postProdFilters?.sortBy === opt.value && (
                                                  <ArrowUpDown size={14} className={postProdFilters.sortDirection === 'desc' ? 'rotate-180' : ''} />
                                                )}
                                              </button>
                                            ))}
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              )}

                              <ScrollFade className={`flex gap-2 py-0.5 w-full ${mainView === 'postprod' ? 'hidden md:flex' : ''}`} scrollKey={mainView}>
                                {mainView === 'inventory' && ['All', 'Camera', 'Lens', 'Light', 'Filter', 'Audio', 'Tripod', 'Stabilizer', 'Grip', 'Monitoring', 'Wireless', 'Drone', 'Props', 'Other'].map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setInventoryFilters({ ...inventoryFilters, category: cat })}
                                    className={`
                            cf-control cf-pill
                            ${inventoryFilters.category === cat ? 'active' : 'inactive'}
                          `}
                                  >
                                    {cat}
                                  </button>
                                ))}

                                {mainView === 'shots' && (
                                  <div className="flex gap-2 w-full">
                                    <div className="flex-1 cf-segment-container">
                                      {(['all', 'pending', 'done'] as const).map(status => (
                                        <button
                                          key={status}
                                          onClick={() => setShotStatusFilter(status)}
                                          className={`
                                  cf-segment-item
                                  ${shotStatusFilter === status ? 'active' : ''}
                                `}
                                        >
                                          {status === 'all' ? 'All' : status === 'pending' ? 'To do' : 'Done'}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="cf-segment-container">
                                      <button
                                        onClick={() => setShotLayout?.('timeline')}
                                        className={`cf-segment-item ${shotLayout === 'timeline' ? 'active' : ''}`}
                                        style={{ padding: '0 16px' }}
                                      >
                                        Timeline
                                      </button>
                                      <button
                                        onClick={() => setShotLayout?.('list')}
                                        className={`cf-segment-item ${shotLayout === 'list' ? 'active' : ''}`}
                                        style={{ padding: '0 16px' }}
                                      >
                                        List
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {mainView === 'postprod' && (
                                  <div className="flex items-center gap-4 w-full justify-between">
                                    {/* Desktop: Horizontal Tabs */}
                                    <div className="flex gap-2">
                                      {['All', 'Script', 'Editing', 'Sound', 'VFX', 'Color'].map(cat => (
                                        <button
                                          key={cat}
                                          onClick={() => setPostProdFilters?.({ ...postProdFilters, category: cat })}
                                          className={`
                                      cf-control cf-pill
                                      ${postProdFilters?.category === cat ? 'active' : 'inactive'}
                                    `}
                                        >
                                          {cat}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="hidden sm:flex items-center gap-6 shrink-0 px-2 h-10">
                                      <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Total</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                                          {tasks.length}
                                        </span>
                                      </div>
                                      <div className="w-px h-5 bg-gray-200 dark:bg-white/10"/>
                                      <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Done</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                                          {tasks.filter(t => t.status === 'done').length}
                                        </span>
                                      </div>
                                      <div className="w-px h-5 bg-gray-200 dark:bg-white/10"/>
                                      <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Remain</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                                          {tasks.filter(t => t.status !== 'done').length}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {mainView === 'notes' && ['All', 'General', 'Shots', 'Script', 'Editing', 'Sound', 'VFX', 'Color'].map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setNotesFilters?.({ ...notesFilters, category: cat })}
                                    className={`
                            cf-control cf-pill
                            ${notesFilters?.category === cat ? 'active' : 'inactive'}
                          `}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </ScrollFade>
                            </div>

                            {/* Inventory Metrics - Pinned Right */}
                            {mainView === 'inventory' && (
                              <div className="hidden sm:flex items-center gap-4 px-2 shrink-0">
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Total Gear</span>
                                  <span className="text-base font-semibold text-gray-900 dark:text-white leading-none">{inventory.length}</span>
                                </div>
                                <div className="w-px h-6 bg-gray-200 dark:bg-white/10"/>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Owned</span>
                                  <span className="text-base font-semibold text-blue-600 dark:text-blue-400 leading-none">
                                    {inventory.filter(i => i.isOwned).length}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-semibold text-gray-400 leading-none mb-0.5">Rented</span>
                                  <span className="text-base font-semibold text-orange-600 dark:text-orange-400 leading-none">
                                    {inventory.filter(i => !i.isOwned).length}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Secondary Row */}
                      {mainView !== 'overview' && mainView !== 'settings' && mainView !== 'manage-projects' && mainView !== 'shots' &&
                        mainView !== 'shot-detail' && mainView !== 'task-detail' &&
                        mainView !== 'note-detail' && mainView !== 'equipment-detail' && (
                          <div className="h-[48px] flex items-center gap-2 w-full">

                            {mainView === 'inventory' && (
                              <div className="flex w-full gap-2">
                                <div className="flex-1 cf-segment-container">
                                  {['all', 'owned', 'rented'].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => setInventoryFilters({ ...inventoryFilters, ownership: opt as any })}
                                      className={`
                                 cf-segment-item
                                 ${inventoryFilters.ownership === opt ? 'active' : ''}
                                `}
                                    >
                                      {opt === 'owned' ? 'Own' : opt === 'rented' ? 'Rent' : 'All'}
                                    </button>
                                  ))}
                                </div>

                                {/* Layout Toggle */}
                                <div className="cf-segment-container">
                                  <button
                                    onClick={() => setInventoryLayout?.('grid')}
                                    className={`cf-segment-item icon-only ${inventoryLayout === 'grid' ? 'active' : ''}`}
                                  >
                                    <LayoutGrid size={22} />
                                  </button>
                                  <button
                                    onClick={() => setInventoryLayout?.('list')}
                                    className={`cf-segment-item icon-only ${inventoryLayout === 'list' ? 'active' : ''}`}
                                  >
                                    <ListIcon size={22} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {mainView === 'postprod' && (
                              <div className="flex w-full gap-2 relative">
                                {/* Status Selector */}
                                <div className="flex-1 relative min-w-0">
                                  <button
                                    onClick={() => {
                                      if (!showStatusDropdown) {
                                        setShowPostProdCategoryDropdown(false);
                                        setShowPostProdSortDropdown(false);
                                        setShowPriorityDropdown(false);
                                      }
                                      setShowStatusDropdown(!showStatusDropdown);
                                    }}
                                    className={`cf-control cf-btn-fluid ${showStatusDropdown ? 'active' : ''}`}
                                  >
                                    <span className={`truncate ${postProdFilters?.status && postProdFilters.status !== 'All' ? 'text-[#3762E3] dark:text-[#4E47DD]' : 'text-gray-500 dark:text-gray-300'}`}>
                                      {getStatusLabel(postProdFilters?.status || '')}
                                    </span>
                                    <ChevronDown size={18} className={`shrink-0 transition-transform duration-100 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                  </button>

                                  <AnimatePresence>
                                    {showStatusDropdown && (
                                      <>
                                        <div className="fixed inset-0 z-[60]"onClick={() => setShowStatusDropdown(false)} />
                                        <motion.div
                                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                          transition={{ duration: 0.1 }}
                                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
                                        >
                                          {statusOptions.map(opt => (
                                            <button
                                              key={opt}
                                              onClick={() => {
                                                setPostProdFilters?.({ status: opt });
                                                setShowStatusDropdown(false);
                                              }}
                                              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${postProdFilters?.status === opt ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            >
                                              {getStatusLabel(opt)}
                                            </button>
                                          ))}
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* Priority Selector */}
                                <div className="flex-1 relative min-w-0">
                                  <button
                                    onClick={() => {
                                      if (!showPriorityDropdown) {
                                        setShowPostProdCategoryDropdown(false);
                                        setShowPostProdSortDropdown(false);
                                        setShowStatusDropdown(false);
                                      }
                                      setShowPriorityDropdown(!showPriorityDropdown);
                                    }}
                                    className={`cf-control cf-btn-fluid ${showPriorityDropdown ? 'active' : ''}`}
                                  >
                                    <span className={`truncate ${postProdFilters?.priority && postProdFilters.priority !== 'All' ? 'text-[#3762E3] dark:text-[#4E47DD]' : 'text-gray-500 dark:text-gray-300'}`}>
                                      {getPriorityLabel(postProdFilters?.priority || '')}
                                    </span>
                                    <ChevronDown size={18} className={`shrink-0 transition-transform duration-100 ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                                  </button>

                                  <AnimatePresence>
                                    {showPriorityDropdown && (
                                      <>
                                        <div className="fixed inset-0 z-[60]"onClick={() => setShowPriorityDropdown(false)} />
                                        <motion.div
                                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                          transition={{ duration: 0.1 }}
                                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
                                        >
                                          {priorityOptions.map(opt => (
                                            <button
                                              key={opt}
                                              onClick={() => {
                                                setPostProdFilters?.({ priority: opt });
                                                setShowPriorityDropdown(false);
                                              }}
                                              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${postProdFilters?.priority === opt ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            >
                                              {getPriorityLabel(opt)}
                                            </button>
                                          ))}
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="hidden md:block flex-1 relative min-w-0">
                                  <button
                                    onClick={() => {
                                      if (!showPostProdSortDropdown) {
                                        setShowPostProdCategoryDropdown(false);
                                        setShowStatusDropdown(false);
                                        setShowPriorityDropdown(false);
                                      }
                                      setShowPostProdSortDropdown(!showPostProdSortDropdown);
                                    }}
                                    className={`cf-control cf-btn-fluid ${showPostProdSortDropdown ? 'active' : ''}`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <ArrowUpDown size={16} className={`shrink-0 ${postProdFilters?.sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                      <span className="truncate text-gray-500 dark:text-gray-300">
                                        {postProdFilters?.sortBy === 'status' && 'Sort: Status'}
                                        {postProdFilters?.sortBy === 'priority' && 'Sort: Priority'}
                                        {postProdFilters?.sortBy === 'dueDate' && 'Sort: Due Date'}
                                        {postProdFilters?.sortBy === 'created' && 'Sort: Created'}
                                        {postProdFilters?.sortBy === 'alpha' && 'Sort: Name'}
                                      </span>
                                    </div>
                                    <ChevronDown size={18} className={`shrink-0 transition-transform duration-100 ${showPostProdSortDropdown ? 'rotate-180' : ''}`} />
                                  </button>
                                  <AnimatePresence>
                                    {showPostProdSortDropdown && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-[65]"
                                          onClick={() => setShowPostProdSortDropdown(false)}
                                        />
                                        <motion.div
                                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                          transition={{ duration: 0.1 }}
                                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-[70] overflow-hidden"
                                        >
                                          <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                                            Sort By
                                          </div>
                                          {[
                                            { label: 'Status', value: 'status' },
                                            { label: 'Priority', value: 'priority' },
                                            { label: 'Due Date', value: 'dueDate' },
                                            { label: 'Created', value: 'created' },
                                            { label: 'Name', value: 'alpha' }
                                          ].map((opt) => (
                                            <button
                                              key={opt.value}
                                              onClick={() => {
                                                if (postProdFilters?.sortBy === opt.value) {
                                                  setPostProdFilters?.({
                                                    ...postProdFilters,
                                                    sortDirection: postProdFilters.sortDirection === 'asc' ? 'desc' : 'asc'
                                                  });
                                                } else {
                                                  setPostProdFilters?.({
                                                    ...postProdFilters,
                                                    sortBy: opt.value as any,
                                                    sortDirection: 'asc'
                                                  });
                                                }
                                                setShowPostProdSortDropdown(false);
                                              }}
                                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${postProdFilters?.sortBy === opt.value
                                                ? 'bg-[#3762E3] dark:bg-[#4E47DD] text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                              <span>{opt.label}</span>
                                              {postProdFilters?.sortBy === opt.value && (
                                                <ArrowUpDown size={14} className={postProdFilters.sortDirection === 'desc' ? 'rotate-180' : ''} />
                                              )}
                                            </button>
                                          ))}
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>
                                <div className="cf-segment-container shrink-0">
                                  <button onClick={() => setPostProdLayout?.('grid')} className={`cf-segment-item icon-only ${postProdLayout === 'grid' ? 'active' : ''}`}><LayoutGrid size={22} /></button>
                                  <button onClick={() => setPostProdLayout?.('list')} className={`cf-segment-item icon-only ${postProdLayout === 'list' ? 'active' : ''}`}><ListIcon size={22} /></button>
                                </div>
                              </div>
                            )}

                            {mainView === 'notes' && (
                              <div className="flex w-full gap-2">
                                <button className="cf-control cf-btn-fluid cf-btn-primary cf-btn-center">
                                  <ArrowUpDown size={18} /> Last Modified
                                </button>
                                <div className="cf-segment-container">
                                  <button onClick={() => setNotesLayout?.('grid')} className={`cf-segment-item icon-only ${notesLayout === 'grid' ? 'active' : ''}`}><LayoutGrid size={22} /></button>
                                  <button onClick={() => setNotesLayout?.('list')} className={`cf-segment-item icon-only ${notesLayout === 'list' ? 'active' : ''}`}><ListIcon size={22} /></button>
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-[#F2F2F7] to-transparent dark:from-[#141417] pointer-events-none"/>
    </motion.header>
  );
});

Header.displayName = 'Header';
