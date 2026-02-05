import React, { useState, useMemo, useCallback } from 'react'
import { Film, Calendar, MapPin, FileText, Package, Check, Search, AlertCircle } from 'lucide-react'
import { FormLayout, FormType } from '@/components/organisms/FormLayout'
import { Text, Input, Button, IconContainer, Card, Textarea } from '@/components/atoms'
import { TimeSelector } from '@/components/ui/TimeSelector'
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
    date: toISODate(new Date().toLocaleDateString()),
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    equipmentIds: [] as string[]
  })

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
    if (!form.title.trim() || shotConflict) return

    const startMins = timeToMinutes(form.startTime)
    let endMins = timeToMinutes(form.endTime)
    if (endMins < startMins) endMins += 1440
    const diffHours = (endMins - startMins) / 60
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      title: form.title,
      sceneNumber: form.sceneNumber || `${existingShots.length + 1}X`,
      location: form.location || 'Location TBD',
      date: fromISODate(form.date),
      startTime: form.startTime,
      duration: duration,
      description: form.description,
      remarks: '',
      status: 'pending',
      equipmentIds: form.equipmentIds,
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
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        {/* Scene Identity */}
        <div className="w-full">
          <Text variant="h3" color="muted" className="mb-3 block text-center sm:text-left">Scene Identity</Text>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <Input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Scene title..."
                fullWidth
              />
            </div>
            <div>
              <Input
                type="text"
                value={form.sceneNumber}
                onChange={e => setForm({ ...form, sceneNumber: e.target.value })}
                placeholder="Scene number (e.g. 4C)"
                leftIcon={<span className="text-xs font-semibold text-gray-400">SC</span>}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="w-full">
          <Text variant="h3" color="muted" className="mb-3 block text-center sm:text-left">Schedule</Text>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                fullWidth
              />
            </div>
            <TimeSelector label="" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
            <TimeSelector label="" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
          </div>

          {shotConflict && (
            <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
              <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={14} strokeWidth={2.5} />
              <Text variant="label" color="danger">
                Conflict: This slot is already taken by "{shotConflict.title}"
              </Text>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="w-full">
          <Text variant="h3" color="muted" className="mb-3 block text-center sm:text-left">Location</Text>
          
          <Input
            type="text"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="Enter filming location..."
            fullWidth
          />
        </div>

        {/* Description */}
        <div className="w-full">
          <Text variant="h3" color="muted" className="mb-3 block text-center sm:text-left">Description</Text>
          
          <Textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the action, atmosphere, and key visual elements..."
            size="lg"
          />
        </div>
      </div>

      {/* Equipment Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <Text variant="h3" color="muted">Equipment</Text>
          <span className="bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-semibold">
            {form.equipmentIds.length} Selected
          </span>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4 mb-6">
          <Input
            type="text"
            value={shotGearSearch}
            onChange={(e) => setShotGearSearch(e.target.value)}
            placeholder="Search inventory..."
            leftIcon={<Search size={16} strokeWidth={2.5} className="text-gray-400" />}
            fullWidth
          />
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => (
              <Button
                key={cat}
                variant={shotGearCategory === cat ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShotGearCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {availableGear.map(item => {
            const isSelected = form.equipmentIds.includes(item.id)
            const Icon = (CATEGORY_ICONS as any)[item.category] || Package

            return (
              <button
                key={item.id}
                onClick={() => toggleShotGear(item.id)}
                className="w-full flex items-center justify-between py-4 text-left border-b border-gray-50 dark:border-white/[0.02] last:border-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <IconContainer 
                    icon={Icon} 
                    size="md" 
                    variant={isSelected ? 'accent' : 'default'}
                  />
                  <div className="min-w-0">
                    <Text variant="body" className={isSelected ? 'text-blue-900 dark:text-indigo-400' : ''}>
                      {item.customName || item.name}
                    </Text>
                    <Text variant="caption" color="muted">{item.category}</Text>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-indigo-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-indigo-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                }`}>
                  <Check size={18} strokeWidth={2.5} />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </FormLayout>
  )
}
