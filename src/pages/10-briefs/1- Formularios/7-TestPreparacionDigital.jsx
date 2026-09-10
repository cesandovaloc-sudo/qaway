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
        return <Trophy className="w-10 h-10 text-amber-500" />
      case 'flame':
        return <Flame className="w-10 h-10 text-orange-500" />
      case 'zap':
        return <Zap className="w-10 h-10 text-sky-500" />
      case 'trend':
        return <TrendingUp className="w-10 h-10 text-emerald-500" />
      default:
        return <Target className="w-10 h-10 text-slate-400" />
    }
  }

  return (
    <motion.div
      key={stageId}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
        {getIcon()}
      </div>
    </motion.div>
  )
}

export default function TestPreparacionDigital() {
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
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      {/* Main Container - viewport fit */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[calc(100vh-100px)] lg:min-h-[520px] lg:max-h-[660px]">

          {/* MOBILE COMPACT PROGRESS BAR */}
          <div className="flex lg:hidden items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200/60 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-slate-700">{stageData.badgeText}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">{answeredCount}/10</span>
              <span>{answeredCount > 0 ? `${currentScorePercentage}%` : '—'}</span>
            </div>
          </div>

          {/* ============= LEFT PANEL: SOFT GRAY AESTHETIC ============= */}
          <aside className="hidden lg:flex lg:col-span-5 h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
            {/* Subtle decorative blurs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-200/60 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />

            {/* Top badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>{stageData.badgeText}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {answeredCount}/10
              </span>
            </div>

            {/* Center icon */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              <StageIconDisplay stageId={stageData.stageId} />
            </div>

            {/* Tip box */}
            {!isCompleted && currentQuestion?.tip && (
              <div className="relative z-10 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/70 space-y-1 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-extrabold text-orange-600">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>Consejo Estratégico</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {currentQuestion.tip}
                </p>
              </div>
            )}

            {/* Bottom metric */}
            <div className="relative z-10 pt-3 mt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-800 font-mono">
                  {answeredCount > 0 ? `${currentScorePercentage}%` : '0%'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Madurez Digital
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Qaway Lab Engine</span>
              </div>
            </div>
          </aside>

          {/* ============= RIGHT PANEL: CLEAN MINIMALIST FORM ============= */}
          <section className="col-span-1 lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-white h-full overflow-y-auto">
            {!isCompleted ? (
              <>
                {/* Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/70">
                      {currentQuestion.pilar}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500">
                      Paso {currentStep + 1} de {QUESTIONS.length}
                    </span>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5 w-full mb-4">
                    {QUESTIONS.map((q, idx) => {
                      const isPassed = idx < currentStep
                      const isCurrent = idx === currentStep
                      return (
                        <div
                          key={q.id}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'bg-orange-500'
                              : isPassed
                              ? 'bg-slate-800'
                              : 'bg-slate-200'
                          }`}
                        />
                      )
                    })}
                  </div>

                  {/* Question */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                          {currentQuestion.question}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {currentQuestion.subtitle}
                        </p>
                      </div>

                      {/* Options */}
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
                                  ? 'bg-orange-50 border-orange-400 ring-1 ring-orange-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? 'border-orange-500 bg-white'
                                      : 'border-slate-300 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs sm:text-sm font-medium ${
                                    isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600'
                                  }`}
                                >
                                  {opt.text}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                                  isSelected
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-slate-100 text-slate-400'
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

                {/* Navigation */}
                <div className="pt-3 mt-auto flex items-center justify-between gap-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                      currentStep === 0
                        ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={selectedOptionIndex === undefined}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all ${
                      selectedOptionIndex === undefined
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] cursor-pointer shadow-md shadow-orange-500/20'
                    }`}
                  >
                    <span>{currentStep === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Siguiente'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* ============= RESULTS SCREEN ============= */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5 my-auto"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Diagnóstico Completado</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Puntaje de Madurez Digital
                  </h2>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-orange-500 tracking-tighter">
                      <AnimatedScoreCounter value={finalScorePercentage} />
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* 4 Pillars */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/60">
                    Rendimiento por los 4 Pilares
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: '1. Oferta & Mensaje', value: pillarScores.oferta },
                      { label: '2. Canal Web & Branding', value: pillarScores.canal },
                      { label: '3. Automatización & CRM', value: pillarScores.sistemas },
                      { label: '4. Capacidad de Escala', value: pillarScores.escala },
                    ].map((p) => (
                      <div key={p.label} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">{p.label}</span>
                          <span className="text-slate-500 font-mono">{p.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-slate-800 h-full rounded-full transition-all duration-500" style={{ width: `${p.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Capture */}
                {!emailSubmitted ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (userEmail) setEmailSubmitted(true)
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5"
                  >
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      ¿Deseas recibir tu reporte detallado en PDF?
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Tu nombre o empresa"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-400 flex-1 bg-white"
                      />
                      <input
                        type="email"
                        required
                        placeholder="correo@tuempresa.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-400 flex-1 bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">
                      ¡Reporte enviado a {userEmail}!
                    </h4>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Repetir Diagnóstico</span>
                  </button>
                  <Link
                    to="/estudio/consultoria"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
                  >
                    Agendar Sesión →
                  </Link>
                </div>
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
