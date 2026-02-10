import React, { useMemo } from 'react'
import { Package, Camera, Lightbulb, Speaker, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'
import { Equipment, Shot, InventoryFilters, Currency, InventoryLayout } from '@/types'
import { Card } from '@/components/ui/Card'

interface InventoryViewProps {
  inventory: Equipment[]
  shots: Shot[]
  onEquipmentClick: (id: string) => void
  filters: InventoryFilters
  currency: Currency
  layout?: InventoryLayout
  onAddEquipment: () => void
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Camera': Camera,
    'Lens': Package,
    'Light': Lightbulb,
    'Audio': Speaker,
    'Grip': Wrench,
  }
  return icons[category] || Package
}

export const InventoryView: React.FC<InventoryViewProps> = React.memo(({
  inventory,
  shots,
  onEquipmentClick,
  filters,
  currency,
  layout = 'grid',
}) => {
  const assignedEquipmentIds = useMemo(() => {
    const ids = new Set<string>()
    shots.forEach(shot => {
      shot.equipmentIds.forEach(id => ids.add(id))
    })
    return ids
  }, [shots])

  const filteredInventory = useMemo(() => {
    let source = inventory

    return source.filter(item => {
      if (filters.query) {
        const q = filters.query.toLowerCase()
        const specsMatch = Object.values(item.specs).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(q)
        )
        const nameMatch = item.name.toLowerCase().includes(q)
        const customNameMatch = item.customName?.toLowerCase().includes(q)
        const categoryMatch = item.category.toLowerCase().includes(q)
        if (!nameMatch && !categoryMatch && !specsMatch && !customNameMatch) return false
      }
      if (filters.category !== 'All' && item.category !== filters.category) return false
      if (filters.ownership === 'owned' && !item.isOwned) return false
      if (filters.ownership === 'rented' && item.isOwned) return false

      return true
    })
  }, [inventory, filters, assignedEquipmentIds])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Equipment[]> = {}
    filteredInventory.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredInventory])

  if (filteredInventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] w-full overflow-hidden px-6 select-none">
        <div className="w-14 h-14 bg-[#0D0D0F] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05]">
          <Package size={24} className="text-white/40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-white mb-2">Empty Repository</h2>
          <p className="text-white/30 text-sm">No items match your criteria</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {layout === 'grid' ? (
        (Object.entries(groupedByCategory) as [string, Equipment[]][]).map(([category, items]) => (
          <Card
            key={category}
            title={
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getCategoryIcon(category)
                  return <Icon size={16} className="text-white/40" />
                })()}
                <span>{category}</span>
              </div>
            }
          >
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onEquipmentClick(item.id)}
                    className="group p-4 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white font-medium truncate">
                          {item.customName || item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-white/40">
                            {item.isOwned ? 'Owned' : 'Rented'}
                          </span>
                          {item.customName && (
                            <div className="text-[10px] text-white/20 truncate">{item.name}</div>
                          )}
                        </div>
                      </div>

                      {!item.isOwned && (
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-white/40 font-medium">
                            {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-white/20">/{item.rentalFrequency || 'Day'}</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/[0.05]">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {(() => {
                          const specs = Object.entries(item.specs).slice(0, 4)
                          const slots = [...specs]
                          while (slots.length < 4) {
                            slots.push(['—', '—'])
                          }
                          return slots.map(([key, val], idx) => (
                            <div key={`${item.id}-spec-${idx}`} className="flex flex-col min-w-0">
                              <span className="text-[9px] text-white/20 uppercase font-bold tracking-wider truncate mb-0.5">
                                {key === '—' ? '—' : key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className={`text-xs truncate ${key === '—' ? 'text-white/5' : 'text-white/50'}`} title={String(val)}>
                                {String(val)}
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card title="Equipment">
          <div className="p-4 space-y-2">
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                onClick={() => onEquipmentClick(item.id)}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#0D0D0F] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{item.customName || item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/40">
                      {item.isOwned ? 'Owned' : 'Rented'}
                    </span>
                    <div className="text-[10px] text-white/20 truncate">{item.category}</div>
                  </div>
                </div>

                {!item.isOwned && (
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white/40">
                      {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/20">/{item.rentalFrequency || 'Day'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
})

InventoryView.displayName = 'InventoryView'
