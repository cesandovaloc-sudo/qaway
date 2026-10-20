import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'

export const HUB_ICON_DEFAULTS = {
  size: 18,
  strokeWidth: 1.75,
} as const

export interface HubIconProps extends Omit<ComponentProps<LucideIcon>, 'size' | 'strokeWidth'> {
  icon: LucideIcon
  size?: number
  strokeWidth?: number
  className?: string
}

// Canónico v4. Wrapper presentacional. Recibe componente para preservar tree-shaking.
// Uso: import { HubIcon } from '@/components/ui/icons'
//      import { Search } from '@/components/ui/icons/hubIcons'
export function HubIcon({
  icon: Icon,
  size = HUB_ICON_DEFAULTS.size,
  strokeWidth = HUB_ICON_DEFAULTS.strokeWidth,
  className = '',
  ...props
}: HubIconProps) {
  if (!Icon) return null
  return <Icon size={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export default HubIcon
