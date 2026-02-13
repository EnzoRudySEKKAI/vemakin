import React, { useState, useMemo, useRef } from 'react'
import {
  X, Briefcase, Film, Package, Zap, StickyNote,
  ChevronLeft, PenLine, Scissors, Music, Layers, Palette, Hash,
  Save, Calendar, Search, Check, Tag, ChevronDown, Sliders, Info, AlertCircle,
  MapPin, FileText, Clock, Monitor, Speaker, GitBranch, Activity, Aperture,
  BookOpen, Crop, Target, Sparkles, Camera, Eye, Link as LinkIcon, Box, ChevronUp, PlusCircle, ArrowLeft,
  Paperclip, ArrowUpRight, Image as ImageIcon, File, Trash2, CircleDot, Flag, DollarSign
} from 'lucide-react'
import { PostProdTask, Equipment, Shot, Attachment } from '@/types'
import { CATEGORY_ICONS, POST_PROD_CATEGORIES } from '@/constants'
import { timeToMinutes, calculateEndTime } from '@/utils'
import { TimeSelector } from '@/components/ui/TimeSelector'
import { NoteForm, NoteFormData } from '@/components/notes/NoteForm'
import { TaskForm, TaskFormData } from '@/components/postprod/TaskForm'
import { GearForm, GearFormData } from '@/components/inventory/GearForm'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { Input } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { Card } from '@/components/atoms/Card'
import { IconContainer } from '@/components/atoms/IconContainer'

interface ActionSuiteProps {
  onClose: () => void
  onCommitProject: (name: string, startDate: string, endDate: string, location: string, description: string) => void
  onCommitShot: (shot: Shot) => void
  onCommitGear: (gear: Equipment) => void
  onCommitTask: (task: PostProdTask) => void
  onCommitNote: (title: string, content: string, linkedId?: string, linkType?: 'shot' | 'task', attachments?: Attachment[]) => void
  inventory: Equipment[]
  currentProject: string
  existingShots: Shot[]
  existingTasks?: PostProdTask[]
  initialView?: ViewMode
  initialLink?: { type: 'shot' | 'task'; id: string }
}

type ViewMode = 'hub' | 'shot' | 'gear' | 'task' | 'note' | 'project'

const VIEWS: { id: ViewMode; label: string; icon: any; color: string }[] = [
  { id: 'gear', label: 'Gear', icon: Package, color: 'text-primary dark:text-bg-primary' },
  { id: 'shot', label: 'Scene', icon: Film, color: 'text-primary dark:text-bg-primary' },
  { id: 'task', label: 'Task', icon: Zap, color: 'text-orange-600' },
  { id: 'note', label: 'Note', icon: StickyNote, color: 'text-gray-600' },
]

