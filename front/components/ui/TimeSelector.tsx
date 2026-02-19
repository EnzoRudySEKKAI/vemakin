import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Text } from '@/components/atoms/Text'

interface TimeSelectorProps {
  label?: string
  value: string
  onChange: (val: string) => void
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ label, value = '00:00', onChange }) => {
  const safeValue = (value && value.includes(':')) ? value : '00:00'
  const [h, m] = safeValue.split(':')

  const setHours = (newH: string) => onChange(`${newH}:${m || '00'}`)
  const setMinutes = (newM: string) => onChange(`${h || '00'}:${newM}`)

  return (
    <div className="w-full">
      {label && <Text variant="label" color="muted" className="mb-1 block">{label}</Text>}
      <div className="flex items-center gap-1">
        <div className="relative flex-1 min-w-0">
          <select
            value={h}
            onChange={(e) => setHours(e.target.value)}
            className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-1.5 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary cursor-pointer"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const val = String(i).padStart(2, '0')
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
          <ChevronDown size={14} strokeWidth={2.5} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
        <span className="text-gray-400 dark:text-gray-500 font-semibold text-lg leading-none pb-1">:</span>
        <div className="relative flex-1 min-w-0">
          <select
            value={m}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-white/10 py-1.5 text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary cursor-pointer"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const val = String(i * 5).padStart(2, '0')
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
          <ChevronDown size={14} strokeWidth={2.5} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
