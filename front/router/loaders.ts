import { useStore } from '../hooks/useProductionStore';

/**
 * Helper to ensure auth is initialized before proceeding with data fetching.
 */
const ensureAuth = async () => {
    const store = useStore.getState();
    if (!store.authPromise) {
        // If auth hasn't been initialized yet (e.g. loader runs before RootLayout mount),
        // we trigger it now. RootLayout will still call it, but initAuth handles deduplication.
        store.initAuth();
    }

    // Re-fetch the promise as it might have just been created
    const authPromise = useStore.getState().authPromise;
    if (authPromise) {
        await authPromise;
    }
};

/**
 * Loader for the root route.
 * Ensures that basic data (user, projects, inventory) is being initialized.
 */
export const rootLoader = async () => {
    await ensureAuth();
    return null;
};

/**
 * Loader for shots.
 * Ensures shots for the current project are fetched.
 */
export const shotsLoader = async () => {
    await ensureAuth();
    const store = useStore.getState();
    const currentProject = store.currentProject;
    const projectState = store.projectData[currentProject];

    if (projectState?.id && !store.fetchedProjectIds.has(projectState.id)) {
        await store.fetchProjectData(currentProject);
    }
    return null;
};

/**
 * Loader for inventory.
 * Ensures the full catalog and inventory are available.
 */
export const inventoryLoader = async () => {
    await ensureAuth();
    const store = useStore.getState();
    if (store.allInventory.length === 0) {
        await store.fetchInitialData();
    }
    await store.fetchCatalogCategories();
    return null;
};

/**
 * Loader for notes.
 */
export const notesLoader = async () => {
    await ensureAuth();
    const store = useStore.getState();
    const currentProject = store.currentProject;
    const projectState = store.projectData[currentProject];

    if (projectState?.id && !store.fetchedProjectIds.has(projectState.id)) {
        await store.fetchProjectData(currentProject);
    }
    return null;
};

/**
 * Loader for pipeline/tasks.
 */
export const pipelineLoader = async () => {
    await ensureAuth();
    const store = useStore.getState();
    const currentProject = store.currentProject;
    const projectState = store.projectData[currentProject];

    if (projectState?.id && !store.fetchedProjectIds.has(projectState.id)) {
        await store.fetchProjectData(currentProject);
    }
    return null;
};

/**
 * Loader for specific item details (Shot, Task, Note, Gear).
 */
export const detailLoader = async ({ params }: any) => {
    await ensureAuth();
    return null;
};
