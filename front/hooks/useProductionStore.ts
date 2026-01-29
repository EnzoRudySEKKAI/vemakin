
import { useState, useMemo, useCallback } from 'react';
import { MainView, Shot, ShotLayout, Equipment, Note, PostProdTask, CrewMember, PostProdFilters, NotesFilters, User } from '../types.ts';
import { PROJECTS, SHOOT_DATES, GLOBAL_INVENTORY, INITIAL_SHOTS, POSTPROD_TASKS, INITIAL_CREW, INITIAL_NOTES } from '../constants.ts';
import { timeToMinutes } from '../utils.ts';

export interface ProjectState {
  shots: Shot[];
  notes: Note[];
  tasks: PostProdTask[];
  crew: CrewMember[];
}

export const useProductionStore = () => {
  const [mainView, setMainView] = useState<MainView>('overview');
  const [shotLayout, setShotLayout] = useState<ShotLayout>('timeline');
  const [shotStatusFilter, setShotStatusFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [projects, setProjects] = useState<string[]>(PROJECTS);
  const [currentProject, setCurrentProject] = useState(PROJECTS[0]);
  const [allInventory, setAllInventory] = useState<Equipment[]>(GLOBAL_INVENTORY);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

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

  const [projectData, setProjectData] = useState<Record<string, ProjectState>>({
    [PROJECTS[0]]: {
      shots: INITIAL_SHOTS,
      tasks: POSTPROD_TASKS,
      crew: INITIAL_CREW,
      notes: INITIAL_NOTES
    },
    ...PROJECTS.slice(1).reduce((acc, p) => ({ ...acc, [p]: { shots: [], notes: [], tasks: [], crew: INITIAL_CREW } }), {})
  });

  const activeData = useMemo(() => projectData[currentProject] || { shots: [], notes: [], tasks: [], crew: [] }, [projectData, currentProject]);

  const updateActiveProjectData = useCallback((updates: Partial<ProjectState>) => {
    setProjectData(prev => ({ ...prev, [currentProject]: { ...prev[currentProject], ...updates } }));
  }, [currentProject]);

  const login = useCallback((name: string, email: string) => {
    setCurrentUser({
      name: name,
      email: email
    });
    setIsGuest(false);
    setMainView('overview');
  }, []);

  const enterGuest = useCallback(() => {
    setIsGuest(true);
    setCurrentUser(null);
    setMainView('overview');
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsGuest(false);
  }, []);

  const addProject = useCallback((name: string, data: Partial<ProjectState>) => {
    const newProjectName = name.trim();
    if (projects.includes(newProjectName)) return;

    setProjects(prev => [newProjectName, ...prev]);
    setProjectData(prev => ({
      ...prev,
      [newProjectName]: {
        shots: [],
        notes: [],
        tasks: [],
        crew: INITIAL_CREW,
        ...data
      } as ProjectState
    }));
    setCurrentProject(newProjectName);
    setMainView('shots');
  }, [projects]);

  const deleteProject = useCallback((name: string) => {
    if (projects.length <= 1) return; // Prevent deleting last project

    setProjects(prev => prev.filter(p => p !== name));
    setProjectData(prev => {
      const newData = { ...prev };
      delete newData[name];
      return newData;
    });

    if (currentProject === name) {
      setCurrentProject(projects.find(p => p !== name) || projects[0]);
    }
  }, [projects, currentProject]);

  const renameProject = useCallback((oldName: string, newName: string) => {
    if (oldName === newName || projects.includes(newName)) return;

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

  const addShot = useCallback((shot: Shot) => {
    updateActiveProjectData({ shots: [...activeData.shots, shot] });
  }, [activeData.shots]);

  const addTask = useCallback((task: PostProdTask) => {
    updateActiveProjectData({ tasks: [...activeData.tasks, task] });
  }, [activeData.tasks]);

  const addGear = useCallback((gear: Equipment) => {
    setAllInventory(prev => [gear, ...prev]);
  }, []);

  const addNote = useCallback((note: Note) => {
    updateActiveProjectData({ notes: [note, ...activeData.notes] });
  }, [activeData.notes]);

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
    addTask,
    addGear,
    addNote,
    postProdFilters,
    setPostProdFilters,
    notesFilters,
    setNotesFilters,
    notesLayout,
    setNotesLayout,
    darkMode,
    toggleDarkMode,
    exportProject,
    importProject
  };
};
