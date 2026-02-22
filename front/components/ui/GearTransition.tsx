import React, { useState, useMemo } from 'react'
import { Package, ArrowDownRight, ArrowUpRight, ChevronDown, Boxes, Check } from 'lucide-react'
import { Shot, Equipment } from '@/types'
import { CATEGORY_ICONS } from '@/constants'
import { Text, IconContainer, Card } from '@/components/atoms'

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

  return (
    <div className="relative animate-in fade-in slide-in-from-top-1 duration-500 flex-1 lg:flex-1 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-4 py-2 group cursor-pointer"
      >
        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20 transition-colors" />
        
        <div className="flex items-center gap-2 text-[10px] font-bold  tracking-widest text-gray-400 dark:text-white/40 group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors">
          <Boxes size={12} />
          Shift Gear
          <span className="opacity-60 ml-1">
            ({totalItems > 0 ? `${totalItems} Items` : 'Full Kit'})
          </span>
          <ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 group-hover:bg-gray-300 dark:group-hover:bg-white/20 transition-colors" />
      </button>

      {/* Expanded Content */}
      <div className={`
        grid transition-all duration-300 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="overflow-hidden">
          <div className="bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10 rounded-[16px] shadow-sm p-5 relative">
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
