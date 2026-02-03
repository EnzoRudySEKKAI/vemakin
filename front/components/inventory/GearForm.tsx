
import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown, ChevronUp, PenLine, Hash, Tag, Box,
  Package, Info, DollarSign, Aperture
} from 'lucide-react';
import { Text } from '../atoms/Text';
import { Equipment, CatalogCategory, CatalogBrand, CatalogItem } from '../../types.ts';
import { useProductionStore } from '../../hooks/useProductionStore';

export interface GearFormData {
  name: string;
  serialNumber: string;
  category: string;
  brand: string;
  mount: string;
  model: string;
  isOwned: boolean;
  price: number;
  frequency: 'hour' | 'day' | 'week' | 'month' | 'year';
  customSpecs: { key: string; value: string }[];
  specs: Record<string, any>;
}

interface GearFormProps {
  form: GearFormData;
  setForm: React.Dispatch<React.SetStateAction<GearFormData>>;
  onSubmit: () => void;
}

export const GearForm: React.FC<GearFormProps> = ({ form, setForm, onSubmit }) => {
  const {
    catalogCategories,
    catalogBrands,
    catalogItems,
    fetchCatalogCategories,
    fetchBrands,
    fetchCatalogItems,
    fetchItemSpecs
  } = useProductionStore();

  // Lazy load catalog categories when form opens
  useEffect(() => {
    fetchCatalogCategories();
  }, [fetchCatalogCategories]);

  const [showSpecsInForm, setShowSpecsInForm] = useState(false);
  const [currentModelSpecs, setCurrentModelSpecs] = useState<any>(null);

  const handleCategoryChange = (catId: string) => {
    const cat = catalogCategories.find(c => c.id === catId);
    setForm({ ...form, category: catId, brand: '', model: '', mount: '' });
    if (catId) fetchBrands(catId);
  };

  const handleBrandChange = (brandId: string) => {
    setForm({ ...form, brand: brandId, model: '', mount: '' });
    if (brandId && form.category) fetchCatalogItems(form.category, brandId);
  };

  const handleModelChange = async (itemId: string) => {
    if (itemId) {
      const item = catalogItems.find(i => i.id === itemId);
      let specs = item?.specs;

      if (!specs) {
        specs = await fetchItemSpecs(itemId);
      }

      setCurrentModelSpecs(specs);
      setForm(prev => ({ ...prev, model: itemId, specs: specs || {} }));
    } else {
      setCurrentModelSpecs(null);
      setForm(prev => ({ ...prev, model: itemId, specs: {} }));
    }
  };

  const isValid = form.category && (form.category === 'Other' || form.brand || catalogBrands.length === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6">
        {/* Custom Name & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Custom name / Label</Text>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all text-sm font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g. A-Cam, Unit 1..."
              />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Serial number</Text>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all text-sm font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="S/N: 12345..."
              />
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Category</Text>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                >
                  <option value="">Select category</option>
                  {catalogCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {catalogBrands.length > 0 && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="subtitle" color="muted" className="dark:text-white">Brand</Text>
                <div className="relative">
                  <select
                    value={form.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                  >
                    <option value="">Select brand</option>
                    {catalogBrands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Model */}
        {catalogItems.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Model</Text>
              <div className="relative">
                <select
                  value={form.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                >
                  <option value="">Select model</option>
                  {catalogItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Specs Toggle */}
        {currentModelSpecs && (
          <div className="animate-in fade-in duration-300">
            <button
              onClick={() => setShowSpecsInForm(!showSpecsInForm)}
              className="flex items-center gap-2 text-[10px] font-semibold text-blue-500 dark:text-indigo-500 dark:text-blue-400 dark:text-indigo-400 hover:text-blue-600 dark:text-indigo-600 dark:hover:text-blue-400 dark:text-indigo-400 transition-colors mb-2 ml-1"
            >
              <Info size={14} /> Show technical details {showSpecsInForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showSpecsInForm && (
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-[#2C2C30] p-4 rounded-2xl border border-gray-100 dark:border-white/10 animate-in slide-in-from-top-1">
                {Object.entries(currentModelSpecs).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-[8px] font-semibold text-gray-400 dark:text-gray-500">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-gray-100 dark:bg-white/10 my-2" />

        {/* Ownership */}
        <div className="space-y-4">
          <div className="p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setForm({ ...form, isOwned: true })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-semibold transition-all ${form.isOwned
                ? 'bg-white dark:bg-[#3A3A3E] shadow-sm text-blue-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              Owned asset
            </button>
            <button
              onClick={() => setForm({ ...form, isOwned: false })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-semibold transition-all ${!form.isOwned
                ? 'bg-white dark:bg-[#3A3A3E] shadow-sm text-orange-600 dark:text-orange-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              Rented gear
            </button>
          </div>

          {!form.isOwned && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <div>
                <div className="flex flex-col gap-1 min-w-0">
                  <Text variant="subtitle" color="muted" className="dark:text-white">Rate</Text>
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all text-sm font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1 min-w-0">
                  <Text variant="subtitle" color="muted" className="dark:text-white">Frequency</Text>
                  <div className="relative">
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                      className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                    >
                      <option value="hour">Hourly</option>
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};
