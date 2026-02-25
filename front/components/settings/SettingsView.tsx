import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  Moon, Sun, Briefcase, ChevronRight,
  LogOut, User as UserIcon, BookOpen,
  FileText, ShieldCheck, Globe, Download, Upload,
  LayoutGrid, GripVertical, Film, Package, CheckSquare, StickyNote
} from 'lucide-react'
import { TerminalCard, TerminalCardContent } from '@/components/ui/TerminalCard'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Switch } from '@/components/ui/switch'
import { User, HubCardType } from '@/types'

interface SettingsViewProps {
  onNavigateToProjects: () => void
  user: User | null
  onLogin: () => void
  onLogout: () => void
  onOpenTutorial: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  postProdGridColumns: 2 | 3
  notesGridColumns: 2 | 3
  inventoryGridColumns: 2 | 3
  hubCardOrder: HubCardType[]
  hubShotsLimit: number
  hubTasksLimit: number
  hubNotesLimit: number
  hubEquipmentLimit: number
  onPostProdGridColumnsChange: (columns: 2 | 3) => void
  onNotesGridColumnsChange: (columns: 2 | 3) => void
  onInventoryGridColumnsChange: (columns: 2 | 3) => void
  onHubCardOrderChange: (order: HubCardType[]) => void
  onHubShotsLimitChange: (limit: number) => void
  onHubTasksLimitChange: (limit: number) => void
  onHubNotesLimitChange: (limit: number) => void
  onHubEquipmentLimitChange: (limit: number) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateToProjects,
  user,
  onLogin,
  onLogout,
  onOpenTutorial,
  darkMode,
  onToggleDarkMode,
  postProdGridColumns,
  notesGridColumns,
  inventoryGridColumns,
  hubCardOrder,
  hubShotsLimit,
  hubTasksLimit,
  hubNotesLimit,
  hubEquipmentLimit,
  onPostProdGridColumnsChange,
  onNotesGridColumnsChange,
  onInventoryGridColumnsChange,
  onHubCardOrderChange,
  onHubShotsLimitChange,
  onHubTasksLimitChange,
  onHubNotesLimitChange,
  onHubEquipmentLimitChange
}) => {
  const [cards, setCards] = useState<HubCardType[]>(hubCardOrder)
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

  const getCardConfig = (card: HubCardType) => {
    switch (card) {
      case 'timeline':
        return { icon: Film, label: 'Timeline', color: 'text-blue-400' }
      case 'equipment':
        return { icon: Package, label: 'Equipment', color: 'text-emerald-400' }
      case 'tasks':
        return { icon: CheckSquare, label: 'Tasks', color: 'text-amber-400' }
      case 'notes':
        return { icon: StickyNote, label: 'Notes', color: 'text-purple-400' }
      default:
        return { icon: LayoutGrid, label: card, color: 'text-primary' }
    }
  }

  const handleReorder = (newOrder: HubCardType[]) => {
    setCards(newOrder)
  }

  const handleDragEnd = () => {
    onHubCardOrderChange(cards)
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
        p-2 flex items-center gap-3 
        bg-[#fafafa] dark:bg-[#0a0a0a]/40 border border-gray-300 dark:border-white/10
        ${disabled ? 'opacity-50' : 'hover:border-primary/30 dark:hover:border-primary/30 cursor-pointer'}
        transition-all
      `}
    >
      <div className="w-9 h-9 bg-primary/10 dark:bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/30 dark:border-primary/20">
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
          <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground px-1">
            Account
          </h2>

          {user ? (
            <TerminalCard>
              <TerminalCardContent className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-primary/20 flex items-center justify-center text-primary font-bold text-base font-mono">
                    {getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-background flex items-center justify-center">
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
                <button
                  onClick={onLogout}
                  className="p-2 text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </TerminalCardContent>
            </TerminalCard>
          ) : (
            <TerminalCard>
              <TerminalCardContent className="p-5 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-muted flex items-center justify-center text-muted-foreground">
                  <UserIcon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Sign in to Vemakin</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sync across all your devices
                  </p>
                </div>
                <TerminalButton variant="primary" onClick={onLogin} className="w-full">
                  Sign In
                </TerminalButton>
              </TerminalCardContent>
            </TerminalCard>
          )}
        </motion.section>

        {/* Preferences Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground px-1">
            Preferences
          </h2>
          
          <div className="space-y-2">
            <SettingItem 
              icon={Briefcase} 
              label="Project management" 
              onClick={onNavigateToProjects} 
            />

            <div 
              className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${darkMode ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-400'}`}>
                {darkMode ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
              </div>
              <span className="text-sm font-medium flex-1">Dark mode</span>
              <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
            </div>
          </div>
        </motion.section>

        {/* Layout Section */}
        <motion.section variants={itemVariants} className="space-y-2">
          <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground px-1">
            Layout
          </h2>

          <h3 className="text-[10px] font-mono  tracking-wider text-muted-foreground px-1">
            Desktop only
          </h3>
          
          <div className="space-y-2">
            <div 
              className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <LayoutGrid size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Inventory columns</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">2</span>
                <Switch 
                  checked={inventoryGridColumns === 3} 
                  onCheckedChange={(checked) => onInventoryGridColumnsChange(checked ? 3 : 2)} 
                />
                <span className="text-xs text-muted-foreground">3</span>
              </div>
            </div>

            <div 
              className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <LayoutGrid size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Pipeline columns</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">2</span>
                <Switch 
                  checked={postProdGridColumns === 3} 
                  onCheckedChange={(checked) => onPostProdGridColumnsChange(checked ? 3 : 2)} 
                />
                <span className="text-xs text-muted-foreground">3</span>
              </div>
            </div>

            <div 
              className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <LayoutGrid size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Notes columns</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">2</span>
                <Switch 
                  checked={notesGridColumns === 3} 
                  onCheckedChange={(checked) => onNotesGridColumnsChange(checked ? 3 : 2)} 
                />
                <span className="text-xs text-muted-foreground">3</span>
              </div>
            </div>
          </div>

          <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground px-1 pt-4">
            Items per section
          </h3>
          
          <div className="space-y-2">
            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Film size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Shots</span>
              <select
                value={hubShotsLimit}
                onChange={(e) => onHubShotsLimitChange(Number(e.target.value))}
                className="text-sm bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <CheckSquare size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Tasks</span>
              <select
                value={hubTasksLimit}
                onChange={(e) => onHubTasksLimitChange(Number(e.target.value))}
                className="text-sm bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <StickyNote size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Notes</span>
              <select
                value={hubNotesLimit}
                onChange={(e) => onHubNotesLimitChange(Number(e.target.value))}
                className="text-sm bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Package size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Equipment categories</span>
              <select
                value={hubEquipmentLimit}
                onChange={(e) => onHubEquipmentLimitChange(Number(e.target.value))}
                className="text-sm bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
          </div>

          <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground px-1 pt-2">
            Home cards order
          </h3>
          
          <Reorder.Group 
            axis="y" 
            values={cards} 
            onReorder={handleReorder}
            className="space-y-2"
          >
            {cards.map((card) => {
              const config = getCardConfig(card)
              const Icon = config.icon
              return (
                <Reorder.Item 
                  key={card} 
                  value={card}
                  className="cursor-grab active:cursor-grabbing"
                  onDragEnd={handleDragEnd}
                >
                  <div 
                    className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all select-none"
                  >
                    <div className="text-muted-foreground shrink-0">
                      <GripVertical size={16} />
                    </div>
                    <div className={`w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 ${config.color}`}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium flex-1">{config.label}</span>
                  </div>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        </motion.section>

        {/* Data & Cloud Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground">
              Data & Cloud
            </h2>
            <span className="text-[10px] font-mono  tracking-wider text-muted-foreground">
              Coming Soon
            </span>
          </div>
          
          <div className="space-y-2">
            <SettingItem icon={Download} label="Import data" disabled />
            <SettingItem icon={Upload} label="Export data" disabled />
          </div>
        </motion.section>

        {/* Language Section - Coming Soon */}
        <motion.section variants={itemVariants} className="space-y-3 opacity-40">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground">
              Language
            </h2>
            <span className="text-[10px] font-mono  tracking-wider text-muted-foreground">
              Coming Soon
            </span>
          </div>
          
          <SettingItem icon={Globe} label="Language" disabled />
        </motion.section>

        {/* Support Section */}
        <motion.section variants={itemVariants} className="space-y-3">
          <h2 className="text-[11px] font-mono  tracking-wider text-muted-foreground px-1">
            Support
          </h2>
          
          <SettingItem icon={BookOpen} label="Tutorial" onClick={onOpenTutorial} />
        </motion.section>

        {/* About Section */}
        <motion.section variants={itemVariants} className="pt-4 space-y-4">
          <div className="flex items-center justify-center">
            <button
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-mono  tracking-wider text-xs"
            >
              <FileText size={14} className="inline mr-2" />
              Terms & Privacy
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] font-mono  tracking-wider text-muted-foreground">
              Vemakin OS v1.2.0
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
