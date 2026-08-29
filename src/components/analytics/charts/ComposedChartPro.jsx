import React from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function ComposedChartPro({
  data = [],
  series = [
    { key: 'barVal', type: 'bar', name: 'Volumen', color: '#3b82f6' },
    { key: 'lineVal', type: 'line', name: 'Tendencia', color: '#ff4b0b' }
  ],
  xAxisKey = 'name',
  height = 320,
  valueFormatter,
  theme = 'light',
  showGrid = true,
  showLegend = true,
  secondaryYAxis = false
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {series
              .filter((s) => s.type === 'area')
              .map((s, idx) => (
                <linearGradient key={`comp-grad-${s.key}-${idx}`} id={`comp-grad-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
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
            yAxisId="left"
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : v)}
          />

          {secondaryYAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
          )}

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

          {series.map((s, idx) => {
            const yId = s.yAxisId || 'left'

            if (s.type === 'area') {
              return (
                <Area
                  key={s.key}
                  yAxisId={yId}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name || s.key}
                  fill={`url(#comp-grad-${s.key}-${idx})`}
                  stroke={s.color}
                  strokeWidth={2}
                />
              )
            }

            if (s.type === 'bar') {
              return (
                <Bar
                  key={s.key}
                  yAxisId={yId}
                  dataKey={s.key}
                  name={s.name || s.key}
                  fill={s.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              )
            }

            return (
              <Line
                key={s.key}
                yAxisId={yId}
                type="monotone"
                dataKey={s.key}
                name={s.name || s.key}
                stroke={s.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: s.color }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
