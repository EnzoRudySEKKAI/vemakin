
import { supabase } from '../lib/supabase.ts';
import { Note } from '../types.ts';

export const NoteService = {
    async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, projectId: string): Promise<Note> {
        const { data, error } = await supabase
            .from('notes')
            .insert({
                title: note.title,
                content: note.content,
                shot_id: note.shotId,
                task_id: note.taskId,
                attachments: note.attachments ? JSON.stringify(note.attachments) : '[]',
                project_id: projectId
            })
            .select()
            .single();

        if (error) throw error;

        return {
            ...note,
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            attachments: JSON.parse(data.attachments as string || '[]')
        };
    },

    async update(id: string, updates: Partial<Note>): Promise<void> {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.content) dbUpdates.content = updates.content;
        if (updates.shotId !== undefined) dbUpdates.shot_id = updates.shotId;
        if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId;
        if (updates.attachments) dbUpdates.attachments = JSON.stringify(updates.attachments);

        if (Object.keys(dbUpdates).length > 0) {
            const { error } = await supabase
                .from('notes')
                .update({ ...dbUpdates, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        }
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
    }
};
