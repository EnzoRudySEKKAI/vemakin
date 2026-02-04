
import {
  Camera as CameraIcon, Aperture, Sun, Mic,
  Package, ShoppingBag, Monitor, Radio, Drill,
  PenLine, Scissors, Music, Layers, Palette, Plane,
  Triangle, Activity, CircleDot
} from 'lucide-react';
import { Equipment, PostProdTask, Shot, Currency, Note } from './types.ts';

export const POST_PROD_CATEGORIES = [
  { label: 'Script', icon: PenLine, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', activeBg: 'bg-indigo-600', activeText: 'text-white' },
  { label: 'Editing', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', activeBg: 'bg-orange-600', activeText: 'text-white' },
  { label: 'Sound', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-600', activeText: 'text-white' },
  { label: 'VFX', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', activeBg: 'bg-purple-600', activeText: 'text-white' },
  { label: 'Color', icon: Palette, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', activeBg: 'bg-red-600', activeText: 'text-white' },
];

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
