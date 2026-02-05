import React, { useState } from 'react'
import { Briefcase, Trash2, Edit3, Check, X, FolderOpen, AlertCircle } from 'lucide-react'
import { Card, Button, Text, IconContainer, Input } from '@/components/atoms'
import { radius, typography } from '@/design-system'

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

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ paddingTop: '100px' }}>
        <div className="max-w-2xl mx-auto space-y-6 px-4 pb-8">
          <Card variant="flat" className="p-4 flex items-start gap-3">
            <IconContainer icon={AlertCircle} size="md" variant="accent" className="shrink-0 mt-0.5" />
            <div>
              <Text variant="label" color="accent" className="mb-1">Project Management</Text>
              <Text variant="caption" color="secondary">
                Deleting a project will permanently remove all associated shots, inventory assignments, and pipeline tasks. This action cannot be undone.
              </Text>
            </div>
          </Card>

          <div className="space-y-3">
            {projects.map(project => {
              const isCurrent = project === currentProject
              const isEditing = editingProject === project

              return (
                <Card key={project} variant="glass" className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1">
                    <IconContainer
                      icon={Briefcase}
                      size="md"
                      variant={isCurrent ? 'accent' : 'default'}
                      className={isCurrent ? 'shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : ''}
                    />

                    {isEditing ? (
                      <div className="flex-1 mr-4">
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          fullWidth
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex-1 cursor-pointer" onClick={() => onSelectProject(project)}>
                        <Text variant="h3" color={isCurrent ? 'accent' : 'primary'}>{project}</Text>
                        {isCurrent && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-400 text-xs font-semibold">
                            Active Workspace
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={saveEditing}
                          variant="ghost"
                          size="sm"
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20"
                        >
                          <Check size={18} strokeWidth={2.5} />
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <X size={18} strokeWidth={2.5} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => startEditing(project)}
                          variant="ghost"
                          size="sm"
                          className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-indigo-500/10"
                          title="Rename"
                        >
                          <Edit3 size={18} strokeWidth={2.5} />
                        </Button>

                        {!isCurrent && (
                          <Button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${project}"?`)) {
                                onDeleteProject(project)
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="pt-8 flex justify-center">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              leftIcon={<FolderOpen size={14} strokeWidth={2.5} />}
            >
              Return To Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
