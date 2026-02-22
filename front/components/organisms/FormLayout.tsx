import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useHeaderActions } from '../../context/HeaderActionsContext'
import { Package, Film, Zap, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type FormType = 'gear' | 'shot' | 'task' | 'note'

interface FormLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  detailLabel: string
  formType: FormType
  onBack: () => void
  onSwitchForm: (type: FormType) => void
  onSubmit: () => void
  submitDisabled?: boolean
  submitLabel?: string
  className?: string
}

const FORM_TYPES: { id: FormType; label: string; icon: any }[] = [
  { id: 'gear', label: 'Gear', icon: Package },
  { id: 'shot', label: 'Scene', icon: Film },
  { id: 'task', label: 'Task', icon: Zap },
  { id: 'note', label: 'Note', icon: StickyNote },
]

export const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  title,
  subtitle,
  detailLabel,
  formType,
  onBack,
  onSwitchForm,
  onSubmit,
  submitDisabled = false,
  submitLabel = 'Save',
  className = ''
}) => {
  const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions()

  // Custom header actions with tabs and submit button
  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Form Type Tabs */}
      <ToggleGroup 
        type="single" 
        value={formType} 
        onValueChange={(value) => value && onSwitchForm(value as FormType)}
        className="bg-muted/50 rounded-full p-1"
      >
        {FORM_TYPES.map(ft => {
          const Icon = ft.icon
          return (
            <ToggleGroupItem
              key={ft.id}
              value={ft.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Icon size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">{ft.label}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={submitDisabled}
        size="sm"
        className="rounded-full"
      >
        {submitLabel}
      </Button>
    </div>
  )

  useEffect(() => {
    setTitle(title)
    setSubtitle(subtitle || null)
    setDetailLabel(detailLabel)
    setOnBack(onBack)
    setActions(headerActions)

    return () => {
      setTitle(null)
      setSubtitle(null)
      setDetailLabel(null)
      setActions(null)
      setOnBack(undefined)
    }
  }, [title, subtitle, detailLabel, onBack, formType, submitDisabled, submitLabel, setTitle, setSubtitle, setDetailLabel, setActions, setOnBack])

  useEffect(() => {
    setActions(headerActions)
  }, [formType, submitDisabled, submitLabel, onSubmit])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        flex flex-col 
        bg-background
        ${className}
      `}
    >
      <div className="max-w-3xl w-full mx-auto py-4 md:py-8 px-0 pt-6 pb-32">
        {children}
      </div>
    </motion.div>
  )
}

interface FormSectionProps {
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      flex flex-col gap-8 
      mb-12 pb-10 
      ${className}
    `}>
      {children}
    </div>
  )
}

interface FormGridProps {
  children: React.ReactNode
  className?: string
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      grid grid-cols-2 lg:flex lg:flex-wrap 
      items-start gap-x-8 lg:gap-x-16 gap-y-8
      ${className}
    `}>
      {children}
    </div>
  )
}

interface FormFieldGroupProps {
  label: string
  children: React.ReactNode
  className?: string
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      {children}
    </div>
  )
}
