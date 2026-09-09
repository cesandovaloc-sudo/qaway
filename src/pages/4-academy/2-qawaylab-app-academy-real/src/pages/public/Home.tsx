import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { getFeaturedCourses, getPopularCourses, getNewCourses, getTopRatedCourses } from '@/lib/services'

interface HomeCourse {
  id?: string
  slug: string
  title: string
  image_url?: string | null
  badge?: string | null
  level?: string | null
  duration?: string | null
  instructor?: { full_name?: string | null } | null
  is_free?: boolean | null
}

const benefits = [
  { label: '01', title: 'Aprendizaje aplicado', desc: 'Cursos pensados para convertir herramientas, procesos e IA en trabajo real.' },
  { label: '02', title: 'Progreso visible', desc: 'Avance, lecciones, recursos y certificados dentro de una experiencia ordenada.' },
  { label: '03', title: 'Rutas por rol', desc: 'Alumno, docente y administrador trabajan en espacios separados y conectados.' },
  { label: '04', title: 'Base para empresas', desc: 'La plataforma está preparada para cursos, pagos, permisos y seguimiento.' },
]

export default function Home() {
  const { data: featuredCourses } = useData(() => getFeaturedCourses(), [])
  const { data: popularCourses } = useData(() => getPopularCourses(), [])
  const { data: newCourses } = useData(() => getNewCourses(), [])
  const { data: topRatedCourses } = useData(() => getTopRatedCourses(), [])

  const fallbackFeatured: HomeCourse[] = [
    { slug: 'curso-ejemplo-1', title: 'Introducción al Desarrollo Web', instructor: { full_name: 'Qaway Lab' }, level: 'Principiante', duration: '20h', image_url: null, badge: 'Nuevo' },
    { slug: 'curso-ejemplo-2', title: 'JavaScript Avanzado', instructor: { full_name: 'Qaway Lab' }, level: 'Intermedio', duration: '30h', image_url: null, badge: 'Popular' },
    { slug: 'curso-ejemplo-3', title: 'React & Modern Frontend', instructor: { full_name: 'Qaway Lab' }, level: 'Avanzado', duration: '40h', image_url: null, badge: 'Certificado' },
  ]

  const featured = featuredCourses?.length ? featuredCourses : fallbackFeatured
  const popular = popularCourses || []
  const newest = newCourses || []
  const topRated = topRatedCourses || []

  function CourseCard({ course, featuredCard = false }: { course: HomeCourse; featuredCard?: boolean }) {
    return (
      <Link to={`/academy/app/cursos/${course.slug}`} className={`card-hover group overflow-hidden ${featuredCard ? 'lg:row-span-2' : ''}`}>
        {course.image_url ? (
          <div className={`${featuredCard ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-video'} overflow-hidden bg-surface-200`}>
            <img src={course.image_url} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" loading="lazy" />
          </div>
        ) : (
          <div className={`${featuredCard ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-video'} flex items-center justify-center bg-surface-900 text-primary-500`}>
            <span className="font-display text-6xl font-bold tracking-[-0.06em]">QL</span>
          </div>
        )}
        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {course.badge && <span className="badge-primary">{course.badge}</span>}
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-surface-500">{course.level}</span>
          </div>
          <h3 className="font-display text-2xl font-bold leading-none tracking-[-0.055em] text-surface-900 transition-colors group-hover:text-primary-600">{course.title}</h3>
          <p className="mt-3 text-sm text-surface-500">{course.instructor?.full_name || 'Qaway Lab'}</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-200 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-surface-500">
            <span>{course.duration || 'A tu ritmo'}</span>
            {course.is_free && <span className="text-primary-600">Gratis</span>}
          </div>
        </div>
      </Link>
    )
  }

  function Section({ title, subtitle, courses, linkTo }: { title: string; subtitle: string; courses: HomeCourse[] | null | undefined; linkTo: string }) {
    if (!courses || courses.length === 0) return null
    return (
      <section className="bg-white py-20">
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-600">Academy</p>
              <h2 className="section-title">{title}</h2>
              <p className="section-subtitle mt-2">{subtitle}</p>
            </div>
            <Link to={linkTo} className="btn-ghost text-sm">Ver todos</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.slug || course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="page-container grid min-h-[calc(100dvh-80px)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-primary-600">Qaway Lab Academy</p>
            <h1 className="font-display text-[clamp(3.7rem,8vw,7.4rem)] font-bold leading-[0.82] tracking-[-0.065em] text-surface-900">
              Aprende a convertir herramientas en sistemas reales.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-[1.55] text-surface-600">
              Cursos prácticos para aplicar IA, procesos y tecnología con estructura, criterio y avance medible.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/academy/app/cursos" className="btn-primary min-h-14 px-7 text-base">Explorar cursos</Link>
              <Link to="/academy/app/registro" className="btn-secondary min-h-14 px-7 text-base">Crear cuenta</Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card bg-surface-950 p-7 text-white lg:mt-20">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-400">Plataforma</p>
              <h2 className="mt-8 font-display text-5xl font-bold leading-[0.88] tracking-[-0.06em]">Cursos, progreso y roles en un solo flujo.</h2>
            </div>
            <div className="card bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Estado</p>
              <div className="mt-10 grid gap-5">
                {['Catálogo real', 'Panel alumno', 'Panel docente', 'Admin y pagos'].map((item) => (
                  <div key={item} className="border-t border-surface-200 pt-4 text-sm font-semibold text-surface-800">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="page-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="border-t border-surface-200 pt-5">
              <span className="text-xs font-bold text-primary-600">{benefit.label}</span>
              <h3 className="mt-5 font-display text-3xl font-bold leading-none tracking-[-0.055em] text-surface-900">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-surface-500">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-950 py-20 text-white">
        <div className="page-container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-400">Cursos destacados</p>
              <h2 className="font-display text-[clamp(3rem,5vw,5.5rem)] font-bold leading-[0.86] tracking-[-0.06em]">Empieza por una habilidad concreta.</h2>
            </div>
            <Link to="/academy/app/cursos" className="btn-secondary border-white/20 bg-white text-surface-950 hover:bg-primary-500 hover:text-white">Ver catálogo</Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {featured.slice(0, 3).map((course, index) => (
              <CourseCard key={course.slug || course.id} course={course} featuredCard={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {popular.length > 0 && <Section title="Más populares" subtitle="Los cursos con más estudiantes inscritos." courses={popular} linkTo="/cursos" />}
      <Section title="Cursos nuevos" subtitle="Lo último publicado en la plataforma." courses={newest} linkTo="/cursos" />
      {topRated.length > 0 && <Section title="Mejor calificados" subtitle="Cursos con mayor actividad y completitud." courses={topRated} linkTo="/cursos" />}

      <section className="bg-primary-600 py-20 text-white">
        <div className="page-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/75">Siguiente paso</p>
            <h2 className="font-display text-[clamp(3rem,5vw,5.4rem)] font-bold leading-[0.86] tracking-[-0.06em]">Revisa la plataforma desde adentro.</h2>
            <p className="mt-5 max-w-xl text-white/80">Crea una cuenta, explora el catálogo y valida el flujo completo antes de conectarla con la web principal.</p>
          </div>
          <Link to="/academy/app/registro" className="inline-flex min-h-14 items-center justify-center bg-surface-950 px-7 text-sm font-bold text-white transition-colors hover:bg-surface-900">Crear cuenta</Link>
        </div>
      </section>
    </div>
  )
}