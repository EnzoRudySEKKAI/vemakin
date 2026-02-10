import React, { useState, useMemo } from 'react'
import { Package, ArrowDownRight, ArrowUpRight, ChevronDown, Boxes, Check } from 'lucide-react'
import { Shot, Equipment } from '@/types'
import { CATEGORY_ICONS } from '@/constants'
import { Text, IconContainer, Card, Button } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface GearTransitionProps {
  prevShot: Shot
  nextShot: Shot
  inventory: Equipment[]
}

export const GearTransition: React.FC<GearTransitionProps> = ({ prevShot, nextShot, inventory }) => {
  const [isOpen, setIsOpen] = useState(false)

  const gearDelta = useMemo(() => {
    const prevSet = new Set(prevShot.equipmentIds)
    const nextSet = new Set(nextShot.equipmentIds)

    const toDrop = prevShot.equipmentIds
      .filter(id => !nextSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item)

    const toAdd = nextShot.equipmentIds
      .filter(id => !prevSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item)

    return { toDrop, toAdd }
  }, [prevShot, nextShot, inventory])

  // Ensure GearTransition is always visible as requested by the user
  // if (gearDelta.toDrop.length === 0 && gearDelta.toAdd.length === 0) return null

  return (
    <div className={`
      relative animate-in fade-in slide-in-from-top-1 duration-500
      bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-[16px] shadow-sm
      transition-all duration-300 flex-1 lg:flex-1 overflow-hidden
      ${isOpen ? 'ring-2 ring-gray-900/5 dark:ring-white/10' : 'hover:border-gray-300 dark:hover:border-white/20'}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-6 py-3 px-6 transition-all active:scale-[0.98] group"
      >
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-3 shrink-0">
          <IconContainer
            icon={Boxes}
            size="md"
            variant="default"
          />
          <div className="flex flex-col items-start leading-none">
            <Text variant="caption">Shift Gear</Text>
          </div>
        </div>

        {/* Middle: Spacer */}
        <div className="flex-1" />

        {/* Right: Item Count & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <Text variant="body">
            {gearDelta.toDrop.length + gearDelta.toAdd.length > 0
              ? `${gearDelta.toDrop.length + gearDelta.toAdd.length} Items`
              : 'Full Kit'}
          </Text>
          <ChevronDown size={14} strokeWidth={2.5} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      <div className={`
        grid transition-all duration-300 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="overflow-hidden">
          <div className="p-5 pt-2 border-t border-gray-100 dark:border-white/5 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-900 dark:text-white pointer-events-none">
              <Package size={80} strokeWidth={2.5} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {/* Stuff to Drop */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <IconContainer icon={ArrowDownRight} size="sm" variant="danger" />
                  <Text variant="caption" color="danger">Drop</Text>
                </div>

                <div className="space-y-1.5">
                  {gearDelta.toDrop.length > 0 ? gearDelta.toDrop.map(item => {
                    const Icon = (CATEGORY_ICONS as any)[item.category] || Package
                    return (
                      <Card key={item.id} variant="flat" size="sm" className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3 min-w-0">
                          <IconContainer icon={Icon} size="sm" variant="default" />
                          <div className="min-w-0">
                            <Text variant="caption" className="truncate leading-none mb-1">{item.customName || item.name}</Text>
                            <Text variant="label" color="muted">{item.category}</Text>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-red-300 dark:bg-red-500/50" />
                      </Card>
                    )
                  }) : (
                    <Text variant="caption" color="muted" className="text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">Everything Stays</Text>
                  )}
                </div>
              </div>

              {/* Stuff to Add */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <IconContainer icon={ArrowUpRight} size="sm" variant="success" />
                  <Text variant="caption" color="success">Add</Text>
                </div>

                <div className="space-y-1.5">
                  {gearDelta.toAdd.length > 0 ? gearDelta.toAdd.map(item => {
                    const Icon = (CATEGORY_ICONS as any)[item.category] || Package
                    return (
                      <Card key={item.id} variant="flat" size="sm" className="flex items-center justify-between group/item border-emerald-100 dark:border-emerald-500/20">
                        <div className="flex items-center gap-3 min-w-0">
                          <IconContainer icon={Icon} size="sm" variant="success" />
                          <div className="min-w-0">
                            <Text variant="caption" className="truncate leading-none mb-1">{item.customName || item.name}</Text>
                            <Text variant="label" color="success">{item.category}</Text>
                          </div>
                        </div>
                        <div className="p-1 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-emerald-900 rounded-lg group-hover/item:scale-110 transition-transform">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      </Card>
                    )
                  }) : (
                    <Text variant="caption" color="muted" className="text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">No New Gear Needed</Text>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
