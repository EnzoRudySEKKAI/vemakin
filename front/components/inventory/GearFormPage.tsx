import React, { useEffect, useState } from 'react';
import { FormLayout, FormType } from '../organisms/FormLayout';
import { GearForm, GearFormData } from './GearForm';
import { useProductionStore } from '../../hooks/useProductionStore';
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
  const {
    fetchCatalogCategories,
    catalogBrands,
    catalogItems
  } = useProductionStore();

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

  // Lazy load catalog categories when form opens
  useEffect(() => {
    fetchCatalogCategories();
  }, [fetchCatalogCategories]);

  const handleSubmit = () => {
    const newId = crypto.randomUUID();
    const modelName = form.modelName || form.brandName || form.categoryName || 'New Equipment';

    const newEquipment: Equipment = {
      id: newId,
      name: modelName,
      catalogItemId: form.model || undefined,
      customName: form.name.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
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
