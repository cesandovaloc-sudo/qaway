import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, Search, ChevronDown } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { supabase } from '@/config/supabase'
import mockupLandingPages from '../8-landings/8-desarollo web/assets/Landing-Pages.webp'
import mockupSitiosWeb from '../8-landings/8-desarollo web/assets/Sitios-Web.webp'
import mockupTiendasOnline from '../8-landings/8-desarollo web/assets/Tiendas-Online.webp'
import mockupAureaSkincare from './2-Sistemas-digitales/3-Webs-y-landings/7-skin-care/aurea-skincare-web/aurea-skincare(iPhone 14 Pro Max).png'
import './proyectos.css'

const estudioAssets = '/assets/pages/2-estudio/'
const sistemasAssets = '/assets/pages/3-sistemas-digitales/'

const heroSlides = [
  {
    eyebrow: 'Proyecto destacado',
    title: 'Brenda y Ely Cafe',
    image: `${estudioAssets}estudio-proyecto-cafe.webp`,
    tags: ['Branding', 'Contenido visual', 'Aplicaciones de marca'],
  },
  {
    eyebrow: 'Sistema digital',
    title: 'Operacion automatizada',
    image: `${sistemasAssets}content-ops-command-center.webp`,
    tags: ['Automatizacion', 'CRM', 'Dashboards'],
  },
  {
    eyebrow: 'Identidad aplicada',
    title: 'Arquitectura visual',
    image: `${estudioAssets}estudio-proyecto-arquitectura.webp`,
    tags: ['Branding', 'Web', 'Presentaciones'],
  },
]

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

function extractVigenteCategories(projectsList) {
  if (!projectsList || !Array.isArray(projectsList) || projectsList.length === 0) {
    return ['Todos', 'Páginas web']
  }
  // Extrae dinámicamente SOLO las categorías de los proyectos existentes en la base de datos
  const uniqueCategories = Array.from(
    new Set(
      projectsList.flatMap((p) => {
        if (Array.isArray(p.categories)) return p.categories
        if (p.category) return [p.category]
        return []
      }).filter(Boolean)
    )
  )
  
  return ['Todos', ...uniqueCategories]
}

const projects = [
  {
    title: 'Horizonte Inmobiliaria',
    subtitle: 'Ecosistema web inmobiliario con recorridos virtuales y captación automatizada a WhatsApp.',
    image: `${estudioAssets}estudio-proyecto-arquitectura.webp`,
    bgImage: `${estudioAssets}estudio-proyecto-arquitectura.webp`,
    video: '/assets/horizonte/hero-urban-apartment.mp4',
    tags: ['Desarrollo Web', 'Captación Inmobiliaria', 'WhatsApp API'],
    categories: ['Páginas web'],
    kind: 'Ecosistema Digital',
    path: '/landings/desarrollo-web',
  },
  {
    title: 'Identidad Visual & Contenido Digital',
    subtitle: 'Dirección de arte, diseño de identidad y producción audiovisual de alto impacto para marcas.',
    image: `${estudioAssets}estudio-servicio-contenido.webp`,
    bgImage: `${estudioAssets}estudio-proyecto-hospitalidad.webp`,
    video: '/assets/pages/2-estudio/estudio-social-media-reel.mp4',
    tags: ['Identidad Visual', 'Contenido Visual', 'Dirección de Arte'],
    categories: ['Páginas web'],
    kind: 'Estudio Creativo',
    path: '/landings/identidad-visual',
  },
]

const categories = [
  { label: 'Estudio', detail: 'Branding, contenido visual, estrategia digital y presencia profesional.', path: '/estudio', cta: 'Ver servicios de Estudio' },
  { label: 'Sistemas digitales', detail: 'Automatizacion, canales, webs, CRM, agentes IA y dashboards.', path: '/sistemas-digitales', cta: 'Ver sistemas digitales' },
]

