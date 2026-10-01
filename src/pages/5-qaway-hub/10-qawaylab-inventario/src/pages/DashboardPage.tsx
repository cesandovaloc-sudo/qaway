import { useState } from 'react'
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
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesChartsSection } from '@/components/dashboard/SalesCharts'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import HubPanelPage from '../../../HubPanelPage'

export default function DashboardPage() {
  const [isOperationOpen, setIsOperationOpen] = useState(false)
  const modalRef = useDismissOnEscapeOrOutside(isOperationOpen, () => setIsOperationOpen(false))

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
    <div className="w-full max-w-[1800px] mx-auto space-y-6">
      <HubPanelPage canvasOnly />
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CABECERA ÚNICA (diseño acoplado + botón Actualizar funcional)   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f4f4f5] border border-[#e4e4e7] text-[#18181b] grid place-items-center text-[21px] flex-shrink-0">
            ☷
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 2px", color: "#111b2d", lineHeight: 1.15 }}>Resumen</h1>
            <p style={{ margin: "2px 0 0", color: "#71809e", fontSize: "13px" }}>Estado actual de tu inventario y operación comercial.</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-[38px] bg-white hover:bg-[#f9fbff] border border-[#e5ebf4] hover:border-[#b8c9e6] text-[#34415b] text-[13.5px] font-semibold px-3.5 rounded-[8px] transition-all cursor-pointer inline-flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ACCESOS RÁPIDOS PRIORITARIOS (PEDIDOS WEB, PAGOS, STOCK, POS)   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <QuickAccessCards />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* KPIs PRINCIPALES (colapsable, data real)                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {stats && (
        <CollapsibleSection id="kpis-principales" title="Métricas Principales" defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[12px] font-semibold text-[#52525b] truncate">Productos activos</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center text-sm shrink-0">◇</div>
              </div>
              <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">{stats.totalProducts}</p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[12px] font-semibold text-[#52525b] truncate">Ventas del mes</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center text-sm shrink-0">🛒</div>
              </div>
              <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">{formatCurrency(stats.revenueMonth)}</p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[12px] font-semibold text-[#52525b] truncate">Compras del mes</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center text-sm shrink-0">🚚</div>
              </div>
              <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">{formatCurrency(stats.purchasesMonth)}</p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-[12px] p-[14px_16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out cursor-default flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[12px] font-semibold text-[#52525b] truncate">Stock disponible</span>
                <div className="w-7 h-7 rounded-[8px] bg-[#f4f4f5] text-[#52525b] grid place-items-center text-sm shrink-0">▤</div>
              </div>
              <p className="text-[26px] font-[800] tracking-[-0.6px] text-[#0f172a] mt-0.5 leading-tight truncate">{stats.totalStock ?? stats.totalProducts} un.</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS EJECUTIVAS - VENTAS Y FLUJO DE CAJA (original)         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS DE INVENTARIO (original, colapsable)                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MÉTRICAS COMERCIALES (original, colapsable)                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* GRÁFICOS (solo original, colapsable)                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {salesData.length > 0 && (
        <CollapsibleSection id="graficos" title="Análisis de ventas" defaultOpen={false}>
          <SalesChartsSection
            salesData={salesData}
            categoryData={categoryData}
            trendData={trendData}
          />
        </CollapsibleSection>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CONTENIDO: ACTIVIDAD + TOP PRODUCTOS (componentes reales)       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />
        <TopProducts products={topProducts} title="Productos más valiosos" />
      </div>

      {/* Alerta stock bajo (data real) */}
      {lowStockProducts.length > 0 && (
        <section>
          <TopProducts
            products={lowStockProducts}
            title="Productos con stock bajo"
            showLowStock
          />
        </section>
      )}



      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL NUEVA OPERACIÓN (diseño acoplado, sin cambios)            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isOperationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsOperationOpen(false)}>
          <div ref={modalRef} className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
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

      {/* Empty state si no hay productos (original) */}
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
