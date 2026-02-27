import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Aperture, Plus, Sun, Moon, MapPin, Check, Package, ChevronDown, ChevronUp, Square } from 'lucide-react'

import { Shot, ShotLayout, Equipment } from '@/types'
import { calculateEndTime, timeToMinutes, getSunTimes, formatDateWithDay } from '@/utils'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { TravelIndicator } from '@/components/ui/TravelIndicator'
import { GearTransition } from '@/components/ui/GearTransition'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'

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
    if (!groupedShots) return filtered

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
      <div className="centered-empty px-6 select-none">
        <EmptyState
          icon={Aperture}
          title={searchQuery || statusFilter !== 'all' ? "No matches found" : "Empty timeline"}
          description={searchQuery || statusFilter !== 'all' ? "Try adjusting your filters." : "Begin your production by scheduling the first scene."}
          action={{ label: 'Schedule First Shot', onClick: onAddShot }}
          variant="default"
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(dates || []).map((dateString) => {
        const dayShots = filteredGroupedShots[dateString]
        if (!dayShots?.length) return null

        const { sunrise, sunset } = getSunTimes(dateString)

        return (
          <div
            key={dateString}
            id={dateString}
            className="date-section scroll-mt-[180px]"
          >
            <TerminalCard
              header={formatDateWithDay(dateString)}
              headerRight={
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400/60">
                    <Sun size={14} strokeWidth={2} /> {sunrise}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary/60">
                    <Moon size={14} strokeWidth={2} /> {sunset}
                  </div>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  {dayShots.map((shot, idx) => {
                    let availableMinutes = undefined
                    if (idx > 0 && !searchQuery && statusFilter === 'all') {
                      const prevShot = dayShots[idx - 1]
                      const prevEndTime = calculateEndTime(prevShot.startTime, prevShot.duration)
                      availableMinutes = timeToMinutes(shot.startTime) - timeToMinutes(prevEndTime)
                    }

                    const status = getTimelineStatus(shot)
                    const barColor = status === 'done' ? 'bg-primary' : 'bg-muted-foreground/30'
                    const isChecklistOpen = expandedChecklist === shot.id

                    return (
                      <div key={shot.id}>
                        {shotLayout === 'timeline' && idx > 0 && !searchQuery && statusFilter === 'all' && (
                          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center lg:gap-4 my-4 px-2">
                            {dayShots[idx - 1].location && dayShots[idx - 1].location !== 'Location TBD' && shot.location && shot.location !== 'Location TBD' && (
                              <TravelIndicator
                                from={dayShots[idx - 1].location}
                                to={shot.location}
                                fromLat={dayShots[idx - 1].locationLat}
                                fromLng={dayShots[idx - 1].locationLng}
                                toLat={shot.locationLat}
                                toLng={shot.locationLng}
                                availableMinutes={availableMinutes}
                              />
                            )}
                            <GearTransition
                              prevShot={dayShots[idx - 1]}
                              nextShot={shot}
                              inventory={inventory}
                            />
                          </div>
                        )}

                        <div
                          className="group cursor-pointer border border-gray-300 bg-[#fafafa] dark:border-white/10 dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
                        >
                          <div className={shotLayout === 'list' ? "p-3" : "p-4"} onClick={() => onShotClick(shot)}>
                            <div className={shotLayout === 'list' ? "flex flex-col gap-2" : "flex flex-col gap-4"}>
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2 min-w-[70px] pt-1">
                                  <div className={`w-1 ${shotLayout === 'list' ? 'h-6' : 'h-10'} ${barColor}`} />
                                  <div className="text-xs">
                                    <div className="text-muted-foreground font-mono">{shot.startTime}</div>
                                    {shotLayout === 'timeline' && (
                                      <div className="text-muted-foreground font-mono">{calculateEndTime(shot.startTime, shot.duration)}</div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className={`${shotLayout === 'list' ? 'text-xs' : 'text-sm'} text-foreground font-medium truncate`}>{shot.title}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground  tracking-wider font-mono shrink-0">Sc {shot.sceneNumber}</span>
                                    <span className="text-border dark:text-white/10">|</span>
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate font-mono">
                                      <MapPin size={10} className="shrink-0" />
                                      <span className="truncate">{shot.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {shotLayout !== 'list' && (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-4">
                                    {(shot.equipmentIds || []).length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleToggleChecklist(shot.id)
                                        }}
                                        className={`cursor-pointer h-9 px-2 flex items-center gap-2 text-xs font-mono tracking-wider transition-all ${isChecklistOpen
                                          ? 'text-primary'
                                          : 'text-muted-foreground hover:text-foreground'
                                          }`}
                                      >
                                        <span>Checklist</span>
                                        {isChecklistOpen ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
                                      </button>
                                    )}

                                    {(shot.equipmentIds || []).length > 0 && (
                                      <div className="flex items-center gap-2 text-xs font-mono  tracking-wider text-primary">
                                        <Package size={18} strokeWidth={2.5} />
                                        <span>Gear {(shot.preparedEquipmentIds || []).length}/{(shot.equipmentIds || []).length}</span>
                                      </div>
                                    )}
                                    {(shot.equipmentIds || []).length === 0 && (
                                      <span className="text-xs font-mono text-muted-foreground tracking-wider">No gear for this shot</span>
                                    )}
                                  </div>

                                    <button
                                    onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id) }}
                                    className={`${shotLayout === 'list' ? 'w-7 h-7' : 'w-8 h-8'} flex items-center justify-center border transition-all ${shot.status === 'done'
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-transparent text-muted-foreground/50 border-gray-300 dark:border-white/10 hover:text-primary hover:border-primary/50 dark:hover:border-primary/50'
                                      }`}
                                  >
                                    {shot.status === 'done' ? <Check size={14} strokeWidth={3} /> : <Square size={14} strokeWidth={2} />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isChecklistOpen && (shot.equipmentIds || []).length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="pt-3 border-t border-gray-300 dark:border-white/10">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {shot.equipmentIds.map(eId => {
                                        const equip = inventory.find(e => e.id === eId)
                                        const isPrepared = shot.preparedEquipmentIds.includes(eId)
                                        return (
                                          <button
                                            key={eId}
                                            onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId) }}
                                            className={`flex items-center justify-between p-2.5 text-xs font-mono border text-left transition-all ${isPrepared
                                              ? 'bg-primary/10 border-primary/30 text-primary'
                                              : 'bg-[#f5f5f5] dark:bg-[#16181D] border-gray-300 dark:border-white/10 text-muted-foreground hover:border-primary/30 dark:hover:border-primary/30'
                                              }`}>
                                            <span className="truncate mr-2">{equip?.customName || equip?.name || 'Unknown Item'}</span>
                                            <div className={`w-4 h-4 flex items-center justify-center border ${isPrepared
                                              ? 'bg-primary border-primary text-primary-foreground'
                                              : 'border-gray-300 dark:border-white/10'
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
            </TerminalCard>
          </div>
        )
      })}
    </div>
  )
})

ShotsView.displayName = 'ShotsView'
