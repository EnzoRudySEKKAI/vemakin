
export type MainView = 'overview' | 'shots' | 'shot-detail' | 'inventory' | 'equipment-detail' | 'notes' | 'note-detail' | 'postprod' | 'task-detail' | 'settings' | 'manage-projects';
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

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  dailyRate?: number;
  status: 'confirmed' | 'pending' | 'wrapped';
  avatar?: string;
}

export interface Equipment {
  id: string;
  name: string;
  customName?: string;
  serialNumber?: string;
  category: 'Camera' | 'Lens' | 'Light' | 'Filter' | 'Audio' | 'Tripod' | 'Stabilizer' | 'Grip' | 'Monitoring' | 'Wireless' | 'Drone' | 'Props' | 'Other';
  pricePerDay: number;
  rentalPrice?: number;
  rentalFrequency?: 'hour' | 'day' | 'week' | 'month' | 'year';
  quantity: number;
  isOwned: boolean;
  status?: 'operational' | 'maintenance' | 'broken';
  specs: {
    // Shared
    weight?: string;
    // Camera
    sensorSize?: string;
    dynamicRange?: string;
    nativeISO?: string;
    mount?: string;
    operatingHours?: string;
    // Lens
    focalLength?: string;
    aperture?: string;
    frontDiameter?: string;
    minFocus?: string;
    imageCircle?: string;
    // Filter
    density?: string;
    size?: string;
    type?: string;
    strength?: string;
    // Light
    powerDraw?: string;
    colorTemp?: string;
    cri?: string;
    control?: string;
    // Audio
    channels?: string;
    phantomPower?: string;
    batteryType?: string;
    // Tripod & Stabilizer
    maxPayload?: string;
    bowlSize?: string;
    material?: string;
    travelDistance?: string; // for sliders
    maxHeight?: string;
    minHeight?: string;
    // Monitoring
    brightness?: string;
    resolution?: string;
    inputs?: string;
    // Wireless
    range?: string;
    latency?: string;
    // Drone
    maxFlightTime?: string;
    maxSpeed?: string;
    transmissionRange?: string;
    // Props
    era?: string;
    fragility?: string;
    [key: string]: string | undefined;
  };
}
