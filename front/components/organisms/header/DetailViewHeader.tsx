import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { useHeaderActions } from '../../../context/HeaderActionsContext'

interface DetailViewHeaderProps {
  className?: string
}

export const DetailViewHeader: React.FC<DetailViewHeaderProps> = ({
  className = ''
}) => {
  const { actions, backAction, detailTitle, detailLabel } = useHeaderActions()

  return (
    <div className={`flex flex-col w-full gap-2 pb-1 ${className}`}>
      <div className="h-[48px] flex items-center justify-start w-full gap-3">
        <button
          onClick={backAction || undefined}
          className={`
            w-10 h-10 rounded-xl bg-white dark:bg-white/10 
            flex items-center justify-center text-gray-700 dark:text-white 
            transition-all font-semibold
            ${backAction ? 'hover:bg-gray-100 dark:hover:bg-white/20' : 'opacity-50 cursor-default'}
          `}
        >
          <ChevronLeft size={20} className="mr-0.5" strokeWidth={2.5} />
        </button>
        
        {detailTitle ? (
          <div className="flex flex-col justify-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
              {detailTitle}
            </span>
          </div>
        ) : (
          // Skeleton Loading
          <div className="flex flex-col justify-center gap-1.5 py-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full">
        {actions}
      </div>
    </div>
  )
}
