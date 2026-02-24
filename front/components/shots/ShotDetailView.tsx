import React, { useState, useCallback, useEffect } from 'react'
import { Plus, Search, Package, Check, ExternalLink } from 'lucide-react'
import { Shot, Note, Equipment } from '@/types'
import { calculateEndTime, formatDateToNumeric, timeToMinutes, addHoursToTime, subtractHoursFromTime } from '@/utils'
import { CATEGORY_ICONS } from '@/constants'
import { useDetailView } from '@/hooks/useDetailView'
import { DetailViewLayout } from '@/components/organisms/DetailViewLayout'
import { ActionButton, ActionButtonGroup } from '@/components/molecules/ActionButton'
import { DetailItem } from '@/components/molecules'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { StatusToggle } from '@/components/molecules/StatusToggle'
import { Text, Input, Button, Textarea } from '@/components/atoms'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TimeSelector } from '@/components/ui/TimeSelector'
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete'
import { DatePickerInput } from '@/components/ui/DatePickerInput'

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface ShotDetailViewProps {
  selectedShot: Shot
  allShots: Shot[]
  notes: Note[]
  onClose: () => void
  onToggleStatus: (id: string) => void
  onToggleEquipment: (shotId: string, equipmentId: string) => void
  onUpdateShot: (updated: Shot) => void
  onDeleteShot: (id: string) => void
  onRetakeShot: (id: string, newDate: string, newTime: string) => void
  onAddNote: (note: Partial<Note>) => void
  onOpenNote?: (id: string) => void
  inventory: Equipment[]
}

