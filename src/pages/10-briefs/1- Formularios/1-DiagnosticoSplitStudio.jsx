import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Clock, Award, Lightbulb, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, RotateCcw, Send, ShieldCheck, HelpCircle, BarChart3
} from 'lucide-react'

const QUESTIONS = [
  {
    id: 1,
    question: '¿Tu oferta se entiende fácilmente?',
    subtitle: 'Una persona que no te conoce debería poder entender en pocos segundos qué ofreces, para quién es y qué problema resuelve.',
    options: [
      { text: 'Sí, se entiende claramente y genera interés de inmediato.', score: 10 },
      { text: 'Se entiende, pero a veces genera dudas o pide muchas explicaciones.', score: 6 },
      { text: 'No del todo, suele generar confusión o preguntas repetitivas.', score: 3 },
      { text: 'No estoy seguro(a), nunca lo hemos medido formalmente.', score: 1 },
    ],
    tip: 'Piensa en alguien que no te conoce. ¿Comprendería tu propuesta de valor solo viendo tu web o redes sociales en 5 segundos?',
  },
  {
    id: 2,
    question: '¿Tienes un canal digital principal optimizado para convertir?',
    subtitle: 'Tu sitio web o landing page debe estar diseñado para guiar al visitante hacia una acción clara y medible.',
    options: [
      { text: 'Sí, contamos con una web moderna que recibe y califica prospectos.', score: 10 },
      { text: 'Tenemos web, pero es más informativa y convierte poco.', score: 5 },
      { text: 'Solo dependemos de redes sociales y mensajes directos por WhatsApp.', score: 3 },
      { text: 'No contamos con presencia web estructurada actualmente.', score: 0 },
    ],
    tip: 'Un sitio web profesional actúa como tu mejor vendedor: trabaja 24/7 filtrando y educando a tus clientes potenciales.',
  },
  {
    id: 3,
    question: '¿Cómo gestionas el seguimiento de prospectos y cotizaciones?',
    subtitle: 'El tiempo de respuesta y la trazabilidad son factores decisivos para cerrar ventas de alto valor.',
    options: [
      { text: 'Usamos un CRM centralizado con automatizaciones y recordatorios.', score: 10 },
      { text: 'Registramos en hojas de cálculo (Excel/Sheets) o Notion.', score: 6 },
      { text: 'Todo queda en chats de WhatsApp y la memoria del equipo.', score: 2 },
      { text: 'No hacemos seguimiento estructurado a los que no compran de inmediato.', score: 0 },
    ],
    tip: 'El 80% de las ventas ocurren entre el 5to y 12vo contacto. Sin un sistema, esos prospectos se pierden.',
  },
  {
    id: 4,
    question: '¿Tu identidad visual transmite el nivel de precios que cobras?',
    subtitle: 'El branding profesional reduce la fricción de precio y genera confianza inmediata en el cliente ideal.',
    options: [
      { text: 'Totalmente: nuestra imagen proyecta autoridad, calidad y sofisticación.', score: 10 },
      { text: 'Es aceptable, pero sentimos que nuestros servicios son superiores a como nos vemos.', score: 5 },
      { text: 'Está desactualizada o armada con plantillas genéricas.', score: 2 },
      { text: 'Aún no tenemos una línea gráfica definida y profesional.', score: 0 },
    ],
    tip: 'La percepción visual de una marca define cuánto está dispuesto a pagar un cliente antes de hablar contigo.',
  },
  {
    id: 5,
    question: '¿Cuentas con procesos automatizados en tu captación?',
    subtitle: 'Respuestas automáticas inteligentes, agendamiento de reuniones y calificación previa sin intervención manual.',
    options: [
      { text: 'Sí, el prospecto agenda y califica de forma 100% automatizada.', score: 10 },
      { text: 'Tenemos algunas respuestas automáticas básicas en WhatsApp o email.', score: 5 },
      { text: 'Todo el proceso de agendamiento y respuesta es manual.', score: 2 },
      { text: 'No tenemos ningún tipo de automatización configurada.', score: 0 },
    ],
    tip: 'Reducir el tiempo de primera respuesta a menos de 5 minutos multiplica por 7 la probabilidad de calificar un lead.',
  },
  {
    id: 6,
    question: '¿Tienes claridad sobre el perfil de tu cliente ideal (ICP)?',
    subtitle: 'Saber exactamente a quién le hablas permite enfocar el presupuesto en prospectos rentables.',
    options: [
      { text: 'Sí, tenemos buyer personas documentados con dolores y motivaciones claras.', score: 10 },
      { text: 'Tenemos una idea general, pero atendemos a casi cualquier cliente que llegue.', score: 5 },
      { text: 'Nos cuesta definir a qué clientes decirles que no.', score: 2 },
      { text: 'No lo tenemos definido.', score: 0 },
    ],
    tip: 'Intentar hablarle a todo el mundo hace que tu mensaje no resuene con nadie en particular.',
  },
  {
    id: 7,
    question: '¿Mides tus métricas de adquisición y conversión mensualmente?',
    subtitle: 'Saber cuánto te cuesta adquirir un cliente (CAC) y el porcentaje de cierre te permite escalar con seguridad.',
    options: [
      { text: 'Sí, revisamos dashboards de conversión, tráfico y ROI periódicamente.', score: 10 },
      { text: 'Miramos métricas básicas de redes sociales (likes, seguidores, alcance).', score: 4 },
      { text: 'Solo revisamos los ingresos totales a fin de mes.', score: 2 },
      { text: 'No medimos datos de adquisición digital actualmente.', score: 0 },
    ],
    tip: 'Los likes son métricas de vanidad; los clientes calificados y las conversiones son métricas de salud de negocio.',
  },
  {
    id: 8,
    question: '¿Tu equipo cuenta con herramientas internas para no duplicar tareas?',
    subtitle: 'Sistemas que conectan ventas, entrega de servicios y facturación para operar sin caos.',
    options: [
      { text: 'Sí, tenemos un ecosistema integrado donde la información fluye sola.', score: 10 },
      { text: 'Usamos varias herramientas, pero no están conectadas entre sí.', score: 5 },
      { text: 'Dependemos de mensajes constantes y reuniones para coordinar.', score: 2 },
      { text: 'Todo es manual y se generan cuellos de botella frecuentes.', score: 0 },
    ],
    tip: 'Un negocio ordenado internamente transmite tranquilidad y solidez al cliente exterior.',
  },
  {
    id: 9,
    question: '¿Generas contenido de autoridad que eduque a tus prospectos?',
    subtitle: 'Casos de estudio, artículos técnicos, testimonios y demostraciones de tus resultados.',
    options: [
      { text: 'Sí, creamos activos de contenido que resuelven dudas antes de la llamada de venta.', score: 10 },
      { text: 'Publicamos con frecuencia en redes, pero sin una estrategia de ventas clara.', score: 5 },
      { text: 'Publicamos de forma esporádica cuando tenemos tiempo libre.', score: 2 },
      { text: 'No generamos contenido ni mostramos casos de éxito.', score: 0 },
    ],
    tip: 'El contenido educativo acorta el ciclo de ventas porque el cliente llega convencido de tu experiencia.',
  },
  {
    id: 10,
    question: '¿Tu negocio puede recibir el doble de clientes hoy sin colapsar?',
    subtitle: 'Capacidad operativa, infraestructura digital y sistemas preparados para escalar.',
    options: [
      { text: 'Sí, nuestros sistemas y procesos soportan duplicar la demanda.', score: 10 },
      { text: 'Podríamos atenderlos, pero requeriría trabajar horas extra y generaría estrés.', score: 5 },
      { text: 'No, colapsaríamos operativamente o la calidad del servicio caería.', score: 2 },
      { text: 'No tenemos capacidad ni procesos listos para crecer.', score: 0 },
    ],
    tip: 'Escalar sin sistemas previos solo multiplica el desorden. Primero optimiza el flujo, luego acelera la captación.',
  },
]

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

  // Calculate score
  const totalScore = Object.entries(answers).reduce((acc, [qId, optIdx]) => {
    const q = QUESTIONS.find((item) => item.id === Number(qId))
    return acc + (q ? q.options[optIdx]?.score || 0 : 0)
  }, 0)

  const maxScore = QUESTIONS.length * 10
  const scorePercentage = Math.round((totalScore / maxScore) * 100)

  const getDiagnosticsResult = (score) => {
    if (score >= 80) {
      return {
        level: 'Nivel Avanzado • Sistema de Alto Rendimiento',
        color: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        summary: 'Tu negocio cuenta con bases sólidas, procesos automatizados y una propuesta de valor clara. Estás listo para escalar tráfico y expandir tu presencia comercial.',
        nextStep: 'Optimizar conversiones avanzadas e implementar agentes de IA para escalar sin aumentar costos operativos.',
      }
    }
    if (score >= 50) {
      return {
        level: 'Nivel Intermedio • Oportunidad de Consolidación',
        color: 'text-orange-600',
        badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
        summary: 'Tienes tracción y clientes, pero dependes de esfuerzos manuales y canales no conectados. Existe una gran fuga de prospectos por falta de automatización y seguimiento sistemático.',
        nextStep: 'Implementar un embudo de captación estructurado, un CRM automatizado y refinar la identidad visual de tu oferta.',
      }
    }
    return {
      level: 'Nivel Inicial • Urgencia de Estructuración',
      color: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      summary: 'Tu negocio opera con procesos artesanales y dispersos. Cada nuevo cliente requiere mucho desgaste manual y el mensaje comercial no está convirtiendo con claridad.',
      nextStep: 'Definir tu mensaje de valor, construir un canal digital profesional y crear tu primer sistema de captación.',
    }
  }

  const result = getDiagnosticsResult(scorePercentage)

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Header bar */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
              LAB
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Formulario 01: Diagnóstico Split Studio
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

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-130px)]">
        {/* Left Side: Brand Context & Value Proposition (Hero Split) */}
        <aside className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle lighting accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4b0b]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Top content */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold tracking-wide backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnóstico Rápido de Negocio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12]">
              ¿Qué tan preparado está tu negocio para{' '}
              <span className="text-[#ff4b0b] block mt-1">RECIBIR CLIENTES?</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Responde unas preguntas estratégicas y descubre en qué punto se encuentra la infraestructura digital de tu empresa, y cuál es tu principal oportunidad de mejora.
            </p>

            {/* Benefit badges */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#ff4b0b] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Toma solo 3 minutos</h4>
                  <p className="text-[11px] text-slate-400">10 preguntas directas con opciones de 1 clic.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Recibe un resultado personalizado</h4>
                  <p className="text-[11px] text-slate-400">Puntaje real y reporte de madurez en tiempo real.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Consejos prácticos para avanzar</h4>
                  <p className="text-[11px] text-slate-400">Guía paso a paso adaptada a tu situación actual.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Mockup */}
          <div className="relative z-10 pt-8 mt-8 border-t border-white/10">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Confidencial • Sin compromisos</span>
              </div>
              <span className="text-[11px] font-bold text-orange-400">QAWAY LAB OS</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Dynamic Interactive Form & Stepper */}
        <section className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
          {!isCompleted ? (
            <>
              {/* Stepper Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pregunta {currentStep + 1} de {QUESTIONS.length}
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
                            : 'bg-slate-200'
                        }`}
                      />
                    )
                  })}
                </div>

                {/* Question Details with Smooth Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                        {currentQuestion.question}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
                        {currentQuestion.subtitle}
                      </p>
                    </div>

                    {/* Radio Cards with High-End Micro-interactions */}
                    <div className="space-y-3 pt-2">
                      {currentQuestion.options.map((opt, optIndex) => {
                        const isSelected = selectedOptionIndex === optIndex
                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(optIndex)}
                            className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 group cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50/60 border-[#ff4b0b] shadow-sm ring-1 ring-[#ff4b0b]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Custom Radio Button Dot */}
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-[#ff4b0b] bg-white'
                                    : 'border-slate-300 group-hover:border-slate-400'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff4b0b]" />
                                )}
                              </div>
                              <span
                                className={`text-sm sm:text-base font-semibold ${
                                  isSelected ? 'text-slate-950' : 'text-slate-700'
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold transition-opacity ${
                                isSelected ? 'text-[#ff4b0b] opacity-100' : 'opacity-0 text-slate-400'
                              }`}
                            >
                              Seleccionado
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-8 space-y-6">
                {/* Dynamic Inline Tip */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-amber-900 space-y-0.5">
                    <span className="font-bold block text-amber-950">Un consejo mientras avanzas</span>
                    <p className="leading-relaxed">{currentQuestion.tip}</p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-colors ${
                      currentStep === 0
                        ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
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
                    className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                      selectedOptionIndex === undefined
                        ? 'bg-slate-300 opacity-60 cursor-not-allowed'
                        : 'bg-[#ff4b0b] hover:bg-[#e04008] active:scale-[0.99] cursor-pointer shadow-orange-500/20'
                    }`}
                  >
                    <span>{currentStep === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Siguiente'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Results & Diagnostic Score Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 my-auto"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Diagnóstico Completado con Éxito</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Puntaje de Madurez Digital: <span className="text-[#ff4b0b]">{scorePercentage} / 100</span>
                </h2>
                <div className={`inline-block px-3.5 py-1.5 rounded-xl border text-xs font-bold ${result.badgeBg}`}>
                  {result.level}
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-orange-500 to-[#ff4b0b] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnóstico Clínico</h4>
                  <p className="mt-1 text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff4b0b]">Paso Estratégico Recomendado</h4>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed font-semibold">
                    {result.nextStep}
                  </p>
                </div>
              </div>

              {/* Lead Capture or Direct Consultation */}
              {!emailSubmitted ? (
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-950">
                      ¿Quieres recibir tu reporte detallado con el plan de acción en PDF?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ingresa tu correo y te enviaremos el desglose de los 10 puntos auditados.
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (userEmail) setEmailSubmitted(true)
                    }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Tu nombre o empresa"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff4b0b] flex-1"
                    />
                    <input
                      type="email"
                      required
                      placeholder="correo@tuempresa.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#ff4b0b] flex-1"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-[#ff4b0b] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Reporte</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-extrabold text-emerald-950">
                    ¡Reporte enviado exitosamente a {userEmail}!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Revisa tu bandeja de entrada para ver tu hoja de ruta personalizada.
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
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
                    className="px-6 py-3 rounded-xl bg-[#ff4b0b] text-white font-bold text-xs sm:text-sm hover:bg-[#e04008] transition-colors shadow-sm"
                  >
                    Agendar Sesión Estratégica Gratuita →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
        Qaway Lab • Infraestructura Digital, Inteligencia Artificial & Sistemas Comerciales
      </footer>
    </div>
  )
}
