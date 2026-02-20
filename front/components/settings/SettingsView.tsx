import React from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Sun, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  FileText, ShieldCheck, Globe, Download, Upload
} from 'lucide-react'
import { Card, ListItem } from '@/components/ui/Card'
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
      transition: { staggerChildren: 0.08 }
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
      className="flex flex-col h-full w-full max-w-2xl mx-auto px-4"
    >
      <div className="flex-1 space-y-6 pb-24" style={{ paddingTop: '100px' }}>
        
        {/* Account Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-semibold text-gray-400 dark:text-white/40 px-1">
            Account
          </h2>

          {user ? (
            <Card>
              <div className="p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#16181D] flex items-center justify-center">
                    <ShieldCheck size={7} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-white/40 truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  leftIcon={<LogOut size={16} />}
                  className="text-gray-400 hover:text-red-500 shrink-0"
                />
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-5 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/20">
                  <UserIcon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sign in to Vemakin</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                    Sync across all your devices
                  </p>
                </div>
                <Button variant="primary" size="sm" fullWidth onClick={onLogin}>
                  Sign In
                </Button>
              </div>
            </Card>
          )}
        </motion.section>

        {/* Preferences Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-semibold text-gray-400 dark:text-white/40 px-1">
            Preferences
          </h2>
          
          <div className="space-y-2">
            <ListItem onClick={onNavigateToProjects} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Briefcase size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                Project Management
              </span>
              <ChevronRight size={16} className="text-gray-300 dark:text-white/20 shrink-0" />
            </ListItem>

            <ListItem onClick={onToggleDarkMode} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                {darkMode ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                Dark Mode
              </span>
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </ListItem>
          </div>
        </motion.section>

        {/* Data & Cloud Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-semibold text-gray-400 dark:text-white/40">
              Data & Cloud
            </h2>
            <span className="text-[10px] text-gray-400 dark:text-white/30">
              Coming Soon
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 flex items-center gap-3 bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 shrink-0">
                <Download size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-white/50 flex-1">
                Import Data
              </span>
            </div>
            <div className="p-4 flex items-center gap-3 bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 shrink-0">
                <Upload size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-white/50 flex-1">
                Export Data
              </span>
            </div>
          </div>
        </motion.section>

        {/* Language Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-semibold text-gray-400 dark:text-white/40">
              Language
            </h2>
            <span className="text-[10px] text-gray-400 dark:text-white/30">
              Coming Soon
            </span>
          </div>
          
          <div className="p-4 flex items-center gap-3 bg-white dark:bg-[#16181D] border border-gray-200 dark:border-white/[0.05] rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-white/30 shrink-0">
              <Globe size={18} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-white/50 flex-1">
              Language
            </span>
          </div>
        </motion.section>

        {/* Support Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-semibold text-gray-400 dark:text-white/40 px-1">
            Support
          </h2>
          
          <ListItem onClick={onOpenTutorial} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={18} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
              Tutorial
            </span>
            <ChevronRight size={16} className="text-gray-300 dark:text-white/20 shrink-0" />
          </ListItem>
        </motion.section>

        {/* About Section */}
        <motion.section variants={itemVariants} className="pt-4 space-y-4">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FileText size={14} />}
              className="text-gray-400 dark:text-white/30"
            >
              Terms & Privacy
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-gray-300 dark:text-white/20">
              Vemakin OS v1.2.0
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}