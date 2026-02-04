import './index.css';
import './header_v2.css';
import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { InventoryFilters, Currency, InventoryLayout, PostProdFilters, Shot, MainView } from './types.ts';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/layout/PageTransition.tsx';
import { CURRENCIES } from './constants.ts';
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
import { GearFormPage } from './components/inventory/GearFormPage.tsx';
import { ShotFormPage } from './components/shots/ShotFormPage.tsx';
import { TaskFormPage } from './components/postprod/TaskFormPage.tsx';
import { NoteFormPage } from './components/notes/NoteFormPage.tsx';
import { LandingView } from './components/auth/LandingView.tsx';
import { SignInView } from './components/auth/SignInView.tsx';
import { SignUpView } from './components/auth/SignUpView.tsx';
import { OnboardingView } from './components/auth/OnboardingView.tsx';
import { NewsModal } from './components/modals/NewsModal.tsx';
import { TutorialModal } from './components/modals/TutorialModal.tsx';
import { NoProjectsView } from './components/projects/NoProjectsView.tsx';
import { useProductionStore } from './hooks/useProductionStore.ts';
import { LayoutProvider, useLayout } from './context/LayoutContext.tsx';
import { useSyncLayout } from './hooks/useSyncLayout.ts';
import { useDrawerScroll } from './hooks/useDrawerScroll.ts';

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
    isLoadingAuth,
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
    updateShot,
    deleteShot,
    addTask,
    updateTask,
    deleteTask,
    addGear,
    updateGear,
    deleteGear,
    addNote,
    updateNote,
    deleteNote,
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
  const [isWideMode, setIsWideMode] = useState(false);

  // Get header ref from LayoutContext for sync system
  const { headerRef } = useLayout();

  // Detect if we're on a detail page or form page (no drawer effect, no navigation)
  const isDetailPage = mainView.includes('-detail');

  // Pages where bottom navigation should be hidden
  const hideNavigationViews = [
    'shot-detail', 'equipment-detail', 'note-detail', 'task-detail',
    'new-shot', 'new-gear', 'new-task', 'new-note',
    'settings', 'manage-projects'
  ];
  const shouldHideNavigation = hideNavigationViews.includes(mainView);

  // Drawer scroll effect - Header filters slide up, Nav slides down
  const { translateY: headerTranslateY } = useDrawerScroll({
    maxTranslateY: 250, // Increased to fully hide filters
    mobileOnly: true
  });

  // Disable drawer effect on detail pages
  const effectiveHeaderTranslateY = isDetailPage ? 0 : headerTranslateY;

  const { translateY: navTranslateY, scrollProgress: navScrollProgress, isAnimating: navIsAnimating } = useDrawerScroll({
    maxTranslateY: 100,
    mobileOnly: true,
    direction: 'down', // Menu slides down when scrolling
    snapToEnds: true // Snap to fully visible or fully hidden
  });

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

  // Sync Layout System - Calculates content padding based on header measurements
  const { style: layoutStyle, isReady: isLayoutReady } = useSyncLayout({
    viewType: mainView,
    filterTranslateY: effectiveHeaderTranslateY,
  });

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
    'manage-projects': "Manage Projects",
    'new-shot': "New Scene",
    'new-gear': "New Equipment",
    'new-task': "New Task",
    'new-note': "New Note"
  }), []);

  const handleOpenActionSuite = useCallback((config?: typeof actionSuiteConfig) => {
    setActionSuiteConfig(config || null);
    setIsActionSuiteOpen(true);
  }, []);

  const handleMainAddClick = useCallback(() => {
    // Navigate to full-page forms based on current view context
    // Project creation remains a special case using ActionSuite modal
    if (mainView === 'settings' || mainView === 'manage-projects') {
      handleOpenActionSuite({ view: 'project' });
    } else if (mainView === 'inventory' || mainView === 'equipment-detail') {
      setMainView('new-gear');
    } else if (mainView === 'postprod' || mainView === 'task-detail') {
      setMainView('new-task');
    } else if (mainView === 'notes' || mainView === 'note-detail') {
      setMainView('new-note');
    } else {
      // Default to shot form for overview, shots, or any other view
      setMainView('new-shot');
    }
  }, [mainView, handleOpenActionSuite, setMainView]);

  const handleCloseActionSuite = useCallback(() => {
    setIsActionSuiteOpen(false);
    // Reset config after closing animation
    setTimeout(() => setActionSuiteConfig(null), 300);
  }, []);

  // Handle switching between form types (for form tabs)
  const handleSwitchForm = useCallback((formType: 'gear' | 'shot' | 'task' | 'note') => {
    setMainView(`new-${formType}` as MainView);
  }, [setMainView]);

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
            onUpdateShot={updateShot}
            onDeleteShot={(id) => {
              deleteShot(id);
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
            onUpdate={updateGear}
            onDelete={(id) => {
              deleteGear(id);
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
            onUpdateNote={updateNote}
            onDeleteNote={(id) => {
              deleteNote(id);
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
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
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
            onUpdateTask={updateTask}
            onDeleteTask={(id) => {
              deleteTask(id);
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
            onUpdateTask={updateTask}
            onSelectTask={(id) => { setSelectedTaskId(id); setMainView('task-detail'); }}
            filters={postProdFilters}
            layout={postProdLayout}
          />
        );

      case 'settings':
        return (
          <SettingsView
            user={currentUser}
            onLogin={() => setAuthView('landing')}
            onLogout={logout}
            onNavigateToProjects={() => setMainView('manage-projects')}
            onOpenNews={() => setShowNews(true)}
            onOpenTutorial={() => setShowTutorial(true)}
          />
        );

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

      case 'new-shot':
        return (
          <ShotFormPage
            onClose={() => setMainView('shots')}
            onSwitchForm={handleSwitchForm}
            onSubmit={addShot}
            inventory={allInventory}
            existingShots={activeData.shots}
          />
        );

      case 'new-gear':
        return (
          <GearFormPage
            onClose={() => setMainView('inventory')}
            onSwitchForm={handleSwitchForm}
            onSubmit={addGear}
          />
        );

      case 'new-task':
        return (
          <TaskFormPage
            onClose={() => setMainView('postprod')}
            onSwitchForm={handleSwitchForm}
            onSubmit={addTask}
          />
        );

      case 'new-note':
        return (
          <NoteFormPage
            onClose={() => setMainView('notes')}
            onSwitchForm={handleSwitchForm}
            onSubmit={(title, content, linkedId, linkType, attachments) => addNote({
              id: `note-${Date.now()}`,
              title,
              content,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              shotId: linkType === 'shot' ? linkedId : undefined,
              taskId: linkType === 'task' ? linkedId : undefined,
              attachments: attachments || []
            })}
            existingShots={activeData.shots}
            existingTasks={activeData.tasks}
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

  // Authenticated state but loading data?
  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#141417] flex items-center justify-center text-[#1C1C1E] dark:text-white">Loading...</div>;
  }

  // Authenticated but no projects? Show NoProjectsView
  if (currentUser && !isGuest && projects.length === 0) {
    return <NoProjectsView onCreateProject={(name) => addProject(name, {})} onLogout={logout} />;
  }

  return (
    <HeaderActionsProvider>
      <div className={`min-h-screen bg-[#F2F2F7] dark:bg-[#141417] text-[#1C1C1E] selection:bg-blue-100 dark:text-white transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
        <Header
          ref={headerRef}
          filterTranslateY={effectiveHeaderTranslateY}
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

        {/* Navigation - Hidden on form and detail pages */}
        {!shouldHideNavigation && (
          <Navigation mainView={mainView} setMainView={handleNavigateToView} onPlusClick={handleMainAddClick} scale={1 - navScrollProgress} isAnimating={navIsAnimating} />
        )}



        {/* Sync Layout System - Content wrapper with dynamic padding */}
        <div
          className={`content-wrapper px-4 md:px-6 pb-0 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)] view-${mainView}`}
          style={mainView === 'settings' || mainView === 'manage-projects' ? { paddingTop: 0 } : layoutStyle}
        >
          <main className={`mx-auto w-full transition-all duration-500 ease-in-out ${isWideMode ? 'max-w-[90%]' : 'max-w-6xl'}`} style={{ paddingBottom: shouldHideNavigation ? '24px' : '120px' }}>
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

// Wrap app with LayoutProvider for sync layout system
const AppWithProviders = () => (
  <LayoutProvider>
    <CineFlowApp />
  </LayoutProvider>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AppWithProviders />);
}
