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
        .select('id, min_stock, base_price, status, commercial_status'),
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
    const totalStock = products.reduce((sum: number, p: SupabaseResult) => sum + (p.min_stock || 0), 0)
    const inventoryValue = products.reduce((sum: number, p: SupabaseResult) => sum + ((p.base_price || 0) * (p.min_stock || 0)), 0)
    const lowStockCount = products.filter((p: SupabaseResult) => p.min_stock > 0 && p.min_stock <= 5).length
    const outOfStockCount = products.filter((p: SupabaseResult) => p.min_stock === 0).length
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
      .select('id, name, sku, min_stock, base_price, image_url')
      .eq('status', 'active')
      .gt('min_stock', 0)
      .order('base_price', { ascending: false })
      .limit(limit)

    return (products || []).map((p: SupabaseResult) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.min_stock || 0,
      price: p.base_price || 0,
      image_url: p.image_url || null,
    }))
  },

  // Get low stock products
  async getLowStockProducts(limit: number = 5): Promise<TopProduct[]> {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, min_stock, base_price, image_url')
      .eq('status', 'active')
      .gt('min_stock', 0)
      .lte('min_stock', 5)
      .order('min_stock', { ascending: true })
      .limit(limit)

    return (products || []).map((p: SupabaseResult) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.min_stock || 0,
      price: p.base_price || 0,
      image_url: p.image_url || null,
    }))
  },

  // Get sales data for charts (last 6 months)
  async getSalesData(): Promise<SalesData[]> {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const now = new Date()
    const salesData: SalesData[] = []

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = months[date.getMonth()]
      
      // Get quotations for this month
      const startDate = date.toISOString()
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()

      const { data: quotations } = await supabase
        .from('quotations')
        .select('id, total, status, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      const monthQuotations = quotations || []
      const acceptedQuotations = monthQuotations.filter((q: SupabaseResult) => q.status === 'accepted')
      
      salesData.push({
        month: monthName,
        ventas: acceptedQuotations.length,
        cotizaciones: monthQuotations.length,
        ingresos: acceptedQuotations.reduce((sum: number, q: SupabaseResult) => sum + (q.total || 0), 0),
      })
    }

    return salesData
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
  async getTrendData(): Promise<TrendData[]> {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const now = new Date()
    const trendData: TrendData[] = []

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]

      // Get products created on this day
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
      const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()

      const { data: products } = await supabase
        .from('products')
        .select('id, min_stock, base_price')
        .gte('created_at', startDate)
        .lt('created_at', endDate)

      const dayProducts = products || []
      
      trendData.push({
        day: dayName,
        productos: dayProducts.length,
        stock: dayProducts.reduce((sum: number, p: SupabaseResult) => sum + (p.min_stock || 0), 0),
        valor: dayProducts.reduce((sum: number, p: SupabaseResult) => sum + ((p.base_price || 0) * (p.min_stock || 0)), 0),
      })
    }

    return trendData
  },
}
