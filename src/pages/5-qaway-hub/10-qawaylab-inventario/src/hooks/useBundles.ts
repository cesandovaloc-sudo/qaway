import { useState, useEffect, useCallback } from 'react'
import { bundleService, type BundleWithItems } from '@/services/bundleService'
import type { Bundle, PaginationParams } from '@/types'

export function useBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  const fetchBundles = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await bundleService.getBundles(params || { page: pagination.page, per_page: pagination.per_page })
      setBundles(response.data)
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        total_pages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bundles')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.per_page])

  const createBundle = async (bundle: BundleWithItems) => {
    try {
      setError(null)
      const newBundle = await bundleService.createBundle(bundle)
      setBundles(prev => [newBundle, ...prev])
      return newBundle
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating bundle')
      throw err
    }
  }

  const updateBundle = async (id: string, updates: Partial<Bundle>) => {
    try {
      setError(null)
      const updated = await bundleService.updateBundle(id, updates)
      setBundles(prev => prev.map(b => b.id === id ? updated : b))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating bundle')
      throw err
    }
  }

  const deleteBundle = async (id: string) => {
    try {
      setError(null)
      await bundleService.deleteBundle(id)
      setBundles(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting bundle')
      throw err
    }
  }

  useEffect(() => {
    fetchBundles()
  }, [])

  return {
    bundles,
    loading,
    error,
    pagination,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    setPage: (page: number) => fetchBundles({ page, per_page: pagination.per_page }),
  }
}
