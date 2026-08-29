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

const OFFICIAL_CATEGORIES = ['Branding', 'Contenido visual', 'Sistemas digitales', 'Automatización', 'Páginas web']

function extractVigenteCategories(projectsList) {
  const activeSet = new Set(projectsList.flatMap((p) => p.categories || []))
  const vigenteOfficial = OFFICIAL_CATEGORIES.filter((cat) => activeSet.has(cat))
  return ['Todos', ...vigenteOfficial]
}

const projects = [
  {
    title: 'Brenda y Ely Cafe',
    subtitle: 'Cafeteria joven en San Miguel',
    image: `${estudioAssets}estudio-proyecto-cafe.webp`,
    tags: ['Branding', 'Contenido visual', 'Aplicaciones de marca'],
    categories: ['Branding', 'Contenido visual'],
    kind: 'Proyecto',
    featured: true,
  },
  {
    title: 'Clinica Dental',
    subtitle: 'Identidad visual para consulta profesional',
    image: `${estudioAssets}estudio-proyecto-arquitectura.webp`,
    tags: ['Branding', 'Contenido visual'],
    categories: ['Branding', 'Contenido visual'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Rapigo',
    subtitle: 'Sistema visual para servicio digital',
    image: `${sistemasAssets}content-ops-command-center.webp`,
    tags: ['Sistemas digitales', 'Páginas web', 'Automatización'],
    categories: ['Sistemas digitales', 'Páginas web', 'Automatización'],
    kind: 'Proyecto',
  },
  {
    title: 'Estudio Juridico',
    subtitle: 'Presencia digital sobria y profesional',
    image: `${estudioAssets}estudio-copy-showcase-web.webp`,
    tags: ['Branding', 'Páginas web'],
    categories: ['Branding', 'Páginas web'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Fisioterapia',
    subtitle: 'Presencia profesional para servicio local',
    image: `${estudioAssets}estudio-servicio-presencia.webp`,
    tags: ['Branding', 'Contenido visual'],
    categories: ['Branding', 'Contenido visual'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Qaway Academy',
    subtitle: 'Experiencia educativa y sistema de contenidos',
    image: '/assets/pages/1-inicio/aprendizaje-aplicado.webp',
    tags: ['Contenido visual', 'Sistemas digitales', 'Páginas web'],
    categories: ['Contenido visual', 'Sistemas digitales', 'Páginas web'],
    kind: 'Proyecto',
  },
  {
    title: 'Lumina Skin',
    subtitle: 'Branding y packaging para linea cosmetica',
    image: `${estudioAssets}estudio-proyecto-hospitalidad.webp`,
    tags: ['Branding', 'Packaging'],
    categories: ['Branding'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Mesa Selecta',
    subtitle: 'Marca premium para producto gourmet',
    image: `${estudioAssets}estudio-servicio-contenido.webp`,
    tags: ['Branding', 'Contenido visual', 'Packaging'],
    categories: ['Branding', 'Contenido visual'],
    kind: 'Proyecto',
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

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  return (
    <motion.article
      className="projects-card group cursor-pointer"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="projects-card__image">
        {project.video ? (
          <video
            ref={videoRef}
            src={project.video}
            poster={project.image}
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <img
            src={project.image}
            alt={`Proyecto ${project.title}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute top-3.5 right-3.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
          {project.kind || 'Proyecto'}
        </div>
      </div>
      <div className="projects-card__body">
        <h3 className="group-hover:text-[#fe6612] transition-colors">{project.title}</h3>
        <p>{project.subtitle}</p>
        <div className="projects-card__tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.article>
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
        }
      } catch (err) {
        console.warn('Fallback a datos de proyectos:', err)
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

          {/* Fila Principal de Proyectos Web Destacados */}
          {(!searchQuery && (activeFilter === 'Todos' || activeFilter === 'Páginas web')) && (
            <div className="pt-6 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta 1: Landing Pages */}
                <Link
                  to="/landings/desarrollo-web"
                  className="group flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] cursor-pointer"
                >
                  <div className="flex h-[260px] sm:h-[300px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#edf0f5] to-[#f8f9fc] p-5 pb-0">
                    <div className="h-full w-full overflow-hidden rounded-t-[8px] border border-b-0 border-black/5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                      <img
                        src={mockupLandingPages}
                        alt="Landing Pages de Captación"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-[#111210] tracking-[-0.02em] transition-colors group-hover:text-[#fe6612]">
                        Landing Pages de Captación
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-[#71717a]">
                        Páginas de una sola sección optimizadas para tráfico publicitario, carga instantánea y conversión directa a correo o tu WhatsApp.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Tarjeta 2: Sitios Web Corporativos */}
                <Link
                  to="/landings/desarrollo-web"
                  className="group flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] cursor-pointer"
                >
                  <div className="flex h-[260px] sm:h-[300px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#edf0f5] to-[#f8f9fc] p-5 pb-0">
                    <div className="h-full w-full overflow-hidden rounded-t-[8px] border border-b-0 border-black/5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                      <img
                        src={mockupSitiosWeb}
                        alt="Sitios Web Corporativos"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-[#111210] tracking-[-0.02em] transition-colors group-hover:text-[#fe6612]">
                        Sitios Web Corporativos
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-[#71717a]">
                        Estructura multipágina con secciones de servicios, nosotros, blog y formularios para empresas, marcas y profesionales.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Tarjeta 3: Tiendas Online */}
                <Link
                  to="/landings/desarrollo-web"
                  className="group flex flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] cursor-pointer"
                >
                  <div className="flex h-[260px] sm:h-[300px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#edf0f5] to-[#f8f9fc] p-5 pb-0">
                    <div className="h-full w-full overflow-hidden rounded-t-[8px] border border-b-0 border-black/5 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                      <img
                        src={mockupTiendasOnline}
                        alt="Tiendas Online (E-commerce)"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-[#111210] tracking-[-0.02em] transition-colors group-hover:text-[#fe6612]">
                        Tiendas Online (E-commerce)
                      </h3>
                      <p className="text-[13.5px] leading-relaxed text-[#71717a]">
                        Plataforma completa de ventas con catálogo autogestionable, carrito de compras y pasarelas de pago para vender 24/7.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {activeFilter === 'Todos' && (
            <motion.article
              className="projects-featured hidden md:grid"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="projects-featured__media">
                <img src={`${estudioAssets}estudio-proyecto-cafe.webp`} alt="Aplicaciones de marca Brenda y Ely Cafe" />
                <div className="projects-palette" aria-hidden="true">
                  {['#101010', '#32170c', '#fe6612', '#788348', '#e8dece', '#f5f0e7'].map((color) => <span key={color} style={{ background: color }} />)}
                </div>
              </div>
              <div className="projects-featured__copy">
                <p><i />Proyecto destacado</p>
                <h3>Brenda y Ely Cafe</h3>
                <strong>Cafeteria joven en San Miguel</strong>
                <span>Desarrollamos su identidad de marca, estrategia de contenido y aplicaciones en clave digital y fisica para conectar con una comunidad que valora el buen cafe y los momentos autenticos.</span>
                <div className="projects-featured__tags">
                  <small>Branding</small>
                  <small>Contenido visual</small>
                  <small>Aplicaciones de marca</small>
                </div>
                <Link to="/proyectos/estudio/branding/cafe-brenda-y-ely">Ver proyecto completo <ArrowRight size={15} /></Link>
              </div>
            </motion.article>
          )}

          <div className="projects-grid">
            {visibleProjects.map((project, projectIndex) => (
              <div key={project.title} className={activeFilter === 'Todos' && projectIndex === 0 ? 'hidden md:contents' : 'contents'}>
                <ProjectCard project={project} index={projectIndex} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DESCANSO VISUAL: MARCAS Y CLIENTES EN MONOCROMO ESTÁTICO (MINIMALISTA) */}
      {/* ========================================================================= */}
      <section className="border-y border-black/5 bg-[#fafaf9] py-14 sm:py-16">
        <div className="projects-shell">
          <div className="mb-6 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#71717a]">
              Marcas y ecosistemas que confían en Qaway Lab
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6 items-center justify-items-center opacity-70">
            {['VALLET INMOBILIARIA', 'ECP CONTABILIDAD', 'GELATO LAB', 'BRENDA & ELY', 'HORIZONTE DIGITAL', 'SANICLICK'].map((name) => (
              <span
                key={name}
                className="font-mono text-xs font-bold uppercase tracking-wider text-[#191918]/60 transition-colors hover:text-[#fe6612]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VITRINA POR SECTORES Y EXPERIENCIA MOBILE */}
      {/* ========================================================================= */}
      <section className="bg-white py-16 sm:py-24">
        <div className="projects-shell">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#fe6612]">
              <span>/ Adaptación y sectores</span>
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#111210] sm:text-4xl mb-3">
              Soluciones diseñadas para cada tipo de industria
            </h2>
            <p className="text-base text-[#71717a] leading-relaxed">
              Experiencias pensadas primero en la conversión móvil y en los objetivos comerciales específicos de cada rubro.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Inmobiliario & Construcción',
                desc: 'Captación de compradores con recorridos y cotizadores integrados a WhatsApp.',
                image: estudioAssets + 'estudio-proyecto-arquitectura.webp',
                tag: 'Captación Rápida'
              },
              {
                title: 'Servicios B2B & Consultoría',
                desc: 'Estructuras corporativas con agendamiento y autoridad visual inmediata.',
                image: sistemasAssets + 'content-ops-command-center.webp',
                tag: 'Alta Conversión'
              },
              {
                title: 'Gastronomía & Experiencias',
                desc: 'Menús digitales, reservas directas y contenido visual inmersivo.',
                image: estudioAssets + 'estudio-proyecto-cafe.webp',
                tag: 'Mobile First'
              },
              {
                title: 'Retail & E-commerce',
                desc: 'Catálogos autogestionables con checkout fluido y pasarelas 24/7.',
                image: estudioAssets + 'estudio-servicio-contenido.webp',
                tag: 'Ventas 24/7'
              }
            ].map((sector, i) => (
              <motion.div
                key={sector.title}
                className="group flex flex-col overflow-hidden rounded-[14px] border border-black/8 bg-[#fafaf9] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black/15"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="relative h-48 overflow-hidden bg-zinc-200">
                  <img
                    src={sector.image}
                    alt={sector.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                    {sector.tag}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="mb-1.5 text-base font-bold text-[#111210] group-hover:text-[#fe6612] transition-colors">
                      {sector.title}
                    </h3>
                    <p className="text-xs text-[#71717a] leading-relaxed">
                      {sector.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-areas">
        <div className="projects-shell projects-areas__grid">
          {categories.map((category) => (
            <Link key={category.label} to={category.path} className="projects-area-card">
              <span>Proyectos / {category.label}</span>
              <h2>{category.label}</h2>
              <p>{category.detail}</p>
              <small>{category.cta} <ArrowRight size={14} /></small>
            </Link>
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
