import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export default function KpiCard({
  title,
  value,
  formattedValue,
  change = 0,
  changeLabel = 'vs período anterior',
  icon: Icon,
  iconColor = '#ff4b0b',
  sparklineData = [],
  sparklineColor = '#3b82f6',
  subtitle,
  goalProgress,
  targetValue,
  theme = 'light',
  className = ''
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const isPositive = change > 0
  const isNegative = change < 0

  // Generar SVG path para sparkline si hay datos
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null

    const min = Math.min(...sparklineData)
    const max = Math.max(...sparklineData)
    const range = max - min || 1
    const width = 84
    const height = 28
    const padding = 2

    const points = sparklineData.map((val, idx) => {
      const x = padding + (idx / (sparklineData.length - 1)) * (width - padding * 2)
      const y = height - padding - ((val - min) / range) * (height - padding * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })

    const pathD = `M ${points.join(' L ')}`
    const areaD = `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height} L ${padding},${height} Z`

    return (
      <div className="w-[84px] h-[28px] shrink-0 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${title?.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={sparklineColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${title?.replace(/\s+/g, '')})`} />
          <path
            d={pathD}
            fill="none"
            stroke={sparklineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all duration-200 group hover:shadow-lg ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 text-white'
          : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs'
      } ${className}`}
    >
      {/* Header: Titulo e Icono */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-slate-800/80' : 'bg-slate-100'
              }`}
              style={{ color: iconColor }}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wider truncate ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {title}
          </span>
        </div>

        {/* Badge de Variación % */}
        {change !== undefined && change !== null && (
          <div
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {/* Valor Principal & Sparkline */}
      <div className="flex items-baseline justify-between gap-2 mt-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
          {formattedValue || value}
        </div>
        {renderSparkline()}
      </div>

      {/* Barra de Progreso a la Meta (Opcional) */}
      {goalProgress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-medium text-slate-400 mb-1">
            <span>Meta: {targetValue || '100%'}</span>
            <span className="font-bold text-slate-300">{goalProgress}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, goalProgress))}%`,
                backgroundColor: sparklineColor
              }}
            />
          </div>
        </div>
      )}

      {/* Subtítulo o Contexto */}
      {(subtitle || changeLabel) && (
        <p className={`text-[11px] mt-2.5 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {subtitle || `${changeLabel}`}
        </p>
      )}
    </div>
  )
}
