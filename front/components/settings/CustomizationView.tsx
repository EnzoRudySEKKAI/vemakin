import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  ChevronLeft, LayoutGrid, GripVertical, Film, Package, CheckSquare, StickyNote
} from 'lucide-react'
import { TerminalCard, TerminalCardContent } from '@/components/ui/TerminalCard'
import { Switch } from '@/components/ui/switch'
import { TerminalSelect } from '@/components/ui/TerminalSelect'
import { HubCardType } from '@/types'

interface CustomizationViewProps {
  onNavigateBack: () => void
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

export const CustomizationView: React.FC<CustomizationViewProps> = ({
  onNavigateBack,
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full w-full max-w-2xl mx-auto px-4"
    >
      <div className="flex-1 space-y-6 pb-24" style={{ paddingTop: '60px' }}>
        
        {/* Header with back button */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Customization</h1>
        </motion.div>

        {/* Layout Section */}
        <motion.section variants={itemVariants} className="space-y-2">
          <h2 className="text-[11px] font-mono tracking-wider text-muted-foreground px-1">
            Layout
          </h2>

          <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground px-1">
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
        </motion.section>

        {/* Items per section */}
        <motion.section variants={itemVariants} className="space-y-2">
          <h3 className="text-[10px] font-mono tracking-wider text-muted-foreground px-1 pt-4">
            Items per section
          </h3>
          
          <div className="space-y-2">
            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Film size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Shots</span>
              <TerminalSelect
                value={hubShotsLimit}
                options={[
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' }
                ]}
                onChange={onHubShotsLimitChange}
                className="w-16"
              />
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <CheckSquare size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Tasks</span>
              <TerminalSelect
                value={hubTasksLimit}
                options={[
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' }
                ]}
                onChange={onHubTasksLimitChange}
                className="w-16"
              />
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <StickyNote size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Notes</span>
              <TerminalSelect
                value={hubNotesLimit}
                options={[
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' }
                ]}
                onChange={onHubNotesLimitChange}
                className="w-16"
              />
            </div>

            <div className="p-2 flex items-center gap-3 bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                <Package size={18} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium flex-1">Equipment categories</span>
              <TerminalSelect
                value={hubEquipmentLimit}
                options={[
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' }
                ]}
                onChange={onHubEquipmentLimitChange}
                className="w-16"
              />
            </div>
          </div>
        </motion.section>

        {/* Home cards order */}
        <motion.section variants={itemVariants} className="space-y-2">
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

      </div>
    </motion.div>
  )
}
