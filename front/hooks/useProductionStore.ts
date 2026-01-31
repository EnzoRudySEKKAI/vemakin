
import { useState, useMemo, useCallback, useEffect } from 'react';
import { MainView, Shot, ShotLayout, Equipment, Note, PostProdTask, CrewMember, PostProdFilters, NotesFilters, User, CatalogCategory, CatalogBrand, CatalogItem } from '../types.ts';
import { PROJECTS, SHOOT_DATES } from '../constants.ts';
import { timeToMinutes } from '../utils.ts';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import api from '../api/client';

export interface ProjectState {
  id?: string; // Backend ID (UUID)
  shots: Shot[];
  notes: Note[];
  tasks: PostProdTask[];
  crew: CrewMember[];
}

export const useProductionStore = () => {
  const [mainView, setMainView] = useState<MainView>('overview');
  const [shotLayout, setShotLayout] = useState<ShotLayout>('timeline');
  const [shotStatusFilter, setShotStatusFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [projects, setProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState('');
  const [allInventory, setAllInventory] = useState<Equipment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Catalog State
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [catalogBrands, setCatalogBrands] = useState<CatalogBrand[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
        setIsGuest(false);

        // Fetch Data from Backend
        try {
          // Fetch Projects
          const projectsRes = await api.get('/projects');
          const fetchedProjects = projectsRes.data;

          if (fetchedProjects.length > 0) {
            const projectNames = fetchedProjects.map((p: any) => p.name);
            setProjects(projectNames);

            setProjectData(prev => {
              const newData = { ...prev };
              fetchedProjects.forEach((p: any) => {
                if (newData[p.name]) {
                  newData[p.name] = { ...newData[p.name], id: p.id };
                } else {
                  newData[p.name] = {
                    id: p.id,
                    shots: [],
                    notes: [],
                    tasks: [],
                    crew: []
                  };
                }
              });
              return newData;
            });

            // Fetch Inventory (Global)
            try {
              const invRes = await api.get('/inventory');
              const fetchedInv: Equipment[] = invRes.data.map((i: any) => ({
                id: i.id,
                name: i.name,
                catalogItemId: i.catalogItemId,
                customName: i.customName,
                serialNumber: i.serialNumber,
                category: i.category,
                pricePerDay: i.pricePerDay,
                rentalPrice: i.rentalPrice,
                rentalFrequency: i.rentalFrequency,
                quantity: i.quantity,
                isOwned: i.isOwned,
                status: i.status,
                specs: i.specs || {}
              }));
              setAllInventory(fetchedInv);
            } catch (invErr) {
              console.error("Failed to fetch inventory:", invErr);
            }

            setCurrentProject(prev => projectNames.includes(prev) ? prev : projectNames[0]);
          } else {
            setProjects([]);
            setProjectData({});
            setCurrentProject('');
          }
        } catch (err) {
          console.error("Backend fetch failed:", err);
          setProjects([]);
        }

      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Catalog Categories on Load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/catalog/categories');
        setCatalogCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch catalog categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchBrands = useCallback(async (categoryId: string) => {
    try {
      const res = await api.get(`/catalog/brands?category_id=${categoryId}`);
      setCatalogBrands(res.data);
    } catch (err) {
      console.error("Failed to fetch catalog brands:", err);
    }
  }, []);

  const fetchCatalogItems = useCallback(async (categoryId: string, brandId: string) => {
    try {
      const res = await api.get(`/catalog/items?category_id=${categoryId}&brand_id=${brandId}`);
      setCatalogItems(res.data);
    } catch (err) {
      console.error("Failed to fetch catalog items:", err);
    }
  }, []);

  const fetchItemSpecs = useCallback(async (itemId: string) => {
    try {
      const res = await api.get(`/catalog/items/${itemId}/specs`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch item specs:", err);
      return {};
    }
  }, []);


  // PostProd View State
  const [postProdFilters, setPostProdFilters] = useState<PostProdFilters>({
    category: 'All',
    searchQuery: '',
    status: 'All',
    priority: 'All',
    date: 'All',
    sortBy: 'status',
    sortDirection: 'asc'
  });

  // Notes View State
  const [notesFilters, setNotesFilters] = useState<NotesFilters>({
    query: '',
    category: 'All',
    date: 'All',
    sortBy: 'updated',
    sortDirection: 'desc'
  });

  const [notesLayout, setNotesLayout] = useState<'grid' | 'list'>('grid');

  // Theme State
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode as requested for implementation

  const [projectData, setProjectData] = useState<Record<string, ProjectState>>({});

  const activeData = useMemo(() => projectData[currentProject] || { shots: [], notes: [], tasks: [], crew: [] }, [projectData, currentProject]);

  const updateActiveProjectData = useCallback((updates: Partial<ProjectState>) => {
    setProjectData(prev => ({ ...prev, [currentProject]: { ...prev[currentProject], ...updates } }));
  }, [currentProject]);

  // Fetch Shots when currentProject changes
  useEffect(() => {
    const fetchProjectData = async () => {
      const projectState = projectData[currentProject];
      if (!projectState?.id || !currentUser) return;

      try {
        // Fetch Shots
        const shotsRes = await api.get(`/shots?project_id=${projectState.id}`);
        const fetchedShots: Shot[] = shotsRes.data.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          startTime: s.startTime || s.start_time,
          duration: s.duration,
          location: s.location,
          remarks: s.remarks,
          date: s.date,
          sceneNumber: s.sceneNumber || s.scene_number,
          equipmentIds: s.equipment_ids || [],
          preparedEquipmentIds: s.prepared_equipment_ids || []
        }));

        // Fetch Notes
        const notesRes = await api.get(`/notes?project_id=${projectState.id}`);
        const fetchedNotes: Note[] = notesRes.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          date: n.updated_at,
          shotId: n.shot_id,
          taskId: n.task_id
        }));

        // Fetch Tasks
        const tasksRes = await api.get(`/postprod?project_id=${projectState.id}`);
        const fetchedTasks: PostProdTask[] = tasksRes.data.map((t: any) => ({
          id: t.id,
          category: t.category,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          description: t.description
        }));

        setProjectData(prev => ({
          ...prev,
          [currentProject]: {
            ...prev[currentProject],
            shots: fetchedShots,
            notes: fetchedNotes,
            tasks: fetchedTasks
          }
        }));

      } catch (err) {
        console.error("Failed to fetch project data:", err);
      }
    };

    fetchProjectData();
  }, [currentProject, projectData[currentProject]?.id, currentUser]);

  const login = useCallback((name: string, email: string) => {
    // Deprecated: Authentication is handled by Firebase Auth and onAuthStateChanged.
    // This function is kept to satisfy interface if needed, but UI should call firebase directly.
    setMainView('overview');
  }, []);

  const enterGuest = useCallback(() => {
    setIsGuest(true);
    setCurrentUser(null);
    setMainView('overview');
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // State updates via onAuthStateChanged
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  const addProject = useCallback(async (name: string, data: Partial<ProjectState>) => {
    const newProjectName = name.trim();
    if (projects.includes(newProjectName) || !newProjectName) return;

    try {
      const res = await api.post('/projects', { name: newProjectName });
      const newProject = res.data;

      setProjects(prev => [newProjectName, ...prev]);
      setProjectData(prev => ({
        ...prev,
        [newProjectName]: {
          id: newProject.id,
          shots: [],
          notes: [],
          tasks: [],
          crew: [],
          ...data
        } as ProjectState
      }));
      setCurrentProject(newProjectName);
      setMainView('shots');
    } catch (e) {
      console.error("Failed to create project", e);
      // Optional: Show error
    }
  }, [projects]);

  const deleteProject = useCallback(async (name: string) => {
    if (projects.length <= 1) return; // Prevent deleting last project

    const projectState = projectData[name];
    if (projectState?.id) {
      try {
        await api.delete(`/projects/${projectState.id}`);

        setProjects(prev => prev.filter(p => p !== name));
        setProjectData(prev => {
          const newData = { ...prev };
          delete newData[name];
          return newData;
        });

        if (currentProject === name) {
          setCurrentProject(projects.find(p => p !== name) || projects[0]);
        }
      } catch (e) {
        console.error("Failed to delete project", e);
      }
    }
  }, [projects, currentProject, projectData]);

  const renameProject = useCallback((oldName: string, newName: string) => {
    if (oldName === newName || projects.includes(newName)) return;

    // NOTE: Rename is not yet supported by Backend API (Requires PUT /projects/{id})
    // For now, valid locally only if not sync? But app implies sync.
    // TODO: Implement Rename API

    setProjects(prev => prev.map(p => p === oldName ? newName : p));
    setProjectData(prev => {
      const newData = { ...prev };
      newData[newName] = newData[oldName];
      delete newData[oldName];
      return newData;
    });

    if (currentProject === oldName) {
      setCurrentProject(newName);
    }
  }, [projects, currentProject]);

  // Export/Import Stubs
  const exportProject = useCallback((name: string) => {
    const data = projectData[name];
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [projectData]);

  const importProject = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json.shots && json.tasks) {
        const name = file.name.replace('.json', '').replace(/_export$/, '');
        addProject(name, json);
      }
    } catch (e) {
      console.error("Import failed", e);
    }
  }, [addProject]);

  const addShot = useCallback(async (shot: Shot) => {
    const projectState = activeData;
    // We access ID from projectState (which comes from projectData[currentProject])
    // The activeData returned by useMemo doesn't have ID typed explicitly in earlier step?
    // Wait, activeData is derived. state has ID.
    // We should get ID from projectData[currentProject].id directly to be safe.
    const pid = projectData[currentProject]?.id;

    if (pid) {
      try {
        await api.post(`/shots?project_id=${pid}`, shot);
        updateActiveProjectData({ shots: [...activeData.shots, shot] });
      } catch (e) {
        console.error("Failed to add shot", e);
      }
    } else {
      // Fallback or error
      console.warn("Project has no ID, cannot save shot to backend");
      updateActiveProjectData({ shots: [...activeData.shots, shot] });
    }
  }, [activeData.shots, currentProject, projectData, updateActiveProjectData]);

  const deleteShot = useCallback(async (shotId: string) => {
    try {
      await api.delete(`/shots/${shotId}`);
      updateActiveProjectData({ shots: activeData.shots.filter(s => s.id !== shotId) });
    } catch (e) {
      console.error("Failed to delete shot", e);
    }
  }, [activeData.shots, updateActiveProjectData]);

  const updateShot = useCallback(async (shot: Shot) => {
    try {
      await api.patch(`/shots/${shot.id}`, shot);
      updateActiveProjectData({ shots: activeData.shots.map(s => s.id === shot.id ? shot : s) });
    } catch (e) {
      console.error("Failed to update shot", e);
    }
  }, [activeData.shots, updateActiveProjectData]);

  const addTask = useCallback(async (task: PostProdTask) => {
    const pid = projectData[currentProject]?.id;
    if (pid) {
      try {
        await api.post(`/postprod?project_id=${pid}`, task);
        updateActiveProjectData({ tasks: [...activeData.tasks, task] });
      } catch (e) {
        console.error("Failed to add task", e);
      }
    }
  }, [activeData.tasks, currentProject, projectData, updateActiveProjectData]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await api.delete(`/postprod/${taskId}`);
      updateActiveProjectData({ tasks: activeData.tasks.filter(t => t.id !== taskId) });
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  }, [activeData.tasks, updateActiveProjectData]);

  const updateTask = useCallback(async (task: PostProdTask) => {
    try {
      await api.patch(`/postprod/${task.id}`, task);
      updateActiveProjectData({ tasks: activeData.tasks.map(t => t.id === task.id ? task : t) });
    } catch (e) {
      console.error("Failed to update task", e);
    }
  }, [activeData.tasks, updateActiveProjectData]);

  const addGear = useCallback(async (gear: Equipment) => {
    try {
      const response = await api.post('/inventory', gear);
      setAllInventory(prev => [response.data, ...prev]);
    } catch (e) {
      console.error("Failed to add gear", e);
    }
  }, []);

  const deleteGear = useCallback(async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      setAllInventory(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error("Failed to delete gear", e);
    }
  }, []);

  const updateGear = useCallback(async (gear: Equipment) => {
    try {
      const response = await api.patch(`/inventory/${gear.id}`, gear);
      setAllInventory(prev => prev.map(item => item.id === gear.id ? response.data : item));
    } catch (e) {
      console.error("Failed to update gear", e);
    }
  }, []);

  const addNote = useCallback(async (note: Note) => {
    const pid = projectData[currentProject]?.id;
    if (pid) {
      try {
        await api.post(`/notes?project_id=${pid}`, note);
        updateActiveProjectData({ notes: [note, ...activeData.notes] });
      } catch (e) {
        console.error("Failed to add note", e);
      }
    }
  }, [activeData.notes, currentProject, projectData, updateActiveProjectData]);

  const updateNote = useCallback(async (note: Note) => {
    try {
      await api.patch(`/notes/${note.id}`, note);
      updateActiveProjectData({ notes: activeData.notes.map(n => n.id === note.id ? note : n) });
    } catch (e) {
      console.error("Failed to update note", e);
    }
  }, [activeData.notes, updateActiveProjectData]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await api.delete(`/notes/${noteId}`);
      updateActiveProjectData({ notes: activeData.notes.filter(n => n.id !== noteId) });
    } catch (e) {
      console.error("Failed to delete note", e);
    }
  }, [activeData.notes, updateActiveProjectData]);

  const toggleShotStatus = useCallback((id: string) => {
    const updatedShots = activeData.shots.map(s =>
      s.id === id
        ? { ...s, status: (s.status === 'done' ? 'pending' : 'done') as Shot['status'] }
        : s
    );
    updateActiveProjectData({ shots: updatedShots });
  }, [activeData.shots]);

  const toggleEquipmentStatus = useCallback((shotId: string, equipmentId: string) => {
    const updatedShots = activeData.shots.map(s => {
      if (s.id !== shotId) return s;
      const isPrepared = s.preparedEquipmentIds.includes(equipmentId);
      const newPrepared = isPrepared
        ? s.preparedEquipmentIds.filter(id => id !== equipmentId)
        : [...s.preparedEquipmentIds, equipmentId];
      return { ...s, preparedEquipmentIds: newPrepared };
    });
    updateActiveProjectData({ shots: updatedShots });
  }, [activeData.shots]);

  const groupedShots = useMemo(() => {
    const groups = activeData.shots.reduce((acc, shot) => {
      const date = shot.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(shot);
      return acc;
    }, {} as Record<string, Shot[]>);

    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return groups;
  }, [activeData.shots]);

  const dynamicDates = useMemo(() => {
    const allDates = Array.from(new Set([...SHOOT_DATES, ...activeData.shots.map(s => s.date)]));
    return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [activeData.shots]);

  const projectProgress = useMemo(() => {
    if (activeData.shots.length === 0) return 0;
    const done = activeData.shots.filter(s => s.status === 'done').length;
    return Math.round((done / activeData.shots.length) * 100);
  }, [activeData.shots]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  return {
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
    projectData, setProjectData,
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
    catalogCategories,
    catalogBrands,
    catalogItems,
    fetchBrands,
    fetchCatalogItems,
    fetchItemSpecs
  };
};
