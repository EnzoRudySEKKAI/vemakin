import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, ChevronDown, Check, Plus } from 'lucide-react'
import { Button, Text, IconContainer, Card } from '@/components/atoms'
import { radius, typography } from '@/design-system'

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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        size="lg"
        fullWidth
        className="flex items-center justify-between group active:scale-[0.99] h-20 py-5"
      >
        <div className="flex items-center gap-4">
          <IconContainer icon={Folder} size="lg" variant="accent" />
          <div className="flex flex-col items-start gap-1">
            <Text variant="label" color="muted">Current Production</Text>
            <div className="flex items-center gap-2">
              <Text variant="h2">{currentProject}</Text>
              <ChevronDown size={16} strokeWidth={2.5} className="text-gray-500" />
            </div>
          </div>
        </div>
      </Button>

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
                    <Text variant="body">{projectName}</Text>
                    {currentProject === projectName && <Check size={16} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-100 dark:bg-white/5 my-2" />
              <Button
                onClick={() => { onCreate("New Project"); setIsOpen(false); }}
                variant="ghost"
                size="md"
                fullWidth
                leftIcon={<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center"><Plus size={16} strokeWidth={2.5} /></div>}
                className="justify-start"
              >
                Create New Project
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
