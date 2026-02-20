import React from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Sun, Globe, Download, Upload,
  FileText, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  Mail, ShieldCheck
} from 'lucide-react'
import { SimpleCard, ListItem } from '@/components/ui/Card'
import { User } from '@/types'

interface SettingsViewProps {
  onNavigateToProjects: () => void
  user: User | null
  onLogin: () => void
  onLogout: () => void
  onOpenTutorial: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateToProjects,
  user,
  onLogin,
  onLogout,
  onOpenTutorial,
  darkMode,
  onToggleDarkMode
}) => {


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full max-w-2xl mx-auto px-0"
    >
      <div className="flex-1 space-y-8 pb-32" style={{ paddingTop: '100px' }}>
        
        {/* Account Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30">Account</h2>
          </div>

          {user ? (
            <div className="space-y-2">
              <div className="p-6 rounded-[32px] bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.08] flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-[#16181D] flex items-center justify-center">
                    <ShieldCheck size={10} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40 font-medium">
                      <Mail size={12} strokeWidth={2.5} />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 text-gray-500 dark:text-white/40 hover:text-red-400 flex items-center justify-center transition-all border border-gray-200 dark:border-white/5 hover:border-red-500/20"
                >
                  <LogOut size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <SimpleCard className="flex flex-col items-center text-center p-8 gap-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/20">
                <UserIcon size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vemakin Account</h3>
                <p className="text-sm text-gray-500 dark:text-white/40 max-w-[240px]">Sync your productions across all your devices.</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={onLogin} className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-semibold transition-all border border-gray-200 dark:border-white/10 text-sm">
                  Log In
                </button>
                <button onClick={onLogin} className="flex-1 h-11 rounded-xl bg-primary hover:bg-[#3F39D1] text-white font-semibold transition-all shadow-lg shadow-primary/20 text-sm">
                  Sign Up
                </button>
              </div>
            </SimpleCard>
          )}
        </motion.section>

        {/* Workflow Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">Production Workflow</h2>
          <ListItem onClick={onNavigateToProjects} className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Project Management</h3>
              <p className="text-xs text-gray-500 dark:text-white/30">Manage, delete, and organize productions</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 dark:text-white/20" strokeWidth={2.5} />
          </ListItem>
        </motion.section>

        {/* Appearance Section - Dark Mode */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">Appearance</h2>
          <SimpleCard className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                {darkMode ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</h3>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </SimpleCard>
        </motion.section>

        {/* Data & Cloud Section */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">Data & Cloud</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button disabled className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] cursor-not-allowed">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 mb-3">
                <Download size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-white/50">Import Data</span>
            </button>
            <button disabled className="flex flex-col items-center justify-center p-6 rounded-[24px] bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] cursor-not-allowed">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 mb-3">
                <Upload size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-white/50">Export Data</span>
            </button>
          </div>

          <div className="flex items-center justify-center py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">Coming Soon</span>
          </div>
        </motion.section>

        {/* Language Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">Language</h2>
          <SimpleCard className="p-5 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30">
                <Globe size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-white/50">Language</h3>
            </div>
            <div className="relative">
              <span className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-white/40 text-[10px] font-bold py-2 px-4 rounded-xl uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </SimpleCard>
        </motion.section>

        {/* Resources Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">Resources</h2>
          <div className="grid grid-cols-1 gap-3">
            <ListItem onClick={onOpenTutorial} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tutorial</h3>
                <p className="text-[10px] text-gray-500 dark:text-white/30">Learn more</p>
              </div>
            </ListItem>
          </div>
        </motion.section>

        {/* Legal Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center gap-6 pt-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest transition-all border border-gray-200 dark:border-white/5">
            <FileText size={14} strokeWidth={2.5} />
            <span>Terms & Privacy</span>
          </button>
          
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.3em]">Vemakin OS v1.2.0</p>
            <p className="text-[10px] font-medium text-gray-300 dark:text-white/10">Production Management System</p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
