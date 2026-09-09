import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { getCourses, getCategories } from '@/lib/services'
import type { Course } from '@/lib/types'

const levels = ['Todos', 'Principiante', 'Intermedio', 'Avanzado']

function formatPrice(course: Course) {
  if (course?.is_free) return 'Gratis'
  if (course?.price == null || course.price === '') return 'Consultar'
  if (typeof course.price === 'number') return `$${course.price}`
  return `${course.price}`
}

function WebStyleCourseCard({ course }: { course: Course }) {
  return (
    <article className="group relative flex h-full min-h-[24.5rem] flex-col overflow-hidden rounded-md border border-black/10 bg-white shadow-[0_18px_48px_rgba(75,55,44,0.07)] transition-[box-shadow,border-color] duration-300 ease-out hover:border-black/15 hover:shadow-[0_16px_40px_rgba(75,55,44,0.08)]">
      <div className="relative h-[10.75rem] w-full overflow-hidden bg-[#ddd9d2] after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:from-55% after:to-[#191614]/20">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.012]" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#ddd9d2]">
            <span className="text-4xl text-primary-300">📚</span>
          </div>
        )}
        {course.featured && (
          <span className="absolute left-[0.65rem] top-[0.65rem] z-10 bg-[#ff4b0b] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-white">
            Destacado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.69rem] font-bold uppercase tracking-[0.08em] text-[#ff4b0b]">
            {course.category}
          </span>
          {course.level && (
            <span className="text-[0.65rem] font-semibold text-surface-500 bg-surface-100 px-2 py-0.5 uppercase tracking-wider">
              {course.level}
            </span>
          )}
        </div>
        
        <h3 className="mt-3.5 line-clamp-2 text-[1.26rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#20201f]">
          {course.title}
        </h3>
        
        <p className="mt-2 text-[0.76rem] font-medium text-surface-500">
          {course.instructor?.full_name || 'Instructor por definir'}
        </p>

        <p className="mt-3 line-clamp-2 text-[0.82rem] leading-[1.45] text-surface-500">
          {course.description || 'Descripción del curso. Aprende los fundamentos y mejores prácticas.'}
        </p>
        
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.68rem] font-semibold text-[#5f5d59]">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Curso práctico
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {course.duration || 'Próximamente'}
          </span>
        </div>
        
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <Link to={`/cursos/${course.slug}`} className="inline-flex items-center gap-2 text-[0.84rem] font-bold text-[#ff4b0b] transition-colors group-hover:text-[#ff4b0b]">
            Ver contenido
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
          <span className={`shrink-0 text-[0.84rem] font-bold ${course.is_free ? 'text-emerald-600' : 'text-surface-900'}`}>
            {formatPrice(course)}
          </span>
        </div>
      </div>
    </article>
  )
}

export default function Courses() {
  const { data: courses, loading, error } = useData(() => getCourses(), [])
  const { data: dbCategories } = useData(() => getCategories({ activeOnly: true }), [])

  // Solo mostramos botones para categorías que tienen al menos un curso publicado.
  // El orden de referencia lo da la tabla categories (sort_order).
  const categoryOrder = new Map((dbCategories || []).map((c, i) => [c.name, i]))
  const usedCategories = [...new Set((courses || []).map(c => c.category).filter((c): c is string => Boolean(c)))]
  const categories = ['Todos', ...usedCategories.sort((a, b) => (categoryOrder.get(a) ?? 999) - (categoryOrder.get(b) ?? 999))]
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [activeLevel, setActiveLevel] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  const featured = (courses || []).filter((course) => course.featured)

  const filtered = (courses || []).filter((course) => {
    const matchCategory = activeCategory === 'Todos' || course.category === activeCategory
    const matchLevel = activeLevel === 'Todos' || course.level === activeLevel
    const matchSearch = !searchQuery || course.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchLevel && matchSearch
  })

  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [carouselReady, setCarouselReady] = useState(false)
  const [carouselPaused, setCarouselPaused] = useState(false)

  useEffect(() => {
    if (!carouselReady || carouselPaused) return undefined
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduceMotion) return undefined

    const el = carouselRef.current as HTMLDivElement | null
    if (!el) return undefined

    const step = () => {
      const child = el.querySelector(':scope > *')
      const cardWidth = child ? child.getBoundingClientRect().width + 20 : el.clientWidth
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      el.scrollBy({ left: atEnd ? -el.scrollLeft : cardWidth, behavior: 'smooth' })
    }

    const timer = window.setInterval(step, 5000)
    return () => window.clearInterval(timer)
  }, [carouselReady, carouselPaused, featured.length])

  return (
    <div className="py-12">
      <div className="page-container mb-8">
        <h1 className="section-title">Catálogo de Cursos</h1>
        <p className="section-subtitle mt-1">Explora todos los cursos disponibles en la plataforma</p>
      </div>

      <div className="page-container mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#ff4b0b] text-white'
                    : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={activeLevel} onChange={(e) => setActiveLevel(e.target.value)} className="input-field w-auto">
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-56"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-container">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
              <p className="mt-3 text-sm text-surface-500">Cargando cursos...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="page-container">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">⚠</span>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No pudimos cargar el catálogo</h3>
            <p className="text-sm text-surface-500 max-w-md">La consulta de cursos falló. Revisa seed, datos o policies antes de seguir afinando la interfaz.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="page-container">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No encontramos cursos</h3>
            <p className="text-sm text-surface-500">Intenta con otros filtros o términos de búsqueda</p>
          </div>
        </div>
      ) : (
        <>
          {/* Primeras 2 filas del catálogo */}
          <div className="page-container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 6).map((course) => (
                <WebStyleCourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>

          {/* Tercera fila: galería de destacados a ancho completo con fondo carbón (estilo web academy) */}
          {featured.length > 0 && (
            <section className="relative my-12 w-full overflow-hidden bg-[#20201f] py-12 lg:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff4b0b]/10 blur-3xl" />
              <div className="page-container">
                <div
                  ref={(node) => {
                    carouselRef.current = node
                    if (node && !carouselReady) setCarouselReady(true)
                  }}
                  role="region"
                  aria-label="Cursos destacados"
                  onMouseEnter={() => setCarouselPaused(true)}
                  onMouseLeave={() => setCarouselPaused(false)}
                  onFocus={() => setCarouselPaused(true)}
                  onBlur={() => setCarouselPaused(false)}
                  className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {featured.map((course) => (
                    <div key={course.slug} className="w-[18rem] flex-shrink-0 snap-start sm:w-[20rem]">
                      <WebStyleCourseCard course={course} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Resto del catálogo */}
          {filtered.length > 6 && (
            <div className="page-container">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(6).map((course) => (
                  <WebStyleCourseCard key={course.slug} course={course} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
