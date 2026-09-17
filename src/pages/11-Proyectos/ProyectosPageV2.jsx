import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Search, ChevronDown, Sparkles, BookOpen, Clock,
  Layers, CheckCircle2, Camera, MessageSquare, Zap, ShieldCheck
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import mockupGelato from '../8-landings/8-desarollo web/assets/Hero-2.webp'
import mockupSitiosWeb from '../8-landings/8-desarollo web/assets/Sitios-Web.webp'
import mockupAureaSkincare from './2-Sistemas-digitales/3-Webs-y-landings/7-skin-care/aurea-skincare-web/aurea-skincare(iPhone 14 Pro Max)2.webp'
import mockupVallet from './2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria/vallet(iPhone 14 Pro Max)2.webp'
import showcaseVallet from './2-Sistemas-digitales/3-Webs-y-landings/11-Vallet Immobiliaria/1-vallet-showcase.webp'
import showcaseDental from './2-Sistemas-digitales/3-Webs-y-landings/3-Dental/1-dental-showcase.webp'
import mockupEpc from './2-Sistemas-digitales/3-Webs-y-landings/10-EPC estudio contable/epc(iPhone 14 Pro Max).webp'
import './proyectos.css'

const featuredBrandLogos = [
  { name: 'Mesa Selecta', style: { fontFamily: "'The Seasons', 'Georgia', 'Times New Roman', serif", fontWeight: 400 } },
  { name: 'VALLET', style: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.18em' } },
  { name: 'Nodo Urbano', style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '-0.04em' } },
  { name: 'WORLDCOM', style: { fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.04em' } },
  { name: 'Ayni Foods', style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontWeight: 400, textTransform: 'none', letterSpacing: '0' } },
  { name: 'ECP', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 800, letterSpacing: '0.05em' } },
  { name: 'Solar Finca', style: { fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontWeight: 600, letterSpacing: '-0.02em' } },
  { name: 'principal.', style: { fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontWeight: 500, letterSpacing: '-0.03em' } },
  { name: 'SKYLINE', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 800, letterSpacing: '0.08em' } },
  { name: 'Horizonte', style: { fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' } },
  { name: 'DHARMA', style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, letterSpacing: '0.05em' } },
  { name: 'Vertice Lab', style: { fontFamily: "'Arial Narrow', 'Roboto Condensed', sans-serif", fontWeight: 700, letterSpacing: '-0.04em' } },
]

const categoriesNav = [
  { label: 'Estudio', detail: 'Branding, contenido visual, estrategia digital y presencia profesional.', path: '/estudio', cta: 'Ver servicios de Estudio' },
  { label: 'Sistemas digitales', detail: 'Automatizacion, canales, webs, CRM, agentes IA y dashboards.', path: '/sistemas-digitales', cta: 'Ver sistemas digitales' },
]

const V2_FILTERS = [
  'Todos',
  'Casos de Éxito',
  'Servicios Web',
  'Productos Digitales',
  'Cursos Academy',
  'Estudio & Foto',
]

