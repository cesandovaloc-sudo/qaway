import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, Check, ArrowRight, CornerDownLeft,
  Sparkles, RotateCcw, Share2, Compass, Shield
} from 'lucide-react'

const QUESTIONS = [
  {
    id: 1,
    title: '¿Cuál es el objetivo principal de tu próximo proyecto digital?',
    subtitle: 'Selecciona la prioridad número uno que moverá la aguja de tu negocio en los próximos 90 días.',
    type: 'choice',
    options: [
      { key: 'A', label: 'Crear o rediseñar un sitio web de alta conversión y branding' },
      { key: 'B', label: 'Automatizar ventas y atención con CRM e Inteligencia Artificial' },
      { key: 'C', label: 'Lanzar una landing page para una campaña publicitaria específica' },
      { key: 'D', label: 'Desarrollar una plataforma SaaS o herramienta web a medida' },
    ],
  },
  {
    id: 2,
    title: '¿En qué rango de tiempo necesitas tener este sistema en producción?',
    subtitle: 'Esto nos permite calibrar la velocidad de desarrollo y el equipo asignado.',
    type: 'choice',
    options: [
      { key: 'A', label: 'Urgente: En menos de 2 a 3 semanas' },
      { key: 'B', label: 'Plazo estándar: En 30 a 45 días' },
      { key: 'C', label: 'Planificado: En los próximos 2 a 3 meses' },
      { key: 'D', label: 'Solo estamos evaluando viabilidad técnica y presupuesto' },
    ],
  },
  {
    id: 3,
    title: '¿Cuál es el presupuesto estimado asignado para este despliegue?',
    subtitle: 'Nuestros proyectos se adaptan en módulos escalables según la inversión disponible.',
    type: 'choice',
    options: [
      { key: 'A', label: '$800 - $1,800 USD (Landing / Sistema Esencial)' },
      { key: 'B', label: '$1,800 - $3,500 USD (Web Corporativa + Automatizaciones)' },
      { key: 'C', label: '$3,500 - $7,000 USD (Ecosistema Digital Integral)' },
      { key: 'D', label: 'Más de $7,000 USD (Desarrollo a medida / SaaS)' },
    ],
  },
  {
    id: 4,
    title: '¿Cuentas actualmente con material previo de tu marca?',
    subtitle: 'Branding, manual de identidad, fotografías profesionales o textos listos.',
    type: 'choice',
    options: [
      { key: 'A', label: 'Sí, tenemos identidad visual completa y fotografías de alta calidad' },
      { key: 'B', label: 'Tenemos logotipo y colores, pero requerimos optimización gráfica' },
      { key: 'C', label: 'Necesitamos crear la identidad visual y branding desde cero' },
      { key: 'D', label: 'Tenemos contenido redactado, pero no diseño' },
    ],
  },
  {
    id: 5,
    title: '¿Qué nivel de automatización requieres integrar?',
    subtitle: 'Conexión con WhatsApp, pasarelas de pago, correo transaccional o bases de datos.',
    type: 'choice',
    options: [
      { key: 'A', label: 'Notificaciones automáticas a WhatsApp y correo' },
      { key: 'B', label: 'CRM completo con calificación de leads y pipelines' },
      { key: 'C', label: 'Cobros online (Stripe, Mercado Pago o pasarelas locales)' },
      { key: 'D', label: 'Integración compleja con APIs externas y Webhooks' },
    ],
  },
]

