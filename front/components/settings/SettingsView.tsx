import React from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Sun, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  Mail, FileText
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
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Account
          </h2>

          {user ? (
            <Card>
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base border border-primary/30 shrink-0">
                  {getInitials(user.name)}
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
                  leftIcon={<LogOut size={16} strokeWidth={2} />}
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
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Vemakin Account</h3>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                    Sync across all your devices
                  </p>
                </div>
                <div className="flex gap-2 w-full">
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

        {/* Preferences Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Preferences
          </h2>
          
          <SimpleCard className="p-0 overflow-hidden">
            <ListItem onClick={onNavigateToProjects} className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-white/[0.05] last:border-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Briefcase size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                Project Management
              </span>
              <ChevronRight size={16} className="text-gray-300 dark:text-white/20" strokeWidth={2} />
            </ListItem>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                  {darkMode ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </SimpleCard>
        </motion.section>

        {/* Support Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/30 px-1">
            Support
          </h2>
          <ListItem onClick={onOpenTutorial} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen size={18} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
              Tutorial
            </span>
            <ChevronRight size={16} className="text-gray-300 dark:text-white/20" strokeWidth={2} />
          </ListItem>
        </motion.section>

        {/* About Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center gap-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<FileText size={14} strokeWidth={2} />}
            className="text-gray-400 dark:text-white/30"
          >
            Terms & Privacy
          </Button>
          
          <p className="text-[10px] font-medium text-gray-300 dark:text-white/20">
            Vemakin v1.2.0
          </p>
        </motion.section>
      </div>
    </motion.div>
  )
}