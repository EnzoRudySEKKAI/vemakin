
import { supabase } from '../lib/supabase.ts';
import { Shot, Note, PostProdTask, ProjectState } from '../types.ts';
import { Tables } from '../lib/database.types.ts';

import { Project } from '../types.ts';

export interface ProjectService {
    getProjects: () => Promise<Project[]>;
    getProjectData: (projectId: string) => Promise<ProjectState>;
    createProject: (name: string, userId: string) => Promise<Project>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
    deleteProject: (id: string) => Promise<void>;
}

export const ProjectService = {
    async getProjects(): Promise<Project[]> {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();

        return (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            userId: p.user_id,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
    },

    async getProjectData(projectId: string): Promise<Omit<ProjectState, 'crew'>> {
        const response = await fetch(`/api/projects/${projectId}/data`);
        if (!response.ok) throw new Error('Failed to fetch project data');
        const { shots, tasks, notes } = await response.json();

        return {
            shots: (shots || []).map(transformShot),
            tasks: (tasks || []).map(transformTask),
            notes: (notes || []).map(transformNote)
        };
    },

    async createProject(name: string, userId: string): Promise<Project> {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (!response.ok) throw new Error('Failed to create project');
        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            userId: data.user_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update project');
        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            userId: data.user_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async deleteProject(id: string): Promise<void> {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete project');
    }
};

// Transformers
function transformShot(s: any): Shot {
    return {
        id: s.id,
        title: s.title,
        description: s.description || '',
        status: s.status as any || 'pending',
        startTime: s.start_time || '09:00',
        duration: s.duration || '0 min',
        location: s.location || '',
        equipmentIds: s.shot_equipment?.map((se: any) => se.inventory_item_id) || [],
        preparedEquipmentIds: s.shot_equipment?.filter((se: any) => se.is_prepared).map((se: any) => se.inventory_item_id) || [],
        remarks: s.remarks,
        generalNotes: s.general_notes,
        date: s.date || new Date().toISOString(), // Fallback
        sceneNumber: s.scene_number
    };
}

function transformTask(t: any): PostProdTask {
    // Determine subtype properties
    let details = {};
    if (t.script) details = { ...t.script };
    else if (t.vfx) details = { assetType: t.vfx.asset_type, shotCount: t.vfx.shot_count };
    else if (t.sound) details = { ...t.sound };
    else if (t.color) details = { ...t.color };
    else if (t.editing) details = { ...t.editing };

    return {
        id: t.id,
        type: t.type as any,
        title: t.title,
        status: t.status as any,
        priority: t.priority as any,
        dueDate: t.due_date || '',
        assignee: 'Unassigned', // Crew removed, maybe link to users later?
        description: t.description || '',
        createdAt: t.created_at || new Date().toISOString(),
        updatedAt: t.updated_at || new Date().toISOString(),
        ...details
    };
}

function transformNote(n: any): Note {
    return {
        id: n.id,
        title: n.title,
        content: n.content || '',
        createdAt: n.created_at || new Date().toISOString(),
        updatedAt: n.updated_at || new Date().toISOString(),
        shotId: n.shot_id || undefined,
        taskId: n.task_id || undefined,
        attachments: typeof n.attachments === 'string' ? JSON.parse(n.attachments) : n.attachments || []
    };
}
