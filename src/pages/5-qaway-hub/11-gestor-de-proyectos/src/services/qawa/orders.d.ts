// ── Tipos del servicio de pedidos (orders.js) ──
// orders.js es JS sin tipos propios; aquí se declara su superficie real para
// que qawaService.ts pueda importarlo con `tsc --noEmit` en verde.
// Las filas/entidades se dejan laxas a propósito: el contrato tipado de
// commerce vive en contracts/commerce/v1, no aquí.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface CreateOrderOptions {
  paymentMethod?: Record<string, unknown> | null
  tenantId?: string | null
  shippingAddress?: Record<string, unknown> | null
  notes?: string | null
  discount?: number
}

export interface OrderListFilters {
  status?: string
  limit?: number
}

export interface OrdersService {
  createOrder(
    userId: string | null,
    items: Array<Record<string, unknown>>,
    options?: CreateOrderOptions
  ): Promise<Record<string, unknown>>
  getOrders(
    userId: string | null,
    filters?: OrderListFilters
  ): Promise<Array<Record<string, unknown>>>
  getOrder(orderId: string): Promise<Record<string, unknown> | null>
  getAllOrders(filters?: OrderListFilters): Promise<Array<Record<string, unknown>>>
  cancelOrder(orderId: string): Promise<Record<string, unknown>>
}

export function genId(): string

export function createOrdersService(supabase: SupabaseClient): OrdersService
