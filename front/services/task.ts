
import { supabase } from '../lib/supabase.ts';
import { PostProdTask } from '../types.ts';

export const TaskService = {
    async create(task: Omit<PostProdTask, 'id' | 'createdAt' | 'updatedAt'>, projectId: string): Promise<PostProdTask> {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: task.title,
                status: task.status,
                priority: task.priority,
                type: task.type,
                due_date: task.dueDate,
                description: task.description,
                project_id: projectId
            })
            .select()
            .single();

        if (error) throw error;

        // Insert into subtype table based on type
        let subtypeError = null;
        let details: any = {};

        if (task.type === 'Script') {
            const { error } = await supabase.from('tasks_script').insert({ id: data.id });
            subtypeError = error;
        } else if (task.type === 'VFX') {
            const { error } = await supabase.from('tasks_vfx').insert({ id: data.id, asset_type: '2D', shot_count: 0 }); // Defaults
            subtypeError = error;
            details = { assetType: '2D', shotCount: 0 };
        } else if (task.type === 'Sound') {
            const { error } = await supabase.from('tasks_sound').insert({ id: data.id });
            subtypeError = error;
        } else if (task.type === 'Color') {
            const { error } = await supabase.from('tasks_color').insert({ id: data.id });
            subtypeError = error;
        } else if (task.type === 'Editing') {
            const { error } = await supabase.from('tasks_editing').insert({ id: data.id });
            subtypeError = error;
        }

        if (subtypeError) {
            console.error("Subtype creation failed", subtypeError);
            // Should probably delete the main task to rollback
        }

        return {
            ...task,
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            ...details
        };
    },

    async update(id: string, updates: Partial<PostProdTask>): Promise<void> {
        // TODO: Handle updates for main table and subtypes
        const mainUpdates: any = {};
        if (updates.title) mainUpdates.title = updates.title;
        if (updates.status) mainUpdates.status = updates.status;
        if (updates.priority) mainUpdates.priority = updates.priority;
        if (updates.dueDate) mainUpdates.due_date = updates.dueDate;
        if (updates.description) mainUpdates.description = updates.description;

        if (Object.keys(mainUpdates).length > 0) {
            const { error } = await supabase
                .from('tasks')
                .update({ ...mainUpdates, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        }
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    }
};
