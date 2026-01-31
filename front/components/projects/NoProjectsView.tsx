import React, { useState } from 'react';
import { Plus } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F2F2F7] dark:bg-[#141417] text-[#1C1C1E] dark:text-white px-6 transition-colors duration-500">
            <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] p-8 rounded-2xl shadow-xl flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <Plus className="w-8 h-8 text-blue-500" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Welcome to Vemakin</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    You don't have any projects yet. Create your first project to get started.
                </p>

                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
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
                            className="w-full bg-gray-100 dark:bg-[#2C2C2E] border border-transparent focus:border-blue-500 text-[#1C1C1E] dark:text-white rounded-xl px-4 py-3 outline-none transition-colors"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-gray-200 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!projectName.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 w-full">
                    <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-500 underline transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
