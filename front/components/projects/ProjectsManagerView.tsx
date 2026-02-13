import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Trash2, Edit3, Check, X, FolderOpen, AlertCircle } from 'lucide-react'

interface ProjectsManagerViewProps {
  projects: string[]
  currentProject: string
  onSelectProject: (name: string) => void
  onDeleteProject: (name: string) => void
  onRenameProject: (oldName: string, newName: string) => void
  onBack: () => void
}

export const ProjectsManagerView: React.FC<ProjectsManagerViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onBack
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
          <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <AlertCircle size={20} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Project Management</h2>
              <p className="text-xs leading-relaxed text-white/30 font-medium">
                Deleting a project will permanently remove all associated shots, inventory assignments, and pipeline tasks. This action cannot be undone.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Active Workspaces</h2>
            <span className="text-[10px] font-mono text-white/20">{projects.length} Projects</span>
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
                      p-4 rounded-[24px] flex items-center justify-between transition-all duration-300
                      ${isCurrent 
                        ? 'bg-[#16181D] border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/20' 
                        : 'bg-[#16181D] border border-white/[0.08] hover:border-white/[0.15]'}
                      ${isEditing ? 'ring-2 ring-primary' : ''}
                    `}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                          ${isCurrent ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/20'}
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
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isEditing && onSelectProject(project)}>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-base font-bold truncate ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                                {project}
                              </h3>
                              {isCurrent && (
                                <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-bold text-primary uppercase tracking-wider">
                                  Active
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-white/20 font-medium mt-0.5">Production Workspace</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEditing}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:bg-white/5 transition-colors"
                            >
                              <X size={18} strokeWidth={3} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(project)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
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
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
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
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest transition-all border border-white/5"
          >
            <FolderOpen size={14} strokeWidth={2.5} />
            <span>Return To Settings</span>
          </button>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Project Management Console</p>
            <p className="text-[10px] font-medium text-white/10 uppercase">Secure Environment</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
