import { useState, useCallback, useEffect } from 'react'

interface UseDetailViewOptions<T> {
  item: T
  onUpdate?: (updated: T) => void
  onDelete?: (id: string) => void
  getId?: (item: T) => string
}

interface UseDetailViewReturn<T> {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  editedItem: T
  setEditedItem: React.Dispatch<React.SetStateAction<T>>
  originalItem: T
  hasChanges: boolean
  showDeleteConfirm: boolean
  setShowDeleteConfirm: (value: boolean) => void
  handleSave: () => void
  handleCancel: () => void
  handleDelete: () => void
  handleFieldChange: <K extends keyof T>(field: K, value: T[K]) => void
  reset: () => void
}

export function useDetailView<T extends Record<string, any>>({
  item,
  onUpdate,
  onDelete,
  getId = (item: T) => item.id
}: UseDetailViewOptions<T>): UseDetailViewReturn<T> {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState<T>(item)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!isEditing) {
      setEditedItem(item)
    }
  }, [item, isEditing])

  const hasChanges = JSON.stringify(editedItem) !== JSON.stringify(item)

  const handleSave = useCallback(() => {
    if (onUpdate && hasChanges) {
      onUpdate(editedItem)
    }
    setIsEditing(false)
  }, [onUpdate, editedItem, hasChanges])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedItem(item)
  }, [item])

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(getId(item))
    }
    setShowDeleteConfirm(false)
  }, [onDelete, item, getId])

  const handleFieldChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const reset = useCallback(() => {
    setIsEditing(false)
    setEditedItem(item)
    setShowDeleteConfirm(false)
  }, [item])

  return {
    isEditing,
    setIsEditing,
    editedItem,
    setEditedItem,
    originalItem: item,
    hasChanges,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleCancel,
    handleDelete,
    handleFieldChange,
    reset
  }
}
