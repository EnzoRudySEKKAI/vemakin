import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Aperture, Plus, Sun, Moon, Clock, MapPin, Check, Package, ChevronUp, ChevronDown } from 'lucide-react'

import { Shot, ShotLayout, Equipment } from '@/types'
import { calculateEndTime, timeToMinutes, getSunTimes, formatDateWithDay } from '@/utils'
import { Card } from '@/components/ui/Card'
import { TravelIndicator } from '@/components/ui/TravelIndicator'
import { GearTransition } from '@/components/ui/GearTransition'
import { Button } from '@/components/atoms/Button'

interface ShotsViewProps {
  groupedShots: Record<string, Shot[]>
  dates: string[]
  shotLayout: ShotLayout
  onShotClick: (s: Shot) => void
  onToggleStatus: (id: string) => void
  onToggleEquipment: (shotId: string, equipmentId: string) => void
  onAddShot: () => void
  onDateInView?: (date: string) => void
  inventory: Equipment[]
  searchQuery?: string
  statusFilter?: 'all' | 'pending' | 'done'
}

const getTimelineStatus = (shot: Shot): 'done' | 'current' | 'pending' => {
  if (shot.status === 'done') return 'done'
  return 'pending'
}

export const ShotsView: React.FC<ShotsViewProps> = React.memo(({
  groupedShots,
  dates,
  shotLayout,
  onShotClick,
  onToggleStatus,
  onToggleEquipment,
  onAddShot,
  onDateInView,
  inventory,
  searchQuery = '',
  statusFilter = 'all'
}) => {
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const filteredGroupedShots = useMemo(() => {
    const filtered: Record<string, Shot[]> = {}

    Object.keys(groupedShots).forEach(date => {
      let shots = groupedShots[date]

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase()
        shots = shots.filter(s =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.location.toLowerCase().includes(lowerQuery) ||
          s.sceneNumber.toLowerCase().includes(lowerQuery)
        )
      }

      if (statusFilter !== 'all') {
        shots = shots.filter(s => s.status === statusFilter)
      }

      if (shots.length > 0) {
        filtered[date] = shots
      }
    })
    return filtered
  }, [groupedShots, searchQuery, statusFilter])

  const totalShots = useMemo(() => {
    return Object.values(filteredGroupedShots).reduce((acc: number, shots: Shot[]) => acc + shots.length, 0)
  }, [filteredGroupedShots])

  useEffect(() => {
    if (!onDateInView) return

    observerRef.current = new IntersectionObserver((entries) => {
      const activeEntry = entries.find(entry => entry.isIntersecting)
      if (activeEntry && activeEntry.target.id) {
        onDateInView(activeEntry.target.id)
      }
    }, {
      root: null,
      rootMargin: '-180px 0px -75% 0px',
      threshold: 0
    })

    const sections = document.querySelectorAll('.date-section')
    sections.forEach(section => observerRef.current?.observe(section))

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [onDateInView, filteredGroupedShots])

  const handleToggleChecklist = (id: string) => {
    setExpandedChecklist(prev => prev === id ? null : id)
  }

  if (totalShots === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] w-full overflow-hidden px-6 select-none">
        <div className="w-14 h-14 bg-[#16181D] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05]">
          <Aperture size={24} className="text-white/40" />
        </div>

        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? "No Matches Found" : "Empty Timeline"}
          </h2>
          <p className="text-white/30 mb-8 text-sm">
            {searchQuery || statusFilter !== 'all' ? "Try adjusting your filters." : "Begin your production by scheduling the first scene."}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onAddShot}
            leftIcon={<Plus size={18} strokeWidth={2.5} />}
          >
            Schedule First Shot
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {dates.map((dateString) => {
        const dayShots = filteredGroupedShots[dateString]
        if (!dayShots?.length) return null

        const { sunrise, sunset } = getSunTimes(dateString)

        return (
          <div
            key={dateString}
            id={dateString}
            className="date-section scroll-mt-[180px]"
          >
            <Card
              title={formatDateWithDay(dateString)}
              headerRight={
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-orange-400/60">
                    <Sun size={14} strokeWidth={2} /> {sunrise}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary/60">
                    <Moon size={14} strokeWidth={2} /> {sunset}
                  </div>
                </div>
              }
            >
              <div className="p-4 space-y-3">
                {/* Shots List */}

                <div className="space-y-2">
                  {dayShots.map((shot, idx) => {
                    let availableMinutes = undefined
                    if (idx > 0 && !searchQuery && statusFilter === 'all') {
                      const prevShot = dayShots[idx - 1]
                      const prevEndTime = calculateEndTime(prevShot.startTime, prevShot.duration)
                      availableMinutes = timeToMinutes(shot.startTime) - timeToMinutes(prevEndTime)
                    }

                    const status = getTimelineStatus(shot)
                    const barColor = status === 'done' ? 'bg-primary' : status === 'current' ? 'bg-primary' : 'bg-white/20'
                    const isChecklistOpen = expandedChecklist === shot.id

                    return (
                      <div key={shot.id}>
                        {shotLayout === 'timeline' && idx > 0 && !searchQuery && statusFilter === 'all' && (
                          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 lg:gap-4 my-4 px-2">
                            <TravelIndicator
                              from={dayShots[idx - 1].location}
                              to={shot.location}
                              availableMinutes={availableMinutes}
                            />
                            <GearTransition
                              prevShot={dayShots[idx - 1]}
                              nextShot={shot}
                              inventory={inventory}
                            />
                          </div>
                        )}

                        <div
                          className="group cursor-pointer rounded-xl transition-all duration-200 bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1]"
                        >
                          <div className={shotLayout === 'list' ? "p-3" : "p-4"} onClick={() => onShotClick(shot)}>
                            <div className={shotLayout === 'list' ? "flex flex-col gap-2" : "flex flex-col gap-4"}>
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2 min-w-[70px] pt-1">
                                  <div className={`w-1 ${shotLayout === 'list' ? 'h-6' : 'h-10'} rounded-full ${barColor}`} />
                                  <div className="text-xs">
                                    <div className="text-white/50 font-mono">{shot.startTime}</div>
                                    {shotLayout === 'timeline' && (
                                      <div className="text-white/50 font-mono">{calculateEndTime(shot.startTime, shot.duration)}</div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className={`${shotLayout === 'list' ? 'text-xs' : 'text-sm'} text-white font-medium truncate`}>{shot.title}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-white/20 uppercase tracking-wider shrink-0">Sc {shot.sceneNumber}</span>
                                    <span className="text-white/5">|</span>
                                    <div className="flex items-center gap-1 text-[11px] text-white/20 truncate">
                                      <MapPin size={10} className="shrink-0" />
                                      <span className="truncate">{shot.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {shotLayout !== 'list' && (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleChecklist(shot.id)
                                      }}
                                      className={`h-9 pl-3 pr-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${isChecklistOpen
                                        ? 'bg-white/10 text-white border-white/20'
                                        : 'bg-[#1A1D21] text-white/70 border-white/[0.08] hover:border-white/20 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                      <span>Checklist</span>
                                      {isChecklistOpen ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
                                    </button>

                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                                      <Package size={18} strokeWidth={2.5} />
                                      <span>Gear {shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id) }}
                                    className={`${shotLayout === 'list' ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg flex items-center justify-center border transition-all ${shot.status === 'done'
                                      ? 'bg-primary text-white border-transparent'
                                      : 'bg-transparent text-white/30 border-white/[0.08] hover:border-white/20'
                                      }`}
                                  >
                                    <Check size={14} strokeWidth={3} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isChecklistOpen && shot.equipmentIds.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="pt-3 border-t border-white/[0.05]">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {shot.equipmentIds.map(eId => {
                                        const equip = inventory.find(e => e.id === eId)
                                        const isPrepared = shot.preparedEquipmentIds.includes(eId)
                                        return (
                                          <button
                                            key={eId}
                                            onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId) }}
                                            className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${isPrepared
                                              ? 'bg-primary/10 dark:bg-primary/10 border-primary/30 dark:border-primary/30 text-primary'
                                              : 'bg-[#0F1116] border-white/[0.05] text-white/40 hover:border-white/10'
                                              }`}
                                          >
                                            <span className="truncate mr-2">{equip?.customName || equip?.name || 'Unknown Item'}</span>
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isPrepared
                                              ? 'bg-primary border-primary text-white'
                                              : 'border-white/20'
                                              }`}>
                                              {isPrepared && <Check size={10} strokeWidth={4} />}
                                            </div>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
})

ShotsView.displayName = 'ShotsView'
