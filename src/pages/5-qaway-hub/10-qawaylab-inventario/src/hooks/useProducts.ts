import { useState, useEffect, useCallback } from 'react'
import { productService } from '@/services/productService'
import type {
  Product,
  ProductFilters,
  PaginationParams,

} from '@/types'

interface UseProductsState {
  products: Product[]
  total: number
  page: number
  perPage: number
  totalPages: number
  loading: boolean
  error: string | null
}

interface UseProductsReturn extends UseProductsState {
  fetchProducts: (filters?: ProductFilters, pagination?: PaginationParams) => Promise<void>
  createProduct: (data: Partial<Product>) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
  searchProducts: (query: string) => Promise<Product[]>
  setPage: (page: number) => void
  setFilters: (filters: ProductFilters) => void
  refresh: () => Promise<void>
}

const initialState: UseProductsState = {
  products: [],
  total: 0,
  page: 1,
  perPage: 20,
  totalPages: 0,
  loading: false,
  error: null,
}

export function useProducts(): UseProductsReturn {
  const [state, setState] = useState<UseProductsState>(initialState)
  const [filters, setFiltersState] = useState<ProductFilters>({})
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 20,
  })

  const fetchProducts = useCallback(
    async (overrideFilters?: ProductFilters, overridePagination?: PaginationParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const result = await productService.getProducts(
          overrideFilters || filters,
          overridePagination || pagination
        )
        setState({
          products: result.data,
          total: result.total,
          page: result.page,
          perPage: result.per_page,
          totalPages: result.total_pages,
          loading: false,
          error: null,
        })
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar productos',
        }))
      }
    },
    [filters, pagination]
  )

  const createProduct = useCallback(async (data: Partial<Product>) => {
    const product = await productService.createProduct(data)
    if (product) {
      setState((prev) => ({
        ...prev,
        products: [product, ...prev.products],
        total: prev.total + 1,
      }))
    }
    return product
  }, [])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const product = await productService.updateProduct(id, data)
    if (product) {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? product : p)),
      }))
    }
    return product
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    const success = await productService.deleteProduct(id)
    if (success) {
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
        total: prev.total - 1,
      }))
    }
    return success
  }, [])

  const searchProducts = useCallback(async (query: string) => {
    return productService.searchProducts(query)
  }, [])

  const setPage = useCallback(
    (page: number) => {
      const newPagination = { ...pagination, page }
      setPagination(newPagination)
      fetchProducts(filters, newPagination)
    },
    [filters, pagination, fetchProducts]
  )

  const setFilters = useCallback(
    (newFilters: ProductFilters) => {
      setFiltersState(newFilters)
      const newPagination = { ...pagination, page: 1 }
      setPagination(newPagination)
      fetchProducts(newFilters, newPagination)
    },
    [pagination, fetchProducts]
  )

  const refresh = useCallback(() => {
    return fetchProducts()
  }, [fetchProducts])

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    setPage,
    setFilters,
    refresh,
  }
}
