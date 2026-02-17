import React, { useState } from 'react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { GearForm, GearFormData } from './GearForm';
import { useCatalogBrands, useCatalogItems } from '@/hooks/useApi';
import { Equipment } from '../../types';

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
    >
      <GearForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
      />
    </FormLayout>
  );
};