export const ShotDetailView: React.FC<ShotDetailViewProps> = ({
  selectedShot,
  notes,
  onClose,
  onToggleStatus,
  onToggleEquipment,
  onUpdateShot,
  onDeleteShot,
  onRetakeShot,
  onAddNote,
  onOpenNote,
  inventory
}) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    setEditedItem,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleCancel
  } = useDetailView<Shot>({
    item: selectedShot,
    onUpdate: onUpdateShot,
    onDelete: onDeleteShot
  })

  const [isRetaking, setIsRetaking] = useState(false)
  const [retakeDate, setRetakeDate] = useState(selectedShot.date)
  const [retakeTime, setRetakeTime] = useState(selectedShot.startTime)
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false)
  const [gearSearchQuery, setGearSearchQuery] = useState('')
  const [activeGearTab, setActiveGearTab] = useState<'list' | 'pool'>('list')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    setRetakeDate(selectedShot.date)
    setRetakeTime(selectedShot.startTime)
  }, [selectedShot])

  const handleRetake = () => {
    onRetakeShot(selectedShot.id, retakeDate, retakeTime)
    setIsRetaking(false)
    onClose()
  }

  const handleEndTimeChange = useCallback((newEndTime: string) => {
    if (!newEndTime) return
    const startMins = timeToMinutes(editedItem.startTime)
    let endMins = timeToMinutes(newEndTime)

    // If end <= start, move start back by 2 hours
    if (endMins <= startMins) {
      const newStartTime = subtractHoursFromTime(newEndTime, 2)
      const newStartMins = timeToMinutes(newStartTime)
      if (endMins < newStartMins) endMins += 1440
      const diffMins = endMins - newStartMins
      const hours = diffMins / 60
      const duration = `${parseFloat(hours.toFixed(2))}h`
      setEditedItem(prev => ({ ...prev, startTime: newStartTime, duration }))
    } else {
      if (endMins - startMins < 5) endMins = startMins + 5
      const diffMins = endMins - startMins
      const hours = diffMins / 60
      const duration = `${parseFloat(hours.toFixed(2))}h`
      setEditedItem(prev => ({ ...prev, duration }))
    }
  }, [editedItem.startTime, setEditedItem])

  const handleAddEquipment = (equipmentId: string) => {
    const currentIds = editedItem.equipmentIds || []
    if (!currentIds.includes(equipmentId)) {
      setEditedItem(prev => ({
        ...prev,
        equipmentIds: [...currentIds, equipmentId]
      }))
    }
  }

  const handleRemoveEquipment = (equipmentId: string) => {
    setEditedItem(prev => ({
      ...prev,
      equipmentIds: (prev.equipmentIds || []).filter(id => id !== equipmentId)
    }))
  }

  const currentEndTime = calculateEndTime(editedItem.startTime, editedItem.duration)

  const currentEquipmentIds = isEditing ? editedItem.equipmentIds : (selectedShot.equipmentIds || [])

  const availableGear = inventory.filter(item =>
    !(editedItem.equipmentIds || []).includes(item.id) &&
    ((item.customName || item.name).toLowerCase().includes(gearSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(gearSearchQuery.toLowerCase())) &&
    (activeCategory === 'All' || item.category === activeCategory)
  )

  const selectedEquipmentIds = selectedShot.equipmentIds || []
  const preparedEquipmentIds = selectedShot.preparedEquipmentIds || []
  const isChecklistComplete = selectedEquipmentIds.length > 0 &&
    preparedEquipmentIds.length === selectedEquipmentIds.length

  const associatedNotes = notes.filter(n => n.shotId === selectedShot.id)

  const headerActions = (
    <div className="flex items-center gap-3">
      {!isEditing ? (
        <>
          <ActionButton type="edit" onClick={() => setIsEditing(true)} title="Edit shot" />
          <ActionButton
            type="retake"
            isActive={isRetaking}
            onClick={() => setIsRetaking(!isRetaking)}
            title="Retake"
          />
          <ActionButton type="delete" onClick={() => setShowDeleteConfirm(true)} title="Delete shot" />
        </>
      ) : (
        <ActionButtonGroup
          isEditing={true}
          onEdit={() => { }}
          onDelete={() => { }}
          onSave={handleSave}
          onCancel={() => {
            handleCancel()
            setGearSearchQuery('')
            setActiveGearTab('list')
            setActiveCategory('All')
          }}
        />
      )}
    </div>
  )

  return (
    <DetailViewLayout
      title={selectedShot.title}
      detailLabel="Shot Detail"
      onBack={onClose}
      actions={headerActions}
      sidebar={
        <div className="space-y-4">
          <TerminalCard
            header="Gear checklist"
            headerRight={!isEditing && (
              <span className="text-primary font-mono text-xs">
                {(selectedShot.preparedEquipmentIds || []).length}/{(selectedShot.equipmentIds || []).length} ready
              </span>
            )}
          >
            <div className="space-y-4">
              {isEditing && (
                <div className="flex border border-border">
                  <button
                    onClick={() => setActiveGearTab('list')}
                    className={`flex-1 py-1.5 text-[10px] font-mono  tracking-wider transition-all ${activeGearTab === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Assigned
                  </button>
                  <button
                    onClick={() => setActiveGearTab('pool')}
                    className={`flex-1 py-1.5 text-[10px] font-mono  tracking-wider transition-all ${activeGearTab === 'pool' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Browse Pool
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {(!isEditing || activeGearTab === 'list') && (
                  currentEquipmentIds.length > 0 ? (
                    <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                      {currentEquipmentIds.map(eId => {
                        const item = inventory.find(i => i.id === eId)
                        const Icon = item ? (CATEGORY_ICONS as any)[item.category] || Package : Package
                        const isReady = !isEditing && (selectedShot.preparedEquipmentIds || []).includes(eId)

                        return (
                          <div
                            key={eId}
                            className={`flex items-center justify-between p-3 transition-all group border ${isReady
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-transparent border-transparent hover:bg-secondary/50'
                              }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className={`p-2.5 transition-all ${isReady
                                ? 'bg-primary/20 text-primary'
                                : 'bg-secondary/50 text-muted-foreground'
                                }`}
                              >
                                <Icon size={18} strokeWidth={2} />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium truncate transition-colors ${isReady ? 'text-primary' : 'text-foreground'}`}>
                                  {item ? (item.customName || item.name) : 'Unknown'}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground">
                                    {item?.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {isEditing ? (
                              <button
                                onClick={() => handleRemoveEquipment(eId)}
                                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                              >
                                <Plus size={16} className="rotate-45" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleEquipment(selectedShot.id, eId)}
                                className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${isReady
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                  }`}
                              >
                                <Check size={14} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-10">
                      <Package size={24} className="mb-2" />
                      <span className="text-[10px] font-mono  tracking-wider">No gear assigned</span>
                    </div>
                  )
                )}

                {isEditing && activeGearTab === 'pool' && (
                  <div className="space-y-4 px-2">
                    <Input
                      type="text"
                      value={gearSearchQuery}
                      onChange={(e) => setGearSearchQuery(e.target.value)}
                      placeholder="Search items..."
                      fullWidth
                      leftIcon={<Search size={14} className="text-muted-foreground" />}
                    />
                    <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {availableGear.length > 0 ? availableGear.map(gear => {
                        const Icon = (CATEGORY_ICONS as any)[gear.category] || Package
                        return (
                          <button
                            key={gear.id}
                            onClick={() => handleAddEquipment(gear.id)}
                            className="w-full flex items-center justify-between p-3 transition-all text-left group border border-transparent hover:border-border hover:bg-secondary/30"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="p-2.5 bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                <Icon size={18} strokeWidth={2} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                  {gear.customName || gear.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground">
                                    {gear.category}
                                  </span>
                                  {gear.status !== 'available' && (
                                    <span className="text-[9px] px-1.5 py-0.5 bg-secondary border border-border font-mono  tracking-wider">
                                      {gear.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-8 h-8 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                              <Plus size={16} />
                            </div>
                          </button>
                        )
                      }) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-10">
                          <Search size={24} className="mb-2" />
                          <span className="text-[10px] font-mono  tracking-wider">Empty results</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TerminalCard>
        </div>
      }
    >
        {isRetaking && (
          <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/30 flex flex-wrap items-center gap-4">
            <Text variant="body" color="warning">Schedule Retake:</Text>
            <DatePickerInput
              value={retakeDate}
              onChange={date => setRetakeDate(date || '')}
              className="w-auto"
            />
          <Input
            type="time"
            value={retakeTime}
            onChange={e => setRetakeTime(e.target.value)}
            className="w-auto"
          />
          <TerminalButton variant="primary" onClick={() => setShowRetakeConfirm(true)}>
            Confirm
          </TerminalButton>
        </div>
      )}

      <div className="flex flex-col gap-8 mb-8">
        {!isEditing && (
          <TerminalCard header="Filming status">
            <div className="">
              <StatusToggle
                status={selectedShot.status as any}
                onToggle={() => onToggleStatus(selectedShot.id)}
              />
            </div>
          </TerminalCard>
        )}

        <TerminalCard header="Shot details">
          <div className="p-2 space-y-10">
            {isEditing ? (
              <>
                {/* Scene Identity */}
                <div className="w-full">
                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-2 block">Scene identity</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3">
                      <Input
                        type="text"
                        value={editedItem.title}
                        onChange={e => setEditedItem({ ...editedItem, title: e.target.value })}
                        placeholder="Scene title..."
                        fullWidth
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        value={editedItem.sceneNumber}
                        onChange={e => setEditedItem({ ...editedItem, sceneNumber: e.target.value })}
                        placeholder="Scene #"
                        leftIcon={<span className="text-[10px] font-mono  tracking-wider text-muted-foreground">SC</span>}
                        fullWidth
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="w-full">
                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-2 block">Schedule</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="relative">
                      <DatePickerInput
                        value={editedItem.date}
                        onChange={date => setEditedItem({ ...editedItem, date: date || '' })}
                        fullWidth
                      />
                    </div>
                    <TimeSelector 
                      label="START TIME" 
                      value={editedItem.startTime} 
                      onChange={v => {
                        const startMins = timeToMinutes(v)
                        const endMins = timeToMinutes(currentEndTime)
                        // If start >= end, adjust duration so end is start + 2 hours
                        if (startMins >= endMins) {
                          const newDuration = '2h'
                          setEditedItem({ ...editedItem, startTime: v, duration: newDuration })
                        } else {
                          setEditedItem({ ...editedItem, startTime: v })
                        }
                      }} 
                    />
                    <TimeSelector label="END TIME" value={currentEndTime} onChange={handleEndTimeChange} />
                  </div>
                </div>

                {/* Location */}
                <div className="w-full relative z-20">
                  <LocationAutocomplete
                    value={editedItem.location}
                    onChange={(value, location) => setEditedItem(prev => ({ 
                      ...prev, 
                      location: value,
                      locationLat: location?.lat,
                      locationLng: location?.lng
                    }))}
                    placeholder="Search filming location..."
                    label="Location"
                  />
                </div>

                {/* Description */}
                <div className="w-full">
                  <span className="text-[10px] font-mono  tracking-wider text-muted-foreground mb-2 block">Description</span>
                  <Textarea
                    value={editedItem.description}
                    onChange={e => setEditedItem({ ...editedItem, description: e.target.value })}
                    placeholder=" Describe the action, atmosphere, and key visual elements..."
                    className="min-h-[120px]"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <DetailItem
                  label="Schedule"
                  value={formatDateToNumeric(selectedShot.date)}
                  subValue={`${selectedShot.startTime} — ${calculateEndTime(selectedShot.startTime, selectedShot.duration)}`}
                />

                <DetailItem
                  label="Location"
                  value={selectedShot.location}
                  subValue="View on Maps"
                  isLink
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShot.location)}`, '_blank')}
                  valueClassName="truncate"
                />

                <DetailItem
                  label="Description"
                  value={selectedShot.description || "No specific instructions provided for this shot."}
                  className="md:col-span-2"
                  valueClassName="whitespace-pre-wrap"
                />
              </div>
            )}
          </div>
        </TerminalCard>
      </div>

      <TerminalCard
        header={`Related notes (${associatedNotes.length})`}
        headerRight={
          <button
            onClick={() => onAddNote({ title: '', content: '', shotId: selectedShot.id, attachments: [] })}
            className="flex items-center gap-2 text-[10px] font-mono  tracking-wider text-primary hover:text-primary/70 transition-colors"
          >
            <Plus size={12} strokeWidth={3} />
            Add Note
          </button>
        }
      >
        <div className="">
          {associatedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associatedNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => onOpenNote?.(note.id)}
                  className="flex flex-col items-start text-left p-5 bg-secondary/30 border border-border hover:border-primary/30 transition-all group"
                >
                  <div className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {note.title || "Untitled Note"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate w-full font-mono">
                    {note.content || "Empty content"}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-10">
              <Plus size={24} className="mb-2" />
              <span className="text-[10px] font-mono  tracking-wider">No associated notes</span>
            </div>
          )}
        </div>
      </TerminalCard>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDeleteShot(selectedShot.id)}
        title="Delete shot"
        message="Are you sure you want to delete this shot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmModal
        isOpen={showRetakeConfirm}
        onClose={() => setShowRetakeConfirm(false)}
        onConfirm={handleRetake}
        title="Schedule retake"
        message={`Are you sure you want to schedule a retake for this shot on ${formatDate(retakeDate)} at ${retakeTime}?`}
        confirmText="Schedule retake"
        cancelText="Cancel"
        variant="warning"
      />
    </DetailViewLayout >
  )
}
