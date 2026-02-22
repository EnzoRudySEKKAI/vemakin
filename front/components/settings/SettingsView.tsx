import React from 'react'
import { motion } from 'framer-motion'
import {
  Moon, Sun, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  FileText, ShieldCheck, Globe, Download, Upload
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    rightElement,
    disabled = false 
  }: { 
    icon: any, 
    label: string, 
    onClick?: () => void, 
    rightElement?: React.ReactNode,
    disabled?: boolean
  }) => (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`
        p-4 flex items-center gap-3 
        bg-card border border-border rounded-xl
        ${disabled ? 'opacity-50' : 'hover:border-primary/30 cursor-pointer'}
        transition-all
      `}
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      {rightElement || <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
    </div>
  )

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
          <h2 className="text-[11px] font-semibold text-muted-foreground px-1">
            Account
          </h2>

          {user ? (
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <ShieldCheck size={7} className="text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <LogOut size={16} />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <UserIcon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Sign in to Vemakin</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sync across all your devices
                  </p>
                </div>
                <Button className="w-full" onClick={onLogin}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* Preferences Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground px-1">
            Preferences
          </h2>
          
          <div className="space-y-2">
            <SettingItem 
              icon={Briefcase} 
              label="Project Management" 
              onClick={onNavigateToProjects} 
            />

            <div 
              className="p-4 flex items-center gap-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                {darkMode ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
              </div>
              <span className="text-sm font-medium flex-1">Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
            </div>
          </div>
        </motion.section>

        {/* Data & Cloud Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-semibold text-muted-foreground">
              Data & Cloud
            </h2>
            <span className="text-[10px] text-muted-foreground">
              Coming Soon
            </span>
          </div>
          
          <div className="space-y-2">
            <SettingItem icon={Download} label="Import Data" disabled />
            <SettingItem icon={Upload} label="Export Data" disabled />
          </div>
        </motion.section>

        {/* Language Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-semibold text-muted-foreground">
              Language
            </h2>
            <span className="text-[10px] text-muted-foreground">
              Coming Soon
            </span>
          </div>
          
          <SettingItem icon={Globe} label="Language" disabled />
        </motion.section>

        {/* Support Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground px-1">
            Support
          </h2>
          
          <SettingItem icon={BookOpen} label="Tutorial" onClick={onOpenTutorial} />
        </motion.section>

        {/* About Section */}
        <motion.section variants={itemVariants} className="pt-4 space-y-4">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <FileText size={14} className="mr-2" />
              Terms & Privacy
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">
              Vemakin OS v1.2.0
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
