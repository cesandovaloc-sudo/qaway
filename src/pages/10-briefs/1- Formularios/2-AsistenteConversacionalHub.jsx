import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowUp, Edit3, X, Check, RotateCcw, Copy, Sparkles,
  Download, Send, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react'

const WIZARD_QUESTIONS = [
  {
    step: 1,
    key: 'buyerPersonaName',
    label: 'Nombre de Persona',
    question: '1. ¿Cómo se llama el perfil o arquetipo de tu buyer persona ideal?',
    placeholder: 'Ej. Carlos Méndez (Gerente de Operaciones), Valeria (Fundadora B2B)...',
    type: 'text',
    options: ['Director General / CEO', 'Gerente de Marketing', 'Fundador de Startup', 'Director de Operaciones'],
  },
  {
    step: 2,
    key: 'industry',
    label: 'Sector / Rubro',
    question: '2. ¿En qué industria o vertical de negocio opera principalmente?',
    placeholder: 'Ej. Servicios Profesionales, Salud, E-commerce, Inmobiliaria, Fintech...',
    type: 'text',
    options: ['Servicios B2B', 'Salud y Skincare', 'Inmobiliaria y Arquitectura', 'Comercio / Retail', 'Educación / Consultoría'],
  },
  {
    step: 3,
    key: 'mainPain',
    label: 'Dolor Crítico',
    question: '3. ¿Cuál es la mayor frustración o dolor que busca resolver con urgencia?',
    placeholder: 'Ej. Pierde prospectos por falta de seguimiento, su web no convierte, procesos manuales lentos...',
    type: 'text',
    options: ['Procesos manuales y pérdida de tiempo', 'Falta de prospectos calificados', 'Web desactualizada que no vende', 'Desorden operativo y falta de CRM'],
  },
  {
    step: 4,
    key: 'currentObstacle',
    label: 'Objeción Típica',
    question: '4. ¿Cuál es su objeción más frecuente antes de tomar una decisión de compra?',
    placeholder: 'Ej. "No tengo tiempo para implementar", "Es muy costoso", "Ya tuvimos mala experiencia con otra agencia"...',
    type: 'text',
    options: ['"No tenemos tiempo para implementar"', '"Ya probamos agencias y no funcionó"', '"El presupuesto es limitado actualmente"', '"Queremos ver casos de éxito reales"'],
  },
  {
    step: 5,
    key: 'valueProposition',
    label: 'Promesa Central',
    question: '5. ¿Cuál es la transformación o promesa directa que le ofreces a este cliente?',
    placeholder: 'Ej. Automatizamos su captación comercial para duplicar reuniones calificadas en 60 días...',
    type: 'text',
    options: ['Aumentar ventas con automatización inteligente', 'Construir una presencia digital de alta autoridad', 'Ahorrar más de 20 horas de trabajo manual al mes', 'Centralizar datos en un CRM moderno'],
  },
  {
    step: 6,
    key: 'decisionFactors',
    label: 'Factores de Decisión',
    question: '6. ¿Qué factores pesan más al momento de contratar (selección múltiple)?',
    type: 'multiselect',
    options: ['Velocidad de entrega', 'Soporte y acompañamiento', 'Garantía de resultados', 'Diseño y estética premium', 'Precio competitivo', 'Tecnología moderna'],
  },
  {
    step: 7,
    key: 'preferredChannels',
    label: 'Canales Favoritos',
    question: '7. ¿Dónde pasa la mayor parte de su tiempo profesional?',
    type: 'multiselect',
    options: ['LinkedIn', 'WhatsApp Directo', 'Google Search', 'Instagram / Reels', 'Eventos presenciales', 'Email Newsletter'],
  },
  {
    step: 8,
    key: 'budgetRange',
    label: 'Ticket Promedio',
    question: '8. ¿Cuál es el rango de inversión promedio que este perfil maneja?',
    placeholder: 'Selecciona o escribe el rango estimado...',
    type: 'text',
    options: ['Menos de $1,000 USD', '$1,000 - $3,000 USD', '$3,000 - $7,000 USD', 'Más de $7,000 USD'],
  },
  {
    step: 9,
    key: 'decisionTimeline',
    label: 'Ciclo de Decisión',
    question: '9. ¿Cuánto tiempo suele tardar desde el primer contacto hasta el cierre?',
    type: 'text',
    options: ['Menos de 7 días (Decisión rápida)', '2 a 4 semanas', '1 a 3 meses (Evaluación de comités)', 'Más de 3 meses'],
  },
  {
    step: 10,
    key: 'goalMetric',
    label: 'Meta Principal',
    question: '10. ¿Cuál es el KPI o métrica clave con la que este cliente medirá el éxito?',
    placeholder: 'Ej. Retorno de inversión (ROI), volumen de leads cerrados, tiempo ahorrado...',
    type: 'text',
    options: ['ROI medible y aumento de facturación', 'Reducción de horas operativas manuales', 'Leads calificados listos para llamada', 'Modernización de marca e imagen'],
  },
]

