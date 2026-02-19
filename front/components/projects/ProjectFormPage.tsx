import React, { useState, useEffect } from 'react'
import { Briefcase, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useHeaderActions } from '@/context/HeaderActionsContext'
import { Input, Textarea } from '@/components/atoms'
import { Card } from '@/components/ui/Card'

interface ProjectFormPageProps {
  onClose: () => void
  onSubmit: (name: string) => void
}

export const ProjectFormPage: React.FC<ProjectFormPageProps> = ({
  onClose,
  onSubmit
}) => {
  const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions()
  const [form, setForm] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit(form.name.trim())
    onClose()
  }

  const isValid = form.name.trim()

  // Header actions with just the submit button (no tabs)
  const headerActions = (
    <button
      onClick={handleSubmit}
      disabled={!isValid}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
        isValid
          ? 'bg-primary text-white hover:bg-primary'
          : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
      }`}
    >
      Create Project
    </button>
  )

  useEffect(() => {
    setTitle('New Project')
    setSubtitle('Create new')
    setDetailLabel('Create new')
    setOnBack(onClose)
    setActions(headerActions)

    return () => {
      setTitle(null)
      setSubtitle(null)
      setDetailLabel(null)
      setActions(null)
      setOnBack(undefined)
    }
  }, [form.name, isValid])

  useEffect(() => {
    setActions(headerActions)
  }, [form.name, isValid])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col"
    >
      <div className="max-w-3xl w-full mx-auto py-4 md:py-8 px-0 pt-6 pb-32">
        <Card title="Project identity" className="mb-8">
          <div className="p-6 space-y-10">
            <div className="w-full">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Project name</span>
              <div className="relative">
                <Briefcase className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
                <Input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Summer Commercial 2024"
                  fullWidth
                  variant="underline"
                  className="pl-8 text-lg font-bold tracking-tight"
                  autoFocus
                />
              </div>
            </div>

            <div className="w-full">
              <span className="text-[10px] text-gray-500 dark:text-white/40 font-medium mb-2 block">Description</span>
              <Textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the project..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Check size={20} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">What happens next?</h3>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-white/50">
              After creating the project, you'll be able to add shots, manage equipment inventory, 
              track post-production tasks, and keep all your production notes in one place.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
