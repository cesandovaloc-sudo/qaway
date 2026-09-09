import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface RawLesson {
  id: string
  title: string
  sort_order: number | null
  status: string | null
  duration: string | null
  video_url: string | null
  transcript_status: string | null
}

interface RawModule {
  id: string
  title: string
  sort_order: number | null
  lessons: RawLesson[] | null
}

interface RawCourse {
  id: string
  title: string
  slug: string
  status: string | null
  modules: RawModule[] | null
}

interface EnrichedLesson extends RawLesson {
  courseId: string
  courseTitle: string
  courseSlug: string
  moduleTitle: string
  moduleId: string
  resourceCount: number
  hasQuiz: boolean
  quizId: string | null
  questionCount: number
  hasVideo: boolean
  hasTranscript: boolean
}

interface EnrichedModule extends RawModule {
  lessons: EnrichedLesson[] | null
}

interface EnrichedCourse extends RawCourse {
  modules: EnrichedModule[] | null
}

interface ContentStats {
  totalCourses: number
  totalLessons: number
  publishedLessons: number
  draftLessons: number
  withResources: number
  withoutResources: number
  withQuiz: number
  withoutQuiz: number
  withQuizAndQuestions: number
  withVideo: number
  withoutVideo: number
  withTranscript: number
  withoutTranscript: number
}

interface ContentDashboard {
  courses: EnrichedCourse[]
  flatLessons: EnrichedLesson[]
  stats: ContentStats
}

async function loadContentDashboard(teacherId: string | undefined): Promise<ContentDashboard> {
  if (!teacherId) return { courses: [], flatLessons: [], stats: { totalCourses: 0, totalLessons: 0, publishedLessons: 0, draftLessons: 0, withResources: 0, withoutResources: 0, withQuiz: 0, withoutQuiz: 0, withQuizAndQuestions: 0, withVideo: 0, withoutVideo: 0, withTranscript: 0, withoutTranscript: 0 } }

  // 1. Get all courses with modules and lessons (keep hierarchy!)
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(`
      id, title, slug, status,
      modules:modules (
        id, title, sort_order,
        lessons:lessons (
          id, title, sort_order, status, duration, video_url,
          transcript_status
        )
      )
    `)
    .eq('instructor_id', teacherId)
    .order('title')

  if (coursesError) throw coursesError
  if (!courses?.length) return { courses: [], flatLessons: [], stats: { totalCourses: 0, totalLessons: 0, publishedLessons: 0, draftLessons: 0, withResources: 0, withoutResources: 0, withQuiz: 0, withoutQuiz: 0, withQuizAndQuestions: 0, withVideo: 0, withoutVideo: 0, withTranscript: 0, withoutTranscript: 0 } }

  // Collect all lesson IDs
  const lessonIds: string[] = []
  for (const course of courses) {
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        lessonIds.push(lesson.id)
      }
    }
  }

  if (lessonIds.length === 0) {
    return { courses: courses as EnrichedCourse[], flatLessons: [], stats: { totalCourses: courses.length, totalLessons: 0, publishedLessons: 0, draftLessons: 0, withResources: 0, withoutResources: 0, withQuiz: 0, withoutQuiz: 0, withQuizAndQuestions: 0, withVideo: 0, withoutVideo: 0, withTranscript: 0, withoutTranscript: 0 } }
  }

  // 2. Get resources per lesson
  const { data: resourcesData } = await supabase
    .from('resources')
    .select('lesson_id, id')
    .in('lesson_id', lessonIds)

  const resourceCountMap: Record<string, number> = {}
  for (const r of (resourcesData as { lesson_id: string; id: string }[]) || []) {
    resourceCountMap[r.lesson_id] = (resourceCountMap[r.lesson_id] || 0) + 1
  }

  // 3. Get quizzes per lesson
  const { data: quizzesData } = await supabase
    .from('quizzes')
    .select('id, lesson_id')
    .in('lesson_id', lessonIds)

  const quizMap: Record<string, string> = {}
  for (const q of (quizzesData as { id: string; lesson_id: string }[]) || []) {
    quizMap[q.lesson_id] = q.id
  }

  // 4. Get question counts per quiz
  const quizIds = ((quizzesData as { id: string }[]) || []).map(q => q.id)
  let questionCountMap: Record<string, number> = {}
  if (quizIds.length > 0) {
    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('quiz_id')
      .in('quiz_id', quizIds)
    for (const q of (questionsData as { quiz_id: string }[]) || []) {
      questionCountMap[q.quiz_id] = (questionCountMap[q.quiz_id] || 0) + 1
    }
  }

  // 5. Enrich each lesson with resource/quiz/transcript info (keeping hierarchy)
  const flatLessons: EnrichedLesson[] = []
  const enrichedCourses = (courses as RawCourse[]).map(course => ({
    ...course,
    modules: (course.modules || []).map(mod => ({
      ...mod,
      lessons: (mod.lessons || [])
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(lesson => {
          const enriched: EnrichedLesson = {
            ...lesson,
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            moduleTitle: mod.title,
            moduleId: mod.id,
            resourceCount: resourceCountMap[lesson.id] || 0,
            hasQuiz: Boolean(quizMap[lesson.id]),
            quizId: quizMap[lesson.id] || null,
            questionCount: quizMap[lesson.id] ? (questionCountMap[quizMap[lesson.id]] || 0) : 0,
            hasVideo: Boolean(lesson.video_url),
            hasTranscript: lesson.transcript_status !== 'none' && lesson.transcript_status !== null,
          }
          flatLessons.push(enriched)
          return enriched
        }),
    })),
  })) as EnrichedCourse[]

  // 6. Compute stats
  const stats: ContentStats = {
    totalCourses: courses.length,
    totalLessons: flatLessons.length,
    publishedLessons: flatLessons.filter(l => l.status === 'published').length,
    draftLessons: flatLessons.filter(l => l.status === 'draft' || !l.status).length,
    withResources: flatLessons.filter(l => l.resourceCount > 0).length,
    withoutResources: flatLessons.filter(l => l.resourceCount === 0).length,
    withQuiz: flatLessons.filter(l => l.hasQuiz).length,
    withoutQuiz: flatLessons.filter(l => !l.hasQuiz).length,
    withQuizAndQuestions: flatLessons.filter(l => l.hasQuiz && l.questionCount > 0).length,
    withVideo: flatLessons.filter(l => l.hasVideo).length,
    withoutVideo: flatLessons.filter(l => !l.hasVideo).length,
    withTranscript: flatLessons.filter(l => l.hasTranscript).length,
    withoutTranscript: flatLessons.filter(l => l.hasVideo && !l.hasTranscript).length,
  }

  return { courses: enrichedCourses, flatLessons, stats }
}

