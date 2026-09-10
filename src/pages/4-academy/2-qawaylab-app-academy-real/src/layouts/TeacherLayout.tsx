import { useState, useEffect, useRef, Suspense } from 'react'
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useData } from '@/hooks/useData'
import type { Module } from '@/lib/types'
import GlobalSearch from '@/components/common/GlobalSearch'
import UserMenu from '@/components/common/UserMenu'
import { TeacherPreviewProvider, useTeacherPreview } from '@/contexts/TeacherPreviewContext'
import StudentPreviewPanel from '@/components/teacher/StudentPreviewPanel'
import RouteFallback from '@/components/common/RouteFallback'

const sidebarLinks = [
  { to: '/academy/app/docente', label: 'Panel', icon: '📊' },
  { to: '/academy/app/docente/cursos', label: 'Mis Cursos', icon: '📚' },
  { to: '/academy/app/docente/contenido', label: 'Contenido', icon: '📝' },
  { to: '/academy/app/docente/alumnos', label: 'Alumnos', icon: '👥' },
  { to: '/academy/app/docente/tareas', label: 'School [BETA]', icon: '🏫', beta: true, separator: true },
]

const ALLOWED_ROLES = ['teacher', 'editor']

export default function TeacherLayout() {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return <Navigate to="/academy/app/acceder" replace />
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!ALLOWED_ROLES.includes(profile?.role || '')) return <Navigate to="/academy/app/acceder" replace />

  return (
    <TeacherPreviewProvider>
      <TeacherLayoutContent />
    </TeacherPreviewProvider>
  )
}

