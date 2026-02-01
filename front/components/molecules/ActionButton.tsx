import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Check, X, RotateCcw, CalendarPlus, LucideIcon } from 'lucide-react'

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

const baseStyles = 'flex items-center justify-center rounded-xl transition-all shadow-sm'

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10'
}

const typeStyles: Record<ActionType, { default: string; active?: string }> = {
  edit: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
  },
  delete: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
  },
  save: {
    default: 'bg-[#3762E3] dark:bg-[#4E47DD] text-white shadow-lg shadow-[#3762E3]/20 dark:shadow-[#4E47DD]/20 hover:scale-105 active:scale-95'
  },
  cancel: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
  },
  retake: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white',
    active: 'bg-orange-500 text-white border-orange-600'
  },
  calendar: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
  },
  custom: {
    default: 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
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
  const currentStyle = (isActive && styles.active) ? styles.active : styles.default
  const strokeWidth = strokeWidths[type as keyof typeof strokeWidths] || strokeWidths.default
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${currentStyle} ${className}`}
      title={title}
    >
      <Icon size={iconSizes[size]} strokeWidth={strokeWidth} />
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
