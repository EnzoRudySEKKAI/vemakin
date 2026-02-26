import React from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { Equipment, Currency } from '@/types'
import { CATEGORY_ICONS } from '@/constants'
import { Text, IconContainer } from '@/components/atoms'

interface InventoryListItemProps {
  item: Equipment
  isAssigned: boolean
  currency: Currency
  onClick?: () => void
}

export const InventoryListItem: React.FC<InventoryListItemProps> = ({
  item,
  isAssigned,
  currency,
  onClick
}) => {
  const Icon = (CATEGORY_ICONS as any)[item.category] || Package
  const mainTitle = item.customName || item.name
  
  // Build subtitle from brand and model
  const subtitleParts = []
  if (item.brandName) subtitleParts.push(item.brandName)
  if (item.modelName) subtitleParts.push(item.modelName)
  if (subtitleParts.length === 0 && item.customName) subtitleParts.push(item.name)
  const subTitle = subtitleParts.join(' ')

  return (
    <div
      onClick={onClick}
      className="px-6 py-4 flex items-center rounded-[24px] cursor-pointer bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/10 transition-all hover:shadow-md"
    >
      <div className="w-full flex items-center justify-between gap-8">
        {/* Left: Icon + Title/Subtitle (Expanded & Wide) */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <IconContainer
            icon={Icon}
            size="md"
            variant="default"
          />
          <div className="min-w-0 flex flex-col justify-center">
            <Text variant="h3">{mainTitle}</Text>
            {subTitle && (
              <Text variant="caption" color="muted" className="mt-0.5">{subTitle}</Text>
            )}
          </div>
        </div>

        {/* Right Group: Badges (Pushed to the edge) */}
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          {/* Middle-Left: Category Badge */}
          <div className="hidden md:flex items-center">
            <span className="w-28 flex justify-center px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 whitespace-nowrap">
              {item.category}
            </span>
          </div>

          {/* Middle-Right: Status Badge */}
          <div className="hidden sm:flex items-center">
            <span className={`w-28 flex justify-center px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap ${item.isOwned
              ? 'bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary dark:text-primary/70'
              : 'bg-orange-50/50 dark:bg-orange-500/10 border-orange-100/50 dark:border-orange-500/20 text-orange-600 dark:text-orange-300'
              }`}>
              {item.isOwned ? 'Owned' : 'Rent'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
