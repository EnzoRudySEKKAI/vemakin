import React, { useState, useCallback, useEffect } from 'react'
import { Plus, Search, Package, Check, ExternalLink } from 'lucide-react'
import { Shot, Note, Equipment } from '../../types'
import { calculateEndTime, formatDateToNumeric, timeToMinutes } from '../../utils'
import { CATEGORY_ICONS } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButton, ActionButtonGroup } from '../../components/molecules/ActionButton'
import { StatusToggle } from '../../components/molecules/StatusToggle'
import { DetailSection } from '../../components/molecules/DetailSection'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { ConfirmModal } from '../ui/ConfirmModal'
import { TimeSelector } from '../ui/TimeSelector'
import { FormTextarea } from '../../components/molecules/FormField'

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

    if (endMins < startMins) endMins += 1440
    if (endMins - startMins < 5) endMins = startMins + 5

    const diffMins = endMins - startMins
    const hours = diffMins / 60
    const duration = `${parseFloat(hours.toFixed(2))}h`

    setEditedItem(prev => ({ ...prev, duration }))
  }, [editedItem.startTime, setEditedItem])

  const handleAddEquipment = (equipmentId: string) => {
    if (!editedItem.equipmentIds.includes(equipmentId)) {
      setEditedItem(prev => ({
        ...prev,
        equipmentIds: [...prev.equipmentIds, equipmentId]
      }))
    }
  }

  const handleRemoveEquipment = (equipmentId: string) => {
    setEditedItem(prev => ({
      ...prev,
      equipmentIds: prev.equipmentIds.filter(id => id !== equipmentId)
    }))
  }

  const currentEndTime = calculateEndTime(editedItem.startTime, editedItem.duration)

  const currentEquipmentIds = isEditing ? editedItem.equipmentIds : selectedShot.equipmentIds

  const availableGear = inventory.filter(item =>
    !editedItem.equipmentIds.includes(item.id) &&
    ((item.customName || item.name).toLowerCase().includes(gearSearchQuery.toLowerCase()) ||
     item.category.toLowerCase().includes(gearSearchQuery.toLowerCase())) &&
    (activeCategory === 'All' || item.category === activeCategory)
  )

  const isChecklistComplete = selectedShot.equipmentIds.length > 0 &&
    selectedShot.preparedEquipmentIds.length === selectedShot.equipmentIds.length

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
          onEdit={() => {}}
          onDelete={() => {}}
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
        <div className="p-2">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/5">
            <Text variant="title">Gear</Text>
            {!isEditing && (
              <div className="flex flex-col items-end">
                <Text variant="caption" color="muted">Checklist</Text>
                <Text variant="subtitle" color="primary">
                  {selectedShot.preparedEquipmentIds.length}/{selectedShot.equipmentIds.length} ready
                </Text>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-4 border-b border-gray-100 dark:border-white/5 mb-6">
              <button
                onClick={() => setActiveGearTab('list')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  activeGearTab === 'list' 
                    ? 'border-blue-600 dark:border-indigo-500 text-gray-900 dark:text-white' 
                    : 'border-transparent text-gray-400'
                }`}
              >
                Assigned
              </button>
              <button
                onClick={() => setActiveGearTab('pool')}
                className={`pb-2 text-xs font-semibold transition-all border-b-2 ${
                  activeGearTab === 'pool' 
                    ? 'border-blue-600 dark:border-indigo-500 text-blue-600 dark:text-indigo-400' 
                    : 'border-transparent text-gray-400'
                }`}
              >
                Browse pool
              </button>
            </div>
          )}

          <div className="space-y-1">
            {(!isEditing || activeGearTab === 'list') && (
              currentEquipmentIds.length > 0 ? (
                <div>
                  {currentEquipmentIds.map(eId => {
                    const item = inventory.find(i => i.id === eId)
                    const Icon = item ? (CATEGORY_ICONS as any)[item.category] || Package : Package
                    const isReady = !isEditing && selectedShot.preparedEquipmentIds.includes(eId)

                    return (
                      <div
                        key={eId}
                        className="py-4 transition-all flex items-center justify-between group border-b border-gray-50 dark:border-white/[0.02] last:border-0"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isReady ? 'text-green-600' : 'text-gray-400 group-hover:text-blue-500'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-base font-semibold truncate ${
                              isReady ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {item ? (item.customName || item.name) : 'Unknown'}
                            </p>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item?.category}</p>
                          </div>
                        </div>
                        {isEditing ? (
                          <ActionButton 
                            type="delete" 
                            size="sm"
                            onClick={() => handleRemoveEquipment(eId)} 
                            title="Remove" 
                          />
                        ) : (
                          <button
                            onClick={() => onToggleEquipment(selectedShot.id, eId)}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              isReady
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-300 hover:bg-green-500/10 hover:text-green-500'
                            }`}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package size={32} className="text-gray-200 mx-auto mb-3"/>
                  <Text variant="caption" color="muted">No gear assigned.</Text>
                </div>
              )
            )}

            {isEditing && activeGearTab === 'pool' && (
              <div className="space-y-4">
                <Input
                  type="text"
                  value={gearSearchQuery}
                  onChange={(e) => setGearSearchQuery(e.target.value)}
                  placeholder="Search pool..."
                  leftIcon={<Search size={16} className="text-gray-400" />}
                  variant="default"
                  fullWidth
                />
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {availableGear.length > 0 ? availableGear.map(gear => {
                    const Icon = (CATEGORY_ICONS as any)[gear.category] || Package
                    return (
                      <button
                        key={gear.id}
                        onClick={() => handleAddEquipment(gear.id)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <Icon size={16} className="text-gray-400"/>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                            {gear.customName || gear.name}
                          </span>
                        </div>
                        <Plus size={16} className="text-blue-500"/>
                      </button>
                    )
                  }) : (
                    <p className="text-center py-8 text-xs font-semibold text-gray-400">No matching gear found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      }
    >
      {isRetaking && (
        <div className="mb-8 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-wrap items-center gap-4">
          <Text variant="subtitle" color="warning">Schedule retake:</Text>
          <input 
            type="date" 
            value={retakeDate} 
            onChange={e => setRetakeDate(e.target.value)} 
            className="bg-transparent border border-orange-500/30 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-white"
          />
          <input 
            type="time" 
            value={retakeTime} 
            onChange={e => setRetakeTime(e.target.value)} 
            className="bg-transparent border border-orange-500/30 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-white"
          />
          <button 
            onClick={() => setShowRetakeConfirm(true)} 
            className="px-4 py-1.5 bg-orange-500 text-white rounded-lg font-semibold text-xs hover:bg-orange-600"
          >
            Confirm
          </button>
        </div>
      )}

      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="mb-3 block">Current status</Text>
          <StatusToggle 
            status={selectedShot.status as any} 
            onToggle={() => onToggleStatus(selectedShot.id)} 
          />
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3 min-w-0">
            <Text variant="subtitle" color="muted">Schedule</Text>
            {isEditing ? (
              <div className="flex flex-col gap-3 max-w-xs">
                <input 
                  type="date" 
                  value={editedItem.date} 
                  onChange={e => setEditedItem({ ...editedItem, date: e.target.value })} 
                  className="bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="flex gap-4">
                  <TimeSelector 
                    label="In" 
                    value={editedItem.startTime} 
                    onChange={v => setEditedItem({ ...editedItem, startTime: v })} 
                  />
                  <TimeSelector 
                    label="Out" 
                    value={currentEndTime} 
                    onChange={handleEndTimeChange} 
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col group py-1.5">
                <Text variant="title" className="block mb-0.5">
                  {formatDateToNumeric(selectedShot.date)}
                </Text>
                <Text variant="caption" color="muted">
                  {selectedShot.startTime} — {calculateEndTime(selectedShot.startTime, selectedShot.duration)}
                </Text>
              </div>
            )}
          </div>

          <div className="min-w-0 lg:flex-1">
            <Text variant="subtitle" color="muted" className="block mb-3">Location</Text>
            {isEditing ? (
              <input 
                type="text" 
                value={editedItem.location} 
                onChange={e => setEditedItem({ ...editedItem, location: e.target.value })} 
                className="w-full max-w-md bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
              />
            ) : (
              <div
                className="flex flex-col group cursor-pointer py-1.5"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShot.location)}`, '_blank')}
              >
                <Text variant="title" className="block mb-0.5 truncate w-full">
                  {selectedShot.location}
                </Text>
                <Text variant="caption" color="success" className="flex items-center gap-1.5 normal-case">
                  View on Google Maps <ExternalLink size={12} />
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center mb-6">
            <Text variant="subtitle" color="muted">Brief</Text>
          </div>
          {isEditing ? (
            <FormTextarea
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              placeholder="Provide direction for this shot..."
              rows={6}
              className="w-full"
            />
          ) : (
            <Text variant="body" color="secondary" className="max-w-3xl">
              {selectedShot.description || "No specific instructions provided for this shot."}
            </Text>
          )}
        </section>

        <DetailSection
          title={`Notes (${associatedNotes.length})`}
          action={
            <button
              onClick={() => onAddNote({ title: '', content: '', shotId: selectedShot.id, attachments: [] })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:bg-blue-500/10 transition-all"
            >
              <Plus size={14} /> Add note
            </button>
          }
          border={true}
        >
          {associatedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associatedNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onOpenNote?.(note.id)}
                  className="p-6 bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-3xl cursor-pointer hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {note.title || "Untitled note"}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-gray-50/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
              <Text variant="caption" color="muted">No notes for this shot yet.</Text>
            </div>
          )}
        </DetailSection>
      </div>

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
        message={`Are you sure you want to schedule a retake for this shot on ${retakeDate} at ${retakeTime}?`}
        confirmText="Schedule retake"
        cancelText="Cancel"
        variant="warning"
      />
    </DetailViewLayout>
  )
}
