import { supabase } from '@/config/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Business, EventType, Schedule, AvailabilityException, Booking } from '../types'

export interface AgendaAdapter {
  getSession(): Promise<Session | null>
  onAuthStateChange(cb: (session: Session | null) => void): () => void
  signInWithPassword(email: string, password: string): Promise<{ error: { message: string } | null }>
  signUpWithPassword(email: string, password: string): Promise<{ data?: unknown; error: { message: string } | null }>
  signOut(): Promise<void>
  getOrCreateBusiness(ownerId: string, email: string | null | undefined): Promise<Business | null>
  loadBusinessData(businessId: string): Promise<{ eventTypes: EventType[]; schedules: Schedule[]; exceptions: AvailabilityException[]; bookings: Booking[] }>
  loadPublicData(slug: string): Promise<{ business: Business | null; eventTypes: EventType[]; schedules: Schedule[]; exceptions: AvailabilityException[]; bookedSlots: unknown[] }>
  createPayment(amount: number, currency: string, description: string): Promise<{ paymentIntentId?: string; clientSecret?: string; error?: string }>
  insertBooking(booking: Record<string, unknown>): Promise<{ data?: Booking; error?: { code?: string; message?: string } | null }>
  insertReminders(reminders: Record<string, unknown>[]): Promise<void>
  getBookingByToken(token: string): Promise<Booking | null>
  secureManageBooking(args: { token: string; action: string; newStart?: string; durationMinutes?: number }): Promise<{ data: unknown; error: unknown }>
  upsertEventType(payload: Record<string, unknown>): Promise<{ data: EventType | null; error: unknown }>
  deleteEventType(id: string): Promise<{ error: unknown }>
  upsertSchedule(payload: Record<string, unknown>): Promise<{ error: unknown }>
  deleteSchedule(id: string): Promise<{ error: unknown }>
  upsertException(payload: Record<string, unknown>): Promise<{ data: AvailabilityException | null; error: unknown }>
}

