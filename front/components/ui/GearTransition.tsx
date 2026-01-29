
import React, { useState, useMemo } from 'react';
import { Package, ArrowDownRight, ArrowUpRight, ChevronDown, Boxes, Check } from 'lucide-react';
import { Shot, Equipment } from '../../types.ts';
import { CATEGORY_ICONS } from '../../constants.ts';

interface GearTransitionProps {
  prevShot: Shot;
  nextShot: Shot;
  inventory: Equipment[];
}

export const GearTransition: React.FC<GearTransitionProps> = ({ prevShot, nextShot, inventory }) => {
  const [isOpen, setIsOpen] = useState(false);

  const gearDelta = useMemo(() => {
    const prevSet = new Set(prevShot.equipmentIds);
    const nextSet = new Set(nextShot.equipmentIds);

    const toDrop = prevShot.equipmentIds
      .filter(id => !nextSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item);

    const toAdd = nextShot.equipmentIds
      .filter(id => !prevSet.has(id))
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is Equipment => !!item);

    return { toDrop, toAdd };
  }, [prevShot, nextShot, inventory]);

  if (gearDelta.toDrop.length === 0 && gearDelta.toAdd.length === 0) return null;

  return (
    <div className={`
      relative animate-in fade-in slide-in-from-top-1 duration-500
      bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-[16px] shadow-sm
      transition-all duration-300 w-[300px] lg:w-auto lg:flex-1 overflow-hidden
      ${isOpen ? 'ring-2 ring-gray-900/5 dark:ring-white/10' : 'hover:border-gray-300 dark:hover:border-white/20'}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-6 py-3 px-6 transition-all active:scale-[0.98] group"
      >
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl transition-colors bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white group-hover:bg-gray-200 dark:group-hover:bg-white/20">
            <Boxes size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold tracking-wide text-gray-900 dark:text-white">
              Shift Gear
            </span>
          </div>
        </div>

        {/* Middle: Spacer */}
        <div className="flex-1" />

        {/* Right: Item Count & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
            {gearDelta.toDrop.length + gearDelta.toAdd.length} items
          </span>
          <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Content */}
      <div className={`
        grid transition-all duration-300 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="overflow-hidden">
          <div className="p-5 pt-2 border-t border-gray-100 dark:border-white/5 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-gray-900 dark:text-white pointer-events-none">
              <Package size={80} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {/* Stuff to Drop */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl">
                    <ArrowDownRight size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-widest text-red-600 dark:text-red-400 uppercase">Drop</h4>
                    <p className="text-[9px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">Unload from previous scene</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {gearDelta.toDrop.length > 0 ? gearDelta.toDrop.map(item => {
                    const Icon = (CATEGORY_ICONS as any)[item.category] || Package;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 group/item">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-lg">
                            <Icon size={12} strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-gray-900 dark:text-white capitalize truncate leading-none mb-1">{item.customName || item.name}</p>
                            <p className="text-[9px] font-medium text-gray-400 dark:text-gray-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-red-300 dark:bg-red-500/50" />
                      </div>
                    );
                  }) : (
                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl capitalize">Everything stays</p>
                  )}
                </div>
              </div>

              {/* Stuff to Add */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <ArrowUpRight size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">Add</h4>
                    <p className="text-[9px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">Required for next scene</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {gearDelta.toAdd.length > 0 ? gearDelta.toAdd.map(item => {
                    const Icon = (CATEGORY_ICONS as any)[item.category] || Package;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 group/item">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Icon size={12} strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 capitalize truncate leading-none mb-1">{item.customName || item.name}</p>
                            <p className="text-[9px] font-medium text-emerald-500 dark:text-emerald-400/70 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="p-1 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-emerald-900 rounded-lg group-hover/item:scale-110 transition-transform">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl capitalize">No new gear needed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
