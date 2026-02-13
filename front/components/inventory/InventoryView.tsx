import React, { useEffect, useMemo } from 'react'
import { Package, Camera, Lightbulb, Speaker, Wrench } from 'lucide-react'
import { Equipment, Shot, InventoryFilters, Currency, InventoryLayout } from '@/types'
import { Card } from '@/components/ui/Card'
import { useProductionStore } from '@/hooks/useProductionStore'

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

const toPascalCase = (str: string) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getEquipmentDisplayInfo = (item: Equipment) => {
  const brand = item.brandName
  const model = item.modelName
  const custom = item.customName

  const title = item.name

  let subtitle = ''
  if (custom) {
    const identity = model || ''
    subtitle = brand ? `${brand} ${identity}`.trim() : identity
  } else {
    subtitle = brand || ''
  }

  return { title, subtitle: toPascalCase(subtitle) }
}

export const InventoryView: React.FC<InventoryViewProps> = React.memo(({
  inventory,
  shots,
  onEquipmentClick,
  filters,
  currency,
  layout = 'grid',
}) => {
  const { catalogCategories, fetchCatalogCategories } = useProductionStore()

  useEffect(() => {
    fetchCatalogCategories()
  }, [fetchCatalogCategories])

  const getCategoryDisplayName = (categoryIdOrName: string): string => {
    if (!catalogCategories || !Array.isArray(catalogCategories)) {
      console.log('catalogCategories not loaded yet:', catalogCategories)
      return categoryIdOrName
    }
    const match = catalogCategories.find(c => c.id === categoryIdOrName)
    if (!match && categoryIdOrName.length > 20) {
      console.log('No match found for category:', categoryIdOrName)
      console.log('Available categories:', catalogCategories.map(c => ({ id: c.id, name: c.name })))
    }
    return match?.name || categoryIdOrName
  }
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
      const displayName = getCategoryDisplayName(item.category)
      if (!groups[displayName]) {
        groups[displayName] = []
      }
      groups[displayName].push(item)
    })
    return groups
  }, [filteredInventory, catalogCategories])

  if (filteredInventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] w-full overflow-hidden px-6 select-none">
        <div className="w-14 h-14 bg-[#16181D] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05]">
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
                {items.map((item) => {
                  const { title, subtitle } = getEquipmentDisplayInfo(item)
                  return (
                  <div
                    key={item.id}
                    onClick={() => onEquipmentClick(item.id)}
                    className="group p-4 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white font-medium truncate">
                          {title}
                        </div>
                        {subtitle && (
                          <div className="mt-1 text-[10px] font-medium text-white/40 truncate">
                            {subtitle}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="block text-[10px] font-medium text-white/40 mb-1">
                          {item.isOwned ? 'Owned' : 'Rented'}
                        </span>
                        {!item.isOwned && (
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-xs text-white/40 font-medium">
                              {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-white/20">/{item.rentalFrequency || 'Day'}</span>
                          </div>
                        )}
                      </div>
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
                )})}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card title="Equipment">
          <div className="p-4 space-y-2">
            {filteredInventory.map((item) => {
              const { title, subtitle } = getEquipmentDisplayInfo(item)
              return (
              <div
                key={item.id}
                onClick={() => onEquipmentClick(item.id)}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{title}</div>
                  {subtitle && (
                    <div className="mt-1 text-[10px] font-medium text-white/40 truncate">
                      {subtitle}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[10px] font-medium text-white/40 mb-1">
                    {item.isOwned ? 'Owned' : 'Rented'}
                  </span>
                  {!item.isOwned && (
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xs text-white/40">
                        {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-white/20">/{item.rentalFrequency || 'Day'}</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </Card>
      )}
    </div>
  )
})

InventoryView.displayName = 'InventoryView'
