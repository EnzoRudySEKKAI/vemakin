import './index.css';
import './header_v2.css';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { InventoryFilters, Currency, InventoryLayout, PostProdFilters, Shot, MainView } from './types.ts';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/layout/PageTransition.tsx';
import { CURRENCIES, SHOOT_DATES } from './constants.ts';
import { ShotsView } from './components/shots/ShotsView.tsx';
import { InventoryView } from './components/inventory/InventoryView.tsx';
import { NotesView } from './components/notes/NotesView.tsx';
import { PostProdView } from './components/postprod/PostProdView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { ProjectsManagerView } from './components/projects/ProjectsManagerView.tsx';
import { OverviewView } from './components/dashboard/OverviewView.tsx';
import { Header } from './components/layout/Header.tsx';
import { Navigation } from './components/layout/Navigation.tsx';
import { HeaderActionsProvider } from './context/HeaderActionsContext';
import { ShotDetailView } from './components/shots/ShotDetailView.tsx';
import { EquipmentDetailView } from './components/inventory/EquipmentDetailView.tsx';
import { TaskDetailView } from './components/postprod/TaskDetailView.tsx';
import { NoteDetailView } from './components/notes/NoteDetailView.tsx';
import { ActionSuite } from './components/layout/ActionSuite.tsx';
import { LandingView } from './components/auth/LandingView.tsx';
import { SignInView } from './components/auth/SignInView.tsx';
import { SignUpView } from './components/auth/SignUpView.tsx';
import { OnboardingView } from './components/auth/OnboardingView.tsx';
import { NewsModal } from './components/modals/NewsModal.tsx';
import { TutorialModal } from './components/modals/TutorialModal.tsx';
import { useProductionStore } from './hooks/useProductionStore.ts';

