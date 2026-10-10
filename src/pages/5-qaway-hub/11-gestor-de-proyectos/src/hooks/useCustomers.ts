import { useState, useEffect, useCallback } from 'react'
import { customerService } from '@/services/customerService'
import type { Customer, PaginationParams } from '@/types'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  const fetchCustomers = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      const response = await customerService.getCustomers(params || { page: pagination.page, per_page: pagination.per_page })
      setCustomers(response.data)
      setPagination({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
        total_pages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching customers')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.per_page])

  const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      setError(null)
      const newCustomer = await customerService.createCustomer(customer)
      setCustomers(prev => [newCustomer, ...prev])
      return newCustomer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating customer')
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      setError(null)
      const updated = await customerService.updateCustomer(id, updates)
      setCustomers(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating customer')
      throw err
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      setError(null)
      await customerService.deleteCustomer(id)
      setCustomers(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting customer')
      throw err
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setPage: (page: number) => fetchCustomers({ page, per_page: pagination.per_page }),
  }
}