export const ActionSuite: React.FC<ActionSuiteProps> = ({
  onClose,
  onCommitProject,
  onCommitShot,
  onCommitGear,
  onCommitTask,
  onCommitNote,
  inventory,
  currentProject,
  existingShots,
  existingTasks = [],
  initialView,
  initialLink
}) => {
  // Default to 'shot' if no initial view is provided, skipping the hub completely
  const [view, setView] = useState<ViewMode>(initialView && initialView !== 'hub' ? initialView : 'shot')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // -- UTILS --
  const toISODate = (dateStr: string) => {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
  }

  const fromISODate = (isoStr: string) => {
    if (!isoStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // -- FORM STATES --

  // Project Form
  const [projectForm, setProjectForm] = useState({
    name: '',
    productionCompany: '',
    startDate: toISODate(new Date().toLocaleDateString()),
    endDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()),
    description: '',
    location: ''
  })

  // Shot Form
  const [shotForm, setShotForm] = useState({
    title: '',
    sceneNumber: '',
    location: '',
    date: toISODate(new Date().toLocaleDateString()),
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    remarks: '',
    equipmentIds: [] as string[]
  })

  // Shot Gear Management State
  const [isCreatingGearInline, setIsCreatingGearInline] = useState(false)
  const [shotGearSearch, setShotGearSearch] = useState('')
  const [shotGearCategory, setShotGearCategory] = useState('All')
  const [inlineGearForm, setInlineGearForm] = useState({
    name: '',
    category: 'Camera'
  })

  // Gear Form (Standalone)
  const [gearForm, setGearForm] = useState({
    name: '',
    serialNumber: '',
    category: '',
    categoryName: '',
    brand: '',
    brandName: '',
    mount: '',
    model: '',
    modelName: '',
    isOwned: true,
    price: 0,
    frequency: 'day' as 'hour' | 'day' | 'week' | 'month' | 'year',
    customSpecs: [] as { key: string, value: string }[],
    specs: {} as Record<string, any>
  })
  const [showSpecsInForm, setShowSpecsInForm] = useState(false)

  // Task Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Script' as PostProdTask['category'],
    status: 'todo' as PostProdTask['status'],
    priority: 'medium' as PostProdTask['priority'],
    dueDate: toISODate(new Date().toLocaleDateString()),
    description: '',
    metadata: {} as Record<string, string | number | boolean>
  })

  // Note Form
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    linkType: initialLink?.type || 'none' as 'none' | 'shot' | 'task',
    linkedId: initialLink?.id || '',
    attachments: [] as Attachment[]
  })

  // -- COMPUTED --

  const shotConflict = useMemo(() => {
    if (view !== 'shot' || !shotForm.startTime || !shotForm.endTime) return null

    const startMins = timeToMinutes(shotForm.startTime)
    let endMins = timeToMinutes(shotForm.endTime)
    if (endMins < startMins) endMins += 1440

    const formattedDate = fromISODate(shotForm.date)

    return existingShots.find(s => {
      if (s.date !== formattedDate) return false
      const sStart = timeToMinutes(s.startTime)
      const sEnd = timeToMinutes(calculateEndTime(s.startTime, s.duration))
      return (startMins < sEnd && endMins > sStart)
    })
  }, [shotForm.startTime, shotForm.endTime, shotForm.date, existingShots, view])


  // -- HANDLERS --

  const handleCommitProject = () => {
    if (!projectForm.name.trim()) return
    onCommitProject(
      projectForm.name.trim(),
      projectForm.startDate,
      projectForm.endDate,
      projectForm.location,
      projectForm.description
    )
    onClose()
  }

  const handleCommitShot = () => {
    if (!shotForm.title.trim() || shotConflict) return

    const startMins = timeToMinutes(shotForm.startTime)
    let endMins = timeToMinutes(shotForm.endTime)
    if (endMins < startMins) endMins += 1440
    const diffHours = (endMins - startMins) / 60
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      title: shotForm.title,
      sceneNumber: shotForm.sceneNumber || `${existingShots.length + 1}X`,
      location: shotForm.location || 'Location TBD',
      date: fromISODate(shotForm.date),
      startTime: shotForm.startTime,
      duration: duration,
      description: shotForm.description,
      remarks: shotForm.remarks,
      status: 'pending',
      equipmentIds: shotForm.equipmentIds,
      preparedEquipmentIds: []
    }

    onCommitShot(newShot)
    onClose()
  }

  const handleCommitGear = () => {
    const newId = `e-${Date.now()}`
    const modelName = gearForm.modelName || gearForm.brandName || gearForm.categoryName || 'New Equipment'

    const newEquipment: Equipment = {
      id: newId,
      name: modelName,
      catalogItemId: gearForm.model || undefined,
      customName: gearForm.name.trim() || undefined,
      serialNumber: gearForm.serialNumber.trim() || undefined,
      category: gearForm.category as any || 'Other',
      pricePerDay: gearForm.isOwned ? 0 : gearForm.price,
      rentalPrice: gearForm.isOwned ? undefined : gearForm.price,
      rentalFrequency: gearForm.isOwned ? undefined : gearForm.frequency,
      quantity: 1,
      isOwned: gearForm.isOwned,
      status: 'operational',
      specs: gearForm.specs || {}
    }

    onCommitGear(newEquipment)
    onClose()
  }

  // Inline Gear Creation (Inside Shot Form)
  const handleInlineGearCreate = () => {
    if (!inlineGearForm.name) return

    const newId = `e-inline-${Date.now()}`
    const newEquipment: Equipment = {
      id: newId,
      name: inlineGearForm.name,
      customName: inlineGearForm.name,
      category: inlineGearForm.category as any,
      pricePerDay: 0,
      quantity: 1,
      isOwned: true,
      status: 'operational',
      specs: {}
    }

    // Add to global inventory via parent prop
    onCommitGear(newEquipment)

    // Add to current shot form
    setShotForm(prev => ({
      ...prev,
      equipmentIds: [...prev.equipmentIds, newId]
    }))

    // Reset inline states
    setIsCreatingGearInline(false)
    setInlineGearForm({ name: '', category: 'Camera' })
  }

  const toggleShotGear = (id: string) => {
    setShotForm(prev => {
      const exists = prev.equipmentIds.includes(id)
      return {
        ...prev,
        equipmentIds: exists
          ? prev.equipmentIds.filter(x => x !== id)
          : [...prev.equipmentIds, id]
      }
    })
  }

  const handleCommitTask = () => {
    if (!taskForm.title.trim()) return

    const newTask: PostProdTask = {
      id: `task-${Date.now()}`,
      title: taskForm.title,
      category: taskForm.category as any,
      status: taskForm.status,
      priority: taskForm.priority,
      dueDate: fromISODate(taskForm.dueDate),
      description: taskForm.description,
      metadata: taskForm.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onCommitTask(newTask)
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const isImage = file.type.startsWith('image/')

      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString()
      }

      setNoteForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }))
    }
  }

  const removeAttachment = (attId: string) => {
    setNoteForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }))
  }

  const handleCommitNote = () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return
    onCommitNote(
      noteForm.title,
      noteForm.content,
      noteForm.linkedId,
      noteForm.linkType === 'none' ? undefined : noteForm.linkType,
      noteForm.attachments
    )
    onClose()
  }

  // -- RENDER --

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500 overflow-hidden"
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      }}
      onClick={onClose}
    >
      <div
        className="w-full md:w-[85vw] lg:max-w-5xl xl:max-w-6xl h-full md:h-auto flex flex-col justify-center"
        onClick={e => e.stopPropagation()}
      >
        <Card variant="glass" className="relative max-h-[95vh] md:max-h-[92vh] lg:max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] sm:rounded-[48px]">
          {/* Header Area with Navigation */}
          <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-gray-50 dark:border-white/5 flex flex-col gap-6 shrink-0 bg-white dark:bg-[#16181D] z-20">
            {/* Navigation Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {view !== 'project' && VIEWS.map(v => {
                  const Icon = v.icon
                  const isActive = view === v.id
                  return (
                    <Button
                      key={v.id}
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setView(v.id)}
                      leftIcon={<Icon size={14} strokeWidth={2.5} />}
                    >
                      {v.label}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                leftIcon={<X size={20} strokeWidth={2.5} />}
              />
            </div>

            {/* Dynamic Title */}
            <div>
              <Text variant="label" color="accent">Create New</Text>
              <Text variant="h1">
                {view === 'gear' ? 'Register Gear' : view === 'shot' ? 'Schedule Scene' : view === 'project' ? 'Production' : view === 'task' ? 'Pipeline Task' : view === 'note' ? 'Creative Note' : 'Entry'}
              </Text>
            </div>
          </div>

          <div className="space-y-8 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 no-scrollbar pb-0 flex-1">
            {/* SHOT FORM */}
            {view === 'shot' && (
              <div className="space-y-5 relative h-full flex flex-col">
                {/* SECTION 1: Scene Identity */}
                <Card variant="glass" size="md">
                  <div className="flex items-center gap-2 mb-4">
                    <IconContainer icon={Film} size="sm" variant="accent" />
                    <Text variant="caption" color="muted">Scene Identity</Text>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                    <Input
                      type="text"
                      value={shotForm.title}
                      onChange={e => setShotForm({ ...shotForm, title: e.target.value })}
                      placeholder="Scene title..."
                        fullWidth
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        value={shotForm.sceneNumber}
                        onChange={e => setShotForm({ ...shotForm, sceneNumber: e.target.value })}
                        placeholder="Scene number (e.g. 4C)"
                        leftIcon={<span className="text-xs font-semibold text-gray-400">SC</span>}
                        fullWidth
                      />
                    </div>
                  </div>
                </Card>

                {/* SECTION 2: Schedule */}
                <Card variant="glass" size="md">
                  <div className="flex items-center gap-2 mb-4">
                    <IconContainer icon={Calendar} size="sm" variant="accent" />
                    <Text variant="caption" color="muted">Schedule</Text>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <Input
                        type="date"
                        value={shotForm.date}
                        onChange={e => setShotForm({ ...shotForm, date: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <TimeSelector label="" value={shotForm.startTime} onChange={(v) => setShotForm({ ...shotForm, startTime: v })} />
                    <TimeSelector label="" value={shotForm.endTime} onChange={(v) => setShotForm({ ...shotForm, endTime: v })} />
                  </div>

                  {shotConflict && (
                    <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                      <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={14} strokeWidth={2.5} />
                      <Text variant="label" color="danger">
                        Conflict: This slot is already taken by "{shotConflict.title}"
                      </Text>
                    </div>
                  )}
                </Card>

                {/* SECTION 3: Location */}
                <Card variant="glass" size="md">
                  <div className="flex items-center gap-2 mb-4">
                    <IconContainer icon={MapPin} size="sm" variant="accent" />
                    <Text variant="caption" color="muted">Location</Text>
                  </div>

                  <Input
                    type="text"
                    value={shotForm.location}
                    onChange={e => setShotForm({ ...shotForm, location: e.target.value })}
                    placeholder="Enter filming location..."
                    fullWidth
                  />
                </Card>

                {/* SECTION 4: Details */}
                <Card variant="glass" size="md">
                  <div className="flex items-center gap-2 mb-4">
                    <IconContainer icon={FileText} size="sm" variant="accent" />
                    <Text variant="caption" color="muted">Scene Description</Text>
                  </div>

                  <Textarea
                    value={shotForm.description}
                    onChange={e => setShotForm({ ...shotForm, description: e.target.value })}
                    placeholder="Describe the action, atmosphere, and key visual elements..."
                    size="md"
                  />
                </Card>

                {/* SECTION 5: Equipment Selection */}
                <Card variant="glass" size="md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <IconContainer icon={Package} size="sm" variant="accent" />
                      <Text variant="caption" color="muted">Equipment</Text>
                    </div>
                    <span className="bg-primary/10 text-primary dark:text-primary px-2.5 py-1 rounded-lg text-xs font-semibold">{shotForm.equipmentIds.length} Selected</span>
                  </div>

                  {isCreatingGearInline ? (
                    <div className="p-4 bg-primary/10 border border-blue-100 dark:border-primary/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div>
                          <Text variant="caption" color="secondary" className="mb-2 block">Item Name / Model</Text>
                          <Input
                            type="text"
                            value={inlineGearForm.name}
                            onChange={(e) => setInlineGearForm({ ...inlineGearForm, name: e.target.value })}
                            placeholder="e.g. Red Komodo, extension cable..."
                            fullWidth
                          />
                        </div>
                        <div>
                          <Text variant="caption" color="secondary" className="mb-2 block">Category</Text>
                          <select
                            value={inlineGearForm.category}
                            onChange={(e) => setInlineGearForm({ ...inlineGearForm, category: e.target.value })}
                            className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-2xl px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:border-primary transition-all cursor-pointer"
                          >
                            {['Camera', 'Lens', 'Light', 'Filter', 'Audio', 'Support', 'Grip', 'Other'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleInlineGearCreate}
                          disabled={!inlineGearForm.name.trim()}
                          fullWidth
                        >
                          Save & Select
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsCreatingGearInline(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            value={shotGearSearch}
                            onChange={(e) => setShotGearSearch(e.target.value)}
                            placeholder="Search inventory..."
                            className="w-full bg-white dark:bg-[#2C2C30] border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                        {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setShotGearCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${shotGearCategory === cat
                              ? 'bg-primary dark:bg-primary text-white border-blue-600 dark:border-primary'
                              : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-blue-200 dark:hover:border-primary/30 hover:text-primary dark:hover:text-primary'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                        {inventory.filter(item => {
                          const matchesSearch = (item.customName || item.name).toLowerCase().includes(shotGearSearch.toLowerCase())
                          const matchesCat = shotGearCategory === 'All' || item.category === shotGearCategory
                          return matchesSearch && matchesCat
                        }).map(item => {
                          const isSelected = shotForm.equipmentIds.includes(item.id)
                          const Icon = (CATEGORY_ICONS as any)[item.category] || Package

                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleShotGear(item.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left group ${isSelected
                                ? 'bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20'
                                : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 hover:border-blue-100 dark:hover:border-primary/20 hover:bg-gray-50 dark:hover:bg-[#3A3A3E]'
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-blue-100 dark:bg-primary/20 text-primary dark:text-primary' : 'bg-gray-50 dark:bg-[#3A3A3E] text-gray-400 dark:text-gray-500'}`}>
                                  <Icon size={12} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-semibold truncate leading-none mb-0.5 ${isSelected ? 'text-blue-900 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {item.customName || item.name}
                                  </p>
                                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">{item.category}</p>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-primary dark:bg-primary border-blue-600 dark:border-primary text-white' : 'bg-white dark:bg-[#3A3A3E] border-gray-200 dark:border-white/10 text-transparent'
                                }`}>
                                <Check size={10} strokeWidth={2.5} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#16181D] flex justify-center pb-6 mt-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCommitShot}
                    disabled={!shotForm.title.trim() || !!shotConflict}
                    leftIcon={<Save size={18} strokeWidth={2.5} />}
                  >
                    Add Scene
                  </Button>
                </div>
              </div>
            )}

            {/* NOTE FORM */}
            {view === 'note' && (
              <NoteForm
                form={noteForm}
                setForm={setNoteForm}
                existingShots={existingShots}
                existingTasks={existingTasks}
                onSubmit={handleCommitNote}
              />
            )}

            {/* TASK FORM */}
            {view === 'task' && (
              <TaskForm
                form={taskForm}
                setForm={setTaskForm}
                onSubmit={handleCommitTask}
              />
            )}

            {/* PROJECT FORM */}
            {view === 'project' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Text variant="caption" color="secondary" className="mb-2 block">Production Title</Text>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
                      <Input
                        type="text"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        placeholder="e.g. Neon Paradox"
                        fullWidth
                        className="pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCommitProject}
                    disabled={!projectForm.name.trim()}
                    leftIcon={<Check size={18} strokeWidth={2.5} />}
                    fullWidth
                  >
                    Initialize Project
                  </Button>
                </div>
              </div>
            )}

            {/* GEAR FORM */}
            {view === 'gear' && (
              <GearForm
                form={gearForm}
                setForm={setGearForm}
                onSubmit={handleCommitGear}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