/* ─── Sub-components ─── */

function StatCard({ icon, label, value, sublabel, color = 'bg-primary-50 text-primary-700' }: {
  icon: ReactNode
  label: string
  value: string | number
  sublabel?: string
  color?: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-none ${color} text-lg shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-surface-900">{value}</p>
          <p className="text-xs text-surface-500">{label}</p>
          {sublabel && <p className="text-[10px] text-surface-400 mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const map: Record<string, { bg: string; label: string }> = {
    published: { bg: 'bg-emerald-50 text-emerald-700', label: 'Publicado' },
    draft: { bg: 'bg-surface-100 text-surface-600', label: 'Borrador' },
    review: { bg: 'bg-amber-50 text-amber-700', label: 'Revisión' },
  }
  const s = map[status || ''] || { bg: 'bg-surface-100 text-surface-500', label: status || '—' }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg}`}>{s.label}</span>
}

function LessonRow({ lesson, searchQuery }: { lesson: EnrichedLesson; searchQuery: string }) {
  const [expanded, setExpanded] = useState(false)

  const issues: string[] = []
  if (!lesson.hasVideo) issues.push('Sin video')
  if (lesson.resourceCount === 0) issues.push('Sin recursos')
  if (!lesson.hasQuiz) issues.push('Sin quiz')
  if (!lesson.hasTranscript && lesson.hasVideo) issues.push('Sin transcripción')
  if (lesson.hasQuiz && lesson.questionCount === 0) issues.push('Quiz sin preguntas')

  // Highlight if matches search
  const matchesSearch = searchQuery && (
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (searchQuery && !matchesSearch) return null

  return (
    <div className={`border-b border-surface-100 last:border-b-0 ${matchesSearch ? 'bg-yellow-50/50' : ''}`}>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer hover:bg-surface-50 ${expanded ? 'bg-surface-50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <svg className={`h-3 w-3 shrink-0 text-surface-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-200 text-[8px] font-medium text-surface-500">
          {lesson.sort_order || '·'}
        </span>
        <span className="text-xs font-medium text-surface-800 truncate flex-1">{lesson.title}</span>
        <StatusBadge status={lesson.status} />
        {issues.length > 0 && lesson.status === 'published' && (
          <span className="shrink-0 rounded-none bg-red-50 px-1.5 py-0.5 text-[8px] font-medium text-red-600">{issues.length}</span>
        )}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] ${lesson.hasVideo ? 'text-emerald-500' : 'text-surface-300'}`}>🎬</span>
          <span className={`text-[10px] ${lesson.resourceCount > 0 ? 'text-emerald-500' : 'text-surface-300'}`}>📎</span>
          <span className={`text-[10px] ${lesson.hasQuiz && lesson.questionCount > 0 ? 'text-emerald-500' : 'text-surface-300'}`}>❓</span>
          <span className={`text-[10px] ${lesson.hasTranscript ? 'text-emerald-500' : 'text-surface-300'}`}>🎤</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-surface-100 bg-surface-50/70 px-4 py-3 sm:px-10">
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              { icon: '🎬', label: 'Video', ok: lesson.hasVideo, detail: lesson.duration || '—', ko: 'Sin video' },
              { icon: '📎', label: 'Recursos', ok: lesson.resourceCount > 0, detail: `${lesson.resourceCount} recurso${lesson.resourceCount !== 1 ? 's' : ''}`, ko: 'Sin recursos' },
              { icon: '❓', label: 'Quiz', ok: lesson.hasQuiz && lesson.questionCount > 0, detail: `${lesson.questionCount} preguntas`, ko: lesson.hasQuiz ? 'Sin preguntas' : 'Sin quiz' },
              { icon: '🎤', label: 'Transcripción', ok: lesson.hasTranscript, detail: 'Disponible', ko: lesson.hasVideo ? 'Pendiente' : 'Sin video' },
            ].map(item => (
              <div key={item.label} className="rounded-none bg-white border border-surface-100 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-surface-500">{item.icon} {item.label}</span>
                  <span className={`text-[10px] font-medium ${item.ok ? 'text-emerald-600' : 'text-surface-400'}`}>{item.ok ? '✓' : '·'}</span>
                </div>
                <p className={`text-[11px] ${item.ok ? 'text-surface-800' : 'text-surface-400'}`}>{item.ok ? item.detail : item.ko}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5">
            <Link to={`/docente/cursos/${lesson.courseSlug}`} className="btn-primary text-[10px] px-2.5 py-1">
              Gestionar → {lesson.courseTitle}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ModuleSection({ module, searchQuery, defaultExpanded }: { module: EnrichedModule; searchQuery: string; defaultExpanded: boolean }) {
  const [collapsed, setCollapsed] = useState(!defaultExpanded)

  const sortedLessons = (module.lessons || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const pubCount = sortedLessons.filter(l => l.status === 'published').length

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 rounded-none px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-100 cursor-pointer"
      >
        <svg className={`h-3 w-3 shrink-0 text-surface-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="truncate text-left flex-1">{module.title}</span>
        <span className="shrink-0 text-[10px] text-surface-400">{pubCount}/{sortedLessons.length} pub</span>
      </button>

      {!collapsed && (
        <div className="ml-3 border-l border-surface-100 pl-2">
          {sortedLessons.length > 0 ? (
            sortedLessons.map(lesson => (
              <LessonRow key={lesson.id} lesson={lesson} searchQuery={searchQuery} />
            ))
          ) : (
            <p className="px-3 py-3 text-[11px] text-surface-400 italic">Sin lecciones</p>
          )}
        </div>
      )}
    </div>
  )
}

