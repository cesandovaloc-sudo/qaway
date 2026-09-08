// ─── Tipos de datos de la app Agenda ───

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  timezone: string
  created_at?: string
}

export interface EventType {
  id: string
  business_id: string
  title: string
  slug: string
  description?: string | null
  duration_minutes: number
  buffer_minutes?: number | null
  price?: number | string | null
  currency?: string | null
  is_active?: boolean | null
  created_at?: string
}

export interface Schedule {
  id: string
  business_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at?: string
}

export interface AvailabilityException {
  id: string
  business_id: string
  exception_date: string | Date
  is_available?: boolean | null
  start_time?: string | null
  end_time?: string | null
  created_at?: string
}

export interface Booking {
  id: string
  business_id: string
  event_type_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  start_at: string
  end_at: string
  status: 'pending_payment' | 'confirmed' | 'cancelled'
  payment_status?: string | null
  payment_intent_id?: string | null
  cancel_token?: string | null
  event_types?: Pick<EventType, 'title'> | null
  businesses?: Pick<Business, 'name'> | null
  created_at?: string
}

export interface Toast {
  msg: string
  type: 'success' | 'error'
  id: number
}

export interface Slot {
  from: Date
  to: Date
}

export interface Customer {
  name: string
  email: string
  phone: string
}
