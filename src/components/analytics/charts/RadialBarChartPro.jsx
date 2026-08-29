import React from 'react'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function RadialBarChartPro({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colors = ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b'],
  height = 300,
  innerRadius = '20%',
  outerRadius = '95%',
  valueFormatter,
  theme = 'light',
  showLegend = true
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const textColor = isDark ? '#94a3b8' : '#64748b'

  // Asignar colores a la data si no vienen integrados
  const formattedData = data.map((item, idx) => ({
    ...item,
    fill: item.fill || colors[idx % colors.length]
  }))

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          barSize={14}
          data={formattedData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            background={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
            clockWise
            dataKey={dataKey}
            cornerRadius={8}
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
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span style={{ color: textColor, fontWeight: 500 }}>{value}</span>}
            />
          )}
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}
