import React from 'react'
import { X } from 'lucide-react'
import { Card, Text, Button, IconContainer } from '@/components/atoms'
import { radius, typography } from '@/design-system'

interface NewsModalProps {
  onClose: () => void
}

export const NewsModal: React.FC<NewsModalProps> = ({ onClose }) => {
  const updates = [
    {
      version: '1.2.0',
      date: 'Today',
      title: 'Major Design Overhaul',
      description: 'Experience the new glassmorphism interface with improved navigation and smoother animations.',
      type: 'Major'
    },
    {
      version: '1.1.5',
      date: '2 Days Ago',
      title: 'Post-Production Pipeline',
      description: 'Track editing, VFX, and sound tasks with the new Kanban-style board.',
      type: 'Feature'
    },
    {
      version: '1.1.0',
      date: 'Last Week',
      title: 'Inventory Tracking',
      description: 'Complete gear management system with check-in/check-out status.',
      type: 'Feature'
    }
  ]

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <Card variant="glass" className="w-full max-w-md p-0 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 ${radius.lg}`}>
          <div>
            <Text variant="h2">Latest News</Text>
            <Text variant="label" color="muted" className="mt-1">Vemakin Updates</Text>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2">
            <X size={18} strokeWidth={2.5} />
          </Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {updates.map((update, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-2">
              <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-blue-600 dark:bg-indigo-600' : 'bg-gray-300'}`} />
              <div className="flex justify-between items-start mb-1">
                <span className={`px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-blue-100 text-blue-600 dark:text-indigo-600' : 'bg-gray-100 text-gray-500'} ${typography.size.xs} ${typography.weight.semibold}`}>
                  v{update.version}
                </span>
                <Text variant="label" color="muted">{update.date}</Text>
              </div>
              <Text variant="h3" className="mt-2 mb-1">{update.title}</Text>
              <Text variant="caption" color="secondary" className="leading-relaxed">{update.description}</Text>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <Text variant="label" color="muted">Stay Tuned For More Updates!</Text>
        </div>
      </Card>
    </div>
  )
}
