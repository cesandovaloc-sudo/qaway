import { useEffect, useRef, useState } from 'react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Zap,
  Loader2,
  RefreshCw,
  LayoutDashboard,
  ShoppingCart,
  TrendingDown,
  Plus,
  ChevronDown,
  Boxes,
  CircleDollarSign,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesChartsSection } from '@/components/dashboard/SalesCharts'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const css = `
.pxp-root{--blue:#ff4b0b;--ink:#17233b;--muted:#71809e;--line:#e5ebf4;--soft:#f5f8fc;--green:#059669;--red:#e11d48;--amber:#d97706;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#f7f9fc;min-height:100vh;font-size:14px}
.pxp-root *{box-sizing:border-box}
.pxp-layout{display:flex;min-height:100vh}
.pxp-main{min-width:0;flex:1}
.pxp-content{padding:22px 20px;max-width:1800px;margin:auto}
.pxp-heading{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.pxp-heading-icon{width:38px;height:38px;border-radius:10px;background:#f4f4f5;border:1px solid #e4e4e7;color:#18181b;display:grid;place-items:center;font-size:21px}
.pxp-heading h1{font-size:28px;letter-spacing:-.8px;margin:0 0 2px;color:#111b2d;font-weight:800;line-height:1.15}
.pxp-heading p{margin:2px 0 0;color:var(--muted);font-size:13px}
.pxp-heading-actions{margin-left:auto;display:flex;gap:10px;align-items:center;flex-wrap:nowrap;flex-shrink:0}
.pxp-btn{border:1px solid var(--line);background:#fff;color:#34415b;border-radius:8px;padding:10px 14px;display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap;height:38px;transition:all .15s ease}
.pxp-btn:hover{border-color:#b8c9e6;background:#f9fbff}
.pxp-btn.primary{background:#ff4b0b;border-color:#ff4b0b;color:#fff;font-weight:650;box-shadow:0 2px 8px rgba(255,75,11,0.25)}
.pxp-btn.primary:hover{background:#ea3e00;border-color:#ea3e00;color:#fff}
.pxp-btn.dark{background:#1e293b;border-color:#1e293b;color:#fff}
.pxp-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:14px}
.pxp-metric{background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;min-width:0;box-shadow:0 4px 20px rgba(0,0,0,0.03);display:flex;flex-direction:column;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease;cursor:default}
.pxp-metric:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.06)}
.pxp-metric-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.pxp-metric-label{font-size:12px;font-weight:600;color:#52525b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pxp-metric-icon{width:28px;height:28px;flex-shrink:0;border-radius:8px;display:grid;place-items:center;background:#f4f4f5;color:#52525b}
.pxp-metric-value{font-size:26px;font-weight:800;letter-spacing:-.6px;color:#0f172a;margin-top:2px;white-space:nowrap;line-height:1.15}
.pxp-metric-note{font-size:11px;font-weight:500;color:#71717a;margin-top:6px;display:flex;align-items:center;gap:5px}
.pxp-toolbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:11px;margin-bottom:14px;flex-wrap:wrap;box-shadow:0 2px 10px rgba(0,0,0,0.03)}
.pxp-select-wrap{position:relative;display:inline-flex;align-items:center}
.pxp-select{height:38px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:0 34px 0 12px;color:#334155;font:inherit;font-size:13px;font-weight:500;appearance:none;-webkit-appearance:none;cursor:pointer;outline:none;transition:border-color .15s ease}
.pxp-select:hover{border-color:#cbd5e1}
.pxp-select:focus{border-color:#ff4b0b;box-shadow:0 0 0 3px rgba(255,75,11,0.1)}
.pxp-select-chevron{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:#64748b}
.pxp-table-wrap{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:visible;box-shadow:0 2px 10px rgba(0,0,0,0.02)}
@media(max-width:1150px){.pxp-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:800px){.pxp-content{padding:16px 12px}.pxp-heading h1{font-size:24px}.pxp-heading-actions{width:100%;margin-left:0}.pxp-heading-actions .pxp-btn{flex:1;justify-content:center}.pxp-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.pxp-metrics{grid-template-columns:1fr}.pxp-heading-actions{flex-wrap:wrap}.pxp-heading-actions .pxp-btn{flex:auto}}
`

