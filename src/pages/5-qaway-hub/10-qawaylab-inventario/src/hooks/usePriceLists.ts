import { useState, useEffect, useCallback } from 'react'
import { priceListService } from '@/services/priceListService'
import type { PriceList } from '@/types'

interface UsePriceListsReturn {
  lists: PriceList[]
  loading: boolean
  error: string | null
  createList: (data: Partial<PriceList>) => Promise<PriceList | null>
  updateList: (id: string, data: Partial<PriceList>) => Promise<PriceList | null>
  deleteList: (id: string) => Promise<boolean>
  toggleActive: (id: string, isActive: boolean) => Promise<boolean>
  refresh: () => Promise<void>
}

export function usePriceLists(): UsePriceListsReturn {
  const [lists, setLists] = useState<PriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await priceListService.getPriceLists()
      setLists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar listas')
    } finally {
      setLoading(false)
    }
  }, [])

  const createList = useCallback(async (data: Partial<PriceList>) => {
    const list = await priceListService.createPriceList(data)
    if (list) {
      setLists((prev) => [...prev, list])
    }
    return list
  }, [])

  const updateList = useCallback(async (id: string, data: Partial<PriceList>) => {
    const list = await priceListService.updatePriceList(id, data)
    if (list) {
      setLists((prev) => prev.map((l) => (l.id === id ? list : l)))
    }
    return list
  }, [])

  const deleteList = useCallback(async (id: string) => {
    const success = await priceListService.deletePriceList(id)
    if (success) {
      setLists((prev) => prev.filter((l) => l.id !== id))
    }
    return success
  }, [])

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    const success = await priceListService.toggleActive(id, isActive)
    if (success) {
      setLists((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_active: isActive } : l))
      )
    }
    return success
  }, [])

  useEffect(() => {
    fetchLists()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    toggleActive,
    refresh: fetchLists,
  }
}
