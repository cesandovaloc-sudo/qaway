import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, CheckCircle2, Sparkles, ArrowRight, ShieldCheck,
  CalendarCheck, Bell, CreditCard, Users, ExternalLink, Zap
} from 'lucide-react'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Agenda'

// Vista previa interactiva en la portada
function InteractiveBookingPreview() {
  const [selectedSlot, setSelectedSlot] = useState('10:30')
  const [selectedDay, setSelectedDay] = useState(15)
  const slots = ['09:00', '10:30', '11:45', '14:30', '16:00', '17:15']

  return (
    <div className="bg-surface border border-line rounded-3xl p-6 shadow-2xl shadow-purple-500/10 space-y-5 max-w-sm mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">Vista en vivo</span>
          <h4 className="font-bold text-sm text-main mt-1">Asesoría Estratégica</h4>
        </div>
        <span className="font-mono text-xs font-bold text-slate-500">45 min</span>
      </div>

      {/* Mini Calendario interactivo */}
      <div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
          <span>Septiembre 2026</span>
          <span className="text-[10px] text-accent font-semibold">12 turnos libres</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span key={`${d}-${i}`} className="text-slate-400 py-0.5">{d}</span>
          ))}
          {[11, 12, 13, 14, 15, 16, 17].map(d => {
            const isSelected = d === selectedDay
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`py-1.5 rounded-lg font-mono transition-all ${
                  isSelected
                    ? 'bg-accent text-white font-bold shadow-sm'
                    : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border border-slate-200/60'
                }`}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500">Horarios disponibles ({selectedDay} Sept):</span>
        <div className="grid grid-cols-3 gap-1.5">
          {slots.map(s => {
            const isChosen = s === selectedSlot
            return (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  isChosen
                    ? 'bg-accent text-white border-accent shadow-xs'
                    : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Total:</span>
        <span className="font-black text-main">S/ 50.00 PEN</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-page text-main flex flex-col justify-between">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-line sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-base shadow-md shadow-accent/20">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-main">{APP_NAME} <span className="text-accent">Qaway</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/hub/agenda/demo"
              className="text-xs font-bold text-slate-600 hover:text-main px-3 py-2 rounded-xl transition-colors"
            >
              Ver Demo Cliente
            </Link>
            <Link
              to="/hub/agenda/panel"
              className="text-xs bg-accent hover:bg-accent-hover text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-accent/20 transition-all flex items-center gap-1.5"
            >
              Panel de Administración <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Nueva Generación de Agendamiento
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-main tracking-tight leading-[1.15]">
            Tus clientes reservan en segundos. <br />
            <span className="text-accent">Cero llamadas. Cero solapes.</span>
          </h1>

          <p className="text-muted text-base sm:text-lg max-w-xl leading-relaxed">
            Comparte tu enlace de reserva personalizado, recibe pagos opcionales con Stripe, bloquea horarios automáticamente y sincroniza con Google Calendar y WhatsApp.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/hub/agenda/panel"
              className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-accent/25 flex items-center gap-2 text-sm transition-all active:scale-[0.99]"
            >
              <Zap className="w-4 h-4" /> Entrar al Panel de Control
            </Link>
            <Link
              to="/hub/agenda/demo"
              className="bg-surface hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 text-sm transition-all"
            >
              Probar flujo de reserva <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Características rápidas */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
            <div>
              <span className="font-bold text-sm text-main flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Cero Solapes
              </span>
              <p className="text-[11px] text-muted mt-0.5">Control atómico anti doble reserva en base de datos.</p>
            </div>
            <div>
              <span className="font-bold text-sm text-main flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-accent" /> Google Calendar
              </span>
              <p className="text-[11px] text-muted mt-0.5">Sincronización y descarga directa para el cliente.</p>
            </div>
            <div>
              <span className="font-bold text-sm text-main flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-600" /> Pagos Online
              </span>
              <p className="text-[11px] text-muted mt-0.5">Integración opcional con Stripe para cobrar anticipos.</p>
            </div>
          </div>
        </div>

        {/* ─── Columna Derecha: Vista Previa Interactiva ──────────────────── */}
        <div className="lg:col-span-5">
          <InteractiveBookingPreview />
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-surface border-t border-line py-6 text-center text-xs text-muted">
        <p>© 2026 Qaway Lab Agenda — Sistema independiente de agendamiento y reservas.</p>
      </footer>
    </div>
  )
}
