import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Clock, Award, Lightbulb, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, RotateCcw, Send, ShieldCheck, Zap, TrendingUp,
  Compass, Flame, Trophy, Star, Target
} from 'lucide-react'

const PILLARS = {
  OFERTA: 'Claridad de Oferta & Mensaje',
  CANAL: 'Canal Digital & Web',
  SISTEMAS: 'Automatización & CRM',
  ESCALA: 'Capacidad de Escala & Datos',
}

const QUESTIONS = [
  {
    id: 1,
    pilar: PILLARS.OFERTA,
    question: '¿Tu oferta se entiende fácilmente en los primeros 5 segundos?',
    subtitle: 'Una persona que no te conoce debería poder entender de inmediato qué ofreces, para quién es y qué problema resuelve.',
    options: [
      { text: 'Sí, se entiende claramente y genera interés inmediato.', score: 10, grade: 'Excelente' },
      { text: 'Se entiende, pero a veces requiere muchas explicaciones.', score: 6, grade: 'Bueno' },
      { text: 'No del todo, suele generar dudas o confusión.', score: 3, grade: 'Por Mejorar' },
      { text: 'No estoy seguro(a), nunca lo hemos medido.', score: 1, grade: 'Sin Datos' },
    ],
    tip: 'Piensa en un desconocido: si aterriza en tu web o redes, ¿comprendería tu propuesta antes de aburrirse y cerrar la pestaña?',
  },
  {
    id: 2,
    pilar: PILLARS.OFERTA,
    question: '¿Tienes definido con precisión a tu cliente ideal (ICP)?',
    subtitle: 'Saber a quién le vendes y a qué clientes decirles que no te ahorra cientos de horas en cotizaciones que nunca cierran.',
    options: [
      { text: 'Sí, tenemos perfiles claros y filtramos prospectos poco rentables.', score: 10, grade: 'Excelente' },
      { text: 'Tenemos una idea general, pero intentamos venderle a casi todos.', score: 6, grade: 'Bueno' },
      { text: 'Nos cuesta filtrar y desgastamos tiempo en prospectos fríos.', score: 3, grade: 'Por Mejorar' },
      { text: 'Aún no lo tenemos documentado ni definido.', score: 1, grade: 'Sin Datos' },
    ],
    tip: 'Venderle a todos es la forma más rápida de no hablarle a nadie. La especialización permite cobrar precios más altos.',
  },
  {
    id: 3,
    pilar: PILLARS.CANAL,
    question: '¿Tu sitio web principal está diseñado como una máquina de conversión?',
    subtitle: 'Tu web no es un folleto estático; debe filtrar, educar y convencer a prospectos calificados los 7 días de la semana.',
    options: [
      { text: 'Sí, tenemos una web moderna que recibe y califica prospectos.', score: 10, grade: 'Excelente' },
      { text: 'Tenemos web, pero es más informativa y genera pocas consultas.', score: 6, grade: 'Bueno' },
      { text: 'Solo dependemos de redes sociales y mensajes directos por chat.', score: 3, grade: 'Por Mejorar' },
      { text: 'No contamos con presencia web estructurada actualmente.', score: 0, grade: 'Sin Canal' },
    ],
    tip: 'Un sitio web profesional es tu mejor vendedor: trabaja 24/7 sin descanso respondiendo dudas clave.',
  },
  {
    id: 4,
    pilar: PILLARS.CANAL,
    question: '¿Tu identidad visual transmite el verdadero nivel y valor de tus servicios?',
    subtitle: 'La percepción visual define cuánto está dispuesto a pagar un cliente antes de pedir su primera reunión.',
    options: [
      { text: 'Totalmente: nuestra imagen proyecta autoridad, solidez y sofisticación.', score: 10, grade: 'Excelente' },
      { text: 'Es aceptable, pero sentimos que nuestros servicios son mejores de lo que parece.', score: 6, grade: 'Bueno' },
      { text: 'Está desactualizada o armada con plantillas improvisadas.', score: 3, grade: 'Por Mejorar' },
      { text: 'No tenemos una línea gráfica profesional definida.', score: 0, grade: 'Sin Branding' },
    ],
    tip: 'El buen diseño reduce la fricción de precio: cuando te ves como líder de mercado, tus tarifas se justifican solas.',
  },
  {
    id: 5,
    pilar: PILLARS.SISTEMAS,
    question: '¿Cómo gestionas el seguimiento de cotizaciones y prospectos?',
    subtitle: 'El 80% de las ventas ocurren después del 5to contacto. Sin un sistema, esos prospectos simplemente se olvidan.',
    options: [
      { text: 'Usamos un CRM centralizado con automatizaciones y recordatorios.', score: 10, grade: 'Excelente' },
      { text: 'Registramos en Excel, Notion o notas personales.', score: 6, grade: 'Bueno' },
      { text: 'Todo queda en chats de WhatsApp y la memoria del equipo.', score: 2, grade: 'Por Mejorar' },
      { text: 'No hacemos seguimiento estructurado a los que no compran de inmediato.', score: 0, grade: 'Sin Sistema' },
    ],
    tip: 'Un prospecto que no compra hoy puede comprar en 3 meses si mantienes una secuencia automatizada de contacto.',
  },
  {
    id: 6,
    pilar: PILLARS.SISTEMAS,
    question: '¿Cuentas con automatizaciones en tu proceso de atención comercial?',
    subtitle: 'Agendamiento inteligente, respuestas automáticas 24/7 y calificación de leads sin trabajo manual.',
    options: [
      { text: 'Sí, el prospecto agenda y califica de forma automatizada.', score: 10, grade: 'Excelente' },
      { text: 'Tenemos algunas respuestas rápidas en WhatsApp o correo.', score: 6, grade: 'Bueno' },
      { text: 'Todo el proceso de respuesta y agendamiento es manual.', score: 2, grade: 'Por Mejorar' },
      { text: 'No tenemos automatizaciones configuradas.', score: 0, grade: 'Sin Auto' },
    ],
    tip: 'Responder en menos de 5 minutos multiplica por 7 las probabilidades de cerrar una venta con ese cliente.',
  },
  {
    id: 7,
    pilar: PILLARS.SISTEMAS,
    question: '¿Tus herramientas de trabajo están conectadas entre sí?',
    subtitle: 'Formularios web, bases de datos, facturación y entrega de proyectos sincronizados en tiempo real.',
    options: [
      { text: 'Sí, tenemos un ecosistema integrado donde la información fluye sola.', score: 10, grade: 'Excelente' },
      { text: 'Usamos varias herramientas, pero no están conectadas entre sí.', score: 6, grade: 'Bueno' },
      { text: 'Dependemos de mensajes constantes y llamadas para coordinar.', score: 2, grade: 'Por Mejorar' },
      { text: 'Todo se gestiona de forma aislada y manual.', score: 0, grade: 'Aislado' },
    ],
    tip: 'Menos tareas manuales repetitivas significa más tiempo para concentrarte en atender y vender.',
  },
  {
    id: 8,
    pilar: PILLARS.ESCALA,
    question: '¿Generas contenido de autoridad que eduque antes de la llamada de venta?',
    subtitle: 'Casos de estudio, artículos explicativos o demostraciones de tu método de trabajo.',
    options: [
      { text: 'Sí, nuestros prospectos llegan educados y convencidos de nuestra experiencia.', score: 10, grade: 'Excelente' },
      { text: 'Publicamos contenido en redes, pero sin una estrategia de conversión clara.', score: 6, grade: 'Bueno' },
      { text: 'Publicamos esporádicamente cuando tenemos tiempo libre.', score: 2, grade: 'Por Mejorar' },
      { text: 'No generamos contenido educativo ni mostramos casos de estudio.', score: 0, grade: 'Sin Contenido' },
    ],
    tip: 'El contenido de autoridad filtra a los clientes difíciles y atrae a los que respetan tu conocimiento.',
  },
  {
    id: 9,
    pilar: PILLARS.ESCALA,
    question: '¿Mides tus números comerciales y de conversión mensualmente?',
    subtitle: 'Saber cuánto te cuesta adquirir un cliente y qué porcentaje de prospectos se convierten en ventas.',
    options: [
      { text: 'Sí, revisamos métricas y conversiones periódicamente.', score: 10, grade: 'Excelente' },
      { text: 'Miramos métricas de redes sociales (likes, seguidores, alcance).', score: 5, grade: 'Bueno' },
      { text: 'Solo revisamos los ingresos totales a fin de mes.', score: 2, grade: 'Por Mejorar' },
      { text: 'No medimos datos de captación digital.', score: 0, grade: 'Sin Analítica' },
    ],
    tip: 'Los likes son métricas de vanidad; las conversiones y prospectos calificados son métricas de salud real del negocio.',
  },
  {
    id: 10,
    pilar: PILLARS.ESCALA,
    question: '¿Tu negocio podría recibir el doble de clientes hoy sin colapsar?',
    subtitle: 'Capacidad operativa, infraestructura digital y procesos listos para escalar la demanda.',
    options: [
      { text: 'Sí, nuestros sistemas y procesos soportan duplicar la demanda.', score: 10, grade: 'Excelente' },
      { text: 'Podríamos atenderlos, pero requeriría trabajar horas extra y estrés.', score: 6, grade: 'Bueno' },
      { text: 'No, colapsaríamos operativamente o bajaría la calidad del servicio.', score: 2, grade: 'Por Mejorar' },
      { text: 'No tenemos capacidad ni procesos listos para crecer.', score: 0, grade: 'Sin Capacidad' },
    ],
    tip: 'Primero construye tuberías sólidas; luego abre la llave del tráfico y los anuncios.',
  },
]

