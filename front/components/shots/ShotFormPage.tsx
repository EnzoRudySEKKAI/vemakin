import React, { useState, useMemo, useRef } from 'react'
import { Check, Package } from 'lucide-react'
import { FormLayout, FormType } from '@/components/organisms/FormLayout'
import { FormField, FormTextarea, FormDatePicker, FormTimePicker, FormLocation, FormSection, FormConflictWarning } from '@/components/molecules'
import { ItemSelector } from '@/components/organisms/ItemSelector'
import { ProjectRequiredBanner } from '@/components/molecules/ProjectRequiredBanner'
import { CATEGORY_ICONS } from '@/constants'
import { Shot, Equipment } from '@/types'
import { timeToMinutes, calculateEndTime, addHoursToTime, subtractHoursFromTime } from '@/utils'

interface ShotFormPageProps {
  onClose: () => void
  onSwitchForm: (type: FormType) => void
  onSubmit: (shot: Shot) => void
  inventory: Equipment[]
  existingShots: Shot[]
  hasProjects?: boolean
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
}

export const ShotFormPage: React.FC<ShotFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  inventory,
  existingShots,
  hasProjects = true
}) => {
  const [form, setForm] = useState({
    title: '',
    sceneNumber: '',
    location: '',
    locationLat: undefined as number | undefined,
    locationLng: undefined as number | undefined,
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    equipmentIds: [] as string[]
  })

  const formRef = useRef(form)
  formRef.current = form

  const shotConflict = useMemo(() => {
    if (!form.startTime || !form.endTime) return null

    const startMins = timeToMinutes(form.startTime)
    let endMins = timeToMinutes(form.endTime)
    if (endMins < startMins) endMins += 1440

    return existingShots.find(s => {
      if (s.date !== form.date) return false
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
      date: currentForm.date,
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

  const handleStartTimeChange = (v: string) => {
    const startMins = timeToMinutes(v)
    const endMins = timeToMinutes(form.endTime)
    setForm(prev => ({ ...prev, startTime: v }))
    if (startMins >= endMins) {
      setForm(prev => ({ ...prev, endTime: addHoursToTime(v, 2) }))
    }
  }

  const handleEndTimeChange = (v: string) => {
    const startMins = timeToMinutes(form.startTime)
    const endMins = timeToMinutes(v)
    setForm(prev => ({ ...prev, endTime: v }))
    if (endMins <= startMins) {
      setForm(prev => ({ ...prev, startTime: subtractHoursFromTime(v, 2) }))
    }
  }

  const handleLocationChange = (value: string, location?: { lat?: number; lng?: number }) => {
    setForm(prev => ({ 
      ...prev, 
      location: value,
      locationLat: location?.lat,
      locationLng: location?.lng
    }))
  }

  const isValid = form.title.trim() && !shotConflict

  return (
    <FormLayout
      title="New Scene"
      subtitle="Schedule a new shot"
      detailLabel="Create new"
      formType="shot"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid || !hasProjects}
      submitLabel={hasProjects ? "Schedule Scene" : "Create a project first"}
      size="wide"
      sidebar={
        <FormSection
          title="Equipment assignment"
          headerRight={
            <span className="text-primary font-medium text-xs">
              {form.equipmentIds.length} selected
            </span>
          }
        >
          <ItemSelector
            label=""
            items={inventory}
            selectedIds={form.equipmentIds}
            onToggle={toggleShotGear}
            multiSelect
            categoryFilter
            searchFields={['name', 'customName', 'category']}
            placeholder="Search gear..."
            emptyMessage="No items found"
          />
        </FormSection>
      }
    >
      {!hasProjects && (
        <ProjectRequiredBanner
          onCreateProject={() => onSwitchForm('gear')}
          message="You need to create a project before you can save shots"
        />
      )}

      <FormSection title="Scene identity" className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <FormField
              label="Scene title"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. THE EXTERIOR CHASE"
              required
              fullWidth
            />
          </div>
          <div className="lg:w-32 shrink-0">
            <FormField
              label="Number"
              value={form.sceneNumber}
              onChange={e => setForm(prev => ({ ...prev, sceneNumber: e.target.value }))}
              placeholder="4C"
              fullWidth
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Schedule & location" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FormDatePicker
            label="Schedule"
            value={form.date}
            onChange={date => setForm(prev => ({ ...prev, date: date || '' }))}
          />
          <FormTimePicker
            label="Start time"
            value={form.startTime}
            onChange={handleStartTimeChange}
          />
          <FormTimePicker
            label="End time"
            value={form.endTime}
            onChange={handleEndTimeChange}
          />
        </div>

        {shotConflict && (
          <FormConflictWarning
            conflict={shotConflict}
            message="Schedule Conflict"
            suggestion={`This slot overlaps with "${shotConflict.title}"`}
            className="mt-8"
          />
        )}

        <div className="mt-8">
          <FormLocation
            label="Location"
            value={form.location}
            onChange={handleLocationChange}
            placeholder="Search filming location..."
          />
        </div>
      </FormSection>

      <FormSection title="Action brief" className="mb-8">
        <FormTextarea
          label="Description"
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the action, atmosphere, and key visual elements..."
          rows={4}
        />
      </FormSection>
    </FormLayout>
  )
}
