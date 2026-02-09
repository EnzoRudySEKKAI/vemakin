import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { InventoryFilters, Currency, InventoryLayout, PostProdFilters, MainView } from '@/types'
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
import { useProductionStore } from '@/hooks/useProductionStore'
import { LayoutProvider, useLayout } from '@/context/LayoutContext'
import { useSyncLayout } from '@/hooks/useSyncLayout'
import { useDrawerScroll } from '@/hooks/useDrawerScroll'
import { getViewFromPath, ROUTE_PATHS } from '@/router'

// Loading fallback for lazy-loaded routes
const RouteLoading = () => (
    <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
)

// Page transition wrapper for route changes
const PageTransition = ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
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

// Inner layout component that uses layout context
const RootLayoutInner = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    // Get current view from URL path
    const mainView = getViewFromPath(location.pathname) as MainView

    const store = useProductionStore()
    const {
        shotLayout, setShotLayout,
        shotStatusFilter, setShotStatusFilter,
        projects,
        currentProject, setCurrentProject,
        allInventory,
        currentUser,
        isGuest,
        isLoadingAuth,
        login,
        enterGuest,
        logout,
        projectData,
        activeData,
        groupedShots,
        dynamicDates,
        projectProgress,
        toggleShotStatus,
        toggleEquipmentStatus,
        addProject,
        deleteProject,
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
        postProdFilters,
        setPostProdFilters,
        notesFilters,
        setNotesFilters,
        notesLayout,
        setNotesLayout,
        darkMode,
        toggleDarkMode,
        exportProject,
        importProject,
        initAuth
    } = store

    // Initialize Auth
    useEffect(() => {
        const unsubscribe = initAuth()
        return () => unsubscribe()
    }, [initAuth])

    const [authView, setAuthView] = useState<'landing' | 'signin' | 'signup'>('landing')
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [showTutorial, setShowTutorial] = useState(false)
    const [showNews, setShowNews] = useState(false)
    const [activeDate, setActiveDate] = useState(dynamicDates[0])
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
    const [actionSuiteConfig, setActionSuiteConfig] = useState<{ view: string, link?: { type: 'shot' | 'task', id: string } } | null>(null)

    const { headerRef } = useLayout()

    // Detect if we're on a detail page or form page
    const isDetailPage = mainView.includes('-detail')
    const hideNavigationViews = [
        'shot-detail', 'equipment-detail', 'note-detail', 'task-detail',
        'new-shot', 'new-gear', 'new-task', 'new-note',
        'settings', 'manage-projects'
    ]
    const shouldHideNavigation = hideNavigationViews.includes(mainView)

    // Drawer scroll effect
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

    // Reset scroll on route change
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    // Sync Layout System
    const { style: layoutStyle } = useSyncLayout({
        viewType: mainView,
        filterTranslateY: effectiveHeaderTranslateY,
    })

    // Sync Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    // Navigation helper using router
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

    const handleOpenActionSuite = useCallback((config?: typeof actionSuiteConfig) => {
        setActionSuiteConfig(config || null)
        setIsActionSuiteOpen(true)
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

    const handleCloseActionSuite = useCallback(() => {
        setIsActionSuiteOpen(false)
        setTimeout(() => setActionSuiteConfig(null), 300)
    }, [])

    const handleSetPostProdFilters = useCallback((filters: Partial<PostProdFilters>) => {
        setPostProdFilters(prev => ({ ...prev, ...filters }))
    }, [setPostProdFilters])

    const handleAddPostProdTask = useCallback(() => {
        handleOpenActionSuite({ view: 'task' })
    }, [handleOpenActionSuite])

    const handleAddProject = useCallback((n: string) => {
        addProject(n, {})
    }, [addProject])

    const displayedDates = useMemo(() => dateFilter ? [dateFilter] : dynamicDates, [dateFilter, dynamicDates])
    const activePostProdTasks = useMemo(() => dateFilter ? activeData.tasks.filter(t => t.dueDate === dateFilter) : activeData.tasks, [dateFilter, activeData.tasks])

    // Auth screens (outside router)
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

    if (isLoadingAuth) {
        return <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#141417] flex items-center justify-center text-[#1C1C1E] dark:text-white">Loading...</div>
    }

    if (currentUser && !isGuest && projects.length === 0) {
        return <NoProjectsView onCreateProject={(name) => addProject(name, {})} onLogout={logout} />
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
                    onAddPostProdTask={handleAddPostProdTask}
                    postProdLayout={postProdLayout}
                    setPostProdLayout={setPostProdLayout}
                    inventoryLayout={inventoryLayout}
                    setInventoryLayout={setInventoryLayout}
                    notesFilters={notesFilters}
                    setNotesFilters={setNotesFilters}
                    notesLayout={notesLayout}
                    setNotesLayout={setNotesLayout}
                    isWideMode={isWideMode}
                    onToggleWideMode={() => setIsWideMode(prev => !prev)}
                    darkMode={darkMode}
                    onToggleDarkMode={toggleDarkMode}
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
                    className={`content-wrapper px-4 md:px-6 pb-0 lg:pl-[calc(88px+1.5rem)] xl:pl-[calc(275px+1.5rem)] view-${mainView}`}
                    style={mainView === 'settings' || mainView === 'manage-projects' ? { paddingTop: 0 } : layoutStyle}
                >
                    <main className={`mx-auto w-full transition-all duration-500 ease-in-out ${isWideMode ? 'max-w-[90%]' : 'max-w-6xl'}`} style={{ paddingBottom: shouldHideNavigation ? '24px' : '120px' }}>
                        <AnimatePresence mode="wait">
                            <PageTransition key={location.pathname}>
                                <Suspense fallback={<RouteLoading />}>
                                    <Outlet context={{
                                        // Pass shared state to route components
                                        activeData,
                                        allInventory,
                                        currentProject,
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
                                        toggleShotStatus,
                                        toggleEquipmentStatus,
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
                                        inventoryFilters,
                                        inventoryLayout,
                                        postProdFilters,
                                        postProdLayout,
                                        notesFilters,
                                        notesLayout,
                                        activePostProdTasks,
                                        projects,
                                        addProject,
                                        deleteProject,
                                        exportProject,
                                        importProject,
                                        currentUser,
                                        logout,
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
                        onCommitProject={(name) => addProject(name, {})}
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
                )}

                {showOnboarding && currentUser && (
                    <div className="fixed inset-0 z-[2000] bg-white">
                        <OnboardingView onComplete={() => setShowOnboarding(false)} />
                    </div>
                )}

                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
                {showNews && <NewsModal onClose={() => setShowNews(false)} />}
            </div>
        </HeaderActionsProvider>
    )
}

// Wrap with LayoutProvider
export const RootLayout = () => (
    <LayoutProvider>
        <RootLayoutInner />
    </LayoutProvider>
)
