import { useState } from 'react'
import { Briefcase, Check } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import { Input } from '@/components/atoms/Input'

interface ProjectFormProps {
  onSubmit: (name: string, startDate: string, endDate: string, location: string, description: string) => void
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
}

export const ProjectForm = ({ onSubmit }: ProjectFormProps) => {
  const [name, setName] = useState('')
  const [startDate] = useState(toISODate(new Date().toLocaleDateString()))
  const [endDate] = useState(toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()))
  const [location] = useState('')
  const [description] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit(name.trim(), startDate, endDate, location, description)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Text variant="caption" color="secondary" className="mb-2 block">Production Title</Text>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} strokeWidth={2.5} />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          onClick={handleSubmit}
          disabled={!name.trim()}
          leftIcon={<Check size={18} strokeWidth={2.5} />}
          fullWidth
        >
          Initialize Project
        </Button>
      </div>
    </div>
  )
}
