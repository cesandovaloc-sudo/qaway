import { useState, useEffect, useCallback } from 'react'
import { catalogService, type CatalogFull, type CatalogStats } from '@/services/catalogService'
import type { Catalog, PaginationParams } from '@/types'

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  const fetchCatalogs = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await catalogService.getCatalogs(params || { page: pagination.page, per_page: pagination.per_page })
      setCatalogs(response.data)
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        total_pages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching catalogs')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.per_page])

  const createCatalog = async (catalog: Omit<Catalog, 'id' | 'created_at' | 'slug'>) => {
    try {
      setError(null)
      const newCatalog = await catalogService.createCatalog(catalog)
      setCatalogs(prev => [newCatalog, ...prev])
      return newCatalog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating catalog')
      throw err
    }
  }

  const updateCatalog = async (id: string, updates: Partial<Catalog>) => {
    try {
      setError(null)
      const updated = await catalogService.updateCatalog(id, updates)
      setCatalogs(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating catalog')
      throw err
    }
  }

  const deleteCatalog = async (id: string) => {
    try {
      setError(null)
      await catalogService.deleteCatalog(id)
      setCatalogs(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting catalog')
      throw err
    }
  }

  useEffect(() => {
    fetchCatalogs()
  }, [])

  return {
    catalogs,
    loading,
    error,
    pagination,
    fetchCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    setPage: (page: number) => fetchCatalogs({ page, per_page: pagination.per_page }),
  }
}

// Hook for single catalog with stats
export function useCatalog(catalogId: string | null) {
  const [catalog, setCatalog] = useState<CatalogFull | null>(null)
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!catalogId) {
      setCatalog(null)
      setLoading(false)
      return
    }

    const fetchCatalog = async () => {
      try {
        setLoading(true)
        setError(null)
        const [catalogData, statsData] = await Promise.all([
          catalogService.getCatalogById(catalogId),
          catalogService.getCatalogStats(catalogId),
        ])
        setCatalog(catalogData)
        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching catalog')
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [catalogId])

  const addItem = async (productId: string, bundleId?: string) => {
    if (!catalogId) return
    await catalogService.addItem(catalogId, {
      product_id: productId,
      bundle_id: bundleId || null,
    })
    // Refresh
    const updated = await catalogService.getCatalogById(catalogId)
    setCatalog(updated)
    const updatedStats = await catalogService.getCatalogStats(catalogId)
    setStats(updatedStats)
  }

  const removeItem = async (itemId: string) => {
    if (!catalogId) return
    await catalogService.removeItem(catalogId, itemId)
    // Refresh
    const updated = await catalogService.getCatalogById(catalogId)
    setCatalog(updated)
    const updatedStats = await catalogService.getCatalogStats(catalogId)
    setStats(updatedStats)
  }

  return {
    catalog,
    stats,
    loading,
    error,
    addItem,
    removeItem,
    refresh: async () => {
      if (!catalogId) return
      const [catalogData, statsData] = await Promise.all([
        catalogService.getCatalogById(catalogId),
        catalogService.getCatalogStats(catalogId),
      ])
      setCatalog(catalogData)
      setStats(statsData)
    },
  }
}

// Hook for public catalog (no auth needed)
export function usePublicCatalog(slug: string | null) {
  const [catalog, setCatalog] = useState<CatalogFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setCatalog(null)
      setLoading(false)
      return
    }

    const fetchCatalog = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await catalogService.getCatalogBySlug(slug)
        if (data) {
          setCatalog(data)
        } else {
          setError('Catálogo no encontrado')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching catalog')
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [slug])

  return { catalog, loading, error }
}
