import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, CalendarClock, Loader2, ArrowLeft, Calendar, User, Clock } from 'lucide-react'
import { useAgenda } from '../context/AgendaContext'
import type { Booking } from '../types'

export default function ManageBookingPage() {
  const { token } = useParams()
  const { getBookingByToken, cancelBooking, notify } = useAgenda()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    getBookingByToken(token as string).then(b => {
      setBooking(b)
      setLoading(false)
    })
  }, [token, getBookingByToken])

  const handleCancel = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita? El horario quedará libre para otros clientes.')) return
    setAction('cancelling')
    const { error } = await cancelBooking(token as string)
    setAction(null)
    if (!error) {
      setDone('cancelled')
      notify('Cita cancelada correctamente', 'success')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-page flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  if (!booking || booking.status === 'cancelled' || done === 'cancelled') {
    return (
      <div className="min-h-[100dvh] bg-page flex items-center justify-center p-6 text-main">
        <div className="bg-surface border border-line rounded-3xl p-8 max-w-md w-full text-center shadow-xl shadow-slate-200/50 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-md shadow-red-100">
            <XCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-main">Cita Cancelada</h1>
          <p className="text-muted text-xs leading-relaxed">
            Tu cita fue cancelada exitosamente. El horario quedó disponible para otros clientes.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a la portada
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-page flex items-center justify-center p-6 text-main">
      <div className="bg-surface border border-line rounded-3xl p-8 max-w-md w-full shadow-xl shadow-slate-200/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md shadow-green-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-main">Tu Cita está Confirmada</h1>
          <p className="text-muted text-xs">Desde este panel puedes consultar los detalles o cancelar tu cita si lo necesitas.</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Servicio</span>
            <span className="font-bold text-main">{booking.event_types?.title || 'Servicio'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Cliente</span>
            <span className="font-bold text-slate-800">{booking.customer_name}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Fecha</span>
            <span className="font-bold text-slate-800">
              {new Date(booking.start_at).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'long' })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Hora</span>
            <span className="font-mono font-bold text-slate-800">
              {new Date(booking.start_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCancel}
            disabled={action === 'cancelling'}
            className="w-full bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 active:scale-[0.99]"
          >
            {action === 'cancelling' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
            Cancelar esta cita
          </button>

          <Link
            to="/"
            className="block text-center text-xs font-bold text-slate-500 hover:text-slate-700"
          >
            Ir a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
}
