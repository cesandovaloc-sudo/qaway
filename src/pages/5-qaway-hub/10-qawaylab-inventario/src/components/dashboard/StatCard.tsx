import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  change?: number
  changeLabel?: string
}

export function StatCard({ label, value, icon: Icon, color, change, changeLabel }: StatCardProps) {
  // Map color names to gradient and accent classes
  const colorStyles: Record<string, { gradient: string; accent: string; ring: string }> = {
    'text-orange-600': {
      gradient: 'from-orange-50 to-white',
      accent: 'bg-orange-100 text-orange-600',
      ring: 'ring-orange-600/10',
    },
    'text-blue-600': {
      gradient: 'from-blue-50 to-white',
      accent: 'bg-blue-100 text-blue-600',
      ring: 'ring-blue-600/10',
    },
    'text-green-600': {
      gradient: 'from-green-50 to-white',
      accent: 'bg-green-100 text-green-600',
      ring: 'ring-green-600/10',
    },
    'text-amber-600': {
      gradient: 'from-amber-50 to-white',
      accent: 'bg-amber-100 text-amber-600',
      ring: 'ring-amber-600/10',
    },
    'text-purple-600': {
      gradient: 'from-purple-50 to-white',
      accent: 'bg-purple-100 text-purple-600',
      ring: 'ring-purple-600/10',
    },
    'text-red-600': {
      gradient: 'from-red-50 to-white',
      accent: 'bg-red-100 text-red-600',
      ring: 'ring-red-600/10',
    },
  }

  const styles = colorStyles[color] || {
    gradient: 'from-gray-50 to-white',
    accent: 'bg-gray-100 text-gray-600',
    ring: 'ring-gray-600/10',
  }

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${styles.gradient}
      rounded-2xl p-5 
      border border-gray-100
      hover:shadow-lg hover:shadow-gray-200/50 
      hover:-translate-y-0.5
      transition-all duration-300 ease-out
      group
    `}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.8),transparent_50%)]" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 tracking-wide">{label}</span>
          <div className={`
            p-2.5 rounded-xl ${styles.accent}
            ring-1 ${styles.ring}
            group-hover:scale-110 group-hover:rotate-3
            transition-transform duration-300
          `}>
            <Icon size={18} strokeWidth={2} />
          </div>
        </div>
        
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className={`
              inline-flex items-center gap-0.5
              px-2 py-0.5 rounded-full text-xs font-semibold
              ${change >= 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
              }
            `}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-xs text-gray-500">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
