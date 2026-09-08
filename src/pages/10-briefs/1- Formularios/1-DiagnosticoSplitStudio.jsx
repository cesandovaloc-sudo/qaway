import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Clock, Award, Lightbulb, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, RotateCcw, Send, ShieldCheck, TrendingUp, Check,
  ChevronRight, Compass, Target
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
    question: '¿Tu oferta se entiende fácilmente?',
    subtitle: 'Una persona que no te conoce debería poder entender en pocos segundos qué ofreces, para quién es y qué problema resuelve.',
    options: [
      { text: 'Sí, se entiende claramente.', score: 10 },
      { text: 'Se entiende, pero a veces genera dudas.', score: 6 },
      { text: 'No del todo, suele generar muchas preguntas.', score: 3 },
      { text: 'No estoy seguro(a).', score: 1 },
    ],
    tip: 'Piensa en alguien que no te conoce. ¿Comprendería tu oferta solo viendo tu web o redes sociales en 5 segundos?',
  },
  {
    id: 2,
    pilar: PILLARS.OFERTA,
    question: '¿Tienes definido el perfil exacto de tu cliente ideal (ICP)?',
    subtitle: 'Saber a quién le hablas y a quién descartar te permite invertir tu tiempo solo en prospectos que valoran y pagan tus servicios.',
    options: [
      { text: 'Sí, tenemos perfiles documentados y sabemos a quién decir que no.', score: 10 },
      { text: 'Tenemos una idea general, pero atendemos a casi cualquier cliente.', score: 6 },
      { text: 'Nos cuesta filtrar y solemos cotizar a clientes poco rentables.', score: 3 },
      { text: 'Aún no lo tenemos documentado.', score: 1 },
    ],
    tip: 'Cuando le vendes a todos, no le hablas a nadie con fuerza. Especializar tu mensaje atrae clientes de mayor presupuesto.',
  },
  {
    id: 3,
    pilar: PILLARS.CANAL,
    question: '¿Tu canal digital principal está diseñado para convertir?',
    subtitle: 'Tu sitio web o landing page debe funcionar como un asesor comercial 24/7 que educa, califica y guía al visitante a contactar.',
    options: [
      { text: 'Sí, contamos con una web moderna que recibe y califica prospectos.', score: 10 },
      { text: 'Tenemos web, pero es más informativa y genera pocas consultas.', score: 6 },
      { text: 'Solo dependemos de redes sociales y mensajes directos por chat.', score: 3 },
      { text: 'No contamos con presencia web estructurada actualmente.', score: 0 },
    ],
    tip: 'Un sitio web profesional no es un folleto digital: es la sede de tu empresa donde el prospecto toma la decisión de confiar en ti.',
  },
  {
    id: 4,
    pilar: PILLARS.CANAL,
    question: '¿Tu identidad visual transmite el verdadero nivel de tus servicios?',
    subtitle: 'La percepción estética de tu marca define cuánto está dispuesto a pagar un cliente antes de pedir su primera cotización.',
    options: [
      { text: 'Totalmente: nuestra imagen proyecta autoridad, solidez y calidad.', score: 10 },
      { text: 'Es aceptable, pero sentimos que nuestros servicios son superiores a como nos vemos.', score: 6 },
      { text: 'Está desactualizada o armada con plantillas improvisadas.', score: 3 },
      { text: 'No tenemos una línea gráfica profesional definida.', score: 0 },
    ],
    tip: 'Un buen diseño reduce las objeciones de precio: cuando te ves como un referente, cobrar como uno resulta natural.',
  },
  {
    id: 5,
    pilar: PILLARS.SISTEMAS,
    question: '¿Cómo gestionas el seguimiento de las personas interesadas?',
    subtitle: 'El tiempo de respuesta y la constancia de contacto son los factores que más impactan en la tasa de cierre de ventas.',
    options: [
      { text: 'Usamos un CRM centralizado con recordatorios y etapas claras.', score: 10 },
      { text: 'Anotamos en Excel, Notion o notas personales.', score: 6 },
      { text: 'Todo queda en chats de WhatsApp y la memoria del equipo.', score: 2 },
      { text: 'No hacemos seguimiento estructurado a quienes no compran al instante.', score: 0 },
    ],
    tip: 'Más del 80% de las ventas ocurren entre el 5to y el 12vo contacto. Sin un CRM, esos clientes simplemente se olvidan.',
  },
  {
    id: 6,
    pilar: PILLARS.SISTEMAS,
    question: '¿Cuentas con automatizaciones en tu proceso de atención?',
    subtitle: 'Respuestas automáticas inteligentes, calificación de prospectos o agendamiento sin intervención manual.',
    options: [
      { text: 'Sí, el prospecto agenda y califica de forma automatizada.', score: 10 },
      { text: 'Tenemos algunas respuestas rápidas básicas en WhatsApp o correo.', score: 6 },
      { text: 'Todo el proceso de agendamiento y respuesta es 100% manual.', score: 2 },
      { text: 'No tenemos automatizaciones configuradas.', score: 0 },
    ],
    tip: 'Responder a un prospecto en menos de 5 minutos multiplica por 7 las probabilidades de convertirlo en cliente.',
  },
  {
    id: 7,
    pilar: PILLARS.SISTEMAS,
    question: '¿Tu equipo cuenta con herramientas conectadas entre sí?',
    subtitle: 'Sistemas que enlazan formularios web, base de datos, facturación y entrega de proyectos sin duplicar trabajo.',
    options: [
      { text: 'Sí, tenemos un ecosistema integrado donde la información fluye sola.', score: 10 },
      { text: 'Usamos varias herramientas, pero no están conectadas entre sí.', score: 6 },
      { text: 'Dependemos de mensajes constantes y llamadas para coordinar.', score: 2 },
      { text: 'Todo se gestiona de forma aislada y manual.', score: 0 },
    ],
    tip: 'Un negocio ordenado por dentro transmite calma y profesionalismo hacia afuera.',
  },
  {
    id: 8,
    pilar: PILLARS.ESCALA,
    question: '¿Generas contenido de autoridad que eduque antes de la venta?',
    subtitle: 'Casos de éxito documentados, explicaciones de tu método de trabajo o artículos que resuelvan dudas frecuentes.',
    options: [
      { text: 'Sí, nuestros prospectos llegan educados y convencidos de nuestro método.', score: 10 },
      { text: 'Publicamos contenido en redes, pero sin una estrategia de ventas clara.', score: 6 },
      { text: 'Publicamos esporádicamente cuando tenemos tiempo libre.', score: 2 },
      { text: 'No generamos contenido educativo ni mostramos casos de estudio.', score: 0 },
    ],
    tip: 'El contenido educativo acorta a la mitad las reuniones comerciales, porque el cliente ya conoce cómo trabajas.',
  },
  {
    id: 9,
    pilar: PILLARS.ESCALA,
    question: '¿Mides tus números comerciales y de conversión mensualmente?',
    subtitle: 'Saber de dónde vienen tus prospectos, cuántos cierran y cuánto te cuesta adquirir cada cliente.',
    options: [
      { text: 'Sí, revisamos métricas y conversiones periódicamente.', score: 10 },
      { text: 'Miramos métricas de redes sociales (likes, alcance, seguidores).', score: 5 },
      { text: 'Solo revisamos los ingresos totales en la cuenta a fin de mes.', score: 2 },
      { text: 'No medimos datos de captación digital.', score: 0 },
    ],
    tip: 'Lo que no se mide no se puede optimizar. Saber tu tasa de conversión te da la tranquilidad para invertir con seguridad.',
  },
  {
    id: 10,
    pilar: PILLARS.ESCALA,
    question: '¿Tu negocio podría recibir el doble de clientes hoy sin colapsar?',
    subtitle: 'Capacidad operativa, infraestructura digital y procesos listos para escalar la demanda.',
    options: [
      { text: 'Sí, nuestros sistemas y procesos soportan duplicar la demanda.', score: 10 },
      { text: 'Podríamos atenderlos, pero requeriría trabajar horas extra y estrés.', score: 6 },
      { text: 'No, colapsaríamos operativamente o bajaría la calidad del servicio.', score: 2 },
      { text: 'No tenemos capacidad ni procesos listos para crecer.', score: 0 },
    ],
    tip: 'Poner más publicidad sobre un proceso desordenado solo acelera el caos. Primero asegura tus sistemas, luego escala la captación.',
  },
]

