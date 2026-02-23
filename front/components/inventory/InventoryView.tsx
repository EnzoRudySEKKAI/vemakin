import React, { useMemo } from 'react'
import { Package, Camera, Lightbulb, Speaker, Wrench } from 'lucide-react'
import { Equipment, Shot, InventoryFilters, Currency, InventoryLayout } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { useCatalogCategories } from '@/hooks/useApi'

interface InventoryViewProps {
  inventory: Equipment[]
  shots: Shot[]
  onEquipmentClick: (id: string) => void
  filters: InventoryFilters
  currency: Currency
  layout?: InventoryLayout
  onAddEquipment: () => void
  gridColumns?: 2 | 3
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

  const title = custom || item.name

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
  gridColumns = 2
}) => {
  const { data: catalogCategories = [] } = useCatalogCategories()

  const getCategoryDisplayName = (categoryIdOrName: string): string => {
    if (!catalogCategories || !Array.isArray(catalogCategories)) {
      return categoryIdOrName
    }
    const match = catalogCategories.find((c: { id: string; name: string }) => c.id === categoryIdOrName)
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
        <div className="w-14 h-14 border border-white/10 bg-[#0a0a0a]/40 flex items-center justify-center mb-6">
          <Package size={24} className="text-muted-foreground" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-foreground mb-2 font-mono  tracking-wider">Empty repository</h2>
          <p className="text-muted-foreground text-sm font-mono">No items match your criteria</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {layout === 'grid' ? (
        (Object.entries(groupedByCategory) as [string, Equipment[]][]).map(([category, items]) => (
          <TerminalCard
            key={category}
            header={
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getCategoryIcon(category)
                  return <Icon size={16} className="text-muted-foreground" />
                })()}
                <span>{category}</span>
              </div>
            }
          >
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${gridColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              {items.map((item) => {
                const { title, subtitle } = getEquipmentDisplayInfo(item)
                return (
                <div
                  key={item.id}
                  onClick={() => onEquipmentClick(item.id)}
                  className="group p-4 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-foreground font-medium truncate">
                        {title}
                      </div>
                      {subtitle && (
                        <div className="mt-1 text-[10px] font-mono  tracking-wider text-muted-foreground truncate">
                          {subtitle}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="block text-[10px] font-mono  tracking-wider text-muted-foreground mb-1">
                        {item.isOwned ? 'Owned' : 'Rented'}
                      </span>
                      {!item.isOwned && (
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">/{item.rentalFrequency || 'Day'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {(() => {
                        const specs = Object.entries(item.specs).slice(0, 4)
                        const slots = [...specs]
                        while (slots.length < 4) {
                          slots.push(['—', '—'])
                        }
                        return slots.map(([key, val], idx) => (
                          <div key={`${item.id}-spec-${idx}`} className="flex flex-col min-w-0">
                            <span className="text-[9px] text-muted-foreground  font-mono tracking-wider truncate mb-0.5">
                              {key === '—' ? '—' : key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`text-xs font-mono truncate ${key === '—' ? 'text-border' : 'text-muted-foreground'}`} title={String(val)}>
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
          </TerminalCard>
        ))
      ) : (
        <TerminalCard header="Equipment">
          <div className="space-y-2">
            {filteredInventory.map((item) => {
              const { title, subtitle } = getEquipmentDisplayInfo(item)
              return (
              <div
                key={item.id}
                onClick={() => onEquipmentClick(item.id)}
                className="flex items-center gap-4 p-3 border border-gray-300 dark:border-white/10 bg-[#fafafa] dark:bg-[#0a0a0a]/40 hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">{title}</div>
                  {subtitle && (
                    <div className="mt-1 text-[10px] font-mono  tracking-wider text-muted-foreground truncate">
                      {subtitle}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[10px] font-mono  tracking-wider text-muted-foreground mb-1">
                    {item.isOwned ? 'Owned' : 'Rented'}
                  </span>
                  {!item.isOwned && (
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">/{item.rentalFrequency || 'Day'}</span>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </TerminalCard>
      )}
    </div>
  )
})

InventoryView.displayName = 'InventoryView'
