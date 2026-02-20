import React from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Sun, Globe, Download, Upload,
  FileText, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  Mail, ShieldCheck, ExternalLink
} from 'lucide-react'
import { Card, SimpleCard, ListItem } from '@/components/ui/Card'
import { Button } from '@/components/atoms/Button'
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
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full max-w-2xl mx-auto px-0"
    >
      <div className="flex-1 space-y-6 pb-32" style={{ paddingTop: '100px' }}>
        
        {/* Account Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30">
              Account
            </h2>
            {user && (
              <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-gray-500 dark:text-white/40 font-mono">
                Pro
              </span>
            )}
          </div>

          {user ? (
            <Card className="overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/30">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#16181D] flex items-center justify-center">
                    <ShieldCheck size={8} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail size={12} className="text-gray-400 dark:text-white/30" strokeWidth={2} />
                    <span className="text-xs text-gray-500 dark:text-white/40 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  leftIcon={<LogOut size={16} strokeWidth={2} />}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                />
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/20">
                  <UserIcon size={28} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vemakin Account</h3>
                  <p className="text-sm text-gray-500 dark:text-white/40">
                    Sync your productions across all your devices
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <Button variant="secondary" fullWidth onClick={onLogin}>
                    Log In
                  </Button>
                  <Button variant="primary" fullWidth onClick={onLogin}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.section>

        {/* Workflow Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Production Workflow
          </h2>
          <ListItem onClick={onNavigateToProjects} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Management</h3>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Manage, delete, and organize productions</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 dark:text-white/20 shrink-0" strokeWidth={2} />
          </ListItem>
        </motion.section>

        {/* Appearance Section - Dark Mode */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Appearance
          </h2>
          <SimpleCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                {darkMode ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-xs text-gray-500 dark:text-white/40">Adjust app appearance</p>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </SimpleCard>
        </motion.section>

        {/* Data & Cloud Section - Disabled */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30">
              Data & Cloud
            </h2>
            <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-gray-400 dark:text-white/30 font-medium">
              Coming Soon
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05]">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 mb-2">
                <Download size={20} strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-white/50">Import Data</span>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05]">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 mb-2">
                <Upload size={20} strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-white/50">Export Data</span>
            </div>
          </div>
        </motion.section>

        {/* Language Section - Disabled */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Language
          </h2>
          <SimpleCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30">
                <Globe size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50">Language</h3>
                <p className="text-xs text-gray-400 dark:text-white/30">Change app language</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-white/30 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded">
              Coming Soon
            </span>
          </SimpleCard>
        </motion.section>

        {/* Resources Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Resources
          </h2>
          <ListItem onClick={onOpenTutorial} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tutorial</h3>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Learn how to use Vemakin</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 dark:text-white/20 shrink-0" strokeWidth={2} />
          </ListItem>
        </motion.section>

        {/* Legal Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FileText size={14} strokeWidth={2} />}
            rightIcon={<ExternalLink size={12} strokeWidth={2} />}
            className="text-gray-400 dark:text-white/30"
          >
            Terms & Privacy
          </Button>
          
          <div className="text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-300 dark:text-white/20 uppercase tracking-[0.25em]">
              Vemakin OS v1.2.0
            </p>
            <p className="text-[10px] text-gray-300 dark:text-white/10">
              Production Management System
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}