import React, { useState, useMemo, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn, LogOut, Plus, Trash2, CalendarDays, Clock, Link2, Copy, Check,
  Sparkles, Eye, EyeOff, Users, Building2, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight, Search, CheckCircle2, AlertCircle,
  X, Calendar, Edit3, ExternalLink
} from 'lucide-react'
import { useAgenda, toLocalDateKey } from '../context/AgendaContext'
import type { EventType, Schedule, Booking } from '../types'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ─── Componente Login / Registro del negocio ──────────────────────────────
function LoginView({ onSuccess }: { onSuccess: () => void }) {
  const { signIn, signUp, loginAsDemo, notify } = useAgenda()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (isRegister) {
      const { error: err } = await signUp(email, password)
      setLoading(false)
      if (err) {
        setError(err.message)
      } else {
        notify('Cuenta creada. Si requiere confirmación, verifica tu correo o usa el Modo Demo.', 'success')
        onSuccess()
      }
    } else {
      const { error: err } = await signIn(email, password)
      setLoading(false)
      if (err) {
        if (err.message.toLowerCase().includes('confirm') || err.message.toLowerCase().includes('no confirmado')) {
          setError('El correo aún no ha sido confirmado en Supabase. Puedes verificar tu correo o hacer clic abajo en "Entrar en Modo Demo" para probar de inmediato.')
        } else {
          setError(err.message)
        }
      } else {
        onSuccess()
      }
    }
  }

  const handleDemoLogin = () => {
    loginAsDemo()
    onSuccess()
  }

  return (
    <div className="min-h-[100dvh] bg-page flex items-center justify-center p-6 text-main">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent inline-flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-accent/25 mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-main">Panel de Control</h1>
          <p className="text-muted text-sm mt-1">Administra tu agenda, servicios y citas</p>
        </div>

        {/* Card Principal */}
        <div className="bg-surface border border-line rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Selector Iniciar Sesión / Crear Cuenta */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null) }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${!isRegister ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-main'}`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null) }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${isRegister ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-main'}`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@negocio.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:bg-white transition-all text-main"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tu contraseña secreta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-accent focus:bg-white transition-all text-main"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-sm"
            >
              <LogIn className="w-4 h-4" /> {loading ? 'Procesando...' : (isRegister ? 'Crear cuenta y entrar' : 'Entrar al panel')}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">o prueba de inmediato</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 text-purple-700 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-accent" /> Entrar en Modo Demo / Vista Previa
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Modal para Crear / Editar Servicio ──────────────────────────────────
function ServiceModal({
  service,
  onClose,
  onSave,
}: {
  service?: Partial<EventType> | null
  onClose: () => void
  onSave: (data: Partial<EventType>) => Promise<void>
}) {
  const [title, setTitle] = useState(service?.title || '')
  const [description, setDescription] = useState(service?.description || '')
  const [durationMinutes, setDurationMinutes] = useState(service?.duration_minutes || 30)
  const [bufferMinutes, setBufferMinutes] = useState(service?.buffer_minutes || 0)
  const [price, setPrice] = useState(service?.price !== undefined ? Number(service.price) : 0)
  const [currency, setCurrency] = useState(service?.currency || 'PEN')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'servicio'
    await onSave({
      id: service?.id,
      title,
      slug: service?.slug || slug,
      description,
      duration_minutes: Number(durationMinutes),
      buffer_minutes: Number(bufferMinutes),
      price: Number(price),
      currency,
      is_active: true,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface rounded-3xl p-6 w-full max-w-lg border border-line shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-main">{service?.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-main hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Servicio *</label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Consulta Médica, Corte de Cabello, Asesoría"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Explica brevemente en qué consiste la sesión..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duración (minutos) *</label>
              <input
                type="number" min="5" step="5" required value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiempo de descanso (buffer)</label>
              <input
                type="number" min="0" step="5" value={bufferMinutes} onChange={e => setBufferMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Precio (0 = Gratuito)</label>
              <input
                type="number" min="0" step="0.5" value={price} onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda</label>
              <select
                value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white text-main"
              >
                <option value="PEN">PEN (S/)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold text-sm shadow-md shadow-accent/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : (service?.id ? 'Actualizar' : 'Crear Servicio')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Vista Principal del Panel ─────────────────────────────────────────────
export default function AdminPanelPage() {
  const { session, business, eventTypes, schedules, bookings, signOut, saveSchedule, saveEventType, deleteEventType, notify } = useAgenda()
  const [activeTab, setActiveTab] = useState<'calendar' | 'services' | 'availability'>('calendar')
  const [copied, setCopied] = useState(false)
  const [editingService, setEditingService] = useState<Partial<EventType> | null | undefined>(undefined)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending_payment' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (!session) {
    return <LoginView onSuccess={() => {}} />
  }

  const publicUrl = `${window.location.origin}/${business?.slug || 'demo'}`

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    notify('Enlace de reservas copiado al portapapeles', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  // Métricas calculadas
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const estimatedRevenue = confirmedBookings.reduce((sum, b) => {
    const ev = eventTypes.find(e => e.id === b.event_type_id)
    return sum + (ev?.price ? Number(ev.price) : 0)
  }, 0)

  // Filtrado de citas
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    const matchesSearch = !searchTerm ||
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Generación del calendario del mes
  const monthDays = (() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d))
    return cells
  })()

  return (
    <div className="min-h-[100dvh] bg-page text-main flex flex-col">
      {/* ─── Cabecera Superior ────────────────────────────────────────────── */}
      <header className="bg-surface border-b border-line sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-lg shadow-md shadow-accent/20">
              {business?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-main">{business?.name || 'Mi Negocio'}</h1>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>
              </div>
              <p className="text-xs text-muted">{session.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Ver página pública
            </a>
            <button
              onClick={copyPublicLink}
              className="flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 px-3.5 py-2 rounded-xl transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar link'}</span>
            </button>
            <button
              onClick={signOut}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenido Principal ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* ─── Fila Superior de Métricas (KPIs estilo Lusha / captura) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reservas</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-main">{bookings.length}</span>
              <span className="text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">+14%</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Servicios Activos</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-main">{eventTypes.length}</span>
              <span className="text-xs text-muted">disponibles</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa Confirmación</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-main">
                {bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 100}%
              </span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">Óptimo</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingresos Estimados</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-main">S/ {estimatedRevenue.toFixed(2)}</span>
              <span className="text-xs text-muted">PEN</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Pestañas de Navegación ─────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-line pb-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'calendar' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Calendario y Citas
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'services' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" /> Servicios ({eventTypes.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'availability' ? 'bg-accent text-white shadow-md shadow-accent/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" /> Horarios de Atención
            </button>
          </div>

          {activeTab === 'services' && (
            <button
              onClick={() => setEditingService({})}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-accent/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </button>
          )}
        </div>

        {/* ─── Pestaña 1: Calendario y Citas (Visual) ─────────────────────── */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendario visual (7 columnas) */}
            <div className="lg:col-span-7 bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-main">
                    {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </h2>
                  <p className="text-xs text-muted">Selecciona un día para ver sus citas</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date())}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-all"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 py-1">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Grilla mensual */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 rounded-2xl border border-transparent" />
                  }
                  const key = toLocalDateKey(date)
                  const dayBookings = bookings.filter(b => toLocalDateKey(b.start_at) === key)
                  const isToday = toLocalDateKey(new Date()) === key

                  return (
                    <div
                      key={key}
                      className={`h-20 p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        isToday
                          ? 'border-accent bg-accent/5'
                          : dayBookings.length > 0
                          ? 'border-slate-200 bg-white hover:border-accent/40 shadow-xs'
                          : 'border-slate-100 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isToday ? 'text-accent' : 'text-slate-700'}`}>
                          {date.getDate()}
                        </span>
                        {dayBookings.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        )}
                      </div>

                      {/* Chips de citas */}
                      <div className="space-y-1 overflow-hidden">
                        {dayBookings.slice(0, 2).map(b => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBooking(b)}
                            className="cursor-pointer text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 truncate hover:bg-purple-200 transition-colors"
                          >
                            {new Date(b.start_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })} {b.customer_name}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <span className="text-[8px] font-bold text-slate-400 pl-1">+{dayBookings.length - 2} más</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Listado lateral con filtros y búsqueda (5 columnas) */}
            <div className="lg:col-span-5 bg-surface border border-line rounded-3xl p-6 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-main">Lista de Citas ({filteredBookings.length})</h3>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-main shadow-xs' : 'text-slate-500'}`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'confirmed' ? 'bg-white text-green-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Confirmadas
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'pending_payment' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Pendientes
                  </button>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cliente o email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-accent text-main"
                />
              </div>

              {/* Lista de citas scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[440px] pr-1">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">No hay citas registradas</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Las reservas creadas desde el link público aparecerán aquí.</p>
                  </div>
                ) : (
                  filteredBookings.map(b => {
                    const start = new Date(b.start_at)
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-accent/40 hover:shadow-sm transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-main">{b.customer_name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : b.status === 'pending_payment'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {b.status === 'confirmed' ? 'Confirmada' : b.status === 'pending_payment' ? 'Pendiente' : 'Cancelada'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="font-medium text-slate-700">{b.event_types?.title || 'Servicio'}</span>
                          <span className="font-mono">
                            {start.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} • {start.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Pestaña 2: Servicios ───────────────────────────────────────── */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventTypes.map(ev => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-line rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-accent flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingService(ev)}
                        className="p-1.5 text-slate-400 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEventType(ev.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-main mt-3">{ev.title}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{ev.description || 'Sin descripción detallada.'}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.duration_minutes} min</span>
                    {ev.buffer_minutes ? <span className="text-[10px] text-slate-400">(+{ev.buffer_minutes}m)</span> : null}
                  </div>
                  <span className="font-bold text-main text-sm">
                    {Number(ev.price) > 0 ? `${ev.currency || 'PEN'} ${Number(ev.price).toFixed(2)}` : 'Gratuito'}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Tarjeta para añadir nuevo */}
            <button
              onClick={() => setEditingService({})}
              className="border-2 border-dashed border-slate-200 hover:border-accent hover:bg-purple-50/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all group min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-accent group-hover:text-white text-slate-500 flex items-center justify-center transition-colors mb-2">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-accent">Crear nuevo tipo de servicio</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Define duración, tarifa y descanso</span>
            </button>
          </div>
        )}

        {/* ─── Pestaña 3: Disponibilidad Semanal ───────────────────────────── */}
        {activeTab === 'availability' && (
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm max-w-3xl mx-auto space-y-4">
            <div>
              <h2 className="text-base font-bold text-main">Horario Semanal de Atención</h2>
              <p className="text-xs text-muted">Activa los días en los que atiendes clientes y define tu jornada laboral.</p>
            </div>

            <div className="space-y-3 pt-2">
              {DAYS.map((day, dow) => {
                const sched = schedules.find(s => s.day_of_week === dow)
                const isEnabled = Boolean(sched)
                const startTime = sched?.start_time?.slice(0, 5) || '09:00'
                const endTime = sched?.end_time?.slice(0, 5) || '18:00'

                const handleToggle = () => {
                  if (isEnabled) {
                    saveSchedule(dow, null, null)
                    notify(`${day} desactivado`, 'success')
                  } else {
                    saveSchedule(dow, '09:00', '18:00')
                    notify(`${day} activado (09:00 - 18:00)`, 'success')
                  }
                }

                const handleTimeChange = (field: 'start' | 'end', val: string) => {
                  saveSchedule(dow, field === 'start' ? val : startTime, field === 'end' ? val : endTime)
                }

                return (
                  <div
                    key={dow}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isEnabled ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50/60 border-slate-100 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleToggle}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isEnabled ? 'bg-accent' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${isEnabled ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                      <span className={`text-sm font-bold ${isEnabled ? 'text-main' : 'text-slate-500'}`}>{day}</span>
                    </div>

                    {isEnabled ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={startTime}
                          onChange={e => handleTimeChange('start', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                        />
                        <span className="text-xs text-slate-400 font-bold">a</span>
                        <input
                          type="time"
                          value={endTime}
                          onChange={e => handleTimeChange('end', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No disponible</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ─── Modal de Edición de Servicio ───────────────────────────────── */}
      {editingService !== undefined && (
        <ServiceModal
          service={editingService}
          onClose={() => setEditingService(undefined)}
          onSave={async data => {
            await saveEventType(data)
            notify(data.id ? 'Servicio actualizado' : 'Servicio creado exitosamente', 'success')
          }}
        />
      )}

      {/* ─── Modal de Detalle de Cita ───────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface rounded-3xl p-6 w-full max-w-md border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-main">Detalle de la Cita</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-lg text-slate-400 hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                <p className="font-bold text-sm text-main">{selectedBooking.customer_name}</p>
                <p className="text-slate-600">{selectedBooking.customer_email}</p>
                {selectedBooking.customer_phone && <p className="text-slate-600">{selectedBooking.customer_phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fecha</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedBooking.start_at).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Horario</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedBooking.start_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })} -{' '}
                    {new Date(selectedBooking.end_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 text-purple-900 font-semibold">
                <span>Servicio: {selectedBooking.event_types?.title || 'General'}</span>
                <span className="capitalize">{selectedBooking.status}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
