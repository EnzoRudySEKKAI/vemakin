import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { Button, Text, Card, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white'
      default:
        return 'bg-primary hover:bg-blue-700 text-white'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-sm bg-white dark:bg-[#16181D] ${radius.md} shadow-xl overflow-hidden border border-gray-100 dark:border-white/10`}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <IconContainer
                  icon={AlertCircle}
                  size="lg"
                  variant={variant === 'danger' ? 'danger' : 'warning'}
                />
                <div>
                  <Text variant="h3" className="leading-tight">{title}</Text>
                </div>
              </div>

              <Text variant="body" color="secondary" className="leading-relaxed mb-6">
                {message}
              </Text>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="md"
                  fullWidth
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  variant={variant === 'danger' ? 'danger' : 'primary'}
                  size="md"
                  fullWidth
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
