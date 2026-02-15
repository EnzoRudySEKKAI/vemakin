import { create } from 'zustand';
import {
  MainView, Shot, ShotLayout, Equipment, Note, PostProdTask,
  PostProdFilters, NotesFilters, User, CatalogCategory,
  CatalogBrand, CatalogItem
} from '../types.ts';
import { timeToMinutes } from '../utils.ts';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { bulkApi } from '@/api';
import { apiClient } from '@/api/client';
import { 
  projectService, 
  shotService, 
  noteService, 
  taskService, 
  equipmentService,
  userService 
} from '@/api/services';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';

const toNullableString = (value?: string | null) => {
  if (value === undefined || value === null) return null
  const trimmed = typeof value === 'string' ? value.trim() : value
  return trimmed ? trimmed : null
}

const toNullableUuid = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : null
}

const buildEquipmentPayload = (gear: Equipment) => ({
  id: gear.id,
  name: gear.name,
  catalogItemId: toNullableUuid(gear.catalogItemId || null),
  customName: toNullableString(gear.customName),
  serialNumber: toNullableString(gear.serialNumber),
  category: gear.category,
  pricePerDay: gear.pricePerDay,
  rentalPrice: gear.rentalPrice ?? null,
  rentalFrequency: toNullableString(gear.rentalFrequency),
  quantity: gear.quantity,
  isOwned: gear.isOwned,
  status: gear.status || 'operational',
  specs: gear.specs || {}
})

export interface ProjectState {
  id?: string;
  shots: Shot[];
  notes: Note[];
  tasks: PostProdTask[];
}

interface ProductionStore {
  // State
  mainView: MainView;
  shotLayout: ShotLayout;
  shotStatusFilter: 'all' | 'pending' | 'done';
  projects: string[];
  currentProject: string;
  allInventory: Equipment[];
  currentUser: User | null;
  isGuest: boolean;
  isLoadingAuth: boolean;
  isLoadingInitialData: boolean;
  lastInitialDataFetch: number;

  catalogCategories: CatalogCategory[];
  catalogBrands: CatalogBrand[];
  catalogItems: CatalogItem[];
  hasFetchedCatalog: boolean;

  // Inventory Specs Loading State
  isLoadingInventorySpecs: boolean;
  hasLoadedInventorySpecs: boolean;

  postProdFilters: PostProdFilters;
  notesFilters: NotesFilters;
  notesLayout: 'grid' | 'list';
  darkMode: boolean;
  projectData: Record<string, ProjectState>;
  fetchedProjectIds: Set<string>;
  authPromise: Promise<void> | null;
  resolveAuth: (() => void) | null;

  // Actions
  setMainView: (view: MainView) => void;
  setShotLayout: (layout: ShotLayout) => void;
  setShotStatusFilter: (filter: 'all' | 'pending' | 'done') => void;
  setProjects: (projects: string[]) => void;
  setCurrentProject: (projectName: string) => void;
  setAllInventory: (inventory: Equipment[]) => void;
  setPostProdFilters: (updater: (prev: PostProdFilters) => PostProdFilters) => void;
  setNotesFilters: (updater: (prev: NotesFilters) => NotesFilters) => void;
  setNotesLayout: (layout: 'grid' | 'list') => void;
  toggleDarkMode: () => void;

  // Auth Actions
  initAuth: () => () => void;
  enterGuest: () => void;
  logout: () => Promise<void>;
  login: (name: string, email: string) => void;

  // Data Actions
  fetchInitialData: () => Promise<void>;
  fetchProjectData: (projectName: string) => Promise<void>;
  addProject: (name: string, data: Partial<ProjectState>) => Promise<void>;
  deleteProject: (name: string) => Promise<void>;
  renameProject: (oldName: string, newName: string) => void;

  addShot: (shot: Shot) => Promise<void>;
  updateShot: (shot: Shot) => Promise<void>;
  deleteShot: (id: string) => Promise<void>;

