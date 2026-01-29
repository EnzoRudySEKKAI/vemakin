
import React, { useMemo, useState } from 'react';
import {
  Save, ChevronDown, ChevronUp, PenLine, Hash, Tag, Box,
  Package, Info, DollarSign, Aperture
} from 'lucide-react';
import { Equipment } from '../../types.ts';
import { GEAR_DATABASE } from '../../constants.ts';

export interface GearFormData {
  name: string;
  serialNumber: string;
  category: keyof typeof GEAR_DATABASE | 'Other' | '';
  brand: string;
  mount: string;
  model: string;
  isOwned: boolean;
  price: number;
  frequency: 'hour' | 'day' | 'week' | 'month' | 'year';
  customSpecs: { key: string; value: string }[];
}

interface GearFormProps {
  form: GearFormData;
  setForm: React.Dispatch<React.SetStateAction<GearFormData>>;
  onSubmit: () => void;
}

export const GearForm: React.FC<GearFormProps> = ({ form, setForm, onSubmit }) => {
  const [showSpecsInForm, setShowSpecsInForm] = useState(false);

  const availableBrands = useMemo(() => {
    if (!form.category || form.category === 'Other') return [];
    const catData = (GEAR_DATABASE as any)[form.category];
    return catData ? Object.keys(catData.brands) : [];
  }, [form.category]);

  const availableMounts = useMemo(() => {
    if (form.category !== 'Lens' || !form.brand) return [];
    const brandData = (GEAR_DATABASE as any).Lens?.brands?.[form.brand];
    if (!brandData) return [];
    const mounts = new Set<string>();
    Object.values(brandData.models).forEach((m: any) => {
      if (m.specs && m.specs.mount) mounts.add(m.specs.mount);
    });
    return Array.from(mounts);
  }, [form.category, form.brand]);

  const availableModels = useMemo(() => {
    if (!form.category || form.category === 'Other' || !form.brand) return [];
    const catData = (GEAR_DATABASE as any)[form.category];
    const brandData = catData?.brands?.[form.brand];
    if (!brandData) return [];
    let models = Object.entries(brandData.models);
    if (form.category === 'Lens' && form.mount) {
      models = models.filter(([_, data]: any) => data.specs?.mount === form.mount);
    }
    return models.map(([name]) => name);
  }, [form.category, form.brand, form.mount]);

  const currentModelSpecs = useMemo(() => {
    if (!form.category || !form.brand || !form.model || form.category === 'Other') return null;
    const catData = (GEAR_DATABASE as any)[form.category];
    const brandData = catData?.brands?.[form.brand];
    const modelData = brandData?.models?.[form.model];
    return modelData?.specs || null;
  }, [form.category, form.brand, form.model]);

  const isValid = form.category && (form.category === 'Other' || form.brand || availableBrands.length === 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6">
        {/* Custom Name & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Custom name / Label</label>
            <div className="relative">
              <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all placeholder-gray-300 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                placeholder="e.g. A-Cam, Unit 1..."
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Serial number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all placeholder-gray-300 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                placeholder="S/N: 12345..."
              />
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any, brand: '', model: '', mount: '' })}
                className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">Select category</option>
                {Object.keys(GEAR_DATABASE).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
            </div>
          </div>

          {availableBrands.length > 0 && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Brand</label>
              <div className="relative">
                <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value, model: '', mount: '' })}
                  className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all cursor-pointer text-gray-900 dark:text-white"
                >
                  <option value="">Select brand</option>
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
              </div>
            </div>
          )}
        </div>

        {/* Lens Mount */}
        {form.category === 'Lens' && availableMounts.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Lens mount</label>
            <div className="relative">
              <Aperture className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
              <select
                value={form.mount}
                onChange={(e) => setForm({ ...form, mount: e.target.value, model: '' })}
                className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">Select mount</option>
                {availableMounts.map(m => (
                  <option key={m} value={m}>{m} Mount</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
            </div>
          </div>
        )}

        {/* Model */}
        {availableModels.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Model</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={16} />
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-12 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-blue-500 dark:border-indigo-500 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">Select model</option>
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
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

        <div className="h-px bg-gray-100 dark:bg-white/10 my-2"/>

        {/* Ownership */}
        <div className="space-y-4">
          <div className="bg-gray-100/80 dark:bg-[#2C2C30] p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setForm({ ...form, isOwned: true })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-semibold transition-all ${form.isOwned
                ? 'bg-white dark:bg-[#3A3A3E] shadow-sm text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400'
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
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Rate</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500"size={14} />
                  <input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                    className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-10 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-all text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Frequency</label>
                <div className="relative">
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                    className="w-full appearance-none bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] pl-4 pr-10 py-4 text-sm font-semibold focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-all cursor-pointer text-gray-900 dark:text-white"
                  >
                    <option value="hour">Hourly</option>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none"size={16} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#1C1C1E] flex justify-center pb-6">
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className="w-full sm:w-auto sm:px-24 py-4 rounded-full font-semibold text-[12px] bg-blue-400 dark:bg-indigo-400/60 dark:bg-blue-600 dark:bg-indigo-600/60 text-white text-white shadow-2xl shadow-blue-500 dark:shadow-indigo-500/10 dark:shadow-blue-500 dark:shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale hover:bg-blue-500 dark:bg-indigo-500 dark:hover:bg-blue-700 dark:bg-indigo-700"
        >
          Add gear <Save size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
