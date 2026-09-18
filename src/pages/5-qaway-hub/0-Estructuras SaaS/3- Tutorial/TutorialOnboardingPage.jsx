import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, X, Mail, CheckSquare } from 'lucide-react'

// 1. Mascota Oficial Qaway Lab (React 19 + Framer Motion + SVG Vectorial)
function QawayMascot({ mood }) {
  const happy = mood === 'happy'

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      animate={happy ? { y: [0, -14, 2, 0], scale: [1, 1.05, 1] } : { y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <svg className="w-[110px] h-[110px] overflow-visible" viewBox="0 0 640 640" aria-label="Mascota Qaway Lab">
        <defs>
          <linearGradient id="qfur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".62" stopColor="#e9edf2" />
            <stop offset="1" stopColor="#aeb9c6" />
          </linearGradient>
          <linearGradient id="qtail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7a18" />
            <stop offset=".5" stopColor="#ff4b0b" />
            <stop offset="1" stopColor="#9b2c11" />
          </linearGradient>
        </defs>

        {/* Cola */}
        <motion.g
          animate={happy ? { rotate: [0, 14, -12, 10, 0] } : { rotate: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M426 430 C515 386 552 442 507 492 C478 524 442 505 425 478 C470 486 489 457 475 445 C463 435 447 439 426 452Z"
            fill="url(#qtail)"
            stroke="#0f172a"
            strokeWidth="7"
          />
        </motion.g>

        {/* Cuerpo */}
        <path
          d="M250 348 C231 384 226 457 247 507 C260 538 286 550 320 550 C354 550 380 538 393 507 C414 457 409 384 390 348 C363 326 277 326 250 348Z"
          fill="url(#qfur)"
          stroke="#0f172a"
          strokeWidth="8"
        />

        {/* Brazos */}
        <motion.path
          d="M250 370 C218 375 195 405 181 433"
          fill="none"
          stroke="#d8dee5"
          strokeWidth="28"
          strokeLinecap="round"
          animate={happy ? { rotate: -18, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'right center' }}
        />
        <motion.path
          d="M390 370 C422 375 445 405 459 433"
          fill="none"
          stroke="#d8dee5"
          strokeWidth="28"
          strokeLinecap="round"
          animate={happy ? { rotate: 18, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
        />

        {/* Cabeza + orejas */}
        <motion.g
          animate={happy ? { rotate: [0, -3, 3, 0], scale: [1, 1.03, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path d="M225 218 L199 92 C197 78 212 73 222 83 L283 151Z" fill="url(#qfur)" stroke="#0f172a" strokeWidth="8" />
          <path d="M415 218 L441 92 C443 78 428 73 418 83 L357 151Z" fill="url(#qfur)" stroke="#0f172a" strokeWidth="8" />
          <path d="M218 158 L213 111 L248 150Z" fill="#ff4b0b" />
          <path d="M422 158 L427 111 L392 150Z" fill="#ff4b0b" />

          <path d="M205 145 H435 V335 H205Z" rx="82" fill="#111827" stroke="#0f172a" strokeWidth="8" />

          <AnimatePresence initial={false} mode="wait">
            {!happy ? (
              <motion.g key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ellipse cx="280" cy="235" rx="13" ry="25" fill="#ff7a18" />
                <ellipse cx="360" cy="235" rx="13" ry="25" fill="#ff7a18" />
                <circle cx="280" cy="232" r="5" fill="#fff" />
                <circle cx="360" cy="232" r="5" fill="#fff" />
                <path d="M308 274 Q320 281 332 274" fill="none" stroke="#ff7a18" strokeWidth="7" strokeLinecap="round" />
              </motion.g>
            ) : (
              <motion.g key="happy" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <path d="M260 241 Q280 218 300 241" fill="none" stroke="#ff7a18" strokeWidth="10" strokeLinecap="round" />
                <path d="M340 241 Q360 218 380 241" fill="none" stroke="#ff7a18" strokeWidth="10" strokeLinecap="round" />
                <path d="M296 269 Q320 305 344 269 Q342 306 320 311 Q298 306 296 269Z" fill="#ff6f7e" stroke="#ff7a18" strokeWidth="6" />
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>

        {/* Emblema Qaway */}
        <g transform="translate(320 425)">
          <rect x="-31" y="-31" width="62" height="62" rx="15" fill="#fff" opacity=".72" />
          <path
            d="M-22-10 L-9-24 L4-10 L-9 4Z M9-10 L22-24 L35-10 L22 4Z M-9 8 L4-6 L17 8 L4 22Z M-35 8 L-22-6 L-9 8 L-22 22Z"
            fill="#ff4b0b"
            transform="translate(-4 -1) scale(.72)"
          />
        </g>
      </svg>

      <AnimatePresence>
        {happy && (
          <>
            <motion.span
              className="absolute left-[8%] top-[10%] text-[#ff4b0b] font-black text-2xl"
              initial={{ opacity: 0, scale: 0.4, y: 8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 1], y: [8, -20, -32] }}
              transition={{ duration: 0.7 }}
            >
              *
            </motion.span>
            <motion.span
              className="absolute right-[12%] top-[8%] text-[#ff7a18] font-black text-xl"
              initial={{ opacity: 0, scale: 0.4, y: 8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 1], y: [8, -16, -28] }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              *
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 2. Mascota Husky Original de Trello (Recreada en vector exacto)
function HuskyMascot({ mood }) {
  const happy = mood === 'happy'

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      animate={happy ? { y: [0, -10, 2, 0], scale: [1, 1.06, 1] } : { y: 0, scale: 1 }}
      transition={{ duration: 0.52, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <svg className="w-[110px] h-[110px] overflow-visible" viewBox="0 0 160 160" aria-label="Mascota Husky Trello">
        <defs>
          <linearGradient id="hfur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4f7fb" />
            <stop offset=".48" stopColor="#c7d0db" />
            <stop offset="1" stopColor="#8d9aa8" />
          </linearGradient>
        </defs>
        <path
          d="M42 53 L37 19 Q36 11 44 15 L65 34 Q80 27 95 34 L117 15 Q125 11 124 20 L120 54 Q134 70 130 91 Q125 120 80 126 Q35 120 30 91 Q26 70 42 53Z"
          fill="url(#hfur)"
          stroke="#fff"
          strokeWidth="4"
        />
        <path d="M44 55 Q62 38 80 41 Q98 38 116 55 L108 103 Q99 121 80 123 Q61 121 52 103Z" fill="#f8fbff" />
        <path d="M49 49 Q60 36 70 39 L62 69 L45 73Z" fill="#596b7d" />
        <path d="M111 49 Q100 36 90 39 L98 69 L115 73Z" fill="#596b7d" />
        <ellipse cx="60" cy="75" rx="7" ry="9" fill="#fff" />
        <ellipse cx="100" cy="75" rx="7" ry="9" fill="#fff" />
        <ellipse cx="61" cy="76" rx="3" ry="5" fill="#1592d0" />
        <ellipse cx="99" cy="76" rx="3" ry="5" fill="#1592d0" />
        <circle cx="61" cy="76" r="1.5" fill="#172b4d" />
        <circle cx="99" cy="76" r="1.5" fill="#172b4d" />
        <path d="M69 93 Q80 84 91 93 Q89 107 80 109 Q71 107 69 93Z" fill="#263746" />
        <path d="M72 99 Q80 104 88 99 Q86 111 80 113 Q74 111 72 99Z" fill="#ef6b79" />
        <path d="M50 104 Q80 119 110 104" fill="none" stroke="#6b7885" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 91 Q21 93 15 86" fill="none" stroke="#f4f7fb" strokeWidth="7" strokeLinecap="round" />
        <path d="M126 91 Q139 93 145 86" fill="none" stroke="#f4f7fb" strokeWidth="7" strokeLinecap="round" />
        <path d="M68 32 Q80 43 92 32" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

export default function TutorialOnboardingPage() {
  const [showCookie, setShowCookie] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [mascotMood, setMascotMood] = useState('normal')
  const [mascotType, setMascotType] = useState('qaway') // 'qaway' | 'husky'
  const [isDismissed, setIsDismissed] = useState(false)
  const [bubbleText, setBubbleText] = useState('¡Hola!')

  const handleStart = () => {
    setMascotMood('happy')
    setBubbleText('¡Vamos!')
    setTimeout(() => {
      setMascotMood('normal')
      setBubbleText(mascotType === 'qaway' ? '¡Productivo!' : '¡Guau!')
    }, 1800)
  }

  const handleStepPrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleStepNext = () => {
    setCurrentStep((prev) => Math.min(4, prev + 1))
  }

  if (isDismissed) {
    return (
      <div className="min-h-screen bg-[#0f3d82] text-white flex flex-col items-center justify-center p-6 text-center antialiased">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#78aef6]" />
          </div>
          <h2 className="text-3xl font-light tracking-tight">Recorrido completado o cerrado</h2>
          <p className="text-white/75 text-sm leading-relaxed">
            Has explorado la maqueta interactiva en React de la experiencia de Onboarding canónica de Qaway Lab.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsDismissed(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#76aef7] text-[#0b2347] px-6 py-2.5 text-sm font-bold shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Tutorial</span>
            </button>
            <Link
              to="/hub"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Hub</span>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="tutorial-onboarding-scope min-h-screen bg-gradient-to-b from-[#0f3d82] to-[#174d96] text-white selection:bg-[#ff4b0b] selection:text-white antialiased overflow-x-hidden">
      <style>{`
        .tutorial-onboarding-scope {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Arial, sans-serif;
        }
        @keyframes pulseHalo {
          0% { transform: scale(0.75); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        .tutorial-onboarding-scope .pulse-halo {
          animation: pulseHalo 1.8s ease-out infinite;
        }
        @keyframes cursorFloat {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-25px, -35px); }
          100% { transform: translate(0, 0); }
        }
        .tutorial-onboarding-scope .cursor-virtual {
          animation: cursorFloat 4s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Barra de Cookies Superior */}
      <AnimatePresence>
        {showCookie && (
          <motion.header
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#321f3b] border-b border-white/15 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#eee] z-50 relative"
          >
            <div className="flex-1 max-w-4xl text-left leading-relaxed">
              Esta aplicación utiliza cookies para mejorar tu experiencia de navegación, realizar análisis y gestionar preferencias.{' '}
              <span className="text-[#9fc2ff] underline cursor-pointer hover:text-white">Aviso de cookies y seguimiento</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="h-8 px-3 rounded-md border border-white/20 hover:bg-white/10 text-xs text-white/90 transition-colors cursor-pointer"
              >
                Preferencias
              </button>
              <button
                type="button"
                className="h-8 px-3 rounded-md border border-white/20 hover:bg-white/10 text-xs text-white/90 transition-colors cursor-pointer"
              >
                Solo necesarias
              </button>
              <button
                type="button"
                onClick={() => setShowCookie(false)}
                className="h-8 px-3.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                ✓ Aceptar todas
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 2. Barra de Navegación / TopBar con Stepper */}
      <nav className="h-[80px] sm:h-[86px] bg-[#163c75] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <Link
            to="/hub"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78aef6] hover:text-white transition-colors mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hub</span>
          </Link>

          <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-semibold tracking-tight">
            <div className="w-[19px] h-[19px] border-[3px] border-white rounded-[3px] relative">
              <div className="absolute left-[3px] top-[2px] w-[3px] h-[8px] bg-white rounded-[1px]" />
            </div>
            <span>CRM</span>
          </div>

          {/* Switcher de Mascota (Qaway vs Husky) */}
          <div className="hidden lg:flex items-center gap-1.5 ml-6 bg-black/20 p-1 rounded-full border border-white/15 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setMascotType('qaway')
                setBubbleText('¡Qaway!')
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                mascotType === 'qaway' ? 'bg-[#ff4b0b] text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
            >
              Mascota Qaway Lab
            </button>
            <button
              type="button"
              onClick={() => {
                setMascotType('husky')
                setBubbleText('¡Guau!')
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                mascotType === 'husky' ? 'bg-[#76aef7] text-[#0b2347] shadow-xs' : 'text-white/60 hover:text-white'
              }`}
            >
              Mascota Husky Trello
            </button>
          </div>
        </div>

        {/* Stepper Central Atlassian */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={handleStepPrev}
            className="text-2xl text-[#78aef6] hover:text-white transition-colors cursor-pointer px-1 font-light"
            aria-label="Paso anterior"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(step)}
                className={`h-[9px] rounded-full transition-all cursor-pointer ${
                  currentStep === step
                    ? 'w-[36px] sm:w-[53px] bg-[#79aef5] opacity-100 shadow-[0_0_8px_rgba(121,174,245,0.6)]'
                    : 'w-[18px] sm:w-[24px] bg-white/30 opacity-60 hover:opacity-100'
                }`}
                title={`Ir al paso ${step}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleStepNext}
            className="text-2xl text-[#78aef6] hover:text-white transition-colors cursor-pointer px-1 font-light"
            aria-label="Paso siguiente"
          >
            →
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-2xl text-[#d7e2f1] hover:text-white transition-colors cursor-pointer p-2"
          aria-label="Cerrar tutorial"
        >
          <X className="w-6 h-6" />
        </button>
      </nav>

      {/* 3. Hero y Escenografía Dimensional */}
      <main className="min-h-[calc(100vh-86px)] px-4 sm:px-8 py-10 sm:py-16 flex flex-col items-center relative overflow-hidden">
        {/* Halo de iluminación volumétrica */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[720px] h-[500px] bg-[radial-gradient(circle_at_50%_40%,rgba(62,124,209,0.22),transparent_65%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl z-10 space-y-5"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.18] tracking-[-0.03em] text-balance">
            ¡Vas por el camino adecuado para mejorar tu productividad!
          </h1>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-lg bg-[#76aef7] text-[#0b2347] px-6 py-3 text-base font-bold shadow-[0_2px_12px_rgba(0,0,0,0.25)] hover:brightness-105 hover:-translate-y-0.5 transition-all cursor-pointer active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>¡Una última cosa!</span>
            </button>
          </div>
        </motion.div>

        {/* Escenario Tridimensional (Scene) */}
        <section className="w-full max-w-[1400px] h-[610px] mt-12 sm:mt-16 relative z-10" aria-label="Escenario interactivo">
          {/* Panel Izquierdo: Bandeja de Entrada */}
          <motion.aside
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.75, 0.2, 1] }}
            className="absolute left-0 top-0 w-full lg:w-[372px] h-[610px] rounded-t-[18px] bg-[#172b4d] border-2 border-black/30 shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col"
          >
            <div className="h-[61px] bg-[#232323] flex items-center gap-3 px-5 text-lg font-bold text-white shrink-0">
              <div className="w-[18px] h-[15px] border-2 border-[#d5d9df] rounded-[3px] relative">
                <div className="absolute left-[3px] right-[3px] top-[4px] h-[2px] bg-[#d5d9df]" />
              </div>
              <span>Bandeja de entrada</span>
            </div>

            <div className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div className="h-[42px] bg-[#242424] rounded-lg px-4 flex items-center text-sm font-medium text-[#e6e9ef] shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:border border-white/10 transition-all cursor-pointer">
                Proyecto contenido
              </div>

              <div className="bg-[#242424] rounded-lg p-3.5 text-sm text-[#e6e9ef] shadow-[0_2px_4px_rgba(0,0,0,0.3)] space-y-2.5">
                <p className="leading-snug text-white/90">Míralo, envíalo, guárdalo para más tarde</p>
                <div className="flex items-center gap-3 text-sm text-[#aeb8c8] pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">✉︎ Mensaje</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">☷ Tablero</span>
                </div>
              </div>

              {/* Tareas demostrativas de Qaway Lab */}
              <div className="h-[42px] bg-[#202f45] rounded-lg px-4 flex items-center justify-between text-xs text-slate-300 shadow-xs border border-white/5">
                <span>Estrategia de lanzamiento Q3</span>
                <span className="text-[10px] uppercase font-bold text-[#ff7a18]">Alta</span>
              </div>
              <div className="h-[42px] bg-[#202f45] rounded-lg px-4 flex items-center justify-between text-xs text-slate-300 shadow-xs border border-white/5">
                <span>Automatización WhatsApp CRM</span>
                <span className="text-[10px] uppercase font-bold text-[#10b981]">Listo</span>
              </div>
            </div>
          </motion.aside>

          {/* Panel Derecho: Tablero Púrpura (Board) */}
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.75, 0.2, 1] }}
            className="hidden lg:block absolute left-[405px] right-0 top-0 h-[610px] rounded-t-[18px] bg-gradient-to-r from-[#c05ad5] via-[#bb5dc9] to-[#a947a8] border-2 border-black/20 shadow-[0_10px_35px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Cabecera del Tablero */}
            <div className="h-[60px] px-6 flex items-center text-lg font-semibold text-[#171321] bg-black/5">
              <span>Mi tablero de CRM</span>
              <div className="flex gap-2 ml-5">
                <span className="w-[88px] h-[17px] rounded-full bg-white/20" />
                <span className="w-[64px] h-[17px] rounded-full bg-white/20" />
              </div>
              <div className="ml-auto flex gap-1.5">
                <span className="w-[26px] h-[26px] rounded-full bg-white/20 block" />
                <span className="w-[26px] h-[26px] rounded-full bg-white/20 block" />
              </div>
            </div>

            {/* Listas Horizontales */}
            <div className="grid grid-cols-3 gap-3.5 p-3.5">
              <div className="h-[98px] bg-[#2b2c2f] rounded-2xl shadow-[0_4px_9px_rgba(0,0,0,0.25)] p-4 text-[#ddd] relative hover:brightness-105 transition-all">
                <span className="font-bold text-sm text-white">Hoy</span>
                <span className="absolute right-4 top-3 text-white/50 text-xs tracking-widest">•••</span>
                <span className="absolute left-4 bottom-3 text-2xl font-light text-white/60">＋</span>
                <div className="absolute left-10 right-9 bottom-4 h-[12px] rounded-full bg-[#3c3d40]" />
                <div className="absolute right-4 bottom-3.5 w-4 h-4 rounded-full bg-[#3b3c40]" />
              </div>

              <div className="h-[98px] bg-[#2b2c2f] rounded-2xl shadow-[0_4px_9px_rgba(0,0,0,0.25)] p-4 text-[#ddd] relative hover:brightness-105 transition-all">
                <span className="font-bold text-sm text-white">Esta semana</span>
                <span className="absolute right-4 top-3 text-white/50 text-xs tracking-widest">•••</span>
                <span className="absolute left-4 bottom-3 text-2xl font-light text-white/60">＋</span>
                <div className="absolute left-10 right-9 bottom-4 h-[12px] rounded-full bg-[#3c3d40]" />
                <div className="absolute right-4 bottom-3.5 w-4 h-4 rounded-full bg-[#3b3c40]" />
              </div>

              <div className="h-[98px] bg-[#2b2c2f] rounded-2xl shadow-[0_4px_9px_rgba(0,0,0,0.25)] p-4 text-[#ddd] relative hover:brightness-105 transition-all">
                <span className="font-bold text-sm text-white">Más tarde</span>
                <span className="absolute right-4 top-3 text-white/50 text-xs tracking-widest">•••</span>
                <span className="absolute left-4 bottom-3 text-2xl font-light text-white/60">＋</span>
                <div className="absolute left-10 right-9 bottom-4 h-[12px] rounded-full bg-[#3c3d40]" />
                <div className="absolute right-4 bottom-3.5 w-4 h-4 rounded-full bg-[#3b3c40]" />
              </div>
            </div>

            {/* Medallón de la Mascota Centrado en el Tablero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%' }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-[205px] w-[155px] h-[155px] rounded-full bg-[#8038a5] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] z-20 cursor-pointer"
              onClick={handleStart}
              title="Haz clic para interactuar con la mascota"
            >
              {/* Halo de pulsación constante */}
              <div className="absolute inset-[-10px] rounded-full border-2 border-white/35 pulse-halo pointer-events-none" />

              {mascotType === 'qaway' ? <QawayMascot mood={mascotMood} /> : <HuskyMascot mood={mascotMood} />}
            </motion.div>

            {/* Bocadillo de Texto de la Mascota */}
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="absolute left-[calc(50%+65px)] top-[242px] bg-[#222] text-[#e8e8e8] rounded-xl px-4 py-2.5 text-base font-semibold min-w-[130px] text-center shadow-[0_6px_18px_rgba(0,0,0,0.35)] z-20"
            >
              <div className="absolute -left-[8px] top-[16px] w-0 h-0 border-y-[7px] border-y-transparent border-r-[8px] border-r-[#222]" />
              <span>{bubbleText}</span>
            </motion.div>

            {/* Cursor Virtual Guiado con Tooltip */}
            <div className="absolute left-[62%] top-[410px] z-30 pointer-events-none cursor-virtual">
              <svg viewBox="0 0 28 38" width="28" height="38" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                <path d="M3 2 L24 19 L15 20 L20 34 L15 36 L9 22 L3 28Z" fill="#fff" stroke="#172b4d" strokeWidth="2" />
              </svg>
              <div className="mt-2 bg-[#222] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md inline-block">
                Explora el tablero
              </div>
            </div>
          </motion.section>
        </section>
      </main>
    </div>
  )
}
