import React, { useMemo } from 'react'
import { Package } from 'lucide-react'
import { Equipment, Shot, InventoryFilters, Currency, InventoryLayout } from '@/types'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { useCatalogCategories } from '@/hooks/useApi'
import { useViewFilters } from '@/hooks/useViewFilters'
import { CardItem } from '@/components/molecules/CardItem'
import { CardGrid } from '@/components/molecules/CardGrid'
import { EmptyState } from '@/components/molecules/EmptyState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CategoryIcon, getCategoryIcon } from '@/components/atoms/CategoryIcon'

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

  const { filteredData } = useViewFilters({
    data: inventory,
    initialFilters: {
      query: filters.query,
      category: filters.category,
    }
  })

  const getCategoryDisplayName = (categoryIdOrName: string): string => {
    if (!catalogCategories || !Array.isArray(catalogCategories)) {
      return categoryIdOrName
    }
    const match = catalogCategories.find((c: { id: string; name: string }) => c.id === categoryIdOrName)
    return match?.name || categoryIdOrName
  }

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Equipment[]> = {}
    filteredData.forEach(item => {
      const displayName = getCategoryDisplayName(item.category)
      if (!groups[displayName]) {
        groups[displayName] = []
      }
      groups[displayName].push(item)
    })
    return groups
  }, [filteredData, catalogCategories])

  if (filteredData.length === 0) {
    return (
      <div className="centered-empty px-6 select-none">
        <EmptyState
          icon={Package}
          title="Empty repository"
          description="No items match your criteria"
          variant="default"
          size="lg"
        />
      </div>
    )
  }

  const renderEquipmentCard = (item: Equipment) => {
    const { title, subtitle } = getEquipmentDisplayInfo(item)
    const CategoryIconComponent = getCategoryIcon(item.category)

    return (
      <CardItem onClick={() => onEquipmentClick(item.id)}>
        <CardItem.Header>
          <CardItem.Icon icon={CategoryIconComponent} />
          <StatusBadge variant="ownership" value={item.isOwned ? 'owned' : 'rented'} />
        </CardItem.Header>
        
        <CardItem.Content>
          <CardItem.Title>{title}</CardItem.Title>
          {subtitle && <CardItem.Subtitle>{subtitle}</CardItem.Subtitle>}
        </CardItem.Content>
        
        <CardItem.Footer>
          <div className="grid grid-cols-2 gap-2 w-full">
            {Object.entries(item.specs).slice(0, 4).map(([key, val], idx) => (
              <div key={`${item.id}-spec-${idx}`} className="min-w-0">
                <span className="text-[9px] text-muted-foreground font-mono tracking-wider truncate block">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-xs font-mono truncate block">
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </CardItem.Footer>
      </CardItem>
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
                <CategoryIcon category={category} />
                <span>{category}</span>
              </div>
            }
          >
            <CardGrid
              items={items}
              columns={gridColumns as 1 | 2 | 3 | 4}
              keyExtractor={(item) => item.id}
            >
              {(item) => renderEquipmentCard(item)}
            </CardGrid>
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
                  <CardItem.Title>{title}</CardItem.Title>
                  {subtitle && <CardItem.Subtitle>{subtitle}</CardItem.Subtitle>}
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge variant="ownership" value={item.isOwned ? 'owned' : 'rented'} />
                  {!item.isOwned && (
                    <div className="flex items-baseline justify-end gap-1 mt-1">
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
