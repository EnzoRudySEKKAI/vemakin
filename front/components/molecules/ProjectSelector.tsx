import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, ChevronDown, Check, Plus } from 'lucide-react'

interface ProjectSelectorProps {
  currentProject: string
  projects: Record<string, any>
  onSelect: (name: string) => void
  onCreate: (name: string) => void
  className?: string
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  currentProject,
  projects,
  onSelect,
  onCreate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/5 p-3 rounded-2xl flex items-center justify-between group active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-blue-500 dark:text-indigo-500">
            <Folder size={20} fill="currentColor" className="opacity-80" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-semibold text-gray-500">Current production</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {currentProject} <ChevronDown size={14} className="text-gray-500" />
            </span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252529] rounded-3xl p-2 border border-gray-200 dark:border-white/10 shadow-2xl z-30 overflow-hidden"
            >
              <div className="max-h-[240px] overflow-y-auto">
                {Object.keys(projects).map(projectName => (
                  <button
                    key={projectName}
                    onClick={() => { onSelect(projectName); setIsOpen(false); }}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-2xl mb-1 transition-colors
                      ${currentProject === projectName 
                        ? 'bg-blue-50 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      }
                    `}
                  >
                    <span className="font-semibold">{projectName}</span>
                    {currentProject === projectName && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-100 dark:bg-white/5 my-2" />
              <button
                onClick={() => { onCreate("New Project"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                Create new project
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