function TeacherLayoutContent() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOpen, toggle, previewLesson, courseData } = useTeacherPreview()
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})
  const prevModulesRef = useRef<Module[] | null>(null)
  const [collapsedCourses, setCollapsedCourses] = useState<Record<string, boolean>>({})

  // Determine if we're on a courses page (list or specific course)
  const isCourseList = location.pathname === '/academy/app/docente/cursos'
  const isCourseDetail = Boolean(location.pathname.match(/^\/academy\/app\/docente\/cursos\/[^/]+$/))
  const showCoursesSidebar = isCourseList || isCourseDetail

  // Load all teacher courses for sidebar
  const { data: allCourses } = useData(
    async () => {
      if (!user?.id) return []
      const { data, error } = await supabase.from('courses')
        .select('id, title, slug, status')
        .eq('instructor_id', user.id)
        .order('title')
      if (error) throw error
      return data || []
    },
    [user?.id]
  )

  // Auto-collapse all courses except the current one when on a course page
  useEffect(() => {
    if (!allCourses?.length) return
    const currentSlug = isCourseDetail ? location.pathname.split('/').pop() : null
    const initial: Record<string, boolean> = {}
    allCourses.forEach(c => {
      initial[c.id] = c.slug !== currentSlug
    })
    setCollapsedCourses(initial)
  }, [allCourses, location.pathname, isCourseDetail])

  // Auto-expand first module when course loads (only on actual module change, not on re-renders)
  useEffect(() => {
    const modules = courseData?.modules
    if (modules && modules !== prevModulesRef.current) {
      prevModulesRef.current = modules
      const initial: Record<string, boolean> = {}
      modules.forEach((mod, i) => {
        initial[mod.id] = i > 0 // only first module expanded
      })
      setCollapsedModules(initial)
    }
  }, [courseData?.modules])

  const toggleModule = (moduleId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const toggleCourse = (courseId: string) => {
    setCollapsedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId],
    }))
  }

  // Build module-lesson map with flat numbering for current course
  let lessonCounter = 0
  const moduleLessonNumbers: Record<string, Record<string, number>> = {}
  if (courseData?.modules) {
    for (const mod of courseData.modules) {
      if (!moduleLessonNumbers[mod.id]) moduleLessonNumbers[mod.id] = {}
      for (const lesson of mod.lessons || []) {
        lessonCounter += 1
        moduleLessonNumbers[mod.id][lesson.id] = lessonCounter
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Left sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-surface-200 bg-white">
        <div className="flex h-16 items-center border-b border-surface-200 px-6" />

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarLinks.map((link, idx) => (
            <div key={link.to}>
              {link.separator && idx > 0 && (
                <div className="border-t border-surface-100 my-2" />
              )}
              <Link
                to={link.to}
                className={`flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.to || (link.to !== '/docente' && location.pathname.startsWith(link.to + '/'))
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {link.beta && (
                  <span className="rounded-none bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 uppercase tracking-wider">
                    Beta
                  </span>
                )}
              </Link>

              {/* Course list under Mis Cursos */}
              {link.to === '/docente/cursos' && showCoursesSidebar && (allCourses || []).length > 0 && (
                <div className="mt-1 ml-3 border-l border-surface-200 pl-3 space-y-1">
                  {(allCourses || []).map((course) => {
                    const currentSlug = location.pathname.split('/').pop()
                    const isCurrentCourse = isCourseDetail && course.slug === currentSlug
                    const isExpanded = !collapsedCourses[course.id]

                    return (
                      <div key={course.id}>
                        {/* Course button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentCourse) {
                              toggleCourse(course.id)
                            } else {
                              navigate(`/academy/app/docente/cursos/${course.slug}`)
                            }
                          }}
                          className={`flex w-full items-center gap-2 rounded-none px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                            isCurrentCourse
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                          }`}
                          title={course.title}
                        >
                          <svg
                            className={`h-3 w-3 shrink-0 text-surface-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="truncate text-left flex-1">{course.title}</span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                            course.status === 'published' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {course.status === 'published' ? 'Pub' : 'Bor'}
                          </span>
                        </button>

                        {/* Expanded: show modules/lessons for current course */}
                        {isExpanded && isCurrentCourse && courseData?.slug === location.pathname.split('/').pop() && courseData?.modules && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-surface-100 pl-2">
                            {(courseData.modules || []).map((mod) => {
                              const isModCollapsed = Boolean(collapsedModules[mod.id])
                              return (
                                <div key={mod.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggleModule(mod.id)}
                                    className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 text-[11px] font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 cursor-pointer"
                                  >
                                    <svg
                                      className={`h-2.5 w-2.5 shrink-0 text-surface-400 transition-transform duration-200 ${isModCollapsed ? '-rotate-90' : ''}`}
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span className="truncate text-left flex-1">{mod.title}</span>
                                    <span className="shrink-0 text-[9px] text-surface-400">{mod.lessons?.length || 0}</span>
                                  </button>

                                  {!isModCollapsed && (
                                    <div className="ml-3 mt-0.5 space-y-0.5 border-l border-surface-100 pl-2">
                                      {(mod.lessons || []).map((lesson, lessonIdx) => {
                                        const lessonNumber = moduleLessonNumbers[mod.id]?.[lesson.id] || lessonIdx + 1
                                        return (
                                          <div key={lesson.id} className="flex items-center gap-2 rounded-none px-2 py-1 text-[11px] text-surface-500">
                                            <span className="shrink-0 text-[9px] text-surface-400 w-3.5">{lessonNumber}.</span>
                                            <span className="truncate">{lesson.title}</span>
                                            <span className={`ml-auto shrink-0 rounded-full px-1 py-0.5 text-[8px] font-medium ${
                                              lesson.status === 'published' ? 'badge-success' : 'badge-warning'
                                            }`}>
                                              {lesson.status === 'published' ? 'Pub' : 'Bor'}
                                            </span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-surface-200 p-4">
          <Link
            to="/academy/app/cursos"
            className="flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
          >
            ← Volver a Cursos
          </Link>
        </div>
      </aside>

      {/* Center content */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isOpen ? 'mr-96' : 'mr-0'}`}>
        <div className="ml-64 flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 backdrop-blur-xl px-8">
            <div className="flex items-center gap-4">
              <GlobalSearch />
              {/* Preview toggle */}
              {previewLesson && (
                <button
                  onClick={toggle}
                  className={`flex items-center gap-2 rounded-none px-3 py-1.5 text-xs font-medium transition-colors ${
                    isOpen
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                  title={isOpen ? 'Cerrar vista previa' : 'Abrir vista previa'}
                >
                  <span>👁</span>
                  <span className="hidden sm:inline">{isOpen ? 'Cerrar preview' : 'Vista previa'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <UserMenu user={user} profile={profile} signOut={signOut} />
            </div>
          </header>

          <main className="flex-1 p-8">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      {/* Right preview panel */}
      {isOpen && previewLesson && (
        <aside className="fixed right-0 top-0 z-40 flex h-full w-96 flex-col border-l border-surface-200 bg-white">
          <div className="flex h-16 items-center justify-between border-b border-surface-200 px-5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">👁</span>
              <span className="text-sm font-semibold text-surface-900 truncate">Vista del estudiante</span>
            </div>
            <button
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-none text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <StudentPreviewPanel />
          </div>
        </aside>
      )}
    </div>
  )
}
