import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react'

// ── Types ──
export interface SalesData {
  month: string
  ventas: number
  cotizaciones: number
  ingresos: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface TrendData {
  day: string
  productos: number
  stock: number
  valor: number
}

interface SalesChartsProps {
  salesData: SalesData[]
  categoryData: CategoryData[]
  trendData: TrendData[]
}

// ── Colors ──
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4']

// ── Custom Tooltip ──
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-4 min-w-[160px]">
      <p className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-100">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-gray-900 tabular-nums">
              {typeof entry.value === 'number' 
                ? entry.name.includes('Valor') || entry.name.includes('Ingresos')
                  ? `S/ ${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Chart Card Wrapper ──
function ChartCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  children 
}: { 
  title: string
  subtitle: string
  icon: typeof BarChart3
  children: React.ReactNode 
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Icon size={18} className="text-orange-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Sales Overview Chart (Bar) ──
export function SalesOverviewChart({ data }: { data: SalesData[] }) {
  return (
    <ChartCard 
      title="Resumen de Ventas" 
      subtitle="Ventas y cotizaciones por mes"
      icon={BarChart3}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar 
              dataKey="ventas" 
              name="Ventas" 
              fill="#f97316" 
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar 
              dataKey="cotizaciones" 
              name="Cotizaciones" 
              fill="#3b82f6" 
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

// ── Revenue Chart (Area) ──
export function RevenueChart({ data }: { data: SalesData[] }) {
  return (
    <ChartCard 
      title="Ingresos" 
      subtitle="Tendencia de ingresos mensuales"
      icon={TrendingUp}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#10b981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorIngresos)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

// ── Category Distribution (Pie) ──
export function CategoryDistributionChart({ data }: { data: CategoryData[] }) {
  return (
    <ChartCard 
      title="Distribución por Categoría" 
      subtitle="Productos por categoría"
      icon={PieChartIcon}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: '11px', paddingLeft: '16px' }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

// ── Stock Trends (Line) ──
export function StockTrendsChart({ data }: { data: TrendData[] }) {
  return (
    <ChartCard 
      title="Tendencias de Inventario" 
      subtitle="Evolución de stock y productos"
      icon={Activity}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1 }} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line 
              type="monotone" 
              dataKey="productos" 
              name="Productos" 
              stroke="#f97316" 
              strokeWidth={2.5}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="stock" 
              name="Stock Total" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

// ── Main Charts Section ──
export function SalesChartsSection({ 
  salesData, 
  categoryData, 
  trendData 
}: SalesChartsProps) {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <BarChart3 size={16} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Análisis de ventas</h2>
      </div>

      {/* Row 1: Bar + Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesOverviewChart data={salesData} />
        <RevenueChart data={salesData} />
      </div>

      {/* Row 2: Pie + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart data={categoryData} />
        <StockTrendsChart data={trendData} />
      </div>
    </div>
  )
}
