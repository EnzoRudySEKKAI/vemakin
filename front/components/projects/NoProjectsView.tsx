import React, { useState } from 'react';
import { Plus, Film } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface NoProjectsViewProps {
    onCreateProject: (name: string) => void;
    onLogout: () => void;
}

export const NoProjectsView: React.FC<NoProjectsViewProps> = ({ onCreateProject, onLogout }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [projectName, setProjectName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim()) {
            onCreateProject(projectName);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white px-6">
            <Card className="w-full max-w-md">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
                        <Film className="w-7 h-7 text-indigo-400" />
                    </div>

                    <h1 className="text-xl font-semibold mb-2">Welcome to Vemakin</h1>
                    <p className="text-white/30 mb-8 text-sm">
                        You don't have any projects yet. Create your first project to get started.
                    </p>

                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-medium py-3 rounded-xl transition-all"
                        >
                            Create First Project
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <input
                                autoFocus
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project Name (e.g., Short Film 2024)"
                                className="w-full bg-[#0A0A0A] border border-white/[0.08] focus:border-indigo-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 bg-white/5 border border-white/[0.08] text-white/50 font-medium py-3 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!projectName.trim()}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/[0.05] w-full">
                        <button onClick={onLogout} className="text-sm text-white/20 hover:text-white/40 transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NoProjectsView;
