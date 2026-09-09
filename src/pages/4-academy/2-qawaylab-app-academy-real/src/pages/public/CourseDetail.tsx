import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/hooks/useData'
import { enrollStudent, getCourseBySlug, getEnrollment } from '@/lib/services'
import type { Course } from '@/lib/types'

function formatPrice(course: Course | null | undefined) {
  if (course?.is_free) return 'Gratis'
  if (course?.price == null || course.price === '') return 'Consultar'
  if (typeof course.price === 'number') return `$${course.price}`
  return `${course.price}`
}

export default function CourseDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: courseData, loading, error } = useData(() => (slug ? getCourseBySlug(slug) : Promise.resolve(null)), [slug])
  const [openModule, setOpenModule] = useState(-1) // ninguno desplegado por defecto
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')
  const toggleModule = (index: number) => {
    setOpenModule(prev => (prev === index ? -1 : index))
  }

  async function handlePrimaryAction() {
    setEnrollError('')
    if (!courseData) return

    if (!user) {
      navigate(`/academy/app/acceder?redirect=/academy/app/cursos/${slug}`)
      return
    }

    if (!courseData?.is_free) {
      navigate(`/academy/app/checkout?curso=${courseData.slug}`)
      return
    }

    setEnrolling(true)
    try {
      const existingEnrollment = await getEnrollment(user.id, courseData.id)
      if (!existingEnrollment) {
        await enrollStudent(user.id, courseData.id)
      }
      navigate(`/academy/app/panel/cursos/${courseData.slug}`)
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : String(err) || 'No pudimos completar la inscripción')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="page-container py-20 text-center">
        <span className="text-5xl mb-4 inline-block">📚</span>
        <h1 className="text-2xl font-bold text-surface-900">Curso no disponible</h1>
        <p className="mt-3 text-sm text-surface-500">No fue posible cargar este curso desde la base de datos.</p>
        <Link to="/academy/app/cursos" className="btn-primary inline-flex mt-6">Volver al catálogo</Link>
      </div>
    )
  }

  const modules = courseData.modules || []
  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
  
  // Pre-compute flat lesson index (1-based) across all modules
  let flatCounter = 0
  const lessonIndexMap = modules.map(mod =>
    (mod.lessons || []).map(() => {
      flatCounter += 1
      return flatCounter
    })
  )

  return (
    <div>
      <section className="bg-gradient-to-br from-surface-900 to-surface-800 py-16">
        <div className="page-container">
          <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
            <Link to="/academy/app/cursos" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/academy/app/cursos" className="hover:text-white transition-colors">Cursos</Link>
            <span>/</span>
            <span className="text-white">{courseData.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {courseData.featured && <span className="badge-primary">Destacado</span>}
                <span className="text-sm text-surface-400">{courseData.category}</span>
                <span className="text-sm text-surface-400">{courseData.level}</span>
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{courseData.title}</h1>
              <p className="mt-4 text-lg text-surface-300">{courseData.description || courseData.short_description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-surface-400">
                <span>👨‍🏫 {courseData.instructor?.full_name || 'Instructor por definir'}</span>
                <span>⏱ {courseData.duration || 'Duración por definir'}</span>
                <span>📚 {totalLessons} lecciones</span>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="card overflow-hidden">
                {courseData.image_url ? (
                  <img src={courseData.image_url} alt={courseData.title} className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="text-3xl font-bold text-surface-900 mb-4">{formatPrice(courseData)}</div>
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={enrolling}
                    className="btn-primary w-full text-base py-3 mb-3"
                  >
                    {enrolling ? 'Procesando...' : courseData.is_free ? 'Inscribirme Gratis' : 'Comprar Curso'}
                  </button>
                  {enrollError && (
                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{enrollError}</p>
                  )}
                  <p className="text-xs text-center text-surface-400">Acceso completo de por vida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-xl font-bold text-surface-900 mb-4">¿Qué aprenderás?</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(courseData.what_you_learn || []).map((item) => (
                    <li key={item} className="flex items-start gap-3 content-list-item">
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 mb-4">Contenido del Curso</h2>
                <div className="space-y-3">
                  {modules.map((module, moduleIndex) => {
                    const isExpanded = openModule === moduleIndex
                    return (
                      <div key={module.id || module.title} className={`card card-soft overflow-hidden ${isExpanded ? 'card-open' : ''}`}>
                        <button
                          onClick={() => toggleModule(moduleIndex)}
                          className={`flex w-full items-center justify-between p-5 transition-colors text-left ${isExpanded ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-none text-sm font-semibold ${isExpanded ? 'bg-primary-100 text-primary-700' : 'bg-primary-50 text-primary-700'}`}>{moduleIndex + 1}</span>
                            <div>
                              <h3 className="font-medium text-surface-900">{module.title}</h3>
                              <p className="content-meta">{module.lessons?.length || 0} lecciones</p>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 text-surface-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-surface-100 px-5 py-3 space-y-2">
                            {(module.lessons || []).map((lesson, lessonIndex) => {
                              const globalLessonIdx = lessonIndexMap[moduleIndex]?.[lessonIndex]
                              const isPreview = globalLessonIdx <= (courseData.free_preview_lessons || 0)
                              const lessonContent = (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="content-item-title">{lesson.title}</p>
                                    <p className="content-meta">{lesson.duration || 'Duración por definir'}</p>
                                  </div>
                                  {isPreview && (
                                    <span className="inline-flex items-center rounded-none bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Vista previa gratis</span>
                                  )}
                                </div>
                              )
                              if (isPreview) {
                                return (
                                  <Link
                                    key={lesson.id || `${moduleIndex}-${lessonIndex}`}
                                    to={`/academy/app/cursos/${slug}/leccion/${globalLessonIdx}`}
                                    className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3 hover:bg-primary-50 transition-colors"
                                  >
                                    {lessonContent}
                                  </Link>
                                )
                              }
                              return (
                                <div key={lesson.id || `${moduleIndex}-${lessonIndex}`} className="flex items-center justify-between rounded-none bg-surface-50 px-4 py-3 opacity-60">
                                  {lessonContent}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-bold text-surface-900 mb-4">Requisitos</h2>
                  <ul className="space-y-2">
                    {(courseData.requirements || []).map((item) => (
                      <li key={item} className="flex items-start gap-3 content-list-item">
                        <span className="mt-0.5 text-amber-500">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-surface-900 mb-4">¿Para quién es?</h2>
                  <ul className="space-y-2">
                    {(courseData.target_audience || []).map((item) => (
                      <li key={item} className="flex items-start gap-3 content-list-item">
                        <span className="mt-0.5 text-primary-500">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold text-surface-900 mb-4">Instructor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
                    {(courseData.instructor?.full_name || 'I').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{courseData.instructor?.full_name || 'Instructor por definir'}</p>
                    <p className="text-sm text-surface-500">Docente de Qaway Lab Academy</p>
                  </div>
                </div>
                <p className="text-sm text-surface-500">{courseData.short_description || 'Perfil del instructor disponible próximamente.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
