import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface TeacherCourse {
  id: string
  title: string
  slug: string
  status: string
}

interface StudentProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface StudentProgress {
  completed: number
  total: number
  percentage: number
  secondsWatched: number
  lastActivity: string | null
}

interface StudentQuizStats {
  bestScore: number
  avgScore: number | null
  totalQuizzes: number
  completedQuizzes: number
}

interface StudentEntry {
  student: StudentProfile
  courseId: string
  courseTitle: string
  courseSlug: string
  status: string
  enrolledAt: string | null
  completedAt: string | null
  progress: StudentProgress
  quiz: StudentQuizStats
}

interface ProgressMapEntry {
  completed: number
  total: number
  secondsWatched: number
  lastActivity: string | null
}

interface QuizMapEntry {
  total: number
  bestScore: number
  totalScore: number
  completed: number
}

interface StudentData {
  courses: TeacherCourse[]
  studentsData: StudentEntry[]
}

async function loadStudentsData(teacherId: string | undefined): Promise<StudentData> {
  if (!teacherId) return { courses: [], studentsData: [] }

  // 1. Get teacher's courses
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title, slug, status')
    .eq('instructor_id', teacherId)
    .order('title')

  if (coursesError) throw coursesError
  if (!courses?.length) return { courses: [], studentsData: [] }

  const courseIds = courses.map(c => c.id)

  // 2. Get enrollments with student profiles
  type EnrollmentRow = {
    id: string
    status: string
    enrolled_at: string | null
    completed_at: string | null
    course_id: string
    student: StudentProfile
  }
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      id, status, enrolled_at, completed_at, course_id,
      student:student_id (id, full_name, avatar_url)
    `)
    .in('course_id', courseIds)
    .order('enrolled_at', { ascending: false })

  if (enrollError) throw enrollError
  const enrollmentRows = (enrollments || []) as unknown as EnrollmentRow[]
  if (!enrollmentRows.length) return { courses, studentsData: [] }

  // 3. Get all published lessons for these courses (to know total per course)
  type LessonRow = { id: string; duration: string | null; module: { course_id: string } | null }
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, duration, module:module_id!inner(course_id)')
    .in('module.course_id', courseIds)
    .eq('status', 'published')

  if (lessonsError) throw lessonsError

  const lessonRows = (lessons || []) as unknown as LessonRow[]

  const lessonIds = lessonRows.map(l => l.id)

  // Map lesson → course
  const lessonCourseMap: Record<string, string> = {}
  for (const lesson of lessonRows) {
    if (lesson.module) lessonCourseMap[lesson.id] = lesson.module.course_id
  }

  // Count total published lessons per course
  const totalLessonsByCourse: Record<string, number> = {}
  for (const lesson of lessonRows) {
    const cId = lesson.module?.course_id
    if (!cId) continue
    totalLessonsByCourse[cId] = (totalLessonsByCourse[cId] || 0) + 1
  }

  // 4. Get all progress records for these students in these lessons
  const studentIds = [...new Set(enrollmentRows.map(e => e.student.id))]

  let progressRecords: { lesson_id: string; student_id: string; completed: boolean; seconds_watched: number; updated_at: string }[] = []
  if (lessonIds.length > 0) {
    const { data, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .in('lesson_id', lessonIds)
    if (progressError) throw progressError
    progressRecords = (data || []) as typeof progressRecords
  }

  // Build progress map: studentId_courseId → { completed, total, secondsWatched, lastActivity }
  const progressMap: Record<string, ProgressMapEntry> = {}
  for (const p of progressRecords || []) {
    const courseId = lessonCourseMap[p.lesson_id]
    if (!courseId) continue
    const key = `${p.student_id}_${courseId}`
    if (!progressMap[key]) {
      progressMap[key] = { completed: 0, total: 0, secondsWatched: 0, lastActivity: null }
    }
    progressMap[key].total = totalLessonsByCourse[courseId] || 0
    if (p.completed) progressMap[key].completed++
    progressMap[key].secondsWatched += p.seconds_watched || 0
    if (p.updated_at && (!progressMap[key].lastActivity || p.updated_at > progressMap[key].lastActivity)) {
      progressMap[key].lastActivity = p.updated_at
    }
  }

  // 5. Get quiz attempts for quiz scores
  let quizzes: { id: string; lesson_id: string; passing_score: number }[] = []
  if (lessonIds.length > 0) {
    const { data, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, lesson_id, passing_score')
      .in('lesson_id', lessonIds)
    if (quizzesError) throw quizzesError
    quizzes = (data || []) as typeof quizzes
  }

  const quizIds = (quizzes || []).map(q => q.id)
  const quizLessonMap: Record<string, string> = {}
  for (const q of quizzes || []) {
    quizLessonMap[q.id] = q.lesson_id
  }
  const quizPassingMap: Record<string, number> = {}
  for (const q of quizzes || []) {
    quizPassingMap[q.id] = q.passing_score
  }

  let attempts: { quiz_id: string; student_id: string; score: number; completed: boolean }[] = []
  if (quizIds.length > 0) {
    const { data: a, error: aError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .in('quiz_id', quizIds)
    if (!aError) attempts = (a || []) as typeof attempts
  }

  // Build quiz stats: studentId_courseId → { avgScore, bestScore, completed, total }
  const quizMap: Record<string, QuizMapEntry> = {}
  for (const att of attempts) {
    const lessonId = quizLessonMap[att.quiz_id]
    if (!lessonId) continue
    const courseId = lessonCourseMap[lessonId]
    if (!courseId) continue
    const key = `${att.student_id}_${courseId}`
    if (!quizMap[key]) {
      quizMap[key] = { total: 0, bestScore: 0, totalScore: 0, completed: 0 }
    }
    quizMap[key].total++
    if (att.score > quizMap[key].bestScore) quizMap[key].bestScore = att.score
    quizMap[key].totalScore += att.score
    if (att.completed) quizMap[key].completed++
  }

  // 6. Build student data array
  const seen = new Set<string>()
  const studentsData: StudentEntry[] = []

  for (const enrollment of enrollmentRows) {
    const student = enrollment.student
    if (!student?.id) continue

    const key = `${student.id}_${enrollment.course_id}`
    if (seen.has(key)) continue
    seen.add(key)

    const progKey = `${student.id}_${enrollment.course_id}`
    const progress = progressMap[progKey] || { completed: 0, total: 0, secondsWatched: 0, lastActivity: null }
    const quizStats = quizMap[progKey] || { bestScore: 0, totalScore: 0, completed: 0, total: 0 }
    const course = courses.find(c => c.id === enrollment.course_id)

    studentsData.push({
      student,
      courseId: enrollment.course_id,
      courseTitle: course?.title || 'Curso',
      courseSlug: course?.slug || '',
      status: enrollment.status,
      enrolledAt: enrollment.enrolled_at,
      completedAt: enrollment.completed_at,
      progress: {
        completed: progress.completed,
        total: progress.total,
        percentage: progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0,
        secondsWatched: progress.secondsWatched,
        lastActivity: progress.lastActivity,
      },
      quiz: {
        bestScore: quizStats.bestScore,
        avgScore: quizStats.total > 0 ? Math.round(quizStats.totalScore / quizStats.total) : null,
        totalQuizzes: quizStats.total,
        completedQuizzes: quizStats.completed,
      },
    })
  }

  return { courses, studentsData }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Ahora'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `Hace ${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `Hace ${days}d`
  return formatDate(dateStr)
}

function ProgressBar({ percentage, size = 'md' }: { percentage: number; size?: 'sm' | 'md' | 'lg' }) {
  const pct = Math.min(Math.max(percentage || 0, 0), 100)
  const heights: Record<string, string> = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  const colors = pct >= 80 ? 'bg-emerald-500'
    : pct >= 40 ? 'bg-amber-500'
    : 'bg-primary-500'

  return (
    <div className={`${heights[size] || heights.md} w-full overflow-hidden rounded-full bg-surface-100`}>
      <div
        className={`${heights[size] || heights.md} ${colors} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hrs}h ${remainMins}min`
}

/* ─── Expanded Detail Row ─── */
function StudentDetail({ studentData }: { studentData: StudentEntry }) {
  const { progress, quiz, enrolledAt, completedAt, courseSlug } = studentData

  return (
    <div className="border-t border-surface-100 bg-surface-50/70 px-6 py-5">
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Lessons progress */}
        <div className="card bg-white p-4 border border-surface-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
            📖 Lecciones
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Completadas</span>
              <span className="font-semibold text-surface-900">{progress.completed}/{progress.total}</span>
            </div>
            <ProgressBar percentage={progress.percentage} size="sm" />
            <div className="flex items-center justify-between text-xs text-surface-400 mt-1">
              <span>{progress.percentage}% completado</span>
            </div>
          </div>
        </div>

        {/* Quiz results */}
        <div className="card bg-white p-4 border border-surface-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
            ❓ Quizzes
          </h4>
          <div className="space-y-2">
            {quiz.totalQuizzes > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-600">Mejor score</span>
                  <span className="font-semibold text-surface-900">{quiz.bestScore}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-600">Promedio</span>
                  <span className="font-semibold text-surface-900">{quiz.avgScore ?? '—'}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-surface-400">
                  <span>Quizzes respondidos</span>
                  <span>{quiz.completedQuizzes}/{quiz.totalQuizzes}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-surface-400 py-2">Sin quizzes disponibles</p>
            )}
          </div>
        </div>

        {/* Activity & enrollment */}
        <div className="card bg-white p-4 border border-surface-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-3">
            📅 Actividad
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Última actividad</span>
              <span className="font-medium text-surface-900">{timeAgo(progress.lastActivity)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Tiempo visto</span>
              <span className="font-medium text-surface-900">{formatDuration(progress.secondsWatched)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-surface-600">Inscrito</span>
              <span className="font-medium text-surface-900">{formatDate(enrolledAt)}</span>
            </div>
            {completedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-600">Completado</span>
                <span className="font-medium text-emerald-600">{formatDate(completedAt)}</span>
              </div>
            )}
          </div>
          {courseSlug && (
            <Link
              to={`/docente/cursos/${courseSlug}`}
              className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Ir al curso →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function TeacherStudents() {
  const { user } = useAuth()
  const { data, loading } = useData(
    () => loadStudentsData(user?.id),
    [user?.id]
  )

  const [selectedCourse, setSelectedCourse] = useState('all')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('name') // name | progress | activity

  const courses = data?.courses || []
  const studentsData = data?.studentsData || []

  const uniqueStudents = new Set(studentsData.map(s => s.student.id))

  const filteredStudents = selectedCourse === 'all'
    ? studentsData
    : studentsData.filter(s => s.courseId === selectedCourse)

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') return a.student.full_name?.localeCompare(b.student.full_name || '') || 0
    if (sortBy === 'progress') return (b.progress.percentage || 0) - (a.progress.percentage || 0)
    if (sortBy === 'activity') {
      const aTime = a.progress.lastActivity || a.enrolledAt || ''
      const bTime = b.progress.lastActivity || b.enrolledAt || ''
      return bTime.localeCompare(aTime)
    }
    return 0
  })

  // Stats
  const totalEnrollments = studentsData.length
  const activeStudents = studentsData.filter(s => s.status === 'active').length
  const completedStudents = studentsData.filter(s => s.status === 'completed').length
  const avgProgress = studentsData.length > 0
    ? Math.round(studentsData.reduce((s, d) => s + (d.progress.percentage || 0), 0) / studentsData.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Mis Alumnos</h1>
        <p className="section-subtitle mt-1">
          {uniqueStudents.size} alumno{uniqueStudents.size !== 1 ? 's' : ''} en {courses.length} curso{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-100 text-xl">👥</span>
            <div>
              <p className="text-2xl font-bold text-surface-900">{uniqueStudents.size}</p>
              <p className="text-sm text-surface-500">Alumnos únicos</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-100 text-xl">📚</span>
            <div>
              <p className="text-2xl font-bold text-surface-900">{courses.length}</p>
              <p className="text-sm text-surface-500">Cursos activos</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-100 text-xl">📝</span>
            <div>
              <p className="text-2xl font-bold text-surface-900">{totalEnrollments}</p>
              <p className="text-sm text-surface-500">Inscripciones totales</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-100 text-xl">📊</span>
            <div>
              <p className="text-2xl font-bold text-surface-900">{avgProgress}%</p>
              <p className="text-sm text-surface-500">Progreso promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Todos', count: uniqueStudents.size },
          ...courses.map(c => ({
            id: c.id,
            label: c.title,
            count: studentsData.filter(s => s.courseId === c.id).length,
          })),
        ].map(f => (
          <button
            key={f.id}
            onClick={() => { setSelectedCourse(f.id); setExpandedStudent(null) }}
            className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedCourse === f.id
                ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
            }`}
          >
            <span className="truncate max-w-[160px]">{f.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedCourse === f.id ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sort & summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-surface-500">
          {activeStudents > 0 && (
            <span className="text-emerald-600 font-medium">{activeStudents} activo{activeStudents !== 1 ? 's' : ''}</span>
          )}
          {activeStudents > 0 && completedStudents > 0 && <span className="text-surface-300 mx-1">·</span>}
          {completedStudents > 0 && (
            <span className="text-primary-600 font-medium">{completedStudents} completado{completedStudents !== 1 ? 's' : ''}</span>
          )}
          {sortedStudents.length > 0 && (
            <span className="text-surface-300 mx-1">·</span>
          )}
          <span className="text-surface-400">{sortedStudents.length} alumno{sortedStudents.length !== 1 ? 's' : ''}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">Ordenar:</span>
          {[
            { id: 'name', label: 'Nombre' },
            { id: 'progress', label: 'Progreso' },
            { id: 'activity', label: 'Actividad' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                sortBy === s.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-surface-400 hover:text-surface-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students table */}
      {sortedStudents.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="divide-y divide-surface-100">
            {sortedStudents.map((entry) => {
              const isExpanded = expandedStudent === `${entry.student.id}_${entry.courseId}`
              const name = entry.student.full_name || '—'
              const initial = name.charAt(0).toUpperCase()

              return (
                <div key={`${entry.student.id}_${entry.courseId}`}>
                  {/* Row */}
                  <div
                    className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer hover:bg-surface-50 ${
                      isExpanded ? 'bg-primary-50/30' : ''
                    }`}
                    onClick={() => setExpandedStudent(
                      isExpanded ? null : `${entry.student.id}_${entry.courseId}`
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {initial}
                    </div>

                    {/* Name + course */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-900 truncate">
                          {name}
                        </span>
                        {entry.status === 'completed' && (
                          <span className="shrink-0 badge-success text-[10px] font-medium">
                            Completado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 truncate mt-0.5">
                        {entry.courseTitle} · inscrito {formatDate(entry.enrolledAt)}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="w-32 shrink-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-surface-500">Progreso</span>
                        <span className={`font-semibold ${
                          entry.progress.percentage >= 80 ? 'text-emerald-600'
                          : entry.progress.percentage >= 40 ? 'text-amber-600'
                          : 'text-surface-600'
                        }`}>
                          {entry.progress.percentage}%
                        </span>
                      </div>
                      <ProgressBar percentage={entry.progress.percentage} size="sm" />
                    </div>

                    {/* Quiz score */}
                    <div className="w-20 shrink-0 text-center hidden sm:block">
                      <p className="text-xs text-surface-400 mb-0.5">Quiz</p>
                      <p className="text-sm font-semibold text-surface-900">
                        {entry.quiz.bestScore > 0 ? `${entry.quiz.bestScore}%` : '—'}
                      </p>
                    </div>

                    {/* Last activity */}
                    <div className="w-24 shrink-0 text-right hidden md:block">
                      <p className="text-xs text-surface-400 mb-0.5">Actividad</p>
                      <p className="text-xs font-medium text-surface-600">
                        {timeAgo(entry.progress.lastActivity)}
                      </p>
                    </div>

                    {/* Expand chevron */}
                    <div className={`shrink-0 text-surface-300 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && <StudentDetail studentData={entry} />}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">👥</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {selectedCourse === 'all' ? 'No hay alumnos inscritos' : 'No hay alumnos en este curso'}
          </h3>
          <p className="text-sm text-surface-500 mb-4">
            {selectedCourse === 'all'
              ? 'Los alumnos aparecerán aquí cuando se inscriban en tus cursos.'
              : 'Prueba seleccionando otro curso.'}
          </p>
          <Link to="/academy/app/docente" className="btn-primary text-sm inline-flex items-center gap-2">
            ← Volver al panel
          </Link>
        </div>
      )}

      {/* Quick course links */}
      {courses.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Tus cursos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => {
              const count = studentsData.filter(s => s.courseId === course.id).length
              const courseAvgPct = studentsData
                .filter(s => s.courseId === course.id)
                .reduce((s, d) => s + (d.progress.percentage || 0), 0)
              const avg = count > 0 ? Math.round(courseAvgPct / count) : 0

              return (
                <Link
                  key={course.id}
                  to={`/docente/cursos/${course.slug}`}
                  className="card p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-surface-900 group-hover:text-primary-700 transition-colors truncate">
                      {course.title}
                    </h3>
                    <span className="shrink-0 text-surface-400 group-hover:text-primary-600 transition-colors ml-2">→</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-surface-500">
                    <span>👥 {count} alumno{count !== 1 ? 's' : ''}</span>
                    {count > 0 && <span>📊 {avg}% promedio</span>}
                  </div>
                  {count > 0 && (
                    <div className="mt-2">
                      <ProgressBar percentage={avg} size="sm" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
