import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useHeaderActions } from '../../context/HeaderActionsContext'

export type DetailViewSize = 'default' | 'wide' | 'full'

interface DetailViewLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  detailLabel: string
  onBack: () => void
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  size?: DetailViewSize
  className?: string
  animation?: boolean
}

const sizeClasses: Record<DetailViewSize, string> = {
  default: 'max-w-7xl',
  wide: 'max-w-[1920px]',
  full: 'max-w-none'
}

export const DetailViewLayout: React.FC<DetailViewLayoutProps> = ({
  children,
  title,
  subtitle,
  detailLabel,
  onBack,
  actions,
  sidebar,
  size = 'default',
  className = '',
  animation = true
}) => {
  const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions()

  useEffect(() => {
    setTitle(title)
    setSubtitle(subtitle || null)
    setDetailLabel(detailLabel)
    setOnBack(onBack)

    return () => {
      setTitle(null)
      setSubtitle(null)
      setDetailLabel(null)
      setActions(null)
      setOnBack(undefined)
    }
  }, [title, subtitle, detailLabel, onBack, setTitle, setSubtitle, setDetailLabel, setActions, setOnBack])

  useEffect(() => {
    if (actions) {
      setActions(actions)
    }
  }, [actions, setActions])

  return (
    <motion.div
      initial={animation ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        flex flex-col h-full 
        bg-transparent dark:bg-[#141417] 
        min-h-0
        ${className}
      `}
    >
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className={`${sizeClasses[size]} mx-auto p-4 md:p-8 pt-3 pb-32`}>
          {sidebar ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
              <div className="xl:col-span-8 space-y-12">
                {children}
              </div>
              <aside className="xl:col-span-4 lg:sticky lg:top-8 self-start">
                {sidebar}
              </aside>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface DetailViewContextBarProps {
  children: React.ReactNode
  className?: string
}

export const DetailViewContextBar: React.FC<DetailViewContextBarProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      flex flex-col gap-8 
      mb-12 pb-10 
      border-b border-gray-100 dark:border-white/5
      ${className}
    `}>
      {children}
    </div>
  )
}

interface DetailViewStatusSectionProps {
  children: React.ReactNode
  className?: string
}

export const DetailViewStatusSection: React.FC<DetailViewStatusSectionProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
}

interface DetailViewMetadataGridProps {
  children: React.ReactNode
  className?: string
}

export const DetailViewMetadataGrid: React.FC<DetailViewMetadataGridProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      grid grid-cols-2 lg:flex lg:flex-wrap 
      items-start gap-x-8 lg:gap-x-16 gap-y-8
      ${className}
    `}>
      {children}
    </div>
  )
}

interface DetailViewMetadataItemProps {
  label: string
  children: React.ReactNode
  className?: string
}

export const DetailViewMetadataItem: React.FC<DetailViewMetadataItemProps> = ({
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="detail-subtitle dark:text-white">{label}</span>
      {children}
    </div>
  )
}