function CourseSection({ course, flatLessons, searchQuery, defaultExpanded }: { course: EnrichedCourse; flatLessons: EnrichedLesson[]; searchQuery: string; defaultExpanded: boolean }) {
  const [collapsed, setCollapsed] = useState(!defaultExpanded)

  const courseLessons = flatLessons.filter(l => l.courseId === course.id)
  const pubCount = courseLessons.filter(l => l.status === 'published').length
  const rCount = courseLessons.filter(l => l.resourceCount > 0).length
  const qCount = courseLessons.filter(l => l.hasQuiz).length
  const tCount = courseLessons.filter(l => l.hasTranscript).length

  // Sort modules by sort_order
  const sortedModules = [...(course.modules || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  return (
    <div className="card overflow-hidden">
      {/* Course header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-surface-50 border-b border-surface-200 cursor-pointer hover:bg-surface-100 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-none bg-primary-100 text-sm shrink-0">📚</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-surface-900 truncate">{course.title}</h2>
              <StatusBadge status={course.status} />
            </div>
            <p className="text-[10px] text-surface-400 mt-0.5">
              {courseLessons.length} lec · {pubCount} pub · 📎{rCount} · ❓{qCount} · 🎤{tCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to={`/docente/cursos/${course.slug}`} onClick={e => e.stopPropagation()} className="btn-ghost text-[10px] px-2 py-1 shrink-0">
            Gestionar
          </Link>
          <svg className={`h-4 w-4 text-surface-300 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Modules with lessons */}
      {!collapsed && (
        <div className="divide-y divide-surface-50 px-4 py-3 space-y-2">
          {sortedModules.length > 0 ? (
            sortedModules.map((mod, idx) => (
              <ModuleSection key={mod.id} module={mod} searchQuery={searchQuery} defaultExpanded={idx === 0} />
            ))
          ) : (
            <p className="text-xs text-surface-400 text-center py-4">Este curso no tiene módulos aún</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function TeacherContent() {
  const { user } = useAuth()
  const { data, loading } = useData<ContentDashboard>(() => loadContentDashboard(user?.id), [user?.id])
  const [searchQuery, setSearchQuery] = useState('')

  const courses = data?.courses || []
  const flatLessons = data?.flatLessons || []
  const stats = data?.stats || { totalCourses: 0, totalLessons: 0, publishedLessons: 0, draftLessons: 0, withResources: 0, withoutResources: 0, withQuiz: 0, withoutQuiz: 0, withQuizAndQuestions: 0, withVideo: 0, withoutVideo: 0, withTranscript: 0, withoutTranscript: 0 }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-title">Panel de Contenido</h1>
        <p className="section-subtitle mt-1">Auditoría del contenido de todos tus cursos: qué tiene y qué falta por crear</p>
      </div>

      {/* Stats row 1 */}
      {stats.totalLessons > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="📚" label="Cursos" value={stats.totalCourses} sublabel={`${stats.totalLessons} lecciones`} color="bg-surface-100 text-surface-600" />
          <StatCard icon="📖" label="Publicadas" value={`${stats.publishedLessons}/${stats.totalLessons}`} sublabel={stats.draftLessons > 0 ? `${stats.draftLessons} en borrador` : 'Todo publicado'} color="bg-surface-100 text-surface-600" />
          <StatCard icon="📎" label="Con recursos" value={`${stats.withResources}/${stats.totalLessons}`} sublabel={stats.withoutResources > 0 ? `${stats.withoutResources} sin recursos` : 'Completo'} color="bg-surface-100 text-surface-600" />
          <StatCard icon="❓" label="Quiz completo" value={`${stats.withQuizAndQuestions}/${stats.totalLessons}`} sublabel={stats.withoutQuiz > 0 ? `${stats.withoutQuiz} sin quiz` : `${stats.totalLessons - stats.withQuizAndQuestions} sin preguntas`} color="bg-surface-100 text-surface-600" />
        </div>
      )}

      {/* Stats row 2 */}
      {stats.totalLessons > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <StatCard icon="🎬" label="Con video" value={`${stats.withVideo}/${stats.totalLessons}`} sublabel={stats.withoutVideo > 0 ? `${stats.withoutVideo} sin video` : 'Completo'} color="bg-cyan-50 text-cyan-700" />
          <StatCard icon="🎤" label="Con transcripción" value={`${stats.withTranscript}/${stats.totalLessons}`} sublabel={stats.withoutTranscript > 0 ? `${stats.withoutTranscript} pendientes` : 'Completo'} color="bg-rose-50 text-rose-700" />
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar lecciones..." className="input-field pl-9 pr-3 h-10 text-sm" />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Courses with modules > lessons */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course, idx) => (
            <CourseSection key={course.id} course={course} flatLessons={flatLessons} searchQuery={searchQuery} defaultExpanded={idx === 0} />
          ))}
          {searchQuery && flatLessons.filter(l =>
            l.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="card p-8 text-center">
              <span className="text-3xl block mb-3">🔍</span>
              <p className="text-sm text-surface-500">No se encontraron lecciones con ese nombre</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">📝</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">No tienes cursos asignados</h3>
          <p className="text-sm text-surface-500 mb-4">Los cursos que te asigne un administrador aparecerán aquí.</p>
          <Link to="/docente" className="btn-primary text-sm inline-flex items-center gap-2">← Volver al panel</Link>
        </div>
      )}
    </div>
  )
}
