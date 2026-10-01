import { useState, useEffect, useCallback } from 'react'
import { 
  dashboardService, 
  type DashboardStats, 
  type RecentActivity, 
  type TopProduct,
  type SalesData,
  type CategoryData,
  type TrendData
} from '@/services/dashboardService'
import { useTenant } from '@/context/TenantContext'

export function useDashboard() {
  const { activeTenantId } = useTenant()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<TopProduct[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        statsData, 
        activityData, 
        topData, 
        lowStockData,
        salesDataResult,
        categoryDataResult,
        trendDataResult
      ] = await Promise.all([
        dashboardService.getStats(activeTenantId),
        dashboardService.getRecentActivity(10, activeTenantId),
        dashboardService.getTopProducts(5, activeTenantId),
        dashboardService.getLowStockProducts(5, activeTenantId),
        dashboardService.getSalesData(activeTenantId),
        dashboardService.getCategoryData(activeTenantId),
        dashboardService.getTrendData(activeTenantId),
      ])

      setStats(statsData)
      setRecentActivity(activityData)
      setTopProducts(topData)
      setLowStockProducts(lowStockData)
      setSalesData(salesDataResult)
      setCategoryData(categoryDataResult)
      setTrendData(trendDataResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching dashboard')
    } finally {
      setLoading(false)
    }
  }, [activeTenantId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const refresh = async () => {
    await loadDashboardData()
  }

  return {
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
  }
}
