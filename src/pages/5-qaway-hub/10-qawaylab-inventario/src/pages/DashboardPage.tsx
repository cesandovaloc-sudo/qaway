import { useState } from 'react'
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
  BarChart3,
  ShoppingCart,
  DollarSign,
  CreditCard,
  TrendingDown,
  Calendar,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesChartsSection } from '@/components/dashboard/SalesCharts'

export default function DashboardPage() {
  const [isOperationOpen, setIsOperationOpen] = useState(false)
  const [dateRangeFilter, setDateRangeFilter] = useState("01 Sep 2026 - 30 Sep 2026")
  const [warehouseFilter, setWarehouseFilter] = useState("Todos los almacenes")

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
        <p className="mt-6 text-sm font-medium text-muted ">Cargando dashboard...</p>
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted mt-0.5">Resumen de tu negocio</p>
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
    { icon: "🛒", title: "Registrar venta", description: "Emite una venta de productos o servicios.", tone: "bg-emerald-50 text-emerald-600", path: "/ventas/nueva" },
    { icon: "🚚", title: "Registrar compra", description: "Registra una compra de productos.", tone: "bg-purple-50 text-purple-600", path: "/compras/nueva" },
    { icon: "▱", title: "Ajuste de stock", description: "Aumenta o disminuye el stock de productos.", tone: "bg-orange-50 text-orange-600", path: "/logistica/movimientos" },
    { icon: "▤", title: "Nueva cotización", description: "Crea una cotización para un cliente.", tone: "bg-blue-50 text-blue-600", path: "/cotizaciones" },
    { icon: "▣", title: "Registrar gasto", description: "Registra un gasto operativo.", tone: "bg-pink-50 text-pink-600", path: "/gastos" },
    { icon: "▥", title: "Inventario físico", description: "Realiza un conteo de inventario.", tone: "bg-teal-50 text-teal-600", path: "/logistica/movimientos" },
    { icon: "⇄", title: "Transferencia", description: "Transfiere stock entre almacenes.", tone: "bg-purple-50 text-purple-600", path: "/logistica/movimientos" },
    { icon: "📊", title: "Ver reportes", description: "Accede a reportes de operaciones.", tone: "bg-slate-100 text-slate-700", path: "/reportes" },
  ]

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BLOQUE NUEVO: RESUMEN PANEL (DISEÑO APROBADO) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-surface border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Cabecera del Resumen */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-brand flex items-center justify-center font-bold text-lg">
              ☷
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink tracking-tight">Resumen</h1>
              <p className="text-xs text-muted mt-0.5">Estado actual de tu inventario y operación comercial.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand"
            >
              <option>01 Sep 2026 - 30 Sep 2026</option>
              <option>Este mes</option>
              <option>Últimos 30 días</option>
              <option>Este año</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand"
            >
              <option>Todos los almacenes</option>
              <option>Almacén Principal</option>
              <option>Almacén Surco</option>
            </select>

            <button
              onClick={() => setIsOperationOpen(true)}
              className="h-9 px-4 rounded-lg bg-ink text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span>＋</span> Nueva operación <span className="text-[10px] opacity-70">⌄</span>
            </button>
          </div>
        </div>

        {/* 4 Métricas Principales de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">Productos activos</span>
              <p className="text-2xl font-bold text-zinc-950 mt-1">{stats?.totalProducts ?? 248}</p>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                ↑ 12% <em className="not-italic text-zinc-400 font-normal">vs. mes anterior</em>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand flex items-center justify-center text-xl shrink-0">◇</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">Ventas del mes</span>
              <p className="text-2xl font-bold text-zinc-950 mt-1">{stats ? formatCurrency(stats.revenueMonth) : 'S/ 48,320'}</p>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                ↑ 18% <em className="not-italic text-zinc-400 font-normal">vs. mes anterior</em>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">🛒</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">Compras del mes</span>
              <p className="text-2xl font-bold text-zinc-950 mt-1">S/ 21,450</p>
              <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-0.5">
                ↑ 5% <em className="not-italic text-zinc-400 font-normal">vs. mes anterior</em>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">🚚</div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-500">Stock disponible</span>
              <p className="text-2xl font-bold text-zinc-950 mt-1">1,042 un.</p>
              <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                ↓ 6% <em className="not-italic text-zinc-400 font-normal">vs. mes anterior</em>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand flex items-center justify-center text-xl shrink-0">▤</div>
          </div>
        </div>

        {/* Fila Media: Actividad Reciente + Productos con Stock Bajo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad Reciente */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Actividad reciente</h3>
                <p className="text-xs text-zinc-500">Últimos movimientos registrados en el sistema.</p>
              </div>
              <a href="/logistica/movimientos" className="text-xs font-bold text-brand hover:underline">Ver todos →</a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-[11px] border-b border-zinc-100">
                    <th className="py-2 px-3 font-semibold">Fecha y hora</th>
                    <th className="py-2 px-3 font-semibold">Tipo</th>
                    <th className="py-2 px-3 font-semibold">Producto</th>
                    <th className="py-2 px-3 font-semibold">Cantidad</th>
                    <th className="py-2 px-3 font-semibold">Origen / Destino</th>
                    <th className="py-2 px-3 font-semibold">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  <tr>
                    <td className="py-2.5 px-3">Hoy, 14:32</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 font-bold text-[10px]">Salida</span></td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">Café Premium 250g</td>
                    <td className="py-2.5 px-3 font-bold text-red-500">- 10 un.</td>
                    <td className="py-2.5 px-3">Tienda Surco</td>
                    <td className="py-2.5 px-3">Ana Torres</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">Hoy, 11:20</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">Entrada</span></td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">Alimento Perro Adulto</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+ 50 un.</td>
                    <td className="py-2.5 px-3">Almacén Principal</td>
                    <td className="py-2.5 px-3">Carlos Ruiz</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">Ayer, 17:10</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 font-bold text-[10px]">Ajuste</span></td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">Shampoo Veterinario</td>
                    <td className="py-2.5 px-3 font-bold text-red-500">- 5 un.</td>
                    <td className="py-2.5 px-3">Almacén Principal</td>
                    <td className="py-2.5 px-3">S Admin</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3">Ayer, 10:45</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px]">Transferencia</span></td>
                    <td className="py-2.5 px-3 font-medium text-zinc-900">Collar Antipulgas</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+ 20 un.</td>
                    <td className="py-2.5 px-3">Sede Centro → Sede Sur</td>
                    <td className="py-2.5 px-3">Ana Torres</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Productos con Stock Bajo */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Productos con stock bajo</h3>
                <p className="text-xs text-zinc-500">Requieren atención inmediata.</p>
              </div>
              <a href="/inventario" className="text-xs font-bold text-brand hover:underline">Ver todos →</a>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Café Premium 250g', sku: 'CAF-250', stock: '3 un.', min: 'Mín: 20' },
                { name: 'Shampoo Veterinario 500ml', sku: 'VET-SH-500', stock: '2 un.', min: 'Mín: 15' },
                { name: 'Arena Sanitaria 5kg', sku: 'CAT-ARE-5', stock: '4 un.', min: 'Mín: 25' },
                { name: 'Alimento Gato Adulto', sku: 'CAT-AD-10', stock: '5 un.', min: 'Mín: 30' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-400">{item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-red-500 block">{item.stock}</span>
                    <span className="text-[10px] text-zinc-400 block">{item.min}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fila Inferior: 3 Tablas (Más vendidos, Últimas ventas, Últimas compras) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Productos más vendidos */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h4 className="text-xs font-bold text-zinc-900">Productos más vendidos</h4>
              <a href="/inventario" className="text-[11px] font-bold text-brand">Ver todos →</a>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100">
                  <th className="pb-1">#</th>
                  <th className="pb-1">Producto</th>
                  <th className="pb-1 text-right">Ventas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr><td className="py-1.5 font-bold">1</td><td>Alimento Perro 10kg</td><td className="text-right font-bold">124 un.</td></tr>
                <tr><td className="py-1.5 font-bold">2</td><td>Café Premium 250g</td><td className="text-right font-bold">98 un.</td></tr>
                <tr><td className="py-1.5 font-bold">3</td><td>Arena Sanitaria 5kg</td><td className="text-right font-bold">76 un.</td></tr>
              </tbody>
            </table>
          </div>

          {/* Últimas ventas */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h4 className="text-xs font-bold text-zinc-900">Últimas ventas</h4>
              <a href="/ventas" className="text-[11px] font-bold text-brand">Ver todas →</a>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100">
                  <th className="pb-1">N°</th>
                  <th className="pb-1">Cliente</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr><td className="py-1.5 font-mono">V-00123</td><td>Ana Torres</td><td className="text-right font-bold text-emerald-600">S/ 120.00</td></tr>
                <tr><td className="py-1.5 font-mono">V-00122</td><td>Clínica Patitas</td><td className="text-right font-bold text-emerald-600">S/ 450.00</td></tr>
                <tr><td className="py-1.5 font-mono">V-00121</td><td>Carlos Ruiz</td><td className="text-right font-bold text-emerald-600">S/ 85.00</td></tr>
              </tbody>
            </table>
          </div>

          {/* Últimas compras */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h4 className="text-xs font-bold text-zinc-900">Últimas compras</h4>
              <a href="/compras" className="text-[11px] font-bold text-brand">Ver todas →</a>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100">
                  <th className="pb-1">N°</th>
                  <th className="pb-1">Proveedor</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr><td className="py-1.5 font-mono">OC-0045</td><td>Vet Perú</td><td className="text-right font-bold text-purple-600">S/ 1,250.00</td></tr>
                <tr><td className="py-1.5 font-mono">OC-0044</td><td>Alimentos S.A.C.</td><td className="text-right font-bold text-purple-600">S/ 2,400.00</td></tr>
                <tr><td className="py-1.5 font-mono">OC-0043</td><td>Laboratorios Pet</td><td className="text-right font-bold text-purple-600">S/ 890.00</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MODAL DE NUEVA OPERACIÓN (INTERACTIVO Y COMPATIBLE) */}
      {isOperationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsOperationOpen(false)}>
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand flex items-center justify-center font-bold text-xl">
                  ＋
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-950">Nueva operación</h2>
                  <p className="text-xs text-zinc-500">Selecciona el tipo de operación que deseas registrar.</p>
                </div>
              </div>
              <button onClick={() => setIsOperationOpen(false)} className="text-zinc-400 hover:text-zinc-700 font-bold text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {operationsList.map((op, idx) => (
                <a
                  key={idx}
                  href={op.path}
                  className="p-3.5 rounded-xl border border-zinc-200 hover:border-brand hover:shadow-xs transition-all text-left flex flex-col justify-between group"
                >
                  <div className={`w-9 h-9 rounded-lg ${op.tone} flex items-center justify-center text-lg mb-2`}>
                    {op.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-brand transition-colors block">{op.title}</span>
                    <span className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 block">{op.description}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SEPARADOR Y COMPARADOR CON DASHBOARD ACTUAL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="relative py-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-300 border-dashed" /></div>
        <span className="relative px-4 py-1 bg-zinc-800 text-white rounded-full text-xs font-bold uppercase tracking-wider">
          ▼ DASHBOARD ACTUAL ABAJO PARA COMPARACIÓN ▼
        </span>
      </div>

      {/* Page header del Dashboard previo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand rounded-xl">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted mt-0.5">Resumen ejecutivo de tu negocio</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted bg-surface border border-gray-300 rounded-xl hover:bg-gray-100 hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ACCESOS RÁPIDOS PRIORITARIOS (PEDIDOS WEB, PAGOS, STOCK, POS) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <QuickAccessCards />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS EJECUTIVAS - VENTAS Y FLUJO DE CAJA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {stats && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Ventas y Flujo de Caja</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ventas Hoy */}
            <div className="bg-surface border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted ">Ventas Hoy</span>
                <Calendar size={14} className="text-muted " />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{stats.salesToday}</p>
              <p className="text-sm text-brand mt-1">{formatCurrency(stats.revenueToday)}</p>
            </div>

            {/* Ventas Semana */}
            <div className="bg-surface border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted ">Esta Semana</span>
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{stats.salesWeek}</p>
              <p className="text-sm text-green-400 mt-1">{formatCurrency(stats.revenueWeek)}</p>
            </div>

            {/* Ventas Mes */}
            <div className="bg-surface border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted ">Este Mes</span>
                <BarChart3 size={14} className="text-muted " />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{stats.salesMonth}</p>
              <p className="text-sm text-brand mt-1">{formatCurrency(stats.revenueMonth)}</p>
            </div>

            {/* Por Cobrar */}
            <div className="bg-surface border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted ">Por Cobrar</span>
                <CreditCard size={14} className="text-yellow-400" />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{stats.pendingPayments}</p>
              <p className="text-sm text-yellow-400 mt-1">{formatCurrency(stats.pendingPaymentsAmount)}</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS DE INVENTARIO */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {stats && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-muted " />
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Inventario</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Productos" value={stats.totalProducts} icon={Package} color="text-brand" />
            <StatCard label="Valor inventario" value={formatCurrency(stats.inventoryValue)} icon={TrendingUp} color="text-green-400" />
            <StatCard label="Stock bajo" value={stats.lowStockCount} icon={AlertTriangle} color="text-yellow-400" />
            <StatCard label="Sin stock" value={stats.outOfStockCount} icon={TrendingDown} color="text-red-400" />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS COMERCIALES */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {stats && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={16} className="text-muted " />
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Comercial</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Clientes" value={stats.totalCustomers} icon={Users} color="text-purple-400" />
            <StatCard label="Cotizaciones pendientes" value={stats.pendingQuotations} icon={FileText} color="text-blue-400" />
            <StatCard label="Campañas activas" value={stats.activeCampaigns} icon={Zap} color="text-orange-400" />
            <StatCard label="Compras mes" value={stats.purchasesMonth} icon={ShoppingCart} color="text-cyan-400" />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Charts Section */}
      {salesData.length > 0 && (
        <section>
          <SalesChartsSection
            salesData={salesData}
            categoryData={categoryData}
            trendData={trendData}
          />
        </section>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />

        {/* Top Products */}
        <TopProducts products={topProducts} title="Productos más valiosos" />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <section>
          <TopProducts
            products={lowStockProducts}
            title="Productos con stock bajo"
            showLowStock
          />
        </section>
      )}

      {/* Empty state if no products */}
      {stats && stats.totalProducts === 0 && (
        <div className="bg-surface border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="inline-flex p-4 bg-brand/10 rounded-2xl mb-6">
            <Package size={40} className="text-brand" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2">Tu inventario está vacío</h3>
          <p className="text-sm text-muted mb-8 max-w-md mx-auto leading-relaxed">
            Comienza agregando productos o capturando uno con la cámara para que la IA lo identifique automáticamente.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/captura"
              className="inline-flex items-center gap-2 h-10 px-5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover transition-colors"
            >
              <Package size={18} />
              Capturar con IA
            </a>
            <a
              href="/inventario"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-50 text-muted border border-zinc-200 rounded-xl text-sm font-semibold hover:bg-zinc-100 hover:text-ink transition-colors"
            >
              Ver inventario
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
