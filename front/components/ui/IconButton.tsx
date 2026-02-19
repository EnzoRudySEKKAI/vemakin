import React from 'react'
import { Button } from '@/components/atoms/Button'
import { radius, typography } from '@/design-system'

interface IconButtonProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  active?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  active,
  onClick,
  className = ''
}) => (
  <Button
    onClick={onClick}
    variant={active ? 'primary' : 'ghost'}
    size="sm"
    className={`p-3.5 ${radius.md} ${className}`}
  >
    <Icon size={20} strokeWidth={2.5} />
  </Button>
)
