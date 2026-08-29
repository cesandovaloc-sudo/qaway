import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function ScatterChartPro({
  data = [],
  xKey = 'x',
  yKey = 'y',
  zKey = 'z',
  nameKey = 'name',
  xName = 'Eje X',
  yName = 'Eje Y',
  seriesName = 'Dispersión',
  color = '#ff4b0b',
  height = 300,
  valueFormatter,
  theme = 'light',
  showGrid = true,
  showLegend = true
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}

          <XAxis
            type="number"
            dataKey={xKey}
            name={xName}
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />

          <YAxis
            type="number"
            dataKey={yKey}
            name={yName}
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : v)}
          />

          {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 400]} />}

          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
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

          <Scatter
            name={seriesName}
            data={data}
            fill={color}
            fillOpacity={0.65}
            stroke={color}
            strokeWidth={1.5}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
