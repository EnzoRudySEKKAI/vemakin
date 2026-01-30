import { useEffect } from 'react';
import { ProjectService } from '../services/project';
import { InventoryService } from '../services/inventory';
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';
import { useProjectsList } from './store/useProjectsList';
import { useInventoryStore } from './store/useInventoryStore';
import { useProjectData } from './store/useProjectData';

import { useGearCatalog } from './store/useGearCatalog';

// ... (existing imports)

export const useProductionStore = () => {
  // 1. UI State
  const uiStore = useUIStore();

  // 2. Auth State
  const authStore = useAuthStore();

  // 3. Projects List State
  const projectsStore = useProjectsList(authStore.currentUser, authStore.setCurrentUser);

  // 4. Global Inventory State
  const inventoryStore = useInventoryStore();

  // 5. Active Project Data State
  const projectDataStore = useProjectData(projectsStore.currentProject);

  // =========================================================================
  // Coordination & Initialization Logic
  // =========================================================================

  // Initial Data Load & Sync on Auth Change
  useEffect(() => {
    if (!authStore.currentUser) return;

    // Default to overview on connection
    uiStore.setMainView('overview');

    const loadInitialData = async () => {
      try {
        // Parallelize Data Fetching
        // Consolidate API Calls
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error('Failed to fetch initial data');

        const {
          projects,
          inventory,
          categories,
          catalog,
          activeProjectData
        } = await res.json();

        // Batch Updates
        projectsStore.setProjects(projects);
        inventoryStore.setAllInventory(inventory);

        // Update Catalog Store directly
        useGearCatalog.setState({ categories, catalog, isLoading: false });

        // Initialize Project placeholders
        const initialData: Record<string, any> = {};
        const lastProjectId = authStore.currentUser?.last_project_id;

        for (const p of projects) {
          // If we fetched data for this project (active one), use it.
          if (activeProjectData && p.id === activeProjectData.id) {
            initialData[p.id] = activeProjectData;
          } else {
            initialData[p.id] = { shots: [], notes: [], tasks: [] };
          }
        }
        projectDataStore.setProjectData(initialData);

        // Smart Project Selection Update (Prioritize backend last_project_id)
        projectsStore._setCurrentProject((prev: string | null) => {
          // 1. If we have a stored preference from the backend, use it
          if (lastProjectId && projects.find((p: any) => p.id === lastProjectId)) {
            return lastProjectId;
          }
          // ... rest of logic
          if (prev && projects.find((p: any) => p.id === prev)) return prev;
          return projects.length > 0 ? projects[0].id : null;
        });
      } catch (e) {
        console.error('Failed to load initial data', e);
      } finally {
        projectsStore.setIsProjectsLoaded(true);
      }

    };

    loadInitialData();
  }, [authStore.currentUser?.id, authStore.currentUser?.last_project_id]);

  // =========================================================================
  // Composite Actions
  // =========================================================================

  const importProject = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json.shots && json.tasks) {
        const name = file.name.replace('.json', '').replace(/_export$/, '');

        // Use the addProject from store, but we need to inject the data 
        // addProject in useProjectsList only creates the project entity.
        // We need to set the data in projectDataStore.

        projectsStore.addProject(name, {}, (newId, newProj) => {
          // This callback runs after project creation success
          projectDataStore.setProjectData(prev => ({
            ...prev,
            [newId]: {
              shots: [],
              notes: [],
              tasks: [],
              ...json // Spread imported data
            }
          }));
        });
      }
    } catch (e) {
      console.error("Import failed", e);
    }
  };

  // Wire up Auth Store to clear projects on logout (Manual bridge if not circular)
  // useAuthStore definition handles basic clearing, but if we need extra logic:
  const logout = async () => {
    await authStore.logout();
    projectsStore.clearProjects();
    uiStore.resetUI();
  };

  return {
    ...uiStore,
    ...authStore,
    logout, // Override authStore.logout with composed one if needed, or just use authStore's if it covers it.

    ...projectsStore,
    importProject, // Add the composite action

    ...inventoryStore,
    ...projectDataStore,
  };
};
