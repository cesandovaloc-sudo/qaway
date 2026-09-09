import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { getCourseBySlug, getCourseProgress } from '@/lib/services'
import { useAuth } from '@/contexts/AuthContext'

export default function CourseHub() {
  const { slug } = useParams()
  const { user } = useAuth()

  const [openModule, setOpenModule] = useState(-1) // ninguno desplegado por defecto

  const { data: courseData, loading, error } = useData(() => getCourseBySlug(slug || ''), [slug])

  const courseId = courseData?.id
  const { data: progress } = useData(
    () => user?.id && courseId
      ? getCourseProgress(user.id, courseId)
      : Promise.resolve(null),
    [user?.id, courseId]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">📚</span>
        <h1 className="text-2xl font-bold text-surface-900">Curso no disponible</h1>
        <p className="mt-3 text-sm text-surface-500">No fue posible cargar este curso.</p>
        <Link to="/panel" className="btn-primary inline-flex mt-6">Volver al panel</Link>
      </div>
    )
  }

  const modules = courseData.modules || []
  const completedIds = new Set(progress?.completedIds || [])
  const totalLessons = progress?.total || 0
  const completedCount = progress?.completed || 0
  const progressPct = progress?.percentage || 0
  const minutesWatched = progress?.minutesWatched || 0
  const totalMinutes = progress?.totalMinutes || 0
  const hasProgress = completedCount > 0

  // Build flat lesson index across all modules + check completion
  let lessonCounter = 0
  const moduleMap = modules.map(mod =>
    (mod.lessons || []).map(lesson => {
      lessonCounter += 1
      return {
        index: lessonCounter,
        id: lesson.id,
        completed: completedIds.has(lesson.id),
      }
    })
  )

  // Find first uncompleted lesson for "Continue" button
  let firstUncompleted = 1
  for (const moduleLessons of moduleMap) {
    for (const lesson of moduleLessons) {
      if (!lesson.completed) {
        firstUncompleted = lesson.index
        break
      }
    }
    if (firstUncompleted > 1) break
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
        <Link to="/panel" className="hover:text-surface-600 transition-colors">Panel</Link>
        <span>/</span>
        <span className="text-surface-900 font-medium">{courseData.title}</span>
      </nav>

      {/* Header with progress bar */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="section-title">{courseData.title}</h1>
            <p className="section-subtitle mt-1">
              {totalLessons} lecciones
              {hasProgress && ` · ${progressPct}% completado`}
              {minutesWatched > 0 && ` · ${minutesWatched} min vistos`}
              {totalMinutes > 0 && ` de ${totalMinutes} min`}
            </p>
          </div>
          <Link
            to={`/panel/cursos/${slug}/leccion/${firstUncompleted}`}
            className="btn-primary shrink-0 ml-4"
          >
            {hasProgress ? 'Continuar →' : 'Comenzar →'}
          </Link>
        </div>

        {/* Progress bar */}
        {hasProgress && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-surface-700">
                Tu progreso
              </span>
              <span className="text-sm font-semibold text-primary-600">
                {completedCount}/{totalLessons} lecciones
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      {hasProgress && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Completado', value: `${progressPct}%`, icon: '✅', color: 'bg-surface-100 text-surface-600' },
            { label: 'Lecciones hechas', value: `${completedCount}/${totalLessons}`, icon: '📖', color: 'bg-surface-100 text-surface-600' },
            { label: 'Por hacer', value: totalLessons - completedCount, icon: '📋', color: 'bg-surface-100 text-surface-600' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-none ${stat.color} text-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-surface-900">{stat.value}</p>
                <p className="text-xs text-surface-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modules & Lessons */}
      <div className="space-y-6">
        {modules.map((mod, moduleIndex) => {
          const isOpen = openModule === moduleIndex
          return (
            <div key={mod.id || moduleIndex} className={`card card-soft overflow-hidden ${isOpen ? 'card-open' : ''}`}>
              <button
                onClick={() => setOpenModule(prev => (prev === moduleIndex ? -1 : moduleIndex))}
                className={`flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors ${isOpen ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
              >
                <div>
                  <h2 className="font-semibold text-surface-900">Módulo {moduleIndex + 1}: {mod.title}</h2>
                  <p className="text-xs text-surface-400 mt-1">{mod.lessons?.length || 0} lecciones</p>
                </div>
                <svg
                  className={`h-5 w-5 shrink-0 text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="divide-y divide-surface-100">
                  {(mod.lessons || []).map((lesson, lessonIndex) => {
                    const info = moduleMap[moduleIndex]?.[lessonIndex]
                    const isCompleted = info?.completed || false

                    return (
                      <Link
                        key={lesson.id || `${moduleIndex}-${lessonIndex}`}
                        to={`/panel/cursos/${slug}/leccion/${info?.index || 1}`}
                        className={`flex items-center justify-between px-6 py-4 transition-colors group ${
                          isCompleted
                            ? 'hover:bg-emerald-50/50'
                            : 'hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Number / checkmark circle */}
                          {isCompleted ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs">
                              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-surface-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                              {info?.index}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm truncate ${
                              isCompleted ? 'text-surface-500' : 'text-surface-900 font-medium'
                            }`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-surface-400 truncate">{lesson.duration || 'Duración por definir'}</p>
                          </div>
                        </div>

                        {/* Completed badge */}
                        {isCompleted && (
                          <span className="shrink-0 ml-3 rounded-none bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Completado
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
