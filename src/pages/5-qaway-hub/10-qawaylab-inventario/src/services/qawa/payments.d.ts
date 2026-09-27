// ── Tipos del servicio de pagos (payments.js) ──
// payments.js es JS sin tipos propios; aquí se declara su superficie real para
// que qawaService.ts pueda importarlo con `tsc --noEmit` en verde.
// Los payloads se dejan laxos a propósito: el contrato tipado de commerce vive
// en contracts/commerce/v1, no aquí.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface CreatePaymentPayload {
  userId: string | null
  orderId?: string | null
  productId?: string | null
  productTitle?: string | null
  amount: number
  currency?: string
  [key: string]: unknown
}

export interface UpdatePaymentOptions {
  providerId?: string | null
  notes?: string | null
}

export interface PaymentListFilters {
  status?: string
  provider?: string
  limit?: number
}

export interface MercadoPagoPreference {
  items: Array<{
    title: string
    unit_price: number
    quantity: number
    currency_id: string
  }>
  external_reference: string
  back_urls: { success: string; failure: string; pending: string }
  auto_return: string
}

export interface PaymentsService {
  createPayment(payload: CreatePaymentPayload): Promise<Record<string, unknown>>
  updatePaymentStatus(
    paymentId: string,
    status: string,
    options?: UpdatePaymentOptions
  ): Promise<{ id: string; status: string }>
  getUserPayments(userId: string): Promise<Array<Record<string, unknown>>>
  getPendingPayments(): Promise<Array<Record<string, unknown>>>
  getAllPayments(filters?: PaymentListFilters): Promise<Array<Record<string, unknown>>>
  simulateCulqiWebhook(paymentId: string): Promise<Record<string, unknown>>
  createMercadoPagoPreference(
    items: Array<Record<string, unknown>>,
    externalReference: string,
    successUrl?: string,
    failureUrl?: string,
    pendingUrl?: string
  ): Promise<{ providerId: string; preference: MercadoPagoPreference }>
  simulateMercadoPagoWebhook(paymentId: string): Promise<Record<string, unknown>>
}

export interface CreatePaymentsOptions {
  onPaymentCompleted?: ((payment: unknown) => void) | null
}

export function createPaymentsService(
  supabase: SupabaseClient,
  options?: CreatePaymentsOptions
): PaymentsService
