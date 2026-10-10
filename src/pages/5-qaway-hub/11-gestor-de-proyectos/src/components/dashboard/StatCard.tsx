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
    <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0 group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[12px] font-semibold text-[#52525b] truncate">{label}</span>
          <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center flex-shrink-0 group-hover:text-[#ff4b0b] transition-colors">
            <Icon size={15} strokeWidth={2} />
          </div>
        </div>

        <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">
          {value}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-semibold ${change >= 0 ? 'text-[#ff4b0b]' : 'text-rose-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            {changeLabel && (
              <span className="text-[11px] font-[500] text-[#71717a] truncate">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
