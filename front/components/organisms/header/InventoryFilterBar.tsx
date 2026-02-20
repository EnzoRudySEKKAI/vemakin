import React from 'react'
import { Equipment } from '../../types'
import { SearchBar } from '../../molecules/SearchBar'
import { LayoutToggle } from '../../molecules/SegmentControl'
import { FilterDropdown } from '../../molecules/FilterDropdown'

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

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-2">
            Ownership
          </div>
          <FilterDropdown
            label="All"
            value={ownershipFilter}
            onChange={(v) => onOwnershipChange(v as 'all' | 'owned' | 'rented')}
            options={[
              { value: 'all', label: 'All' },
              { value: 'owned', label: 'Own' },
              { value: 'rented', label: 'Rent' }
            ]}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-2">
            Category
          </div>
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            options={INVENTORY_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            maxHeight="280px"
          />
        </div>

        <div>
          <div className="text-xs tracking-wider text-gray-500 dark:text-white/40 mb-1 px-2">
            View
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

export default InventoryFilterBar