export default function AsistenteConversacionalHub() {
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardAnswers, setWizardAnswers] = useState({})
  const [currentInput, setCurrentInput] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  const activeQuestion = WIZARD_QUESTIONS[wizardStep - 1]

  // Focus input automatically on step change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [wizardStep])

  const handleNextStep = (valueToSubmit) => {
    const finalValue = valueToSubmit !== undefined ? valueToSubmit : currentInput
    if (!finalValue || (typeof finalValue === 'string' && !finalValue.trim())) return

    setWizardAnswers((prev) => ({
      ...prev,
      [activeQuestion.key]: finalValue,
    }))
    setCurrentInput('')

    if (wizardStep < WIZARD_QUESTIONS.length) {
      setWizardStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNextStep()
    }
  }

  const handleOptionClick = (opt) => {
    if (activeQuestion.type === 'multiselect') {
      const existing = currentInput ? currentInput.split(',').map((s) => s.trim()).filter(Boolean) : []
      const next = existing.includes(opt)
        ? existing.filter((item) => item !== opt)
        : [...existing, opt]
      setCurrentInput(next.join(', '))
    } else {
      handleNextStep(opt)
    }
  }

  const handleEditAnswer = (stepNum, key) => {
    setWizardStep(stepNum)
    setCurrentInput(wizardAnswers[key] || '')
    setIsCompleted(false)
  }

  const handleReset = () => {
    setWizardAnswers({})
    setWizardStep(1)
    setCurrentInput('')
    setIsCompleted(false)
  }

  const handleCopySummary = () => {
    const text = WIZARD_QUESTIONS.map(
      (q) => `📌 ${q.label}: ${wizardAnswers[q.key] || 'No respondido'}`
    ).join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
              STUDIO OS
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Formulario 02: Asistente Conversacional Marketing OS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/formularios"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Ver los 6 Modelos
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        {!isCompleted ? (
          <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 space-y-7 transition-all">
            {/* Header with Step Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600">
                  ASISTENTE CONVERSACIONAL DE CREACIÓN
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                  Paso {wizardStep} de {WIZARD_QUESTIONS.length}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                title="Reiniciar formulario"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Answered Questions History (Clean interactive pills in top-right alignment) */}
            {wizardStep > 1 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {WIZARD_QUESTIONS.slice(0, wizardStep - 1).map((q) => (
                  <div key={q.step} className="flex flex-col items-end text-right">
                    <span className="text-[11px] text-slate-400 font-semibold">{q.label}</span>
                    <div className="mt-0.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/80 shadow-2xs">
                      <span className="max-w-xs truncate">{wizardAnswers[q.key]}</span>
                      <button
                        type="button"
                        onClick={() => handleEditAnswer(q.step, q.key)}
                        className="text-slate-400 hover:text-purple-600 transition-colors ml-1 cursor-pointer"
                        title="Editar respuesta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Question Title */}
            <div className="space-y-4 pt-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {activeQuestion.question}
              </h3>

              {/* Quick Select Options Pills */}
              {activeQuestion.options && (
                <div className="space-y-2">
                  {activeQuestion.type === 'multiselect' && (
                    <p className="text-xs font-bold text-purple-600">
                      Selección múltiple (puedes marcar varias opciones):
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.options.map((opt) => {
                      const isSelected = activeQuestion.type === 'multiselect'
                        ? currentInput.split(',').map((s) => s.trim()).includes(opt)
                        : currentInput.trim() === opt

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleOptionClick(opt)}
                          className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Text Input / Field with High Ergonomics */}
              <div className="relative pt-2">
                <textarea
                  ref={inputRef}
                  rows={activeQuestion.type === 'multiselect' ? 2 : 2}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeQuestion.placeholder || 'Escribe tu respuesta personalizada aquí...'}
                  className="w-full px-4 py-3.5 pr-14 rounded-2xl border border-slate-200 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleNextStep()}
                  disabled={!currentInput.trim()}
                  className={`absolute right-3.5 top-5 p-2.5 rounded-xl transition-all ${
                    currentInput.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/30 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Enviar respuesta"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom helpers */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Presiona <strong>Enter ↵</strong> para continuar</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="hover:text-rose-600 transition-colors font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Final Output Card */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950">
                    Ficha de Buyer Persona & Estrategia Lista
                  </h3>
                  <p className="text-xs text-slate-500">
                    10 puntos completados con éxito mediante el Asistente Conversacional.
                  </p>
                </div>
              </div>
            </div>

            {/* Structured Table of Completed Responses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
              {WIZARD_QUESTIONS.map((q) => (
                <div key={q.step} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wide">
                    {q.label}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-3">
                    {wizardAnswers[q.key] || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Crear Otro Perfil</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Resumen'}</span>
                </button>

                <Link
                  to="/estudio/branding-digital"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <span>Implementar Estrategia</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab Studio OS • Generador Asistido de Estrategias y Contenidos
      </footer>
    </div>
  )
}
