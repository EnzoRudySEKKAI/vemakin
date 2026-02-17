import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  InventoryFilters, 
  Currency, 
  InventoryLayout, 
  PostProdFilters, 
  MainView, 
  NotesFilters,
  Shot,
  PostProdTask,
  Note,
  Equipment
} from '@/types'
import { CURRENCIES } from '@/constants'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { ActionSuite } from '@/components/layout/ActionSuite'
import { HeaderActionsProvider } from '@/context/HeaderActionsContext'
import { NewsModal } from '@/components/modals/NewsModal'
import { TutorialModal } from '@/components/modals/TutorialModal'
import { OnboardingView } from '@/components/auth/OnboardingView'
import { LandingView } from '@/components/auth/LandingView'
import { SignInView } from '@/components/auth/SignInView'
import { SignUpView } from '@/components/auth/SignUpView'
import { NoProjectsView } from '@/components/projects/NoProjectsView'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { LayoutProvider, useLayout } from '@/context/LayoutContext'
import { useSyncLayout } from '@/hooks/useSyncLayout'
import { useDrawerScroll } from '@/hooks/useDrawerScroll'
import { useActiveData, useGroupedShots, useDynamicDates, useProjectProgress } from '@/hooks/useSelectors'
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useAllShots,
  useAllNotes,
  useAllTasks,
  useInventory,
  useCreateShot,
  useUpdateShot,
  useDeleteShot,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment
} from '@/hooks/useApi'
import { getViewFromPath, ROUTE_PATHS } from '@/router'

const RouteLoading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const PageTransition = ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    {...props}
  >
    {children}
  </motion.div>
)