// Animated Counter Component
function AnimatedScoreCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const stepTime = 20
    const totalSteps = duration / stepTime
    const increment = value / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return <span>{displayValue}</span>
}

// Dynamic Icon Display per stage
function StageIconDisplay({ stageId }) {
  const getIcon = () => {
    switch (stageId) {
      case 'trophy':
        return <Trophy className="w-12 h-12 text-yellow-300 drop-shadow-md" />
      case 'flame':
        return <Flame className="w-12 h-12 text-orange-200 drop-shadow-md" />
      case 'zap':
        return <Zap className="w-12 h-12 text-amber-200 drop-shadow-md" />
      case 'trend':
        return <TrendingUp className="w-12 h-12 text-yellow-100 drop-shadow-md" />
      default:
        return <Target className="w-12 h-12 text-white/90 drop-shadow-md" />
    }
  }

  return (
    <motion.div
      key={stageId}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center p-6"
    >
      <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl flex items-center justify-center mb-3 group hover:scale-105 transition-transform duration-300">
        {getIcon()}
      </div>
    </motion.div>
  )
}

export default function DiagnosticoGamificadoMood() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [scenePulse, setScenePulse] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]
  const selectedOptionIndex = answers[currentQuestion?.id]

  const answeredCount = Object.keys(answers).length
  const currentTotalScore = Object.entries(answers).reduce((acc, [qId, optIdx]) => {
    const q = QUESTIONS.find((item) => item.id === Number(qId))
    return acc + (q ? q.options[optIdx]?.score || 0 : 0)
  }, 0)

  const maxScore = QUESTIONS.length * 10
  const currentScorePercentage = answeredCount > 0
    ? Math.round((currentTotalScore / (answeredCount * 10)) * 100)
    : 0

  const finalScorePercentage = Math.round((currentTotalScore / maxScore) * 100)

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }))
    setScenePulse(true)
    setTimeout(() => setScenePulse(false), 450)
  }

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentStep(0)
    setIsCompleted(false)
    setEmailSubmitted(false)
  }

  const getStageData = () => {
    if (answeredCount === 0) {
      return {
        stageId: 'start',
        badgeText: 'Auditoría en Curso 🔍',
        subText: 'Comienza a responder',
      }
    }
    if (currentScorePercentage >= 80) {
      return {
        stageId: 'trophy',
        badgeText: '¡Nivel Élite! 🏆',
        subText: 'Rendimiento sobresaliente',
      }
    }
    if (currentScorePercentage >= 60) {
      return {
        stageId: 'flame',
        badgeText: '¡Alta Tracción! 🔥',
        subText: 'Crecimiento acelerado',
      }
    }
    if (currentScorePercentage >= 40) {
      return {
        stageId: 'zap',
        badgeText: 'Potencial Activo ⚡',
        subText: 'Optimizando flujos',
      }
    }
    return {
      stageId: 'trend',
      badgeText: 'Cimientos Iniciales 🌱',
      subText: 'Detectando mejoras',
    }
  }

  const stageData = getStageData()

  const calculatePillarScore = (pillarName) => {
    const pillarQuestions = QUESTIONS.filter((q) => q.pilar === pillarName)
    const points = pillarQuestions.reduce((acc, q) => {
      const selected = answers[q.id]
      return acc + (selected !== undefined ? q.options[selected]?.score || 0 : 0)
    }, 0)
    const maxPillar = pillarQuestions.length * 10
    return maxPillar > 0 ? Math.round((points / maxPillar) * 100) : 0
  }

  const pillarScores = {
    oferta: calculatePillarScore(PILLARS.OFERTA),
    canal: calculatePillarScore(PILLARS.CANAL),
    sistemas: calculatePillarScore(PILLARS.SISTEMAS),
    escala: calculatePillarScore(PILLARS.ESCALA),
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
              MOOD LAB
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Formulario 07: Diagnóstico 3D en Panel Directo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/formularios"
            className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Ver los 7 Modelos
          </Link>
        </div>
      </header>

      {/* Main Container - VIEWPORT FIT: no scroll needed */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="w-full bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[calc(100vh-140px)] lg:max-h-[680px]">
          
          {/* MOBILE COMPACT PROGRESS BAR (visible only below lg) */}
          <div className="flex lg:hidden items-center justify-between bg-gradient-to-r from-[#ff3b00] to-[#ffaa00] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span className="text-xs font-bold">{stageData.badgeText}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="font-mono bg-black/15 px-2 py-0.5 rounded-md">{answeredCount}/10</span>
              <span>{answeredCount > 0 ? `${currentScorePercentage}%` : '0%'}</span>
            </div>
          </div>

          {/* =============================================================
              LEFT PANEL: FULL DIRECT WARM CANVAS (NO NESTED GRAY CARDS)
              (Solid continuous warm gradient filling 100% height & width)
             ============================================================= */}
          <aside className="hidden lg:flex lg:col-span-5 h-full w-full bg-gradient-to-br from-[#ff3b00] via-[#ff5a1f] to-[#ffaa00] text-white p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
            {/* Ambient lighting flares */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

            {/* Top Tag inside the Panel */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>{stageData.badgeText}</span>
              </div>
              <span className="text-xs font-mono font-bold text-white/90 bg-black/15 px-2.5 py-1 rounded-md">
                {answeredCount}/10
              </span>
            </div>

            {/* CENTER: STAGE ICON DISPLAY */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <StageIconDisplay stageId={stageData.stageId} />
            </div>

            {/* Pedagogical Tip moved to left panel */}
            {!isCompleted && currentQuestion?.tip && (
              <div className="relative z-10 my-3 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-yellow-200">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>Consejo Estratégico</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-normal">
                  {currentQuestion.tip}
                </p>
              </div>
            )}

            {/* Bottom Panel Metric & Trust Note */}
            <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-white/95">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  {answeredCount > 0 ? `${currentScorePercentage}%` : '0%'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                  Madurez Digital
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Qaway Lab Engine</span>
              </div>
            </div>
          </aside>

          {/* =============================================================
              RIGHT PANEL: INTERACTIVE FORM & QUESTION FLOW (STABLE HEIGHT)
             ============================================================= */}
          <section className="col-span-1 lg:col-span-7 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col justify-between bg-white h-full overflow-y-auto">
            {!isCompleted ? (
              <>
                {/* Stepper Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/70">
                        {currentQuestion.pilar}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">
                      Paso {currentStep + 1} de {QUESTIONS.length}
                    </span>
                  </div>

                  {/* 10 Step Dots */}
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full mb-4">
                    {QUESTIONS.map((q, idx) => {
                      const isPassed = idx < currentStep
                      const isCurrent = idx === currentStep
                      return (
                        <div
                          key={q.id}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'bg-[#ff4b0b] ring-2 ring-orange-200'
                              : isPassed
                              ? 'bg-slate-900'
                              : 'bg-slate-100'
                          }`}
                        />
                      )
                    })}
                  </div>

                  {/* Question with Motion */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-snug">
                          {currentQuestion.question}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {currentQuestion.subtitle}
                        </p>
                      </div>

                      {/* Interactive Option Cards */}
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, optIndex) => {
                          const isSelected = selectedOptionIndex === optIndex
                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleSelectOption(optIndex)}
                              className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50/70 border-[#ff4b0b] shadow-sm ring-1 ring-[#ff4b0b]'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? 'border-[#ff4b0b] bg-white'
                                      : 'border-slate-300 group-hover:border-slate-400 bg-slate-50'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff4b0b]" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs sm:text-sm font-semibold block ${
                                    isSelected ? 'text-slate-950 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  {opt.text}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-[#ff4b0b] text-white'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                }`}
                              >
                                {opt.grade}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-3 flex items-center justify-between gap-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                        currentStep === 0
                          ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={selectedOptionIndex === undefined}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md ${
                        selectedOptionIndex === undefined
                          ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                          : 'bg-[#ff4b0b] hover:bg-[#e04008] active:scale-[0.99] cursor-pointer shadow-orange-500/20'
                      }`}
                    >
                      <span>{currentStep === QUESTIONS.length - 1 ? 'Ver Resultado Final' : 'Siguiente'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              </>
            ) : (
              /* Results Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 my-auto"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold bg-slate-950 text-white border-slate-950 shadow-2xs">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Diagnóstico Completado con Éxito</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                    Puntaje de Madurez Digital
                  </h2>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-[#ff4b0b] tracking-tighter">
                      <AnimatedScoreCounter value={finalScorePercentage} />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-400">
                      / 100 Puntos
                    </span>
                  </div>
                </div>

                {/* 4 Pillars Clean Breakdown */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      Rendimiento por los 4 Pilares
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">Resultados</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">1. Oferta & Mensaje</span>
                        <span className="text-slate-950 font-mono">{pillarScores.oferta}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.oferta}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">2. Canal Web & Branding</span>
                        <span className="text-slate-950 font-mono">{pillarScores.canal}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.canal}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">3. Automatización & CRM</span>
                        <span className="text-slate-950 font-mono">{pillarScores.sistemas}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#ff4b0b] h-full rounded-full" style={{ width: `${pillarScores.sistemas}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">4. Capacidad de Escala</span>
                        <span className="text-slate-950 font-mono">{pillarScores.escala}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.escala}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Capture Box */}
                {!emailSubmitted ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (userEmail) setEmailSubmitted(true)
                    }}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2.5"
                  >
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
                      ¿Deseas recibir tu reporte detallado con la hoja de ruta en PDF?
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Tu nombre o empresa"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-950 flex-1"
                      />
                      <input
                        type="email"
                        required
                        placeholder="correo@tuempresa.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-950 flex-1"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-[#ff4b0b] transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-900">
                      ¡Reporte enviado exitosamente a {userEmail}!
                    </h4>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repetir Diagnóstico</span>
                  </button>

                  <Link
                    to="/estudio/consultoria"
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-[#ff4b0b] text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    Agendar Sesión Estratégica →
                  </Link>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab Mood Lab • Gamificación Visual y Diagnósticos Comerciales
      </footer>
    </div>
  )
}
