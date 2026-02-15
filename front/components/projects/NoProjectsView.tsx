import React, { useState } from 'react';
import { Plus, Film } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/atoms';


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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] text-gray-900 dark:text-white px-6">
            <Card className="w-full max-w-md">
                <div className="p-8 flex flex-col items-center text-center">
                    <Logo size="xl" showText={false} className="mb-6" />

                    <h1 className="text-xl font-semibold mb-2">Welcome to Vemakin</h1>

                    <p className="text-gray-500 dark:text-white/30 mb-8 text-sm">
                        You don't have any projects yet. Create your first project to get started.
                    </p>

                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full bg-primary hover:bg-primary active:scale-95 text-white font-medium py-3 rounded-xl transition-all"
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
                                className="w-full bg-white dark:bg-[#0F1116] border border-gray-200 dark:border-white/[0.08] focus:border-primary text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none transition-colors"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/50 font-medium py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!projectName.trim()}
                                    className="flex-1 bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.05] w-full">
                        <button onClick={onLogout} className="text-sm text-gray-400 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/40 transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NoProjectsView;
