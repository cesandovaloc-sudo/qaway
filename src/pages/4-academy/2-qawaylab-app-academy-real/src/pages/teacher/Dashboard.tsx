import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface TeacherCourseRow {
  id: string
  title: string
  slug: string
  status: string
  created_at: string
  students: number
  statusLabel: string
}

interface RecentSubmission {
  id: string
  status: string | null
  grade: string | null
  submitted_at: string | null
  task: {
    id: string
    title: string
    lesson: {
      module: {
        course: {
          id: string
          title: string
          instructor_id: string | null
        } | null
      } | null
    } | null
  } | null
  student: { id: string; full_name: string | null } | null
}

interface TeacherStats {
  activeCourses: number
  totalStudents: number
  pendingSubmissions: number
  reviewedSubmissions: number
}

interface TeacherData {
  stats: TeacherStats
  courses: TeacherCourseRow[]
  recentSubmissions: RecentSubmission[]
}

async function loadTeacherData(teacherId: string | undefined): Promise<TeacherData | null> {
  if (!teacherId) return null

  // 1. Get teacher's courses
  const coursesResult = await supabase
    .from('courses')
    .select('id, title, slug, status, created_at')
    .eq('instructor_id', teacherId)
    .order('created_at', { ascending: false })

  if (coursesResult.error) throw coursesResult.error
  const courses = coursesResult.data || []
  const courseIds = courses.map(c => c.id)

  if (courseIds.length === 0) {
    return {
      stats: { activeCourses: 0, totalStudents: 0, pendingSubmissions: 0, reviewedSubmissions: 0 },
      courses: [],
      recentSubmissions: [],
    }
  }

  // 2. Get enrollments for teacher's courses
  const enrollmentsResult = await supabase
    .from('enrollments')
    .select('course_id, student_id')
    .in('course_id', courseIds)

  if (enrollmentsResult.error) throw enrollmentsResult.error
  const allEnrollments = enrollmentsResult.data || []

  // 3. Get submissions (get ALL submissions and filter client-side for teacher's courses)
  const submissionsResult = await supabase
    .from('submissions')
    .select(`
      id, status, grade, submitted_at,
      task:tasks (
        id, title,
        lesson:lessons (
          module:modules (
            course:courses (id, title, instructor_id)
          )
        )
      ),
      student:student_id (id, full_name)
    `)
    .order('submitted_at', { ascending: false })
    .limit(50)

  if (submissionsResult.error) throw submissionsResult.error

  const allSubmissions = ((submissionsResult.data || []) as unknown as RecentSubmission[]).filter(
    s => s.task?.lesson?.module?.course?.instructor_id === teacherId
  )

  // Stats
  const activeCourses = courses.filter(c => c.status !== 'archived').length
  const uniqueStudents = new Set(allEnrollments.map(e => e.student_id))
  const pendingSubmissions = allSubmissions.filter(s => s.status === 'pending').length
  const reviewedSubmissions = allSubmissions.filter(s => ['reviewed', 'approved', 'returned'].includes(s.status || '')).length

  // Course enrollment counts
  const enrollmentCounts: Record<string, number> = {}
  for (const e of allEnrollments) {
    enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1
  }

  // Recent submissions (last 5)
  const recentSubmissions = allSubmissions.slice(0, 5)

  return {
    stats: {
      activeCourses,
      totalStudents: uniqueStudents.size,
      pendingSubmissions,
      reviewedSubmissions,
    },
    courses: courses.map(c => ({
      ...c,
      students: enrollmentCounts[c.id] || 0,
      statusLabel: c.status === 'published' ? 'Activo' : c.status === 'draft' ? 'Borrador' : 'Archivado',
    })),
    recentSubmissions,
  }
}

function timeAgo(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-PE')
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-surface-100 text-surface-600',
  reviewed: 'bg-surface-100 text-surface-600',
  approved: 'bg-surface-100 text-surface-600',
  returned: 'badge-danger',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Corregir',
  approved: 'Aprobada',
  returned: 'Devuelta',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return '¡Buenos días'
  if (hour < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
}

export default function TeacherDashboard() {
  const { user, profile } = useAuth()
  const { data, loading, error } = useData(
    () => loadTeacherData(user?.id),
    [user?.id]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-surface-500">
        Error al cargar el panel docente
      </div>
    )
  }

  const stats = data?.stats
  const courses = data?.courses || []
  const recentSubmissions = data?.recentSubmissions || []

  const statCards = [
    { label: 'Cursos Activos', value: stats?.activeCourses ?? '—', icon: '📚', color: 'bg-surface-100 text-surface-600' },
    { label: 'Alumnos Totales', value: stats?.totalStudents ?? '—', icon: '👥', color: 'bg-surface-100 text-surface-600' },
    { label: 'Tareas Pendientes', value: stats?.pendingSubmissions ?? '—', icon: '📝', color: 'bg-surface-100 text-surface-600' },
    { label: 'Tareas Revisadas', value: stats?.reviewedSubmissions ?? '—', icon: '✅', color: 'bg-surface-100 text-surface-600' },
  ]

  function formatShortName(name: string): string {
    if (!name) return 'Docente'
    if (name.includes('@')) return name.split('@')[0]
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
  }

  const teacherName = formatShortName(profile?.full_name || user?.user_metadata?.full_name || user?.email || '')

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">{getGreeting()}, {teacherName} 👋</h1>
        <p className="section-subtitle mt-1">Gestiona tus cursos y revisa tareas</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-4">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className="card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-default group"
            style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.08}s both` }}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-none ${stat.color} text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900 transition-all duration-300 group-hover:text-primary-700 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-sm text-surface-500 transition-colors duration-300 group-hover:text-surface-700">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Courses */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Mis Cursos</h2>
        </div>
        {courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course, idx) => (
              <Link
                key={course.id}
                to={`/docente/cursos/${course.slug}`}
                className="card-hover p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group"
                style={{ animation: `fadeInUp 0.4s ease-out ${(idx + 4) * 0.08}s both` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-surface-900 transition-colors duration-300 group-hover:text-primary-700">
                    {course.title}
                    <span className="inline-block ml-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                  </h3>
                  <span className={`text-xs badge transition-all duration-300 group-hover:scale-105 ${
                    course.status === 'published' ? 'bg-surface-100 text-surface-600' :
                    course.status === 'draft' ? 'bg-surface-100 text-surface-600' : 'badge'
                  }`}>
                    {course.statusLabel}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-surface-500 transition-colors duration-300 group-hover:text-surface-600">
                  <span>👥 {course.students} alumno{course.students !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-sm text-surface-400">
            No tienes cursos asignados aún
          </div>
        )}
      </section>

      {/* Recent Submissions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Entregas Recientes</h2>
          <Link to="/academy/app/docente/tareas" className="btn-ghost text-sm">Ver todas →</Link>
        </div>
        {recentSubmissions.length > 0 ? (
          <div className="space-y-3">
            {recentSubmissions.map((s) => (
              <div key={s.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-sm font-semibold text-surface-600">
                    {(s.student?.full_name || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">{s.student?.full_name || '—'}</p>
                    <p className="text-xs text-surface-400">
                      {s.task?.title || 'Tarea'} · {s.task?.lesson?.module?.course?.title || 'Curso'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-400">{timeAgo(s.submitted_at)}</span>
                  <span className={`badge text-xs ${STATUS_COLORS[s.status || ''] || 'badge'}`}>
                    {STATUS_LABELS[s.status || ''] || s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-sm text-surface-400">
            No hay entregas recientes
          </div>
        )}
      </section>
    </div>
  )
}
