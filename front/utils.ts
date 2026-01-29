
import { TransportMode } from './types.ts';

export const calculateEndTime = (startTime: string, duration: string) => {
 const [hours, minutes] = startTime.split(':').map(Number);
 const durHours = parseFloat(duration.replace('h', ''));
 const totalMinutes = hours * 60 + minutes + Math.round(durHours * 60);
 const endHours = Math.floor(totalMinutes / 60) % 24;
 const endMinutes = totalMinutes % 60;
 return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

export const timeToMinutes = (timeStr: string) => {
 const [h, m] = timeStr.split(':').map(Number);
 return h * 60 + m;
};

export const getSunTimes = (dateStr: string) => {
 // Simple stable hash to generate consistent mock times for a given date
 let hash = 0;
 for (let i = 0; i < dateStr.length; i++) {
  hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
 }
 const h = Math.abs(hash);
 const sunriseH = 6 + (h % 2);
 const sunriseM = 10 + (h % 40);
 const sunsetH = 17 + (h % 3);
 const sunsetM = 15 + (h % 40);

 return {
  sunrise: `${String(sunriseH).padStart(2, '0')}:${String(sunriseM).padStart(2, '0')}`,
  sunset: `${String(sunsetH).padStart(2, '0')}:${String(sunsetM).padStart(2, '0')}`
 };
};

export const getMockTravelInfo = (from: string, to: string, mode: TransportMode) => {
 const combined = from + to;
 let hash = 0;
 for (let i = 0; i < combined.length; i++) {
  hash = combined.charCodeAt(i) + ((hash << 5) - hash);
 }
 const baseDist = Math.abs(hash % 15) + 2;
 const speed = {
  driving: 40,
  cycling: 15,
  walking: 5,
  train: 80,
  plane: 800,
  bus: 30
 };

 const isSameLocation = from === to;
 const distance = isSameLocation ? 0 : baseDist;
 // If same location, assume a minimum of 20 mins for setup/transition
 const timeMin = isSameLocation ? 20 : Math.round((distance / speed[mode]) * 60);

 return { distance: distance.toFixed(1), time: timeMin };
};

export const formatDateToNumeric = (dateStr: string) => {
 const d = new Date(dateStr);
 if (isNaN(d.getTime())) return dateStr;
 const day = String(d.getDate()).padStart(2, '0');
 const month = String(d.getMonth() + 1).padStart(2, '0');
 const year = d.getFullYear();
 return `${day}/${month}/${year}`;
};

// ============================================
// SHARED STYLE UTILITIES
// ============================================

/** Get priority color classes for PostProd tasks */
export const getPriorityColor = (priority: string): string => {
 switch (priority) {
  case 'critical': return 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
  case 'high': return 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
  case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100 dark:text-[#4E47DD] dark:bg-[#4E47DD]/10 dark:border-[#4E47DD]/20';
  default: return 'text-gray-400 bg-gray-50 border-gray-100 dark:text-gray-500 dark:bg-gray-500/10 dark:border-gray-500/20';
 }
};

/** Get status color classes for PostProd tasks */
export const getStatusColor = (status: string): string => {
 switch (status) {
  case 'done': return 'bg-emerald-500';
  case 'progress': return 'bg-blue-500';
  case 'review': return 'bg-orange-500';
  default: return 'bg-gray-400';
 }
};

/** Format ISO date string to human-readable relative format */
export const formatDateRelative = (isoString: string): string => {
 const date = new Date(isoString);
 if (isNaN(date.getTime())) return isoString;
 return date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
 });
};

/** Format ISO date string to short format (e.g.,"Oct 15") */
export const formatDateShort = (dateStr: string): string => {
 const date = new Date(dateStr);
 if (isNaN(date.getTime())) return dateStr;
 return date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric'
 });
};

