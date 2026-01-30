import React, { useState } from 'react';
import { Plus, LogOut, Loader2, Sparkles, FolderPlus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface EmptyProjectsViewProps {
    onCreate: (name: string) => Promise<void> | void;
    onLogout: () => void;
}

export const EmptyProjectsView: React.FC<EmptyProjectsViewProps> = ({ onCreate, onLogout }) => {
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setIsLoading(true);
        try {
            await onCreate(projectName);
        } catch (error) {
            console.error('Failed to create project:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F2F2F7] dark:bg-[#000000]">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">

                <GlassCard className="p-8 md:p-10 bg-white/60 dark:bg-[#1A1A1D]/60 border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                        <FolderPlus className="text-white" size={32} strokeWidth={2} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">
                        Start your Journey
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] leading-relaxed">
                        You don't have any productions yet. Create your first project to get started.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="relative group">
                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project Name (e.g. Summer Commercial)"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!projectName.trim() || isLoading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Create Production</>}
                        </button>
                    </form>
                </GlassCard>

                <button
                    onClick={onLogout}
                    className="mt-8 flex items-center gap-2 text-gray-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium mx-auto"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
