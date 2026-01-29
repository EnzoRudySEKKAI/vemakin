
import React, { useState } from 'react';
import { Briefcase, Trash2, Edit3, Check, X, FolderOpen, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface ProjectsManagerViewProps {
  projects: string[];
  currentProject: string;
  onSelectProject: (name: string) => void;
  onDeleteProject: (name: string) => void;
  onRenameProject: (oldName: string, newName: string) => void;
  onBack: () => void;
}

export const ProjectsManagerView: React.FC<ProjectsManagerViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onBack
}) => {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (name: string) => {
    setEditingProject(name);
    setEditValue(name);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditValue('');
  };

  const saveEditing = () => {
    if (editValue && editValue !== editingProject) {
      onRenameProject(editingProject!, editValue);
    }
    setEditingProject(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

      <div className="bg-blue-50/50 dark:bg-blue-500 dark:bg-indigo-500/10 border border-blue-100 dark:border-blue-500 dark:border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-500 dark:text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-blue-400 dark:text-indigo-400 mb-1">Project Management</h4>
          <p className="text-[11px] font-medium text-blue-600 dark:text-indigo-600/70 dark:text-blue-400 dark:text-indigo-400/70 leading-relaxed">
            Deleting a project will permanently remove all associated shots, inventory assignments, and pipeline tasks. This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {projects.map(project => {
          const isCurrent = project === currentProject;
          const isEditing = editingProject === project;

          return (
            <GlassCard key={project} className="p-4 bg-white dark:bg-[#1A1A1D] border-none shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-2xl shrink-0 ${isCurrent ? 'bg-blue-600 dark:bg-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                  <Briefcase size={20} strokeWidth={2.5} />
                </div>

                {isEditing ? (
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-blue-200 dark:border-blue-500 dark:border-indigo-500/30 rounded-xl px-4 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-indigo-500/20"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectProject(project)}>
                    <h4 className={`text-base font-bold tracking-tight capitalize ${isCurrent ? 'text-indigo-700 dark:text-blue-400 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      {project}
                    </h4>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-500 dark:bg-indigo-500/20 text-blue-600 dark:text-indigo-600 dark:text-blue-300 px-2 py-0.5 rounded-md">
                        Active Workspace
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEditing}
                      className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(project)}
                      className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:text-indigo-600 dark:hover:text-blue-400 dark:text-indigo-400 hover:bg-blue-50 dark:hover:bg-blue-500 dark:bg-indigo-500/10 rounded-xl transition-all"
                      title="Rename"
                    >
                      <Edit3 size={18} strokeWidth={2.5} />
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${project}"?`)) {
                            onDeleteProject(project);
                          }
                        }}
                        className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="pt-8 flex justify-center">
        <button
          onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-2"
        >
          <FolderOpen size={14} /> Return to Settings
        </button>
      </div>
    </div>
  );
};
