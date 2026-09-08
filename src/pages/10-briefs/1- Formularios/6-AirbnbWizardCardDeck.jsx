import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Globe, Smartphone, ShoppingBag, Sparkles, Zap, Shield,
  ArrowRight, ArrowLeft, Check, CheckCircle2, RotateCcw,
  Palette, Bot, Database, BarChart3, Clock, HelpCircle
} from 'lucide-react'

const WIZARD_STEPS = [
  {
    step: 1,
    title: '¿Qué tipo de solución digital necesitas construir?',
    subtitle: 'Selecciona una o varias categorías principales para tu infraestructura.',
    type: 'cards-multiselect',
    options: [
      { id: 'web_corp', title: 'Sitio Web de Autoridad', desc: 'Presencia corporativa de alto impacto visual y SEO.', icon: Globe, badge: 'Recomendado' },
      { id: 'landing_ads', title: 'Landing Page de Captación', desc: 'Optimizada para convertir tráfico de anuncios y campañas.', icon: Zap, badge: 'Alta Conversión' },
      { id: 'ecommerce', title: 'Tienda Online & Catálogo', desc: 'Venta directa de productos con pagos integrados.', icon: ShoppingBag, badge: 'E-commerce' },
      { id: 'custom_saas', title: 'Plataforma Web / SaaS', desc: 'Software interno o portal de clientes a medida.', icon: Database, badge: 'Avanzado' },
      { id: 'ai_agents', title: 'Agentes de Inteligencia Artificial', desc: 'Automatización conversacional para WhatsApp y web.', icon: Bot, badge: 'Innovación' },
      { id: 'branding_pack', title: 'Rediseño de Identidad & Marca', desc: 'Logotipo, tipografías, guía de estilo y estética.', icon: Palette, badge: 'Branding' },
    ],
  },
  {
    step: 2,
    title: '¿Cuál es el estado actual de tus activos digitales?',
    subtitle: 'Elige la opción que mejor describa el punto de partida.',
    type: 'cards-single',
    options: [
      { id: 'zero', title: 'Empezando desde cero', desc: 'No tenemos presencia digital previa ni identidad estructurada.', icon: Sparkles },
      { id: 'redesign', title: 'Tenemos web pero requiere rediseño', desc: 'La plataforma actual quedó desactualizada o lenta.', icon: Globe },
      { id: 'migration', title: 'Escalamiento y automatizaciones', desc: 'Tenemos ventas pero necesitamos ordenar procesos y CRM.', icon: BarChart3 },
    ],
  },
  {
    step: 3,
    title: '¿Qué nivel de acompañamiento buscas?',
    subtitle: 'Desde entrega llave en mano hasta co-creación continua.',
    type: 'cards-single',
    options: [
      { id: 'turnkey', title: 'Llave en Mano (Entrega 100% Completa)', desc: 'Qaway Lab se encarga de arquitectura, diseño, código y puesta en marcha.', icon: Shield, badge: 'Más Solicitado' },
      { id: 'sprint', title: 'Sprint Ágil (Entrega en 3 semanas)', desc: 'Despliegue rápido enfocado en las funciones esenciales para salir al mercado.', icon: Zap },
      { id: 'retainer', title: 'Socio Tecnológico Continuo', desc: 'Desarrollo, mantenimiento y optimización mensual de conversiones.', icon: Bot },
    ],
  },
  {
    step: 4,
    title: 'Confirmación & Resumen del Proyecto',
    subtitle: 'Revisa las selecciones de tu ecosistema antes de enviar.',
    type: 'summary',
  },
]