// Animated Counter with Smooth Easing
function AnimatedScore({ value }) {
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

// Ambient Floating Sparkles Component
function AmbientSparkles() {
  const sparkles = [
    { top: '15%', left: '10%', delay: 0, size: 'w-2 h-2' },
    { top: '25%', right: '12%', delay: 0.8, size: 'w-3 h-3' },
    { top: '65%', left: '8%', delay: 0.4, size: 'w-2.5 h-2.5' },
    { top: '80%', right: '15%', delay: 1.2, size: 'w-2 h-2' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-6, 6, -6],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
          style={{ top: s.top, left: s.left, right: s.right }}
          className={`absolute ${s.size} bg-[#ff4b0b] rounded-full blur-[1px] opacity-40`}
        />
      ))}
    </div>
  )
}

export default function DiagnosticoSplitStudio() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]
  const selectedOptionIndex = answers[currentQuestion?.id]

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }))
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

  // Calculate scores
  const totalScore = Object.entries(answers).reduce((acc, [qId, optIdx]) => {
    const q = QUESTIONS.find((item) => item.id === Number(qId))
    return acc + (q ? q.options[optIdx]?.score || 0 : 0)
  }, 0)

  const maxScore = QUESTIONS.length * 10
  const scorePercentage = Math.round((totalScore / maxScore) * 100)

  // Pillar calculations
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

  const getDiagnosticsResult = (score) => {
    if (score >= 80) {
      return {
        level: 'Nivel Avanzado • Infraestructura Comercial de Alto Rendimiento',
        tone: 'celebrate',
        badgeClass: 'bg-slate-950 text-white border-slate-950',
        title: '¡Excelente! Tu negocio cuenta con bases sólidas para escalar',
        summary: 'Tu propuesta de valor es clara, cuentas con canales activos y tus procesos están estructurados para operar con fluidez. Cuentas con la madurez necesaria para acelerar tu crecimiento.',
        priorityAction: 'Implementar agentes de IA conversacionales y optimización avanzada de conversión para multiplicar tu captación sin incrementar la carga de tu equipo.',
      }
    }
    if (score >= 50) {
      return {
        level: 'Nivel Intermedio • Tracción con Oportunidad de Sistematización',
        tone: 'constructive',
        badgeClass: 'bg-orange-50 text-[#ff4b0b] border-orange-200',
        title: 'Tu negocio tiene potencial y ventas: el siguiente paso es ordenar los flujos',
        summary: 'Estás generando clientes y movimiento comercial, pero gran parte del esfuerzo depende de la memoria o de tareas manuales. Existe una fuga silenciosa de prospectos que se resolvería al automatizar el seguimiento.',
        priorityAction: 'Conectar un CRM comercial automatizado, actualizar tu sitio web a una máquina de captación y estandarizar tus secuencias de cotización.',
      }
    }
    return {
      level: 'Nivel Inicial • Momento Ideal para Construir tus Cimientos',
      tone: 'supportive',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      title: 'Punto de partida estratégico: diseña tu sistema antes de acelerar',
      summary: 'Tu negocio opera de forma artesanal, lo cual es muy común en etapas de crecimiento. La gran ventaja de este diagnóstico es que identifica con claridad qué construir primero para evitar desgastes.',
      priorityAction: 'Definir con precisión tu mensaje de oferta, lanzar un canal digital profesional de confianza y crear tu primer flujo básico de seguimiento.',
    }
  }

  const result = getDiagnosticsResult(scorePercentage)

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
              LAB
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Diagnóstico de Infraestructura Comercial
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/formularios"
            className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Ver los 6 Modelos
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-130px)]">
        {/* Left Side: Real Studio Image with Clean Natural Light & High-Contrast Typography */}
        <aside className="lg:col-span-5 relative flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden border-r border-slate-200/80 bg-white">
          {/* Real Studio Photo Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('/assets/diagnostico/workspace-real.jpg')`,
              backgroundPosition: 'left center',
            }}
          />
          {/* Subtle clean gradient mask to guarantee razor-sharp contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/60 backdrop-blur-[0.5px]" />

          {/* Top Brand Context */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Diagnóstico rápido</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-slate-950 leading-[1.14]">
              ¿Qué tan preparado está tu negocio para{' '}
              <span className="text-[#ff4b0b] block mt-1">RECIBIR CLIENTES?</span>
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
              Responde unas preguntas y descubre en qué punto se encuentra tu negocio, y cuál es tu principal oportunidad de mejora.
            </p>

            {/* 3 Value Badges in Minimal Clean Style */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff4b0b] flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Toma solo 3 minutos</h4>
                  <p className="text-[11px] text-slate-500 font-medium">10 preguntas directas con opciones de 1 clic.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff4b0b] flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Recibe un resultado personalizado</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Puntaje y desglose de 4 pilares en tiempo real.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff4b0b] flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Consejos prácticos para avanzar</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Paso a paso constructivo y accionable.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-8 mt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Confidencial • Metodología Qaway Lab</span>
              </div>
              <span className="text-[11px] font-mono text-slate-950 font-extrabold">4 PILARES</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Interactive Stepper & Assessment Engine */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative">
          {!isCompleted ? (
            <>
              {/* Stepper Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200/70">
                      {currentQuestion.pilar}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">
                    {currentStep + 1} / {QUESTIONS.length}
                  </span>
                </div>

                {/* 10 Step Dots */}
                <div className="flex items-center gap-1.5 sm:gap-2 w-full mb-8">
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

                {/* Question Section with Smooth Entrance */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-slate-400 block mb-1">
                        Pregunta {currentStep + 1} de {QUESTIONS.length}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                        {currentQuestion.question}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {currentQuestion.subtitle}
                      </p>
                    </div>

                    {/* Radio Cards with Minimalist High-End Feedback */}
                    <div className="space-y-3 pt-1">
                      {currentQuestion.options.map((opt, optIndex) => {
                        const isSelected = selectedOptionIndex === optIndex
                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(optIndex)}
                            className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50/70 border-[#ff4b0b] shadow-sm ring-1 ring-[#ff4b0b]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Custom Radio Dot */}
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
                                className={`text-sm sm:text-base font-semibold block ${
                                  isSelected ? 'text-slate-950 font-bold' : 'text-slate-700'
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>

                            {isSelected && (
                              <span className="text-[11px] font-bold text-[#ff4b0b] shrink-0 bg-orange-100/70 px-2.5 py-0.5 rounded-md">
                                Seleccionado
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dynamic Bottom Tip & Navigation */}
              <div className="pt-8 space-y-6">
                {/* Dynamic Inline Pedagogical Tip */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-700 shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-amber-950 space-y-0.5">
                    <span className="font-extrabold block text-amber-950">Un consejo mientras avanzas</span>
                    <p className="leading-relaxed text-amber-900/90">{currentQuestion.tip}</p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
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
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md ${
                      selectedOptionIndex === undefined
                        ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                        : 'bg-[#ff4b0b] hover:bg-[#e04008] active:scale-[0.99] cursor-pointer shadow-orange-500/20'
                    }`}
                  >
                    <span>{currentStep === QUESTIONS.length - 1 ? 'Ver Mi Diagnóstico' : 'Siguiente'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* =============================================================
               REDESIGNED RESULTS SCREEN: ULTRA-MINIMALIST & HIGH-END MOTION
               (Zero Toxic Colors • Single Cohesive Aesthetic • Clean Typography)
               ============================================================= */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 my-auto relative"
            >
              {/* Floating Ambient Sparkles */}
              <AmbientSparkles />

              {/* Top Result Banner */}
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-2xs bg-white text-slate-900 border-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff4b0b]" />
                  <span>{result.level}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  {result.title}
                </h2>

                {/* Score Number with Smooth Counter */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-5xl sm:text-6xl font-black text-[#ff4b0b] tracking-tighter">
                    <AnimatedScore value={scorePercentage} />
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-400">
                    / 100 Puntos de Madurez Digital
                  </span>
                </div>
              </div>

              {/* Minimalist Progress Meter */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/80 relative z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#ff4b0b] h-full rounded-full"
                />
              </div>

              {/* 4 Pillars Breakdown (Monochrome & Precision Minimalist) */}
              <div className="p-6 rounded-3xl bg-slate-50/90 border border-slate-200/80 space-y-5 relative z-10">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Desglose por los 4 Pilares Comerciales
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">Evaluación individual</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pilar 1 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">1. Oferta & Mensaje</span>
                      <span className="text-slate-950 font-mono">{pillarScores.oferta}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.oferta}%` }} />
                    </div>
                  </div>

                  {/* Pilar 2 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">2. Canal Web & Branding</span>
                      <span className="text-slate-950 font-mono">{pillarScores.canal}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.canal}%` }} />
                    </div>
                  </div>

                  {/* Pilar 3 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">3. Automatización & CRM</span>
                      <span className="text-slate-950 font-mono">{pillarScores.sistemas}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#ff4b0b] h-full rounded-full" style={{ width: `${pillarScores.sistemas}%` }} />
                    </div>
                  </div>

                  {/* Pilar 4 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">4. Capacidad de Escala</span>
                      <span className="text-slate-950 font-mono">{pillarScores.escala}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-slate-900 h-full rounded-full" style={{ width: `${pillarScores.escala}%` }} />
                    </div>
                  </div>
                </div>

                {/* Summary & Priority Action */}
                <div className="pt-2 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {result.summary}
                  </p>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff4b0b] block">
                      Paso Prioritario Recomendado:
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {result.priorityAction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimalist Executive Lead Capture Box */}
              {!emailSubmitted ? (
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative z-10">
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-950">
                      ¿Deseas recibir tu reporte detallado con la hoja de ruta en PDF?
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Te enviaremos el análisis completo y las recomendaciones paso a paso para tu empresa.
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (userEmail) setEmailSubmitted(true)
                    }}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="text"
                      placeholder="Tu nombre o empresa"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-900/5 flex-1"
                    />
                    <input
                      type="email"
                      required
                      placeholder="correo@tuempresa.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-900/5 flex-1"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs sm:text-sm hover:bg-[#ff4b0b] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Reporte</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2 relative z-10">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-950">
                    ¡Reporte enviado exitosamente a {userEmail}!
                  </h4>
                  <p className="text-xs text-slate-600">
                    Revisa tu bandeja de entrada para explorar tu hoja de ruta personalizada.
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/80 relative z-10">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir Diagnóstico</span>
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    to="/estudio/consultoria"
                    className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-[#ff4b0b] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                  >
                    Agendar Sesión Estratégica Gratuita →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab • Infraestructura Digital, Inteligencia Artificial & Sistemas Comerciales
      </footer>
    </div>
  )
}