const catalogItems = [
  // ─── 1. SOLUCIONES WEB & PROYECTOS POR SECTOR (PRIORIDAD COMERCIAL) ───
  {
    id: 'caso-dental',
    to: '/proyectos/dental',
    image: showcaseDental,
    ribbon: 'ONE WEB',
    ribbonBg: 'bg-[#ff4b0b]',
    category: 'SALUD & CLÍNICA',
    badge: 'AGENDAMIENTO',
    title: 'One Web para Clínica Dental & Salud',
    desc: 'Sitio One Web para centro médico odontológico de alta credibilidad con presentación clara de tratamientos y captación directa de citas.',
    ctaText: 'Ver proyecto',
    price: 'Desde S/ 79.90',
    oldPrice: 'S/ 149',
    categories: ['Casos de Éxito', 'Servicios Web'],
    isMockup: true,
  },
  {
    id: 'caso-panaderia-josue',
    to: '/proyectos/panaderia-josue',
    image: '/josue-images/showcase/1-josue-panaderia-hero-productos.webp',
    ribbon: 'ONE WEB',
    ribbonBg: 'bg-[#ff4b0b]',
    category: 'ONE WEB LOCAL',
    badge: 'ALTA CONVERSIÓN',
    title: 'One Web para Panadería & Gastronomía',
    desc: 'Sitio One Web para comercio gastronómico con presentación de panes artesanales, horarios de horneado y pedidos directos a WhatsApp.',
    ctaText: 'Ver proyecto',
    price: 'Desde S/ 79.90',
    oldPrice: 'S/ 149',
    categories: ['Casos de Éxito', 'Servicios Web'],
    isMockup: true,
  },
  {
    id: 'caso-vallet',
    to: '/proyectos/vallet-inmobiliaria',
    image: showcaseVallet,
    ribbon: 'WEB COMERCIAL',
    ribbonBg: 'bg-[#18181b]',
    category: 'INMOBILIARIA & TOURS',
    badge: 'CAPTACIÓN 24/7',
    title: 'Web Comercial para Inmobiliaria & Bienes Raíces',
    desc: 'Ecosistema web comercial para agencia de bienes raíces con buscador de inmuebles, recorridos virtuales y captación directa a WhatsApp.',
    ctaText: 'Ver proyecto',
    price: 'S/ 290.00',
    oldPrice: 'S/ 490',
    categories: ['Casos de Éxito', 'Servicios Web'],
    isMockup: true,
  },
  {
    id: 'caso-aurea',
    to: '/proyectos/aurea-skincare',
    image: '/aurea-images/showcase/1-aurea-skincare-showcase.webp',
    ribbon: 'TIENDA ONLINE',
    ribbonBg: 'bg-[#ff4b0b]',
    category: 'E-COMMERCE & BEAUTY',
    badge: 'EN PRODUCCIÓN',
    title: 'Tienda Online para Cosmética & Skincare',
    desc: 'E-commerce editorial para marca de cosmética botánica con catálogo interactivo de sérums, diseño sensorial y checkout optimizado.',
    ctaText: 'Ver proyecto',
    price: 'S/ 490.00',
    oldPrice: 'S/ 890',
    categories: ['Casos de Éxito', 'Servicios Web'],
    isMockup: true,
  },
  {
    id: 'desarrollo-web-hub',
    to: '/landings/desarrollo-web',
    image: mockupSitiosWeb,
    ribbon: 'SERVICIO WEB',
    ribbonBg: 'bg-[#fe6612]',
    category: 'DESARROLLO A MEDIDA',
    badge: 'LLAVE EN MANO',
    title: 'Desarrollo Web & Tiendas Online',
    desc: 'Sitios corporativos y tiendas con catálogo interactivo, pasarelas de pago (Mercado Pago/Yape) y conexión directa a WhatsApp.',
    ctaText: 'Ver planes',
    price: 'Desde S/ 79.90',
    oldPrice: 'S/ 149',
    categories: ['Servicios Web'],
    isMockup: true,
  },

  // ─── 2. SISTEMAS DIGITALES (NOTION / OPERACIONES) ───
  {
    id: 'sistema-notion',
    to: '/landings/sistema-contenido-notion',
    image: '/assets/pages/8-landings/1-sistema-contenido-notion/notion_hero.webp',
    ribbon: 'WORKSPACE NOTION',
    ribbonBg: 'bg-[#18181b]',
    category: 'PRODUCTIVIDAD',
    badge: 'DUPLICABLE 1-CLIC',
    title: 'Sistema Estratégico de Contenido en Notion',
    desc: 'Arquitectura completa con prompts estratégicos y calendario operativo para planificar 30 días de contenido en menos de una hora.',
    ctaText: 'Ver sistema',
    price: 'S/ 29.00',
    oldPrice: 'S/ 60',
    categories: ['Productos Digitales'],
    isMockup: false,
  },

  // ─── 3. FORMACIÓN ONLINE (QAWAY ACADEMY) ───
  {
    id: 'identidad-visual-curso',
    to: '/landings/identidad-visual',
    image: '/assets/pages/8-landings/2-identidad-visual/1.webp',
    ribbon: 'DESTACADO',
    ribbonBg: 'bg-[#ff4b0b]',
    category: 'DISEÑO & IA',
    badge: 'CURSO PRÁCTICO',
    title: 'Identidad Visual con Inteligencia Artificial',
    desc: 'Construye la identidad gráfica, manual de marca, paleta cromática y componentes de tu negocio con flujos guiados de IA.',
    ctaText: 'Ver contenido',
    price: 'S/ 29.00',
    oldPrice: 'S/ 60',
    categories: ['Cursos Academy'],
    isMockup: false,
  },

  // ─── 4. ESTUDIO FOTOGRÁFICO & CONTENIDO ───
  {
    id: 'sesion-linkedin',
    to: '/landings/fotografia-linkedin',
    image: '/assets/pages/8-landings/5-fotografia-linkedin/galeria-ejecutivo.png',
    ribbon: 'ESTUDIO FOTOGRÁFICO',
    ribbonBg: 'bg-[#ff4b0b]',
    category: 'DIRECCIÓN DE ARTE',
    badge: 'LIMA ESTUDIO',
    title: 'Sesión Fotográfica LinkedIn & Ejecutiva',
    desc: 'Dirección de postura y expresión para proyectar solidez. 60 min de sesión, 2 cambios de vestuario y 8 fotografías finales retocadas.',
    ctaText: 'Reservar sesión',
    price: 'S/ 490.00',
    oldPrice: null,
    categories: ['Estudio & Foto'],
    isMockup: false,
  },
  {
    id: 'restauracion-foto',
    to: '/landings/restauracion-fotografica2',
    image: mockupGelato,
    ribbon: 'RESTAURACIÓN',
    ribbonBg: 'bg-[#18181b]',
    category: 'ESTUDIO DIGITAL',
    badge: 'ARCHIVO HISTÓRICO',
    title: 'Restauración Digital de Fotografías Antiguas',
    desc: 'Limpieza y reconstrucción de imágenes con manchas, quiebres o pérdida cromática. Respeto absoluto por la fisonomía original.',
    ctaText: 'Evaluar fotografía',
    price: 'Desde S/ 11.50',
    oldPrice: null,
    categories: ['Estudio & Foto'],
    isMockup: true,
  },
]

