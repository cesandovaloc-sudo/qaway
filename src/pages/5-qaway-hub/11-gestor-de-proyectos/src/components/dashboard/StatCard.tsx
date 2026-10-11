import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  change?: number
  changeLabel?: string
}

export function StatCard({ label, value, icon: Icon, change, changeLabel }: StatCardProps) {
  return (
    <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0 group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[12px] font-semibold text-[#52525b] truncate">{label}</span>
          <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center flex-shrink-0 group-hover:text-[var(--hub-brand)] transition-colors">
            <Icon size={15} strokeWidth={2} />
          </div>
        </div>

        <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">
          {value}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-semibold ${change >= 0 ? 'text-[var(--hub-brand)]' : 'text-rose-600'}`}>
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
