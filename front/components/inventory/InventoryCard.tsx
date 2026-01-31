import React from 'react';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Equipment, Currency } from '../../types.ts';
import { HoverCard } from '../ui/HoverCard.tsx';
import { CATEGORY_ICONS } from '../../constants.ts';

interface InventoryCardProps {
    item: Equipment;
    isAssigned: boolean;
    currency: Currency;
    onClick?: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
    item,
    isAssigned,
    currency,
    onClick
}) => {
    const Icon = (CATEGORY_ICONS as any)[item.category] || Package;

    const mainTitle = item.customName || item.name;
    const subTitle = item.name;

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
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-indigo-400 shrink-0 border border-gray-100 dark:border-white/5">
                        <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-semibold leading-tight truncate text-gray-900 dark:text-white">
                            {mainTitle}
                        </h3>
                        {item.customName && (
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                {subTitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Top Right Price (if rented) */}
                {!item.isOwned && (
                    <div className="shrink-0 text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-none">
                            {currency.symbol}{(item.rentalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1">
                            / {item.rentalFrequency || 'Day'}
                        </p>
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
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 leading-none mb-1 truncate">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate" title={String(val)}>
                            {val}
                        </span>
                    </div>
                ))}
                {Object.entries(item.specs).length < 4 && Array(4 - Object.entries(item.specs).length).fill(0).map((_, i) => (
                    <div key={`empty-${i}`} className="flex flex-col">
                        <span className="text-transparent text-[10px] leading-none mb-1">—</span>
                        <span className="text-gray-200 dark:text-gray-700 text-sm font-medium">—</span>
                    </div>
                ))}
            </div>
        </HoverCard>
    );
};
