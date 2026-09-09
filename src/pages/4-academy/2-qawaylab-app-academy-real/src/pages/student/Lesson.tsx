import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { getCourseBySlug } from '@/lib/services'
import { getLessonResources, getResourceIcon, type StudentResource } from '@/lib/services/resources'
import { useCourseSidebar, type CourseSidebarState } from '@/contexts/CourseSidebarContext'
import { useVideoProgress } from '@/hooks/useVideoProgress'
import QuizPlayer from '@/components/student/QuizPlayer'
import ResourcePreview from '@/components/student/ResourcePreview'
import type { Course, Lesson } from '@/lib/types'

interface FlatLesson extends Lesson {
  number: number
  moduleTitle: string
  isFreePreview: boolean
}

type AccessMode = 'public' | 'student'

const VIEW_MODES = [
  { id: 'split', label: 'Panel dividido' },
  { id: 'focus', label: 'Modo enfoque' },
]

export function PublicLesson() {
  const { setCourseSidebar } = useCourseSidebar()
  return <LessonExperience accessMode="public" setCourseSidebar={setCourseSidebar} />
}

export default function StudentLesson() {
  const { setCourseSidebar } = useCourseSidebar()
  return <LessonExperience accessMode="student" setCourseSidebar={setCourseSidebar} />
}

