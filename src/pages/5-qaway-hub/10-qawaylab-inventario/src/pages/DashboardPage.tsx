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
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesChartsSection } from '@/components/dashboard/SalesCharts'

export default function DashboardPage() {
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
        <p className="mt-6 text-sm font-medium text-muted-light/60">Cargando dashboard...</p>
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
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-muted-light/60 mt-0.5">Resumen de tu negocio</p>
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
              <p className="text-sm text-muted-light/60 mt-1">{error}</p>
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand rounded-xl">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-light/60 mt-0.5">Resumen ejecutivo de tu negocio</p>
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
      {/* MÉTRICAS EJECUTIVAS - VENTAS Y FLUJO DE CAJA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {stats && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-muted-light/60 uppercase tracking-wider">Ventas y Flujo de Caja</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ventas Hoy */}
            <div className="bg-surface border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Ventas Hoy</span>
                <Calendar size={14} className="text-muted-light/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.salesToday}</p>
              <p className="text-sm text-brand mt-1">{formatCurrency(stats.revenueToday)}</p>
            </div>

            {/* Ventas Semana */}
            <div className="bg-surface border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Esta Semana</span>
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.salesWeek}</p>
              <p className="text-sm text-green-400 mt-1">{formatCurrency(stats.revenueWeek)}</p>
            </div>

            {/* Ventas Mes */}
            <div className="bg-surface border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Este Mes</span>
                <BarChart3 size={14} className="text-muted-light/40" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.salesMonth}</p>
              <p className="text-sm text-brand mt-1">{formatCurrency(stats.revenueMonth)}</p>
            </div>

            {/* Por Cobrar */}
            <div className="bg-surface border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-light/60">Por Cobrar</span>
                <CreditCard size={14} className="text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.pendingPayments}</p>
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
            <Package size={16} className="text-muted-light/60" />
            <h2 className="text-sm font-semibold text-muted-light/60 uppercase tracking-wider">Inventario</h2>
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
            <ShoppingCart size={16} className="text-muted-light/60" />
            <h2 className="text-sm font-semibold text-muted-light/60 uppercase tracking-wider">Comercial</h2>
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
        <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center">
          <div className="inline-flex p-4 bg-brand/10 rounded-2xl mb-6">
            <Package size={40} className="text-brand" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tu inventario está vacío</h3>
          <p className="text-sm text-muted-light/60 mb-8 max-w-md mx-auto leading-relaxed">
            Comienza agregando productos o capturando uno con la cámara para que la IA lo identifique automáticamente.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/captura"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors"
            >
              <Package size={18} />
              Capturar con IA
            </a>
            <a
              href="/inventario"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-muted-light border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors"
            >
              Ver inventario
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
