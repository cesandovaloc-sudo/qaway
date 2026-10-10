import { useState, useEffect, useCallback } from 'react'
import { liquidationService, type CampaignWithItems, type CampaignStats } from '@/services/liquidationService'
import type { LiquidationCampaign, PaginationParams } from '@/types'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<LiquidationCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  const fetchCampaigns = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await liquidationService.getCampaigns(params || { page: pagination.page, per_page: pagination.per_page })
      setCampaigns(response.data)
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        total_pages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching campaigns')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.per_page])

  const createCampaign = async (campaign: CampaignWithItems) => {
    try {
      setError(null)
      const newCampaign = await liquidationService.createCampaign(campaign)
      setCampaigns(prev => [newCampaign, ...prev])
      return newCampaign
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating campaign')
      throw err
    }
  }

  const updateCampaign = async (id: string, updates: Partial<LiquidationCampaign>) => {
    try {
      setError(null)
      const updated = await liquidationService.updateCampaign(id, updates)
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating campaign')
      throw err
    }
  }

  const updateStatus = async (id: string, status: LiquidationCampaign['status']) => {
    try {
      setError(null)
      const updated = await liquidationService.updateStatus(id, status)
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status')
      throw err
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      setError(null)
      await liquidationService.deleteCampaign(id)
      setCampaigns(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting campaign')
      throw err
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return {
    campaigns,
    loading,
    error,
    pagination,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    updateStatus,
    deleteCampaign,
    setPage: (page: number) => fetchCampaigns({ page, per_page: pagination.per_page }),
  }
}

// Hook for single campaign with stats
export function useCampaign(campaignId: string | null) {
  const [campaign, setCampaign] = useState<(LiquidationCampaign & { items: any[] }) | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) {
      setCampaign(null)
      setLoading(false)
      return
    }

    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError(null)
        const [campaignData, statsData] = await Promise.all([
          liquidationService.getCampaignById(campaignId),
          liquidationService.getCampaignStats(campaignId),
        ])
        setCampaign(campaignData)
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching campaign')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId])

  const addProduct = async (productId: string, liquidationPrice: number) => {
    if (!campaignId) return
    await liquidationService.addProduct(campaignId, {
      product_id: productId,
      liquidation_price: liquidationPrice,
      package_price: null,
      max_quantity: null,
    })
    // Refresh campaign
    const updated = await liquidationService.getCampaignById(campaignId)
    setCampaign(updated)
    const updatedStats = await liquidationService.getCampaignStats(campaignId)
    setStats(updatedStats)
  }

  const removeProduct = async (productId: string) => {
    if (!campaignId) return
    await liquidationService.removeProduct(campaignId, productId)
    // Refresh campaign
    const updated = await liquidationService.getCampaignById(campaignId)
    setCampaign(updated)
    const updatedStats = await liquidationService.getCampaignStats(campaignId)
    setStats(updatedStats)
  }

  return {
    campaign,
    stats,
    loading,
    error,
    addProduct,
    removeProduct,
    refresh: async () => {
      if (!campaignId) return
      const [campaignData, statsData] = await Promise.all([
        liquidationService.getCampaignById(campaignId),
        liquidationService.getCampaignStats(campaignId),
      ])
      setCampaign(campaignData)
      setStats(statsData)
    },
  }
}
