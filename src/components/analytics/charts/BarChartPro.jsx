import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function BarChartPro({
  data = [],
  series = [{ key: 'value', name: 'Monto', color: '#ff4b0b' }],
  xAxisKey = 'name',
  layout = 'horizontal', // 'horizontal' | 'vertical'
  height = 300,
  valueFormatter,
  theme = 'light',
  showGrid = true,
  showLegend = true,
  stacked = false,
  barRadius = [6, 6, 0, 0],
  colorArray = null // Si queremos barras con colores individuales por fila
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  const isVertical = layout === 'vertical'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: isVertical ? 20 : -10, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={isVertical} horizontal={!isVertical} />}

          {isVertical ? (
            <>
              <XAxis
                type="number"
                stroke={textColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (valueFormatter ? valueFormatter(v) : v)}
              />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                stroke={textColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                width={80}
              />
            </>
          ) : (
            <>
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
            </>
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

          {series.map((s, sIdx) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color}
              radius={isVertical ? [0, 6, 6, 0] : barRadius}
              stackId={stacked ? '1' : undefined}
              maxBarSize={48}
            >
              {colorArray &&
                data.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={colorArray[idx % colorArray.length] || s.color}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
