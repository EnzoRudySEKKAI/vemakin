import { useState, useCallback } from 'react';
import { MainView, ShotLayout, PostProdFilters, NotesFilters } from '../../types';

export const useUIStore = () => {
    const [mainView, setMainView] = useState<MainView>('overview');
    const [shotLayout, setShotLayout] = useState<ShotLayout>('timeline');
    const [shotStatusFilter, setShotStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

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
    const [darkMode, setDarkMode] = useState(true);

    const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

    const resetUI = useCallback(() => {
        setMainView('overview');
        setShotLayout('timeline');
        setShotStatusFilter('all');
        setPostProdFilters({
            category: 'All',
            searchQuery: '',
            status: 'All',
            priority: 'All',
            date: 'All',
            sortBy: 'status',
            sortDirection: 'asc'
        });
        setNotesFilters({
            query: '',
            category: 'All',
            date: 'All',
            sortBy: 'updated',
            sortDirection: 'desc'
        });
    }, []);

    return {
        mainView, setMainView,
        shotLayout, setShotLayout,
        shotStatusFilter, setShotStatusFilter,
        postProdFilters, setPostProdFilters,
        notesFilters, setNotesFilters,
        notesLayout, setNotesLayout,
        darkMode, toggleDarkMode,
        resetUI
    };
};
