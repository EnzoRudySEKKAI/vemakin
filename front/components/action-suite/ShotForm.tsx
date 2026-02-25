import { useState, useMemo } from 'react'
import { Package, AlertCircle, Check, Save, Search } from 'lucide-react'
import { Shot, Equipment } from '@/types'
import { CATEGORY_ICONS } from '@/constants'
import { timeToMinutes, calculateEndTime, addHoursToTime, subtractHoursFromTime } from '@/utils'
import { TimeSelector } from '@/components/ui/TimeSelector'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { Input } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { DatePickerInput } from '@/components/ui/DatePickerInput'

interface ShotFormProps {
  inventory: Equipment[]
  existingShots: Shot[]
  onSubmit: (shot: Shot) => void
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
}

export const ShotForm = ({ inventory, existingShots, onSubmit }: ShotFormProps) => {
  const [title, setTitle] = useState('')
  const [sceneNumber, setSceneNumber] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [description, setDescription] = useState('')
  const [remarks, setRemarks] = useState('')
  const [equipmentIds, setEquipmentIds] = useState<string[]>([])
  const [gearSearch, setGearSearch] = useState('')
  const [gearCategory, setGearCategory] = useState('All')
  const [isCreatingGearInline, setIsCreatingGearInline] = useState(false)
  const [inlineGearName, setInlineGearName] = useState('')
  const [inlineGearCategory, setInlineGearCategory] = useState('Camera')

  const shotConflict = useMemo(() => {
    const startMins = timeToMinutes(startTime)
    let endMins = timeToMinutes(endTime)
    if (endMins < startMins) endMins += 1440

    return existingShots.find(s => {
      if (s.date !== date) return false
      const sStart = timeToMinutes(s.startTime)
      const sEnd = timeToMinutes(calculateEndTime(s.startTime, s.duration))
      return (startMins < sEnd && endMins > sStart)
    })
  }, [startTime, endTime, date, existingShots])

  const handleToggleGear = (id: string) => {
    setEquipmentIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!title.trim() || shotConflict) return

    const startMins = timeToMinutes(startTime)
    let endMins = timeToMinutes(endTime)
    if (endMins < startMins) endMins += 1440
    const diffHours = (endMins - startMins) / 60
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`

    onSubmit({
      id: `shot-${Date.now()}`,
      title: title.trim(),
      sceneNumber: sceneNumber || `${existingShots.length + 1}X`,
      location: location || 'Location TBD',
      date: date,
      startTime,
      duration,
      description,
      remarks,
      status: 'pending',
      equipmentIds,
      preparedEquipmentIds: []
    })
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = (item.customName || item.name).toLowerCase().includes(gearSearch.toLowerCase())
    const matchesCat = gearCategory === 'All' || item.category === gearCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-5 relative h-full flex flex-col">
      <TerminalCard title="Scene Identity">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <Input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Scene title..."
                fullWidth
              />
            </div>
            <div>
              <Input
                type="text"
                value={sceneNumber}
                onChange={e => setSceneNumber(e.target.value)}
                placeholder="Scene number (e.g. 4C)"
                leftIcon={<span className="text-xs font-semibold text-gray-400">SC</span>}
                fullWidth
              />
            </div>
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title="Schedule">
        <div className="p-6 space-y-4">
          <DatePickerInput
            value={date}
            onChange={newDate => setDate(newDate || '')}
            fullWidth
          />
          <div className="grid grid-cols-2 gap-4">
            <TimeSelector 
              label="START TIME" 
              value={startTime} 
              onChange={(newStartTime) => {
                const startMins = timeToMinutes(newStartTime)
                const endMins = timeToMinutes(endTime)
                setStartTime(newStartTime)
                // If start >= end, set end to start + 2 hours (capped at 23:55)
                if (startMins >= endMins) {
                  setEndTime(addHoursToTime(newStartTime, 2))
                }
              }} 
            />
            <TimeSelector 
              label="END TIME" 
              value={endTime} 
              onChange={(newEndTime) => {
                const startMins = timeToMinutes(startTime)
                const endMins = timeToMinutes(newEndTime)
                setEndTime(newEndTime)
                // If end <= start, set start to end - 2 hours (min 00:00)
                if (endMins <= startMins) {
                  setStartTime(subtractHoursFromTime(newEndTime, 2))
                }
              }} 
            />
          </div>

          {shotConflict && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={14} strokeWidth={2.5} />
              <Text variant="label" color="danger">
                Conflict: This slot is already taken by &quot;{shotConflict.title}&quot;
              </Text>
            </div>
          )}
        </div>
      </TerminalCard>

      <TerminalCard title="Location">
        <div className="p-6">
          <Input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter filming location..."
            fullWidth
          />
        </div>
      </TerminalCard>

      <TerminalCard title="Scene Description">
        <div className="p-6">
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the action, atmosphere, and key visual elements..."
            size="md"
          />
        </div>
      </TerminalCard>

      <TerminalCard title="Equipment" headerAction={
        <span className="bg-primary/10 text-primary dark:text-primary px-2.5 py-1 text-xs font-mono tracking-wider">
          {equipmentIds.length} Selected
        </span>
      }>
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
            <input
              type="text"
              value={gearSearch}
              onChange={(e) => setGearSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full bg-[#fafafa] dark:bg-[#0a0a0a]/40 border border-gray-300 dark:border-white/10 pl-9 pr-4 py-2 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-primary dark:focus:border-primary/50"
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => (
              <button
                key={cat}
                onClick={() => setGearCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider whitespace-nowrap border transition-all ${
                  gearCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-[#fafafa] dark:bg-[#0a0a0a]/40 border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/50 hover:border-primary/30 dark:hover:border-white/20 hover:text-gray-800 dark:hover:text-white/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
            {filteredInventory.map(item => {
              const isSelected = equipmentIds.includes(item.id)
              const Icon = CATEGORY_ICONS[item.category] || Package

              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleGear(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 border transition-all text-left group ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-[#fafafa] dark:bg-[#0a0a0a]/20 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 border transition-colors ${
                      isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40'
                    }`}>
                      <Icon size={12} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate leading-none mb-0.5 ${isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.customName || item.name}
                      </p>
                      <p className="text-xs font-mono text-gray-400 dark:text-white/30">{item.category}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 flex items-center justify-center border transition-all ${
                    isSelected ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-[#0a0a0a]/40 border-gray-300 dark:border-white/10 text-transparent'
                  }`}>
                    <Check size={10} strokeWidth={2.5} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </TerminalCard>

      <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#16181D] flex justify-center pb-6 mt-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!title.trim() || !!shotConflict}
          leftIcon={<Save size={18} strokeWidth={2.5} />}
        >
          Add Scene
        </Button>
      </div>
    </div>
  )
}