const RootLayoutInner = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const mainView = getViewFromPath(location.pathname) as MainView

  // Auth Store
  const { 
    currentUser, 
    isGuest, 
    isLoadingAuth, 
    login, 
    enterGuest, 
    logout,
    initAuth 
  } = useAuthStore()

  // UI Store
  const {
    shotLayout,
    setShotLayout,
    shotStatusFilter,
    setShotStatusFilter,
    postProdFilters,
    setPostProdFilters,
    notesFilters,
    setNotesFilters,
    notesLayout,
    setNotesLayout,
    darkMode,
    toggleDarkMode,
    showCreateProjectPrompt,
    setShowCreateProjectPrompt
  } = useUIStore()

  // Project Store
  const { 
    currentProjectId, 
    currentProjectName, 
    setCurrentProject,
    toggleEquipmentPrepared 
  } = useProjectStore()

  // React Query - Data
  const projectsQuery = useProjects()
  const shotsQuery = useAllShots(currentProjectId || '')
  const notesQuery = useAllNotes(currentProjectId || '')
  const tasksQuery = useAllTasks(currentProjectId || '')
  const inventoryQuery = useInventory()

  // React Query - Mutations
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()
  const createShotMutation = useCreateShot(currentProjectId || '')
  const updateShotMutation = useUpdateShot(currentProjectId || '')
  const deleteShotMutation = useDeleteShot(currentProjectId || '')
  const createNoteMutation = useCreateNote(currentProjectId || '')
  const updateNoteMutation = useUpdateNote(currentProjectId || '')
  const deleteNoteMutation = useDeleteNote(currentProjectId || '')
  const createTaskMutation = useCreateTask(currentProjectId || '')
  const updateTaskMutation = useUpdateTask(currentProjectId || '')
  const deleteTaskMutation = useDeleteTask(currentProjectId || '')
  const createEquipmentMutation = useCreateEquipment()
  const updateEquipmentMutation = useUpdateEquipment()
  const deleteEquipmentMutation = useDeleteEquipment()

  // Derived data
  const projects = useMemo(() => 
    projectsQuery.data?.map(p => p.name) || []
  , [projectsQuery.data])

  const projectData = useMemo(() => 
    projectsQuery.data || []
  , [projectsQuery.data])

  const activeData = useActiveData(
    shotsQuery.data || [],
    notesQuery.data || [],
    tasksQuery.data || []
  )

  const groupedShots = useGroupedShots(activeData.shots)
  const dynamicDates = useDynamicDates(activeData.shots)
  const projectProgress = useProjectProgress(activeData.shots)
  const allInventory = inventoryQuery.data || []

  // Local state
  const [authView, setAuthView] = useState<'landing' | 'signin' | 'signup'>('landing')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showNews, setShowNews] = useState(false)
  const [activeDate, setActiveDate] = useState(dynamicDates[0] || '')
  const [postProdLayout, setPostProdLayout] = useState<'grid' | 'list'>('grid')
  const [inventoryLayout, setInventoryLayout] = useState<InventoryLayout>('grid')
  const [isWideMode, setIsWideMode] = useState(false)
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [shotSearchQuery, setShotSearchQuery] = useState('')
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>({
    category: 'All', ownership: 'all', query: ''
  })
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0])
  const [isActionSuiteOpen, setIsActionSuiteOpen] = useState(false)
  const [actionSuiteConfig, setActionSuiteConfig] = useState<{ view: string; link?: { type: 'shot' | 'task'; id: string } } | null>(null)

  const { headerRef } = useLayout()
  const hasInitialLoadCompleted = useRef(false)

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth()
    return () => unsubscribe()
  }, [initAuth])

  // Track initial load
  useEffect(() => {
    const isLoading = isLoadingAuth || projectsQuery.isLoading
    if (!isLoading) {
      hasInitialLoadCompleted.current = true
    }
  }, [isLoadingAuth, projectsQuery.isLoading])

  // Sync dark mode
  useEffect(() => {
    if (!hasInitialLoadCompleted.current) return
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Set initial project
  useEffect(() => {
    if (projectsQuery.data && projectsQuery.data.length > 0 && !currentProjectId) {
      const firstProject = projectsQuery.data[0]
      setCurrentProject(firstProject.id, firstProject.name)
    }
  }, [projectsQuery.data, currentProjectId, setCurrentProject])

  // Update active date when dynamic dates change
  useEffect(() => {
    if (dynamicDates.length > 0 && !activeDate) {
      setActiveDate(dynamicDates[0])
    }
  }, [dynamicDates, activeDate])

  // Reset scroll on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Drawer scroll effects
  const isDetailPage = mainView.includes('-detail')
  const hideNavigationViews = ['settings', 'manage-projects']
  const shouldHideNavigation = hideNavigationViews.includes(mainView)

  const { translateY: headerTranslateY } = useDrawerScroll({
    maxTranslateY: 250,
    mobileOnly: true
  })
  const effectiveHeaderTranslateY = isDetailPage ? 0 : headerTranslateY

  const { translateY: navTranslateY, scrollProgress: navScrollProgress, isAnimating: navIsAnimating } = useDrawerScroll({
    maxTranslateY: 100,
    mobileOnly: true,
    direction: 'down',
    snapToEnds: true
  })

  const { style: layoutStyle } = useSyncLayout({
    viewType: mainView,
    filterTranslateY: effectiveHeaderTranslateY,
  })

  // Navigation
  const handleNavigateToView = useCallback((view: MainView) => {
    const path = ROUTE_PATHS[view as keyof typeof ROUTE_PATHS] || '/'
    navigate(path)
  }, [navigate])

  // View titles
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
  }), [])

  // Action handlers
  const handleOpenActionSuite = useCallback((config?: typeof actionSuiteConfig) => {
    setActionSuiteConfig(config || null)
    setIsActionSuiteOpen(true)
  }, [])

  const handleCloseActionSuite = useCallback(() => {
    setIsActionSuiteOpen(false)
    setTimeout(() => setActionSuiteConfig(null), 300)
  }, [])

  const handleMainAddClick = useCallback(() => {
    if (mainView === 'settings' || mainView === 'manage-projects') {
      handleOpenActionSuite({ view: 'project' })
    } else if (mainView === 'inventory' || mainView === 'equipment-detail') {
      navigate('/dashboard/inventory/new')
    } else if (mainView === 'postprod' || mainView === 'task-detail') {
      navigate('/dashboard/pipeline/new')
    } else if (mainView === 'notes' || mainView === 'note-detail') {
      navigate('/dashboard/notes/new')
    } else {
      navigate('/dashboard/shots/new')
    }
  }, [mainView, handleOpenActionSuite, navigate])

  const handleSetPostProdFilters = useCallback((filters: Partial<PostProdFilters>) => {
    setPostProdFilters(prev => ({ ...prev, ...filters }))
  }, [setPostProdFilters])

  const handleSetNotesFilters = useCallback((filters: Partial<NotesFilters>) => {
    setNotesFilters(prev => ({ ...prev, ...filters }))
  }, [setNotesFilters])

  const handleToggleNotesSort = useCallback(() => {
    setNotesFilters(prev => {
      const sorts: NotesFilters['sortBy'][] = ['updated', 'created', 'alpha']
      const currentIndex = sorts.indexOf(prev.sortBy || 'updated')
      const nextIndex = (currentIndex + 1) % sorts.length
      const nextSort = sorts[nextIndex]
      const nextDir = nextSort === 'alpha' ? 'asc' : 'desc'

      return {
        ...prev,
        sortBy: nextSort,
        sortDirection: nextDir
      }
    })
  }, [setNotesFilters])

  // CRUD handlers
  const handleAddProject = useCallback(async (name: string) => {
    await createProjectMutation.mutateAsync(name)
  }, [createProjectMutation])

  const handleAddShot = useCallback(async (shot: unknown) => {
    await createShotMutation.mutateAsync(shot)
  }, [createShotMutation])

  const handleAddTask = useCallback(async (task: unknown) => {
    await createTaskMutation.mutateAsync(task)
  }, [createTaskMutation])

  const handleAddGear = useCallback(async (gear: unknown) => {
    await createEquipmentMutation.mutateAsync(gear)
  }, [createEquipmentMutation])

  const handleUpdateGear = useCallback(async (gear: Equipment) => {
    await updateEquipmentMutation.mutateAsync({ id: gear.id, data: gear })
  }, [updateEquipmentMutation])

  const handleDeleteGear = useCallback(async (id: string) => {
    await deleteEquipmentMutation.mutateAsync(id)
  }, [deleteEquipmentMutation])

  const handleAddNote = useCallback(async (note: unknown) => {
    await createNoteMutation.mutateAsync(note)
  }, [createNoteMutation])

  const handleDeleteProject = useCallback(async (name: string) => {
    const project = projectsQuery.data?.find(p => p.name === name)
    if (project) {
      await deleteProjectMutation.mutateAsync(project.id)
    }
  }, [deleteProjectMutation, projectsQuery.data])

  const handleUpdateShot = useCallback(async (shot: Shot) => {
    await updateShotMutation.mutateAsync({ id: shot.id, data: shot })
  }, [updateShotMutation])

  const handleDeleteShot = useCallback(async (id: string) => {
    await deleteShotMutation.mutateAsync(id)
  }, [deleteShotMutation])

  const handleUpdateTask = useCallback(async (task: PostProdTask) => {
    await updateTaskMutation.mutateAsync({ id: task.id, data: task })
  }, [updateTaskMutation])

  const handleDeleteTask = useCallback(async (id: string) => {
    await deleteTaskMutation.mutateAsync(id)
  }, [deleteTaskMutation])

  const handleUpdateNote = useCallback(async (note: Note) => {
    await updateNoteMutation.mutateAsync({ id: note.id, data: note })
  }, [updateNoteMutation])

  const handleDeleteNote = useCallback(async (id: string) => {
    await deleteNoteMutation.mutateAsync(id)
  }, [deleteNoteMutation])

  const handleToggleShotStatus = useCallback((id: string) => {
    const shot = activeData.shots.find(s => s.id === id)
    if (shot) {
      const newStatus = shot.status === 'completed' ? 'pending' : 'completed'
      updateShotMutation.mutateAsync({ id, data: { status: newStatus } })
    }
  }, [activeData.shots, updateShotMutation])

  // Data display
  const displayedDates = useMemo(() => 
    dateFilter ? [dateFilter] : dynamicDates
  , [dateFilter, dynamicDates])

  const activePostProdTasks = useMemo(() => 
    dateFilter ? activeData.tasks.filter((t: { dueDate: string }) => t.dueDate === dateFilter) : activeData.tasks
  , [dateFilter, activeData.tasks])

  // Auth screens
  if (!currentUser && !isGuest) {
    if (showOnboarding) {
      return <OnboardingView onComplete={() => setShowOnboarding(false)} />
    }
    if (authView === 'signin') {
      return <SignInView onBack={() => setAuthView('landing')} onSignIn={login} />
    }
    if (authView === 'signup') {
      return <SignUpView onBack={() => setAuthView('landing')} onSignUp={login} />
    }
    return (
      <LandingView
        onSignIn={() => setAuthView('signin')}
        onSignUp={() => setAuthView('signup')}
        onGuest={enterGuest}
      />
    )
  }

  const isLoading = isLoadingAuth || projectsQuery.isLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex flex-col items-center justify-center gap-4 text-gray-900 dark:text-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-white/40">Loading your projects...</span>
      </div>
    )
  }

  if (showCreateProjectPrompt && !isLoading) {
    return (
      <NoProjectsView 
        onCreateProject={(name) => {
          handleAddProject(name)
          setShowCreateProjectPrompt(false)
        }} 
        onLogout={logout}
      />
    )
  }

  return (
    <HeaderActionsProvider>
      <div className={`min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] text-[#16181D] selection:bg-blue-100 dark:text-white transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
        <Header
          ref={headerRef}
          filterTranslateY={effectiveHeaderTranslateY}
          currentProject={currentProjectName || ''}
          setCurrentProject={(name) => {
            const project = projectsQuery.data?.find(p => p.name === name)
            if (project) {
              setCurrentProject(project.id, project.name)
            }
          }}
          projects={projects}
          onAddProject={handleAddProject}
          viewTitle={viewTitles[mainView as keyof typeof viewTitles] || "Vemakin"}
          mainView={mainView}
          setMainView={handleNavigateToView}
          projectProgress={projectProgress}
          activeDate={activeDate}
          shotLayout={shotLayout}
          setShotLayout={setShotLayout}
          isDateSelectorOpen={isDateSelectorOpen}
          setIsDateSelectorOpen={setIsDateSelectorOpen}
          handleDateSelect={(d) => {
            setDateFilter(d)
            if (d) setActiveDate(d)
          }}
          inventoryFilters={inventoryFilters}
          setInventoryFilters={setInventoryFilters}
          dates={dynamicDates}
          groupedShots={groupedShots}
          currency={currency}
          setCurrency={setCurrency}
          shotSearchQuery={shotSearchQuery}
          setShotSearchQuery={setShotSearchQuery}
          shotStatusFilter={shotStatusFilter}
          setShotStatusFilter={setShotStatusFilter}
          postProdFilters={postProdFilters}
          setPostProdFilters={handleSetPostProdFilters}
          onAddPostProdTask={() => handleOpenActionSuite({ view: 'task' })}
          postProdLayout={postProdLayout}
          setPostProdLayout={setPostProdLayout}
          inventoryLayout={inventoryLayout}
          setInventoryLayout={setInventoryLayout}
          notesFilters={notesFilters}
          setNotesFilters={handleSetNotesFilters}
          onSortNotes={handleToggleNotesSort}
          notesLayout={notesLayout}
          setNotesLayout={setNotesLayout}
          isWideMode={isWideMode}
          onToggleWideMode={() => setIsWideMode(prev => !prev)}
          onAdd={handleMainAddClick}
          inventory={allInventory}
          tasks={activePostProdTasks}
        />

        {!shouldHideNavigation && (
          <Navigation
            mainView={mainView}
            setMainView={handleNavigateToView}
            onPlusClick={handleMainAddClick}
            scale={1 - navScrollProgress}
            isAnimating={navIsAnimating}
          />
        )}

        <div
          className={`content-wrapper px-4 md:px-6 pb-0 ${shouldHideNavigation ? '' : 'lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(240px+1.5rem)]'} view-${mainView}`}
          style={mainView === 'settings' || mainView === 'manage-projects' ? { paddingTop: 0 } : layoutStyle}
        >
          <main className={`mx-auto w-full transition-all duration-500 ease-in-out ${isWideMode ? 'max-w-[90%]' : 'max-w-6xl'}`} style={{ paddingBottom: shouldHideNavigation ? '24px' : '120px' }}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Suspense fallback={<RouteLoading />}>
                  <Outlet context={{
                    activeData,
                    allInventory,
                    currentProject: currentProjectName || '',
                    setCurrentProject,
                    currency,
                    projectData,
                    dynamicDates,
                    displayedDates,
                    activeDate,
                    setActiveDate,
                    shotLayout,
                    shotSearchQuery,
                    shotStatusFilter,
                    groupedShots,
                    toggleShotStatus: handleToggleShotStatus,
                    toggleEquipmentStatus: toggleEquipmentPrepared,
                    addShot: handleAddShot,
                    updateShot: handleUpdateShot,
                    deleteShot: handleDeleteShot,
                    addTask: handleAddTask,
                    updateTask: handleUpdateTask,
                    deleteTask: handleDeleteTask,
                    addGear: handleAddGear,
                    updateGear: handleUpdateGear,
                    deleteGear: handleDeleteGear,
                    addNote: handleAddNote,
                    updateNote: handleUpdateNote,
                    deleteNote: handleDeleteNote,
                    inventoryFilters,
                    inventoryLayout,
                    postProdFilters,
                    postProdLayout,
                    notesFilters,
                    notesLayout,
                    activePostProdTasks,
                    projects,
                    addProject: handleAddProject,
                    deleteProject: handleDeleteProject,
                    currentUser,
                    logout,
                    darkMode,
                    toggleDarkMode,
                    handleOpenActionSuite,
                    navigate,
                    showNews: () => setShowNews(true),
                    showTutorial: () => setShowTutorial(true),
                  }} />
                </Suspense>
              </PageTransition>
            </AnimatePresence>
          </main>
        </div>

        {isActionSuiteOpen && (
          <ActionSuite
            onClose={handleCloseActionSuite}
            onCommitProject={handleAddProject}
            onCommitShot={handleAddShot}
            onCommitGear={handleAddGear}
            onCommitTask={handleAddTask}
            onCommitNote={(title, content, linkedId, linkType, attachments) => handleAddNote({
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
            currentProject={currentProjectName || ''}
            existingShots={activeData.shots}
            existingTasks={activeData.tasks}
            initialView={actionSuiteConfig?.view as never}
            initialLink={actionSuiteConfig?.link}
          />
        )}

        {showOnboarding && currentUser && (
          <div className="fixed inset-0 z-[2000] bg-[#F2F2F7] dark:bg-[#0F1116]">
            <OnboardingView onComplete={() => setShowOnboarding(false)} />
          </div>
        )}

        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
        {showNews && <NewsModal onClose={() => setShowNews(false)} />}
      </div>
    </HeaderActionsProvider>
  )
}

export const RootLayout = () => (
  <LayoutProvider>
    <RootLayoutInner />
  </LayoutProvider>
)
