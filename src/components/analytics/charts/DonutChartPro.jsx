import React, { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function DonutChartPro({
  data = [],
  nameKey = 'name',
  dataKey = 'value',
  colors = ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
  innerRadius = 65,
  outerRadius = 95,
  height = 300,
  valueFormatter,
  theme = 'light',
  centerLabel = 'Total',
  centerValue = null,
  showLegend = true,
  legendLayout = 'vertical' // 'vertical' | 'horizontal'
}) {
  const [activeIndex, setActiveIndex] = useState(null)
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  const total = data.reduce((acc, item) => acc + (Number(item[dataKey]) || 0), 0)
  const displayedCenterValue =
    activeIndex !== null && data[activeIndex]
      ? valueFormatter
        ? valueFormatter(data[activeIndex][dataKey])
        : data[activeIndex][dataKey].toLocaleString()
      : centerValue || (valueFormatter ? valueFormatter(total) : total.toLocaleString())

  const displayedCenterLabel =
    activeIndex !== null && data[activeIndex]
      ? data[activeIndex][nameKey]
      : centerLabel

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  return (
    <div
      className={`w-full flex flex-col ${
        legendLayout === 'vertical' ? 'md:flex-row items-center' : 'items-center'
      } gap-4`}
      style={{ minHeight: height }}
    >
      {/* Gráfico Donut con Centro Dinámico */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <CustomChartTooltip
                  valueFormatter={valueFormatter}
                  theme={theme}
                />
              }
            />
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey={dataKey}
              nameKey={nameKey}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke={isDark ? '#0f172a' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Texto Central Estilo Power BI / GA4 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider truncate max-w-[110px] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {displayedCenterLabel}
          </span>
          <span className="text-base sm:text-lg font-extrabold font-mono tracking-tight mt-0.5">
            {displayedCenterValue}
          </span>
        </div>
      </div>

      {/* Leyenda Rica Lateral con Porcentajes */}
      {showLegend && (
        <div className="w-full md:w-1/2 space-y-2 text-xs">
          {data.map((item, idx) => {
            const itemVal = Number(item[dataKey]) || 0
            const percent = total > 0 ? ((itemVal / total) * 100).toFixed(1) : '0.0'
            const isItemActive = activeIndex === idx
            const color = colors[idx % colors.length]

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                  isItemActive
                    ? isDark
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-slate-100 border-slate-300'
                    : isDark
                    ? 'border-slate-800/80 hover:bg-slate-800/50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className={`font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item[nameKey]}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="font-bold">
                    {valueFormatter ? valueFormatter(itemVal) : itemVal.toLocaleString()}
                  </span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