export default function AirbnbWizardCardDeck() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selections, setSelections] = useState({
    solutions: ['web_corp', 'ai_agents'],
    currentState: 'redesign',
    supportLevel: 'turnkey',
    clientEmail: '',
    clientName: '',
  })
  const [isSent, setIsSent] = useState(false)

  const activeStepData = WIZARD_STEPS[currentStep - 1]

  const handleToggleMulti = (optionId) => {
    setSelections((prev) => {
      const current = prev.solutions
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      return { ...prev, solutions: next }
    })
  }

  const handleSelectSingle = (field, optionId) => {
    setSelections((prev) => ({ ...prev, [field]: optionId }))
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep((p) => p + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1)
    }
  }

  const handleReset = () => {
    setSelections({
      solutions: ['web_corp'],
      currentState: 'zero',
      supportLevel: 'turnkey',
      clientEmail: '',
      clientName: '',
    })
    setCurrentStep(1)
    setIsSent(false)
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-black tracking-tight text-slate-950">QAWAY</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff4b0b] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              CARD DECK WIZARD
            </span>
          </Link>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
            Formulario 06: Deck Visual & Floating Stepper (Estilo Airbnb Onboarding)
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

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 pb-32 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Step Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff4b0b]">
                Paso {currentStep} de {WIZARD_STEPS.length}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                {activeStepData.title}
              </h1>
              <p className="text-sm text-slate-500">
                {activeStepData.subtitle}
              </p>
            </div>

            {/* Step 1: High-Density Card Grid (Multiselect) */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStepData.options.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = selections.solutions.includes(opt.id)

                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleMulti(opt.id)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-slate-950 shadow-lg ring-1 ring-slate-950'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {opt.badge && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-[#ff4b0b] border border-orange-200">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-950">{opt.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? 'text-slate-950' : 'text-slate-400'}>
                          {isSelected ? 'Seleccionado' : 'Hacer clic para sumar'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Step 2: Single Selection */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {activeStepData.options.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = selections.currentState === opt.id

                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectSingle('currentState', opt.id)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-slate-950 shadow-lg ring-1 ring-slate-950'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-950">{opt.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? 'text-slate-950' : 'text-slate-400'}>
                          {isSelected ? 'Elegido' : 'Seleccionar'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Step 3: Support Level */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {activeStepData.options.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = selections.supportLevel === opt.id

                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectSingle('supportLevel', opt.id)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-slate-950 shadow-lg ring-1 ring-slate-950'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {opt.badge && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-950">{opt.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? 'text-slate-950' : 'text-slate-400'}>
                          {isSelected ? 'Elegido' : 'Seleccionar'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Step 4: Summary & Final Submission */}
            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
                {!isSent ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (selections.clientEmail) setIsSent(true)
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-extrabold text-slate-950">Resumen de tu Configuración</h3>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Soluciones elegidas:</span>
                          <span className="font-bold text-slate-900">{selections.solutions.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Punto de partida:</span>
                          <span className="font-bold text-slate-900">{selections.currentState}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Modalidad de servicio:</span>
                          <span className="font-bold text-slate-900">{selections.supportLevel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700">Tus datos de contacto para enviarte la propuesta:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Tu nombre completo"
                          value={selections.clientName}
                          onChange={(e) => setSelections((p) => ({ ...p, clientName: e.target.value }))}
                          className="px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                        />
                        <input
                          type="email"
                          required
                          placeholder="tu.correo@empresa.com"
                          value={selections.clientEmail}
                          onChange={(e) => setSelections((p) => ({ ...p, clientEmail: e.target.value }))}
                          className="px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-[#ff4b0b] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Finalizar y Recibir Propuesta Detallada</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-2xl font-black text-slate-950">¡Configuración enviada con éxito!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Hemos recibido tus especificaciones. Te enviaremos el desglose técnico y financiero a {selections.clientEmail}.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-4 text-xs font-bold text-slate-900 hover:text-[#ff4b0b] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Comenzar otra configuración</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Stepper Bar */}
      {currentStep < 4 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-6 z-40 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                currentStep === 1
                  ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    stepNum === currentStep
                      ? 'bg-slate-950 w-6'
                      : stepNum < currentStep
                      ? 'bg-slate-400'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-[#ff4b0b] text-white transition-all shadow-md cursor-pointer"
            >
              <span>{currentStep === 3 ? 'Revisar Resumen' : 'Continuar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
