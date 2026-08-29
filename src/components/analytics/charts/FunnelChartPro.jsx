import React from 'react'
import { ArrowDown, Users, ChevronRight } from 'lucide-react'

export default function FunnelChartPro({
  data = [
    { name: 'Visitas / Alcance', value: 12500 },
    { name: 'Leads Captados', value: 3400 },
    { name: 'Oportunidades Calificadas', value: 1200 },
    { name: 'Propuestas Enviadas', value: 480 },
    { name: 'Cierres / Ventas', value: 190 }
  ],
  colors = ['#3b82f6', '#0ea5e9', '#06b6d4', '#10b981', '#ff4b0b'],
  height = 320,
  valueFormatter,
  theme = 'light'
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const initialVal = data[0]?.value || 1

  return (
    <div className="w-full flex flex-col justify-center space-y-2 py-2" style={{ minHeight: height }}>
      {data.map((step, idx) => {
        const prevVal = idx === 0 ? step.value : data[idx - 1].value
        const overallConv = ((step.value / initialVal) * 100).toFixed(1)
        const stepConv = idx === 0 ? 100 : ((step.value / prevVal) * 100).toFixed(1)
        const widthPercent = Math.max(20, Math.round((step.value / initialVal) * 100))
        const color = colors[idx % colors.length]

        return (
          <div key={idx} className="w-full space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center justify-center font-mono shrink-0">
                  {idx + 1}
                </span>
                <span className={`truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {step.name}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono">
                <span className="font-bold">
                  {valueFormatter ? valueFormatter(step.value) : step.value.toLocaleString()}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {overallConv}% global
                </span>
                {idx > 0 && (
                  <span className="text-[10px] text-emerald-500 font-bold hidden sm:inline">
                    {stepConv}% paso
                  </span>
                )}
              </div>
            </div>

            {/* Barra Visual del Embudo */}
            <div
              className={`w-full h-7 rounded-xl flex items-center overflow-hidden transition-all duration-300 relative ${
                isDark ? 'bg-slate-800/40' : 'bg-slate-100/80'
              }`}
            >
              <div
                className="h-full rounded-xl flex items-center px-3 transition-all duration-500 shadow-xs"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: color
                }}
              >
                <span className="text-[11px] font-bold text-white drop-shadow-xs truncate">
                  {step.name}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
