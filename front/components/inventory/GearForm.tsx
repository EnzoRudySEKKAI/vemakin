import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown, ChevronUp, PenLine, Hash, Tag, Box,
  Package, Info, DollarSign, Aperture
} from 'lucide-react'
import { Text, Input, Button, Card, IconContainer } from '@/components/atoms'
import { Equipment, CatalogCategory, CatalogBrand, CatalogItem } from '@/types'
import { useProductionStore } from '@/hooks/useProductionStore'
import { radius, typography } from '@/design-system'

export interface GearFormData {
  name: string
  serialNumber: string
  category: string
  categoryName: string
  brand: string
  brandName: string
  mount: string
  model: string
  modelName: string
  isOwned: boolean
  price: number
  frequency: 'hour' | 'day' | 'week' | 'month' | 'year'
  customSpecs: { key: string; value: string }[]
  specs: Record<string, any>
}

interface GearFormProps {
  form: GearFormData
  setForm: React.Dispatch<React.SetStateAction<GearFormData>>
  onSubmit: () => void
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
  } = useProductionStore()

  // Lazy load catalog categories when form opens
  useEffect(() => {
    fetchCatalogCategories()
  }, [fetchCatalogCategories])

  const [showSpecsInForm, setShowSpecsInForm] = useState(false)
  const [currentModelSpecs, setCurrentModelSpecs] = useState<any>(null)
  const pendingModelId = useRef<string | null>(null)

  const handleCategoryChange = (catId: string) => {
    const cat = catalogCategories.find(c => c.id === catId)
    setForm(prev => ({
      ...prev,
      category: catId,
      categoryName: cat?.name || '',
      brand: '',
      brandName: '',
      model: '',
      modelName: '',
      mount: ''
    }))
    if (catId) fetchBrands(catId)
  }

  const handleBrandChange = (brandId: string) => {
    const brand = catalogBrands.find(b => b.id === brandId)
    setForm(prev => ({
      ...prev,
      brand: brandId,
      brandName: brand?.name || '',
      model: '',
      modelName: '',
      mount: ''
    }))
    if (brandId && form.category) fetchCatalogItems(form.category, brandId)
  }

  const handleModelChange = async (itemId: string) => {
    pendingModelId.current = itemId || null
    setCurrentModelSpecs(null)

    if (!itemId) {
      setForm(prev => ({ ...prev, model: '', modelName: '', specs: {} }))
      return
    }

    const item = catalogItems.find(i => i.id === itemId)
    const resolvedModelName = item?.name || ''
    setForm(prev => ({ ...prev, model: itemId, modelName: resolvedModelName, specs: {} }))
    let specs = item?.specs

    if (!specs) {
      specs = await fetchItemSpecs(itemId)
    }

    if (pendingModelId.current !== itemId) return

    setCurrentModelSpecs(specs)
    setForm(prev => ({ ...prev, model: itemId, modelName: resolvedModelName, specs: specs || {} }))
  }

  const isValid = form.category && (form.category === 'Other' || form.brand || catalogBrands.length === 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-6">
        {/* Custom Name & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="label" color="muted">Custom Name / Label</Text>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                placeholder="E.g. A-Cam, Unit 1..."
              />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="label" color="muted">Serial Number</Text>
              <Input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                fullWidth
                placeholder="S/N: 12345..."
              />
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="label" color="muted">Category</Text>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                >
                  <option value="">Select Category</option>
                  {catalogCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {catalogBrands.length > 0 && (
            <div className="animate-in slide-in-from-left-2 duration-300">
              <div className="flex flex-col gap-1 min-w-0">
                <Text variant="label" color="muted">Brand</Text>
                <div className="relative">
                  <select
                    value={form.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                  >
                    <option value="">Select Brand</option>
                    {catalogBrands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Model */}
        {catalogItems.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="label" color="muted">Model</Text>
              <div className="relative">
                <select
                  value={form.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                >
                  <option value="">Select Model</option>
                  {catalogItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}

        {/* Specs Toggle */}
        {currentModelSpecs && (
          <div className="animate-in fade-in duration-300">
            <Button
              onClick={() => setShowSpecsInForm(!showSpecsInForm)}
              variant="ghost"
              size="sm"
              leftIcon={<Info size={14} strokeWidth={2.5} />}
              rightIcon={showSpecsInForm ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
            >
              Show Technical Details
            </Button>

            {showSpecsInForm && (
              <Card variant="flat" size="sm" className="mt-2 animate-in slide-in-from-top-1">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(currentModelSpecs).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <Text variant="label" color="muted">{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                      <Text variant="caption">{String(v)}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="h-px bg-gray-100 dark:bg-white/10 my-2" />

        {/* Ownership */}
        <div className="space-y-4">
          <div className={`p-1.5 ${radius.lg} flex gap-1`}>
            <Button
              onClick={() => setForm(prev => ({ ...prev, isOwned: true }))}
              variant={form.isOwned ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
            >
              Owned Asset
            </Button>
            <Button
              onClick={() => setForm(prev => ({ ...prev, isOwned: false }))}
              variant={!form.isOwned ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
            >
              Rented Gear
            </Button>
          </div>

          {!form.isOwned && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
              <div>
                <div className="flex flex-col gap-1 min-w-0">
                  <Text variant="label" color="muted">Rate</Text>
                  <Input
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    fullWidth
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1 min-w-0">
                  <Text variant="label" color="muted">Frequency</Text>
                  <div className="relative">
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all cursor-pointer text-sm font-semibold"
                    >
                      <option value="hour">Hourly</option>
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