function PxpMetricCard({
  icon,
  label,
  value,
  note,
  stroke = "#ff4b0b",
  points = "0,15 20,10 40,18 60,5 80,12 100,2"
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  note?: React.ReactNode
  stroke?: string
  points?: string
}) {
  return (
    <div className="pxp-metric">
      <div className="pxp-metric-top">
        <span className="pxp-metric-label">{label}</span>
        <div className="pxp-metric-icon">{icon}</div>
      </div>
      <div className="pxp-metric-value">{value}</div>
      {points && (
        <svg viewBox="0 0 100 20" style={{ width: "100%", height: 20, marginTop: 8 }} preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {note && <div className="pxp-metric-note">{note}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [isOperationOpen, setIsOperationOpen] = useState(false)
  const [warehouse, setWarehouse] = useState("Todos los almacenes")
  const [dateRange, setDateRange] = useState("Este mes")
  const modalRef = useDismissOnEscapeOrOutside(isOperationOpen, () => setIsOperationOpen(false))

  const [rendimientoPeriod, setRendimientoPeriod] = useState('Mensual')
  const [showRendimientoMenu, setShowRendimientoMenu] = useState(false)
  const rendimientoMenuRef = useRef<HTMLDivElement>(null)
  const [canalTimeframe, setCanalTimeframe] = useState('Este mes')
  const [showCanalMenu, setShowCanalMenu] = useState(false)
  const canalMenuRef = useRef<HTMLDivElement>(null)
  const [etapaTimeframe, setEtapaTimeframe] = useState('Este mes')
  const [showEtapaMenu, setShowEtapaMenu] = useState(false)
  const etapaMenuRef = useRef<HTMLDivElement>(null)
  const [revenueTimeRange, setRevenueTimeRange] = useState('12m')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (rendimientoMenuRef.current && !rendimientoMenuRef.current.contains(target)) setShowRendimientoMenu(false)
      if (canalMenuRef.current && !canalMenuRef.current.contains(target)) setShowCanalMenu(false)
      if (etapaMenuRef.current && !etapaMenuRef.current.contains(target)) setShowEtapaMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const {
    stats,
    recentActivity,
    topProducts,
    lowStockProducts,
    salesData,
    categoryData,
    trendData,
    loading,
    error,
    refresh,
  } = useDashboard()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const COLORS = ['#ff4b0b', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563']
  const salesMonth = stats?.salesMonth ?? 0
  const totalCustomers = stats?.totalCustomers ?? 0
  const rendimientoData = [
    { name: 'Dic', ingresos: 200, ganadas: 150 },
    { name: 'Ene', ingresos: 350, ganadas: 250 },
    { name: 'Feb', ingresos: 600, ganadas: 400 },
    { name: 'Mar', ingresos: 500, ganadas: 300 },
    { name: 'Abr', ingresos: 900, ganadas: 700 },
    { name: 'May', ingresos: salesMonth / 1000, ganadas: totalCustomers * 100 },
  ]
  const channelData = [
    { name: 'Referidos', ganado: 420000, curso: 180000 },
    { name: 'Inbound / Web', ganado: 312000, curso: 100000 },
    { name: 'Email Marketing', ganado: 198000, curso: 50000 },
    { name: 'Ads (Dinámico)', ganado: salesMonth, curso: stats?.pendingPayments ?? 0 },
  ]
  const pieData = [
    { name: 'Nuevo Lead', value: stats?.totalProducts ?? 0 },
    { name: 'Calificación', value: stats?.totalCustomers ?? 0 },
    { name: 'Propuesta', value: stats?.pendingQuotations ?? 0 },
    { name: 'Negociación', value: stats?.activeCampaigns ?? 0 },
    { name: 'Cierre', value: stats?.salesToday ?? 0 },
  ].filter(item => item.value > 0)
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0)
  const revenueMonths = revenueTimeRange === '30d' ? 4 : revenueTimeRange === '90d' ? 3 : 12
  const revenueBars = (salesData.length > 0 ? salesData.slice(-revenueMonths) : rendimientoData.slice(-revenueMonths)).map((item, index) => {
    const value = 'ingresos' in item ? item.ingresos : ('ventas' in item ? item.ingresos : 0)
    const values = salesData.length > 0 ? salesData.slice(-revenueMonths).map(sale => sale.ingresos) : rendimientoData.slice(-revenueMonths).map(data => data.ingresos)
    const maxValue = Math.max(...values, 1)
    return {
      month: 'month' in item ? item.month : item.name,
      value,
      height: `${Math.max(Math.round((value / maxValue) * 100), 6)}%`,
      label: formatCurrency(value),
    }
  })

  const formatActivityTime = (timestamp: string) => {
    const diffMinutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diffMinutes < 1) return 'Ahora'
    if (diffMinutes < 60) return `${diffMinutes}m`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h`
    return `${Math.floor(diffHours / 24)}d`
  }

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-brand/20 animate-ping" />
        </div>
        <p className="mt-6 text-sm font-medium text-muted">Cargando dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand/10 rounded-xl">
              <LayoutDashboard size={24} className="text-brand" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Resumen</h1>
              <p className="text-sm text-muted mt-0.5">Estado actual de tu inventario y operación comercial.</p>
            </div>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-400">Error al cargar</h3>
              <p className="text-sm text-muted mt-1">{error}</p>
              <button
                onClick={refresh}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={14} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const operationsList = [
    { icon: "🛒", title: "Registrar venta", description: "Emite una venta de productos o servicios.", tone: "bg-emerald-50 text-emerald-600", path: "/punto-de-venta" },
    { icon: "🚚", title: "Registrar compra", description: "Registra una compra de productos.", tone: "bg-purple-50 text-purple-600", path: "/compras/nueva" },
    { icon: "▱", title: "Ajuste de stock", description: "Aumenta o disminuye el stock de productos.", tone: "bg-orange-50 text-orange-600", path: "/logistica/movimientos" },
    { icon: "▤", title: "Nueva cotización", description: "Crea una cotización para un cliente.", tone: "bg-blue-50 text-blue-600", path: "/cotizaciones" },
    { icon: "▣", title: "Registrar gasto", description: "Registra un gasto operativo.", tone: "bg-pink-50 text-pink-600", path: "/gastos" },
    { icon: "▥", title: "Inventario físico", description: "Realiza un conteo de inventario.", tone: "bg-teal-50 text-teal-600", path: "/logistica/movimientos" },
    { icon: "⇄", title: "Transferencia", description: "Transfiere stock entre almacenes.", tone: "bg-purple-50 text-purple-600", path: "/logistica/movimientos" },
    { icon: "📊", title: "Ver reportes", description: "Accede a reportes de operaciones.", tone: "bg-slate-100 text-slate-700", path: "/reportes" },
  ]

  return (
    <div className="pxp-root">
      <style>{css}</style>
      <div className="pxp-layout">
        <main className="pxp-main">
          <div className="pxp-content">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ENCABEZADO OFICIAL (IDÉNTICO A PRODUCTOS: 38px, font 28/800)     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="pxp-heading">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="pxp-heading-icon">
                  <LayoutDashboard size={22} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 2px", color: "#111b2d" }}>
                    Resumen
                  </h1>
                  <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "13px" }}>
                    Estado actual de tu inventario y operación comercial en tiempo real.
                  </p>
                </div>
              </div>

              <div className="pxp-heading-actions">
                <button
                  className="pxp-btn"
                  onClick={refresh}
                  disabled={loading}
                  title="Actualizar datos en tiempo real"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                  Actualizar
                </button>
                <button
                  className="pxp-btn primary"
                  onClick={() => setIsOperationOpen(true)}
                  title="Registrar una nueva operación en el sistema"
                >
                  <Plus size={15} /> Nueva operación <ChevronDown size={13} />
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GRID DE KPIS OFICIAL (5 COLUMNAS, TARJETAS PXP CON SPARKLINE) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {stats && (
              <section className="pxp-metrics">
                <PxpMetricCard
                  icon={<Package size={16} strokeWidth={1.75} />}
                  label="Productos activos"
                  value={stats.totalProducts.toLocaleString("es-PE")}
                  note={<><span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b] inline-block animate-pulse" /> Data en vivo</>}
                  stroke="#ff4b0b"
                  points="0,15 20,10 40,18 60,5 80,12 100,2"
                />
                <PxpMetricCard
                  icon={<ShoppingCart size={16} strokeWidth={1.75} />}
                  label="Ventas del mes"
                  value={formatCurrency(stats.revenueMonth)}
                  note={<span style={{ color: "#059669", fontWeight: 600 }}>↑ 18% vs. mes anterior</span>}
                  stroke="#059669"
                  points="0,18 20,14 40,16 60,8 80,10 100,2"
                />
                <PxpMetricCard
                  icon={<TrendingUp size={16} strokeWidth={1.75} />}
                  label="Compras del mes"
                  value={formatCurrency(stats.purchasesMonth)}
                  note={<span style={{ color: "#7c3aed", fontWeight: 600 }}>↑ 5% vs. mes anterior</span>}
                  stroke="#7c3aed"
                  points="0,14 20,16 40,10 60,15 80,8 100,12"
                />
                <PxpMetricCard
                  icon={<Boxes size={16} strokeWidth={1.75} />}
                  label="Stock disponible"
                  value={`${(stats.totalStock ?? stats.totalProducts).toLocaleString("es-PE")} un.`}
                  note={<span style={{ color: "#0284c7", fontWeight: 600 }}>Capacidad óptima</span>}
                  stroke="#0284c7"
                  points="0,12 25,15 50,9 75,14 100,6"
                />
                <PxpMetricCard
                  icon={<CircleDollarSign size={16} strokeWidth={1.75} />}
                  label="Valor inventario"
                  value={formatCurrency(stats.inventoryValue)}
                  note={<span style={{ color: "#ff4b0b", fontWeight: 600 }}>↑ 9% vs. mes anterior</span>}
                  stroke="#ff4b0b"
                  points="0,16 20,12 40,15 60,7 80,9 100,3"
                />
              </section>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TOOLBAR UNIFICADA (FILTROS DE ALMACÉN, PERÍODO Y ACCIONES)      */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="pxp-toolbar">
              <div className="pxp-select-wrap">
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="pxp-select"
                  aria-label="Filtrar por almacén"
                >
                  <option>Todos los almacenes</option>
                  <option>Almacén Principal</option>
                  <option>Almacén Surco</option>
                  <option>Almacén Secundario</option>
                </select>
                <ChevronDown size={14} className="pxp-select-chevron" />
              </div>

              <div className="pxp-select-wrap">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pxp-select"
                  aria-label="Filtrar rango de fechas"
                >
                  <option>Este mes</option>
                  <option>Últimos 30 días</option>
                  <option>Este año</option>
                  <option>Todo el histórico</option>
                </select>
                <ChevronDown size={14} className="pxp-select-chevron" />
              </div>

              <button
                className="pxp-btn"
                onClick={() => setIsOperationOpen(true)}
                style={{ marginLeft: "auto" }}
              >
                ⚡ Acciones rápidas
              </button>
            </div>

            {/* GRAFICOS CENTRALES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
                <div className="flex justify-between items-center mb-5 relative">
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight">Rendimiento comercial</h4>
                  <div className="relative" ref={rendimientoMenuRef}>
                    <button
                      onClick={() => { setShowRendimientoMenu(!showRendimientoMenu); setShowCanalMenu(false); setShowEtapaMenu(false) }}
                      className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"
                    >
                      <span>{rendimientoPeriod}</span><ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {showRendimientoMenu && (
                      <div className="absolute right-0 mt-1.5 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                        {['Diario', 'Semanal', 'Mensual', 'Trimestral'].map(period => (
                          <button key={period} onClick={() => { setRendimientoPeriod(period); setShowRendimientoMenu(false) }} className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${rendimientoPeriod === period ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'}`}>{period}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-[#ff4b0b]" /> Ingresos (k)</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded-full bg-zinc-900" /> Cierres</div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rendimientoData} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `$${value}`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                      <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }} />
                      <Line yAxisId="left" type="monotone" dataKey="ingresos" stroke="#ff4b0b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ff4b0b' }} />
                      <Line yAxisId="right" type="monotone" dataKey="ganadas" stroke="#18181b" strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#18181b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
                <div className="flex justify-between items-center mb-5 relative">
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight">Ingresos por canal</h4>
                  <div className="relative" ref={canalMenuRef}>
                    <button onClick={() => { setShowCanalMenu(!showCanalMenu); setShowRendimientoMenu(false); setShowEtapaMenu(false) }} className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]">
                      <span>{canalTimeframe}</span><ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                    {showCanalMenu && <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                      {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Año actual'].map(timeframe => <button key={timeframe} onClick={() => { setCanalTimeframe(timeframe); setShowCanalMenu(false) }} className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${canalTimeframe === timeframe ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'}`}>{timeframe}</button>)}
                    </div>}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-zinc-500">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#ff4b0b]" /> Ganado</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-zinc-200" /> En curso</div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#52525b', fontWeight: 500 }} width={95} />
                      <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '10px', border: '1px solid #e4e4e7', fontSize: '12px', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)' }} />
                      <Bar dataKey="ganado" stackId="a" fill="#ff4b0b" barSize={16} radius={[0, 0, 0, 0]} /><Bar dataKey="curso" stackId="a" fill="#e4e4e7" barSize={16} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 cursor-default">
                <div className="flex justify-between items-center mb-5 relative">
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight">Oportunidades por etapa</h4>
                  <div className="relative" ref={etapaMenuRef}>
                    <button onClick={() => { setShowEtapaMenu(!showEtapaMenu); setShowRendimientoMenu(false); setShowCanalMenu(false) }} className="text-xs font-semibold flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 px-2.5 py-1.5 rounded-lg active:scale-[0.98]"><span>{etapaTimeframe}</span><ChevronDown className="w-3.5 h-3.5 text-zinc-500" /></button>
                    {showEtapaMenu && <div className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 py-1 text-xs animate-in fade-in duration-150">
                      {['Este mes', 'Últimos 30 días', 'Este trimestre', 'Todo el histórico'].map(timeframe => <button key={timeframe} onClick={() => { setEtapaTimeframe(timeframe); setShowEtapaMenu(false) }} className={`w-full text-left px-3 py-1.5 font-medium transition-colors ${etapaTimeframe === timeframe ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600 hover:bg-zinc-50'}`}>{timeframe}</button>)}
                    </div>}
                  </div>
                </div>
                <div className="flex items-center justify-between h-56">
                  <div className="relative w-1/2 h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none" cornerRadius={4}>{pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-xs font-semibold text-zinc-400">Total</span><span className="text-3xl font-extrabold tracking-tight text-zinc-900">{pieTotal}</span></div>
                  </div>
                  <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">{pieData.map((item, index) => <div key={item.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="font-semibold text-zinc-700 truncate max-w-[85px]">{item.name}</span></div><span className="text-zinc-600 font-semibold">{pieTotal ? ((item.value / pieTotal) * 100).toFixed(1) : '0.0'}%</span></div>)}</div>
                </div>
              </div>
            </div>

            {/* Fila copiada del Panel: crecimiento de ingresos + actividad reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950">Crecimiento de ingresos y ventas</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Pagos de pasarelas y pedidos comerciales consolidado por mes</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                      {[{ id: '30d', label: '30 d' }, { id: '90d', label: '90 d' }, { id: '12m', label: '12 m' }, { id: 'all', label: 'Todo' }].map((range) => (
                        <button key={range.id} type="button" onClick={() => setRevenueTimeRange(range.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${revenueTimeRange === range.id ? 'bg-white text-zinc-950 shadow-2xs font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {salesData.length > 0 ? (
                    <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
                      {revenueBars.map((bar, index) => (
                        <div key={`${bar.month}-${index}`} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap z-10 shadow-sm pointer-events-none">{bar.label}</div>
                          <div className="w-full bg-gradient-to-t from-[#ff4b0b] to-[#ff7a45] rounded-t-lg transition-all duration-300 ease-out group-hover:brightness-110" style={{ height: bar.height }} />
                          <span className="text-[11px] font-medium text-zinc-400 mt-2">{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center rounded-xl bg-zinc-50/70 border border-dashed border-zinc-200">
                      <p className="text-xs text-zinc-400 font-medium">Sin cobros ni ventas registradas en este período.</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <span>Volumen consolidado: {formatCurrency(stats?.revenueMonth ?? 0)}</span>
                  <span className="text-zinc-500 font-semibold">MRR estimado: {formatCurrency(stats?.revenueMonth ?? 0)}</span>
                </div>
              </div>

              <div className="lg:col-span-1 bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-950">Actividad reciente</h3>
                    </div>
                    <button type="button" className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-0.5 cursor-pointer">Ver todo <span aria-hidden="true">→</span></button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 6).map((activity) => {
                      const ActivityIcon = activity.type === 'product' ? Package : activity.type === 'quotation' ? FileText : activity.type === 'campaign' ? Zap : RefreshCw
                      return (
                        <div key={activity.id} className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-orange-50 text-orange-500"><ActivityIcon size={13} className="w-3.5 h-3.5" /></span>
                          <div className="flex-1 min-w-0"><p className="font-bold text-zinc-900 truncate">{activity.title}</p><p className="text-zinc-500 text-[11px] truncate mt-0.5">{activity.description}</p></div>
                          <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap bg-zinc-100 px-2 py-0.5 rounded-full">{formatActivityTime(activity.timestamp)}</span>
                        </div>
                      )
                    })}
                    {recentActivity.length === 0 && <p className="text-xs text-zinc-400 py-6 text-center">Sin actividad registrada todavía.</p>}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium"><span>En vivo</span><span className="text-emerald-600 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sincronizado</span></div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ACCESOS RÁPIDOS PRIORITARIOS (PEDIDOS WEB, PAGOS, STOCK, POS)   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: "20px" }}>
              <QuickAccessCards />
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECCIONES DESPLEGABLES DE AUDITORÍA DETALLADA                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div style={{ display: "grid", gap: "14px", marginBottom: "22px" }}>
              {stats && (
                <CollapsibleSection id="ventas-caja" title="Ventas y Flujo de Caja" defaultOpen={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Ventas Hoy" value={stats.salesToday} icon={TrendingUp} color="text-brand" />
                    <StatCard label="Esta Semana" value={stats.salesWeek} icon={TrendingUp} color="text-green-400" />
                    <StatCard label="Este Mes" value={stats.salesMonth} icon={TrendingUp} color="text-brand" />
                    <StatCard label="Por Cobrar" value={stats.pendingPayments} icon={FileText} color="text-yellow-400" />
                  </div>
                </CollapsibleSection>
              )}

              {stats && (
                <CollapsibleSection id="inventario" title="Inventario" defaultOpen={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Productos" value={stats.totalProducts} icon={Package} color="text-brand" />
                    <StatCard label="Valor inventario" value={formatCurrency(stats.inventoryValue)} icon={TrendingUp} color="text-green-400" />
                    <StatCard label="Stock bajo" value={stats.lowStockCount} icon={AlertTriangle} color="text-yellow-400" />
                    <StatCard label="Sin stock" value={stats.outOfStockCount} icon={TrendingDown} color="text-red-400" />
                  </div>
                </CollapsibleSection>
              )}

              {stats && (
                <CollapsibleSection id="comercial" title="Comercial" defaultOpen={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Clientes" value={stats.totalCustomers} icon={Users} color="text-purple-400" />
                    <StatCard label="Cotizaciones pendientes" value={stats.pendingQuotations} icon={FileText} color="text-blue-400" />
                    <StatCard label="Campañas activas" value={stats.activeCampaigns} icon={Zap} color="text-orange-400" />
                    <StatCard label="Compras mes" value={formatCurrency(stats.purchasesMonth)} icon={ShoppingCart} color="text-cyan-400" />
                  </div>
                </CollapsibleSection>
              )}

              {salesData.length > 0 && (
                <CollapsibleSection id="graficos" title="Análisis de ventas" defaultOpen={false}>
                  <SalesChartsSection
                    salesData={salesData}
                    categoryData={categoryData}
                    trendData={trendData}
                  />
                </CollapsibleSection>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CONTENIDO: ACTIVIDAD + TOP PRODUCTOS (componentes reales)       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: "22px" }}>
              <RecentActivity activities={recentActivity} />
              <TopProducts products={topProducts} title="Productos más valiosos" />
            </div>

            {/* Alerta stock bajo (data real) */}
            {lowStockProducts.length > 0 && (
              <section style={{ marginBottom: "22px" }}>
                <TopProducts
                  products={lowStockProducts}
                  title="Productos con stock bajo"
                  showLowStock
                />
              </section>
            )}

            {/* Empty state si no hay productos */}
            {stats && stats.totalProducts === 0 && (
              <div className="bg-white border border-[#e4e4e7] rounded-[16px] p-12 text-center shadow-xs">
                <div className="inline-flex p-4 bg-[#ff4b0b]/10 rounded-2xl mb-6">
                  <Package size={40} className="text-[#ff4b0b]" />
                </div>
                <h3 className="text-xl font-bold text-[#111b2d] mb-2">Tu inventario está vacío</h3>
                <p className="text-sm text-[#71809e] mb-8 max-w-md mx-auto leading-relaxed">
                  Comienza agregando productos o capturando uno con la cámara para que la IA lo identifique automáticamente.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <a
                    href="/captura"
                    className="inline-flex items-center gap-2 h-10 px-5 bg-[#ff4b0b] text-white rounded-[8px] text-sm font-bold hover:bg-[#ea3e00] transition-colors"
                  >
                    <Package size={18} />
                    Capturar con IA
                  </a>
                  <a
                    href="/inventario"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#f4f4f5] text-[#34415b] border border-[#e4e4e7] rounded-[8px] text-sm font-semibold hover:bg-[#e4e4e7] transition-colors"
                  >
                    Ver inventario
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL NUEVA OPERACIÓN (ESTILO OFICIAL PXP)                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isOperationOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsOperationOpen(false)}
        >
          <div
            ref={modalRef}
            className="bg-white border border-[#e4e4e7] rounded-[16px] max-w-2xl w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#fff2eb] text-[#ff4b0b] flex items-center justify-center font-bold text-xl">
                  ＋
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111b2d]">Nueva operación</h2>
                  <p className="text-xs text-[#71809e]">Selecciona el tipo de operación que deseas registrar.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOperationOpen(false)}
                className="text-[#71809e] hover:text-[#111b2d] font-bold text-xl px-2 py-1 cursor-pointer"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {operationsList.map((op, idx) => (
                <a
                  key={idx}
                  href={op.path}
                  className="p-3.5 rounded-[12px] border border-[#e4e4e7] hover:border-[#ff4b0b] hover:shadow-sm transition-all text-left flex flex-col justify-between group bg-white"
                >
                  <div className={`w-9 h-9 rounded-[8px] ${op.tone} flex items-center justify-center text-lg mb-2`}>
                    {op.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111b2d] group-hover:text-[#ff4b0b] transition-colors block">
                      {op.title}
                    </span>
                    <span className="text-[10px] text-[#71809e] line-clamp-2 mt-0.5 block">
                      {op.description}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
