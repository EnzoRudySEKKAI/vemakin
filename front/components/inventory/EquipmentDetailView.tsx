import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronDown, ChevronRight, DollarSign, ShieldCheck } from 'lucide-react'
import { Equipment, Currency, Shot } from '../../types'
import { CATEGORY_ICONS } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Text } from '../../components/atoms/Text'
import { Input } from '../../components/atoms/Input'
import { ConfirmModal } from '../ui/ConfirmModal'
import { useClickOutside } from '../../hooks/useClickOutside'

interface EquipmentDetailViewProps {
  item: Equipment
  involvedProjects?: string[]
  projectData: Record<string, any>
  onClose: () => void
  onNavigateToShot: (projectName: string, shotId: string) => void
  currency: Currency
  onUpdate?: (updated: Equipment) => void
  onDelete?: (id: string) => void
}

export const EquipmentDetailView: React.FC<EquipmentDetailViewProps> = ({
  item,
  involvedProjects = [],
  projectData,
  onClose,
  onNavigateToShot,
  currency,
  onUpdate,
  onDelete
}) => {
  const {
    isEditing,
    setIsEditing,
    editedItem,
    setEditedItem,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleCancel,
    handleDelete
  } = useDetailView<Equipment>({
    item,
    onUpdate,
    onDelete
  })

  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, () => {}, false)

  const Icon = (CATEGORY_ICONS as any)[item.category] || Package

  const getShotsForEquipmentInProject = (projectName: string): Shot[] => {
    const projectShots = projectData[projectName]?.shots || []
    return projectShots.filter((s: Shot) => s.equipmentIds.includes(item.id))
  }

  const toggleProject = (projectName: string) => {
    setExpandedProject(prev => prev === projectName ? null : projectName)
  }

  const headerActions = (
    <ActionButtonGroup
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onDelete={() => setShowDeleteConfirm(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )

  return (
    <DetailViewLayout
      title={item.name}
      subtitle={`${item.category} • ${item.isOwned ? 'Owned' : 'Rented'}`}
      detailLabel="Equipment Detail"
      onBack={onClose}
      actions={headerActions}
      size="wide"
      sidebar={
        <div className="p-2">
          <div className="mb-10">
            <Text variant="title" className="mb-2">Project usage</Text>
          </div>

          <div className="space-y-1">
            {involvedProjects.length > 0 ? (
              involvedProjects.map((pName) => {
                const relatedShots = getShotsForEquipmentInProject(pName)
                const isExpanded = expandedProject === pName

                return (
                  <div key={pName} className="border-b border-gray-100/50 dark:border-white/5 last:border-none bg-transparent">
                    <button
                      onClick={() => toggleProject(pName)}
                      className={`w-full flex justify-between items-center py-4 px-4 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-all group my-1 ${
                        isExpanded ? 'bg-white/50 dark:bg-white/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={`text-sm font-semibold truncate ${
                          isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {pName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {relatedShots.length > 0 && (
                          <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                            {relatedShots.length} Scenes
                          </span>
                        )}
                        <div className={`transition-transform duration-300 text-gray-400 dark:text-gray-500 ${
                          isExpanded ? 'rotate-180 text-blue-600 dark:text-indigo-400' : ''
                        }`}>
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-2 pb-4 pt-1 space-y-2">
                            {relatedShots.length > 0 ? (
                              relatedShots.map(shot => (
                                <button
                                  key={shot.id}
                                  onClick={() => onNavigateToShot(pName, shot.id)}
                                  className="w-full flex items-center justify-between p-3 pl-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all group/shot"
                                >
                                  <div className="flex items-center gap-4 truncate">
                                    <div className="truncate">
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover/shot:text-gray-900 dark:group-hover/shot:text-white truncate transition-colors">
                                        {shot.title}
                                      </p>
                                      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/30 dark:bg-indigo-400/30 group-hover/shot:bg-blue-500 dark:group-hover/shot:bg-indigo-400 transition-colors" />
                                        Sc. {shot.sceneNumber}
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        {shot.startTime}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover/shot:text-blue-400 dark:text-indigo-400 mr-2" strokeWidth={2.5} />
                                </button>
                              ))
                            ) : (
                              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 py-3 italic pl-6 border-l-2 border-dashed border-gray-200 dark:border-white/10">
                                No active shoots scheduled
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                <Package size={32} className="mb-4 text-gray-300" />
                <p className="text-sm font-semibold text-gray-400 leading-tight">Currently<br />Unassigned</p>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="mb-3 block text-center sm:text-left dark:text-white">
            Availability
          </Text>

          <div className={`flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 w-full ${
            item.isOwned
              ? 'bg-[#3762E3]/5 dark:bg-[#4E47DD]/10 border-[#3762E3]/20 dark:border-[#4E47DD]/20 text-[#3762E3] dark:text-[#4E47DD]'
              : 'bg-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${
                item.isOwned 
                  ? 'bg-[#3762E3] dark:bg-[#4E47DD] shadow-[0_0_8px_rgba(55,98,227,0.4)]' 
                  : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
              }`} />
              <Text variant="body">
                {item.isOwned ? 'Owned asset' : 'Rented equipment'}
              </Text>
            </div>
            {item.isOwned ? <ShieldCheck size={16} className="opacity-40" /> : <DollarSign size={16} className="opacity-40" />}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
          {(isEditing || item.customName) && (
            <div className="flex flex-col gap-1 min-w-0">
              <Text variant="subtitle" color="muted" className="dark:text-white">Name</Text>
              {isEditing ? (
                <Input
                  type="text"
                  value={editedItem.customName || ''}
                  onChange={e => setEditedItem({ ...editedItem, customName: e.target.value })}
                  placeholder="e.g. A-CAM"
                  variant="underline"
                  className="w-32"
                />
              ) : (
                <Text variant="title" className="block leading-tight py-1.5 truncate">
                  {item.customName}
                </Text>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1 min-w-0">
            <Text variant="subtitle" color="muted" className="dark:text-white">Category</Text>
            <Text variant="title" className="block leading-tight py-1.5">
              {item.category}
            </Text>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <Text variant="subtitle" color="muted" className="dark:text-white">Serial number</Text>
            {isEditing ? (
              <Input
                type="text"
                value={editedItem.serialNumber || ''}
                onChange={e => setEditedItem({ ...editedItem, serialNumber: e.target.value })}
                placeholder="S/N"
                variant="underline"
              />
            ) : (
              <Text variant="title" className="block leading-tight py-1.5">
                {item.serialNumber || "No serial label"}
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <Text variant="subtitle" color="muted" className="dark:text-white">Reference</Text>
            <Text variant="title" className="block leading-tight py-1.5 truncate">
              {item.name}
            </Text>
          </div>
        </div>
      </div>

      {!item.isOwned && (
        <section className="bg-orange-50 dark:bg-orange-500/[0.03] border border-orange-100 dark:border-orange-500/20 rounded-[32px] p-8 flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-200 dark:border-orange-500/20">
              <DollarSign size={24} strokeWidth={2.5} />
            </div>
            <div>
              <Text variant="caption" color="warning" className="block mb-1">Rental rate</Text>
              <p className="detail-title text-orange-900 dark:text-orange-50 leading-none">
                {currency.symbol}{(item.rentalPrice ?? 0).toLocaleString()}
                <Text variant="subtitle" color="warning" className="ml-2 opacity-50">/ {item.rentalFrequency}</Text>
              </p>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-10">
          <Text variant="subtitle" color="muted" className="mb-1 dark:text-white">Technical specifications</Text>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
          {Object.entries(item.specs).map(([key, val]) => (
            <div key={key} className="group">
              <Text variant="subtitle" color="muted" className="block mb-2.5 leading-none dark:text-white">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Text variant="title">
                {String(val || "—")}
              </Text>
            </div>
          ))}
        </div>
      </section>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Equipment"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </DetailViewLayout>
  )
}
