import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getEnrollments, getCourseProgress, getCertificates } from '@/lib/services'
import type { Enrollment, CourseProgress, Certificate } from '@/lib/types'

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: string
  label: string
  count?: number
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`relative flex items-center gap-2 rounded-none px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {count !== undefined && count >= 0 && (
        <span className={`ml-1 inline-flex items-center justify-center rounded-none px-2 py-0.5 text-xs font-semibold tabular-nums ${
          active
            ? 'bg-primary-200 text-primary-800'
            : 'bg-surface-200 text-surface-600'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-600" />
      )}
    </button>
  )
}

function _ProgressBar({ percentage }: { percentage: number }) {
  const pct = Math.min(Math.max(percentage || 0, 0), 100)
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-surface-500">Progreso</span>
        <span className="text-xs font-semibold text-primary-600 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}

function EmptyState({ icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="card col-span-full p-12 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-none bg-surface-100 text-4xl mb-4">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return '¡Buenos días'
  if (hour < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
}

export default function StudentPanel() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('en-curso')
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Fetch enrollments
  const { data: enrollments, loading: loadingEnrollments } = useData(
    () => user?.id ? getEnrollments(user.id) : Promise.resolve<Enrollment[]>([]),
    [user?.id]
  )

  const hasEnrollments = enrollments && enrollments.length > 0

  // Search filter
  const q = searchQuery.toLowerCase().trim()
  const matchesSearch = (course: Enrollment['course']) => !q || course?.title?.toLowerCase().includes(q)

  const activeEnrollments = (enrollments || []).filter(e => e.status === 'active' && matchesSearch(e.course))
  const completedEnrollments = (enrollments || []).filter(e => e.status === 'completed' && matchesSearch(e.course))
  const allEnrollments = (enrollments || []).filter(e => matchesSearch(e.course))

  // 2. Once enrollments are loaded, fetch progress for active courses + certificates
  const { data: extended, loading: loadingExtended } = useData(
    async () => {
      if (!hasEnrollments) return { progressMap: {} as Record<string, CourseProgress | null>, certificates: [] as Certificate[] }

      const [progressResults, certs] = await Promise.all([
        Promise.all(
          activeEnrollments.map(e =>
            getCourseProgress(user?.id as string, e.course?.id as string)
              .then(progress => ({ courseId: e.course?.id, progress }))
              .catch(() => ({ courseId: e.course?.id, progress: null }))
          )
        ),
        getCertificates(user?.id as string).catch(() => [] as Certificate[]),
      ])

      const progressMap: Record<string, CourseProgress | null> = {}
      progressResults.forEach(r => { if (r.courseId) progressMap[r.courseId] = r.progress })

      return { progressMap, certificates: certs || [] }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, enrollments]
  )

  const progressMap = extended?.progressMap || {}
  const certificates = extended?.certificates || []
  const loading = loadingEnrollments || (hasEnrollments && loadingExtended)

  // Search filter (after certificates are defined)
  const filteredCertificates = (certificates || []).filter(c => !q || c.course?.title?.toLowerCase().includes(q))

  // Derived stats (total counts before search)
  const totalActiveAll = (enrollments || []).filter(e => e.status === 'active').length
  const totalCompletedAll = (enrollments || []).filter(e => e.status === 'completed').length
  const totalActive = activeEnrollments.length
  const totalCompleted = completedEnrollments.length
  const totalCerts = certificates.length

  // Find the "next step" course: active course with highest progress that's not 100%
  const nextStepCourse = activeEnrollments
    .map(e => ({
      enrollment: e,
      progress: progressMap[e.course?.id as string],
    }))
    .filter(item => item.progress && item.progress.percentage < 100)
    .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0))[0]

  // Total stats for complementary section
  const totalLessonsCompleted = Object.values(progressMap).reduce(
    (sum, p) => sum + (p?.completed || 0), 0
  )
  const totalMinutesWatched = Object.values(progressMap).reduce(
    (sum, p) => sum + (p?.minutesWatched || 0), 0
  )

  // Earliest enrollment date for "días aprendiendo"
  const firstEnrollmentDate = hasEnrollments
    ? enrollments.reduce((earliest, e) => {
        const d = new Date(e.enrolled_at || 0)
        return d < earliest ? d : earliest
      }, new Date())
    : null
  const daysLearning = firstEnrollmentDate
    ? Math.floor((Date.now() - firstEnrollmentDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Formatear nombre como "Nombre A." para el saludo
  function formatShortName(name: string): string {
    if (!name) return 'Estudiante'
    if (name.includes('@')) {
      const local = name.split('@')[0]
      return local.charAt(0).toUpperCase() + local.slice(1)
    }
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const first = parts[0]
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
    return `${first} ${lastInitial}.`
  }
  const rawName = profile?.full_name || user?.email || 'Estudiante'
  const displayName = formatShortName(rawName)
  const firstName = displayName

  // ---------- RENDER ----------

  if (loading && !hasEnrollments) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-title">{getGreeting()}, {firstName} 👋</h1>
            <p className="section-subtitle mt-1">
              {hasEnrollments
                ? 'Este es tu centro de aprendizaje. Retoma donde lo dejaste.'
                : 'Comienza tu viaje de aprendizaje hoy.'}
            </p>
          </div>

          {/* Search bar */}
          {hasEnrollments && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar curso..."
                className="input-field pl-3 pr-9 h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400 hover:text-surface-600 cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick stats pills */}
        {hasEnrollments && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-600">
              <span className="text-base">📚</span>
              {totalActiveAll} en curso
            </span>
            {totalCompletedAll > 0 && (
              <span className="inline-flex items-center gap-1.5 badge-success text-sm font-medium">
                <span className="text-base">🎓</span>
                {totalCompletedAll} completados
              </span>
            )}
            {totalCerts > 0 && (
              <span className="inline-flex items-center gap-1.5 badge-warning text-sm font-medium">
                <span className="text-base">🏆</span>
                {totalCerts} certificado{totalCerts !== 1 ? 's' : ''}
              </span>
            )}
            {daysLearning > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-none bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-600">
                <span className="text-base">📅</span>
                {daysLearning} día{daysLearning !== 1 ? 's' : ''} aprendiendo
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===== NEXT STEP BANNER ===== */}
      {nextStepCourse && (
        <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-primary-600 to-primary-800 p-6">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-medium text-primary-200 uppercase tracking-wider">Tu próximo paso</span>
              </div>
              <h3 className="text-lg font-bold text-white">{nextStepCourse.enrollment.course?.title}</h3>
              <p className="mt-1 text-sm text-primary-100">
                {nextStepCourse.progress
                  ? `Llevas ${nextStepCourse.progress.percentage}% completado — ${nextStepCourse.progress.completed} de ${nextStepCourse.progress.total} lecciones`
                  : 'Comienza con este curso'}
              </p>
              {/* Mini progress bar */}
              {nextStepCourse.progress && (
                <div className="mt-3 max-w-xs">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{ width: `${nextStepCourse.progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Link
              to={`/panel/cursos/${nextStepCourse.enrollment.course?.slug}`}
              className="btn-primary shrink-0 bg-white text-primary-700 hover:bg-primary-50"
            >
              Continuar →
            </Link>
          </div>
        </div>
      )}

      {/* ===== TABS ===== */}
      {hasEnrollments && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-200 pb-2" role="tablist">
          <TabButton
            active={activeTab === 'todos'}
            onClick={() => setActiveTab('todos')}
            icon="📋"
            label="Todos"
            count={totalActive + totalCompleted}
          />
          <TabButton
            active={activeTab === 'en-curso'}
            onClick={() => setActiveTab('en-curso')}
            icon="📚"
            label="En curso"
            count={totalActive}
          />
          <TabButton
            active={activeTab === 'completados'}
            onClick={() => setActiveTab('completados')}
            icon="🎓"
            label="Completados"
            count={totalCompleted}
          />
          <TabButton
            active={activeTab === 'certificados'}
            onClick={() => setActiveTab('certificados')}
            icon="🏆"
            label="Certificados"
            count={totalCerts}
          />
        </div>
      )}

      {/* ===== CONTENT BY TAB ===== */}

      {/* --- Tab: Todos --- */}
      {activeTab === 'todos' && (
        <>
          {allEnrollments.length > 0 ? (
            <div className="space-y-3">
              {allEnrollments.map((enrollment) => {
                const course = enrollment.course
                if (!course) return null
                const progress = progressMap[course.id]
                const isCompleted = enrollment.status === 'completed'

                return (
                  <Link
                    key={enrollment.id}
                    to={isCompleted ? '/panel/certificados' : `/panel/cursos/${course.slug}`}
                    className="card p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-none text-2xl ${
                        isCompleted ? 'bg-emerald-50' : 'bg-primary-50'
                      }`}>
                        {isCompleted ? '🎓' : '📚'}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-surface-900 truncate">{course.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 badge-success text-xs font-medium">
                              ✓ Completado
                            </span>
                          ) : (
                            <>
                              {progress && progress.total > 0 && (
                                <span className="text-xs font-medium text-primary-600">
                                  {progress.percentage}% completado
                                </span>
                              )}
                              {course.category && (
                                <span className="text-xs text-surface-400">{course.category}</span>
                              )}
                            </>
                          )}
                          {enrollment.completed_at && (
                            <span className="text-xs text-surface-400">
                              {formatDate(enrollment.completed_at)}
                            </span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        {!isCompleted && progress && progress.total > 0 && (
                          <div className="mt-2 max-w-xs">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="btn-ghost text-xs px-3 py-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 font-semibold">
                      {isCompleted ? 'Ver certificado →' : 'Continuar →'}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon="📋"
              title="No tienes cursos"
              description={searchQuery ? 'No se encontraron cursos con ese nombre.' : 'Aún no tienes cursos inscritos. Explora nuestro catálogo.'}
              actionLabel="Explorar Cursos"
              actionTo="/cursos"
            />
          )}
        </>
      )}

      {/* --- Tab: En curso --- */}
      {activeTab === 'en-curso' && (
        <>
          {totalActive > 0 ? (
            <div className="space-y-3">
              {activeEnrollments.map((enrollment) => {
                const course = enrollment.course
                if (!course) return null
                const progress = progressMap[course.id]

                return (
                  <Link
                    key={enrollment.id}
                    to={`/panel/cursos/${course.slug}`}
                    className="card p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-primary-50 text-2xl">
                        📚
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-surface-900 truncate">{course.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {progress && progress.total > 0 && (
                            <span className="text-xs font-medium text-primary-600">
                              {progress.percentage}% completado
                            </span>
                          )}
                          {course.category && (
                            <span className="text-xs text-surface-400">{course.category}</span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        {progress && progress.total > 0 && (
                          <div className="mt-2 max-w-xs">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="btn-ghost text-xs px-3 py-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 font-semibold">
                      Continuar →
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon="📚"
              title="No tienes cursos en progreso"
              description={
                totalCompleted > 0
                  ? '¡Completaste todos tus cursos! Revisa tus certificados o inscríbete en uno nuevo.'
                  : 'Aún no tienes cursos activos. Explora nuestro catálogo y encuentra el curso perfecto para ti.'
              }
              actionLabel="Explorar Cursos"
              actionTo="/cursos"
            />
          )}

          {/* Complementary section (visible on "En curso" tab) */}
          {totalActive > 0 && (
            <section className="grid gap-5 sm:grid-cols-2">
              {/* Activity summary */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  Resumen de actividad
                </h3>
                <div className="space-y-3">
                  {totalLessonsCompleted > 0 && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-surface-500">Lecciones completadas</span>
                      <span className="text-sm font-semibold text-surface-900 tabular-nums">
                        {totalLessonsCompleted}
                      </span>
                    </div>
                  )}
                  {totalMinutesWatched > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-t border-surface-100">
                      <span className="text-sm text-surface-500">Minutos de video vistos</span>
                      <span className="text-sm font-semibold text-surface-900 tabular-nums">
                        {totalMinutesWatched}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1.5 border-t border-surface-100">
                    <span className="text-sm text-surface-500">Cursos activos</span>
                    <span className="text-sm font-semibold text-surface-900 tabular-nums">{totalActive}</span>
                  </div>
                  {daysLearning > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-t border-surface-100">
                      <span className="text-sm text-surface-500">Días aprendiendo</span>
                      <span className="text-sm font-semibold text-surface-900 tabular-nums">{daysLearning}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificates reminder */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  {totalCompleted > 0 ? 'Certificados disponibles' : 'Próximos pasos'}
                </h3>
                {totalCompleted > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-surface-500">
                      ¡Felicidades! Tienes <strong className="text-surface-700">{totalCompleted} curso{totalCompleted !== 1 ? 's' : ''}</strong> completado{totalCompleted !== 1 ? 's' : ''}.
                      {totalCerts > 0
                        ? ` Ya puedes ver tus ${totalCerts} certificado${totalCerts !== 1 ? 's' : ''}.`
                        : ' Revisa tus certificados.'}
                    </p>
                    <Link
                      to="/panel/certificados"
                      className="btn-secondary text-sm inline-flex"
                    >
                      Ver certificados →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-surface-500">
                      Sigue aprendiendo y completa un curso para obtener tu primer certificado. ¡Cada lección cuenta!
                    </p>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">1</span>
                      <span>Termina todas las lecciones de un curso</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">2</span>
                      <span>Obtén tu certificado al completarlo</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* --- Tab: Completados --- */}
      {activeTab === 'completados' && (
        <>
          {totalCompleted > 0 ? (
            <div className="space-y-3">
              {completedEnrollments.map((enrollment) => {
                const course = enrollment.course
                if (!course) return null

                return (
                  <Link
                    key={enrollment.id}
                    to={`/panel/certificados`}
                    className="card p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-surface-100 text-2xl">
                        🎓
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-surface-900 truncate">{course.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center gap-1 badge-success text-xs font-medium">
                            ✓ Completado
                          </span>
                          {enrollment.completed_at && (
                            <span className="text-xs text-surface-400">
                              {formatDate(enrollment.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="btn-ghost text-xs px-3 py-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 font-semibold">
                      Ver certificado →
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon="🎓"
              title="Aún no has completado ningún curso"
              description="Sigue aprendiendo con tus cursos activos. Al completar un curso, recibirás un certificado."
              actionLabel={totalActive > 0 ? 'Ir a mis cursos' : 'Explorar Cursos'}
              actionTo={totalActive > 0 ? '/panel/cursos' : '/cursos'}
            />
          )}
        </>
      )}

      {/* --- Tab: Certificados --- */}
      {activeTab === 'certificados' && (
        <>
          {filteredCertificates.length > 0 ? (
            <div className="space-y-3">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none bg-surface-100 text-2xl">
                      🏆
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-900 truncate">
                        {cert.course?.title || 'Curso'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1 badge-success text-xs font-medium">
                          ✓ Válido
                        </span>
                        {cert.issued_at && (
                          <span className="text-xs text-surface-400">
                            Emitido: {formatDate(cert.issued_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {cert.certificate_url ? (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm shrink-0"
                    >
                      Descargar PDF
                    </a>
                  ) : (
                    <span className="btn-ghost text-xs px-3 py-1.5 shrink-0 text-primary-600 font-semibold">
                      Ver certificado →
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : totalCompleted > 0 ? (
            <EmptyState
              icon="🏆"
              title="Certificados en proceso"
              description="Completaste cursos pero los certificados aún no están disponibles. Vuelve pronto o contacta a soporte."
              actionLabel="Ir a completados"
              actionTo="/panel/certificados"
            />
          ) : (
            <EmptyState
              icon="🏆"
              title="Sin certificados aún"
              description="Completa un curso para obtener tu primer certificado. ¡Te esperamos!"
              actionLabel="Explorar Cursos"
              actionTo="/cursos"
            />
          )}
        </>
      )}

      {/* ===== GLOBAL EMPTY STATE (no enrollments at all) ===== */}
      {!hasEnrollments && !loading && (
        <div className="card p-12 text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-none bg-primary-50 text-5xl mb-5">
            🚀
          </span>
          <h2 className="text-2xl font-bold text-surface-900 mb-3">
            {getGreeting()}, {firstName}!
          </h2>
          <p className="text-surface-500 max-w-lg mx-auto mb-8 leading-relaxed">
            Este es tu espacio de aprendizaje. Aquí verás tus cursos, seguirás tu progreso
            y accederás a tus certificados. ¡Empieza explorando nuestro catálogo!
          </p>
          <Link to="/cursos" className="btn-primary text-base px-8 py-3">
            Explorar Cursos
          </Link>
        </div>
      )}
    </div>
  )
}
