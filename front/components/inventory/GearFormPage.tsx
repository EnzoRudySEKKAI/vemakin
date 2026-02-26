import React, { useState } from 'react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { GearForm, GearFormData } from './GearForm';
import { useCatalogBrands, useCatalogItems } from '@/hooks/useApi';
import { Equipment } from '../../types';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { Input } from '@/components/atoms';
import { DollarSign, ChevronDown } from 'lucide-react';

interface GearFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (gear: Equipment) => void;
}

export const GearFormPage: React.FC<GearFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit
}) => {
  const [form, setForm] = useState<GearFormData>({
    name: '',
    serialNumber: '',
    category: '',
    categoryName: '',
    brand: '',
    brandName: '',
    mount: '',
    model: '',
    modelName: '',
    isOwned: true,
    price: 0,
    frequency: 'day',
    customSpecs: [],
    specs: {}
  });

  // Use React Query to get current brands and items based on form selections
  const { data: catalogBrands = [] } = useCatalogBrands(form.category);
  const { data: catalogItems = [] } = useCatalogItems(form.category, form.brand);

  const handleSubmit = () => {
    const newId = crypto.randomUUID();
    const modelName = form.modelName || form.brandName || form.categoryName || 'New Equipment';

    const serialNumberValue = form.serialNumber.trim() || null;
    const customNameValue = form.name.trim() || null;

    const newEquipment: Equipment = {
      id: newId,
      name: modelName,
      catalogItemId: form.model || null,
      customName: customNameValue,
      serialNumber: serialNumberValue,
      category: (form.categoryName || form.category || 'Other') as any,
      pricePerDay: form.isOwned ? 0 : form.price,
      rentalPrice: form.isOwned ? undefined : form.price,
      rentalFrequency: form.isOwned ? undefined : form.frequency,
      quantity: 1,
      isOwned: form.isOwned,
      status: 'operational',
      specs: form.specs || {}
    };

    onSubmit(newEquipment);
    onClose();
  };

  const requiresModel = form.category !== 'Other' && !!form.brand && catalogItems.length > 0
  const isValid = !!form.category && (form.category === 'Other' || form.brand || catalogBrands.length === 0) && (!requiresModel || !!form.model)

  const ownershipSidebar = (
    <TerminalCard header="Ownership & acquisitions">
      <div className="space-y-6">
        <div className="flex p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setForm(prev => ({ ...prev, isOwned: true }))}
            className={`flex-1 py-3 text-[10px] font-medium transition-all ${form.isOwned ? 'bg-primary text-primary-foreground border border-primary' : 'text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/50'}`}
          >
            Internal Production Asset
          </button>
          <button
            onClick={() => setForm(prev => ({ ...prev, isOwned: false }))}
            className={`flex-1 py-3 text-[10px] font-medium transition-all ${!form.isOwned ? 'bg-orange-500 text-white border border-orange-500' : 'text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/50'}`}
          >
            External Rental Service
          </button>
        </div>

        {!form.isOwned && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Rental cost rate</span>
              <Input
                type="number"
                value={form.price || ''}
                onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                fullWidth
                placeholder="0.00"
                variant="underline"
                leftIcon={<DollarSign size={14} className="text-orange-400/50" />}
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Price frequency</span>
              <div className="relative group">
                <select
                  value={form.frequency}
                  onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 py-3 pr-10 text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white focus:outline-none focus:border-primary transition-all cursor-pointer text-sm font-bold tracking-tight"
                >
                  <option value="hour" className="bg-white dark:bg-[#0F1116]">Hourly (Short term)</option>
                  <option value="day" className="bg-white dark:bg-[#0F1116]">Daily (Standard)</option>
                  <option value="week" className="bg-white dark:bg-[#0F1116]">Weekly (Discounted)</option>
                  <option value="month" className="bg-white dark:bg-[#0F1116]">Monthly (Long term)</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 group-hover:text-primary pointer-events-none transition-colors" size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        )}
      </div>
    </TerminalCard>
  )

  return (
    <FormLayout
      title="New Equipment"
      subtitle="Register gear in your inventory"
      detailLabel="Create new"
      formType="gear"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid}
      submitLabel="Save Equipment"
      size="wide"
      sidebar={ownershipSidebar}
    >
      <GearForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        renderOwnershipSidebar={() => null}
      />
    </FormLayout>
  );
};
