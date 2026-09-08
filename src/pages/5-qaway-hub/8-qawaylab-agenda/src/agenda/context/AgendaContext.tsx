import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { agendaAdapter } from '../adapters/agendaAdapter'
import type { Business, EventType, Schedule, AvailabilityException, Booking, Toast, Slot, Customer } from '../types'

const AgendaContext = createContext<AgendaContextValue | null>(null)

// ─── Utilidades de zona horaria y slots ────────────────────────────
export function toLocalDateKey(date: string | Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDayOfWeek(date: string | Date): number {
  const d = new Date(date)
  return (d.getDay() + 6) % 7 // 0=Lunes ... 6=Domingo
}

interface GenerateSlotsArgs {
  schedule?: Schedule | { start_time: string | null | undefined; end_time: string | null | undefined } | null
  bookings?: Booking[]
  dateKey: string
  durationMin: number
  bufferMin: number
}

function generateSlots({ schedule, bookings, dateKey, durationMin, bufferMin }: GenerateSlotsArgs): Slot[] {
  if (!schedule || !schedule.start_time || !schedule.end_time) return []
  const [sh, sm] = schedule.start_time.split(':').map(Number)
  const [eh, em] = schedule.end_time.split(':').map(Number)
  const start = new Date(`${dateKey}T00:00:00`)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(`${dateKey}T00:00:00`)
  end.setHours(eh, em, 0, 0)
  const step = durationMin + bufferMin
  const slots: Slot[] = []
  const taken = (bookings || []).map(b => ({
    from: new Date(b.start_at).getTime(),
    to: new Date(b.end_at).getTime(),
  }))
  for (let t = start.getTime(); t + durationMin * 60000 <= end.getTime(); t += step * 60000) {
    const slotFrom = t
    const slotTo = t + durationMin * 60000
    const isPast = slotFrom < Date.now()
    const collides = taken.some(b => slotFrom < b.to && slotTo > b.from)
    if (!isPast && !collides) slots.push({ from: new Date(slotFrom), to: new Date(slotTo) })
  }
  return slots
}

function toISO(d: Date): string {
  return d.toISOString()
}

interface AgendaContextValue {
  session: Session | null
  business: Business | null
  eventTypes: EventType[]
  schedules: Schedule[]
  exceptions: AvailabilityException[]
  bookings: Booking[]
  loading: boolean
  toast: Toast | null
  notify: (msg: string, type?: 'success' | 'error') => void
  loadBusinessData: () => Promise<void>
  loadPublicData: (slug: string) => Promise<Business | null>
  getSlotsForDate: (dateKey: string, eventType: EventType) => Slot[]
  createBooking: (args: { eventType: EventType; startAt: string; customer: Customer }) => Promise<{ data?: Booking; error?: string; paymentIntentId?: string | null }>
  getBookingByToken: (token: string) => Promise<Booking | null>
  cancelBooking: (token: string) => Promise<{ data: unknown; error: unknown }>
  rescheduleBooking: (token: string, newStartAt: string, eventType: EventType) => Promise<{ data: unknown; error: unknown }>
  saveEventType: (ev: Partial<EventType>) => Promise<{ data: EventType | null; error: unknown }>
  deleteEventType: (id: string) => Promise<{ error: unknown }>
  saveSchedule: (dayOfWeek: number, startTime: string | null, endTime: string | null) => Promise<{ error: unknown }>
  saveException: (exc: Partial<AvailabilityException>) => Promise<{ data: AvailabilityException | null; error: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  signUp: (email: string, password: string) => Promise<{ data?: unknown; error: { message: string } | null }>
  loginAsDemo: () => void
  signOut: () => Promise<void>
}

// ─── Provider ───────────────────────────────────────────────────────
export function AgendaProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    agendaAdapter.getSession().then((s) => setSession(s))
    const unsubscribe = agendaAdapter.onAuthStateChange((s) => setSession(s))
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) return
    loadBusinessData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const loadBusinessData = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    const biz = await agendaAdapter.getOrCreateBusiness(session.user.id, session.user.email)
    if (!biz) {
      setLoading(false)
      return
    }
    setBusiness(biz)
    const data = await agendaAdapter.loadBusinessData(biz.id)
    setEventTypes(data.eventTypes)
    setSchedules(data.schedules)
    setExceptions(data.exceptions)
    setBookings(data.bookings)
    setLoading(false)
  }, [session])

  const loadPublicData = useCallback(async (slug: string) => {
    setLoading(true)
    const publicData = await agendaAdapter.loadPublicData(slug)
    if (!publicData.business) {
      setLoading(false)
      return null
    }
    setBusiness(publicData.business)
    setEventTypes(publicData.eventTypes)
    setSchedules(publicData.schedules)
    setExceptions(publicData.exceptions)
    setBookings(publicData.bookedSlots as Booking[])
    setLoading(false)
    return publicData.business
  }, [])

  const getSlotsForDate = useCallback((dateKey: string, eventType: EventType): Slot[] => {
    const dow = getDayOfWeek(new Date(`${dateKey}T12:00:00`))
    const schedule = schedules.find(s => s.day_of_week === dow)
    const exc = exceptions.find(e => String(e.exception_date).slice(0, 10) === dateKey)
    if (exc && exc.is_available === false) return []
    return generateSlots({
      schedule: exc?.start_time ? { start_time: exc.start_time, end_time: exc.end_time ?? null } : schedule,
      bookings,
      dateKey,
      durationMin: eventType.duration_minutes,
      bufferMin: eventType.buffer_minutes || 0,
    })
  }, [schedules, exceptions, bookings])

  const createBooking = useCallback(async ({ eventType, startAt, customer }: { eventType: EventType; startAt: string; customer: Customer }) => {
    if (!business || !eventType) return { error: 'Faltan datos' }
    const start = new Date(startAt)
    const end = new Date(start.getTime() + eventType.duration_minutes * 60000)
    let paymentStatus = 'pending'
    let paymentIntentId: string | null = null

    if (Number(eventType.price) > 0) {
      try {
        const payment = await agendaAdapter.createPayment(
          Math.round(Number(eventType.price) * 100),
          eventType.currency || 'PEN',
          eventType.title,
        )
        if (payment.error || !payment.clientSecret) return { error: 'No se pudo iniciar el pago: ' + (payment.error || 'intenta de nuevo') }
        paymentIntentId = payment.paymentIntentId || null
        paymentStatus = 'pending'
      } catch (e) {
        return { error: 'Error de pago: ' + (e as Error).message }
      }
    }

    const booking: Record<string, unknown> = {
      business_id: business.id,
      event_type_id: eventType.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      start_at: toISO(start),
      end_at: toISO(end),
      status: Number(eventType.price) > 0 ? 'pending_payment' : 'confirmed',
      payment_status: paymentStatus,
      payment_intent_id: paymentIntentId,
      cancel_token: 'demo-token-' + Math.random().toString(36).substring(2, 9),
    }

    if (business.id.startsWith('demo-')) {
      const mockCreated = {
        ...booking,
        id: 'bok-' + Date.now(),
        created_at: new Date().toISOString(),
        event_types: { title: eventType.title },
        businesses: { name: business.name },
      } as unknown as Booking
      setBookings(prev => [...prev, mockCreated])
      return { data: mockCreated, paymentIntentId }
    }

    const { data, error } = await agendaAdapter.insertBooking(booking)
    if (error) {
      if (error.code === '23P01' || /exclude|overlap/i.test(error.message || '')) {
        return { error: 'Lo sentimos, este horario acaba de ser reservado. Elige otro.' }
      }
      return { error: error.message || 'Error al reservar' }
    }

    try {
      await agendaAdapter.insertReminders([
        { booking_id: data!.id, channel: 'email', kind: 'confirmation', send_at: new Date().toISOString() },
        { booking_id: data!.id, channel: 'whatsapp', kind: 'confirmation', send_at: new Date().toISOString() },
        { booking_id: data!.id, channel: 'email', kind: 'reminder', send_at: new Date(start.getTime() - 24 * 3600 * 1000).toISOString() },
        { booking_id: data!.id, channel: 'whatsapp', kind: 'reminder', send_at: new Date(start.getTime() - 60 * 60 * 1000).toISOString() },
      ])
    } catch (_e) { /* no bloquea la reserva */ }

    return { data: data as Booking, paymentIntentId }
  }, [business])

  const getBookingByToken = useCallback(async (token: string) => {
    return await agendaAdapter.getBookingByToken(token)
  }, [])

  const cancelBooking = useCallback(async (token: string) => {
    return await agendaAdapter.secureManageBooking({ token, action: 'cancel' })
  }, [])

  const rescheduleBooking = useCallback(async (token: string, newStartAt: string, eventType: EventType) => {
    const start = new Date(newStartAt)
    return await agendaAdapter.secureManageBooking({
      token,
      action: 'reschedule',
      newStart: toISO(start),
      durationMinutes: eventType.duration_minutes,
    })
  }, [])

  const saveEventType = useCallback(async (ev: Partial<EventType>) => {
    const payload = { ...ev, business_id: business?.id }
    const { data, error } = await agendaAdapter.upsertEventType(payload)
    if (!error) loadBusinessData()
    return { data, error }
  }, [business, loadBusinessData])

  const saveSchedule = useCallback(async (dayOfWeek: number, startTime: string | null, endTime: string | null) => {
    if (!business) return { error: 'Sin negocio' }
    const existing = schedules.find(s => s.day_of_week === dayOfWeek)
    // Si vienen horas nulas = apagar el dia: se ELIMINA la fila (evita crash por start_time null)
    if (!startTime || !endTime) {
      if (existing) {
        const { error } = await agendaAdapter.deleteSchedule(existing.id)
        if (!error) loadBusinessData()
        return { error }
      }
      return { error: null }
    }
    const payload = { business_id: business.id, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }
    const { error } = await agendaAdapter.upsertSchedule(existing ? { ...payload, id: existing.id } : payload)
    if (!error) loadBusinessData()
    return { error }
  }, [business, schedules, loadBusinessData])

  const saveException = useCallback(async (exc: Partial<AvailabilityException>) => {
    const payload = { ...exc, business_id: business?.id }
    const { data, error } = await agendaAdapter.upsertException(payload)
    if (!error) loadBusinessData()
    return { data, error }
  }, [business, loadBusinessData])

  const deleteEventType = useCallback(async (id: string) => {
    const { error } = await agendaAdapter.deleteEventType(id)
    if (!error) loadBusinessData()
    return { error }
  }, [loadBusinessData])

  const signIn = useCallback(async (email: string, password: string) => {
    return await agendaAdapter.signInWithPassword(email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    return await agendaAdapter.signUpWithPassword(email, password)
  }, [])

  const loginAsDemo = useCallback(() => {
    const demoSession = {
      user: { id: 'demo-user-id', email: 'demo@qawaylab.com' },
      access_token: 'demo-token',
    } as unknown as Session
    setSession(demoSession)
    setBusiness({
      id: 'demo-biz-id',
      name: 'Estudio Qaway Lab (Demo)',
      slug: 'demo',
      owner_id: 'demo-user-id',
      timezone: 'America/Lima',
    })
    setEventTypes([
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
      }
    ])
    setSchedules([
      { id: 'sch-0', business_id: 'demo-biz-id', day_of_week: 0, start_time: '09:00', end_time: '18:00' },
      { id: 'sch-1', business_id: 'demo-biz-id', day_of_week: 1, start_time: '09:00', end_time: '18:00' },
      { id: 'sch-2', business_id: 'demo-biz-id', day_of_week: 2, start_time: '09:00', end_time: '18:00' },
      { id: 'sch-3', business_id: 'demo-biz-id', day_of_week: 3, start_time: '09:00', end_time: '18:00' },
      { id: 'sch-4', business_id: 'demo-biz-id', day_of_week: 4, start_time: '09:00', end_time: '17:00' },
    ])
    setBookings([
      {
        id: 'bok-1',
        business_id: 'demo-biz-id',
        event_type_id: 'demo-ev-1',
        customer_name: 'Carlos Mendoza',
        customer_email: 'carlos.mendoza@example.com',
        customer_phone: '+51 987 654 321',
        start_at: new Date(Date.now() + 3600000 * 24).toISOString(),
        end_at: new Date(Date.now() + 3600000 * 24 + 45 * 60000).toISOString(),
        status: 'confirmed',
        payment_status: 'paid',
        cancel_token: 'demo-token-123',
        event_types: { title: 'Consulta General / Asesoría' },
      }
    ])
    notify('Acceso en Modo Demostración activado', 'success')
  }, [notify])

  const signOut = useCallback(async () => {
    await agendaAdapter.signOut()
    setBusiness(null)
    setSession(null)
  }, [])

  const value = useMemo<AgendaContextValue>(() => ({
    session, business, eventTypes, schedules, exceptions, bookings, loading, toast, notify,
    loadPublicData, getSlotsForDate, createBooking, getBookingByToken, cancelBooking, rescheduleBooking,
    saveEventType, deleteEventType, saveSchedule, saveException, signIn, signUp, loginAsDemo, signOut, loadBusinessData,
  }), [
    session, business, eventTypes, schedules, exceptions, bookings, loading, toast, notify,
    loadPublicData, getSlotsForDate, createBooking, getBookingByToken, cancelBooking, rescheduleBooking,
    saveEventType, deleteEventType, saveSchedule, saveException, signIn, signUp, loginAsDemo, signOut, loadBusinessData,
  ])

  return (
    <AgendaContext.Provider value={value}>
      {children}
    </AgendaContext.Provider>
  )
}

export function useAgenda(): AgendaContextValue {
  const ctx = useContext(AgendaContext)
  if (!ctx) throw new Error('useAgenda debe usarse dentro de AgendaProvider')
  return ctx
}
