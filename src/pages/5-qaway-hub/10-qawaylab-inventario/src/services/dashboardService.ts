import { supabase } from '@/config/supabase'

// ── Dashboard Stats ──
export interface DashboardStats {
  totalProducts: number
  totalStock: number
  inventoryValue: number
  lowStockCount: number
  outOfStockCount: number
  activeProducts: number
  productsInOffer: number
  productsInLiquidation: number
  totalCustomers: number
  pendingQuotations: number
  activeCampaigns: number
  // Executive metrics
  salesToday: number
  salesWeek: number
  salesMonth: number
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  pendingPayments: number
  pendingPaymentsAmount: number
  purchasesMonth: number
  purchasesMonthAmount: number
}

// ── Recent Activity ──
export interface RecentActivity {
  id: string
  type: 'product' | 'quotation' | 'campaign' | 'movement'
  title: string
  description: string
  timestamp: string
  icon: string
}

// ── Top Products ──
export interface TopProduct {
  id: string
  name: string
  sku: string
  stock: number
  price: number
  image_url: string | null
}

// ── Chart Data ──
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseResult = Record<string, any>

// ── Category Colors ──
const CATEGORY_COLORS: Record<string, string> = {
  'Mobiliario': '#f97316',
  'Tecnología': '#3b82f6',
  'Electrónica': '#10b981',
  'Herramientas': '#8b5cf6',
  'Material': '#ec4899',
  'Otros': '#06b6d4',
}

