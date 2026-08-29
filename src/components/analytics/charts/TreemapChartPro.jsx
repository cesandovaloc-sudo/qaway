import React from 'react'
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import CustomChartTooltip from '../ui/CustomChartTooltip'

function CustomizedTreemapContent({
  root,
  depth,
  x,
  y,
  width,
  height,
  index,
  name,
  value,
  colors = ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
  valueFormatter
}) {
  const bg = colors[index % colors.length]
  const isLarge = width > 50 && height > 40

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: bg,
          stroke: '#ffffff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
          rx: 4,
          ry: 4
        }}
      />
      {isLarge && (
        <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
          <div className="w-full h-full flex flex-col justify-center items-center text-white text-center pointer-events-none p-1">
            <span className="text-[11px] font-bold truncate w-full shadow-xs">
              {name}
            </span>
            <span className="text-[10px] font-mono opacity-90">
              {valueFormatter ? valueFormatter(value) : value}
            </span>
          </div>
        </foreignObject>
      )}
    </g>
  )
}

export default function TreemapChartPro({
  data = [],
  dataKey = 'size',
  nameKey = 'name',
  height = 300,
  colors = ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
  valueFormatter,
  theme = 'light'
}) {
  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomizedTreemapContent colors={colors} valueFormatter={valueFormatter} />}
        >
          <Tooltip
            content={
              <CustomChartTooltip
                valueFormatter={valueFormatter}
                theme={theme}
              />
            }
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
