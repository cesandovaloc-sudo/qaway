import { supabase } from '@/lib/supabase'
import type { Payment } from '@/lib/types'

// ─── Tipos de dominio ────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  title: string
  type?: string | null
  category?: string | null
  description?: string | null
  price?: number | null
  status?: string | null
  image_url?: string | null
  created_at?: string
}

export interface OrderItem {
  order_id: string
  product_id: string
  product_type: string
  product_title: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  user_id: string
  total: number
  payment_method?: string | null
  status?: string | null
  paid_at?: string | null
  created_at?: string
  items?: OrderItem[] | null
}

export interface PaymentRecord extends Payment {
  proof_url?: string | null
  notes?: string | null
  provider_id?: string | null
  approved_by?: string | null
  course_id?: string | null
  student?: { id: string; full_name: string | null; avatar_url: string | null } | null
  course?: { id: string; title: string; slug: string } | null
}

// ─── Products ────────────────────────────────────────────────

export async function getProducts({
  type,
  category,
  search,
  status = 'active',
}: { type?: string; category?: string; search?: string; status?: string } = {}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data as Product[]) || []
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Product) || null
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return product as Product
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return product as Product
}

// ─── Orders ──────────────────────────────────────────────────

export interface CartItemInput {
  product_id: string
  product_type: string
  product_title: string
  quantity?: number
  unit_price: number
}

export async function createOrder(userId: string, items: CartItemInput[], paymentMethod: string): Promise<Order> {
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      payment_method: paymentMethod,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems: OrderItem[] = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_type: item.product_type,
    product_title: item.product_title,
    quantity: item.quantity || 1,
    unit_price: item.unit_price,
    subtotal: item.unit_price * (item.quantity || 1),
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return order as Order
}

export async function getOrders(userId: string, { status }: { status?: string } = {}): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return (data as Order[]) || []
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return (data as Order) || null
}

// ─── Payments (multi-provider) ──────────────────────────────

/**
 * Create a payment record (supports culqi, manual, woocommerce)
 */
export async function createPayment({
  studentId,
  orderId,
  courseId = null,
  amount,
  currency = 'PEN',
  provider = 'manual',
  proofUrl = null,
  notes = null,
}: {
  studentId: string
  orderId?: string | null
  courseId?: string | null
  amount: number
  currency?: string
  provider?: string
  proofUrl?: string | null
  notes?: string | null
}): Promise<PaymentRecord> {
  const paymentData: Record<string, unknown> = {
    student_id: studentId,
    order_id: orderId,
    amount,
    currency,
    status: 'pending',
    provider,
    notes,
  }

  // course_id is optional (for Academy courses)
  if (courseId) paymentData.course_id = courseId
  if (proofUrl) paymentData.proof_url = proofUrl

  const { data: payment, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) throw error
  return payment as unknown as PaymentRecord
}

/**
 * Update payment status (used by Culqi webhook and admin approval)
 * If completed, enrolls student in the course (if course_id exists)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  { providerId = null, approvedBy = null, notes = null }: { providerId?: string | null; approvedBy?: string | null; notes?: string | null } = {},
): Promise<PaymentRecord> {
  const updates: Record<string, unknown> = { status }
  if (providerId) updates.provider_id = providerId
  if (approvedBy) updates.approved_by = approvedBy
  if (notes) updates.notes = notes
  if (status === 'completed' && !approvedBy) updates.approved_by = null // auto-approved (Culqi)

  const { data: payment, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error

  // If payment completed, enroll student in course (if applicable)
  if (status === 'completed' && payment.course_id) {
    const { course_id, student_id } = payment
    await supabase
      .from('enrollments')
      .upsert({
        student_id,
        course_id,
        status: 'active',
      })
  }

  // If payment completed, update order status
  if (status === 'completed' && payment.order_id) {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.order_id)
  }

  return payment as unknown as PaymentRecord
}

/**
 * Get payments for a user (for their purchase history)
 */
export async function getPayments(studentId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      course:courses (id, title, slug)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as PaymentRecord[]) || []
}

/**
 * Get all pending payments (admin: Pago Directo to approve)
 */
export async function getPendingPayments(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      student:student_id (id, full_name, avatar_url),
      course:courses (id, title, slug)
    `)
    .eq('provider', 'manual')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as PaymentRecord[]) || []
}

/**
 * Get all payments (admin: full history)
 */
export async function getAllPayments({ status, provider, limit = 50 }: { status?: string; provider?: string; limit?: number } = {}): Promise<PaymentRecord[]> {
  let query = supabase
    .from('payments')
    .select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      student:student_id (id, full_name, avatar_url),
      course:courses (id, title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (provider) query = query.eq('provider', provider)

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as PaymentRecord[]) || []
}

/**
 * Simulate Culqi webhook (for testing without real Culqi)
 * In production, this would be an Edge Function called by Culqi
 */
export async function simulateCulqiWebhook(paymentId: string): Promise<PaymentRecord> {
  return updatePaymentStatus(paymentId, 'completed', {
    providerId: `culqi_sim_${Date.now()}`,
  })
}
