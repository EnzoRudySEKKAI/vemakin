import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Film, Calendar, MapPin, FileText, Package, Check, Search, AlertCircle } from 'lucide-react'
import { FormLayout, FormType } from '@/components/organisms/FormLayout'
import { Text, Input, Button, IconContainer, Textarea } from '@/components/atoms'
import { Card } from '@/components/ui/Card'
import { TimeSelector } from '@/components/ui/TimeSelector'
import { LocationAutocomplete, LocationSuggestion } from '@/components/ui/LocationAutocomplete'
import { CATEGORY_ICONS } from '@/constants'
import { Shot, Equipment } from '@/types'
import { timeToMinutes, calculateEndTime } from '@/utils'

interface ShotFormPageProps {
  onClose: () => void
  onSwitchForm: (type: FormType) => void
  onSubmit: (shot: Shot) => void
  inventory: Equipment[]
  existingShots: Shot[]
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
}

const fromISODate = (isoStr: string) => {
  if (!isoStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const ShotFormPage: React.FC<ShotFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  inventory,
  existingShots
}) => {
  const [form, setForm] = useState({
    title: '',
    sceneNumber: '',
    location: '',
    locationLat: undefined as number | undefined,
    locationLng: undefined as number | undefined,
    date: toISODate(new Date().toLocaleDateString()),
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    equipmentIds: [] as string[]
  })

  const formRef = useRef(form)
  formRef.current = form

  const [shotGearSearch, setShotGearSearch] = useState('')
  const [shotGearCategory, setShotGearCategory] = useState('All')

  // Shot conflict detection
  const shotConflict = useMemo(() => {
    if (!form.startTime || !form.endTime) return null

    const startMins = timeToMinutes(form.startTime)
    let endMins = timeToMinutes(form.endTime)
    if (endMins < startMins) endMins += 1440

    const formattedDate = fromISODate(form.date)

    return existingShots.find(s => {
      if (s.date !== formattedDate) return false
      const sStart = timeToMinutes(s.startTime)
      const sEnd = timeToMinutes(calculateEndTime(s.startTime, s.duration))
      return (startMins < sEnd && endMins > sStart)
    })
  }, [form.startTime, form.endTime, form.date, existingShots])

  const toggleShotGear = (id: string) => {
    setForm(prev => {
      const exists = prev.equipmentIds.includes(id)
      return {
        ...prev,
        equipmentIds: exists
          ? prev.equipmentIds.filter(x => x !== id)
          : [...prev.equipmentIds, id]
      }
    })
  }

  const handleSubmit = () => {
    const currentForm = formRef.current
    if (!currentForm.title.trim() || shotConflict) return

    const startMins = timeToMinutes(currentForm.startTime)
    let endMins = timeToMinutes(currentForm.endTime)
    if (endMins < startMins) endMins += 1440
    const diffHours = (endMins - startMins) / 60
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`

    const newShot: Shot = {
      id: crypto.randomUUID(),
      title: currentForm.title,
      sceneNumber: currentForm.sceneNumber || `${existingShots.length + 1}X`,
      location: currentForm.location || 'Location TBD',
      locationLat: currentForm.locationLat,
      locationLng: currentForm.locationLng,
      date: fromISODate(currentForm.date),
      startTime: currentForm.startTime,
      duration: duration,
      description: currentForm.description,
      remarks: currentForm.description,
      status: 'pending',
      equipmentIds: currentForm.equipmentIds,
      preparedEquipmentIds: []
    }

    onSubmit(newShot)
    onClose()
  }

  const availableGear = inventory.filter(item => {
    const matchesSearch = (item.customName || item.name).toLowerCase().includes(shotGearSearch.toLowerCase())
    const matchesCat = shotGearCategory === 'All' || item.category === shotGearCategory
    return matchesSearch && matchesCat
  })

  const isValid = form.title.trim() && !shotConflict

  return (
    <FormLayout
      title="New Scene"
      subtitle="Schedule a new shot"
      detailLabel="Create New"
      formType="shot"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid}
      submitLabel="Schedule Scene"
    >
      <Card title="Scene identity" className="mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div className="sm:col-span-3">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Scene title</span>
              <Input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. THE EXTERIOR CHASE"
                fullWidth
                variant="underline"
                className="text-lg font-bold tracking-tight"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Number</span>
              <Input
                type="text"
                value={form.sceneNumber}
                onChange={e => setForm(prev => ({ ...prev, sceneNumber: e.target.value }))}
                placeholder="4C"
                leftIcon={<span className="text-[10px] font-bold text-gray-400 dark:text-white/20">SC</span>}
                fullWidth
                variant="underline"
                className="font-mono text-primary/70"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Schedule & location" className="mb-8">
        <div className="p-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="relative">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Filming date</span>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                fullWidth
                variant="underline"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Start time</span>
              <TimeSelector label="" value={form.startTime} onChange={(v) => setForm(prev => ({ ...prev, startTime: v }))} />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Estimated end</span>
              <TimeSelector label="" value={form.endTime} onChange={(v) => setForm(prev => ({ ...prev, endTime: v }))} />
            </div>
          </div>

          {shotConflict && (
            <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-medium text-red-400 block mb-0.5">
                  Schedule Conflict
                </span>
                <span className="text-sm text-gray-600 dark:text-white/70">
                  This slot overlaps with "<span className="text-gray-900 dark:text-white font-medium">{shotConflict.title}</span>"
                </span>
              </div>
            </div>
          )}

          <div className="w-full">
            <LocationAutocomplete
              value={form.location}
              onChange={(value, location) => setForm(prev => ({ 
                ...prev, 
                location: value,
                locationLat: location?.lat,
                locationLng: location?.lng
              }))}
              placeholder="Search filming location..."
              label="Location"
            />
          </div>
        </div>
      </Card>

      <Card title="Action brief" className="mb-8">
        <div className="p-6">
          <Textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the action, atmosphere, and key visual elements..."
            className="min-h-[120px]"
          />
        </div>
      </Card>

      <Card
        title="Equipment assignment"
        headerRight={
          <span className="text-primary font-medium text-xs">
            {form.equipmentIds.length} items selected
          </span>
        }
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                value={shotGearSearch}
                onChange={(e) => setShotGearSearch(e.target.value)}
                placeholder="Search gear inventory..."
                variant="underline"
                fullWidth
                leftIcon={<Search size={14} className="text-gray-400 dark:text-white/20" />}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-linear-fade">
              {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => {
                const isActive = shotGearCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setShotGearCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-medium transition-all border whitespace-nowrap ${isActive
                      ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(78,71,221,0.3)]'
                      : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/70 hover:border-gray-300 dark:hover:border-white/10'
                      }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {availableGear.length > 0 ? availableGear.map(item => {
              const isSelected = form.equipmentIds.includes(item.id)
              const Icon = (CATEGORY_ICONS as any)[item.category] || Package

              return (
                <button
                  key={item.id}
                  onClick={() => toggleShotGear(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group border ${isSelected
                    ? 'bg-primary/10 border-primary/20 shadow-[0_0_10px_rgba(78,71,221,0.05)]'
                    : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2.5 rounded-xl transition-all ${isSelected
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:text-gray-600 dark:group-hover:text-white/40'
                      }`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-primary' : 'text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                        {item.customName || item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-white/30">
                          {item.category}
                        </span>
                        {item.status !== 'available' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/30 font-medium">
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isSelected
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(78,71,221,0.4)] scale-100'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-200 dark:text-white/5 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                    }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </button>
              )
            }) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-400 dark:text-white/20">
                  <Package size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-gray-500 dark:text-white/40 font-medium text-sm">No items found</h3>
                <p className="text-gray-400 dark:text-white/20 text-xs mt-1">Try adjusting your search or category</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </FormLayout>
  )
}
