import React from 'react'

export default function CustomChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  theme = 'dark',
  unit = ''
}) {
  if (!active || !payload || !payload.length) return null

  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  return (
    <div
      className={`rounded-xl px-3.5 py-2.5 shadow-xl border backdrop-blur-md transition-all text-xs font-medium z-50 ${
        isDark
          ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/40'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
      }`}
      style={{ minWidth: '140px' }}
    >
      {label !== undefined && label !== null && (
        <div
          className={`font-semibold pb-1.5 mb-1.5 border-b text-[11px] uppercase tracking-wider ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}
        >
          {label}
        </div>
      )}

      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          const formattedVal = valueFormatter
            ? valueFormatter(item.value, item.dataKey || item.name)
            : item.value?.toLocaleString ? item.value.toLocaleString() : item.value

          const color = item.color || item.fill || item.stroke || '#ff4b0b'

          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className={`text-[11px] truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {item.name || item.dataKey}
                </span>
              </div>
              <span className="font-mono font-bold text-[12px] shrink-0">
                {formattedVal} {unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
