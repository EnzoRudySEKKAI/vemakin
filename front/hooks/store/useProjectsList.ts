import { useState, useCallback, useEffect } from 'react';
import { Project, ProjectState, User } from '../../types';
import { ProjectService } from '../../services/project';

const PROJECTS_STORAGE_KEY = 'cineflow_projects';
const USER_STORAGE_KEY = 'cineflow_user';

export const useProjectsList = (currentUser: User | null, setCurrentUser: (u: any) => void) => {
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [isProjectsLoaded, setIsProjectsLoaded] = useState(false);

    // Reset loading state when user changes to prevent cross-session flicker
    useEffect(() => {
        setIsProjectsLoaded(false);
    }, [currentUser?.id]);

    const [currentProject, _setCurrentProject] = useState<string | null>(null);

    // Sync currentProject with currentUser preference when projects load
    useEffect(() => {
        if (currentUser?.last_project_id && projects.length > 0) {
            const exists = projects.some(p => p.id === currentUser.last_project_id);
            if (exists) {
                _setCurrentProject(currentUser.last_project_id);
                return;
            }
        }

        // Fallback to first project if no valid preference
        if (!currentProject && projects.length > 0) {
            _setCurrentProject(projects[0].id);
        }
    }, [currentUser?.last_project_id, projects.length]);

    const syncProjects = (newProjects: Project[]) => {
        setProjects(newProjects);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
    };

    const setCurrentProject = useCallback(async (id: string | null) => {
        _setCurrentProject(id);

        if (id && currentUser) {
            try {
                const response = await fetch('/api/users/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ last_project_id: id })
                });

                if (!response.ok) throw new Error('Failed to update project selection');

                const updatedUser = { ...currentUser, last_project_id: id };
                setCurrentUser(updatedUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser)); // Ensure consistency
            } catch (e) {
                console.error("Failed to persist project selection", e);
            }
        }
    }, [currentUser, setCurrentUser]);

    // Actions
    const addProject = useCallback(async (name: string, data: Partial<ProjectState>, onSuccess?: (id: string, newProj: Project) => void) => {
        try {
            if (!currentUser) return;
            const newProject = await ProjectService.createProject(name, currentUser.id || 'unknown');

            const updatedProjects = [newProject, ...projects];
            syncProjects(updatedProjects);

            // We need to notify the data store to initialize empty state
            if (onSuccess) onSuccess(newProject.id, newProject);

            await setCurrentProject(newProject.id);
        } catch (e) {
            console.error("Failed to add project", e);
        }
    }, [currentUser, projects, setCurrentProject]);

    const deleteProject = useCallback(async (id: string, onCleanup?: (id: string) => void) => {
        if (projects.length <= 1) return;

        try {
            await ProjectService.deleteProject(id);

            const updatedProjects = projects.filter(p => p.id !== id);
            syncProjects(updatedProjects);

            if (onCleanup) onCleanup(id);

            if (currentProject === id) {
                const remaining = projects.find(p => p.id !== id);
                await setCurrentProject(remaining ? remaining.id : null);
            }
        } catch (e) {
            console.error("Failed to delete project", e);
        }
    }, [projects, currentProject, setCurrentProject]);

    const renameProject = useCallback(async (id: string, newName: string) => {
        try {
            await ProjectService.updateProject(id, { name: newName });
            const updatedProjects = projects.map(p => p.id === id ? { ...p, name: newName } : p);
            syncProjects(updatedProjects);
        } catch (e) {
            console.error("Failed to rename project", e);
        }
    }, [projects]);

    const clearProjects = useCallback(() => {
        setProjects([]);
        localStorage.removeItem(PROJECTS_STORAGE_KEY);
        setIsProjectsLoaded(false);
    }, []);

    return {
        projects,
        setProjects,
        isProjectsLoaded,
        setIsProjectsLoaded,
        currentProject,
        _setCurrentProject, // Exposed for initial load logic
        setCurrentProject,
        addProject,
        deleteProject,
        renameProject,
        clearProjects
    };
};
