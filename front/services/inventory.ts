
import { Equipment } from '../types.ts';

export const InventoryService = {
    async getAll(): Promise<Equipment[]> {
        const response = await fetch('/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();

        return (data || []).map(transformToEquipment);
    },

    async add(item: any): Promise<Equipment> {
        const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gear_id: item.modelId,
                custom_name: item.name,
                serial_number: item.serialNumber,
                is_owned: item.isOwned,
                price_per_day: item.pricePerDay || 0,
                rental_price: item.rentalPrice,
                rental_frequency: item.rentalFrequency
            })
        });

        if (!response.ok) throw new Error('Failed to add gear to inventory');
        const data = await response.json();

        // We need to fetch the full item details after adding or return them in the POST response
        // For simplicity, let's assume we might need to refresh or the POST response is complete enough.
        // Actually, the server returns the newItem which is just the user_inventory row.
        // We might want to re-fetch or make the server return the JOINED row.
        // Refetching is safer for now or let's update the server to return joined row.
        return transformToEquipment(data);
    }
};

function transformToEquipment(item: any): Equipment {
    // Check for camelCase keys first (new backend format), then snake_case fallback
    const brandName = item.brand || item.brand_name || item.gear?.brand?.name || 'Unknown Brand';
    const categoryName = item.category || item.category_name || item.gear?.category?.name || 'Unknown Category';
    const gearName = item.name || item.gear_name || item.gear?.name || 'Unknown Item';

    return {
        id: item.id,
        gearId: item.gearId || item.gear_id || item.gearId,
        name: gearName,
        category: categoryName as any,
        brand: brandName,
        model: gearName,
        description: item.description || item.gear_description || item.gear?.description || '',
        serialNumber: item.serialNumber || item.serial_number || '',
        purchaseDate: item.purchaseDate || item.purchase_date || undefined,
        status: item.status || 'operational',
        specs: item.specs || {},
        location: item.location || '',
        customName: item.customName || item.custom_name,
        image: item.image || item.image_url || item.gear?.image_url || undefined,
        pricePerDay: item.pricePerDay || item.price_per_day || 0,
        rentalPrice: item.rentalPrice || item.rental_price,
        rentalFrequency: item.rentalFrequency || item.rental_frequency,
        quantity: 1,
        isOwned: item.isOwned ?? item.is_owned
    };
}
