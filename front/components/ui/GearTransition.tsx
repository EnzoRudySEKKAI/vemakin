import React, { useState, useMemo } from 'react'
import { Package, ArrowDownRight, ArrowUpRight, ChevronDown, Boxes, Check } from 'lucide-react'
import { Shot, Equipment } from '@/types'
import { CATEGORY_ICONS } from '@/constants'
import { Text, IconContainer } from '@/components/atoms'
import { TerminalCard } from '@/components/ui/TerminalCard'

interface GearTransitionProps {
  prevShot: Shot
  nextShot: Shot
  inventory: Equipment[]
}

export const GearTransition: React.FC<GearTransitionProps> = ({ prevShot, nextShot, inventory }) => {
  const [isOpen, setIsOpen] = useState(false)

  const gearDelta = useMemo(() => {
    const prevIds = prevShot.equipmentIds || []
    const nextIds = nextShot.equipmentIds || []
    const prevSet = new Set(prevIds)
    const nextSet = new Set(nextIds)

    const toDrop = prevIds
      .filter(id => !nextSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item)

    const toAdd = nextIds
      .filter(id => !prevSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item)

    return { toDrop, toAdd }
  }, [prevShot, nextShot, inventory])

  const totalItems = gearDelta.toDrop.length + gearDelta.toAdd.length

  // Hide component entirely if no gear changes
  if (totalItems === 0) {
    return null
  }

  const hasDrop = gearDelta.toDrop.length > 0
  const hasAdd = gearDelta.toAdd.length > 0

  return (
    <div className="relative animate-in fade-in slide-in-from-top-1 duration-500 flex-1 lg:flex-1 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-4 py-2 group cursor-pointer"
      >
        <div className="h-px flex-1 bg-gray-300 dark:bg-white/10 group-hover:bg-gray-400 dark:group-hover:bg-white/20 transition-colors" />
        
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          <Boxes size={12} />
          SHIFT GEAR
          <span className="opacity-60 ml-1">
            {totalItems} ITEMS
          </span>
          <ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className="h-px flex-1 bg-gray-300 dark:bg-white/10 group-hover:bg-gray-400 dark:group-hover:bg-white/20 transition-colors" />
      </button>

      {/* Expanded Content */}
      <div className={`
        grid transition-all duration-300 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="overflow-hidden">
          <TerminalCard contentClassName="p-2">
            <div className={`grid gap-6 ${hasDrop && hasAdd ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Stuff to Drop */}
              {hasDrop && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1">
                    <IconContainer icon={ArrowDownRight} size="sm" variant="danger" />
                    <span className="font-mono text-xs tracking-widest text-destructive">Drop</span>
                  </div>

                  <div className="space-y-1.5">
                    {gearDelta.toDrop.map(item => {
                      const Icon = (CATEGORY_ICONS as any)[item.category] || Package
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-border bg-transparent group/item">
                          <div className="flex items-center gap-3 min-w-0">
                            <IconContainer icon={Icon} size="sm" variant="default" />
                            <div className="min-w-0">
                              <Text variant="caption" className="truncate leading-none mb-1">{item.customName || item.name}</Text>
                              <Text variant="label" color="muted"> {item.category}</Text>
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-red-300 dark:bg-red-500/50" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Stuff to Add */}
              {hasAdd && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1">
                    <IconContainer icon={ArrowUpRight} size="sm" variant="success" />
                    <span className="font-mono text-xs tracking-widest text-emerald-500">Add</span>
                  </div>

                  <div className="space-y-1.5">
                    {gearDelta.toAdd.map(item => {
                      const Icon = (CATEGORY_ICONS as any)[item.category] || Package
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-emerald-100 dark:border-emerald-500/20 bg-transparent group/item">
                          <div className="flex items-center gap-3 min-w-0">
                            <IconContainer icon={Icon} size="sm" variant="success" />
                            <div className="min-w-0">
                              <Text variant="caption" className="truncate leading-none mb-1">{item.customName || item.name}</Text>
                              <Text variant="label" color="success"> {item.category}</Text>
                            </div>
                          </div>
                          <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </TerminalCard>
        </div>
      </div>
    </div>
  )
}