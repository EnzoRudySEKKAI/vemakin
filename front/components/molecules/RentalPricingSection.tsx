import React from 'react'
import { DollarSign } from 'lucide-react'
import { FormField } from './FormField'
import { FormSelect } from './FormSelect'
import { FormToggleGroup } from './FormToggleGroup'

export interface RentalPricingSectionProps {
  isOwned: boolean
  onIsOwnedChange: (value: boolean) => void
  price: number
  onPriceChange: (value: number) => void
  frequency: string
  onFrequencyChange: (value: string) => void
  currency?: {
    symbol: string
    code: string
  }
  hint?: string
  error?: string
  disabled?: boolean
  className?: string
}

const frequencyOptions = [
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export const RentalPricingSection: React.FC<RentalPricingSectionProps> = ({
  isOwned,
  onIsOwnedChange,
  price,
  onPriceChange,
  frequency,
  onFrequencyChange,
  currency = { symbol: '$', code: 'USD' },
  hint,
  error,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <FormToggleGroup
        label="Ownership"
        value={isOwned}
        onChange={onIsOwnedChange}
        options={[
          { 
            value: true, 
            label: 'Internal Asset', 
            variant: 'primary' 
          },
          { 
            value: false, 
            label: 'External Rental', 
            variant: 'warning' 
          },
        ]}
        disabled={disabled}
      />

      {!isOwned && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <FormField
            label="Rental Cost"
            type="number"
            value={price || ''}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            leftIcon={<DollarSign size={16} className="text-muted-foreground" />}
            hint={`Price in ${currency.code}`}
            disabled={disabled}
          />

          <FormSelect
            label="Frequency"
            value={frequency}
            onChange={onFrequencyChange}
            options={frequencyOptions}
            disabled={disabled}
          />
        </div>
      )}

      {hint && isOwned && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {hint}
        </span>
      )}

      {error && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-destructive">
          {error}
        </span>
      )}
    </div>
  )
}
