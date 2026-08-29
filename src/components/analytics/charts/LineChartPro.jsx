import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function LineChartPro({
  data = [],
  series = [{ key: 'value', name: 'Tendencia', color: '#3b82f6' }],
  xAxisKey = 'name',
  height = 300,
  valueFormatter,
  theme = 'light',
  showGrid = true,
  showLegend = true,
  curveType = 'monotone',
  targetLine = null // { y: 500, label: 'Meta', color: '#10b981' }
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

          {targetLine && (
            <ReferenceLine
              y={targetLine.y}
              label={{
                value: targetLine.label,
                fill: targetLine.color || '#10b981',
                fontSize: 10,
                position: 'top'
              }}
              stroke={targetLine.color || '#10b981'}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          )}

          {series.map((s) => (
            <Line
              key={s.key}
              type={curveType}
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2.5}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
              strokeDasharray={s.dashed ? '4 4' : undefined}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
