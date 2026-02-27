import React from 'react'
import { MapPin } from 'lucide-react'
import { LocationAutocomplete, LocationSuggestion } from '@/components/ui/LocationAutocomplete'

export interface FormLocationProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelectLocation?: (location: LocationSuggestion | null) => void
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function formatLabel(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const FormLocation: React.FC<FormLocationProps> = ({
  label,
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Search location...',
  hint,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {formatLabel(label)}
        </label>
        {required && (
          <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-mono text-red-500">
            *
          </span>
        )}
      </div>
      
      <LocationAutocomplete
        value={value}
        onChange={onChange}
        onSelectLocation={onSelectLocation}
        placeholder={placeholder}
        label=""
        leftIcon={<MapPin size={16} className="text-muted-foreground" />}
        disabled={disabled}
      />
      
      {error ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
