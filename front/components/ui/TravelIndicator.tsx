import React, { useState } from 'react'
import { Car, Bike, Footprints, Train, Plane, Bus } from 'lucide-react'
import { TransportMode } from '@/types'
import { getMockTravelInfo } from '@/utils'

interface TravelIndicatorProps {
  from: string
  to: string
  availableMinutes?: number
}

export const TravelIndicator: React.FC<TravelIndicatorProps> = ({
  from,
  to,
  availableMinutes
}) => {
  const [mode, setMode] = useState<TransportMode>('driving')
  const info = getMockTravelInfo(from, to, mode)

  const isTimeCritical = availableMinutes !== undefined ? info.time > availableMinutes : false
  const delay = availableMinutes !== undefined ? Math.max(0, info.time - availableMinutes) : 0

  const getModeIcon = (m: TransportMode) => {
    switch (m) {
      case 'driving': return Car
      case 'cycling': return Bike
      case 'walking': return Footprints
      case 'train': return Train
      case 'plane': return Plane
      case 'bus': return Bus
      default: return Car
    }
  }

  const ModeIcon = getModeIcon(mode)

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 flex-1 lg:flex-1">
      <button
        onClick={(e) => {
          e.stopPropagation()
          const modes: TransportMode[] = ['driving', 'walking', 'bus', 'train', 'plane', 'cycling']
          setMode(modes[(modes.indexOf(mode) + 1) % modes.length])
        }}
        className="w-full flex items-center justify-center gap-4 py-2 group cursor-pointer"
      >
        <div className={`h-px flex-1 transition-colors ${isTimeCritical ? 'bg-red-500/30' : 'bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20'}`} />
        
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
          isTimeCritical ? 'text-red-500' : 'text-gray-400 dark:text-white/40 group-hover:text-gray-600 dark:group-hover:text-white/60'
        }`}>
          <ModeIcon size={12} />
          {info.time}m Travel Time
          {delay > 0 && <span className="text-red-500 ml-1">+{delay}m</span>}
        </div>

        <div className={`h-px flex-1 transition-colors ${isTimeCritical ? 'bg-red-500/30' : 'bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20'}`} />
      </button>
    </div>
  )
}
