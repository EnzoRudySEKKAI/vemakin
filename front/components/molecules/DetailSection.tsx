import React from 'react'
import { motion } from 'framer-motion'
import { Text } from '../atoms/Text'

interface DetailSectionProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  border?: boolean
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  children,
  action,
  className = '',
  border = true
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        ${border ? 'pt-12 border-t border-gray-100 dark:border-white/5' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-8">
        <Text variant="subtitle" color="muted">
          {title}
        </Text>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

interface DetailMetadataItemProps {
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
  isLink?: boolean
  onClick?: () => void
  className?: string
}

export const DetailMetadataItem: React.FC<DetailMetadataItemProps> = ({
  label,
  value,
  subValue,
  isLink = false,
  onClick,
  className = ''
}) => {
  const Content = isLink ? motion.a : motion.div
  
  return (
    <div className={`flex flex-col gap-3 min-w-0 ${className}`}>
      <Text variant="subtitle" color="muted">
        {label}
      </Text>
      <Content
        {...(isLink ? {
          href: '#',
          onClick: (e: React.MouseEvent) => {
            e.preventDefault()
            onClick?.()
          }
        } : {})}
        whileHover={isLink ? { x: 2 } : {}}
        className={`
          flex flex-col py-1.5
          ${isLink ? 'cursor-pointer group' : ''}
        `}
      >
        <Text variant="title" className="block mb-0.5">
          {value}
        </Text>
        {subValue && (
          <Text 
            variant="caption" 
            color={isLink ? 'success' : 'muted'}
            className={isLink ? 'flex items-center gap-1.5 normal-case' : ''}
          >
            {subValue}
          </Text>
        )}
      </Content>
    </div>
  )
}

interface DetailMetadataGridProps {
  children: React.ReactNode
  className?: string
}

export const DetailMetadataGrid: React.FC<DetailMetadataGridProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      grid grid-cols-2 md:grid-cols-2 lg:flex lg:flex-wrap 
      items-start gap-x-8 lg:gap-x-16 gap-y-8
      ${className}
    `}>
      {children}
    </div>
  )
}