function StandardProductCard({ item, delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      {/* Cabecera / Imagen con Ribbon Rectangular Sólido estilo Academy */}
      <Link to={item.to} className="relative block overflow-hidden">
        {/* Ribbon Rectangular Sólido */}
        {item.ribbon && (
          <span
            className={`absolute left-[0.65rem] top-[0.65rem] z-10 ${item.ribbonBg || 'bg-[#ff4b0b]'} px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-white shadow-xs`}
          >
            {item.ribbon}
          </span>
        )}

        {item.isMockup ? (
          <div className="flex h-[240px] sm:h-[260px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#edf0f5] to-[#f8f9fc] p-5 pb-0">
            <div className="h-full w-full overflow-hidden rounded-t-[8px] border border-b-0 border-black/6 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.025]"
              />
            </div>
          </div>
        ) : (
          <div className="relative h-[240px] sm:h-[260px] overflow-hidden bg-zinc-100">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.025]"
            />
          </div>
        )}
      </Link>

      {/* Cuerpo de la Tarjeta (Anatomía idéntica al Benchmark Academy) */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Fila de Categoría + Badge Formato */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.69rem] font-bold uppercase tracking-[0.08em] text-[#ff4b0b]">
            {item.category}
          </span>
          {item.badge && (
            <span className="text-[0.65rem] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 uppercase tracking-wider rounded-xs">
              {item.badge}
            </span>
          )}
        </div>

        {/* Título de la Tarjeta */}
        <h3 className="mt-3.5 text-[1.18rem] sm:text-[1.26rem] font-bold leading-[1.12] tracking-[-0.03em] text-[#111111]">
          <Link to={item.to} className="hover:text-[#ff4b0b] transition-colors">
            {item.title}
          </Link>
        </h3>

        {/* Descripción de 2 líneas */}
        <p className="mt-3 line-clamp-2 text-[0.82rem] leading-[1.5] text-zinc-600">
          {item.desc}
        </p>

        {/* ─── FOOTER CON PRECIO INDEPENDIENTE Y DESTACADO ─── */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-5 border-t border-zinc-100">
          <Link
            to={item.to}
            className="inline-flex items-center gap-2 text-[0.84rem] font-bold text-[#ff4b0b] transition-colors group-hover:text-[#fe6612]"
          >
            <span>{item.ctaText || 'Ver contenido'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Columna Derecha: Precio Aislado y Contundente */}
          <div className="text-right shrink-0">
            {item.isStatusBadge ? (
              <span className="text-[0.68rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xs border border-emerald-200 uppercase tracking-wider">
                {item.price}
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                {item.oldPrice && (
                  <span className="text-[0.72rem] font-medium text-zinc-400">
                    <span className="text-[0.64rem] font-medium text-zinc-400 mr-1">Antes</span>
                    <span className="line-through decoration-zinc-400">{item.oldPrice}</span>
                  </span>
                )}
                <span className="text-[1.05rem] sm:text-[1.14rem] font-extrabold text-[#111111] tracking-tight">
                  {item.price}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default function ProyectosPageV2() {
  useSetNavbarVariant('transparent')
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  const visibleItems = catalogItems.filter((item) => {
    const matchesFilter = activeFilter === 'Todos' || item.categories.includes(activeFilter)
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q)) ||
      item.categories.some(c => c.toLowerCase().includes(q))
    )
    return matchesFilter && matchesSearch
  })

  return (
    <main className="projects-page">
      {/* ─── HERO EDITORIAL ─── */}
      <section className="projects-hero border-b border-black/10">
        <div className="projects-shell">
          <motion.div
            className="projects-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs shadow-xs">
              <span>/ Ecosistema Qaway Lab</span>
            </div>
            
            <h1
              className="text-[clamp(2.4rem,4vw,3.4rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Proyectos & Soluciones<span className="text-white/70">.</span>
            </h1>

            <p className="text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Casos de estudio reales, cursos prácticos con IA, plantillas operativas listas para duplicar y servicios de desarrollo web de alto impacto.
            </p>

            {/* Buscador Integrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[10px] border border-white/40 bg-white px-4 py-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.14)] transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="h-5 w-5 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por curso, plantilla, servicio o caso de éxito..."
                  className="w-full bg-transparent text-sm text-[#191918] outline-none placeholder:text-black/40 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-black/40 hover:text-[#fe6612]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BARRA DE PÍLDORAS CON ESTÁNDAR ARTESANAL ─── */}
      <div id="proyectos-listado" className="border-b border-black/10 bg-white py-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] sticky top-0 z-30">
        <div className="projects-shell flex items-center justify-between gap-4">
          
          <div className="flex flex-1 items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {V2_FILTERS.map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-[10px] px-4 py-2.5 text-[13px] sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/20'
                      : 'border border-black/10 bg-white text-[#191918] hover:border-[#fe6612]/40 hover:text-[#fe6612]'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>

          <div className="hidden sm:block">
            <button
              type="button"
              onClick={() => { setActiveFilter('Todos'); setSearchQuery('') }}
              className="flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#191918] transition-colors hover:border-[#fe6612]/50 hover:text-[#fe6612]"
            >
              <span>Ver Todo</span>
              <ChevronDown className="h-3.5 w-3.5 text-black/50" />
            </button>
          </div>

        </div>
      </div>

      {/* ─── GRILLA DE ITEMS DEL CATÁLOGO ─── */}
      <section className="projects-listing">
        <div className="projects-shell pt-8 pb-16">
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {visibleItems.map((item, idx) => (
                <StandardProductCard
                  key={item.id}
                  item={item}
                  delay={Math.min(idx * 0.05, 0.25)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-zinc-500 font-medium">No se encontraron resultados para "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveFilter('Todos') }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#fe6612] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── CORTE VISUAL CON LOGOTIPOS (IDÉNTICO A V1) ─── */}
      <section className="bg-white py-12 sm:py-16 border-y border-black/8">
        <div className="projects-shell">
          <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-6 items-center justify-items-center">
            {featuredBrandLogos.map((brand) => (
              <div key={brand.name} className="flex items-center justify-center h-14 w-full px-2">
                <span
                  className="text-center text-[clamp(1.1rem,1.8vw,1.65rem)] leading-none text-[#20201f] tracking-tight transition-opacity duration-300 hover:opacity-80"
                  style={brand.style}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MOCKUPS EN MARCO DE TITANIO MÓVIL (IDÉNTICO A V1) ─── */}
      <section className="bg-white py-18 sm:py-26">
        <div className="projects-shell">
          <motion.div
            className="text-center max-w-2xl mx-auto pb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h2 className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-bold text-[#111111] tracking-[-0.03em] leading-[1.18] mb-3.5">
              Diseño pensado para conversión móvil
            </h2>
            <p className="text-[#71717a] text-[15px] sm:text-[16px] leading-[1.55] max-w-[620px] mx-auto">
              Más del 70% del tráfico interactúa desde un smartphone. Optimizamos cada pantalla para respuesta táctil inmediata.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-5xl mx-auto">
            {[
              {
                title: 'E-commerce & Catálogo',
                desc: 'Checkout fluido y navegación de producto ágil en dispositivos móviles.',
                image: mockupAureaSkincare,
                tag: 'Mobile Store',
                statusBg: '#FAF7F2',
                statusColor: '#111111',
                to: '/landings/desarrollo-web'
              },
              {
                title: 'Servicios Profesionales',
                desc: 'Agendamiento de citas y presentación corporativa de alta credibilidad.',
                image: mockupEpc,
                tag: 'Agendamiento',
                statusBg: '#06153a',
                statusColor: '#ffffff',
                to: '/landings/desarrollo-web'
              },
              {
                title: 'Captación Inmobiliaria',
                desc: 'Tours inmersivos y contacto directo a WhatsApp en un solo toque.',
                image: mockupVallet,
                tag: 'Lead Directo',
                statusBg: '#fffdf9',
                statusColor: '#111111',
                to: '/landings/desarrollo-web'
              }
            ].map((mockup, i) => (
              <motion.div
                key={mockup.title}
                className="group flex flex-col items-center w-full pt-3"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <div className="relative w-full max-w-[270px] aspect-[9/18.5] rounded-[34px] bg-gradient-to-tr from-[#18181b] via-[#8e8e93] via-35% to-[#27272a] p-[3.5px] ring-1 ring-white/35 shadow-[0_22px_50px_rgba(0,0,0,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_65px_rgba(0,0,0,0.22),inset_0_1.5px_2.5px_rgba(255,255,255,0.85)]">
                  <div className="h-full w-full overflow-hidden rounded-[28px] relative flex flex-col" style={{ backgroundColor: mockup.statusBg || '#ffffff' }}>
                    <div className="h-6 w-full px-4 pt-1 flex items-center justify-between shrink-0 select-none z-10" style={{ backgroundColor: mockup.statusBg || '#ffffff', color: mockup.statusColor || '#111111' }}>
                      <span className="text-[11px] font-semibold tracking-tight">9:41</span>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <svg className="w-3.5 h-2.5" viewBox="0 0 17 11" fill="currentColor">
                          <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                          <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.5" />
                          <rect x="9" y="3" width="2.5" height="8" rx="0.5" />
                          <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" />
                        </svg>
                        <svg className="w-3.5 h-2.5" viewBox="0 0 16 12" fill="currentColor">
                          <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.89-3.64a5.5 5.5 0 0 1 7.78 0 .75.75 0 1 0 1.06-1.06 7 7 0 0 0-9.9 0 .75.75 0 0 0 1.06 1.06zm-2.83-2.83a9.5 9.5 0 0 1 13.44 0 .75.75 0 1 0 1.06-1.06 11 11 0 0 0-15.56 0 .75.75 0 1 0 1.06 1.06z" />
                        </svg>
                        <div className="flex items-center">
                          <div className="w-[18px] h-[9px] rounded-[2.5px] border border-current p-[1px] flex items-center">
                            <div className="h-full w-3/4 bg-current rounded-[1px]" />
                          </div>
                          <div className="w-[1.5px] h-[3.5px] bg-current rounded-r-[0.8px]" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full overflow-hidden relative">
                      <img
                        src={mockup.image}
                        alt={mockup.title}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-center px-2 flex flex-col items-center">
                  <span className="mb-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    {mockup.tag}
                  </span>
                  <h3 className="text-[17px] font-bold text-[#111111] tracking-[-0.02em] leading-[1.25] group-hover:text-[#fe6612] transition-colors mb-2">
                    {mockup.title}
                  </h3>
                  <p className="text-[13.5px] text-[#71717a] leading-[1.5] max-w-[260px] mb-3.5">
                    {mockup.desc}
                  </p>
                  <Link
                    to={mockup.to || '/landings/desarrollo-web'}
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#fe6612] transition-colors hover:text-[#e0550a]"
                  >
                    <span>Ver detalle</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ÁREAS COMPLEMENTARIAS ─── */}
      <section className="projects-areas overflow-hidden">
        <div className="projects-shell projects-areas__grid">
          {categoriesNav.map((category, idx) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, x: idx === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="h-full flex flex-col pt-2"
            >
              <Link to={category.path} className="projects-area-card h-full">
                <span>Ecosistema / {category.label}</span>
                <h2>{category.label}</h2>
                <p>{category.detail}</p>
                <small>{category.cta} <ArrowRight size={14} /></small>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL WHATSAPP ─── */}
      <section className="projects-cta">
        <div className="projects-shell projects-cta__grid">
          <div>
            <p>Hablemos de tu marca</p>
            <h2>¿Tu marca todavia se presenta<br />con piezas aisladas?</h2>
            <span>Creamos sistemas de marca y presencia digital que trabajan juntos para posicionarte, conectar y mostrarte con mas claridad.</span>
          </div>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Cuentanos tu proyecto <ArrowRight size={16} /></a>
        </div>
      </section>
    </main>
  )
}