export default function TypeformFluidExperience() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [clientContact, setClientContact] = useState({ name: '', email: '', phone: '' })
  const [sentSuccess, setSentSuccess] = useState(false)

  const currentQ = QUESTIONS[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)

  const handleSelectOption = useCallback((option) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }))
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setIsCompleted(true)
      }
    }, 280)
  }, [currentIndex, currentQ])

  // Keyboard navigation (A, B, C, D and Arrow keys)
  useEffect(() => {
    if (isCompleted) return

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const matched = currentQ.options.find((opt) => opt.key === key)
        if (matched) handleSelectOption(matched)
      } else if (e.key === 'ArrowDown' && currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex((p) => p + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex((p) => p - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, currentQ, handleSelectOption, isCompleted])

  const handleRestart = () => {
    setAnswers({})
    setCurrentIndex(0)
    setIsCompleted(false)
    setSentSuccess(false)
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Top Header & Minimalist Linear Progress */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0d1117]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">QAWAY</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff4b0b] bg-[#ff4b0b]/10 px-2 py-0.5 rounded border border-[#ff4b0b]/20">
                FLUID FLOW
              </span>
            </Link>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Formulario 03: Typeform / Linear Focus Experience
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">
              {progressPercent}% completado
            </span>
            <Link
              to="/formularios"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              ← Todos los Modelos
            </Link>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-white/5 h-[2px]">
          <div
            className="bg-gradient-to-r from-orange-500 to-[#ff4b0b] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-28 pb-20 flex items-center justify-center">
        {!isCompleted ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-8"
            >
              {/* Question Index Badge */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#ff4b0b]">
                <span>0{currentIndex + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-slate-500">Pregunta {currentIndex + 1} de {QUESTIONS.length}</span>
              </div>

              {/* Question Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {currentQ.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Interactive Key Cards (A, B, C, D) */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id]?.key === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer ${
                        isSelected
                          ? 'bg-[#ff4b0b]/15 border-[#ff4b0b] ring-1 ring-[#ff4b0b] text-white'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Keyboard badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#ff4b0b] text-white shadow-md'
                              : 'bg-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/20'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <span className="text-sm sm:text-base font-medium">
                          {opt.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="w-5 h-5 text-[#ff4b0b]" />}
                        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Presiona {opt.key}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Completion & Project Summary Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-7 backdrop-blur-xl"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4b0b]/20 text-[#ff4b0b] text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Configuración de Requerimientos Lista</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Resumen de tu Proyecto Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Hemos estructurado las 5 especificaciones clave para tu propuesta técnica.
              </p>
            </div>

            {/* Answer Pills Grid */}
            <div className="space-y-3">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Pregunta 0{q.id}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {answers[q.id]?.label || 'No respondido'}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#ff4b0b] bg-[#ff4b0b]/10 px-2 py-1 rounded">
                    [{answers[q.id]?.key || '—'}]
                  </span>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            {!sentSuccess ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSentSuccess(true)
                }}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4"
              >
                <h4 className="text-sm font-bold text-white">
                  ¿A dónde te enviamos la propuesta formal y cotización?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={clientContact.name}
                    onChange={(e) => setClientContact((p) => ({ ...p, name: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b0b]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="tu.correo@empresa.com"
                    value={clientContact.email}
                    onChange={(e) => setClientContact((p) => ({ ...p, email: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#ff4b0b] hover:bg-[#e04008] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  <span>Solicitar Propuesta & Agendar Kickoff</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <Check className="w-7 h-7 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  ¡Requerimiento recibido con éxito!
                </h4>
                <p className="text-xs text-slate-400">
                  Un arquitecto de soluciones de Qaway Lab revisará tus respuestas y te responderá en breve.
                </p>
              </div>
            )}

            {/* Restart */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar formulario</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Bottom Navigation (Linear style keyboard controls) */}
      {!isCompleted && (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#0d1117]/90 backdrop-blur-md border-t border-white/5 py-3 px-6 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => currentIndex > 0 && setCurrentIndex((p) => p - 1)}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white cursor-pointer"
                  title="Anterior (Tecla ↑)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => currentIndex < QUESTIONS.length - 1 && setCurrentIndex((p) => p + 1)}
                  disabled={currentIndex === QUESTIONS.length - 1}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-white cursor-pointer"
                  title="Siguiente (Tecla ↓)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <span className="hidden sm:inline font-mono">
                Navega con teclas <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, <strong>D</strong> o flechas <strong>↑ ↓</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-500">QAWAY LAB FLOW ENGINE</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
