import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function AreaChartPro({
  data = [],
  series = [{ key: 'value', name: 'Valor', color: '#ff4b0b' }],
  xAxisKey = 'name',
  height = 300,
  valueFormatter,
  theme = 'light',
  showGrid = true,
  showLegend = true,
  curveType = 'monotone',
  stacked = false
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {series.map((s, idx) => {
              const gradId = `area-grad-${s.key}-${idx}`
              return (
                <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              )
            })}
          </defs>

          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}

          <XAxis
            dataKey={xAxisKey}
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />

          <YAxis
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : v)}
          />

          <Tooltip
            content={
              <CustomChartTooltip
                valueFormatter={valueFormatter}
                theme={theme}
              />
            }
          />

          {showLegend && (
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => <span style={{ color: textColor, fontWeight: 500 }}>{value}</span>}
            />
          )}

          {series.map((s, idx) => (
            <Area
              key={s.key}
              type={curveType}
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#area-grad-${s.key}-${idx})`}
              stackId={stacked ? '1' : undefined}
              activeDot={{ r: 5, strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
