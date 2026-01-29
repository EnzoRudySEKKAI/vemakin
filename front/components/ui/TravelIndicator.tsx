
import React, { useState } from 'react';
import { Car, Bike, Footprints, AlertTriangle, Train, Plane, Bus } from 'lucide-react';
import { TransportMode } from '../../types.ts';
import { getMockTravelInfo } from '../../utils.ts';

export const TravelIndicator = ({
  from,
  to,
  availableMinutes
}: {
  from: string;
  to: string;
  availableMinutes?: number;
}) => {
  const [mode, setMode] = useState<TransportMode>('driving');
  const info = getMockTravelInfo(from, to, mode);

  // Un délai est présent si le temps de trajet est supérieur au temps de pause disponible
  const isTimeCritical = availableMinutes !== undefined ? info.time > availableMinutes : false;
  const delay = availableMinutes !== undefined ? Math.max(0, info.time - availableMinutes) : 0;

  const getModeIcon = (m: TransportMode) => {
    switch (m) {
      case 'driving': return Car;
      case 'cycling': return Bike;
      case 'walking': return Footprints;
      case 'train': return Train;
      case 'plane': return Plane;
      case 'bus': return Bus;
      default: return Car;
    }
  };

  const ModeIcon = getModeIcon(mode);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 w-[300px] lg:w-auto lg:flex-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          const modes: TransportMode[] = ['driving', 'walking', 'bus', 'train', 'plane', 'cycling'];
          setMode(modes[(modes.indexOf(mode) + 1) % modes.length]);
        }}
        className={`
          flex items-center gap-6 py-3 px-6 rounded-[16px] border transition-all group w-full active:scale-[0.98]
          ${isTimeCritical
            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20'
            : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm'
          }
        `}
      >
        {/* Left: Mode Icon & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`
            p-2.5 rounded-xl transition-all
            ${isTimeCritical
              ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white'
            }
          `}>
            <ModeIcon size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-xs font-bold tracking-wide capitalize ${isTimeCritical ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {mode === 'bus' ? 'Transit' : mode}
            </span>
            <div className="flex flex-col mt-1 space-y-0.5">
              {availableMinutes !== undefined && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  Break: {availableMinutes} min
                </span>
              )}
              {delay > 0 && (
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={10} /> Delay {delay}m
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle: Visual Connector */}
        <div className="h-px flex-1 relative flex items-center justify-between mx-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isTimeCritical ? 'bg-red-300 dark:bg-red-500/50' : 'bg-gray-300 dark:bg-gray-600'}`} />
          <div className={`flex-1 h-px border-t border-dashed ${isTimeCritical ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-600'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${isTimeCritical ? 'bg-red-300 dark:bg-red-500/50' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>

        {/* Right: Distance & Time */}
        <div className="flex flex-col items-end leading-none shrink-0 text-right">
          <span className={`text-sm font-bold tracking-tight ${isTimeCritical ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {info.distance} km
          </span>
          <span className={`text-[11px] font-medium tracking-wide mt-1 ${isTimeCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {info.time} min
          </span>
        </div>
      </button>
    </div>
  );
};
