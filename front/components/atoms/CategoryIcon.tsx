import React from 'react'
import { LucideIcon } from 'lucide-react'
import {
  Camera as CameraIcon,
  Aperture,
  Sun,
  Mic,
  Package,
  ShoppingBag,
  Monitor,
  Radio,
  Drill,
  PenLine,
  Scissors,
  Music,
  Layers,
  Palette,
  Plane,
  Triangle,
  Activity,
  CircleDot,
  Zap,
  Film,
  StickyNote,
  Briefcase,
  FolderOpen,
  Settings,
  AlertCircle,
  FileText,
  MessageSquare,
  Check,
  Clock,
  Calendar,
  Hash
} from 'lucide-react'

export type CategoryType = 'equipment' | 'postprod' | 'note' | 'system'

export interface CategoryIconProps {
  category: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'filled' | 'outline'
}

const equipmentCategories: Record<string, LucideIcon> = {
  Camera: CameraIcon,
  Lens: Aperture,
  Light: Sun,
  Filter: CircleDot,
  Audio: Mic,
  Tripod: Triangle,
  Stabilizer: Activity,
  Support: Triangle,
  Grip: Drill,
  Monitoring: Monitor,
  Wireless: Radio,
  Drone: Plane,
  Props: ShoppingBag,
  Other: Package,
  camera: CameraIcon,
  lens: Aperture,
  light: Sun,
  filter: CircleDot,
  audio: Mic,
  tripod: Triangle,
  stabilizer: Activity,
  grip: Drill,
  monitoring: Monitor,
  wireless: Radio,
  drone: Plane,
  props: ShoppingBag,
  other: Package,
}

const postProdCategories: Record<string, LucideIcon> = {
  Script: PenLine,
  Editing: Scissors,
  Sound: Music,
  VFX: Layers,
  Color: Palette,
  script: PenLine,
  editing: Scissors,
  sound: Music,
  vfx: Layers,
  color: Palette,
}

const noteCategories: Record<string, LucideIcon> = {
  shot: Film,
  task: Briefcase,
  general: StickyNote,
  Shot: Film,
  Task: Briefcase,
  General: StickyNote,
}

const systemCategories: Record<string, LucideIcon> = {
  project: FolderOpen,
  settings: Settings,
  alert: AlertCircle,
  note: FileText,
  message: MessageSquare,
  check: Check,
  clock: Clock,
  calendar: Calendar,
  tag: Hash,
  default: Package,
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
}

const defaultVariantStyles = 'text-muted-foreground'
const filledVariantStyles = 'bg-primary/10 text-primary'
const outlineVariantStyles = 'border border-border text-muted-foreground'

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  className = '',
  variant = 'default'
}) => {
  const normalizedCategory = category.trim()
  
  let Icon: LucideIcon | undefined = 
    equipmentCategories[normalizedCategory] ||
    postProdCategories[normalizedCategory] ||
    noteCategories[normalizedCategory] ||
    systemCategories[normalizedCategory] ||
    systemCategories.default

  const iconSize = sizeMap[size]
  
  const variantStyles = variant === 'filled' 
    ? filledVariantStyles 
    : variant === 'outline' 
      ? outlineVariantStyles 
      : defaultVariantStyles

  if (!Icon) {
    return null
  }

  return (
    <Icon 
      size={iconSize} 
      strokeWidth={2} 
      className={`${variantStyles} ${className}`}
    />
  )
}

export const getCategoryIcon = (category: string): LucideIcon => {
  const normalizedCategory = category.trim()
  
  return (
    equipmentCategories[normalizedCategory] ||
    postProdCategories[normalizedCategory] ||
    noteCategories[normalizedCategory] ||
    systemCategories[normalizedCategory] ||
    systemCategories.default
  )
}

export const getCategoryColor = (category: string): string => {
  const normalizedCategory = category.toLowerCase()
  
  const colorMap: Record<string, string> = {
    camera: 'text-blue-500',
    lens: 'text-purple-500',
    light: 'text-yellow-500',
    audio: 'text-green-500',
    grip: 'text-orange-500',
    vfx: 'text-pink-500',
    editing: 'text-orange-500',
    color: 'text-red-500',
    script: 'text-indigo-500',
    sound: 'text-blue-500',
  }
  
  return colorMap[normalizedCategory] || 'text-muted-foreground'
}

export const getCategoryBgColor = (category: string): string => {
  const normalizedCategory = category.toLowerCase()
  
  const bgMap: Record<string, string> = {
    camera: 'bg-blue-500/10',
    lens: 'bg-purple-500/10',
    light: 'bg-yellow-500/10',
    audio: 'bg-green-500/10',
    grip: 'bg-orange-500/10',
    vfx: 'bg-pink-500/10',
    editing: 'bg-orange-500/10',
    color: 'bg-red-500/10',
    script: 'bg-indigo-500/10',
    sound: 'bg-blue-500/10',
  }
  
  return bgMap[normalizedCategory] || 'bg-secondary'
}
