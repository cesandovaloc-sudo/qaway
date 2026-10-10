import { useState, useEffect, useCallback } from 'react'
import { quotationService, type QuotationInput } from '@/services/quotationService'
import type { Quotation, PaginationParams } from '@/types'

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  const fetchQuotations = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await quotationService.getQuotations(params || { page: pagination.page, per_page: pagination.per_page })
      setQuotations(response.data)
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        total_pages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching quotations')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.per_page])

  const createQuotation = async (input: QuotationInput) => {
    try {
      setError(null)
      const newQuotation = await quotationService.createQuotation(input)
      setQuotations(prev => [newQuotation, ...prev])
      return newQuotation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating quotation')
      throw err
    }
  }

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      setError(null)
      const updated = await quotationService.updateQuotation(id, updates)
      setQuotations(prev => prev.map(q => q.id === id ? updated : q))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating quotation')
      throw err
    }
  }

  const updateStatus = async (id: string, status: Quotation['status']) => {
    try {
      setError(null)
      const updated = await quotationService.updateStatus(id, status)
      setQuotations(prev => prev.map(q => q.id === id ? updated : q))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status')
      throw err
    }
  }

  const deleteQuotation = async (id: string) => {
    try {
      setError(null)
      await quotationService.deleteQuotation(id)
      setQuotations(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting quotation')
      throw err
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  return {
    quotations,
    loading,
    error,
    pagination,
    fetchQuotations,
    createQuotation,
    updateQuotation,
    updateStatus,
    deleteQuotation,
    setPage: (page: number) => fetchQuotations({ page, per_page: pagination.per_page }),
  }
}

// Hook for single quotation
export function useQuotation(quotationId: string | null) {
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quotationId) {
      setQuotation(null)
      setLoading(false)
      return
    }

    const fetchQuotation = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await quotationService.getQuotationById(quotationId)
        setQuotation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching quotation')
      } finally {
        setLoading(false)
      }
    }

    fetchQuotation()
  }, [quotationId])

  const addItem = async (item: { product_id: string; quantity: number; unit_price: number }) => {
    if (!quotationId) return
    await quotationService.addItem(quotationId, item)
    // Refresh
    const updated = await quotationService.getQuotationById(quotationId)
    setQuotation(updated)
  }

  const removeItem = async (itemId: string) => {
    if (!quotationId) return
    await quotationService.removeItem(quotationId, itemId)
    // Refresh
    const updated = await quotationService.getQuotationById(quotationId)
    setQuotation(updated)
  }

  return {
    quotation,
    loading,
    error,
    addItem,
    removeItem,
    refresh: async () => {
      if (!quotationId) return
      const updated = await quotationService.getQuotationById(quotationId)
      setQuotation(updated)
    },
  }
}