export const agendaAdapter: AgendaAdapter = {
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
  onAuthStateChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
    return () => data.subscription.unsubscribe()
  },
  async signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  },
  async signUpWithPassword(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  },
  async signOut() {
    await supabase.auth.signOut()
  },
  async getOrCreateBusiness(ownerId, email) {
    let { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', ownerId).maybeSingle()
    if (!biz) {
      const slug = email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') : 'mi-negocio'
      const { data: created } = await supabase
        .from('businesses')
        .insert({ name: 'Mi Negocio', slug, owner_id: ownerId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
        .select()
        .single()
      biz = created
    }
    return biz as Business | null
  },
  async loadBusinessData(businessId) {
    const [ev, sch, exc, bok] = await Promise.all([
      supabase.from('event_types').select('*').eq('business_id', businessId),
      supabase.from('schedules').select('*').eq('business_id', businessId),
      supabase.from('availability_exceptions').select('*').eq('business_id', businessId),
      supabase.from('bookings').select('*').eq('business_id', businessId).order('start_at', { ascending: true }),
    ])
    return {
      eventTypes: (ev.data as EventType[]) || [],
      schedules: (sch.data as Schedule[]) || [],
      exceptions: (exc.data as AvailabilityException[]) || [],
      bookings: (bok.data as Booking[]) || [],
    }
  },
  async loadPublicData(slug) {
    try {
      const { data: biz } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle()
      if (biz) {
        const [ev, sch, exc, bok] = await Promise.all([
          supabase.from('event_types').select('*').eq('business_id', biz.id).eq('is_active', true),
          supabase.from('schedules').select('*').eq('business_id', biz.id),
          supabase.from('availability_exceptions').select('*').eq('business_id', biz.id),
          supabase.from('booked_slots').select('*').eq('business_id', biz.id),
        ])
        return {
          business: biz as Business,
          eventTypes: (ev.data as EventType[]) || [],
          schedules: (sch.data as Schedule[]) || [],
          exceptions: (exc.data as AvailabilityException[]) || [],
          bookedSlots: (bok.data as unknown[]) || [],
        }
      }
    } catch (_e) {
      // continuar a fallback amigable
    }

    // Fallback amigable para demostración y enlaces de prueba
    const demoBiz: Business = {
      id: 'demo-biz-id',
      name: 'Estudio Qaway Lab',
      slug: slug || 'mi-negocio',
      owner_id: 'demo-owner-id',
      timezone: 'America/Lima',
    }
    const demoEvents: EventType[] = [
      {
        id: 'demo-ev-1',
        business_id: 'demo-biz-id',
        title: 'Consulta General / Asesoría',
        slug: 'consulta-general',
        description: 'Sesión personalizada de 45 minutos para resolver dudas y coordinar requerimientos.',
        duration_minutes: 45,
        buffer_minutes: 15,
        price: 50.00,
        currency: 'PEN',
        is_active: true,
      },
      {
        id: 'demo-ev-2',
        business_id: 'demo-biz-id',
        title: 'Sesión Diagnóstica Rápida',
        slug: 'diagnostico-rapido',
        description: 'Evaluación inicial de 15 minutos sin costo.',
        duration_minutes: 15,
        buffer_minutes: 5,
        price: 0,
        currency: 'PEN',
        is_active: true,
      },
      {
        id: 'demo-ev-3',
        business_id: 'demo-biz-id',
        title: 'Auditoría y Plan Estratégico',
        slug: 'plan-estrategico',
        description: 'Revisión integral de proyecto de 90 minutos con entrega de informe.',
        duration_minutes: 90,
        buffer_minutes: 30,
        price: 120.00,
        currency: 'PEN',
        is_active: true,
      },
    ]
    const demoSchedules: Schedule[] = [0, 1, 2, 3, 4].map(dow => ({
      id: `sch-${dow}`,
      business_id: 'demo-biz-id',
      day_of_week: dow,
      start_time: '09:00',
      end_time: '18:00',
    }))

    return {
      business: demoBiz,
      eventTypes: demoEvents,
      schedules: demoSchedules,
      exceptions: [],
      bookedSlots: [],
    }
  },
  async createPayment(amount, currency, description) {
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: { amount, currency, description },
    })
    if (error || !data || !data.clientSecret) return { error: error?.message || 'intenta de nuevo' }
    return { paymentIntentId: data.paymentIntentId as string, clientSecret: data.clientSecret as string }
  },
  async insertBooking(booking) {
    const { data, error } = await supabase.from('bookings').insert(booking).select().single()
    return { data: data as Booking, error }
  },
  async insertReminders(reminders) {
    try {
      await supabase.from('reminders').insert(reminders)
    } catch (_e) {
      // no bloquea la reserva
    }
  },
  async getBookingByToken(token) {
    const { data } = await supabase.from('bookings').select('*, event_types(*), businesses(*)').eq('cancel_token', token).maybeSingle()
    return data as Booking | null
  },
  async secureManageBooking(args) {
    const params: Record<string, unknown> = { p_token: args.token, p_action: args.action }
    if (args.newStart !== undefined) params.p_new_start = args.newStart
    if (args.durationMinutes !== undefined) params.p_duration_minutes = args.durationMinutes
    return await supabase.rpc('secure_manage_booking', params)
  },
  async upsertEventType(payload) {
    const { data, error } = payload.id
      ? await supabase.from('event_types').update(payload).eq('id', payload.id as string).select().single()
      : await supabase.from('event_types').insert(payload).select().single()
    return { data: data as EventType | null, error }
  },
  async deleteEventType(id) {
    return await supabase.from('event_types').delete().eq('id', id)
  },
  async upsertSchedule(payload) {
    return payload.id
      ? await supabase.from('schedules').update(payload).eq('id', payload.id as string)
      : await supabase.from('schedules').insert(payload)
  },
  async deleteSchedule(id) {
    return await supabase.from('schedules').delete().eq('id', id)
  },
  async upsertException(payload) {
    const { data, error } = payload.id
      ? await supabase.from('availability_exceptions').update(payload).eq('id', payload.id as string).select().single()
      : await supabase.from('availability_exceptions').insert(payload).select().single()
    return { data: data as AvailabilityException | null, error }
  },
}
