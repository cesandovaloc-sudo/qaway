import { useState, useEffect } from 'react'
import { 
  dashboardService, 
  type DashboardStats, 
  type RecentActivity, 
  type TopProduct,
  type SalesData,
  type CategoryData,
  type TrendData
} from '@/services/dashboardService'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<TopProduct[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
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
          dashboardService.getStats(),
          dashboardService.getRecentActivity(10),
          dashboardService.getTopProducts(5),
          dashboardService.getLowStockProducts(5),
          dashboardService.getSalesData(),
          dashboardService.getCategoryData(),
          dashboardService.getTrendData(),
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
    }

    fetchDashboard()
  }, [])

  const refresh = async () => {
    try {
      setLoading(true)
      const [
        statsData, 
        activityData, 
        topData, 
        lowStockData,
        salesDataResult,
        categoryDataResult,
        trendDataResult
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(10),
        dashboardService.getTopProducts(5),
        dashboardService.getLowStockProducts(5),
        dashboardService.getSalesData(),
        dashboardService.getCategoryData(),
        dashboardService.getTrendData(),
      ])
      setStats(statsData)
      setRecentActivity(activityData)
      setTopProducts(topData)
      setLowStockProducts(lowStockData)
      setSalesData(salesDataResult)
      setCategoryData(categoryDataResult)
      setTrendData(trendDataResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing dashboard')
    } finally {
      setLoading(false)
    }
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
