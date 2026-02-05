import React from 'react'
import { Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { Equipment, Currency } from '@/types'
import { HoverCard } from '@/components/ui/HoverCard'
import { CATEGORY_ICONS } from '@/constants'
import { Text, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface InventoryCardProps {
  item: Equipment
  isAssigned: boolean
  currency: Currency
  onClick?: () => void
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  isAssigned,
  currency,
  onClick
}) => {
  const Icon = (CATEGORY_ICONS as any)[item.category] || Package

  const mainTitle = item.customName || item.name
  const subTitle = item.name

  return (
    <HoverCard
      onClick={onClick}
      className="p-5 flex flex-col h-full rounded-[28px] bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm hover:shadow-lg"
      blobColor="from-blue-400 to-indigo-500 dark:from-indigo-400 dark:to-[#4E47DD]"
      enableHoverScale={true}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <IconContainer
            icon={Icon}
            size="md"
            variant="default"
          />
          <div className="min-w-0">
            <Text variant="h3" className="leading-tight truncate">{mainTitle}</Text>
            {item.customName && (
              <Text variant="caption" color="muted" className="mt-0.5 truncate">{subTitle}</Text>
            )}
          </div>
        </div>

        {/* Top Right Price (if rented) */}
        {!item.isOwned && (
          <div className="shrink-0 text-right">
            <Text variant="h3" className="leading-none">{currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}</Text>
            <Text variant="label" color="muted" className="mt-1">/ {item.rentalFrequency || 'Day'}</Text>
          </div>
        )}
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="w-28 flex justify-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100/50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/10">
          {item.category}
        </span>
        <span className={`w-28 flex justify-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${item.isOwned
          ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20 text-[#3762E3] dark:text-indigo-300'
          : 'bg-orange-50/50 dark:bg-orange-500/10 border-orange-100/50 dark:border-orange-500/20 text-orange-600 dark:text-orange-300'
          }`}>
          {item.isOwned ? 'Owned' : 'Rented'}
        </span>
      </div>

      {/* Specs Grid */}
      <div className="mt-auto grid grid-cols-2 gap-2 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/40 dark:border-white/10">
        {Object.entries(item.specs).slice(0, 4).map(([key, val]) => (
          <div key={key} className="flex flex-col min-w-0 overflow-hidden">
            <Text variant="label" color="muted" className="leading-none mb-1 truncate">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            <Text variant="body" className="truncate" title={String(val)}>{val}</Text>
          </div>
        ))}
        {Object.entries(item.specs).length < 4 && Array(4 - Object.entries(item.specs).length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className="flex flex-col">
            <span className="text-transparent text-xs leading-none mb-1">—</span>
            <span className="text-gray-200 dark:text-gray-700 text-sm font-medium">—</span>
          </div>
        ))}
      </div>
    </HoverCard>
  )
}
