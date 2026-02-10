import React, { useState } from 'react'
import {
  Moon, Sun, Globe, Download, Upload, Cloud,
  FileText, Briefcase, ChevronRight, Check, Shield,
  LogOut, User as UserIcon, Newspaper, BookOpen
} from 'lucide-react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { IconContainer } from '@/components/atoms/IconContainer'
import { User } from '@/types'

interface SettingsViewProps {
  onNavigateToProjects: () => void
  user: User | null
  onLogin: () => void
  onLogout: () => void
  onOpenNews: () => void
  onOpenTutorial: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateToProjects,
  user,
  onLogin,
  onLogout,
  onOpenNews,
  onOpenTutorial
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState('English')
  const [autoBackup, setAutoBackup] = useState(true)

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)
  const toggleBackup = () => setAutoBackup(!autoBackup)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ paddingTop: '100px' }}>
        <div className="max-w-2xl mx-auto space-y-8 px-4 pb-8">
          {/* Account Section */}
          <section>
            <Text variant="caption" color="muted" className="mb-3 px-2 block">Account</Text>

            {user ? (
              <Card variant="default" className="p-5 flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-indigo-400 font-semibold text-sm border-2 border-white dark:border-white/10 shadow-md">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <Text variant="body" className="text-gray-900 dark:text-white">{user.name}</Text>
                    <Text variant="label" color="muted">{user.email}</Text>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  leftIcon={<LogOut size={18} strokeWidth={2.5} />}
                  title="Sign out"
                />
              </Card>
            ) : (
              <Card variant="default" className="p-6 mb-2 flex flex-col items-center text-center gap-4">
                <IconContainer icon={UserIcon} size="xl" variant="muted" />
                <div>
                  <Text variant="h3" className="text-gray-900 dark:text-white">Vemakin Account</Text>
                  <Text variant="caption" color="muted" className="max-w-[240px] mx-auto mt-1">
                    Sync your productions across devices.
                  </Text>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <Button variant="secondary" size="sm" onClick={onLogin} fullWidth>
                    Log In
                  </Button>
                  <Button variant="primary" size="sm" onClick={onLogin} fullWidth>
                    Sign Up
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Workflow Section */}
          <section>
            <Text variant="caption" color="muted" className="mb-3 px-2 block">Production Workflow</Text>
            <Card
              variant="hover"
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={onNavigateToProjects}
            >
              <div className="flex items-center gap-4">
                <IconContainer icon={Briefcase} size="md" variant="accent" />
                <div>
                  <Text variant="body" className="text-gray-900 dark:text-white">Project Management</Text>
                  <Text variant="label" color="muted">Manage, delete, and organize productions</Text>
                </div>
              </div>
              <IconContainer icon={ChevronRight} size="sm" variant="default" />
            </Card>
          </section>

          {/* Data & Cloud Section */}
          <section>
            <Text variant="caption" color="muted" className="mb-3 px-2 block">Data & Cloud</Text>

            {/* Import / Export Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button variant="secondary" size="lg" className="flex flex-col items-center gap-3 h-auto py-4">
                <IconContainer icon={Download} size="md" variant="accent" />
                <Text variant="label">Import Data</Text>
              </Button>
              <Button variant="secondary" size="lg" className="flex flex-col items-center gap-3 h-auto py-4">
                <IconContainer icon={Upload} size="md" variant="accent" />
                <Text variant="label">Export Data</Text>
              </Button>
            </div>

            {/* iCloud Section */}
            <Card variant="glass" className="p-6 relative overflow-hidden rounded-[32px]">
              <div className="absolute top-0 right-0 p-6 opacity-5 text-blue-500 dark:text-indigo-500 pointer-events-none">
                <Cloud size={120} />
              </div>

              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <IconContainer icon={Cloud} size="md" variant="accent" />
                  <div>
                    <Text variant="body" className="text-gray-900 dark:text-white">iCloud Backup</Text>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <Text variant="label" color="muted">Last synced: 2m ago</Text>
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
                <Shield size={14} className="text-gray-400" strokeWidth={2.5} />
                <Text variant="label" color="muted">Your data is automatically encrypted and stored securely in your private iCloud container.</Text>
              </div>
            </Card>
          </section>

          {/* Appearance Section */}
          <section>
            <Text variant="caption" color="muted" className="mb-3 px-2 block">Appearance & Language</Text>
            <Card variant="default" className="overflow-hidden divide-y divide-gray-50 dark:divide-white/5 rounded-[32px]">
              {/* Dark Mode Toggle */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <IconContainer icon={isDarkMode ? Moon : Sun} size="sm" variant={isDarkMode ? 'default' : 'accent'} />
                  <Text variant="body" className="text-gray-700 dark:text-gray-200">Dark Mode</Text>
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
                  <IconContainer icon={Globe} size="sm" variant="accent" />
                  <Text variant="body" className="text-gray-700 dark:text-gray-200">Language</Text>
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
                  <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                </div>
              </div>
            </Card>
          </section>

          {/* Resources Section */}
          <section>
            <Text variant="caption" color="muted" className="mb-3 px-2 block">Resources</Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                variant="hover"
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={onOpenNews}
              >
                <IconContainer icon={Newspaper} size="md" variant="accent" />
                <div>
                  <Text variant="body" className="text-gray-900 dark:text-white">What's New</Text>
                  <Text variant="label" color="muted">Latest updates & features</Text>
                </div>
              </Card>

              <Card
                variant="hover"
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={onOpenTutorial}
              >
                <IconContainer icon={BookOpen} size="md" variant="accent" />
                <div>
                  <Text variant="body" className="text-gray-900 dark:text-white">Tutorial</Text>
                  <Text variant="label" color="muted">Guide & walkthrough</Text>
                </div>
              </Card>
            </div>
          </section>

          {/* Legal Section */}
          <section className="flex justify-center pt-4">
            <Button variant="ghost" size="sm" leftIcon={<FileText size={14} strokeWidth={2.5} />}>
              Terms of Service & Privacy
            </Button>
          </section>

          <div className="text-center pb-8">
            <Text variant="label" color="muted">CineFlow OS v1.2.0</Text>
          </div>
        </div>
      </div>
    </div>
  )
}
