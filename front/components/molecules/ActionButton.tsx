import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Check, X, RotateCcw, CalendarPlus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  custom: Edit3,
}

const buttonSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
}

const iconSizes = {
  sm: 14,
  md: 16,
}

const strokeWidths: Record<string, number> = {
  save: 2.5,
  default: 2,
}

const variantStyles = {
  ghost: {
    base: 'border border-transparent text-muted-foreground hover:border-border hover:text-foreground dark:hover:border-white/10 dark:hover:text-white',
    active: 'bg-primary/10 border-primary/50 text-primary',
  },
  danger: {
    base: 'border border-transparent text-red-500 hover:border-red-500/50 hover:bg-red-500/10',
    active: 'border-red-500/50 bg-red-500/10 text-red-500',
  },
  primary: {
    base: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    active: 'bg-primary text-primary-foreground border-primary',
  },
}

const typeToVariant: Record<ActionType, keyof typeof variantStyles> = {
  edit: 'ghost',
  delete: 'danger',
  save: 'primary',
  cancel: 'ghost',
  retake: 'ghost',
  calendar: 'ghost',
  custom: 'ghost',
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  isActive = false,
  title,
  className = '',
  customIcon,
  size = 'md',
}) => {
  const Icon = customIcon || iconMap[type]
  const variant = typeToVariant[type]
  const styles = variantStyles[variant]

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-center',
        'transition-all duration-200',
        buttonSizes[size],
        isActive ? styles.active : styles.base,
        className
      )}
      title={title}
    >
      <Icon
        size={iconSizes[size]}
        strokeWidth={strokeWidths[type] || strokeWidths.default}
        className="transition-colors"
      />
    </motion.button>
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
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!isEditing ? (
        <>
          <ActionButton type="edit" onClick={onEdit} title="Edit" />
          {extraActions}
          <ActionButton type="delete" onClick={onDelete} title="Delete" />
        </>
      ) : (
        <>
          <ActionButton type="cancel" onClick={onCancel} title="Cancel changes" />
          <ActionButton type="save" onClick={onSave} title="Save changes" />
        </>
      )}
    </div>
  )
}
