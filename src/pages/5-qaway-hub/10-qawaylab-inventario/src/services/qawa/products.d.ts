// ── Tipos del servicio de productos del carrito (products.js) ──
// products.js es JS sin tipos propios; aquí se declara su superficie real para
// que qawaService.ts pueda importarlo con `tsc --noEmit` en verde.
// Los payloads se dejan laxos a propósito: el contrato tipado de commerce vive
// en contracts/commerce/v1, no aquí.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProductFilters {
  type?: string
  category?: string
  search?: string
  status?: string
}

export interface ProductsService {
  getProducts(filters?: ProductFilters): Promise<Array<Record<string, unknown>>>
  getProduct(slug: string): Promise<Record<string, unknown> | null>
  getProductById(id: string): Promise<Record<string, unknown> | null>
  getProductsByIds(ids: string[]): Promise<Array<Record<string, unknown>>>
  createProduct(data: Record<string, unknown>): Promise<Record<string, unknown>>
  updateProduct(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  deleteProduct(id: string): Promise<Record<string, unknown>>
  reserveStock(id: string, quantity: number): Promise<Record<string, unknown>>
  releaseStock(id: string, quantity: number): Promise<Record<string, unknown>>
}

export function createProductsService(supabase: SupabaseClient): ProductsService
