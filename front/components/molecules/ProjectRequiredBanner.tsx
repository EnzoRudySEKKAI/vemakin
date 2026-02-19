import React from 'react'
import { AlertCircle, Plus } from 'lucide-react'

interface ProjectRequiredBannerProps {
  onCreateProject: () => void
  message?: string
}

export const ProjectRequiredBanner: React.FC<ProjectRequiredBannerProps> = ({
  onCreateProject,
  message = "You need to create a project before you can save this item"
}) => {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
      <div className="flex items-start gap-3">
        <AlertCircle 
          size={20} 
          strokeWidth={2.5} 
          className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" 
        />
        <div className="flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            {message}
          </p>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectRequiredBanner
