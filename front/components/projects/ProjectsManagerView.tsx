import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Trash2, Edit3, Check, X, FolderOpen, AlertCircle, Plus } from 'lucide-react'
import { TerminalCard } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'

interface ProjectsManagerViewProps {
  projects: string[]
  currentProject: string
  onSelectProject: (name: string) => void
  onDeleteProject: (name: string) => void
  onRenameProject: (oldName: string, newName: string) => void
  onBack: () => void
  onCreateProject?: () => void
}

export const ProjectsManagerView: React.FC<ProjectsManagerViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onBack,
  onCreateProject
}) => {
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = (name: string) => {
    setEditingProject(name)
    setEditValue(name)
  }

  const cancelEditing = () => {
    setEditingProject(null)
    setEditValue('')
  }

  const saveEditing = () => {
    if (editValue && editValue !== editingProject) {
      onRenameProject(editingProject!, editValue)
    }
    setEditingProject(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full max-w-2xl mx-auto px-0"
    >
      <div className="flex-1 space-y-6 pb-32" style={{ paddingTop: '100px' }}>
        
        <motion.div variants={itemVariants}>
          <TerminalCard header="Project management">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-primary/30 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-xs leading-relaxed text-gray-600 dark:text-white/30 font-medium">
                  Deleting a project will permanently remove all associated shots, inventory assignments, and pipeline tasks. This action cannot be undone.
                </p>
              </div>
            </div>
          </TerminalCard>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold  tracking-[0.2em] text-gray-500 dark:text-white/30">Active workspaces</h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-400 dark:text-white/20">{projects.length} Projects</span>
            {onCreateProject && (
              <TerminalButton
                onClick={onCreateProject}
                variant="primary"
                size="sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                New
              </TerminalButton>
            )}
          </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {projects.map(project => {
                const isCurrent = project === currentProject
                const isEditing = editingProject === project

                return (
                  <motion.div
                    layout
                    key={project}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative group"
                  >
                    <div className={`
                      p-4 flex items-center justify-between transition-all duration-300 border
                      ${isCurrent 
                        ? 'bg-[#fafafa] dark:bg-[#0a0a0a]/40 border-primary/50' 
                        : 'bg-[#fafafa] dark:bg-[#0a0a0a]/40 border-gray-300 dark:border-white/10 hover:border-primary/30 dark:hover:border-white/20'}
                      ${isEditing ? 'border-primary' : ''}
                    `}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`
                          w-12 h-12 border flex items-center justify-center transition-colors
                          ${isCurrent ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/20'}
                        `}>
                          <Briefcase size={22} strokeWidth={2.5} />
                        </div>

                        {isEditing ? (
                          <div className="flex-1 mr-4">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditing()
                                if (e.key === 'Escape') cancelEditing()
                              }}
                              className="w-full bg-[#fafafa] dark:bg-[#0a0a0a]/40 border border-gray-300 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-all"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isEditing && onSelectProject(project)}>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-base font-bold truncate ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60'}`}>
                                {project}
                              </h3>
                              {isCurrent && (
                                <div className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-[8px] font-bold text-primary tracking-wider">
                                  Active
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-white/20 font-medium mt-0.5">Production Workspace</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEditing}
                              className="w-9 h-9 flex items-center justify-center text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-colors"
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-white/10 transition-colors"
                            >
                              <X size={18} strokeWidth={3} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(project)}
                              className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-white/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Rename"
                            >
                              <Edit3 size={16} strokeWidth={2.5} />
                            </button>

                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${project}"?`)) {
                                    onDeleteProject(project)
                                  }
                                }}
                                className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-white/20 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center gap-8">
          <TerminalButton 
            onClick={onBack}
            variant="secondary"
          >
            <FolderOpen size={14} strokeWidth={2.5} />
            <span>Return To Settings</span>
          </TerminalButton>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-mono text-gray-400 dark:text-white/20 tracking-[0.3em]">Project management console</p>
            <p className="text-[10px] font-mono text-gray-300 dark:text-white/10">Secure environment</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
