import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

export default function RadarChartPro({
  data = [],
  series = [
    { key: 'score', name: 'Puntuación', color: '#ff4b0b' }
  ],
  subjectKey = 'subject',
  height = 320,
  valueFormatter,
  theme = 'light',
  showLegend = true
}) {
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey={subjectKey}
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 'auto']}
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 9 }}
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
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value) => <span style={{ color: textColor, fontWeight: 500 }}>{value}</span>}
            />
          )}
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name || s.key}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.4}
              dot={{ r: 3, fill: s.color }}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
