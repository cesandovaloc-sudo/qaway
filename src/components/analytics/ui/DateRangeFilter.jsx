import React from 'react'
import { Calendar } from 'lucide-react'

export const TIME_RANGES = [
  { id: '7d', label: '7 Días' },
  { id: '30d', label: '30 Días' },
  { id: '90d', label: '90 Días' },
  { id: '1y', label: '1 Año' },
  { id: 'all', label: 'Histórico' }
]

export default function DateRangeFilter({
  selectedRange = '30d',
  onChangeRange,
  theme = 'light'
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border text-xs font-semibold gap-1 ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-slate-100 border-slate-200'
      }`}
    >
      <div className="pl-2 pr-1 text-slate-400 hidden sm:flex items-center">
        <Calendar className="w-3.5 h-3.5" />
      </div>

      {TIME_RANGES.map(range => {
        const isSelected = selectedRange === range.id
        return (
          <button
            key={range.id}
            type="button"
            onClick={() => onChangeRange(range.id)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              isSelected
                ? isDark
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-900 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
