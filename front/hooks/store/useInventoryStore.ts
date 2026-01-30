import { useState, useCallback } from 'react';
import { Equipment } from '../../types';
import { InventoryService } from '../../services/inventory';

export const useInventoryStore = () => {
    const [allInventory, setAllInventory] = useState<Equipment[]>([]);

    const addGear = useCallback(async (gear: Equipment) => {
        try {
            const newGear = await InventoryService.add(gear);
            setAllInventory(prev => [newGear, ...prev]);
        } catch (e) {
            console.error("Failed to add gear", e);
        }
    }, []);

    return {
        allInventory,
        setAllInventory,
        addGear
    };
};
