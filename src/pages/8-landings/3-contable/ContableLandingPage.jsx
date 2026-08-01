import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/config/supabase'
import {
  ArrowRight, Check, ChevronDown, ShieldCheck, HelpCircle,
  Calculator, Users, FileText, TrendingUp, Scale,
  Menu, X, PhoneCall, AlertTriangle, Building, Briefcase, Plus, Star
} from 'lucide-react'

const waMsg = encodeURIComponent("Hola Qaway, me interesa el servicio de contabilidad para mi negocio.")
const waLink = `https://wa.me/51930756781?text=${waMsg}`

// ─── Feature Tag ─────────────────────────────────────────
function FeatureTag({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-7 h-7 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
        <Icon size={14} />
      </div>
      <span className="text-lg font-medium text-zinc-100 tracking-tight">{text}</span>
    </div>
  )
}

// ─── Section Title ───────────────────────────────────────
function SectionTitle({ title, subtitle, light = true, mb = 'mb-12', subtitleSize = 'text-lg', icon: Icon }) {
  return (
    <div className={`${mb} text-center`}>
      {Icon && (
        <div className="inline-flex items-center justify-center mb-4 text-emerald-400">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
        {title}
      </h2>
      <p className={`${subtitleSize} max-w-2xl mx-auto text-zinc-400 font-medium`}>
        {subtitle}
      </p>
    </div>
  )
}

// ─── Calculator ──────────────────────────────────────────
function TaxCalculator() {
  const [sales, setSales] = useState(5000)
  const [employees, setEmployees] = useState(1)
  const [regime, setRegime] = useState({ name: '', cost: 0, desc: '', benefits: [] })

  useEffect(() => {
    let recName = 'Régimen Especial (RER)'
    let serviceCost = 150
    let recDesc = 'Ideal para empresas de comercio o servicios con compras/ventas sencillas.'
    let recBenefits = [
      'Solo declaras Registro de Compras y Ventas',
      'Pago de impuesto a la renta fijo: 1.5% de ingresos',
      'No estás obligado a llevar libros contables complejos'
    ]

    if (sales > 43750 || employees > 10) {
      recName = 'Régimen MYPE Tributario (RMT)'
      serviceCost = 350
      recDesc = 'Perfecto para Pymes en crecimiento con gastos deducibles.'
      recBenefits = [
        'Impuesto a la renta progresivo (1% hasta 15 UIT)',
        'Permite deducir todos tus gastos operativos',
        'Crecimiento comercial sin límite de compras'
      ]
    } else if (sales > 15000) {
      recName = 'Régimen MYPE Tributario (RMT)'
      serviceCost = 250
      recDesc = 'Recomendado para optimizar impuestos si tienes compras altas.'
      recBenefits = [
        'Tasas impositivas bajas para pymes',
        'Declaración anual simplificada',
        'Acceso a licitaciones y clientes corporativos'
      ]
    }

    setRegime({ name: recName, cost: serviceCost, desc: recDesc, benefits: recBenefits })
  }, [sales, employees])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Calculator className="text-emerald-400" /> Simula tu Régimen y Costo
      </h3>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between text-sm text-zinc-300 font-bold mb-2">
            <span>Ventas Mensuales Proyectadas</span>
            <span className="text-emerald-400 text-lg">S/ {sales.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="60000"
            step="1000"
            value={sales}
            onChange={(e) => setSales(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>S/ 1,000</span>
            <span>S/ 30,000</span>
            <span>S/ 60,000+</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-zinc-300 font-bold mb-2">
            <span>Número de Colaboradores</span>
            <span className="text-emerald-400 text-lg">{employees} {employees === 1 ? 'persona' : 'personas'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>0 (Solo tú)</span>
            <span>10</span>
            <span>20+</span>
          </div>
        </div>

        <div className="bg-zinc-950/80 rounded-2xl p-6 border border-zinc-850">
          <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase block mb-1">Régimen Sugerido</span>
          <h4 className="text-xl md:text-2xl font-bold text-white mb-2">{regime.name}</h4>
          <p className="text-sm text-zinc-400 mb-4">{regime.desc}</p>
          
          <ul className="space-y-2 mb-6">
            {regime.benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 uppercase font-black block">Servicio Contable desde</span>
              <div className="text-3xl font-black text-white">S/ {regime.cost} <span className="text-sm font-normal text-zinc-400">/ mes</span></div>
            </div>
            <a
              href={`https://wa.me/51930756781?text=Hola%20Qaway,%20simul%C3%A9%20mis%20ventas%20en%20S/.%20${sales}%20y%20quiero%20cotizar%20el%20servicio.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all"
            >
              Consultar Plan
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────
function ContableNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { href: "#comparativa", label: "El Método" },
    { href: "#calculadora", label: "Simulador" },
    { href: "#servicios", label: "Servicios" },
    { href: "#precios", label: "Planes" },
    { href: "#faq", label: "FAQ" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-lg'
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-white">Qaway</span>
          <span className="text-xl font-bold tracking-tight text-[#ff4b0b] ml-1">LAB</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-xs font-bold text-zinc-300 uppercase tracking-widest hover:text-emerald-400 transition-colors">
              {l.label}
            </a>
          ))}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-emerald-500 text-zinc-950 px-6 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg uppercase text-xs font-bold tracking-widest flex items-center gap-2">
            <PhoneCall size={14} /> Asesoría Gratuita
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-zinc-300 hover:text-emerald-400 transition-colors" aria-label="Menú">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-zinc-900 border-t border-zinc-800"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-zinc-300 hover:text-emerald-400 py-2">
                  {l.label}
                </a>
              ))}
              <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg uppercase text-xs font-bold tracking-widest text-center flex items-center justify-center gap-2">
                <PhoneCall size={16} /> Asesoría Gratuita
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────
function ContableHero() {
  return (
    <section className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 min-h-screen flex items-center relative overflow-hidden px-6 pt-32 pb-16">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 text-white space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-400 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-emerald-500/20 mb-4">
              <ShieldCheck size={14} /> Contabilidad Digital 100% Segura
            </div>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Ordenamos tu Contabilidad, <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Evitamos Multas</span> de SUNAT.
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              Deja las hojas de cálculo y las preocupaciones tributarias en nuestras manos. Nos encargamos de tus impuestos, planillas y declaraciones mensuales con reportes claros en tiempo real.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
              <FeatureTag icon={ShieldCheck} text="Garantía de Cero Multas" />
              <FeatureTag icon={TrendingUp} text="Asesoría Tributaria Activa" />
              <FeatureTag icon={FileText} text="Declaración Puntual Mensual" />
              <FeatureTag icon={Calculator} text="Orden Financiero Claro" />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#calculadora" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-8 py-4 rounded-xl font-bold text-base flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/10 hover:scale-[1.02]">
                Simular Costo de Servicio <ArrowRight size={20} />
              </a>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="border border-zinc-700 hover:border-emerald-500 text-white hover:text-emerald-400 px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center gap-2">
                Hablar con un Contador
              </a>
            </div>
          </motion.div>
        </div>
        <div className="lg:col-span-5 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            id="calculadora"
          >
            <TaxCalculator />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Puntos de Dolor vs Solución ──────────────────────────
function ContableComparativa() {
  const points = [
    { pain: 'Responde tarde tus consultas o mensajes en WhatsApp.', sol: 'Canal directo y rápido de consultas con tu contador de cabecera.', good: true },
    { pain: 'Sorpresas y notificaciones de multas de la SUNAT.', sol: 'Monitoreo diario de la casilla electrónica SUNAT y reportes previos.', good: true },
    { pain: 'Falta de claridad sobre cuánto debes pagar de impuestos.', sol: 'Cálculos de impuestos proyectados antes del cierre mensual.', good: true },
    { pain: 'Entrega manual de facturas y documentos físicos.', sol: 'Plataforma digital para subir todo con fotos o archivos en segundos.', good: true },
  ]

  return (
    <section id="comparativa" className="py-24 px-6 bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <SectionTitle
          title="¿Cansado de la contabilidad tradicional?"
          subtitle="Diseñamos un servicio contable que se adapta al ritmo de tu negocio, con comunicación clara y sin sorpresas."
        />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-950 p-8 rounded-3xl border border-red-500/10">
            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <AlertTriangle size={20} /> Con otros contadores
            </h3>
            <ul className="space-y-4">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="text-red-500 text-lg font-black shrink-0">✕</span>
                  <span>{p.pain}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-950 p-8 rounded-3xl border border-emerald-500/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={20} /> Con Qaway Contable
            </h3>
            <ul className="space-y-4">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-100">
                  <span className="text-emerald-400 text-lg font-black shrink-0">✓</span>
                  <span>{p.sol}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Servicios ───────────────────────────────────────────
const servicesList = [
  { icon: FileText, title: "Contabilidad Mensual", desc: "Procesamos tus compras, ventas y conciliación bancaria. Declaramos tus impuestos a tiempo sin fallas." },
  { icon: Scale, title: "Declaraciones y Tributación", desc: "Cálculo preciso de IGV, Impuesto a la Renta mensual y anual. Nos encargamos de todo el flujo formal de SUNAT." },
  { icon: Users, title: "Planillas y Gestión Laboral", desc: "Cálculo de CTS, gratificaciones, vacaciones, PLAME y envío de boletas de pago firmadas para tu equipo." },
  { icon: Building, title: "Constitución de Empresas", desc: "Te acompañamos en todo el proceso: búsqueda de nombre, elaboración de minuta, firma notarial e inscripción en SUNAT." },
  { icon: Briefcase, title: "Consultoría de Negocios", desc: "Sesiones estratégicas para optimizar tu carga tributaria de forma legal y planificar tus finanzas." },
  { icon: TrendingUp, title: "Facturación Electrónica", desc: "Te ayudamos a integrar y configurar sistemas de facturación electrónica para emitir boletas y facturas fácilmente." }
]

function ContableServicios() {
  return (
    <section id="servicios" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Servicios Contables a tu Medida"
          subtitle="Cubrimos todas las necesidades operativas y legales de tu pequeña empresa para que te enfoques en vender."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((srv, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl group hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/2 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 text-emerald-400 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <srv.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {srv.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {srv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Planes y Precios ─────────────────────────────────────
const planes = [
  {
    name: "Emprendedor RER",
    price: "150",
    desc: "Ideal para freelancers y microempresas que tributan en el Régimen Especial (RER).",
    features: [
      "Declaración de impuestos IGV y Renta",
      "Libros contables electrónicos (Ventas y Compras)",
      "Monitoreo constante de Casilla SUNAT",
      "Soporte rápido vía WhatsApp",
      "Hasta S/ 10,000 en facturación mensual"
    ],
    popular: false
  },
  {
    name: "MYPE Crecimiento",
    price: "250",
    desc: "Perfecto para pequeñas empresas en el Régimen MYPE Tributario (RMT) con compras altas.",
    features: [
      "Todo lo del plan Emprendedor",
      "Declaración de renta mensual y anual simplificada",
      "Gestión de planilla básica (hasta 3 empleados)",
      "Consultas tributarias ilimitadas",
      "Hasta S/ 25,000 en facturación mensual",
      "Reporte mensual de estado de ganancias"
    ],
    popular: true
  },
  {
    name: "Empresarial General",
    price: "390",
    desc: "Diseñado para empresas con mayor volumen y requerimientos laborales complejos.",
    features: [
      "Todo lo del plan MYPE Crecimiento",
      "Libro contable diario y mayor electrónico",
      "Planilla avanzada (hasta 8 empleados)",
      "Conciliación bancaria mensualizada",
      "Hasta S/ 50,000 en facturación mensual",
      "Sesión mensual de asesoría tributaria 1-a-1"
    ],
    popular: false
  }
]

function ContablePrecios() {
  return (
    <section id="precios" className="py-24 px-6 bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Planes Contables Claros y Transparentes"
          subtitle="Sin letras pequeñas ni cobros ocultos. Elige el plan adecuado según la etapa de tu negocio."
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {planes.map((p, idx) => (
            <div
              key={idx}
              className={`bg-zinc-950 rounded-3xl p-8 border relative flex flex-col justify-between transition-all duration-300 ${
                p.popular
                  ? 'border-emerald-500 shadow-2xl scale-105 shadow-emerald-500/5 lg:-translate-y-2'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {p.popular && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-zinc-950 font-black text-xs uppercase px-4 py-1.5 rounded-b-xl tracking-wider">
                  MÁS POPULAR
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-4">{p.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-snug">{p.desc}</p>

                <div className="mb-6 flex items-baseline">
                  <span className="text-sm font-bold text-zinc-500 align-super">S/</span>
                  <span className="text-5xl font-black text-white">{p.price}</span>
                  <span className="text-zinc-500 text-sm ml-2 font-medium">/ mes + IGV</span>
                </div>

                <div className="h-px bg-zinc-850 my-6" />

                <ul className="space-y-4 mb-8">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/51930756781?text=Hola%20Qaway,%20me%20interesa%20el%20plan%20${encodeURIComponent(p.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase text-center transition-all ${
                  p.popular
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                Comenzar Ahora
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonios ─────────────────────────────────────────
const testList = [
  { name: "Renzo Castillo", biz: "Cofundador de Agencia Kroma", text: "Teníamos pánico de las notificaciones de SUNAT. El equipo de Qaway asumió el control de nuestra contabilidad, ordenó las planillas y desde entonces declaramos a tiempo. Excelente servicio." },
  { name: "Diana Paredes", biz: "Fundadora de Tienda Bloom", text: "Antes usaba Excel y mi contadora anterior casi ni me respondía por WhatsApp. Con Qaway tengo reportes mensuales claros de mis compras y ventas, y me ayudan a planificar mis impuestos." },
  { name: "Marcos Villanueva", biz: "Socio de Nova Tech SRL", text: "Constituimos nuestra empresa de servicios digitales con Qaway. Nos orientaron desde la elección del régimen MYPE y ahora llevan nuestra contabilidad mensual de forma impecable." }
]

function ContableTestimonios() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Pymes que ya crecen con tranquilidad"
          subtitle="Nuestros clientes delegan la carga operativa para concentrarse en escalar sus ventas."
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testList.map((t, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl relative">
              <div className="flex gap-1 mb-4 text-emerald-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="font-bold text-white text-base">{t.name}</p>
                <p className="text-emerald-400 text-xs font-semibold">{t.biz}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────
const faqsContable = [
  { q: "¿Qué necesito para empezar a trabajar con Qaway?", a: "Solo tu clave SOL y ficha RUC. Si ya cuentas con un contador, nosotros nos encargamos de coordinar la transición de tus libros contables y documentos anteriores sin que tengas que preocuparte de nada." },
  { q: "¿Qué pasa si recibo una multa de SUNAT?", a: "Contamos con una garantía de cero multas. Si alguna notificación o multa es causada por un retraso o error directo en nuestro procesamiento contable, nosotros asumimos la responsabilidad económica." },
  { q: "¿Me ayudan a emitir mis facturas y boletas electrónicas?", a: "Sí, te capacitamos en el uso de la plataforma de SUNAT o te ayudamos a integrar un sistema de facturación electrónica compatible para que emitas tus comprobantes de forma rápida y correcta." },
  { q: "¿Puedo cambiar de régimen tributario en cualquier momento?", a: "El cambio de régimen hacia uno más complejo (como de RER a MYPE) se puede hacer en cualquier mes del año. Hacia uno más simple (como de MYPE a RER), solo se puede realizar en la declaración de enero de cada año. Nosotros te asesoramos en la estrategia." }
]

function ContableFaq() {
  const [activeFaq, setActiveFaq] = useState(null)

  return (
    <section id="faq" className="py-24 px-6 bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <SectionTitle title="Preguntas Frecuentes" subtitle="Resolvemos tus principales dudas sobre contabilidad y tributación." />
        
        <div className="space-y-4">
          {faqsContable.map((faq, i) => (
            <div key={i} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900 group transition-colors"
              >
                <span className="font-bold text-base md:text-lg text-white group-hover:text-emerald-400 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown className={`transition-transform duration-300 text-zinc-500 shrink-0 ml-4 ${activeFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${activeFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden min-h-0">
                  <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact Form & CTA ──────────────────────────────────
function ContableCTA() {
  const [formData, setFormData] = useState({ nombre: '', ruc: '', celular: '', mensaje: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 8000)
    
    const contactMsg = encodeURIComponent(`Hola Qaway, soy ${formData.nombre}, RUC: ${formData.ruc}, celular: ${formData.celular}. Mensaje: ${formData.mensaje}`)
    const waUrl = `https://wa.me/51930756781?text=${contactMsg}`

    try {
      await supabase.from('leads').insert([{
        client_name: formData.nombre,
        contact_info: formData.celular,
        source: 'Landing Contable',
        stage: 'new',
        metadata: { ruc: formData.ruc, mensaje: formData.mensaje }
      }]);

      const apiKey = import.meta.env.VITE_WEB3FORMS_VENTAS_KEY || '';
      if (apiKey.trim()) {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: apiKey.trim(),
            subject: `Nueva consulta Landing Contable`,
            from_name: 'Qaway Lab Landing',
            name: formData.nombre,
            phone: formData.celular,
            message: `RUC: ${formData.ruc} | Mensaje: ${formData.mensaje || 'Sin mensaje adicional'}`,
          }),
        });
      }
    } catch (err) {
      console.error('Error al procesar formulario:', err);
    }

    window.open(waUrl, '_blank')
  }

  return (
    <section className="py-24 px-6 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5 text-white space-y-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            ¿Listo para delegar tu contabilidad?
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Completa el formulario y te contactaremos en minutos para evaluar el estado contable de tu negocio sin costo alguno.
          </p>
          <div className="border-t border-zinc-800 pt-6">
            <span className="text-xs text-zinc-500 uppercase font-black block mb-2">Contacto directo</span>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold">
              <PhoneCall size={18} /> +51 930 756 781
            </a>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-zinc-900 border border-zinc-850 p-8 rounded-3xl shadow-xl">
            {isSubmitted ? (
              <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 p-8 rounded-2xl font-bold text-center">
                ¡Gracias por escribirnos! Te estamos redirigiendo a WhatsApp para iniciar tu asesoría contable. 🎉
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Tu nombre completo o de tu empresa"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-5 py-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm placeholder-zinc-500"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="RUC (opcional)"
                    maxLength="11"
                    className="w-full bg-zinc-950 border border-zinc-800 px-5 py-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm placeholder-zinc-500"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Celular"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 px-5 py-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm placeholder-zinc-500"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Cuéntanos brevemente sobre tu negocio y en qué régimen te encuentras..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-5 py-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm placeholder-zinc-500 h-28 resize-none"
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  Solicitar Asesoría por WhatsApp <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────
function ContableFooter() {
  return (
    <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white">Qaway</span>
          <span className="font-bold text-lg text-emerald-400">Contable</span>
        </div>
        <p className="text-zinc-500 text-xs">
          © 2026 Qaway Lab. Todos los derechos reservados. Lima, Perú.
        </p>
      </div>
    </footer>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────
export default function ContableLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-zinc-950 scroll-smooth">
      <ContableNavbar />
      <ContableHero />
      <ContableComparativa />
      <ContableServicios />
      <ContablePrecios />
      <ContableTestimonios />
      <ContableFaq />
      <ContableCTA />
      <ContableFooter />
    </div>
  )
}
