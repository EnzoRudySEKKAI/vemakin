
import { create } from 'zustand';

export interface CatalogItem {
    id: string;
    name: string;
    brand_name: string;
    category_name: string;
    category_slug: string;
    description?: string;
    image_url?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

interface GearCatalogState {
    categories: Category[];
    catalog: CatalogItem[];
    isLoading: boolean;
    error: string | null;
    fetchCatalog: () => Promise<void>;
    getSpecs: (gearId: string) => Promise<any>;
}

export const useGearCatalog = create<GearCatalogState>((set) => ({
    categories: [],
    catalog: [],
    isLoading: false,
    error: null,

    fetchCatalog: async () => {
        set({ isLoading: true, error: null });
        try {
            const [catsRes, catalogRes] = await Promise.all([
                fetch('/api/gear/categories'),
                fetch('/api/gear/catalog')
            ]);

            if (!catsRes.ok || !catalogRes.ok) throw new Error('Failed to fetch gear catalog');

            const [categories, catalog] = await Promise.all([
                catsRes.json(),
                catalogRes.json()
            ]);

            set({ categories, catalog, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    getSpecs: async (gearId: string) => {
        try {
            const res = await fetch(`/api/gear/catalog/${gearId}/specs`);
            if (!res.ok) throw new Error('Failed to fetch specs');
            return await res.json();
        } catch (err) {
            console.error('Error fetching specs:', err);
            return {};
        }
    }
}));
