import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Check, X, RotateCcw, CalendarPlus, LucideIcon } from 'lucide-react'
import { Button, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

export type ActionType = 'edit' | 'delete' | 'save' | 'cancel' | 'retake' | 'calendar' | 'custom'

interface ActionButtonProps {
  type: ActionType
  onClick: () => void
  isActive?: boolean
  title?: string
  className?: string
  customIcon?: LucideIcon
  size?: 'sm' | 'md'
}

const iconMap: Record<ActionType, LucideIcon> = {
  edit: Edit3,
  delete: Trash2,
  save: Check,
  cancel: X,
  retake: RotateCcw,
  calendar: CalendarPlus,
  custom: Edit3
}

const typeStyles: Record<ActionType, { variant: 'primary' | 'secondary' | 'ghost' | 'danger'; active?: string }> = {
  edit: {
    variant: 'ghost'
  },
  delete: {
    variant: 'danger'
  },
  save: {
    variant: 'primary'
  },
  cancel: {
    variant: 'ghost'
  },
  retake: {
    variant: 'ghost',
    active: 'bg-orange-500 text-white border-orange-600'
  },
  calendar: {
    variant: 'ghost'
  },
  custom: {
    variant: 'ghost'
  }
}

const iconSizes = {
  sm: 16,
  md: 20
}

const strokeWidths = {
  save: 3,
  default: 2.5
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  isActive = false,
  title,
  className = '',
  customIcon,
  size = 'md'
}) => {
  const Icon = customIcon || iconMap[type]
  const styles = typeStyles[type]
  const strokeWidth = strokeWidths[type as keyof typeof strokeWidths] || strokeWidths.default
  
  return (
    <Button
      onClick={onClick}
      variant={styles.variant}
      size={size}
      className={`${className} ${isActive && styles.active ? styles.active : ''}`}
      title={title}
    >
      <Icon size={iconSizes[size]} strokeWidth={strokeWidth} />
    </Button>
  )
}

interface ActionButtonGroupProps {
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: () => void
  onCancel: () => void
  extraActions?: React.ReactNode
  className?: string
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  extraActions,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {!isEditing ? (
        <>
          <ActionButton type="edit" onClick={onEdit} title="Edit" />
          {extraActions}
          <ActionButton type="delete" onClick={onDelete} title="Delete" />
        </>
      ) : (
        <div className="flex gap-3">
          <ActionButton type="cancel" onClick={onCancel} title="Cancel changes" />
          <ActionButton type="save" onClick={onSave} title="Save changes" />
        </div>
      )}
    </div>
  )
}
