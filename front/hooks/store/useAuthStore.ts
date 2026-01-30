import { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { authClient } from '../../lib/auth-client';

const USER_STORAGE_KEY = 'cineflow_user';
const PROJECTS_STORAGE_KEY = 'cineflow_projects'; // Used for cleanup on logout

export const useAuthStore = (setProjects?: (p: any[]) => void) => { // Optional callback if we want to clear projects on logout
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [isAuthReady, setIsAuthReady] = useState(false); // Force explicit load wait
    const [isGuest, setIsGuest] = useState(false);

    // Sync Session & Local Storage
    useEffect(() => {
        let mounted = true;

        const validateSession = async () => {
            // Avoid double fetch if data is already there, but we want to verify validity mainly
            try {
                const { data: session } = await authClient.getSession();

                if (!mounted) return;

                if (session) {
                    const newUser = {
                        name: session.user.name || session.user.email?.split('@')[0] || 'User',
                        email: session.user.email || '',
                        id: session.user.id,
                        avatar: session.user.image,
                        last_project_id: (session.user as any).lastProjectId || (session.user as any).last_project_id
                    };

                    setCurrentUser(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(newUser)) {
                            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
                            return newUser;
                        }
                        return prev;
                    });
                    setIsGuest(false);
                    setIsAuthReady(true);
                } else {
                    if (currentUser) {
                        setCurrentUser(null);
                        localStorage.removeItem(USER_STORAGE_KEY);
                        localStorage.removeItem(PROJECTS_STORAGE_KEY);
                        if (setProjects) setProjects([]);
                    }
                    setIsAuthReady(true);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthReady(true);
            }
        };

        validateSession();
    }, []);

    const login = useCallback((name: string, email: string, id: string) => {
        const newUser = { name, email, id };
        setCurrentUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        setIsGuest(false);
        setIsAuthReady(true);
    }, []);

    const enterGuest = useCallback(() => {
        setIsGuest(true);
    }, []);

    const logout = useCallback(async () => {
        setCurrentUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(PROJECTS_STORAGE_KEY);
        if (setProjects) setProjects([]);
        setIsGuest(false);
        setIsAuthReady(true);

        try {
            await authClient.signOut();
        } catch (e) {
            console.error('Logout error (background):', e);
        }
    }, [setProjects]);

    return {
        currentUser,
        setCurrentUser,
        isGuest,
        isAuthReady,
        login,
        enterGuest,
        logout
    };
};
