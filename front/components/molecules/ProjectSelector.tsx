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
        className="w-full flex items-center justify-between p-4 rounded-xl bg-[#16181D] border border-white/[0.05] hover:border-white/[0.1] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Folder size={20} className="text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/40">Current Production</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-white">{currentProject}</span>
              <ChevronDown size={14} className="text-white/40" />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#16181D] rounded-xl p-2 border border-white/[0.08] shadow-2xl z-30 overflow-hidden"
            >
              <div className="max-h-[240px] overflow-y-auto">
                {Object.keys(projects).map(projectName => (
                  <button
                    key={projectName}
                    onClick={() => { onSelect(projectName); setIsOpen(false); }}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-colors text-sm
                      ${currentProject === projectName 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-white/60 hover:bg-white/5'
                      }
                    `}
                  >
                    {projectName}
                    {currentProject === projectName && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="h-px bg-white/[0.05] my-2" />
              <button
                onClick={() => { onCreate("New Project"); setIsOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-sm text-white/60 hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                Create New Project
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectSelector
