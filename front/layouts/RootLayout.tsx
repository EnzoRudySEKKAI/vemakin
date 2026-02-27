import React, { useState, useEffect, useCallback, useMemo, Suspense, useRef, startTransition } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
import { TutorialModal } from '@/components/modals/TutorialModal'
import { NoProjectsView } from '@/components/projects/NoProjectsView'
import { OnboardingPage } from '@/components/onboarding'
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
  useDeleteEquipment,
  useUpdateUserProfile
} from '@/hooks/useApi'
import { getViewFromPath, ROUTE_PATHS } from '@/router'
import { FullPageLoader } from '@/components/ui/FullPageLoader'

const RouteLoading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Optimized page transition using CSS instead of Framer Motion for better INP
// CSS transitions run on the compositor thread and don't block the main thread
const PageTransition = ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
  <div
    className="page-transition-enter"
    {...props}
  >
    {children}
  </div>
)

const RootLayoutInner = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const mainView = getViewFromPath(location.pathname) as MainView

  // Auth Store
  const { 
    currentUser, 
    isLoadingAuth, 
    logout
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
    setShowCreateProjectPrompt,
    postProdGridColumns,
    notesGridColumns,
    inventoryGridColumns
  } = useUIStore()

  // Project Store
  const { 
    currentProjectId, 
    currentProjectName, 
    setCurrentProject
  } = useProjectStore()

  // React Query - Data
  const projectsQuery = useProjects()
  
  // Defer non-critical data fetching to improve LCP
  // These don't need to load immediately for the header to render
  const [shouldLoadProjectData, setShouldLoadProjectData] = useState(false)
  
  useEffect(() => {
    // Small delay to prioritize initial render
    const timer = setTimeout(() => {
      setShouldLoadProjectData(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  const shotsQuery = useAllShots(currentProjectId || '', { 
    enabled: shouldLoadProjectData && !!currentProjectId 
  })
  const notesQuery = useAllNotes(currentProjectId || '', { 
    enabled: shouldLoadProjectData && !!currentProjectId 
  })
  const tasksQuery = useAllTasks(currentProjectId || '', { 
    enabled: shouldLoadProjectData && !!currentProjectId 
  })
  const inventoryQuery = useInventory({ 
    enabled: shouldLoadProjectData 
  })

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
  const updateUserProfileMutation = useUpdateUserProfile()

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

  // Calculate sidebar stats
  const sidebarStats = useMemo(() => {
    const shots = shotsQuery.data || []
    const inventory = inventoryQuery.data || []
    const tasks = tasksQuery.data || []
    const notes = notesQuery.data || []

    // Calculate tasks by category
    const tasksByCategory: Record<string, number> = {}
    tasks.forEach(task => {
      tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1
    })

    // Calculate inventory by category
    const inventoryByCategory: Record<string, number> = {}
    inventory.forEach(item => {
      inventoryByCategory[item.category] = (inventoryByCategory[item.category] || 0) + 1
    })

    // Calculate notes by category (General, Shots, Script, Editing, Sound, VFX, Color)
    const notesByCategory: Record<string, number> = {
      General: 0,
      Shots: 0,
      Script: 0,
      Editing: 0,
      Sound: 0,
      VFX: 0,
      Color: 0,
    }
    notes.forEach(note => {
      if (note.shotId) {
        notesByCategory.Shots++
      } else if (note.taskId) {
        const task = tasks.find(t => t.id === note.taskId)
        if (task && task.category) {
          notesByCategory[task.category]++
        }
      } else {
        notesByCategory.General++
      }
    })

    return {
      shotsCount: shots.length,
      completedShotsCount: shots.filter(s => s.status === 'done').length,
      inventoryCount: inventory.length,
      rentedCount: inventory.filter(i => !i.isOwned).length,
      ownedCount: inventory.filter(i => i.isOwned).length,
      tasksCount: tasks.length,
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        progress: tasks.filter(t => t.status === 'progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
      },
      notesCount: notes.length,
      tasksByCategory,
      inventoryByCategory,
      notesByCategory,
    }
  }, [shotsQuery.data, inventoryQuery.data, tasksQuery.data, notesQuery.data])

  // Helper to set project by name (looks up the ID)
  const setCurrentProjectByName = useCallback((name: string) => {
    const project = projectsQuery.data?.find(p => p.name === name)
    if (project) {
      setCurrentProject(project.id, project.name)
    }
  }, [projectsQuery.data, setCurrentProject])

  // Local state
  const [showTutorial, setShowTutorial] = useState(false)
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

  // Track initial load
  useEffect(() => {
  const isLoading = isLoadingAuth || projectsQuery.isLoading || currentUser?.firstConnection === undefined
    if (!isLoading) {
      hasInitialLoadCompleted.current = true
    }
  }, [isLoadingAuth, projectsQuery.isLoading])

  // Sync dark mode with user profile on initial load
  useEffect(() => {
    if (currentUser?.darkMode !== undefined && !hasInitialLoadCompleted.current) {
      // Sync UI store with user profile on initial load
      useUIStore.getState().setDarkMode(currentUser.darkMode)
    }
  }, [currentUser])

  // Apply dark mode to document
  useEffect(() => {
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
  const hideNavigationViews = ['settings', 'manage-projects', 'new-project']
  const isFormView = mainView === 'new-shot' || mainView === 'new-gear' || mainView === 'new-task' || mainView === 'new-note' || mainView === 'new-project'
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

  // Navigation with startTransition for non-blocking updates
  // This improves INP by marking navigation as non-urgent
  const handleNavigateToView = useCallback((view: MainView) => {
    const path = ROUTE_PATHS[view as keyof typeof ROUTE_PATHS] || '/'
    startTransition(() => {
      navigate(path)
    })
  }, [navigate])

  // View titles
  const viewTitles = useMemo(() => ({
    overview: "Hub",
    shots: "Timeline",
    'shot-detail': "Shot detail",
    inventory: "Inventory",
    'equipment-detail': "Equipment detail",
    notes: "Notes",
    'note-detail': "Note detail",
    postprod: "Pipeline",
    'task-detail': "Task detail",
    settings: "Settings",
    'manage-projects': "Manage projects",
    'new-shot': "New scene",
    'new-gear': "New equipment",
    'new-task': "New task",
    'new-note': "New note",
    'new-project': "New project"
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

  const hasProjects = projectsQuery.data && projectsQuery.data.length > 0

  const handleMainAddClick = useCallback(() => {
    if (mainView === 'settings' || mainView === 'manage-projects') {
      handleOpenActionSuite({ view: 'project' })
    } else if (mainView === 'inventory' || mainView === 'equipment-detail') {
      navigate('/dashboard/inventory/new')
    } else if (!hasProjects) {
      navigate('/dashboard/projects/new')
    } else if (mainView === 'postprod' || mainView === 'task-detail') {
      navigate('/dashboard/pipeline/new')
    } else if (mainView === 'notes' || mainView === 'note-detail') {
      navigate('/dashboard/notes/new')
    } else {
      navigate('/dashboard/shots/new')
    }
  }, [mainView, hasProjects, handleOpenActionSuite, navigate])

  const handleSetPostProdFilters = useCallback((filters: Partial<PostProdFilters>) => {
    setPostProdFilters(prev => ({ ...prev, ...filters }))
  }, [setPostProdFilters])

  const handleSetNotesFilters = useCallback((filters: Partial<NotesFilters>) => {
    setNotesFilters(prev => ({ ...prev, ...filters }))
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
      const newStatus = shot.status === 'done' ? 'pending' : 'done'
      updateShotMutation.mutateAsync({ id, data: { status: newStatus } })
    }
  }, [activeData.shots, updateShotMutation])

  // Handle gear toggle with proper state management
  const handleToggleEquipmentPrepared = useCallback(async (shotId: string, equipmentId: string) => {
    const shot = activeData.shots.find(s => s.id === shotId)
    if (!shot) return
    
    const currentIds = shot.preparedEquipmentIds || []
    const isPrepared = currentIds.includes(equipmentId)
    const newPreparedIds = isPrepared
      ? currentIds.filter(id => id !== equipmentId)
      : [...currentIds, equipmentId]
    
    await updateShotMutation.mutateAsync({ 
      id: shotId, 
      data: { preparedEquipmentIds: newPreparedIds } 
    })
  }, [activeData.shots, updateShotMutation])

  // Data display
  const displayedDates = useMemo(() => 
    dateFilter ? [dateFilter] : dynamicDates
  , [dateFilter, dynamicDates])

  const activePostProdTasks = useMemo(() => 
    dateFilter ? activeData.tasks.filter((t: { dueDate: string }) => t.dueDate === dateFilter) : activeData.tasks
  , [dateFilter, activeData.tasks])

  const isLoading = isLoadingAuth || projectsQuery.isLoading || currentUser?.firstConnection === undefined

  if (isLoading) {
    return <FullPageLoader />
  }

  // Redirect to email verification if not verified
  if (!currentUser?.emailVerified) {
    navigate('/auth/verify-email', { replace: true })
    return <FullPageLoader />
  }

  // Show onboarding for first-time users (firstConnection === true)
  if (currentUser?.firstConnection === true && !isLoading) {
    return (
      <OnboardingPage
        onContinueWithoutProject={async () => {
          // Update first_connection to false in database and local state
          await updateUserProfileMutation.mutateAsync({ firstConnection: false })
          useAuthStore.getState().updateFirstConnection(false)
          navigate('/dashboard/inventory')
        }}
        onCreateProject={() => {
          // Navigate to project creation form
          // first_connection will be updated after project creation
          navigate('/dashboard/projects/new', { state: { isFirstProject: true } })
        }}
      />
    )
  }

  // Show NoProjectsView for users who have completed onboarding but have no projects
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
      <div className={`min-h-[100dvh] min-h-[100svh] h-full w-full bg-[#F2F2F7] dark:bg-[#0F1116] text-[#16181D] selection:bg-blue-100 dark:text-white transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
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
          onNavigateToCreateProject={() => navigate('/dashboard/projects/new')}
          viewTitle={viewTitles[mainView as keyof typeof viewTitles] || "Vemakin"}
          mainView={mainView}
          setMainView={handleNavigateToView}
          projectProgress={projectProgress}
          activeDate={activeDate}
          dateFilter={dateFilter}
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
            hasProjects={hasProjects}
            stats={sidebarStats}
          />
        )}

        <div
          className={`content-wrapper ${shouldHideNavigation ? '' : 'lg:pl-[calc(88px+1.5rem)] 2xl:pl-[calc(280px+1.5rem)]'} view-${mainView}`}
          style={mainView === 'settings' || mainView === 'manage-projects' ? { paddingTop: 0 } : layoutStyle}
        >
          <main className="flex-1 flex flex-col mx-auto w-full transition-all duration-500 ease-in-out max-w-[90%]" style={{ paddingBottom: shouldHideNavigation ? '80px' : '140px' }}>
            {/* Remove AnimatePresence mode="wait" to prevent blocking navigation
                The key prop ensures React reconciles properly without waiting for exit animations */}
            <PageTransition key={location.pathname}>
              <Suspense fallback={<RouteLoading />}>
                <Outlet context={{
                    activeData,
                    allInventory,
                    currentProject: currentProjectName || '',
                    setCurrentProject: setCurrentProjectByName,
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
                    toggleEquipmentStatus: handleToggleEquipmentPrepared,
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
                    postProdGridColumns,
                    notesGridColumns,
                    inventoryGridColumns,
                    activePostProdTasks,
                    projects,
                    hasProjects,
                    addProject: handleAddProject,
                    deleteProject: handleDeleteProject,
                    currentUser,
                    logout,
                    darkMode,
                    toggleDarkMode,
                    handleOpenActionSuite,
                    navigate,
                    showTutorial: () => setShowTutorial(true),
                    isLoading: {
                      shots: shotsQuery.isLoading,
                      tasks: tasksQuery.isLoading,
                      notes: notesQuery.isLoading,
                      inventory: inventoryQuery.isLoading,
                      projects: projectsQuery.isLoading,
                    },
                  }} />
                </Suspense>
            </PageTransition>
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

        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </div>
    </HeaderActionsProvider>
  )
}

export const RootLayout = () => (
  <LayoutProvider>
    <RootLayoutInner />
  </LayoutProvider>
)
