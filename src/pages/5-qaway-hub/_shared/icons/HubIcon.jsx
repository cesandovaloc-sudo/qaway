import React from 'react'

export const HUB_ICON_DEFAULTS = {
  size: 18,
  strokeWidth: 1.75,
}

// Wrapper presentacional. No resuelve por string para no romper tree-shaking.
// Uso: import { Search } from '@/pages/5-qaway-hub/_shared/icons/hubIcons'
//      <HubIcon icon={Search} size={18} />
export function HubIcon({ icon: Icon, size = HUB_ICON_DEFAULTS.size, strokeWidth = HUB_ICON_DEFAULTS.strokeWidth, className = '', ...props }) {
  if (!Icon) return null
  return <Icon size={size} strokeWidth={strokeWidth} className={className} {...props} />
}

export default HubIcon
