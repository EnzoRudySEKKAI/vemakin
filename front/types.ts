
export type MainView = 'overview' | 'shots' | 'shot-detail' | 'inventory' | 'equipment-detail' | 'notes' | 'note-detail' | 'postprod' | 'task-detail' | 'settings' | 'manage-projects' | 'new-shot' | 'new-gear' | 'new-task' | 'new-note';
export type ShotLayout = 'timeline' | 'list';
export type InventoryLayout = 'grid' | 'list';
export type TransportMode = 'driving' | 'walking' | 'cycling' | 'train' | 'plane' | 'bus';

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

export interface Currency {
    code: string;
    symbol: string;
}

export interface InventoryFilters {
    category: string;
    ownership: 'all' | 'owned' | 'rented';
    query: string;
}

export interface PostProdFilters {
    category: string;
    searchQuery: string;
    status: string;
    priority: string;
    date: string;
    sortBy: 'status' | 'priority' | 'dueDate' | 'created' | 'modified' | 'alpha';
    sortDirection: 'asc' | 'desc';
}

export interface NotesFilters {
    query: string;
    category: string;
    date?: string;
    sortBy?: 'updated' | 'created' | 'alpha';
    sortDirection: 'asc' | 'desc';
}

export interface Shot {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'done';
    startTime: string;
    duration: string;
    location: string;
    remarks: string;
    generalNotes?: string;
    equipmentIds: string[];
    preparedEquipmentIds: string[];
    date: string;
    sceneNumber: string;
}

export interface PostProdTask {
    id: string;
    category: 'Script' | 'Editing' | 'Sound' | 'VFX' | 'Color';
    title: string;
    status: 'todo' | 'progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string;
    description?: string;
    metadata?: Record<string, string | number | boolean>;
    createdAt: string;
    updatedAt: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'document' | 'other';
    url: string;
    size?: string;
    createdAt: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    shotId?: string; // Optional link to a shot
    taskId?: string; // Optional link to a task
    attachments: Attachment[];
}

export interface Equipment {
    id: string;
    name: string;
    catalogItemId?: string;
    customName?: string;
    serialNumber?: string;
    category: 'Camera' | 'Lens' | 'Light' | 'Filter' | 'Audio' | 'Tripod' | 'Stabilizer' | 'Grip' | 'Monitoring' | 'Wireless' | 'Drone' | 'Props' | 'Other';
    pricePerDay: number;
    rentalPrice?: number;
    rentalFrequency?: 'hour' | 'day' | 'week' | 'month' | 'year';
    quantity: number;
    isOwned: boolean;
    status: 'operational' | 'maintenance' | 'broken' | 'lost' | 'sold';
    brandName?: string;
    modelName?: string;
    specs: Record<string, any>;
}

export interface CatalogCategory {
    id: string;
    name: string;
    slug: string;
}

export interface CatalogBrand {
    id: string;
    name: string;
}

export interface CatalogItem {
    id: string;
    brand_id: string;
    category_id: string;
    name: string;
    description?: string;
    image_url?: string;
    specs?: Record<string, any>;
}

// Pagination types
export interface PaginationParams {
    page?: number;
    limit?: number;
    cursor?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
}

// Project type
export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
