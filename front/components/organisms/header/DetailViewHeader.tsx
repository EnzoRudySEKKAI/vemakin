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
    <div className={`flex flex-col w-full gap-2 ${className}`}>
      <div className="flex items-center justify-start gap-3">
        <button
          onClick={backAction || undefined}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all
            ${backAction 
              ? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white' 
              : 'opacity-50 cursor-default'
            }
          `}
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        
        {detailTitle ? (
          <div className="flex flex-col justify-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
              {detailTitle}
            </span>
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-1.5 py-1">
            <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded-md animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
  )
}

export default DetailViewHeader
