import React from 'react'
import { Equipment } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { Select } from '../../atoms/Select'

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
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SearchBar
        view="inventory"
        value={searchQuery}
        onChange={onSearchChange}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Select
            size="sm"
            value={ownershipFilter}
            onChange={(e) => onOwnershipChange(e.target.value as 'all' | 'owned' | 'rented')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'owned', label: 'Own' },
              { value: 'rented', label: 'Rent' }
            ]}
            fullWidth={true}
          />
        </div>

        <div className="flex-1">
          <Select
            size="sm"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={INVENTORY_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            fullWidth={true}
          />
        </div>

        <div>
          <LayoutToggle
            value={layout}
            onChange={onLayoutChange}
          />
        </div>
      </div>
    </div>
  )
}

export default InventoryFilterBar
