
import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Equipment, Shot, InventoryFilters, Currency, InventoryLayout } from '../../types.ts';
import { InventoryCard } from './InventoryCard.tsx';
import { InventoryListItem } from './InventoryListItem.tsx';
import { pageVariants } from '../../utils/animations.ts';

interface InventoryViewProps {
 inventory: Equipment[];
 shots: Shot[];
 onEquipmentClick: (id: string) => void;
 filters: InventoryFilters;
 currency: Currency;
 layout?: InventoryLayout;
 onAddEquipment: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = React.memo(({
 inventory,
 shots,
 onEquipmentClick,
 filters,
 currency,
 layout = 'grid',
 onAddEquipment
}) => {
 const assignedEquipmentIds = useMemo(() => {
  const ids = new Set<string>();
  shots.forEach(shot => {
   shot.equipmentIds.forEach(id => ids.add(id));
  });
  return ids;
 }, [shots]);

 const filteredInventory = useMemo(() => {
  let source = inventory;

  return source.filter(item => {
   if (filters.query) {
    const q = filters.query.toLowerCase();
    const specsMatch = Object.values(item.specs).some(val =>
     typeof val === 'string' && val.toLowerCase().includes(q)
    );
    const nameMatch = item.name.toLowerCase().includes(q);
    const customNameMatch = item.customName?.toLowerCase().includes(q);
    const categoryMatch = item.category.toLowerCase().includes(q);
    if (!nameMatch && !categoryMatch && !specsMatch && !customNameMatch) return false;
   }
   if (filters.category !== 'All' && item.category !== filters.category) return false;
   if (filters.ownership === 'owned' && !item.isOwned) return false;
   if (filters.ownership === 'rented' && item.isOwned) return false;

   return true;
  });
 }, [inventory, filters, assignedEquipmentIds]);

 return (
  <div className="space-y-6">
   {filteredInventory.length > 0 ? (
    <div
     className={layout === 'grid' ?"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative":"flex flex-col gap-1"}
    >
     {filteredInventory.map(item => (
      layout === 'grid' ? (
       <InventoryCard
        key={item.id}
        item={item}
        isAssigned={assignedEquipmentIds.has(item.id)}
        currency={currency}
        onClick={() => onEquipmentClick(item.id)}
       />
      ) : (
       <InventoryListItem
        key={item.id}
        item={item}
        isAssigned={assignedEquipmentIds.has(item.id)}
        currency={currency}
        onClick={() => onEquipmentClick(item.id)}
       />
      )
     ))}
    </div>
   ) : (
    <div className="col-span-full py-20 flex flex-col items-center justify-center select-none">
     <div className="w-20 h-20 bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[32px] flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6 shadow-sm">
      <Package size={40} strokeWidth={1.5} />
     </div>
     <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">Empty repository</h3>
     <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-2">No items match your criteria in Your Inventory</p>
    </div>
   )}
  </div>
 );
});

InventoryView.displayName = 'InventoryView';