// ── Dashboard Service ──
export const dashboardService = {
  // Get all dashboard stats
  async getStats(): Promise<DashboardStats> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      productsResult,
      customersResult,
      quotationsResult,
      campaignsResult,
      salesTodayResult,
      salesWeekResult,
      salesMonthResult,
      pendingPaymentsResult,
      purchasesMonthResult,
    ] = await Promise.all([
      // Products stats
      supabase
        .from('products')
        .select('id, stock, min_stock, base_price, status, commercial_status'),
      // Customers count
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true }),
      // Quotations stats
      supabase
        .from('quotations')
        .select('id, status, total'),
      // Campaigns stats
      supabase
        .from('liquidation_campaigns')
        .select('id, status'),
      // Sales today
      supabase
        .from('sales')
        .select('id, total')
        .eq('status', 'active')
        .gte('created_at', todayStart),
      // Sales this week
      supabase
        .from('sales')
        .select('id, total')
        .eq('status', 'active')
        .gte('created_at', weekStart.toISOString()),
      // Sales this month
      supabase
        .from('sales')
        .select('id, total, payment_status')
        .eq('status', 'active')
        .gte('created_at', monthStart),
      // Pending payments
      supabase
        .from('sales')
        .select('id, total')
        .eq('status', 'active')
        .in('payment_status', ['deuda', 'parcial']),
      // Purchases this month
      supabase
        .from('purchase_orders')
        .select('id, total')
        .in('status', ['pending', 'approved', 'received'])
        .gte('created_at', monthStart),
    ])

    const products = productsResult.data || []
    const quotations = quotationsResult.data || []
    const campaigns = campaignsResult.data || []
    const salesToday = salesTodayResult.data || []
    const salesWeek = salesWeekResult.data || []
    const salesMonth = salesMonthResult.data || []
    const pendingPayments = pendingPaymentsResult.data || []
    const purchasesMonth = purchasesMonthResult.data || []

    // Calculate product stats
    const totalProducts = products.length
    const activeProducts = products.filter((p: SupabaseResult) => p.status === 'active').length
    const totalStock = products.reduce((sum: number, p: SupabaseResult) => sum + (p.stock || 0), 0)
    const inventoryValue = products.reduce((sum: number, p: SupabaseResult) => sum + ((p.base_price || 0) * (p.stock || 0)), 0)
    const lowStockCount = products.filter((p: SupabaseResult) => p.stock > 0 && (p.min_stock || 0) > 0 && p.stock <= p.min_stock).length
    const outOfStockCount = products.filter((p: SupabaseResult) => p.stock <= 0).length
    const productsInOffer = products.filter((p: SupabaseResult) => p.commercial_status === 'reserved').length
    const productsInLiquidation = products.filter((p: SupabaseResult) => p.commercial_status === 'sold').length

    // Calculate quotation stats
    const pendingQuotations = quotations.filter((q: SupabaseResult) => q.status === 'draft' || q.status === 'sent').length

    // Calculate campaign stats
    const activeCampaigns = campaigns.filter((c: SupabaseResult) => c.status === 'active').length

    // Calculate executive sales metrics
    const revenueToday = salesToday.reduce((sum: number, s: SupabaseResult) => sum + (s.total || 0), 0)
    const revenueWeek = salesWeek.reduce((sum: number, s: SupabaseResult) => sum + (s.total || 0), 0)
    const revenueMonth = salesMonth.reduce((sum: number, s: SupabaseResult) => sum + (s.total || 0), 0)
    const pendingPaymentsAmount = pendingPayments.reduce((sum: number, s: SupabaseResult) => sum + (s.total || 0), 0)
    const purchasesMonthAmount = purchasesMonth.reduce((sum: number, p: SupabaseResult) => sum + (p.total || 0), 0)

    return {
      totalProducts,
      totalStock,
      inventoryValue,
      lowStockCount,
      outOfStockCount,
      activeProducts,
      productsInOffer,
      productsInLiquidation,
      totalCustomers: customersResult.count || 0,
      pendingQuotations,
      activeCampaigns,
      // Executive metrics
      salesToday: salesToday.length,
      salesWeek: salesWeek.length,
      salesMonth: salesMonth.length,
      revenueToday,
      revenueWeek,
      revenueMonth,
      pendingPayments: pendingPayments.length,
      pendingPaymentsAmount,
      purchasesMonth: purchasesMonth.length,
      purchasesMonthAmount,
    }
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = []

    // Get recent products
    const { data: recentProducts } = await supabase
      .from('products')
      .select('id, name, sku, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentProducts) {
      recentProducts.forEach((product: SupabaseResult) => {
        activities.push({
          id: `product-${product.id}`,
          type: 'product',
          title: 'Producto agregado',
          description: `${product.name} (${product.sku})`,
          timestamp: product.created_at,
          icon: 'package',
        })
      })
    }

    // Get recent quotations
    const { data: recentQuotations } = await supabase
      .from('quotations')
      .select('id, status, total, created_at, customer:customers(name)')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentQuotations) {
      recentQuotations.forEach((quotation: SupabaseResult) => {
        const customer = quotation.customer as { name: string } | null
        activities.push({
          id: `quotation-${quotation.id}`,
          type: 'quotation',
          title: 'Cotización creada',
          description: `${customer?.name || 'Sin cliente'} - S/ ${(quotation.total || 0).toFixed(2)}`,
          timestamp: quotation.created_at,
          icon: 'file-text',
        })
      })
    }

    // Get recent campaigns
    const { data: recentCampaigns } = await supabase
      .from('liquidation_campaigns')
      .select('id, name, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentCampaigns) {
      recentCampaigns.forEach((campaign: SupabaseResult) => {
        activities.push({
          id: `campaign-${campaign.id}`,
          type: 'campaign',
          title: 'Campaña creada',
          description: campaign.name,
          timestamp: campaign.created_at,
          icon: 'zap',
        })
      })
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  },

  // Get top products (by stock value)
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, stock, base_price, image_url')
      .eq('status', 'active')
      .gt('stock', 0)
      .order('base_price', { ascending: false })
      .limit(limit)

    return (products || []).map((p: SupabaseResult) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock || 0,
      price: p.base_price || 0,
      image_url: p.image_url || null,
    }))
  },

  // Get low stock products
  async getLowStockProducts(limit: number = 5): Promise<TopProduct[]> {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, stock, min_stock, base_price, image_url')
      .eq('status', 'active')
      .gt('stock', 0)
      .gt('min_stock', 0)
      .order('stock', { ascending: true })

    const candidates = (products || []).filter((p: SupabaseResult) => p.stock <= p.min_stock)

    return candidates.slice(0, limit).map((p: SupabaseResult) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock || 0,
      price: p.base_price || 0,
      image_url: p.image_url || null,
    }))
  },

  // Get sales data for charts (last 6 months)
  // Optimización: 1 sola query para todo el rango (antes: 1 query por mes,
  // 6 round-trips secuenciales ≈ 2.7s con ~450ms de latencia por llamada).
  async getSalesData(): Promise<SalesData[]> {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const now = new Date()

    // Ventana completa: desde el 1° del mes hace 5 meses hasta hoy
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

    const { data: quotations } = await supabase
      .from('quotations')
      .select('id, total, status, created_at')
      .gte('created_at', rangeStart)

    // Buckets por año-mes para evitar colisiones de nombre entre años
    const buckets = new Map<number, SalesData>()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.getFullYear() * 12 + date.getMonth()
      buckets.set(key, {
        month: months[date.getMonth()],
        ventas: 0,
        cotizaciones: 0,
        ingresos: 0,
      })
    }

    ;(quotations || []).forEach((q: SupabaseResult) => {
      const d = new Date(q.created_at)
      const key = d.getFullYear() * 12 + d.getMonth()
      const bucket = buckets.get(key)
      if (!bucket) return
      bucket.cotizaciones++
      if (q.status === 'accepted') {
        bucket.ventas++
        bucket.ingresos += q.total || 0
      }
    })

    return [...buckets.values()]
  },

  // Get category distribution
  async getCategoryData(): Promise<CategoryData[]> {
    const { data: products } = await supabase
      .from('products')
      .select('category')
      .eq('status', 'active')

    // Count products per category
    const categoryCount: Record<string, number> = {}
    ;(products || []).forEach((p: SupabaseResult) => {
      const category = p.category || 'Otros'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    // Convert to array with colors
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#6b7280',
    }))
  },

  // Get trend data (last 7 days)
  // Optimización: 1 sola query para los 7 días (antes: 1 query por día,
  // 7 round-trips secuenciales ≈ 3.1s con ~450ms de latencia por llamada).
  async getTrendData(): Promise<TrendData[]> {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const now = new Date()

    // Ventana completa: inicio del día hace 6 días
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString()

    const { data: products } = await supabase
      .from('products')
      .select('id, stock, base_price, created_at')
      .gte('created_at', windowStart)

    // Buckets por día (medianoche local como llave), pre-creados en orden
    const buckets = new Map<number, TrendData & { order: number }>()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      buckets.set(key, {
        order: 6 - i,
        day: days[date.getDay()],
        productos: 0,
        stock: 0,
        valor: 0,
      })
    }

    ;(products || []).forEach((p: SupabaseResult) => {
      const d = new Date(p.created_at)
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const bucket = buckets.get(key)
      if (!bucket) return
      bucket.productos++
      bucket.stock += p.stock || 0
      bucket.valor += (p.base_price || 0) * (p.stock || 0)
    })

    return [...buckets.values()]
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...rest }) => rest)
  },
}
