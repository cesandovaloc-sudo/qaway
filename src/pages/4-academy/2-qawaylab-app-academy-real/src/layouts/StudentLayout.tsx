import React, { useState, useEffect, Suspense } from 'react'
import { Link, Outlet, useLocation, Navigate, type Location } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/hooks/useData'
import { getEnrollments } from '@/lib/services'
import { CourseSidebarProvider, useCourseSidebar } from '@/contexts/CourseSidebarContext'
import UserMenu from '@/components/common/UserMenu'
import GlobalSearch from '@/components/common/GlobalSearch'
import NotificationsDropdown from '@/components/common/NotificationsDropdown'
import Logo from '@/components/common/Logo'
import RouteFallback from '@/components/common/RouteFallback'

const sidebarLinks = [
  { to: '/academy/app/panel', label: 'Panel', icon: '📊' },
  { to: '/academy/app/panel/cursos', label: 'Mis Cursos', icon: '📚' },
  { to: '/academy/app/panel/certificados', label: 'Certificados', icon: '🎓', separator: true },
  { to: '/academy/app/panel/recursos', label: 'Recursos', icon: '📎' },
]

export default function StudentLayout() {
  const { user, profile, loading } = useAuth()

  // Redirigir según rol si no es student
  const roleRoutes: Record<string, string> = {
    teacher: '/academy/app/docente',
    editor: '/academy/app/docente',
    admin: '/academy/app/admin',
    support: '/academy/app/admin',
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/academy/app/acceder" replace />
  if (profile?.role && roleRoutes[profile.role]) return <Navigate to={roleRoutes[profile.role]} replace />

  return (
    <CourseSidebarProvider>
      <StudentLayoutContent />
    </CourseSidebarProvider>
  )
}

function StudentLayoutContent() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const { courseSidebar } = useCourseSidebar()
  const [isSidebarManuallyCollapsed, setIsSidebarManuallyCollapsed] = useState(false)

  const isSidebarCollapsed = courseSidebar?.forceCollapse || isSidebarManuallyCollapsed

  const toggleSidebar = () => {
    setIsSidebarManuallyCollapsed(!isSidebarCollapsed)
  }

  return (
      <div className="flex min-h-screen bg-surface-50">
        <StudentSidebar
          location={location}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        <div className={`flex flex-1 flex-col transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-surface-200 bg-white/80 px-8 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex h-10 w-10 items-center justify-center rounded-none border border-surface-200 bg-white text-surface-600 transition hover:bg-surface-50 hover:text-surface-900 cursor-pointer"
                title={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
              >
                {isSidebarCollapsed ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <GlobalSearch />
              <NotificationsDropdown />
              <div className="h-6 w-px bg-surface-200 mx-1 hidden sm:block"></div>
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
  )
}

function StudentSidebar({ location, isCollapsed, onToggle }: { location: Location; isCollapsed: boolean; onToggle: () => void }) {
  const { user } = useAuth()
  const { courseSidebar } = useCourseSidebar()
  const showCourseSidebar = Boolean(courseSidebar?.visible && courseSidebar?.modules?.length)
  const cs = courseSidebar
  const showEnrollments = location.pathname.startsWith('/academy/app/panel/cursos') && !showCourseSidebar
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})

  const { data: enrollments } = useData(
    () => user?.id && showEnrollments ? getEnrollments(user.id) : Promise.resolve(null),
    [user?.id, showEnrollments]
  )

  // Todos los modulos del temario empiezan plegados (el alumno abre el que quiera)
  useEffect(() => {
    if (courseSidebar?.modules) {
      const initial: Record<string, boolean> = {}
      courseSidebar.modules.forEach((module) => {
        initial[module.id] = true
      })
      setCollapsedModules(initial)
    }
  }, [courseSidebar?.modules])

  const toggleModule = (moduleId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-surface-200 bg-white transition-all duration-500 ease-in-out overflow-x-hidden ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div className={`flex h-16 items-center border-b border-surface-200 min-w-[320px] ${isCollapsed ? 'justify-center px-6' : 'justify-between px-6'}`}>
        {/* Logo único de la app — se mantiene igual en modo colapsado */}
        <Logo size="sm" className={isCollapsed ? 'justify-center' : ''} />
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-none border border-surface-200 text-surface-500 hover:bg-surface-50 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="space-y-1 min-w-[288px]">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
            return (
              <div key={link.to} className={link.separator && (showCourseSidebar || (showEnrollments && (enrollments || []).length > 0)) ? 'mt-3 pt-3 border-t border-surface-200' : ''}>
                <Link
                  to={link.to}
                  className={isActive ? `flex items-center rounded-none bg-primary-50 py-2.5 text-sm font-medium text-primary-700 transition-colors ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}` : `flex items-center rounded-none py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
                  title={isCollapsed ? link.label : undefined}
                >
                  <span className="text-lg">{link.icon}</span>
                  {!isCollapsed && <span>{link.label}</span>}
                </Link>

                {!isCollapsed && link.to === '/panel/cursos' && showEnrollments && (enrollments || []).length > 0 && (
                  <div className="mt-1 ml-3 border-l border-surface-200 pl-3">
                    {(enrollments || []).map((enrollment) => {
                      const course = enrollment.course
                      if (!course) return null
                      const isCourseActive = location.pathname.startsWith(`/academy/app/panel/cursos/${course.slug}`)
                      return (
                        <Link
                          key={enrollment.id}
                          to={`/academy/app/panel/cursos/${course.slug}`}
                          className={isCourseActive
                            ? 'flex items-center gap-2 rounded-none bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors'
                            : 'flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900'
                          }
                        >
                          <span className="truncate">{course.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {!isCollapsed && link.to === '/panel/cursos' && showCourseSidebar && courseSidebar && (
                  <div className="mt-1 ml-3 border-l border-surface-200 pl-3 space-y-3">
                    <Link
                      to={`/academy/app/panel/cursos/${cs!.slug}`}
                      className="flex items-center gap-3 rounded-none bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-700 transition-colors truncate"
                      title={cs!.title}
                    >
                      {cs!.title}
                    </Link>
                    {cs!.modules.map((module, moduleIndex) => {
                      const isModuleCollapsed = Boolean(collapsedModules[module.id])
                      return (
                        <div key={module.id || moduleIndex}>
                          <button
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex items-center justify-between gap-2 rounded-none px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 cursor-pointer"
                          >
                            <span className="truncate text-left">{moduleIndex + 1}. {module.title}</span>
                            <svg
                              className={`h-4 w-4 shrink-0 text-surface-400 transition-transform duration-200 ${isModuleCollapsed ? '-rotate-90' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className={`overflow-hidden transition-all duration-200 ${isModuleCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}>
                            <div className="ml-3 mt-1 space-y-0.5 border-l border-surface-200 pl-3">
                              {module.lessons?.map((moduleLesson) => {
                                const isCurrent = moduleLesson.id === cs!.currentLessonId
                                return (
                                  <React.Fragment key={moduleLesson.id}>
                                  <Link
                                    to={`/academy/app/panel/cursos/${cs!.slug}/leccion/${moduleLesson.number}`}
                                    className={isCurrent
                                      ? 'flex items-center gap-2 rounded-none bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition-colors'
                                      : 'flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900'
                                    }
                                  >
                                    <span className="shrink-0 text-xs text-surface-400">{moduleLesson.number}.</span>
                                    <span className="truncate">{moduleLesson.title}</span>
                                    {moduleLesson.isFreePreview && (
                                      <span className="ml-auto shrink-0 rounded-none bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Preview</span>
                                    )}
                                  </Link>
                                  {isCurrent && cs!.lessonSteps && (
                                    <div className="ml-6 mt-1 space-y-0.5 border-l border-primary-100 pl-3">
                                      {courseSidebar.lessonSteps!.map((step) => {
                                        const isActiveStep = step.id === cs!.activeStep
                                        return (
                                          <button
                                            key={step.id}
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); cs!.setActiveStep?.(step.id) }}
                                            className={`flex w-full items-center gap-2 rounded-none px-3 py-1.5 text-xs font-medium transition-colors ${
                                              isActiveStep
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
                                            }`}
                                          >
                                            <span className="shrink-0">{step.icon}</span>
                                            <span className="truncate text-left">{step.label}</span>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>



      <div className={`border-t border-surface-200 p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Link
          to="/academy/app/cursos"
          className={`flex items-center rounded-none py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
          title={isCollapsed ? "Volver a Cursos" : undefined}
        >
          {isCollapsed ? '←' : '← Volver al inicio'}
        </Link>
      </div>
    </aside>
  )
}
