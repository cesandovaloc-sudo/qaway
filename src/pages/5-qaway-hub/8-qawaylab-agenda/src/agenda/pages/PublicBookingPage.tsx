import React, { useState, useEffect, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, User, Phone,
  Mail, CreditCard, Loader2, ArrowLeft, ArrowRight, Sparkles,
  CalendarPlus, Download, ExternalLink, ShieldCheck, MapPin
} from 'lucide-react'
import { useAgenda, toLocalDateKey, getDayOfWeek } from '../context/AgendaContext'
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarLinks'
import type { EventType, Booking, Slot, Customer } from '../types'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatSlot(d: Date): string {
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function PublicBookingPage() {
  const { slug, eventSlug } = useParams()
  const { loadPublicData, business, eventTypes, getSlotsForDate, createBooking } = useAgenda()

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon'>('all')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Servicio, 2: Fecha y Hora, 3: Datos, 4: Confirmación
  const [customer, setCustomer] = useState<Customer>({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)

  useEffect(() => {
    loadPublicData(slug as string || 'demo').then(() => {
      setLoadingInitial(false)
    })
  }, [slug, loadPublicData])

  // Seleccionar el tipo de evento si viene en la URL o primer evento
  useEffect(() => {
    if (eventTypes.length) {
      if (eventSlug) {
        const found = eventTypes.find(e => e.slug === eventSlug)
        if (found) {
          setEventType(found)
          setStep(2)
        } else {
          setEventType(eventTypes[0] || null)
        }
      } else if (!eventType) {
        setEventType(eventTypes[0] || null)
      }
    }
  }, [eventTypes, eventSlug])

  // Generar grid del mes
  const monthGrid = (() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const startOffset = getDayOfWeek(first)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
    return cells
  })()

  const hasAvailability = (day: Date): boolean => {
    if (!eventType) return false
    const key = toLocalDateKey(day)
    const availSlots = getSlotsForDate(key, eventType)
    const isFuture = day >= new Date(new Date().toDateString())
    return Boolean(isFuture && availSlots.length > 0)
  }

  const handleSelectDate = (day: Date) => {
    if (!eventType) return
    const key = toLocalDateKey(day)
    setSelectedDate(key)
    const generated = getSlotsForDate(key, eventType)
    setSlots(generated)
    setSelectedSlot(null)
  }

  const filteredSlots = slots.filter(slot => {
    const hour = slot.from.getHours()
    if (timeFilter === 'morning') return hour < 13
    if (timeFilter === 'afternoon') return hour >= 13
    return true
  })

  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    if (!eventType || !selectedSlot) return

    const res = await createBooking({ eventType, startAt: selectedSlot, customer })
    setSubmitting(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setDone(res.data || null)
    setStep(4)
  }

  if (loadingInitial) {
    return (
      <div className="min-h-[100dvh] bg-page flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs font-bold text-muted">Cargando disponibilidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-page text-main flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* ─── Contenedor Central ─────────────────────────────────────────── */}
      <div className="max-w-4xl w-full mx-auto my-auto space-y-6">
        {/* Cabecera del negocio */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Agenda en línea oficial
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-main">{business?.name || 'Estudio de Reservas'}</h1>
          <p className="text-muted text-xs sm:text-sm max-w-md mx-auto">
            Selecciona tu servicio y elige el horario que mejor se adapte a tu agenda.
          </p>
        </div>

        {/* ─── Stepper de Progreso (Inspirado en la captura) ─────────────── */}
        <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, label: 'Servicio' },
            { num: 2, label: 'Fecha y Hora' },
            { num: 3, label: 'Tus Datos' },
            { num: 4, label: 'Confirmación' },
          ].map((s, idx, arr) => {
            const isCompleted = step > s.num
            const isCurrent = step === s.num
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-accent text-white shadow-md shadow-accent/25 ring-2 ring-accent/20'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`hidden sm:inline text-xs font-bold ${isCurrent ? 'text-main' : 'text-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.num ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* ─── Card Principal con Transición de Pasos ─────────────────────── */}
        <div className="bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <AnimatePresence mode="wait">
            {/* ─── PASO 1: Selección de Servicio ─────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-main">Elige el servicio que deseas agendar</h2>
                  <p className="text-xs text-muted">Todos los servicios se programan con confirmación inmediata.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventTypes.map(ev => {
                    const isSelected = eventType?.id === ev.id
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setEventType(ev)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? 'border-accent bg-purple-50/50 shadow-md shadow-accent/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-main">{ev.title}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{ev.description || 'Atención personalizada.'}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-accent bg-accent text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <span className="flex items-center gap-1 text-slate-600 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.duration_minutes} minutos
                          </span>
                          <span className="font-black text-main">
                            {Number(ev.price) > 0 ? `${ev.currency || 'PEN'} ${Number(ev.price).toFixed(2)}` : 'Gratuito'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    disabled={!eventType}
                    onClick={() => setStep(2)}
                    className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent/25 flex items-center gap-2 text-xs transition-all"
                  >
                    Continuar a la fecha <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PASO 2: Selección de Fecha y Hora ──────────────────────── */}
            {step === 2 && eventType && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 mb-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Cambiar servicio ({eventType.title})
                    </button>
                    <h2 className="text-lg font-bold text-main">Selecciona fecha y hora</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Calendario (7 cols) */}
                  <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-main">
                        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
                      </span>
                      <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 py-1">
                      {DAY_NAMES.map(d => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {monthGrid.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="h-9" />
                        const key = toLocalDateKey(day)
                        const available = hasAvailability(day)
                        const isSelected = selectedDate === key
                        const isToday = toLocalDateKey(new Date()) === key

                        return (
                          <button
                            key={key}
                            disabled={!available}
                            onClick={() => handleSelectDate(day)}
                            className={`h-9 rounded-xl font-bold text-xs transition-all relative flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-accent text-white shadow-md shadow-accent/30 font-black'
                                : available
                                ? 'bg-white hover:bg-purple-100/60 text-slate-800 border border-slate-200/80'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <span>{day.getDate()}</span>
                            {available && !isSelected && (
                              <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Horarios libres (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xs text-slate-700">
                          {selectedDate
                            ? `Horarios (${new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })})`
                            : 'Elige un día en el calendario'}
                        </h3>
                        {selectedDate && slots.length > 0 && (
                          <div className="flex gap-1 text-[10px] font-bold bg-slate-100 p-0.5 rounded-lg">
                            <button
                              onClick={() => setTimeFilter('all')}
                              className={`px-1.5 py-0.5 rounded-md ${timeFilter === 'all' ? 'bg-white text-main shadow-xs' : 'text-slate-500'}`}
                            >
                              Todo
                            </button>
                            <button
                              onClick={() => setTimeFilter('morning')}
                              className={`px-1.5 py-0.5 rounded-md ${timeFilter === 'morning' ? 'bg-white text-main shadow-xs' : 'text-slate-500'}`}
                            >
                              Mañana
                            </button>
                            <button
                              onClick={() => setTimeFilter('afternoon')}
                              className={`px-1.5 py-0.5 rounded-md ${timeFilter === 'afternoon' ? 'bg-white text-main shadow-xs' : 'text-slate-500'}`}
                            >
                              Tarde
                            </button>
                          </div>
                        )}
                      </div>

                      {!selectedDate ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-muted text-xs p-4">
                          <Calendar className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                          Selecciona una fecha con punto azul para ver las horas disponibles.
                        </div>
                      ) : filteredSlots.length === 0 ? (
                        <div className="text-center py-10 border border-slate-200 rounded-2xl text-muted text-xs p-4">
                          No hay turnos disponibles para el filtro seleccionado.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {filteredSlots.map((slot, idx) => {
                            const isSlotSelected = selectedSlot === slot.from.toISOString()
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedSlot(slot.from.toISOString())}
                                className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                                  isSlotSelected
                                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                                    : 'bg-slate-50 hover:bg-purple-50 text-slate-800 border-slate-200'
                                }`}
                              >
                                {formatSlot(slot.from)}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        disabled={!selectedSlot}
                        onClick={() => setStep(3)}
                        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-bold py-3 rounded-xl shadow-lg shadow-accent/25 flex items-center justify-center gap-2 text-xs transition-all"
                      >
                        Continuar a tus datos <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── PASO 3: Formulario de Datos del Cliente ────────────────── */}
            {step === 3 && eventType && selectedSlot && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6 max-w-lg mx-auto"
              >
                <div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Cambiar fecha y horario
                  </button>
                  <h2 className="text-lg font-bold text-main">Completa tus datos de reserva</h2>
                  <p className="text-xs text-muted">Te enviaremos la confirmación y recordatorio automático.</p>
                </div>

                <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 text-xs space-y-1">
                  <span className="font-bold text-purple-900">{eventType.title}</span>
                  <p className="text-purple-800 font-medium">
                    📅 {new Date(selectedSlot).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-purple-800 font-medium">
                    ⏰ {formatSlot(new Date(selectedSlot))} ({eventType.duration_minutes} min)
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre y Apellido *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text" required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent text-main"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email" required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent text-main"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Teléfono *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel" required value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="+51 987 654 321"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent text-main"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit" disabled={submitting}
                      className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent/25 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Confirmando cita...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Confirmar Reserva
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─── PASO 4: Confirmación y Enlaces a Calendarios ──────────── */}
            {step === 4 && done && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 max-w-md mx-auto py-2"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md shadow-green-100">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-main">¡Tu cita está confirmada!</h2>
                  <p className="text-xs text-muted mt-1">Hemos enviado el comprobante y los recordatorios a tu correo.</p>
                </div>

                {/* Resumen */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-medium">Servicio</span>
                    <span className="font-bold text-main">{eventType?.title}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-medium">Fecha y Hora</span>
                    <span className="font-bold text-slate-800">
                      {new Date(done.start_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} •{' '}
                      {new Date(done.start_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Cliente</span>
                    <span className="font-bold text-main">{done.customer_name}</span>
                  </div>
                </div>

                {/* Botones de Integración de Calendarios */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={generateGoogleCalendarUrl({
                      title: `${eventType?.title || 'Cita'} con ${business?.name || 'Nosotros'}`,
                      description: `Reserva confirmada. Para reprogramar o cancelar usa tu enlace de gestión.`,
                      startAt: done.start_at,
                      endAt: done.end_at,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl shadow-md shadow-accent/20 flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <CalendarPlus className="w-4 h-4" /> Añadir a Google Calendar
                  </a>

                  <button
                    onClick={() =>
                      downloadIcsFile({
                        title: `${eventType?.title || 'Cita'} con ${business?.name || 'Nosotros'}`,
                        description: `Reserva confirmada.`,
                        startAt: done.start_at,
                        endAt: done.end_at,
                      })
                    }
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all"
                  >
                    <Download className="w-4 h-4 text-slate-500" /> Descargar para Apple Calendar / Outlook (.ics)
                  </button>
                </div>

                {/* Enlace de Gestión */}
                {done.cancel_token && (
                  <div className="pt-2">
                    <Link
                      to={`/gestionar/${done.cancel_token}`}
                      className="text-xs font-bold text-slate-500 hover:text-accent underline"
                    >
                      ¿Necesitas reprogramar o cancelar tu cita más adelante? Haz clic aquí
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer discreto */}
      <footer className="text-center text-[11px] text-muted py-4">
        Potenciado por <span className="font-bold text-slate-700">Qaway Lab Agenda</span>
      </footer>
    </div>
  )
}
