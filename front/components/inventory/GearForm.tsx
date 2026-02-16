import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, PenLine, Hash, Tag, Box,
  Package, Info, DollarSign, Aperture
} from 'lucide-react'
import { Text, Input, Button, IconContainer } from '@/components/atoms'
import { Card } from '@/components/ui/Card'
import { Equipment, CatalogCategory, CatalogBrand, CatalogItem } from '@/types'
import { useCatalogCategories, useCatalogBrands, useCatalogItems, useItemSpecs } from '@/hooks/useApi'
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
  // Use React Query hooks for catalog data
  const { data: catalogCategories = [] } = useCatalogCategories()
  const { data: catalogBrands = [] } = useCatalogBrands(form.category)
  const { data: catalogItems = [] } = useCatalogItems(form.category, form.brand)
  const itemSpecsQuery = useItemSpecs(form.model)

  const [showSpecsInForm, setShowSpecsInForm] = useState(false)
  const [currentModelSpecs, setCurrentModelSpecs] = useState<any>(null)
  const pendingModelId = useRef<string | null>(null)

  // Update specs when model changes
  useEffect(() => {
    if (itemSpecsQuery.data && form.model === pendingModelId.current) {
      setCurrentModelSpecs(itemSpecsQuery.data)
      setForm(prev => ({ ...prev, specs: itemSpecsQuery.data || {} }))
    }
  }, [itemSpecsQuery.data, form.model])

  const handleCategoryChange = (catId: string) => {
    const cat = catalogCategories.find((c: CatalogCategory) => c.id === catId)
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
  }

  const handleBrandChange = (brandId: string) => {
    const brand = catalogBrands.find((b: CatalogBrand) => b.id === brandId)
    setForm(prev => ({
      ...prev,
      brand: brandId,
      brandName: brand?.name || '',
      model: '',
      modelName: '',
      mount: ''
    }))
  }

  const handleModelChange = (itemId: string) => {
    pendingModelId.current = itemId || null
    setCurrentModelSpecs(null)

    if (!itemId) {
      setForm(prev => ({ ...prev, model: '', modelName: '', specs: {} }))
      return
    }

    const item = catalogItems.find((i: CatalogItem) => i.id === itemId)
    const resolvedModelName = item?.name || ''
    setForm(prev => ({ ...prev, model: itemId, modelName: resolvedModelName, specs: item?.specs || {} }))

    // Specs will be fetched automatically by the useItemSpecs hook
    if (item?.specs) {
      setCurrentModelSpecs(item.specs)
    }
  }

  const isValid = form.category && (form.category === 'Other' || form.brand || catalogBrands.length === 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card title="Identity & registry" className="mb-8">
        <div className="p-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="sm:col-span-2">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Custom name</span>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                placeholder="E.g. A-Cam, Unit 1..."
                variant="underline"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Serial registry ID</span>
              <Input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                fullWidth
                placeholder="S/N: 12345..."
                variant="underline"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Categorization & model" className="mb-8">
        <div className="p-6 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Deployment type</span>
                <div className="relative group">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 py-3 pr-10 text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white focus:outline-none focus:border-primary transition-all cursor-pointer text-sm font-bold tracking-tight"
                >
                  <option value="" className="bg-white dark:bg-[#0F1116]">Select Category</option>
                  {catalogCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#0F1116]">{cat.name}</option>
                  ))}
                  <option value="Other" className="bg-white dark:bg-[#0F1116]">Other</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 group-hover:text-primary pointer-events-none transition-colors" size={14} strokeWidth={3} />
              </div>
            </div>

            {catalogBrands.length > 0 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Manufacturer</span>
                <div className="relative group">
                  <select
                    value={form.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 py-3 pr-10 text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white focus:outline-none focus:border-primary transition-all cursor-pointer text-sm font-bold tracking-tight"
                  >
                    <option value="" className="bg-white dark:bg-[#0F1116]">Select Brand</option>
                    {catalogBrands.map(b => (
                      <option key={b.id} value={b.id} className="bg-white dark:bg-[#0F1116]">{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 group-hover:text-primary pointer-events-none transition-colors" size={14} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {catalogItems.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-3 block">Specific model</span>
              <div className="relative group">
                <select
                  value={form.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full appearance-none bg-transparent border-b border-gray-300 dark:border-white/10 py-3 pr-10 text-gray-800 dark:text-white/80 focus:text-gray-900 dark:focus:text-white focus:outline-none focus:border-primary transition-all cursor-pointer text-sm font-bold tracking-tight"
                >
                  <option value="" className="bg-white dark:bg-[#0F1116]">Select Model Reference</option>
                  {catalogItems.map(m => (
                    <option key={m.id} value={m.id} className="bg-white dark:bg-[#0F1116]">{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/20 group-hover:text-primary pointer-events-none transition-colors" size={14} strokeWidth={3} />
              </div>
            </div>
          )}

          {currentModelSpecs && (
            <div className="animate-in fade-in duration-500 pt-8 border-t border-gray-200 dark:border-white/5">
              <button
                onClick={() => setShowSpecsInForm(!showSpecsInForm)}
                className="flex items-center gap-3 text-[10px] font-medium text-gray-500 dark:text-white/20 hover:text-primary transition-all mb-6"
              >
                <div className={`p-1.5 rounded-lg border transition-all ${showSpecsInForm ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5'}`}>
                  <Info size={12} strokeWidth={3} />
                </div>
                {showSpecsInForm ? "Hide Technical Details" : "View Technical Specifications"}
                <div className={`transition-transform duration-300 ${showSpecsInForm ? 'rotate-180' : ''}`}>
                  <ChevronDown size={12} strokeWidth={3} />
                </div>
              </button>

              <AnimatePresence>
                {showSpecsInForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pb-4">
                      {Object.entries(currentModelSpecs).map(([k, v]) => (
                        <div key={k} className="group">
                          <span className="text-[9px] text-gray-400 dark:text-white/20 font-medium mb-1 block group-hover:text-primary/50 transition-colors">
                            {k.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-white/50 font-medium group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors">{String(v || "—")}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>

      <Card title="Ownership & acquisitions">
        <div className="p-6 space-y-10">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5">
            <button
              onClick={() => setForm(prev => ({ ...prev, isOwned: true }))}
              className={`flex-1 py-3 text-[10px] font-medium rounded-xl transition-all ${form.isOwned ? 'bg-primary text-white shadow-[0_0_20px_rgba(78,71,221,0.3)]' : 'text-gray-500 dark:text-white/20 hover:text-gray-700 dark:hover:text-white/40'}`}
            >
              Internal Production Asset
            </button>
            <button
              onClick={() => setForm(prev => ({ ...prev, isOwned: false }))}
              className={`flex-1 py-3 text-[10px] font-medium rounded-xl transition-all ${!form.isOwned ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'text-gray-500 dark:text-white/20 hover:text-gray-700 dark:hover:text-white/40'}`}
            >
              External Rental Service
            </button>
          </div>

          {!form.isOwned && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4 duration-500">
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
      </Card>
    </div>
  )
}
