import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronDown, ChevronRight, DollarSign, ShieldCheck } from 'lucide-react'
import { Equipment, Currency, Shot } from '../../types'
import { CATEGORY_ICONS } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { Input } from '../../components/atoms/Input'
import { ConfirmModal } from '../ui/ConfirmModal'
import { Card } from '../ui/Card'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useProductionStore } from '@/hooks/useProductionStore'

import api from '@/api/client'

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

  useClickOutside(menuRef, () => { }, false)

  const { catalogCategories } = useProductionStore()

  const brandName = item.brandName
  const modelName = item.modelName

  const categoryName = useMemo(() => {
    return catalogCategories.find(c => c.id === item.category)?.name || item.category
  }, [catalogCategories, item.category])

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
      subtitle={`${categoryName} • ${item.isOwned ? 'Owned' : 'Rented'}`}
      detailLabel="Equipment Detail"
      onBack={onClose}
      actions={headerActions}
      size="wide"
      sidebar={
        <div className="space-y-4">
          <Card title="Project usage">
            <div className="p-2 space-y-1">
              {involvedProjects.length > 0 ? (
                involvedProjects.map((pName) => {
                  const relatedShots = getShotsForEquipmentInProject(pName)
                  const isExpanded = expandedProject === pName

                  return (
                    <div key={pName} className="space-y-1">
                      <button
                        onClick={() => toggleProject(pName)}
                        className={`w-full flex justify-between items-center p-3 rounded-xl transition-all group ${isExpanded ? 'bg-indigo-500/5' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full transition-all ${isExpanded ? 'bg-indigo-500 shadow-[0_0_8px_rgba(78,71,221,0.5)]' : 'bg-white/10'}`} />
                          <span className={`text-sm font-medium truncate transition-colors ${isExpanded ? 'text-indigo-200' : 'text-white/40 group-hover:text-white/60'}`}>
                            {pName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {relatedShots.length > 0 && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border transition-all ${isExpanded ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
                              {relatedShots.length}
                            </span>
                          )}
                          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : 'text-white/10'}`}>
                            <ChevronDown size={14} strokeWidth={2} />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-2 pb-3 pt-1 space-y-0.5">
                              {relatedShots.length > 0 ? (
                                relatedShots.map(shot => (
                                  <button
                                    key={shot.id}
                                    onClick={() => onNavigateToShot(pName, shot.id)}
                                    className="w-full flex items-center justify-between p-3 pl-8 rounded-xl text-left hover:bg-white/5 transition-all group/shot"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white/40 group-hover/shot:text-indigo-200 truncate transition-colors">
                                        {shot.title}
                                      </p>
                                      <p className="text-[10px] text-white/20 mt-0.5">
                                        Sc. {shot.sceneNumber} • {shot.startTime}
                                      </p>
                                    </div>
                                    <ChevronRight size={12} className="text-white/5 group-hover/shot:text-indigo-400 transition-colors" />
                                  </button>
                                ))
                              ) : (
                                <div className="py-4 flex flex-col items-center justify-center text-center opacity-10">
                                  <span className="text-[10px] font-medium">No active sequences</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-10">
                  <Package size={24} className="mb-2" />
                  <span className="text-[10px] font-medium">Currently idle</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      }
    >
      <Card title="Core information" className="mb-8">
        <div className="p-6 space-y-12">


          <div className="grid grid-cols-2 lg:grid-cols-4 items-start gap-12">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Custom name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.customName || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, customName: e.target.value })}
                  className="bg-transparent border-b border-white/20 pb-1 text-sm text-white font-medium focus:border-indigo-500 focus:outline-none w-full"
                  placeholder="Enter custom name"
                />
              ) : (
                <div className="text-sm text-white font-medium truncate">
                  {item.customName || item.name}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Brand</span>
              <div className="text-sm text-white font-medium truncate">
                {brandName || '—'}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Model</span>
              <div className="text-sm text-white font-medium truncate">
                {modelName || '—'}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Category type</span>
              <div className="text-sm text-white font-medium truncate">
                {categoryName}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Serial identity</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem.serialNumber || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, serialNumber: e.target.value })}
                  className="bg-transparent border-b border-white/20 pb-1 text-sm text-white font-medium font-mono focus:border-indigo-500 focus:outline-none w-full"
                  placeholder="Enter serial number"
                />
              ) : (
                <div className="text-sm text-white font-medium truncate font-mono">
                  {item.serialNumber || '—'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Ownership detail" className="mb-8">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-white/40 font-medium mb-2 block">Deployment registry</span>
              <div className="text-sm text-white/60 font-medium">
                {item.isOwned ? 'Owned' : 'Rented'}
              </div>
            </div>

            {!item.isOwned && (
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] text-white/40 font-medium mb-2 block">Rental cost rate</span>
                <div className="text-sm text-white font-medium">
                  {currency.symbol}{(item.rentalPrice ?? 0).toLocaleString()} <span className="text-white/40 text-xs font-normal">per {item.rentalFrequency}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title="Technical specifications">
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
            {Object.entries(item.specs).map(([key, val]) => (
              <div key={key} className="group">
                <span className="text-[10px] text-white/40 font-medium block mb-2 leading-none group-hover:text-indigo-400 transition-colors">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="text-sm text-white/80 font-medium group-hover:text-white transition-colors">
                  {String(val || "UNDEFINED")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

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