function LessonExperience({ accessMode, setCourseSidebar }: {
  accessMode: AccessMode
  setCourseSidebar: (state: CourseSidebarState | null) => void
}) {
  const { slug, lessonId } = useParams()
  const isStudentView = accessMode === 'student'
  const [activeTab, setActiveTab] = useState('contenido')
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<FlatLesson | null>(null)
  const [flatLessons, setFlatLessons] = useState<FlatLesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFreePreview, setIsFreePreview] = useState(false)
  const [viewMode, setViewMode] = useState('split')
  const [resources, setResources] = useState<StudentResource[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)
  const [previewResource, setPreviewResource] = useState<StudentResource | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [transcriptStatus, setTranscriptStatus] = useState('none')
  const [loadingTranscript] = useState(false)

  const PREVIEWABLE_TYPES = ['PDF', 'Word', 'Excel']
  const stageRef = useRef<HTMLDivElement | null>(null)
  const playerHostRef = useRef<HTMLDivElement | null>(null)
  const settingsRef = useRef<HTMLElement | null>(null)
  const canWatchLesson = isStudentView || isFreePreview

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId)
    if (viewMode === 'focus') {
      setViewMode('split')
    }
  }, [viewMode])

  const LESSON_STEPS = useMemo(() => [
    { id: 'video', icon: null, label: 'Video' },
    { id: 'contenido', icon: null, label: 'Contenido' },
    ...(isStudentView ? [{ id: 'quiz', icon: null, label: 'Quiz' }] : []),
    { id: 'recursos', icon: null, label: 'Recursos' },
  ], [isStudentView])

  const handleStepChange = useCallback((stepId: string) => {
    if (stepId === 'video') {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      handleTabClick(stepId)
    }
  }, [handleTabClick])

  const {
    playerReady,
    isPlaying,
    currentTime,
    duration,
    bufferedPct,
    completed,
    progressPct,
    isFullscreen,
    volume,
    isMuted,
    playbackRate,
    availablePlaybackRates,
    playbackQuality,
    availableQualities,
    togglePlay,
    seekTo,
    seekBy,
    toggleMute,
    setVolume,
    setPlaybackRate,
    setPlaybackQuality,
    toggleFullscreen,
  } = useVideoProgress(canWatchLesson ? lesson?.video_url ?? null : null, lesson?.id, playerHostRef, stageRef)

  useEffect(() => {
    async function loadLesson() {
      try {
        const courseData = await getCourseBySlug(slug || '')
        if (!courseData) return

        const normalizedCourse = normalizeCourse(courseData)
        const lessons = buildFlatLessons(normalizedCourse)
        const targetIndex = Math.max(0, Number(lessonId || 1) - 1)
        const targetLesson = lessons[targetIndex]

        setCourse(normalizedCourse)
        setFlatLessons(lessons)
        setCurrentLessonIndex(targetIndex)
        setLesson(targetLesson || null)
        setIsFreePreview(Boolean(targetLesson?.isFreePreview))
      } catch (err) {
        console.error('Error loading lesson:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug && lessonId) loadLesson()
  }, [slug, lessonId])

  // Fetch resources when lesson changes
  useEffect(() => {
    if (!lesson?.id || activeTab !== 'recursos') return
    setLoadingResources(true)
    getLessonResources(lesson.id)
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoadingResources(false))
  }, [lesson?.id, activeTab])

  // Fetch transcript when lesson changes
  useEffect(() => {
    if (!lesson?.id) return
    if (lesson.transcript) {
      setTranscript(lesson.transcript)
      setTranscriptStatus(lesson.transcript_status || 'manual')
    } else {
      setTranscript(null)
      setTranscriptStatus('none')
    }
  }, [lesson?.id, lesson?.transcript, lesson?.transcript_status])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleShortcuts(event: KeyboardEvent) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!playerReady) return

      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        seekBy(-10)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        seekBy(10)
      }
      if (event.key.toLowerCase() === 'm') {
        event.preventDefault()
        toggleMute()
      }
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [playerReady, seekBy, toggleFullscreen, toggleMute, togglePlay])

  useEffect(() => {
    if (!setCourseSidebar || !course || !lesson) return

    setCourseSidebar({
      visible: true,
      forceCollapse: false,
      slug: slug || '',
      coursePath: isStudentView ? `/panel/cursos/${slug}` : `/cursos/${slug}`,
      title: course.title,
      totalLessons: flatLessons.length,
      modules: (course.modules || []).map(m => ({ id: m.id, title: m.title, lessons: (m.lessons || []).map(l => ({ id: l.id, title: l.title })) })),
      currentLessonId: lesson.id,
      currentLessonTitle: lesson.title,
      currentLessonNumber: lesson.number,
      currentLessonDuration: duration,
      completed,
      activeStep: activeTab,
      setActiveStep: handleStepChange,
      lessonSteps: LESSON_STEPS,
    })

    return () => setCourseSidebar(null)
  }, [activeTab, completed, course, flatLessons.length, isStudentView, lesson, setCourseSidebar, slug, viewMode, LESSON_STEPS, handleStepChange, duration])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-surface-500">Cargando leccion...</p>
        </div>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="mb-4 text-5xl">Video</span>
        <h3 className="mb-2 text-lg font-semibold text-surface-900">Leccion no encontrada</h3>
        <Link to={isStudentView ? `/panel/cursos/${slug}` : `/cursos/${slug}`} className="btn-primary text-sm">Volver al curso</Link>
      </div>
    )
  }

  const coursePath = isStudentView ? `/panel/cursos/${slug}` : `/cursos/${slug}`
  const lessonPath = (lessonNumber: number) => `${coursePath}/leccion/${lessonNumber}`
  const canOpenLesson = (targetLesson: FlatLesson | null) => isStudentView || Boolean(targetLesson?.isFreePreview)
  const hasVideoUrl = Boolean(lesson.video_url)
  const hasVideo = canWatchLesson && hasVideoUrl
  const isVideoLocked = hasVideoUrl && !canWatchLesson
  const previousLesson = currentLessonIndex > 0 ? flatLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < flatLessons.length - 1 ? flatLessons[currentLessonIndex + 1] : null
  const contentHtml = lesson.content || '<p>Contenido proximamente.</p>'

  function handleSeek(event: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const pct = x / rect.width
    seekTo(pct * duration)
  }

  const TAB_CONFIG = [
    {
      id: 'recursos',
      label: 'Recursos',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      )
    },
    {
      id: 'contenido',
      label: 'Contenido',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'transcripcion',
      label: 'Transcripcion',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    ...(isStudentView ? [{
      id: 'quiz',
      label: 'Quiz',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }] : [])
  ]

  const tabsSection = (
    <div className="h-full">
      {viewMode === 'focus' ? (
        <div className="flex flex-col items-center gap-6">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-2 transition-colors ${activeTab === tab.id ? 'text-[#ff4b0b]' : 'text-surface-400 hover:text-surface-700'}`}
              title={tab.label}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="border-b border-surface-200">
            <div className="flex gap-6">
              {TAB_CONFIG.map((tab) => (
                <button 
                  key={tab.id} 
                  type="button" 
                  onClick={() => handleTabClick(tab.id)} 
                  className={activeTab === tab.id ? 'border-[#ff4b0b] text-[#ff4b0b] -mb-px border-b-2 pb-3 text-sm font-bold transition-colors' : 'border-transparent text-surface-500 hover:text-surface-700 -mb-px border-b-2 pb-3 text-sm font-medium transition-colors'}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {/* Transcripción banner button */}
            <button
              type="button"
              onClick={() => handleTabClick('transcripcion')}
              className="w-full flex items-center gap-2 rounded-sm border border-blue-100 bg-[#edf5ff] p-3 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              <svg className="h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Transcripción</span>
            </button>

            {activeTab === 'contenido' && (
              <div className="space-y-4">
                {/* Resumen de la lección */}
                <div className="rounded-sm border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className="text-xs font-bold text-surface-900">Resumen de la lección</h4>
                  </div>
                  <div className="text-xs text-surface-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>

                {/* Material descargable */}
                <div className="rounded-sm border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <h4 className="text-xs font-bold text-surface-900">Material descargable</h4>
                  </div>
                  {resources.length > 0 ? (
                    <div className="space-y-2">
                      {resources.map((r) => (
                        <div key={r.id} className="flex items-center justify-between rounded-sm border border-surface-200 bg-surface-50 p-2.5">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-surface-900 truncate">{r.title}</p>
                            <p className="text-[10px] text-surface-500">{r.type} {r.file_size ? `· ${r.file_size}` : ''}</p>
                          </div>
                          {r.file_url && (
                            <a href={r.file_url} download target="_blank" rel="noopener noreferrer" className="border border-surface-200 bg-white p-1.5 text-surface-600 hover:text-surface-900">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-surface-500">No hay archivos adjuntos en esta lección.</p>
                  )}
                </div>

                {/* Puntos clave */}
                <div className="rounded-sm border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-xs font-bold text-surface-900">Puntos clave</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-surface-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">✓</span>
                      <span>Conceptos fundamentales explicados en el video.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">✓</span>
                      <span>Estructura recomendada y sintaxis limpia.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold shrink-0">✓</span>
                      <span>Buenas prácticas para desarrollo en producción.</span>
                    </li>
                  </ul>
                </div>

                {/* Banner de actualización / planes */}
                <div className="rounded-sm border border-blue-100 bg-[#edf5ff] p-4 text-center">
                  <span className="text-2xl block mb-1">🎓</span>
                  <h4 className="text-xs font-bold text-surface-900 mb-1">¿Listo para más?</h4>
                  <p className="text-[11px] text-surface-600 mb-3">Accede al curso completo y avanza a tu propio ritmo.</p>
                  <Link to="/cursos" className="inline-block border border-surface-200 bg-white px-3 py-1.5 text-xs font-bold text-surface-800 hover:bg-surface-50 transition">
                    Ver planes y precios
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'recursos' && (
              <div className="space-y-3">
                {resources.length > 0 ? (
                  resources.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-sm border border-surface-200 bg-surface-50 p-3">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-surface-900 truncate">{r.title}</p>
                        <p className="text-[11px] text-surface-500">{r.type} {r.file_size ? `· ${r.file_size}` : ''}</p>
                      </div>
                      {r.file_url && (
                        <a href={r.file_url} download target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-2.5 py-1">
                          Descargar
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-surface-500 py-4 text-center">No hay recursos disponibles.</p>
                )}
              </div>
            )}

            {activeTab === 'quiz' && isStudentView && (
              <QuizPlayer lessonId={lesson.id} />
            )}

            {activeTab === 'transcripcion' && (
              <div>
                {transcript ? (
                  <div className="rounded-sm border border-surface-200 bg-surface-50 p-4 max-h-[400px] overflow-y-auto">
                    <div className="space-y-2 text-xs text-surface-700">
                      {parseTranscriptLines(transcript).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-surface-500 py-4 text-center">Sin transcripción disponible para esta lección.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className={viewMode === 'split' ? 'xl:pr-[320px]' : (viewMode === 'focus' ? 'xl:pr-20' : '')}>
      <div className={`space-y-4 mx-auto px-6 py-6 ${viewMode === 'focus' ? 'max-w-5xl' : 'max-w-[2000px]'}`}>
        
        {/* Lesson H1 Title and Actions */}
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 mb-1">{lesson.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <button 
              type="button" 
              onClick={() => setViewMode(viewMode === 'split' ? 'focus' : 'split')}
              className="flex h-8 w-8 items-center justify-center border border-surface-200 bg-white text-surface-600 hover:text-surface-900 transition" 
              title={viewMode === 'split' ? 'Ocultar panel derecho' : 'Mostrar panel derecho'}
            >
              {viewMode === 'split' ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <section ref={stageRef} className={`overflow-hidden border border-surface-200 bg-black ${isFullscreen ? 'min-h-screen border-0' : 'rounded-[10px]'}`}>
            {/* El contenedor del reproductor SIEMPRE permanece montado en el DOM:
                si React lo desmontara al navegar a una lección bloqueada, el API de
                YouTube ya modificó su interior y removeChild() de React lanza
                NotFoundError tumbando toda la app. Por eso se oculta con CSS. */}
            <div className={hasVideo ? '' : 'hidden'}>
              {isMiniPlayer && (
                  <div className="w-full relative aspect-video bg-surface-900 flex flex-col items-center justify-center">
                    <div className="text-white/50 text-sm mb-4">Reproduciendo en Mini Player</div>
                    <button type="button" onClick={() => setIsMiniPlayer(false)} className="btn-primary text-sm">Restaurar video</button>
                  </div>
                )}
                <div className={isFullscreen ? 'relative min-h-[100dvh] overflow-hidden bg-black' : (isMiniPlayer ? 'fixed bottom-6 right-6 z-[60] w-[360px] shadow-2xl overflow-hidden border border-surface-200 bg-black group' : 'w-full')}>
                  {isMiniPlayer && (
                    <button onClick={() => setIsMiniPlayer(false)} className="absolute top-2 right-2 z-30 flex h-8 w-8 items-center justify-center bg-black/50 text-white hover:bg-black/80">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 0h-4" /></svg>
                    </button>
                  )}
                  <div className="relative aspect-video overflow-hidden bg-black">
                    <div ref={playerHostRef} className="h-full w-full" />

                    {!playerReady && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
                        <div className="text-center text-white">
                          <div className="mx-auto h-10 w-10 animate-spin border-2 border-white/20 border-t-white" />
                          <p className="mt-3 text-sm text-white/70">Cargando reproductor...</p>
                        </div>
                      </div>
                    )}

                    {playerReady && (
                      <button
                        type="button"
                        aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={togglePlay}
                      />
                    )}

                    {playerReady && !isPlaying && (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center bg-white/15 backdrop-blur-sm">
                          <svg className="ml-1 h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full border-t border-surface-200 bg-[#0c1a30] p-4 text-white">
                  <div className="mb-3">
                    <div className="relative h-2 overflow-hidden bg-white/10 cursor-pointer" onClick={handleSeek}>
                      <div className="absolute inset-y-0 left-0 bg-white/15" style={{ width: `${bufferedPct}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-[#ff4b0b]" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className={`flex flex-col gap-4 ${isMiniPlayer ? '' : 'xl:flex-row xl:items-center xl:justify-between'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={togglePlay} className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-white transition hover:bg-white/10">
                        {isPlaying ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </button>
                      <button type="button" onClick={() => seekBy(-10)} className="border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/10">-10s</button>
                      <button type="button" onClick={() => seekBy(10)} className="border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/10">+10s</button>

                      <div className="ml-2 flex min-w-[170px] items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1.5">
                        <button type="button" title={isMuted || volume === 0 ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute} className="text-white/85 transition hover:text-white">
                          {isMuted || volume === 0 ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536A5 5 0 018 12a5 5 0 00.464 2.121M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                          )}
                        </button>
                        <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none bg-white/15 accent-[#ff4b0b]" style={{ background: `linear-gradient(to right, rgb(255 75 11) ${isMuted ? 0 : volume}%, rgba(255 255 255 / 0.15) ${isMuted ? 0 : volume}%)` }} />
                        <span className="min-w-[30px] text-right text-xs font-medium text-white/75">{isMuted ? 0 : volume}</span>
                      </div>
                    </div>

                    <div className={`flex flex-wrap items-center gap-2 ${isMiniPlayer ? 'justify-between' : ''}`}>
                      {!isMiniPlayer && (
                        <span className="border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/75">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      )}
                      <button
                        type="button"
                        title={isMiniPlayer ? 'Restaurar reproductor' : 'Mini Player'}
                        onClick={() => {
                          setIsMiniPlayer(!isMiniPlayer);
                          if (isFullscreen && !isMiniPlayer) toggleFullscreen();
                        }}
                        className={isMiniPlayer ? 'flex h-8 w-8 items-center justify-center bg-[#ff4b0b] text-white transition' : 'flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10'}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <rect x="11" y="11" width="8" height="8" rx="1" ry="1" />
                        </svg>
                      </button>
                      {!isMiniPlayer && (
                        <>
                          <button
                            type="button"
                            title="Panel dividido"
                            onClick={() => setViewMode('split')}
                            className={viewMode === 'split' ? 'flex h-8 w-8 items-center justify-center bg-[#ff4b0b] text-white transition' : 'flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10'}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="3" y="3" width="7" height="18" rx="1" />
                              <rect x="14" y="3" width="7" height="18" rx="1" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title="Modo enfoque"
                            onClick={() => setViewMode('focus')}
                            className={viewMode === 'focus' ? 'flex h-8 w-8 items-center justify-center bg-[#ff4b0b] text-white transition' : 'flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10'}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="3" y="3" width="18" height="18" rx="1" />
                              <line x1="12" y1="3" x2="12" y2="21" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                            onClick={toggleFullscreen}
                            className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10"
                          >
                            {isFullscreen ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0h5M4 4v5m11-5l5 5m0-5h-5m0 0v5M9 15l-5 5m0 0h5m-5 0v-5m11 5l-5-5m5 5h-5m0 0v-5" /></svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 0h-4" /></svg>
                            )}
                          </button>
                          <span className="border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/75">{playbackRate}x</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            {!hasVideo && (isVideoLocked ? (
              <div className="w-full aspect-video flex flex-col items-center justify-center gap-4 bg-[#0c1a30] px-6 text-center text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Lock className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Inscríbete al curso para ver esta lección</p>
                  <p className="mt-1 text-xs text-white/60">Accede a este y todos los videos del curso con tu suscripción.</p>
                </div>
                <Link
                  to={coursePath}
                  className="inline-flex items-center gap-2 rounded-sm bg-[#ff4b0b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e0430a]"
                >
                  Ver plan y precios
                </Link>
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-[#0c1a30] text-white">
                <p className="text-sm text-white/60">Video próximamente</p>
              </div>
            ))}
          </section>



          {/* Navegación inferior de lecciones */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-2">
            {previousLesson && canOpenLesson(previousLesson) ? (
              <Link to={lessonPath(previousLesson.number)} className="flex items-center gap-3 border border-surface-200 bg-white p-3 hover:bg-surface-50 transition">
                <span className="text-surface-400 font-bold">←</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Lección anterior</p>
                  <p className="text-xs font-bold text-surface-900 truncate">{previousLesson.title}</p>
                </div>
              </Link>
            ) : (
              <div className="border border-surface-200 bg-surface-50 p-3 opacity-50">
                <p className="text-[10px] font-bold uppercase text-surface-400">Lección anterior</p>
                <p className="text-xs font-medium text-surface-500">Sin lección anterior</p>
              </div>
            )}

            <button type="button" className="flex h-11 w-11 items-center justify-center border border-surface-200 bg-surface-100 text-surface-700 hover:bg-surface-200 transition" title="Temario">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {nextLesson && canOpenLesson(nextLesson) ? (
              <Link to={lessonPath(nextLesson.number)} className="flex items-center justify-between border border-surface-200 bg-white p-3 hover:bg-surface-50 transition text-right">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Siguiente lección</p>
                  <p className="text-xs font-bold text-surface-900 truncate">{nextLesson.title}</p>
                </div>
                <span className="text-surface-400 font-bold ml-3">→</span>
              </Link>
            ) : (
              <div className="border border-surface-200 bg-surface-50 p-3 opacity-50 text-right">
                <p className="text-[10px] font-bold uppercase text-surface-400">Siguiente lección</p>
                <p className="text-xs font-medium text-surface-500">Fin del curso</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {(viewMode === 'split' || viewMode === 'focus') && (
        <aside className={`w-full mt-6 xl:mt-0 xl:fixed xl:right-0 xl:top-16 xl:z-30 xl:h-[calc(100vh-64px)] xl:border-l xl:border-surface-200 xl:bg-[#f8f9f7] xl:overflow-hidden ${viewMode === 'focus' ? 'xl:w-20' : 'xl:w-[320px]'}`}>
          <div className="p-4 xl:p-5 h-full xl:overflow-y-auto xl:overflow-x-hidden hide-scrollbar">
            <div className="xl:min-w-[280px]">
              {tabsSection}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

function normalizeCourse(course: Course): Course {
  return {
    ...course,
    modules: [...(course.modules || [])]
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((module) => ({
        ...module,
        lessons: [...(module.lessons || [])]
          .filter((lesson) => lesson.status === 'published')
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((lesson) => ({ ...lesson })),
      })),
  }
}

function buildFlatLessons(course: Course): FlatLesson[] {
  let count = 0
  const lessons: FlatLesson[] = []
  for (const module of course.modules || []) {
    for (const lesson of module.lessons || []) {
      count += 1
      const entry: FlatLesson = {
        ...lesson,
        number: count,
        moduleTitle: module.title,
        isFreePreview: count <= (course.free_preview_lessons || 1),
      }
      lessons.push(entry)
      ;(lesson as FlatLesson).number = count
      ;(lesson as FlatLesson).isFreePreview = entry.isFreePreview
    }
  }
  return lessons
}

function parseTranscriptLines(text: string | null | undefined): string[] {
  if (!text) return []
  return text.split('\n').filter(Boolean)
}

function formatTime(seconds: number | undefined): string {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatQualityLabel(value: string) {
  const labels = {
    small: '240p',
    medium: '360p',
    large: '480p',
    hd720: '720p',
    hd1080: '1080p',
    highres: 'Maxima',
    default: 'Auto',
  }
  return (labels as Record<string, string>)[value] || value
}