  addTask: (task: PostProdTask) => Promise<void>;
  updateTask: (task: PostProdTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addGear: (gear: Equipment) => Promise<void>;
  updateGear: (gear: Equipment) => Promise<void>;
  deleteGear: (id: string) => Promise<void>;
  fetchEquipmentDetail: (id: string) => Promise<Equipment | null>;
  fetchInventorySpecs: () => Promise<void>;

  addNote: (note: Note) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  toggleShotStatus: (id: string) => void;
  toggleEquipmentStatus: (shotId: string, equipmentId: string) => void;

  // Catalog Actions
  fetchCatalogCategories: () => Promise<void>;
  fetchBrands: (categoryId: string) => Promise<void>;
  fetchCatalogItems: (categoryId: string, brandId: string) => Promise<void>;
  fetchItemSpecs: (itemId: string) => Promise<any>;

  refreshProjectData: () => void;
  prefetchProjectsData: (projectNames: string[]) => Promise<void>;

  // Utility
  exportProject: (name: string) => void;
  importProject: (file: File) => Promise<void>;
}

export const useStore = create<ProductionStore>((set, get) => ({
  // Initial State
  mainView: 'overview',
  shotLayout: 'timeline',
  shotStatusFilter: 'all',
  projects: [],
  currentProject: '',
  allInventory: [],
  currentUser: null,
  isLoadingAuth: true,
  isLoadingInitialData: false,
  lastInitialDataFetch: 0,

  catalogCategories: [],
  catalogBrands: [],
  catalogItems: [],
  hasFetchedCatalog: false,

  // Inventory Specs Loading State
  isLoadingInventorySpecs: false,
  hasLoadedInventorySpecs: false,

  postProdFilters: {
    category: 'All',
    searchQuery: '',
    status: 'All',
    priority: 'All',
    date: 'All',
    sortBy: 'status',
    sortDirection: 'asc'
  },
  notesFilters: {
    query: '',
    category: 'All',
    date: 'All',
    sortBy: 'updated',
    sortDirection: 'desc'
  },
  notesLayout: 'grid',
  darkMode: false,
  projectData: {},
  fetchedProjectIds: new Set(),
  authPromise: null,
  resolveAuth: null,

  // Simple Setters
  setMainView: (view) => set({ mainView: view }),
  setShotLayout: (layout) => set({ shotLayout: layout }),
  setShotStatusFilter: (filter) => set({ shotStatusFilter: filter }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (projectName) => {
    const projectId = get().projectData[projectName]?.id;
    set({ currentProject: projectName });
    useProjectStore.getState().setCurrentProject(projectId || null, projectName);
    get().fetchProjectData(projectName);
  },
  setAllInventory: (inventory) => set({ allInventory: inventory }),
  setPostProdFilters: (updater) => set((state) => ({ postProdFilters: updater(state.postProdFilters) })),
  setNotesFilters: (updater) => set((state) => ({ notesFilters: updater(state.notesFilters) })),
  setNotesLayout: (layout) => set({ notesLayout: layout }),
  toggleDarkMode: async () => {
    const newMode = !get().darkMode;
    set({ darkMode: newMode });
    
    // Sync to backend (fire and forget, handle errors gracefully)
    if (!get().isGuest && get().currentUser) {
      try {
        await userService.updateProfile({ darkMode: newMode });
      } catch (error) {
        console.error('Failed to sync theme preference:', error);
      }
    }
  },

  // Auth Initialization
  initAuth: () => {
    // Return early if already initialized, but typically called once in RootLayout
    if (get().authPromise) return () => { };

    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    set({ authPromise: promise, resolveAuth: () => resolver() });

    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // Fetch user profile from backend to get preferences including darkMode
        let userProfile: User | null = null;
        try {
          userProfile = await userService.getProfile();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }

        set({
          currentUser: {
            id: user.uid,
            name: userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            darkMode: userProfile?.darkMode
          },
          isGuest: false,
          isLoadingAuth: false,
          // Set darkMode from user preference, default to false (light mode)
          darkMode: userProfile?.darkMode ?? false
        });
      } else if (get().isGuest) {
        set({ isLoadingAuth: false });
      } else {
        set({ currentUser: null, isLoadingAuth: false });
      }

      // Fetch initial data after auth state is determined
      if (user || get().isGuest) {
        await get().fetchInitialData();
      }

      // Resolve the promise so loaders can proceed
      const { resolveAuth } = get();
      if (resolveAuth) resolveAuth();
    });
    return unsubscribe;
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ currentUser: null, projects: [], projectData: {}, currentProject: '', fetchedProjectIds: new Set() });
      useUIStore.getState().setShowCreateProjectPrompt(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  login: (name, email) => {
    set({ mainView: 'overview' });
  },

  fetchInitialData: async () => {
    const state = get();
    const now = Date.now();
    const minFetchInterval = 5000; // 5 seconds
    
    // Prevent duplicate calls
    if (state.isLoadingInitialData) {
      console.log('[fetchInitialData] Already loading, skipping duplicate call');
      return;
    }
    
    // Prevent fetching too frequently (within 5 seconds)
    if (now - state.lastInitialDataFetch < minFetchInterval) {
      console.log('[fetchInitialData] Fetched recently, skipping');
      return;
    }
    
    set({ isLoadingInitialData: true, lastInitialDataFetch: now });
    
    try {
      const currentProjectId = state.projectData[state.currentProject]?.id;
      
      // Use the optimized bulk endpoint - fetches everything in ONE request
      const response = await bulkApi.getInitialData(currentProjectId);

      const fetchedProjects = response.projects || [];
      if (fetchedProjects.length > 0) {
        const projectNames = fetchedProjects.map((p: any) => p.name);
        const newProjectData: Record<string, ProjectState> = {};

        fetchedProjects.forEach((p: any) => {
          newProjectData[p.name] = {
            id: p.id,
            shots: [],
            notes: [],
            tasks: []
          };
        });

        const fetchedInv: Equipment[] = (response.inventory || []).map((i: any) => ({
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
          brandName: i.brandName,
          modelName: i.modelName,
          specs: i.specs || {}
        }));

        set((s) => ({
          projects: projectNames,
          projectData: { ...s.projectData, ...newProjectData },
          allInventory: fetchedInv,
          currentProject: s.currentProject || useProjectStore.getState().currentProjectName || projectNames[0]
        }));

        // If the response includes project data (shots, notes, tasks), use it
        if (response.shots || response.notes || response.tasks) {
          const currentProjectName = get().currentProject;
          if (currentProjectName) {
            const projectId = newProjectData[currentProjectName]?.id;
            if (projectId) {
              set((s) => ({
                projectData: {
                  ...s.projectData,
                  [currentProjectName]: {
                    ...s.projectData[currentProjectName],
                    shots: response.shots || [],
                    notes: response.notes || [],
                    tasks: response.tasks || []
                  }
                },
                fetchedProjectIds: new Set(s.fetchedProjectIds).add(projectId)
              }));
              
              // Prefetch data for other projects in the background
              const otherProjects = projectNames.filter(name => name !== currentProjectName);
              if (otherProjects.length > 0) {
                get().prefetchProjectsData(otherProjects);
              }
            }
          }
        } else if (get().currentProject) {
          // Fallback: fetch project data separately if not included in initial response
          get().fetchProjectData(get().currentProject);
        }
      }
      
      // Trigger background loading of inventory specs
      if (!get().hasLoadedInventorySpecs && !get().isLoadingInventorySpecs) {
        console.log('[fetchInitialData] Triggering background inventory specs loading');
        get().fetchInventorySpecs();
      }
    } catch (err) {
      console.error("Initial fetch failed:", err);
    } finally {
      set({ isLoadingInitialData: false });
    }
  },

  fetchProjectData: async (projectName) => {
    const state = get();
    const projectState = state.projectData[projectName];
    if (!projectState?.id || (!state.currentUser && !state.isGuest)) return;
    if (state.fetchedProjectIds.has(projectState.id)) return;

    try {
      // Use the optimized bulk endpoint - fetches shots, notes, tasks in ONE request
      const response = await bulkApi.getProjectData(projectState.id);

      const fetchedShots: Shot[] = (response.shots || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        startTime: s.startTime || s.start_time || '00:00',
        duration: s.duration || '1h',
        location: s.location,
        remarks: s.remarks,
        date: s.date,
        sceneNumber: s.sceneNumber || s.scene_number,
        equipmentIds: s.equipmentIds || s.equipment_ids || [],
        preparedEquipmentIds: s.preparedEquipmentIds || s.prepared_equipment_ids || []
      }));

      const fetchedNotes: Note[] = (response.notes || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        date: n.updatedAt || n.updated_at,
        shotId: n.shotId || n.shot_id,
        taskId: n.taskId || n.task_id
      }));

      const fetchedTasks: PostProdTask[] = (response.tasks || []).map((t: any) => ({
        id: t.id,
        category: t.category,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate || t.due_date,
        description: t.description
      }));

      set((s) => ({
        projectData: {
          ...s.projectData,
          [projectName]: {
            ...s.projectData[projectName],
            shots: fetchedShots,
            notes: fetchedNotes,
            tasks: fetchedTasks
          }
        },
        fetchedProjectIds: new Set(s.fetchedProjectIds).add(projectState.id!)
      }));
    } catch (err) {
      console.error("Failed to fetch project data:", err);
    }
  },

  fetchInventorySpecs: async () => {
    const state = get();
    
    // Prevent duplicate calls
    if (state.isLoadingInventorySpecs || state.hasLoadedInventorySpecs) {
      return;
    }
    
    set({ isLoadingInventorySpecs: true });
    
    try {
      console.log('[fetchInventorySpecs] Loading full inventory with specs...');
      const response = await equipmentService.getAll();
      
      // Update inventory with specs
      set({
        allInventory: response,
        hasLoadedInventorySpecs: true,
        isLoadingInventorySpecs: false
      });
      
      console.log('[fetchInventorySpecs] Inventory specs loaded successfully');
    } catch (err) {
      console.error("[fetchInventorySpecs] Failed to load inventory specs:", err);
      set({ isLoadingInventorySpecs: false });
    }
  },

  addProject: async (name, data) => {
    const newProjectName = name.trim();
    if (get().projects.includes(newProjectName) || !newProjectName) return;

    try {
      const newProject = await projectService.create({ name: newProjectName });

      set((state) => ({
        projects: [newProjectName, ...state.projects],
        projectData: {
          ...state.projectData,
          [newProjectName]: {
            id: newProject.id,
            shots: [],
            notes: [],
            tasks: [],
            ...data
          }
        },
        currentProject: newProjectName,
        mainView: 'shots'
      }));
    } catch (e) {
      console.error("Failed to create project", e);
    }
  },

  deleteProject: async (name) => {
    if (get().projects.length <= 1) return;
    const projectState = get().projectData[name];
    if (projectState?.id) {
      try {
        await projectService.delete(projectState.id);
        set((state) => {
          const newProjects = state.projects.filter(p => p !== name);
          const newData = { ...state.projectData };
          delete newData[name];
          const newProjectIds = new Set(state.fetchedProjectIds);
          newProjectIds.delete(projectState.id!);

          return {
            projects: newProjects,
            projectData: newData,
            fetchedProjectIds: newProjectIds,
            currentProject: state.currentProject === name ? newProjects[0] : state.currentProject
          };
        });
      } catch (e) {
        console.error("Failed to delete project", e);
      }
    }
  },

  renameProject: (oldName, newName) => {
    if (oldName === newName || get().projects.includes(newName)) return;
    set((state) => {
      const newData = { ...state.projectData };
      newData[newName] = newData[oldName];
      delete newData[oldName];
      return {
        projects: state.projects.map(p => p === oldName ? newName : p),
        projectData: newData,
        currentProject: state.currentProject === oldName ? newName : state.currentProject
      };
    });
  },

  addShot: async (shot) => {
    const currentProject = get().currentProject;
    if (!currentProject) {
      useUIStore.getState().setShowCreateProjectPrompt(true);
      return;
    }
    const pid = get().projectData[currentProject]?.id;
    if (pid) {
      try {
        const newShot = await shotService.create(pid, shot);
        set((state) => ({
          projectData: {
            ...state.projectData,
            [state.currentProject]: {
              ...state.projectData[state.currentProject],
              shots: [...state.projectData[state.currentProject].shots, newShot]
            }
          }
        }));
      } catch (e) {
        console.error("Failed to add shot", e);
      }
    }
  },

  updateShot: async (shot) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await shotService.update(shot.id, pid, shot);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            shots: state.projectData[state.currentProject].shots.map(s => s.id === shot.id ? shot : s)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to update shot", e);
    }
  },

  deleteShot: async (shotId) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await shotService.delete(shotId, pid);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            shots: state.projectData[state.currentProject].shots.filter(s => s.id !== shotId)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to delete shot", e);
    }
  },

  addTask: async (task) => {
    const currentProject = get().currentProject;
    if (!currentProject) {
      useUIStore.getState().setShowCreateProjectPrompt(true);
      return;
    }
    const pid = get().projectData[currentProject]?.id;
    if (pid) {
      try {
        const newTask = await taskService.create(pid, task);
        set((state) => ({
          projectData: {
            ...state.projectData,
            [state.currentProject]: {
              ...state.projectData[state.currentProject],
              tasks: [...state.projectData[state.currentProject].tasks, newTask]
            }
          }
        }));
      } catch (e) {
        console.error("Failed to add task", e);
      }
    }
  },

  updateTask: async (task) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await taskService.update(task.id, pid, task);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            tasks: state.projectData[state.currentProject].tasks.map(t => t.id === task.id ? task : t)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to update task", e);
    }
  },

  deleteTask: async (taskId) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await taskService.delete(taskId, pid);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            tasks: state.projectData[state.currentProject].tasks.filter(t => t.id !== taskId)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  },

  addGear: async (gear) => {
    try {
      const resp = await equipmentService.create(buildEquipmentPayload(gear))
      set((state) => ({ allInventory: [resp, ...state.allInventory] }))
    } catch (e) {
      console.error("Failed to add gear", e)
    }
  },

  updateGear: async (gear) => {
    try {
      const resp = await equipmentService.update(gear.id, buildEquipmentPayload(gear))
      set((state) => ({
        allInventory: state.allInventory.map(item => item.id === gear.id ? resp : item)
      }))
    } catch (e) {
      console.error("Failed to update gear", e)
    }
  },

  deleteGear: async (id) => {
    try {
      await equipmentService.delete(id);
      set((state) => ({ allInventory: state.allInventory.filter(item => item.id !== id) }));
    } catch (e) {
      console.error("Failed to delete gear", e);
    }
  },

  fetchEquipmentDetail: async (id) => {
    try {
      const detailedEquipment = await equipmentService.getById(id);
      
      set((state) => ({
        allInventory: state.allInventory.map(item => 
          item.id === id ? detailedEquipment : item
        )
      }));
      
      return detailedEquipment;
    } catch (e) {
      console.error("Failed to fetch equipment detail:", e);
      return null;
    }
  },

  addNote: async (note) => {
    const currentProject = get().currentProject;
    if (!currentProject) {
      useUIStore.getState().setShowCreateProjectPrompt(true);
      return;
    }
    const pid = get().projectData[currentProject]?.id;
    if (pid) {
      try {
        const newNote = await noteService.create(pid, note);
        set((state) => ({
          projectData: {
            ...state.projectData,
            [state.currentProject]: {
              ...state.projectData[state.currentProject],
              notes: [newNote, ...state.projectData[state.currentProject].notes]
            }
          }
        }));
      } catch (e) {
        console.error("Failed to add note", e);
      }
    }
  },

  updateNote: async (note) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await noteService.update(note.id, pid, note);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            notes: state.projectData[state.currentProject].notes.map(n => n.id === note.id ? note : n)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to update note", e);
    }
  },

  deleteNote: async (noteId) => {
    const pid = get().projectData[get().currentProject]?.id;
    if (!pid) return;
    try {
      await noteService.delete(noteId, pid);
      set((state) => ({
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...state.projectData[state.currentProject],
            notes: state.projectData[state.currentProject].notes.filter(n => n.id !== noteId)
          }
        }
      }));
    } catch (e) {
      console.error("Failed to delete note", e);
    }
  },

  toggleShotStatus: (id) => {
    set((state) => {
      const project = state.projectData[state.currentProject];
      if (!project) return state;
      return {
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...project,
            shots: project.shots.map(s => s.id === id ? { ...s, status: s.status === 'done' ? 'pending' : 'done' } : s)
          }
        }
      };
    });
  },

  toggleEquipmentStatus: (shotId, equipmentId) => {
    set((state) => {
      const project = state.projectData[state.currentProject];
      if (!project) return state;
      return {
        projectData: {
          ...state.projectData,
          [state.currentProject]: {
            ...project,
            shots: project.shots.map(s => {
              if (s.id !== shotId) return s;
              const isPrepared = s.preparedEquipmentIds.includes(equipmentId);
              return {
                ...s,
                preparedEquipmentIds: isPrepared
                  ? s.preparedEquipmentIds.filter(id => id !== equipmentId)
                  : [...s.preparedEquipmentIds, equipmentId]
              };
            })
          }
        }
      };
    });
  },

  fetchCatalogCategories: async () => {
    if (get().hasFetchedCatalog && get().catalogCategories.length > 0) return;
    try {
      const res = await apiClient.get<CatalogCategory[]>('/catalog/categories');
      set({ catalogCategories: res, hasFetchedCatalog: true });
    } catch (err) {
      console.error("Failed to fetch catalog categories:", err);
    }
  },

  fetchBrands: async (categoryId) => {
    try {
      const res = await apiClient.get<CatalogBrand[]>(`/catalog/brands?category_id=${categoryId}`);
      set({ catalogBrands: res });
    } catch (err) {
      console.error("Failed to fetch catalog brands:", err);
    }
  },

  fetchCatalogItems: async (categoryId, brandId) => {
    try {
      const res = await apiClient.get<CatalogItem[]>(`/catalog/items?category_id=${categoryId}&brand_id=${brandId}`);
      set({ catalogItems: res });
    } catch (err) {
      console.error("Failed to fetch catalog items:", err);
    }
  },

  fetchItemSpecs: async (itemId) => {
    try {
      const res = await apiClient.get<Record<string, unknown>>(`/catalog/items/${itemId}/specs`);
      return res;
    } catch (err) {
      console.error("Failed to fetch item specs:", err);
      return {};
    }
  },

  refreshProjectData: () => {
    const { currentProject, projectData } = get();
    const projectState = projectData[currentProject];
    if (projectState?.id) {
      set((state) => {
        const newIds = new Set(state.fetchedProjectIds);
        newIds.delete(projectState.id!);
        return { fetchedProjectIds: newIds };
      });
      get().fetchProjectData(currentProject);
    }
  },

  // Prefetch data for multiple projects in the background
  prefetchProjectsData: async (projectNames: string[]) => {
    const state = get();
    const prefetchPromises = projectNames
      .filter(name => {
        const project = state.projectData[name];
        return project?.id && !state.fetchedProjectIds.has(project.id);
      })
      .map(name => get().fetchProjectData(name));
    
    if (prefetchPromises.length > 0) {
      await Promise.all(prefetchPromises);
    }
  },

  exportProject: (name) => {
    const data = get().projectData[name];
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
  },

  importProject: async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json.shots && json.tasks) {
        const name = file.name.replace('.json', '').replace(/_export$/, '');
        get().addProject(name, json);
      }
    } catch (e) {
      console.error("Import failed", e);
    }
  }
}));

// Selectors for derived state
export const useActiveData = () => {
  const currentProject = useStore(state => state.currentProject);
  const projectData = useStore(state => state.projectData);
  return projectData[currentProject] || { shots: [], notes: [], tasks: [] };
};

export const useGroupedShots = () => {
  const activeData = useActiveData();
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
};

export const useDynamicDates = () => {
  const activeData = useActiveData();
  const allDates = Array.from(new Set(activeData.shots.map(s => s.date)));
  return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
};

export const useProjectProgress = () => {
  const activeData = useActiveData();
  if (activeData.shots.length === 0) return 0;
  const done = activeData.shots.filter(s => s.status === 'done').length;
  return Math.round((done / activeData.shots.length) * 100);
};

// Original hook name maintained for compatibility but now powered by Zustand
export const useProductionStore = () => {
  const store = useStore();
  const activeData = useActiveData();
  const groupedShots = useGroupedShots();
  const dynamicDates = useDynamicDates();
  const projectProgress = useProjectProgress();

  return {
    ...store,
    activeData,
    groupedShots,
    dynamicDates,
    projectProgress
  };
};
