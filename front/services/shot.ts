
import { supabase } from '../lib/supabase.ts';
import { Shot } from '../types.ts';

export const ShotService = {
    async create(shot: Omit<Shot, 'id' | 'equipmentIds' | 'preparedEquipmentIds'>, projectId: string, equipmentIds: string[] = []): Promise<Shot> {
        // 1. Insert Shot
        const { data: shotData, error: shotError } = await supabase
            .from('shots')
            .insert({
                title: shot.title,
                description: shot.description,
                status: shot.status,
                start_time: shot.startTime,
                duration: shot.duration,
                location: shot.location,
                remarks: shot.remarks,
                general_notes: shot.generalNotes,
                date: shot.date,
                scene_number: shot.sceneNumber,
                project_id: projectId
            })
            .select()
            .single();

        if (shotError) throw shotError;

        // 2. Insert Equipment (if any)
        if (equipmentIds.length > 0) {
            const equipmentInserts = equipmentIds.map(eqId => ({
                shot_id: shotData.id,
                inventory_item_id: eqId,
                is_prepared: false
            }));

            const { error: eqError } = await supabase
                .from('shot_equipment')
                .insert(equipmentInserts);

            if (eqError) throw eqError; // Note: cleanup shot if this fails? For now, throw.
        }

        // Return constructed Shot object
        return {
            ...shot,
            id: shotData.id,
            equipmentIds: equipmentIds,
            preparedEquipmentIds: []
        };
    },

    async update(id: string, updates: Partial<Shot>): Promise<void> {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
        if (updates.generalNotes !== undefined) dbUpdates.general_notes = updates.generalNotes;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.sceneNumber !== undefined) dbUpdates.scene_number = updates.sceneNumber;

        if (Object.keys(dbUpdates).length > 0) {
            const { error } = await supabase
                .from('shots')
                .update(dbUpdates)
                .eq('id', id);
            if (error) throw error;
        }

        // Note: updating equipment list requires diffing or separate methods.
        // For simplicity, we assume equipment updates are handled via specific methods below.
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase.from('shots').delete().eq('id', id);
        if (error) throw error;
    },

    async toggleStatus(id: string, currentStatus: 'pending' | 'done'): Promise<void> {
        const newStatus = currentStatus === 'done' ? 'pending' : 'done';
        const { error } = await supabase.from('shots').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
    },

    async addEquipment(shotId: string, equipmentId: string): Promise<void> {
        const { error } = await supabase
            .from('shot_equipment')
            .insert({ shot_id: shotId, inventory_item_id: equipmentId, is_prepared: false });
        if (error) throw error;
    },

    async removeEquipment(shotId: string, equipmentId: string): Promise<void> {
        const { error } = await supabase
            .from('shot_equipment')
            .delete()
            .match({ shot_id: shotId, inventory_item_id: equipmentId });
        if (error) throw error;
    },

    async togglePrepared(shotId: string, equipmentId: string, isPrepared: boolean): Promise<void> {
        const { error } = await supabase
            .from('shot_equipment')
            .update({ is_prepared: isPrepared })
            .match({ shot_id: shotId, inventory_item_id: equipmentId });
        if (error) throw error;
    }
};
