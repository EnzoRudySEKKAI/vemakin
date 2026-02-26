import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { radius, typography } from '../../design-system'
import { Button } from './Button'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal subtitle */
  subtitle?: string
  /** Modal content */
  children: React.ReactNode
  /** Modal footer content (buttons, etc.) */
  footer?: React.ReactNode
  /** Modal size */
  size?: ModalSize
  /** Whether to show close button in header */
  showCloseButton?: boolean
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean
  /** Additional classes for modal container */
  className?: string
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`
              w-full
              ${sizeStyles[size]}
              ${radius['2xl']}
              bg-white dark:bg-[#16181D]
              border border-gray-100 dark:border-white/10
              shadow-2xl
              overflow-hidden
              max-h-[90vh]
              flex flex-col
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-white/5">
                <div>
                  {title && (
                    <h3 className={`${typography.size.xl} ${typography.weight.semibold} text-gray-900 dark:text-white`}>
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className={`${typography.size.sm} ${typography.weight.medium} text-gray-500 dark:text-gray-400 mt-1`}>
                      {subtitle}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-4 shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-50 dark:border-white/5">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Simple confirmation modal preset
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** Confirmation message */
  message: string
  /** Confirm button text */
  confirmText?: string
  /** Cancel button text */
  cancelText?: string
  /** Callback when confirmed */
  onConfirm: () => void
  /** Whether action is destructive */
  isDestructive?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isDestructive = false,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={modalProps.onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="md"
            onClick={() => {
              onConfirm()
              modalProps.onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className={`${typography.size.base} ${typography.weight.semibold} text-gray-700 dark:text-gray-300`}>
        {message}
      </p>
    </Modal>
  )
}
