
import {
  Camera as CameraIcon, Aperture, Sun, Mic,
  Package, ShoppingBag, Monitor, Radio, Drill,
  PenLine, Scissors, Music, Layers, Palette, Plane,
  Triangle, Activity, CircleDot
} from 'lucide-react';
import { Equipment, PostProdTask, Shot, Currency, Note } from './types.ts';

export const PROJECTS = ["Neon Paradox", "Urban Echoes", "Silent Sky"];
export const SHOOT_DATES = [
  "Oct 24, 2024",
  "Oct 25, 2024",
  "Oct 26, 2024",
  "Oct 27, 2024",
  "Oct 28, 2024"
];

export const POST_PROD_CATEGORIES = [
  { label: 'Script', icon: PenLine, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', activeBg: 'bg-indigo-600', activeText: 'text-white' },
  { label: 'Editing', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', activeBg: 'bg-orange-600', activeText: 'text-white' },
  { label: 'Sound', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-600', activeText: 'text-white' },
  { label: 'VFX', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', activeBg: 'bg-purple-600', activeText: 'text-white' },
  { label: 'Color', icon: Palette, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', activeBg: 'bg-red-600', activeText: 'text-white' },
];

// --- MOCK DATABASE ---
// Removed - now using PostgreSQL database catalog
export const GEAR_DATABASE = {} as any;

export const CATEGORY_ICONS = {
  Camera: CameraIcon,
  Lens: Aperture,
  Light: Sun,
  Filter: CircleDot,
  Audio: Mic,
  Tripod: Triangle,
  Stabilizer: Activity,
  Support: Triangle, // Fallback
  Grip: Drill,
  Monitoring: Monitor,
  Wireless: Radio,
  Drone: Plane,
  Props: ShoppingBag,
  Other: Package,
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' }
];

// Re-mapped initial inventory to match new harmonized specs
export const GLOBAL_INVENTORY: Equipment[] = [
  {
    id: 'e1', name: 'RED V-Raptor XL', customName: 'A-CAM', category: 'Camera', pricePerDay: 1200, quantity: 1, isOwned: true, status: 'operational',
    specs: { sensor: "Vista Vision 8K", resolution: "8192 x 4320", mount: "PL Mount", frameRate: "120 fps @ 8K", dynamicRange: "17+ Stops", nativeISO: "800", media: "CFexpress Type B", weight: "3.6 kg" }
  },
  {
    id: 'e2', name: 'OConnor 2575D', customName: 'HEAVY HEAD', category: 'Tripod', pricePerDay: 150, quantity: 1, isOwned: true, status: 'operational',
    specs: { headType: "Fluid Head", maxPayload: "40.8 kg", bowlSize: "Mitchell/150", heightRange: "N/A", material: "Aluminum", counterbalance: "Continuous", weight: "10.4 kg" }
  },
  {
    id: 'e7', name: 'Video 18 S2', customName: 'TRIPOD 01', category: 'Tripod', pricePerDay: 80, quantity: 2, isOwned: true, status: 'operational',
    specs: { headType: "Fluid Head", maxPayload: "22 kg", bowlSize: "100mm", heightRange: "67-168 cm", material: "Carbon Fiber", counterbalance: "16 Steps", weight: "8.4 kg" }
  },
  {
    id: 'e3', name: 'Ultra 7', customName: 'MON 01', category: 'Monitoring', pricePerDay: 85, quantity: 2, isOwned: true, status: 'operational',
    specs: { screen: "7-inch LCD", resolution: "1920 x 1200", brightness: "2300 nits", inputs: "6G-SDI / HDMI", power: "2-Pin Lemo", features: "Touch / Cam Control", dimensions: "180x118x33 mm", weight: "0.6 kg" }
  },
  {
    id: 'e8', name: 'C-Stand 33', customName: 'C-STAND KIT', category: 'Grip', pricePerDay: 15, quantity: 12, isOwned: true, status: 'operational',
    specs: { type: "Stand", maxLoad: "10 kg", maxHeight: "328 cm", minHeight: "134 cm", footprint: "95 cm", material: "Chrome Steel", mount: "Junior/Baby", weight: "6.2 kg" }
  },
  {
    id: 'e4', name: 'CineSlider 3ft', customName: 'SLIDER 3FT', category: 'Grip', pricePerDay: 95, quantity: 1, isOwned: false, status: 'maintenance',
    specs: { type: "Slider", maxLoad: "36 kg", maxHeight: "N/A", minHeight: "N/A", footprint: "90 cm", material: "Aluminum/Steel", mount: "N/A", weight: "5.4 kg" }
  },
  {
    id: 'e5', name: 'Bolt 6 LT 750', customName: 'TX 01', category: 'Wireless', pricePerDay: 120, quantity: 1, isOwned: true, status: 'operational',
    specs: { range: "750 ft", delay: "<0.001 sec", resolution: "4K HDR", inputs: "HDMI / 3G-SDI", freq: "6GHz", power: "2-Pin Lemo", multicast: "No", weight: "296g" }
  },
  {
    id: 'e6', name: 'Master Prime 50', customName: 'PRIME 50', category: 'Lens', pricePerDay: 450, quantity: 1, isOwned: false, status: 'operational',
    specs: { focalLength: "50mm", aperture: "T1.3", mount: "PL Mount", coverage: "S35", minFocus: "0.50m", frontDiameter: "114mm", weight: "2.6 kg", filterSize: "N/A" }
  },
  {
    id: 'e9', name: 'NATural ND Kit', customName: 'ND SET', category: 'Filter', pricePerDay: 45, quantity: 1, isOwned: true, status: 'operational',
    specs: { type: "ND", density: "0.3 - 2.1", size: "4x5.65", material: "Glass", stops: "1-7", weight: "200g" }
  }
];

export const INITIAL_SHOTS: Shot[] = [
  {
    id: '1', title: 'Opening Scene - Wide', description: 'Establishing shot of the city at dawn.', status: 'done',
    startTime: '08:00', duration: '2h', location: 'Rooftop Central', remarks: 'Needs ND filter.',
    equipmentIds: ['e1', 'e2', 'e3', 'e5'], preparedEquipmentIds: ['e1', 'e2', 'e3', 'e5'], date: SHOOT_DATES[0],
    sceneNumber: '1A'
  },
  {
    id: '2', title: 'Close-up Elara', description: 'Reaction shot when she sees the signal.', status: 'done',
    startTime: '10:30', duration: '1.5h', location: 'Rooftop Central', remarks: 'Focus on eyes.',
    equipmentIds: ['e1', 'e3', 'e6'], preparedEquipmentIds: ['e1', 'e3', 'e6'], date: SHOOT_DATES[0],
    sceneNumber: '2B'
  },
  {
    id: '3', title: 'Industrial Chase', description: 'POV shot from the pursuer.', status: 'pending',
    startTime: '13:00', duration: '3h', location: 'Industrial District', remarks: 'High energy.',
    equipmentIds: ['e1', 'e4', 'e3', 'e5'], preparedEquipmentIds: ['e1', 'e4'], date: SHOOT_DATES[0],
    sceneNumber: '4C'
  },
  {
    id: '4', title: 'The Encounter', description: 'Wide shot of the two characters meeting under the neon signs.', status: 'pending',
    startTime: '19:30', duration: '2.5h', location: 'Neon Alley', remarks: 'Atmospheric lighting.',
    equipmentIds: ['e1', 'e7', 'e3', 'e6'], preparedEquipmentIds: [], date: SHOOT_DATES[0],
    sceneNumber: '8F'
  },
  {
    id: '5', title: 'Interrogation Interior', description: 'Low key lighting dialogue.', status: 'pending',
    startTime: '09:00', duration: '4h', location: 'Secret HQ', remarks: 'Needs mist.',
    equipmentIds: ['e1', 'e2', 'e3', 'e6', 'e8'], preparedEquipmentIds: ['e8'], date: SHOOT_DATES[1],
    sceneNumber: '12A'
  },
  {
    id: '6', title: 'Club Infiltration', description: 'Steadicam-like follow shot through the crowd.', status: 'pending',
    startTime: '14:00', duration: '5h', location: 'Neon Club', remarks: 'Challenging focus.',
    equipmentIds: ['e1', 'e3', 'e5'], preparedEquipmentIds: [], date: SHOOT_DATES[1],
    sceneNumber: '15D'
  }
];

export const POSTPROD_TASKS: PostProdTask[] = [
  {
    id: 'pp1',
    type: 'Script',
    title: 'Dialogue Polish - Sc 8F',
    status: 'progress',
    priority: 'medium',
    dueDate: SHOOT_DATES[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp2',
    type: 'VFX',
    title: 'Hologram Glitch R&D',
    status: 'todo',
    priority: 'high',
    dueDate: SHOOT_DATES[3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp3',
    type: 'Color',
    title: 'Neon Look Dev',
    status: 'done',
    priority: 'critical',
    dueDate: SHOOT_DATES[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pp4',
    type: 'Sound',
    title: 'Ambience Mixdown - Sc 15D',
    status: 'todo',
    priority: 'high',
    dueDate: SHOOT_DATES[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export const INITIAL_NOTES: Note[] = [
  // Notes linked to Shots
  {
    id: 'n_s1',
    title: 'Camera Motion Alert',
    content: 'Steadicam operator requested a lighter build for the rooftop chase. We need to swap the prime kit.',
    createdAt: new Date(Date.now() - 200000).toISOString(),
    updatedAt: new Date().toISOString(),
    shotId: '3', // Industrial Chase
    attachments: []
  },
  {
    id: 'n_s2',
    title: 'Lighting Consistency',
    content: 'The neon sign in the background was flickering at 50Hz during the wide shot. We need to match this practical frequency in the close-ups.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    shotId: '4', // The Encounter
    attachments: []
  },

  // Notes linked to Pipeline Tasks
  {
    id: 'n_t1',
    title: 'VFX Supervision Request',
    content: 'The glitch effect needs to feel organic, less digital. Reference the"Blade Runner 2049"hologram sequence.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskId: 'pp2', // VFX Task
    attachments: []
  },
  {
    id: 'n_t2',
    title: 'Script Change',
    content: 'Jane suggests cutting the monologue in Scene 8F. It slows down the pacing before the encounter.',
    createdAt: new Date(Date.now() - 172800000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    taskId: 'pp1', // Script Task
    attachments: []
  },

  // General Notes
  {
    id: 'n_g1',
    title: 'Art Department Meeting',
    content: 'Discuss prop damage from yesterday. We need to order backup visors for the stunt team.',
    createdAt: new Date(Date.now() - 200000000 * 1.1).toISOString(),
    updatedAt: new Date(Date.now() - 200000000).toISOString(),
    attachments: []
  }
];


