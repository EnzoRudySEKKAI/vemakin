
import React, { useState } from 'react';
import {
 Moon, Sun, Globe, Download, Upload, Cloud,
 FileText, Briefcase, ChevronRight, Check, Shield,
 LogOut, User as UserIcon, Newspaper, BookOpen
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';
import { User } from '../../types.ts';

interface SettingsViewProps {
 onNavigateToProjects: () => void;
 user: User | null;
 onLogin: () => void;
 onLogout: () => void;
 onOpenNews: () => void;
 onOpenTutorial: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
 onNavigateToProjects,
 user,
 onLogin,
 onLogout,
 onOpenNews,
 onOpenTutorial
}) => {
 const [isDarkMode, setIsDarkMode] = useState(false);
 const [language, setLanguage] = useState('English');
 const [autoBackup, setAutoBackup] = useState(true);

 const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
 const toggleBackup = () => setAutoBackup(!autoBackup);

 const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
 };

  return (
   <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ paddingTop: '100px' }}>
     <div className="max-w-2xl mx-auto space-y-8 px-4 pb-8">

    {/* Account Section */}
   <section>
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2">Account</h3>

    {user ? (
     <GlassCard className="p-5 flex items-center justify-between mb-2 bg-white dark:bg-[#1A1A1D] border-none shadow-sm">
      <div className="flex items-center gap-4">
       <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 font-semibold text-sm border-2 border-white dark:border-white/10 shadow-md">
        {getInitials(user.name)}
       </div>
       <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</h3>
        <p className="text-[10px] font-medium text-gray-400">{user.email}</p>
       </div>
      </div>
      <button
       onClick={onLogout}
       className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
       title="Sign out"
      >
       <LogOut size={18} strokeWidth={2.5} />
      </button>
     </GlassCard>
    ) : (
     <GlassCard className="p-6 mb-2 flex flex-col items-center text-center gap-4 bg-white dark:bg-[#1A1A1D] border-none shadow-sm">
      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-1 border-4 border-white dark:border-white/10 shadow-sm">
       <UserIcon size={32} strokeWidth={1.5} />
      </div>
      <div>
       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vemakin account</h3>
       <p className="text-xs text-gray-500 font-medium max-w-[240px] mx-auto mt-1 leading-relaxed">
        Sync your productions across devices and collaborate with your crew.
       </p>
      </div>
      <div className="flex gap-3 w-full mt-2">
       <button
        onClick={onLogin}
        className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-[10px] hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
       >
        Log in
       </button>
       <button
        onClick={onLogin}
        className="flex-1 py-3 bg-blue-600 dark:bg-indigo-600 text-white rounded-xl font-semibold text-[10px] hover:bg-blue-700 dark:bg-indigo-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-colors"
       >
        Sign up
       </button>
      </div>
     </GlassCard>
    )}
   </section>

   {/* Workflow Section */}
   <section>
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2">Production workflow</h3>
    <GlassCard
     onClick={onNavigateToProjects}
     className="p-4 flex items-center justify-between group bg-white dark:bg-[#1A1A1D] border-none shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
    >
     <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-600 dark:bg-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
       <Briefcase size={20} strokeWidth={2.5} />
      </div>
      <div>
       <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Project management</h4>
       <p className="text-[10px] font-medium text-gray-400 mt-0.5">Manage, delete, and organize productions</p>
      </div>
     </div>
     <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500 dark:bg-indigo-500/10 group-hover:text-blue-500 dark:text-indigo-500 transition-colors">
      <ChevronRight size={18} />
     </div>
    </GlassCard>
   </section>

   {/* Data & Cloud Section */}
   <section>
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2">Data & cloud</h3>

    {/* Import / Export Grid */}
    <div className="grid grid-cols-2 gap-4 mb-4">
     <button className="bg-white dark:bg-[#1A1A1D] p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center gap-3 text-center group">
      <div className="p-3 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
       <Download size={20} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Import data</span>
     </button>
     <button className="bg-white dark:bg-[#1A1A1D] p-4 rounded-[24px] shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center gap-3 text-center group">
      <div className="p-3 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
       <Upload size={20} strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Export data</span>
     </button>
    </div>

    {/* iCloud Section */}
    <div className="bg-white dark:bg-[#1A1A1D] rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm p-6 relative overflow-hidden">
     <div className="absolute top-0 right-0 p-6 opacity-5 text-blue-500 dark:text-indigo-500 pointer-events-none">
      <Cloud size={120} />
     </div>

     <div className="relative z-10 flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
       <div className="p-3 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-2xl">
        <Cloud size={20} strokeWidth={2.5} />
       </div>
       <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">iCloud backup</h4>
        <div className="flex items-center gap-1.5 mt-1">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
         <span className="text-[9px] font-semibold text-gray-400">Last synced: 2m ago</span>
        </div>
       </div>
      </div>
      <button
       onClick={toggleBackup}
       className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${autoBackup ? 'bg-blue-500 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
       <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${autoBackup ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
     </div>

     <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
      <Shield size={14} className="text-gray-400"/>
      <p className="text-[9px] text-gray-500 font-medium">Your data is automatically encrypted and stored securely in your private iCloud container.</p>
     </div>
    </div>
   </section>

   {/* Appearance Section */}
   <section>
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2">Appearance & language</h3>
    <div className="bg-white dark:bg-[#1A1A1D] rounded-[32px] border border-white/40 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">

     {/* Dark Mode Toggle */}
     <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
       <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-600 dark:text-indigo-600'}`}>
        {isDarkMode ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
       </div>
       <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Dark mode</span>
      </div>
      <button
       onClick={toggleDarkMode}
       className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 dark:bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
       <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
     </div>

     {/* Language Selector */}
     <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
       <div className="p-2.5 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-xl">
        <Globe size={18} strokeWidth={2.5} />
       </div>
       <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Language</span>
      </div>
      <div className="relative group">
       <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 pl-4 pr-8 rounded-xl focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
       >
        <option value="English">English</option>
        <option value="French">Français</option>
        <option value="Spanish">Español</option>
       </select>
       <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90"/>
      </div>
     </div>

    </div>
   </section>

   {/* Resources Section */}
   <section>
    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2">Resources</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
     <GlassCard
      onClick={onOpenNews}
      className="p-4 flex items-center gap-4 group bg-white dark:bg-[#1A1A1D] border-none shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
     >
      <div className="p-3 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-2xl group-hover:bg-blue-600 dark:bg-indigo-600 group-hover:text-white transition-colors">
       <Newspaper size={20} strokeWidth={2.5} />
      </div>
      <div>
       <h4 className="text-sm font-semibold text-gray-900 dark:text-white">What's new</h4>
       <p className="text-[10px] font-medium text-gray-400 mt-0.5">Latest updates & features</p>
      </div>
     </GlassCard>

     <GlassCard
      onClick={onOpenTutorial}
      className="p-4 flex items-center gap-4 group bg-white dark:bg-[#1A1A1D] border-none shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
     >
      <div className="p-3 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 rounded-2xl group-hover:bg-blue-600 dark:bg-indigo-600 group-hover:text-white transition-colors">
       <BookOpen size={20} strokeWidth={2.5} />
      </div>
      <div>
       <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tutorial</h4>
       <p className="text-[10px] font-medium text-gray-400 mt-0.5">Guide & walkthrough</p>
      </div>
     </GlassCard>
    </div>
   </section>

   {/* Legal Section */}
   <section className="flex justify-center pt-4">
    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
     <FileText size={14} />
     <span className="text-[10px] font-semibold">Terms of service & privacy</span>
    </button>
   </section>

   <div className="text-center pb-8">
     <p className="text-[9px] font-semibold text-gray-300 dark:text-gray-600">CineFlow OS v1.2.0</p>
    </div>

     </div>
    </div>
   </div>
  );
 };
