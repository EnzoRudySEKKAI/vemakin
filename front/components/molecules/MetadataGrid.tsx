import React from 'react'

export type MetadataGridCols = 1 | 2 | 3 | 4

export interface MetadataGridProps {
  children: React.ReactNode
  cols?: MetadataGridCols
  colsMd?: MetadataGridCols
  colsLg?: MetadataGridCols
  gapX?: number
  gapY?: number
  className?: string
}

const getGridColsClass = (cols?: MetadataGridCols) => {
  if (!cols) return ''
  return {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[cols]
}

export const MetadataGrid: React.FC<MetadataGridProps> = ({
  children,
  cols,
  colsMd,
  colsLg,
  gapX = 12,
  gapY = 10,
  className = ''
}) => {
  const baseCols = cols ? getGridColsClass(cols) : 'grid-cols-1'
  const mdCols = colsMd ? `md:${getGridColsClass(colsMd)}` : ''
  const lgCols = colsLg ? `lg:${getGridColsClass(colsLg)}` : ''

  return (
    <div 
      className={`
        grid ${baseCols} ${mdCols} ${lgCols}
        gap-x-${gapX} gap-y-${gapY}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export const MetadataSection: React.FC<{
  title?: string
  children: React.ReactNode
  className?: string
}> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {title && (
        <span className="text-[10px] font-mono tracking-wider text-muted-foreground mb-6 block">
          {title.toUpperCase()}
        </span>
      )}
      {children}
    </div>
  )
}