const CineFlowApp = () => {
  const {
    mainView, setMainView,
    shotLayout, setShotLayout,
    shotStatusFilter, setShotStatusFilter,
    projects, setProjects,
    currentProject, setCurrentProject,
    allInventory, setAllInventory,
    currentUser,
    isGuest,
    login,
    enterGuest,
    logout,
    projectData,
    activeData,
    updateActiveProjectData,
    groupedShots,
    dynamicDates,
    projectProgress,
    toggleShotStatus,
    toggleEquipmentStatus,
    addProject,
    deleteProject,
    renameProject,
    addShot,
    addTask,
    addGear,
    addNote,
    // PostProd State
    postProdFilters,
    setPostProdFilters,
    // Notes State
    notesFilters,
    setNotesFilters,
    notesLayout,
    setNotesLayout,
    darkMode,
    toggleDarkMode,
    exportProject,
    importProject
  } = useProductionStore();

  const [authView, setAuthView] = useState<'landing' | 'signin' | 'signup'>('landing');
  const [showOnboarding, setShowOnboarding] = useState(false); // Default to false for dev stability
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [activeDate, setActiveDate] = useState(dynamicDates[0]);
  const [postProdLayout, setPostProdLayout] = useState<'grid' | 'list'>('grid');
  const [inventoryLayout, setInventoryLayout] = useState<InventoryLayout>('grid');

  // Selection States for Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Header & View States
  const [showControls, setShowControls] = useState(true);
  const [isWideMode, setIsWideMode] = useState(false);
  const lastScrollY = useRef(0);

  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [shotSearchQuery, setShotSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>({
    category: 'All', ownership: 'all', query: ''
  });
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  // Navigation History State
  const [previousView, setPreviousView] = useState<MainView | null>(null);

  // Action Suite State
  const [isActionSuiteOpen, setIsActionSuiteOpen] = useState(false);
  const [actionSuiteConfig, setActionSuiteConfig] = useState<{ view: string, link?: { type: 'shot' | 'task', id: string } } | null>(null);

  // Derived Selections
  const selectedShot = activeData.shots.find(s => s.id === selectedShotId);
  const selectedEquipment = allInventory.find(e => e.id === selectedEquipmentId);
  const selectedTask = activeData.tasks.find(t => t.id === selectedTaskId);
  const selectedNote = activeData.notes.find(n => n.id === selectedNoteId);

  const involvedProjects = selectedEquipmentId
    ? Object.keys(projectData).filter(pName =>
      projectData[pName].shots.some(s => s.equipmentIds.includes(selectedEquipmentId))
    )
    : [];

  // Reset scroll on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mainView]);

  // Scroll Handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Force controls visible on desktop (>= 1024px)
      if (window.innerWidth >= 1024) {
        setShowControls(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Optimization: Use requestAnimationFrame to debounce visually
      requestAnimationFrame(() => {
        // Increased threshold to 20px to avoid jitter/accidental push effect
        if (Math.abs(currentScrollY - lastScrollY.current) < 20) return;

        if (currentScrollY <= 50) {
          setShowControls(true);
        } else if (currentScrollY > lastScrollY.current) {
          // Scrolling down -> Hide controls
          setShowControls(false);
        } else {
          // Scrolling up -> Show controls
          setShowControls(true);
        }
        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic Header Height with Ratchet to prevent layout shift ("push") on mobile
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerMeasuredRef = useRef(false);

  // Immediate measurement before paint to prevent layout jump on first render
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
      headerMeasuredRef.current = true;
    }
  }, []);

  // Ongoing resize observation with ratchet logic
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    let isMounting = true;
    let rafId: number;

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const currentHeight = header.offsetHeight;
        setHeaderHeight(prev => {
          if (isMounting) {
            isMounting = false;
            return currentHeight;
          }
          return Math.max(prev, currentHeight);
        });
      });
    });

    observer.observe(header);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [mainView]);

  // ============================================================
  // LAYOUT CONFIGURATION - Easy to maintain padding values
  // ============================================================
  const LAYOUT_CONFIG = {
    // Mobile: Tight spacing (screen width < 768px)
    mobile: {
      headerOffset: -40, // Negative value pulls content closer to header
      fallbackPadding: 100 // Fallback before header is measured
    },
    // Desktop: Comfortable spacing (screen width >= 768px) 
    desktop: {
      headerOffset: 8,  // Positive value adds breathing room
      fallbackPadding: 160
    },
    // View-specific adjustments (added to base offset)
    viewOverrides: {
      shots: -8,  // Timeline page needs extra tight spacing
      'shot-detail': 0,
      overview: 0,
      inventory: 0,
      'equipment-detail': 0,
      postprod: 0,
      'task-detail': 0,
      notes: 0,
      'note-detail': 0,
      settings: 0,
      'manage-projects': 0
    }
  };

  // Detect mobile vs desktop for responsive padding
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate content padding based on device type and current view
  const getContentPaddingTop = useMemo(() => {
    const config = isMobile ? LAYOUT_CONFIG.mobile : LAYOUT_CONFIG.desktop;
    const viewOffset = LAYOUT_CONFIG.viewOverrides[mainView as keyof typeof LAYOUT_CONFIG.viewOverrides] || 0;

    if (headerHeight > 0) {
      const calculated = headerHeight + config.headerOffset + viewOffset;
      // Ensure we never dip below the fallback padding (prevents content jumping up behind header during animation)
      return `${Math.max(calculated, config.fallbackPadding)}px`;
    }
    return `calc(${config.fallbackPadding}px + env(safe-area-inset-top))`;
  }, [headerHeight, isMobile, mainView]);

  // Sync Dark Mode to HTML/Body for global context (Modals, Scrollbars)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigateToShot = useCallback((projectName: string, shotId: string) => {
    setCurrentProject(projectName);
    setSelectedShotId(shotId);
    setSelectedEquipmentId(null);
    const targetShot = projectData[projectName]?.shots.find(s => s.id === shotId);
    if (targetShot) setActiveDate(targetShot.date);
    setIsDrawerOpen(true);
    setMainView('shot-detail');
  }, [projectData]);

  const handleNavigateToInventory = useCallback(() => {
    setMainView('inventory');
  }, []);

  const viewTitles = useMemo(() => ({
    overview: "Good morning",
    shots: "Timeline",
    'shot-detail': "Shot Detail",
    inventory: "Inventory",
    'equipment-detail': "Equipment Detail",
    notes: "Notes",
    'note-detail': "Note Detail",
    postprod: "Pipeline",
    'task-detail': "Task Detail",
    settings: "Settings",
    'manage-projects': "Manage Projects"
  }), []);

  const handleOpenActionSuite = useCallback((config?: typeof actionSuiteConfig) => {
    setActionSuiteConfig(config || null);
    setIsActionSuiteOpen(true);
  }, []);

  const handleMainAddClick = useCallback(() => {
    let view = 'shot'; // Default fallback
    if (mainView === 'shots' || mainView === 'shot-detail') view = 'shot';
    else if (mainView === 'inventory' || mainView === 'equipment-detail') view = 'gear';
    else if (mainView === 'postprod' || mainView === 'task-detail') view = 'task';
    else if (mainView === 'notes' || mainView === 'note-detail') view = 'note';
    else if (mainView === 'settings' || mainView === 'manage-projects') view = 'project';

    handleOpenActionSuite({ view });
  }, [mainView, handleOpenActionSuite]);

  const handleCloseActionSuite = useCallback(() => {
    setIsActionSuiteOpen(false);
    // Reset config after closing animation
    setTimeout(() => setActionSuiteConfig(null), 300);
  }, []);

  // Memoized Handlers for Header Optimization
  const handleSetPostProdFilters = useCallback((filters: Partial<PostProdFilters>) => {
    setPostProdFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const handleAddPostProdTask = useCallback(() => {
    handleOpenActionSuite({ view: 'task' });
  }, [handleOpenActionSuite]);

  const handleToggleWideMode = useCallback(() => {
    setIsWideMode(prev => !prev);
  }, []);

  const handleAddProject = useCallback((n: string) => {
    addProject(n, {});
  }, [addProject]);

  // Stable Handlers for Views to prevent re-renders on scroll
  const handleShotClick = useCallback((s: Shot) => {
    setSelectedShotId(s.id);
    setMainView('shot-detail');
    setIsDrawerOpen(true);
  }, []);

  const handleAddShot = useCallback(() => {
    handleOpenActionSuite({ view: 'shot' });
  }, [handleOpenActionSuite]);

  const handleEquipmentClick = useCallback((id: string) => {
    setSelectedEquipmentId(id);
    setMainView('equipment-detail');
  }, []);

  const handleAddEquipment = useCallback(() => {
    handleOpenActionSuite({ view: 'gear' });
  }, [handleOpenActionSuite]);

  const handleNavigateToView = useCallback((view: MainView) => {
    setMainView(view);
    setIsDrawerOpen(false);
    setSelectedShotId(null);
    setSelectedEquipmentId(null);
    setSelectedTaskId(null);
    setSelectedNoteId(null);
    // Reset specific states
    setShotSearchQuery('');
    setInventoryFilters({ category: 'All', ownership: 'all', query: '' });
  }, [setMainView]);

  const displayedDates = useMemo(() => dateFilter ? [dateFilter] : dynamicDates, [dateFilter, dynamicDates]);
  const activePostProdTasks = useMemo(() => dateFilter ? activeData.tasks.filter(t => t.dueDate === dateFilter) : activeData.tasks, [dateFilter, activeData.tasks]);

  // Stable Close Handlers
  // Stable Close Handlers
  const handleCloseShot = useCallback(() => {
    if (previousView) {
      setMainView(previousView);
      setPreviousView(null);
    } else {
      setMainView('shots');
    }
    setSelectedShotId(null);
  }, [previousView]);
  const handleCloseEquipment = useCallback(() => {
    if (previousView) {
      setMainView(previousView);
      setPreviousView(null);
    } else {
      setMainView('inventory');
    }
    setSelectedEquipmentId(null);
  }, [previousView]);
  const handleCloseTask = useCallback(() => {
    if (previousView) {
      setMainView(previousView);
      setPreviousView(null);
    } else {
      setMainView('postprod');
    }
    setSelectedTaskId(null);
  }, [previousView]);
  const handleCloseNote = useCallback(() => {
    if (previousView) {
      setMainView(previousView);
      setPreviousView(null);
    } else {
      setMainView('notes');
    }
    setSelectedNoteId(null);
  }, [previousView]);

  const renderMainContent = () => {
    switch (mainView) {
      case 'overview':
        return (
          <OverviewView
            shots={activeData.shots}
            tasks={activeData.tasks}
            notes={activeData.notes}
            inventory={allInventory}
            currency={currency}
            user={currentUser}
            projects={projects}
            currentProject={currentProject}
            onSelectProject={setCurrentProject}
            onAddProject={(name) => addProject(name, {})}
            onAddClick={() => handleOpenActionSuite({ view: 'shot' })}
            onNavigateToShot={(s) => {
              setSelectedShotId(s.id);
              setActiveDate(s.date);
              setPreviousView('overview');
              setMainView('shot-detail');
            }}
            onNavigateToShotsView={() => setMainView('shots')}
            onNavigateToInventory={handleNavigateToInventory}
            onNavigateToPostProd={() => setMainView('postprod')}
            onNavigateToNotes={() => setMainView('notes')}
            onNavigateToSettings={() => setMainView('settings')}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setPreviousView('overview');
              setMainView('task-detail');
            }}
            onSelectNote={(id) => {
              setSelectedNoteId(id);
              setPreviousView('overview');
              setMainView('note-detail');
            }}
          />
        );

      case 'shot-detail':
        if (!selectedShotId) return null;
        return (
          <ShotDetailView
            selectedShot={activeData.shots.find(s => s.id === selectedShotId)!}
            allShots={activeData.shots}
            notes={activeData.notes}
            onClose={handleCloseShot}
            onToggleStatus={toggleShotStatus}
            onToggleEquipment={toggleEquipmentStatus}
            onUpdateShot={(updatedShot) => updateActiveProjectData({ shots: activeData.shots.map(s => s.id === updatedShot.id ? updatedShot : s) })}
            onDeleteShot={(id) => {
              updateActiveProjectData({ shots: activeData.shots.filter(s => s.id !== id) });
              setSelectedShotId(null);
            }}
            onRetakeShot={(id, newDate, newTime) => {
              const original = activeData.shots.find(s => s.id === id);
              if (original) {
                addShot({
                  ...original,
                  id: crypto.randomUUID(),
                  date: newDate,
                  startTime: newTime,
                  status: 'todo'
                });
              }
            }}
            onAddNote={(note) => addNote({ ...note, shotId: selectedShotId!, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any)}
            onOpenNote={(id) => { setSelectedNoteId(id); setMainView('note-detail'); }}
            inventory={allInventory}
            currency={currency}
          />
        );

      case 'shots':
        return (
          <ShotsView
            groupedShots={groupedShots}
            dates={displayedDates}
            shotLayout={shotLayout}
            searchQuery={shotSearchQuery}
            statusFilter={shotStatusFilter}
            onShotClick={handleShotClick}
            onToggleStatus={toggleShotStatus}
            onToggleEquipment={toggleEquipmentStatus}
            onAddShot={handleAddShot}
            onDateInView={setActiveDate}
            inventory={allInventory}
          />
        );

      case 'equipment-detail':
        if (!selectedEquipmentId) return null;
        return (
          <EquipmentDetailView
            item={allInventory.find(e => e.id === selectedEquipmentId)!}
            onClose={handleCloseEquipment}
            projectData={projectData}
            involvedProjects={Array.from(new Set(activeData.shots
              .filter(s => s.equipmentIds && s.equipmentIds.includes(selectedEquipmentId))
              .map(s => currentProject)
            ))}
            onNavigateToShot={(projectName, shotId) => {
              handleNavigateToShot(projectName, shotId);
            }}
            currency={currency}
            onUpdate={(updatedItem) => updateActiveProjectData({ inventory: allInventory.map(i => i.id === updatedItem.id ? updatedItem : i) })}
            onDelete={(id) => {
              setSelectedEquipmentId(null);
            }}
          />
        );

      case 'inventory':
        return (
          <InventoryView
            inventory={allInventory}
            shots={activeData.shots}
            onEquipmentClick={handleEquipmentClick}
            filters={inventoryFilters}
            currency={currency}
            layout={inventoryLayout}
            onAddEquipment={handleAddEquipment}
          />
        );

      case 'note-detail':
        if (!selectedNoteId) return null;
        return (
          <NoteDetailView
            note={activeData.notes.find(n => n.id === selectedNoteId)!}
            shots={activeData.shots}
            tasks={activeData.tasks}
            onClose={handleCloseNote}
            onUpdateNote={(updatedNote) => updateActiveProjectData({ notes: activeData.notes.map(n => n.id === updatedNote.id ? updatedNote : n) })}
            onDeleteNote={(id) => {
              updateActiveProjectData({ notes: activeData.notes.filter(n => n.id !== id) });
              setSelectedNoteId(null);
            }}
            onNavigateToShot={(shotId) => handleNavigateToShot(currentProject, shotId)}
            onNavigateToTask={(taskId) => { setSelectedTaskId(taskId); setMainView('task-detail'); }}
          />
        );

      case 'notes':
        return (
          <NotesView
            shots={activeData.shots}
            notes={activeData.notes}
            tasks={activeData.tasks}
            isAdding={false}
            setIsAdding={() => handleOpenActionSuite({ view: 'note' })}
            onAddNote={(n) => { }}
            onUpdateNote={(n) => updateActiveProjectData({ notes: activeData.notes.map(x => x.id === n.id ? n : x) })}
            onDeleteNote={(id) => updateActiveProjectData({ notes: activeData.notes.filter(x => x.id !== id) })}
            onSelectShot={(id) => {
              handleNavigateToShot(currentProject, id);
            }}
            onSelectNote={(id) => { setSelectedNoteId(id); setMainView('note-detail'); }}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setMainView('task-detail');
            }}
            filters={notesFilters}
            layout={notesLayout}
          />
        );

      case 'task-detail':
        if (!selectedTaskId) return null;
        return (
          <TaskDetailView
            task={activeData.tasks.find(t => t.id === selectedTaskId)!}
            notes={activeData.notes}
            onClose={handleCloseTask}
            onUpdateTask={(updatedTask) => updateActiveProjectData({ tasks: activeData.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) })}
            onDeleteTask={(id) => {
              updateActiveProjectData({ tasks: activeData.tasks.filter(t => t.id !== id) });
              setSelectedTaskId(null);
            }}
            onAddNote={() => handleOpenActionSuite({ view: 'note', link: { type: 'task', id: selectedTaskId! } })}
            onOpenNote={(id) => { setSelectedNoteId(id); setMainView('note-detail'); }}
          />
        );

      case 'postprod':
        return (
          <PostProdView
            tasks={activePostProdTasks}
            onAddTask={handleAddPostProdTask}
            onUpdateTask={(updatedTask) => updateActiveProjectData({ tasks: activeData.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) })}
            onSelectTask={(id) => { setSelectedTaskId(id); setMainView('task-detail'); }}
            filters={postProdFilters}
            layout={postProdLayout}
          />
        );

      case 'settings':
        return <SettingsView />;

      case 'manage-projects':
        return (
          <ProjectsManagerView
            projects={projects}
            activeProject={currentProject}
            onSelectProject={setCurrentProject}
            onAddProject={handleAddProject}
            onDeleteProject={deleteProject}
            onExportProject={exportProject}
            onImportProject={importProject}
          />
        );

      default:
        return null;
    }
  };
  if (!currentUser && !isGuest) {
    if (showOnboarding) {
      return <OnboardingView onComplete={() => setShowOnboarding(false)} />;
    }
    if (authView === 'signin') {
      return <SignInView onBack={() => setAuthView('landing')} onSignIn={login} />;
    }
    if (authView === 'signup') {
      return <SignUpView onBack={() => setAuthView('landing')} onSignUp={login} />;
    }
    return (
      <LandingView
        onSignIn={() => setAuthView('signin')}
        onSignUp={() => setAuthView('signup')}
        onGuest={enterGuest}
      />
    );
  }



  return (
    <HeaderActionsProvider>
      <div className={`min-h-screen bg-[#F2F2F7] dark:bg-[#141417] text-[#1C1C1E] selection:bg-blue-100 dark:text-white transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
        <Header
          showHeader={true}
          showControls={showControls}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          projects={projects}
          onAddProject={handleAddProject}
          viewTitle={viewTitles[mainView as keyof typeof viewTitles] || "CineFlow"}
          mainView={mainView}
          setMainView={handleNavigateToView}
          projectProgress={projectProgress}
          activeDate={activeDate}
          shotLayout={shotLayout}
          setShotLayout={setShotLayout}
          isDateSelectorOpen={isDateSelectorOpen}
          setIsDateSelectorOpen={setIsDateSelectorOpen}
          handleDateSelect={(d) => {
            setDateFilter(d);
            if (d) setActiveDate(d);
          }}
          inventoryFilters={inventoryFilters}
          setInventoryFilters={setInventoryFilters}
          dates={dynamicDates}
          groupedShots={groupedShots}
          currency={currency}
          setCurrency={setCurrency}
          // Shots Props
          shotSearchQuery={shotSearchQuery}
          setShotSearchQuery={setShotSearchQuery}
          shotStatusFilter={shotStatusFilter}
          setShotStatusFilter={setShotStatusFilter}
          // PostProd Props
          postProdFilters={postProdFilters}
          setPostProdFilters={handleSetPostProdFilters}
          onAddPostProdTask={handleAddPostProdTask}
          postProdLayout={postProdLayout}
          setPostProdLayout={setPostProdLayout}
          // Inventory Layout Props
          inventoryLayout={inventoryLayout}
          setInventoryLayout={setInventoryLayout}
          // Notes Props
          notesFilters={notesFilters}
          setNotesFilters={setNotesFilters}
          notesLayout={notesLayout}
          setNotesLayout={setNotesLayout}
          // Wide Mode Props
          isWideMode={isWideMode}
          onToggleWideMode={handleToggleWideMode}
          // Dark Mode Props
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          // Add Button Handler
          onAdd={handleMainAddClick}
          inventory={allInventory}
          tasks={activePostProdTasks}
        />

        {/* Navigation - Always visible */}
        <Navigation mainView={mainView} setMainView={handleNavigateToView} onPlusClick={handleMainAddClick} />

        {/* Responsive top padding - Uses LAYOUT_CONFIG for mobile/desktop values */}
        <div
          className="p-4 md:p-6 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)]"
          style={{ paddingTop: getContentPaddingTop }}
        >
          <main className={`mx-auto w-full pb-28 transition-all duration-500 ease-in-out ${isWideMode ? 'max-w-[90%]' : 'max-w-6xl'}`}>
            <AnimatePresence mode="wait">
              <PageTransition key={mainView}>
                {renderMainContent()}
              </PageTransition>
            </AnimatePresence>
          </main>
        </div>

        {
          isActionSuiteOpen && (
            <ActionSuite
              onClose={handleCloseActionSuite}
              onCommitProject={(name, start, end, loc, desc) => addProject(name, {})}
              onCommitShot={(shot) => addShot(shot)}
              onCommitGear={(gear) => addGear(gear)}
              onCommitTask={(task) => addTask(task)}
              onCommitNote={(title, content, linkedId, linkType, attachments) => addNote({
                id: `note-${Date.now()}`,
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                shotId: linkType === 'shot' ? linkedId : undefined,
                taskId: linkType === 'task' ? linkedId : undefined,
                attachments: attachments || []
              })}
              inventory={allInventory}
              currentProject={currentProject}
              existingShots={activeData.shots}
              existingTasks={activeData.tasks}
              initialView={actionSuiteConfig?.view as any}
              initialLink={actionSuiteConfig?.link}
            />
          )
        }

        {/* Onboarding View (Welcome Slideshow) */}
        {
          showOnboarding && currentUser && (
            <div className="fixed inset-0 z-[2000] bg-white">
              <OnboardingView onComplete={() => setShowOnboarding(false)} />
            </div>
          )
        }

        {/* Tutorial/Help Center Modal */}
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

        {/* News Modal */}
        {showNews && <NewsModal onClose={() => setShowNews(false)} />}

      </div>
    </HeaderActionsProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<CineFlowApp />);
}
