import React, { useState, useEffect, Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import RouteFallback from '@/components/common/RouteFallback'
import { CourseSidebarProvider, useCourseSidebar } from '@/contexts/CourseSidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearch from '@/components/common/GlobalSearch'
import NotificationsDropdown from '@/components/common/NotificationsDropdown'
import UserMenu from '@/components/common/UserMenu'
import Logo from '@/components/common/Logo'

const MAIN_WEB_URL = import.meta.env.VITE_MAIN_WEB_URL || 'https://www.qawaylab.com'

export default function LessonLayout() {
  return (
    <CourseSidebarProvider>
      <LessonLayoutContent />
    </CourseSidebarProvider>
  )
}

function LessonLayoutContent() {
  const { courseSidebar } = useCourseSidebar()
  const cs = courseSidebar
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})

  // Al cargar o cambiar de lección, expandir únicamente el módulo que contiene la lección activa
  useEffect(() => {
    if (!cs?.modules || !cs?.currentLessonId) return

    const initialCollapsed: Record<string, boolean> = {}
    cs!.modules.forEach(mod => {
      const containsActiveLesson = mod.lessons?.some(l => l.id === cs!.currentLessonId)
      initialCollapsed[mod.id] = !containsActiveLesson
    })
    setCollapsedModules(initialCollapsed)
  }, [cs?.currentLessonId, cs?.slug])

  const toggleModule = (id: string) => {
    setCollapsedModules(prev => {
      const isCurrentlyCollapsed = Boolean(prev[id])
      if (isCurrentlyCollapsed) {
        const nextState: Record<string, boolean> = {}
        cs?.modules?.forEach(mod => {
          nextState[mod.id] = mod.id !== id
        })
        return nextState
      }
      return { ...prev, [id]: true }
    })
  }

  const showSidebar = Boolean(courseSidebar && cs!.visible && cs!.modules?.length > 0)
  const isStudentMode = Boolean(cs?.coursePath?.startsWith('/academy/app/panel'))
  const coursesLink = isStudentMode ? '/academy/app/panel/cursos' : '/academy/app/cursos'

  return (
    <div className="flex min-h-screen flex-col bg-surface-50 font-sans">
      {/* Header — acciones + utilidades a la derecha */}
      <header className={`fixed top-0 right-0 z-40 h-16 border-b border-surface-200 bg-white transition-all duration-300 ${showSidebar && isSidebarOpen ? 'w-[calc(100%-20rem)]' : 'w-full'}`}>
        <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {showSidebar && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className="flex shrink-0 items-center justify-center border border-surface-200 bg-surface-50 h-9 w-9 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900 cursor-pointer"
              >
                {isSidebarOpen ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}

            {/* Breadcrumbs en la cabecera */}
            {cs && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-500 font-medium truncate">
                <Link to={coursesLink} className="hover:text-surface-900 transition shrink-0">Cursos</Link>
                <span>/</span>
                <Link to={cs!.coursePath || (cs!.slug ? `/academy/app/cursos/${cs!.slug}` : '/academy/app/cursos')} className="hover:text-surface-900 transition truncate max-w-[200px]">{cs!.title}</Link>
                {cs!.currentLessonTitle && (
                  <>
                    <span>/</span>
                    <span className="text-surface-800 font-semibold truncate max-w-[240px]">{cs!.currentLessonTitle}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right utility icons: Search, Notifications, Avatar */}
          <div className="flex shrink-0 items-center gap-3 ml-4">
            <GlobalSearch />
            <NotificationsDropdown />
            {authLoading ? null : user ? (
              <UserMenu user={user} profile={profile} signOut={signOut} />
            ) : (
              <Link
                to="/academy/app/acceder"
                className="flex h-9 items-center justify-center border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-700 transition hover:bg-surface-50 hover:text-surface-900"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main layout grid */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar — Temario con tarjeta superior oscura y banner de soporte */}
        {showSidebar && isSidebarOpen && (
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-80 flex-col justify-between overflow-y-auto border-r border-surface-200 bg-[#f8f9f7] p-4 hide-scrollbar">
            <div>
              {/* Logo único de la app — alineado con la misma ubicación que el navbar original (px-6 → sm:px-10 → lg:px-14) */}
              <div className="flex items-center mb-6 mt-1 ml-2 sm:ml-6 lg:ml-10">
                <Logo href={MAIN_WEB_URL} target="_blank" rel="noopener noreferrer" />
              </div>

              <Link
                to={cs?.coursePath || (cs?.slug ? `/academy/app/cursos/${cs!.slug}` : '/academy/app/cursos')}
                className="flex h-9 mb-4 items-center gap-1.5 border border-surface-200 bg-surface-50 px-3 text-xs font-semibold text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al curso
              </Link>

              {/* Tarjeta superior oscura del curso */}
              <div className="relative mb-4 overflow-hidden rounded-sm bg-[#0c1a30] p-4 text-white">
                <div className="absolute -right-3 -bottom-3 text-white/5 font-mono text-6xl select-none font-bold">
                  &lt;/&gt;
                </div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-white/50 uppercase mb-1">CURSO</p>
                <h2 className="text-sm font-bold leading-snug line-clamp-2 text-white mb-3" title={cs!.title}>
                  {cs!.title}
                </h2>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-white/70 font-medium">
                    <span>{cs!.progressPct || 0}% completado</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-sm bg-white/10 mb-2">
                    <div className="h-full bg-[#ff4b0b] transition-all duration-300" style={{ width: `${cs!.progressPct || 0}%` }} />
                  </div>
                  {/* Badges de lección */}
                  {cs!.currentLessonNumber && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded-[2px]">
                        Lección {cs!.currentLessonNumber} de {cs!.totalLessons}
                      </span>
                      {cs!.currentLessonDuration != null && cs!.currentLessonDuration > 0 && (
                        <span className="text-[10px] font-semibold text-white/80">
                          ⏱ {Math.floor((cs!.currentLessonDuration ?? 0) / 60)}:{String(Math.floor((cs!.currentLessonDuration ?? 0) % 60)).padStart(2, '0')} min
                        </span>
                      )}
                      {cs!.completed && (
                        <span className="text-[10px] font-bold text-emerald-400 ml-auto">✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Temario del curso */}
              <nav className="space-y-2">
                {cs!.modules.map((module, moduleIndex) => {
                  const isCollapsed = Boolean(collapsedModules[module.id])
                  return (
                    <div key={module.id || moduleIndex} className="border-b border-surface-200/80 pb-2">
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between gap-2 py-2 px-1 text-xs font-bold text-surface-800 transition hover:text-surface-900 text-left cursor-pointer"
                      >
                        <span className="truncate">{moduleIndex + 1}. {module.title}</span>
                        <svg
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-surface-400' : 'text-surface-800'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {!isCollapsed && (
                        <div className="mt-1 space-y-0.5 border-t border-surface-200/50 pt-1">
                          {module.lessons?.map((lesson) => {
                            const isCurrent = lesson.id === cs!.currentLessonId
                            const lessonUrl = `${cs!.coursePath || `/academy/app/cursos/${cs!.slug}`}/leccion/${lesson.number}`
                            return (
                              <React.Fragment key={lesson.id}>
                                <Link
                                  to={lessonUrl}
                                  className={isCurrent
                                    ? 'flex items-center gap-2 border-l-2 border-[#ff4b0b] bg-white px-2.5 py-2 text-xs font-bold text-[#ff4b0b] transition-colors shadow-sm'
                                    : 'flex items-center gap-2 border-l-2 border-transparent px-2.5 py-2 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-200/60 hover:text-surface-900'
                                  }
                                >
                                  {isCurrent ? (
                                    <svg className="h-3.5 w-3.5 shrink-0 text-[#ff4b0b]" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  ) : (
                                    <span className="shrink-0 text-surface-400 font-mono text-[11px]">{lesson.number}.</span>
                                  )}
                                  <span className="truncate">{lesson.title}</span>
                                  {lesson.isFreePreview && (
                                    <span className="ml-auto shrink-0 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">Gratis</span>
                                  )}
                                </Link>
                              </React.Fragment>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>

            {/* Banner inferior de ayuda/soporte */}
            <div className="mt-6 rounded-sm border border-blue-100 bg-[#edf5ff] p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-blue-600 text-white text-xs font-bold">
                  💬
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-surface-900">¿Dudas o necesitas ayuda?</p>
                  <p className="mt-0.5 text-[11px] text-surface-600 leading-tight">Nuestro equipo está aquí para acompañarte en tu aprendizaje.</p>
                  <a
                    href="https://www.qawaylab.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    Contactar soporte ↗
                  </a>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Content area */}
        <main className={`flex-1 bg-white min-h-[calc(100vh-64px)] transition-all duration-300 ${showSidebar && isSidebarOpen ? 'xl:pl-80' : 'pl-0'}`}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Footer — solo logo */}
      <footer className="border-t border-surface-200 bg-white py-6">
        <div className="mx-auto flex max-w-[98rem] items-center px-6 sm:px-10 lg:px-14">
          <Logo href={MAIN_WEB_URL} target="_blank" rel="noopener noreferrer" size="sm" />
        </div>
      </footer>
    </div>
  )
}
