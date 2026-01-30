import { useState, useMemo, useCallback, useEffect } from 'react';
import { ProjectState, Shot, PostProdTask, Note, Equipment } from '../../types';
import { ShotService } from '../../services/shot';
import { TaskService } from '../../services/task';
import { NoteService } from '../../services/note';
import { ProjectService } from '../../services/project';
import { timeToMinutes } from '../../utils';

export const useProjectData = (currentProject: string | null) => {
    const [projectData, setProjectData] = useState<Record<string, ProjectState>>({});

    const activeData = useMemo(() =>
        (currentProject && projectData[currentProject]) ? projectData[currentProject] : { shots: [], notes: [], tasks: [] },
        [projectData, currentProject]
    );

    const updateActiveProjectData = useCallback((updates: Partial<ProjectState>) => {
        if (!currentProject) return;
        setProjectData(prev => ({
            ...prev,
            [currentProject]: { ...prev[currentProject], ...updates }
        }));
    }, [currentProject]);

    // Fetch active project data when currentProject changes
    useEffect(() => {
        if (!currentProject) return;

        const loadProject = async () => {
            try {
                const data = await ProjectService.getProjectData(currentProject);
                setProjectData(prev => ({
                    ...prev,
                    [currentProject]: data
                }));
            } catch (e) {
                console.error('Failed to load project details', e);
            }
        };

        loadProject();
    }, [currentProject]);

    // Actions
    const addShot = useCallback(async (shot: Shot) => {
        if (!currentProject) return;
        try {
            const newShot = await ShotService.create(shot, currentProject, shot.equipmentIds);
            updateActiveProjectData({ shots: [...activeData.shots, newShot] });
        } catch (e) {
            console.error("Failed to add shot", e);
        }
    }, [activeData.shots, currentProject, updateActiveProjectData]);

    const addTask = useCallback(async (task: PostProdTask) => {
        if (!currentProject) return;
        try {
            const newTask = await TaskService.create(task, currentProject);
            updateActiveProjectData({ tasks: [...activeData.tasks, newTask] });
        } catch (e) {
            console.error("Failed to add task", e);
        }
    }, [activeData.tasks, currentProject, updateActiveProjectData]);

    const addNote = useCallback(async (note: Note) => {
        if (!currentProject) return;
        try {
            const newNote = await NoteService.create(note, currentProject);
            updateActiveProjectData({ notes: [newNote, ...activeData.notes] });
        } catch (e) {
            console.error("Failed to add note", e);
        }
    }, [activeData.notes, currentProject, updateActiveProjectData]);

    const toggleShotStatus = useCallback(async (id: string) => {
        try {
            const shot = activeData.shots.find(s => s.id === id);
            if (!shot) return;

            await ShotService.toggleStatus(id, shot.status);

            const updatedShots = activeData.shots.map(s =>
                s.id === id
                    ? { ...s, status: (s.status === 'done' ? 'pending' : 'done') as Shot['status'] }
                    : s
            );
            updateActiveProjectData({ shots: updatedShots });
        } catch (e) {
            console.error("Failed to toggle shot status", e);
        }
    }, [activeData.shots, updateActiveProjectData]);

    const toggleEquipmentStatus = useCallback(async (shotId: string, equipmentId: string) => {
        try {
            const shot = activeData.shots.find(s => s.id === shotId);
            if (!shot) return;

            const isPrepared = shot.preparedEquipmentIds.includes(equipmentId);
            await ShotService.togglePrepared(shotId, equipmentId, !isPrepared);

            const updatedShots = activeData.shots.map(s => {
                if (s.id !== shotId) return s;
                const newPrepared = isPrepared
                    ? s.preparedEquipmentIds.filter(id => id !== equipmentId)
                    : [...s.preparedEquipmentIds, equipmentId];
                return { ...s, preparedEquipmentIds: newPrepared };
            });
            updateActiveProjectData({ shots: updatedShots });
        } catch (e) {
            console.error("Failed to toggle equipment status", e);
        }
    }, [activeData.shots, updateActiveProjectData]);

    // Import/Export Logic
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

    // Computed
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
        const allDates = Array.from(new Set(activeData.shots.map(s => s.date)));
        return allDates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
    }, [activeData.shots]);

    const projectProgress = useMemo(() => {
        if (activeData.shots.length === 0) return 0;
        const done = activeData.shots.filter(s => s.status === 'done').length;
        return Math.round((done / activeData.shots.length) * 100);
    }, [activeData.shots]);

    return {
        projectData,
        setProjectData,
        activeData,
        updateActiveProjectData,
        addShot,
        addTask,
        addNote,
        toggleShotStatus,
        toggleEquipmentStatus,
        exportProject,
        groupedShots,
        dynamicDates,
        projectProgress
    };
};
