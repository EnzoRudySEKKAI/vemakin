import React from 'react'
import { Equipment } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { SegmentControl, LayoutToggle } from '../../molecules/SegmentControl'
import { FilterPills } from '../../molecules/FilterPills'
import { MetricsGroup } from '../../molecules/MetricBadge'

const INVENTORY_CATEGORIES = ['All', 'Camera', 'Lens', 'Light', 'Filter', 'Audio', 'Tripod', 'Stabilizer', 'Grip', 'Monitoring', 'Wireless', 'Drone', 'Props', 'Other']

interface InventoryFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  ownershipFilter: 'all' | 'owned' | 'rented'
  onOwnershipChange: (ownership: 'all' | 'owned' | 'rented') => void
  layout: 'grid' | 'list'
  onLayoutChange: (layout: 'grid' | 'list') => void
  inventory: Equipment[]
  className?: string
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  ownershipFilter,
  onOwnershipChange,
  layout,
  onLayoutChange,
  inventory,
  className = ''
}) => {
  const ownedCount = inventory.filter(i => i.isOwned).length
  const rentedCount = inventory.filter(i => !i.isOwned).length

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Search Bar */}
      <SearchBar
        view="inventory"
        value={searchQuery}
        onChange={onSearchChange}
      />

      {/* Filters Row */}
      <div className="h-[48px] flex items-center w-full gap-4">
        <div className="flex-1 min-w-0">
          <FilterPills
            options={INVENTORY_CATEGORIES}
            value={categoryFilter}
            onChange={onCategoryChange}
            scrollKey="inventory"
          />
        </div>

        {/* Metrics - Pinned Right */}
        <MetricsGroup
          metrics={[
            { label: 'Total Gear', value: inventory.length },
            { label: 'Owned', value: ownedCount, color: 'primary' },
            { label: 'Rented', value: rentedCount, color: 'warning' }
          ]}
          className="hidden sm:flex shrink-0"
        />
      </div>

      {/* Secondary Row */}
      <div className="h-[48px] flex items-center gap-2 w-full">
        <div className="flex w-full gap-2">
          <div className="flex-1 cf-segment-container">
            <SegmentControl
              options={[
                { value: 'all', label: 'All' },
                { value: 'owned', label: 'Own' },
                { value: 'rented', label: 'Rent' }
              ]}
              value={ownershipFilter}
              onChange={(v) => onOwnershipChange(v as any)}
              variant="fluid"
            />
          </div>

          <LayoutToggle
            value={layout}
            onChange={onLayoutChange}
          />
        </div>
      </div>
    </div>
  )
}
