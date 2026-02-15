import React, { useState, useEffect } from 'react'
import { Car, Bike, Footprints, Train, Plane, Bus } from 'lucide-react'
import { TransportMode } from '@/types'
import { getMockTravelInfo, getRealTravelInfo } from '@/utils'

interface TravelIndicatorProps {
  from: string
  to: string
  fromLat?: number
  fromLng?: number
  toLat?: number
  toLng?: number
  availableMinutes?: number
}

export const TravelIndicator: React.FC<TravelIndicatorProps> = ({
  from,
  to,
  fromLat,
  fromLng,
  toLat,
  toLng,
  availableMinutes
}) => {
  const [mode, setMode] = useState<TransportMode>('driving')
  const [info, setInfo] = useState<{ distance: string; time: number }>({ distance: '0', time: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const hasCoordinates = fromLat !== undefined && fromLng !== undefined && toLat !== undefined && toLng !== undefined

  useEffect(() => {
    const fetchTravelInfo = async () => {
      if (!from || !to) {
        setInfo({ distance: '0', time: 0 })
        return
      }

      if (hasCoordinates) {
        setIsLoading(true)
        try {
          const realInfo = await getRealTravelInfo(fromLat, fromLng, toLat, toLng, mode)
          setInfo(realInfo)
        } catch {
          const mockInfo = getMockTravelInfo(from, to, mode)
          setInfo(mockInfo)
        } finally {
          setIsLoading(false)
        }
      } else {
        const mockInfo = getMockTravelInfo(from, to, mode)
        setInfo(mockInfo)
      }
    }

    fetchTravelInfo()
  }, [from, to, fromLat, fromLng, toLat, toLng, mode, hasCoordinates])

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
        disabled={isLoading}
      >
        <div className={`h-px flex-1 transition-colors ${isTimeCritical ? 'bg-red-500/30' : 'bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20'}`} />
        
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
          isTimeCritical ? 'text-red-500' : 'text-gray-400 dark:text-white/40 group-hover:text-gray-600 dark:group-hover:text-white/60'
        }`}>
          <ModeIcon size={12} />
          {isLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : (
            <>
              {info.time}m Travel
              {parseFloat(info.distance) > 0 && <span className="text-gray-500">({info.distance}km)</span>}
            </>
          )}
          {delay > 0 && <span className="text-red-500 ml-1">+{delay}m</span>}
        </div>

        <div className={`h-px flex-1 transition-colors ${isTimeCritical ? 'bg-red-500/30' : 'bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20'}`} />
      </button>
    </div>
  )
}
