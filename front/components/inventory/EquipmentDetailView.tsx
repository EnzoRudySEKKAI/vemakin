import React, { useMemo } from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { Equipment, Currency, Shot } from '../../types'
import { CATEGORY_ICONS } from '../../constants'
import { useDetailView } from '../../hooks/useDetailView'
import { DetailViewLayout } from '../../components/organisms/DetailViewLayout'
import { ActionButtonGroup } from '../../components/molecules/ActionButton'
import { DetailItem, EditableField, LinkedItemsList, EmptyState, MetadataGrid, MetadataSection } from '../../components/molecules'
import { ConfirmModal } from '../ui/ConfirmModal'
import { TerminalCard } from '../ui/TerminalCard'
import { useCatalogCategories } from '@/hooks/useApi'

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

  const { data: catalogCategories = [] } = useCatalogCategories()

  const brandName = item.brandName
  const modelName = item.modelName

  const categoryName = useMemo(() => {
    return catalogCategories.find((c: { id: string; name: string }) => c.id === item.category)?.name || item.category
  }, [catalogCategories, item.category])

  const Icon = (CATEGORY_ICONS as any)[item.category] || Package

  const getShotsForEquipmentInProject = (projectName: string): Shot[] => {
    const projectShots = projectData[projectName]?.shots || []
    return projectShots.filter((s: Shot) => s.equipmentIds.includes(item.id))
  }

  const projectItems = useMemo(() => {
    return involvedProjects.map(pName => ({
      id: pName,
      title: pName,
      subtitle: `${getShotsForEquipmentInProject(pName).length} shots`,
      badge: getShotsForEquipmentInProject(pName).length
    }))
  }, [involvedProjects, projectData, item.id])

  const expandedContent = useMemo(() => {
    const content: Record<string, React.ReactNode> = {}
    involvedProjects.forEach(pName => {
      const relatedShots = getShotsForEquipmentInProject(pName)
      content[pName] = (
        <div className="space-y-0.5">
          {relatedShots.length > 0 ? (
            relatedShots.map(shot => (
              <button
                key={shot.id}
                onClick={() => onNavigateToShot(pName, shot.id)}
                className="w-full flex items-center justify-between p-3 pl-8 text-left hover:bg-secondary/50 transition-all group/shot"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground group-hover/shot:text-primary truncate transition-colors">
                    {shot.title}
                  </p>
                  <p className="text-[10px] font-mono tracking-wider text-muted-foreground mt-0.5">
                    Sc. {shot.sceneNumber} • {shot.startTime}
                  </p>
                </div>
                <ChevronRight size={12} className="text-border group-hover/shot:text-primary transition-colors" />
              </button>
            ))
          ) : (
            <EmptyState
              icon={() => <span className="text-[10px] font-mono tracking-wider">No active sequences</span>}
              message=""
              variant="subtle"
            />
          )}
        </div>
      )
    })
    return content
  }, [involvedProjects, projectData, item.id, onNavigateToShot])

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
          <LinkedItemsList
            title="Project usage"
            items={projectItems}
            expandable
            expandedContent={expandedContent}
            emptyMessage="Currently idle"
            emptyIcon={Package}
          />
        </div>
      }
    >
      <TerminalCard header="Core information" className="mb-4 md:mb-8">
        <div className="p-2">
          <MetadataGrid cols={2} colsLg={4} gapX={12} gapY={10}>
            <EditableField
              label="Custom name"
              value={editedItem.customName || ''}
              isEditing={isEditing}
              onChange={(value) => setEditedItem({ ...editedItem, customName: value })}
              placeholder={item.name}
            />

            <DetailItem
              label="Brand"
              value={brandName || '—'}
            />

            <DetailItem
              label="Model"
              value={modelName || '—'}
            />

            <DetailItem
              label="Category type"
              value={categoryName}
            />

            <EditableField
              label="Serial identity"
              value={editedItem.serialNumber || ''}
              isEditing={isEditing}
              onChange={(value) => setEditedItem({ ...editedItem, serialNumber: value })}
              placeholder="Enter serial number"
            />
          </MetadataGrid>
        </div>
      </TerminalCard>

      <TerminalCard header="Ownership detail" className="mb-4 md:mb-8">
        <div className="p-2">
          <MetadataGrid cols={2} gapX={12} gapY={10}>
            <DetailItem
              label="Deployment registry"
              value={item.isOwned ? 'Owned' : 'Rented'}
            />

            {!item.isOwned && (
              <DetailItem
                label="Rental cost rate"
                value={`${currency.symbol}${(item.rentalPrice ?? 0).toLocaleString()}`}
                subValue={`per ${item.rentalFrequency}`}
              />
            )}
          </MetadataGrid>
        </div>
      </TerminalCard>

      <TerminalCard header="Technical specifications" className="mb-4 md:mb-8">
        <div className="p-2">
          <MetadataGrid cols={2} colsMd={3} gapX={12} gapY={10}>
            {Object.entries(item.specs).map(([key, val]) => (
              <DetailItem
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                value={String(val || "UNDEFINED")}
              />
            ))}
          </MetadataGrid>
        </div>
      </TerminalCard>

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
