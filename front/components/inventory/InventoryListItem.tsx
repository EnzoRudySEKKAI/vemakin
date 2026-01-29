import React from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Equipment, Currency } from '../../types.ts';
import { CATEGORY_ICONS } from '../../constants.ts';
import { HoverCard } from '../ui/HoverCard.tsx';

interface InventoryListItemProps {
  item: Equipment;
  isAssigned: boolean;
  currency: Currency;
  onClick?: () => void;
}

export const InventoryListItem: React.FC<InventoryListItemProps> = ({
  item,
  isAssigned,
  currency,
  onClick
}) => {
  const Icon = (CATEGORY_ICONS as any)[item.category] || Package;
  const mainTitle = item.customName || item.name;

  return (
    <HoverCard
      onClick={onClick}
      className="px-6 py-4 flex items-center rounded-[24px] cursor-pointer bg-white/80 dark:bg-[#1A1A1D]/80"
      blobColor="from-blue-400 to-indigo-500 dark:from-indigo-400 dark:to-[#4E47DD]"
      enableHoverScale={true}
    >
      <div className="w-full flex items-center justify-between gap-8">
        {/* Left: Icon + Title/Subtitle (Expanded & Wide) */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-indigo-400 shrink-0 border border-gray-100 dark:border-white/5">
            <Icon size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
              {mainTitle}
            </h3>
            {item.customName && (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                {item.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Group: Badges (Pushed to the edge) */}
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          {/* Middle-Left: Category Badge */}
          <div className="hidden md:flex items-center">
            <span className="w-28 flex justify-center px-3 py-1.5 bg-gray-100/50 dark:bg-white/5 backdrop-blur-md text-gray-900 dark:text-white text-xs font-bold rounded-xl capitalize tracking-wider border border-gray-200/50 dark:border-white/10 whitespace-nowrap">
              {item.category}
            </span>
          </div>

          {/* Middle-Right: Status Badge */}
          <div className="hidden sm:flex items-center">
            <span className={`w-28 flex justify-center px-3 py-1.5 rounded-xl text-xs font-bold capitalize tracking-wider border whitespace-nowrap ${item.isOwned
              ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100/50 dark:border-indigo-500/20 text-[#3762E3] dark:text-indigo-300'
              : 'bg-orange-50/50 dark:bg-orange-500/10 border-orange-100/50 dark:border-orange-500/20 text-orange-600 dark:text-orange-300'
              }`}>
              {item.isOwned ? 'Owned' : 'Rent'}
            </span>
          </div>
        </div>
      </div>
    </HoverCard>
  );
};