function useHeroCarousel() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return undefined
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length)
    }, 5200)
    return () => clearInterval(id)
  }, [reduceMotion])

  return { index, setIndex, slide: heroSlides[index] }
}

function ProjectCard({ project, index }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!project.video || !videoRef.current) return
    const video = videoRef.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [project.video])

  return (
    <motion.article
      className="group flex flex-col cursor-pointer"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Contenedor con Proporción Horizontal (16/10) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-zinc-950 shadow-md">
        {/* Imagen de Fondo Ambiental: Bokeh fotográfico sutil y sedoso en hover */}
        <img
          src={project.bgImage || project.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover filter blur-0 scale-[1.01] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:blur-[3.5px]"
        />

        {/* Ventana / Mockup Flotante Central con el Video (Más compacta para dar mayor presencia al fondo) */}
        <div className="absolute inset-6 sm:inset-10 z-10 flex items-center justify-center">
          <div className="h-full w-full overflow-hidden rounded-[10px] sm:rounded-[12px] border border-white/40 bg-black shadow-[0_20px_45px_rgba(0,0,0,0.35)] transition-shadow duration-500 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
            {project.video ? (
              <video
                ref={videoRef}
                src={project.video}
                poster={project.image}
                muted
                loop
                playsInline
                autoPlay
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover object-top"
              />
            )}
          </div>
        </div>

        {/* Badge superior derecho */}
        <div className="absolute top-3.5 right-3.5 z-20 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
          {project.kind || 'Proyecto'}
        </div>
      </div>

      {/* Textos Editoriales Debajo (Estilo Benchmark / Desarrollo Web) */}
      <div className="pt-6 pb-2">
        <h3 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.03em] mb-2 leading-[1.25] group-hover:text-[#fe6612] transition-colors">
          {project.title}
        </h3>
        <p className="text-[14px] sm:text-[14.5px] leading-[1.55] text-[#71717a] mb-4 max-w-xl">
          {project.subtitle}
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap gap-4 text-[12px] font-semibold text-[#18181b]/75">
            {project.tags.map((tag) => (
              <span key={tag} className="border-b border-[#20201f]/30 pb-0.5">
                {tag}
              </span>
            ))}
          </div>
          <Link
            to={project.path || '/landings/desarrollo-web'}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#fe6612] transition-colors hover:text-[#e0550a]"
          >
            <span>Ver proyecto</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function StaticProjectCard({ to, image, tag, title, desc, delay = 0, isMockup = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: '0 18px 45px rgba(0,0,0,0.1)', transition: { duration: 0.2, ease: 'easeOut' } }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-[#e4e4e7] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer"
    >
      <Link to={to} className="flex flex-col h-full">
        {isMockup ? (
          <div className="flex h-[260px] sm:h-[300px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#edf0f5] to-[#f8f9fc] p-5 pb-0">
            <div className="h-full w-full overflow-hidden rounded-t-[8px] border border-b-0 border-black/6 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover object-top transition-transform duration-300 ease-out"
              />
            </div>
          </div>
        ) : (
          <div className="relative h-[260px] sm:h-[300px] overflow-hidden bg-zinc-100">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover object-top transition-transform duration-300 ease-out"
            />
            {tag && (
              <div className="absolute top-3.5 right-3.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                {tag}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between p-[24px] sm:p-[26px]">
          <div>
            <h3 className="mb-2.5 text-[19px] font-bold text-[#111111] tracking-[-0.02em] leading-[1.25] transition-colors group-hover:text-[#fe6612]">
              {title}
            </h3>
            <p className="text-[14px] leading-[1.55] text-[#71717a]">
              {desc}
            </p>
          </div>
          <div className="pt-4 flex items-center">
            <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#fe6612] transition-colors">
              <span>Ver proyecto</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ProyectosPage() {
  useSetNavbarVariant('transparent')
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [dbProjects, setDbProjects] = useState(projects)
  const [dynamicFilters, setDynamicFilters] = useState(() => extractVigenteCategories(projects))

  useEffect(() => {
    async function loadProjectsFromSupabase() {
      try {
        const { data, error } = await supabase.from('projects').select('*')
        if (!error && data && data.length > 0) {
          setDbProjects(data)
          setDynamicFilters(extractVigenteCategories(data))
        } else {
          setDbProjects(projects)
          setDynamicFilters(extractVigenteCategories(projects))
        }
      } catch (err) {
        console.warn('Fallback a datos de proyectos:', err)
        setDbProjects(projects)
        setDynamicFilters(extractVigenteCategories(projects))
      }
    }
    loadProjectsFromSupabase()
  }, [])

  const visibleProjects = dbProjects.filter((project) => {
    const matchesFilter = activeFilter === 'Todos' || (project.categories && project.categories.includes(activeFilter))
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || (
      (project.title && project.title.toLowerCase().includes(q)) ||
      (project.subtitle && project.subtitle.toLowerCase().includes(q)) ||
      (project.tags && project.tags.some(t => t.toLowerCase().includes(q))) ||
      (project.categories && project.categories.some(c => c.toLowerCase().includes(q)))
    )
    return matchesFilter && matchesSearch
  })

  return (
    <main className="projects-page">
      <section className="projects-hero border-b border-black/10">
        <div className="projects-shell">
          <motion.div
            className="projects-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Kicker en Cápsula Blanca translúcida */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/15 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-xs shadow-xs">
              <span>/ Proyectos</span>
            </div>
            
            {/* Título Principal Centrado con misma escala que Desarrollo Web */}
            <h1
              className="text-[clamp(2.4rem,4vw,3.4rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Proyectos<span className="text-white/70">.</span>
            </h1>

            {/* Bajada Centrada */}
            <p className="text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Una selección de trabajos donde combinamos dirección de arte, desarrollo web y sistemas de automatización con IA aplicados a marcas reales.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[10px] border border-white/40 bg-white px-4 py-3.5 shadow-[0_10px_32px_rgba(0,0,0,0.14)] transition-all focus-within:ring-2 focus-within:ring-white">
                <Search className="h-5 w-5 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar proyectos por marca, rubro o tipo..."
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

      {/* ========================================================================= */}
      {/* BARRA DE PÍLDORAS / CATEGORÍAS (IDÉNTICA A BLOG CON SUPABASE Y COLOR OFICIAL) */}
      {/* ========================================================================= */}
      <div id="proyectos-listado" className="border-b border-black/10 bg-white py-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="projects-shell flex items-center justify-between gap-4">
          
          {/* Lista de píldoras horizontal */}
          <div className="flex flex-1 items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {dynamicFilters.map((filter) => {
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

          {/* Selector lateral "Ver Todos" */}
          <div className="hidden sm:block">
            <button
              type="button"
              onClick={() => { setActiveFilter('Todos'); setSearchQuery('') }}
              className="flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#191918] transition-colors hover:border-[#fe6612]/50 hover:text-[#fe6612]"
            >
              <span>Ver Todos</span>
              <ChevronDown className="h-3.5 w-3.5 text-black/50" />
            </button>
          </div>

        </div>
      </div>

      <section className="projects-listing">
        <div className="projects-shell">

          {/* ========================================================================= */}
          {/* BLOQUE 1: PROYECTOS ESTÁTICOS (2 FILAS DE 3 COLUMNAS = 6 TARJETAS) */}
          {/* ========================================================================= */}
          {(!searchQuery && (activeFilter === 'Todos' || activeFilter === 'Páginas web')) && (
            <div className="pt-6 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
                
                {/* FILA 1 · FORMATOS WEB CORE */}
                <StaticProjectCard
                  to="/landings/desarrollo-web"
                  image={mockupLandingPages}
                  title="Landing Pages de Captación"
                  desc="Páginas de una sola sección optimizadas para tráfico publicitario, carga instantánea y conversión directa a correo o tu WhatsApp."
                  delay={0.08}
                  isMockup={true}
                />

                <StaticProjectCard
                  to="/landings/desarrollo-web"
                  image={mockupSitiosWeb}
                  title="Sitios Web Corporativos"
                  desc="Estructura multipágina con secciones de servicios, nosotros, blog y formularios para empresas, marcas y profesionales."
                  delay={0.24}
                  isMockup={true}
                />

                <StaticProjectCard
                  to="/landings/desarrollo-web"
                  image={mockupTiendasOnline}
                  title="Tiendas Online (E-commerce)"
                  desc="Plataforma completa de ventas con catálogo autogestionable, carrito de compras y pasarelas de pago para vender 24/7."
                  delay={0.40}
                  isMockup={true}
                />

                {/* FILA 2 · PROYECTOS REALES EN PRODUCCIÓN */}
                <StaticProjectCard
                  to="/proyectos/panaderia-josue"
                  image="/josue-images/showcase/3-josue-panaderia-pedidos-contacto-footer.png"
                  tag="E-commerce & Web"
                  title="Josué Panadería"
                  desc="Sitio web y catálogo digital de panadería artesanal, pedidos directos por WhatsApp y presencia de marca local."
                  delay={0.08}
                />

                <StaticProjectCard
                  to="/proyectos/aurea-skincare"
                  image="/aurea-images/showcase/1-aurea-skincare-showcase.png"
                  tag="Tienda Online"
                  title="Áurea Skincare"
                  desc="E-commerce de cosmética botánica con catálogo dinámico de productos, carrito de compras y diseño editorial."
                  delay={0.24}
                />

                <StaticProjectCard
                  to="/proyectos/plantora"
                  image="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85"
                  tag="Landing Page"
                  title="Plantora Paisajismo"
                  desc="Landing page de alta conversión para proyectos botánicos, arquitectura de paisaje y captación de clientes."
                  delay={0.40}
                />

              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* BLOQUE 2: CORTE VISUAL CON LOGOTIPOS Y MARCAS EN BLANCO (ESTILO BENCHMARK) */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* BLOQUE 3: PROYECTOS EN MOVIMIENTO (1 FILA DE 2 COLUMNAS CON VIDEO REAL) */}
      {/* ========================================================================= */}
      <section className="bg-[#fafaf9] py-18 sm:py-24 border-b border-black/6">
        <div className="projects-shell">
          
          {/* Encabezado divisor de sección (Estilo Desarrollo Web, 100% Centrado) */}
          <motion.div
            className="text-center max-w-2xl mx-auto pb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h2 className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-bold text-[#111111] tracking-[-0.03em] leading-[1.18] mb-3.5">
              Proyectos en funcionamiento
            </h2>
            <p className="text-[#71717a] text-[15px] sm:text-[16px] leading-[1.55] max-w-[620px] mx-auto">
              Plataformas vivas, interacción en tiempo real y sistemas desplegados para marcas en producción.
            </p>
          </motion.div>

          {/* Grilla de 2 columnas para videos amplios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BLOQUE 4: SEPARADOR EDITORIAL (100% CENTRADO ESTILO DESARROLLO WEB) */}
      {/* BLOQUE 5: PRESENTACIÓN DE MOCKUPS EN FORMATO CELULAR (4 COLUMNAS) */}
      {/* ========================================================================= */}
      <section className="bg-white py-18 sm:py-26">
        <div className="projects-shell">
          
          {/* Separador Editorial Centrado */}
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

          {/* Grilla de 4 Columnas: Mockups de Teléfono Celular Vertical */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
            {[
              {
                title: 'E-commerce & Catálogo',
                desc: 'Checkout fluido y navegación de producto ágil en dispositivos móviles.',
                image: mockupAureaSkincare,
                tag: 'Mobile Store',
                statusBg: '#FAF7F2',
                statusColor: '#111111'
              },
              {
                title: 'Captación Inmobiliaria',
                desc: 'Tours inmersivos y contacto directo a WhatsApp en un solo toque.',
                image: estudioAssets + 'estudio-proyecto-arquitectura.webp',
                tag: 'Lead Directo'
              },
              {
                title: 'Gastronomía & Reservas',
                desc: 'Menús digitales y reserva de mesas optimizados para carga ultra rápida.',
                image: estudioAssets + 'estudio-proyecto-cafe.webp',
                tag: 'Experiencia'
              },
              {
                title: 'Servicios Profesionales',
                desc: 'Agendamiento de citas y presentación corporativa de alta credibilidad.',
                image: sistemasAssets + 'content-ops-command-center.webp',
                tag: 'Agendamiento'
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
                {/* Marco de Teléfono Celular Moderno en Titanio Iluminado (Sin botones, con destello metálico) */}
                <div className="relative w-full max-w-[270px] aspect-[9/18.5] rounded-[34px] bg-gradient-to-tr from-[#18181b] via-[#8e8e93] via-35% to-[#27272a] p-[3.5px] ring-1 ring-white/35 shadow-[0_22px_50px_rgba(0,0,0,0.15),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_65px_rgba(0,0,0,0.22),inset_0_1.5px_2.5px_rgba(255,255,255,0.85)]">
                  {/* Pantalla Interna del Celular con Status Bar Integrada */}
                  <div className="h-full w-full overflow-hidden rounded-[28px] relative flex flex-col" style={{ backgroundColor: mockup.statusBg || '#ffffff' }}>
                    {/* Barra de estado (Hora, Señal, WiFi, Batería) */}
                    <div className="h-6 w-full px-4 pt-1 flex items-center justify-between shrink-0 select-none z-10" style={{ backgroundColor: mockup.statusBg || '#ffffff', color: mockup.statusColor || '#111111' }}>
                      <span className="text-[11px] font-semibold tracking-tight">9:41</span>
                      <div className="flex items-center gap-1.5 opacity-90">
                        {/* Señal */}
                        <svg className="w-3.5 h-2.5" viewBox="0 0 17 11" fill="currentColor">
                          <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                          <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.5" />
                          <rect x="9" y="3" width="2.5" height="8" rx="0.5" />
                          <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" />
                        </svg>
                        {/* WiFi */}
                        <svg className="w-3.5 h-2.5" viewBox="0 0 16 12" fill="currentColor">
                          <path d="M8 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.89-3.64a5.5 5.5 0 0 1 7.78 0 .75.75 0 1 0 1.06-1.06 7 7 0 0 0-9.9 0 .75.75 0 0 0 1.06 1.06zm-2.83-2.83a9.5 9.5 0 0 1 13.44 0 .75.75 0 1 0 1.06-1.06 11 11 0 0 0-15.56 0 .75.75 0 1 0 1.06 1.06z" />
                        </svg>
                        {/* Batería */}
                        <div className="flex items-center">
                          <div className="w-[18px] h-[9px] rounded-[2.5px] border border-current p-[1px] flex items-center">
                            <div className="h-full w-3/4 bg-current rounded-[1px]" />
                          </div>
                          <div className="w-[1.5px] h-[3.5px] bg-current rounded-r-[0.8px]" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Pantalla del sitio web */}
                    <div className="flex-1 w-full overflow-hidden relative">
                      <img
                        src={mockup.image}
                        alt={mockup.title}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                {/* Textos descriptivos debajo del móvil homologados en jerarquía */}
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
                    to="/landings/desarrollo-web"
                    className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#fe6612] transition-colors hover:text-[#e0550a]"
                  >
                    <span>Ver proyecto</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-areas overflow-hidden">
        <div className="projects-shell projects-areas__grid">
          {categories.map((category, idx) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, x: idx === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="h-full flex flex-col pt-2"
            >
              <Link to={category.path} className="projects-area-card h-full">
                <span>Proyectos / {category.label}</span>
                <h2>{category.label}</h2>
                <p>{category.detail}</p>
                <small>{category.cta} <ArrowRight size={14} /></small>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

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
