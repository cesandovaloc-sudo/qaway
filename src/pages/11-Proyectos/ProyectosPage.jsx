import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { supabase } from '@/config/supabase'
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

const filters = ['Todos', 'Branding', 'Contenido visual', 'Presencia digital', 'Web']

const projects = [
  {
    title: 'Brenda y Ely Cafe',
    subtitle: 'Cafeteria joven en San Miguel',
    image: `${estudioAssets}estudio-proyecto-cafe.webp`,
    tags: ['Branding', 'Contenido visual', 'Aplicaciones de marca'],
    categories: ['Branding', 'Contenido visual', 'Presencia digital'],
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
    tags: ['Branding', 'Web', 'Sistema digital'],
    categories: ['Branding', 'Presencia digital', 'Web'],
    kind: 'Proyecto',
  },
  {
    title: 'Estudio Juridico',
    subtitle: 'Presencia digital sobria y profesional',
    image: `${estudioAssets}estudio-copy-showcase-web.webp`,
    tags: ['Branding', 'Web'],
    categories: ['Branding', 'Presencia digital', 'Web'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Fisioterapia',
    subtitle: 'Presencia profesional para servicio local',
    image: `${estudioAssets}estudio-servicio-presencia.webp`,
    tags: ['Branding', 'Contenido visual'],
    categories: ['Branding', 'Contenido visual', 'Presencia digital'],
    kind: 'Caso aplicado por rubro',
  },
  {
    title: 'Qaway Academy',
    subtitle: 'Experiencia educativa y sistema de contenidos',
    image: '/assets/pages/1-inicio/aprendizaje-aplicado.webp',
    tags: ['Contenido visual', 'Web'],
    categories: ['Contenido visual', 'Web'],
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
    }, 4200)
    return () => clearInterval(id)
  }, [reduceMotion])

  return { index, setIndex, slide: heroSlides[index] }
}

function ProjectCard({ project, index }) {
  return (
    <motion.article
      className={`projects-card ${project.tall ? 'projects-card--tall' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: Math.min(index * 0.05, 0.25), ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="projects-card__image">
        <img src={project.image} alt={`Proyecto ${project.title}`} loading="lazy" />
      </div>
      <div className="projects-card__body">
        <h3>{project.title}</h3>
        <p>{project.subtitle}</p>
        <div className="projects-card__tags">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <small><i />{project.kind}</small>
      </div>
    </motion.article>
  )
}

export default function ProyectosPage() {
  useSetNavbarVariant('brand')
  const { index, setIndex, slide } = useHeroCarousel()
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [dbProjects, setDbProjects] = useState(projects)
  const [dynamicFilters, setDynamicFilters] = useState(() => ['Todos', ...Array.from(new Set(projects.flatMap((p) => p.categories || [])))])
  const filtersRef = useRef(null)

  useEffect(() => {
    async function loadProjectsFromSupabase() {
      try {
        const { data, error } = await supabase.from('projects').select('*')
        if (!error && data && data.length > 0) {
          setDbProjects(data)
          const categoriesSet = new Set(data.flatMap((p) => p.categories || []))
          setDynamicFilters(['Todos', ...Array.from(categoriesSet)])
        }
      } catch (err) {
        console.warn('Fallback a datos de proyectos:', err)
      }
    }
    loadProjectsFromSupabase()
  }, [])

  const visibleProjects = dbProjects.slice(1).filter((project) => activeFilter === 'Todos' || (project.categories && project.categories.includes(activeFilter)))

  const scrollFilters = (direction) => {
    if (filtersRef.current) {
      const amount = direction === 'left' ? -160 : 160
      filtersRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  return (
    <main className="projects-page">
      <section className="projects-hero">
        <div className="projects-shell projects-hero__grid">
          <motion.div
            className="projects-hero__copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="projects-kicker">Proyectos / branding, contenido y presencia digital</p>
            <h1 className="qw-hero-title">Proyectos que tomaron forma</h1>
            <p className="projects-hero__lead">Una seleccion de trabajos donde combinamos direccion visual y sistemas aplicados a marcas reales.</p>
            <a className="projects-button" href="#proyectos-listado">Explorar proyectos <ArrowRight size={16} /></a>
          </motion.div>

          <div className="projects-hero__visual" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={slide.title}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={slide.image} alt={slide.title} />
                <figcaption>
                  <span>{slide.eyebrow}</span>
                  <strong>{slide.title}</strong>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <div className="projects-hero__dots" role="tablist" aria-label="Proyectos destacados">
              {heroSlides.map((item, slideIndex) => (
                <button
                  key={item.title}
                  type="button"
                  className={slideIndex === index ? 'is-active' : ''}
                  onClick={() => setIndex(slideIndex)}
                  aria-label={`Ver ${item.title}`}
                  aria-pressed={slideIndex === index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proyectos-listado" className="projects-listing">
        <div className="projects-shell">
          <div className="projects-filters" aria-label="Categorias de proyectos">
            <div className="projects-filters-container">
              <button
                type="button"
                className="projects-filters-scroll-btn projects-filters-scroll-btn--left"
                onClick={() => scrollFilters('left')}
                aria-label="Desplazar filtros a la izquierda"
              >
                <ChevronLeft size={18} strokeWidth={2.25} />
              </button>
              <div ref={filtersRef} className="projects-filters__items">
                {dynamicFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={activeFilter === filter ? 'is-active' : ''}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="projects-filters-scroll-btn projects-filters-scroll-btn--right"
                onClick={() => scrollFilters('right')}
                aria-label="Desplazar filtros a la derecha"
              >
                <ChevronRight size={18} strokeWidth={2.25} />
              </button>
            </div>
            <div className="projects-legend">
              <span><i className="is-project" />Proyecto</span>
              <span><i />Caso aplicado por rubro</span>
            </div>
          </div>

          {activeFilter === 'Todos' && (
            <motion.article
              className="projects-featured"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="projects-featured__media">
                <img src={`${estudioAssets}estudio-proyecto-cafe.webp`} alt="Aplicaciones de marca Brenda y Ely Cafe" />
                <div className="projects-palette" aria-hidden="true">
                  {['#101010', '#32170c', '#ff4b0b', '#788348', '#e8dece', '#f5f0e7'].map((color) => <span key={color} style={{ background: color }} />)}
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
              <ProjectCard key={project.title} project={project} index={projectIndex} />
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
