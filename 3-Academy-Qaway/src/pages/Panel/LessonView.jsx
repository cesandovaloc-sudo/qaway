import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import VideoPlayer from '@/components/academy/VideoPlayer'
import ResourceCard from '@/components/academy/ResourceCard'
import ProgressBar from '@/components/academy/ProgressBar'
import { getCourseBySlug } from '@/data/courses'
import { getLessonById, getModulesForCourse, getResourcesForCourse, mockMyEnrollments, getTranscriptForLesson, getVideoProgress, markLessonCompleted } from '@/data/internal'

export default function LessonView() {
  const { slug, lessonId } = useParams()
  const navigate = useNavigate()
  const course = getCourseBySlug(slug)
  const result = getLessonById(lessonId)
  const lesson = result?.lesson
  const currentModule = result?.module
  const enrollment = mockMyEnrollments.find(e => e.courseSlug === slug)
  const modules = course ? getModulesForCourse(slug) : []
  const resources = course && lesson
    ? getResourcesForCourse(course.id).filter(r => r.lessonId === lesson.id || r.lessonId === null)
    : []
  const transcript = lesson ? getTranscriptForLesson(lesson.id) : []
  const progress = lesson ? getVideoProgress(lesson.id) : { completed: false }

  const [focusMode, setFocusMode] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [activeTab, setActiveTab] = useState('contenido') // contenido | recursos | transcripcion
  const [completed, setCompleted] = useState(progress.completed || false)

  // Find previous/next lesson
  const allLessons = modules.flatMap(m => m.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  if (!course || !lesson) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#f5f5f4]">
        <div className="section-container text-center">
          <h1 className="text-xl font-bold text-[#0d0f0d]">Lección no encontrada</h1>
          <Link to={`/panel/cursos/${slug}`} className="mt-3 inline-block text-sm text-[#ff4b0b] hover:underline">
            Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  const handleVideoEnded = () => {
    setVideoEnded(true)
    setCompleted(true)
    markLessonCompleted(lessonId)
  }

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/panel/cursos/${slug}/leccion/${nextLesson.id}`)
    }
  }

  const rightPanelTabs = [
    { id: 'contenido', label: 'Curso' },
    { id: 'recursos', label: 'Recursos', count: resources.length },
    { id: 'transcripcion', label: 'Transcripción', count: transcript.length },
  ]

  return (
    <div className={`min-h-screen bg-[#f5f5f4] ${focusMode ? 'overflow-hidden' : ''}`}>
      {/* ─── Top bar ─── */}
      {!focusMode && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#0d0f0d]/8 h-14 flex items-center">
          <div className="section-container flex items-center justify-between w-full">
            <div className="flex items-center gap-4 min-w-0">
              <Link to={`/panel/cursos/${slug}`} className="text-[10px] font-semibold tracking-wider uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity shrink-0">
                ← Curso
              </Link>
              <span className="text-[11px] text-[#666860] hidden md:block truncate max-w-[240px] lg:max-w-[400px]">
                {lesson.title}
              </span>
              {completed && (
                <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#ff4b0b]/10 text-[#ff4b0b] shrink-0">
                  Completado
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {enrollment && (
                <div className="w-20 hidden md:block">
                  <ProgressBar value={enrollment.progress} size="sm" showLabel={false} />
                </div>
              )}
              <button
                onClick={() => setFocusMode(true)}
                className="px-3 py-1.5 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all hidden md:inline-flex items-center gap-1.5"
              >
                <span>⛶</span> Enfoque
              </button>
              <div className="flex gap-2">
                {prevLesson && (
                  <Link
                    to={`/panel/cursos/${slug}/leccion/${prevLesson.id}`}
                    className="px-3 py-1.5 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-colors"
                  >
                    ← Anterior
                  </Link>
                )}
                {nextLesson && !videoEnded && (
                  <Link
                    to={`/panel/cursos/${slug}/leccion/${nextLesson.id}`}
                    className="px-3 py-1.5 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-colors"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Focus Mode close button ─── */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed top-4 right-4 z-[60] px-3 py-1.5 text-[10px] font-semibold bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
        >
          Salir de enfoque ⛶
        </button>
      )}

      {/* ─── Video ─── */}
      <section className={`${focusMode ? 'fixed inset-0 z-50 bg-black' : 'pt-[7.5rem]'}`}>
        <VideoPlayer
          url={lesson.videoUrl}
          provider={lesson.videoProvider}
          title={lesson.title}
          lessonId={lesson.id}
          focusMode={focusMode}
          onToggleFocus={() => setFocusMode(!focusMode)}
          onVideoEnded={handleVideoEnded}
          autoplay={true}
        />

        {/* Video ended CTA overlay (only in normal mode) */}
        {videoEnded && !focusMode && (
          <div className="bg-[#0d0f0d] border-t border-white/10 py-4 px-4 section-container">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-white">¡Lección completada!</p>
                <p className="text-[10px] text-[#666860] mt-0.5">Continúa con la siguiente lección</p>
              </div>
              <div className="flex gap-3">
                {nextLesson ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 text-xs font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all uppercase tracking-wider"
                  >
                    Continuar →
                  </button>
                ) : (
                  <Link
                    to={`/panel/cursos/${slug}`}
                    className="px-6 py-3 text-xs font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all uppercase tracking-wider"
                  >
                    Volver al curso
                  </Link>
                )}
                {!completed && (
                  <button
                    onClick={() => { setCompleted(true); markLessonCompleted(lessonId) }}
                    className="px-4 py-3 text-[10px] font-semibold border border-white/20 text-white/70 hover:bg-white/10 transition-all uppercase tracking-wider"
                  >
                    Marcar como completada
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Content + Right Panel (hidden in focus mode) ─── */}
      {!focusMode && (
        <section className={`py-8 md:py-12 ${videoEnded ? '' : ''}`}>
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
              {/* ─── Main content ─── */}
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center gap-3 text-[10px] text-[#666860] uppercase tracking-wider mb-3 flex-wrap">
                    <span>{currentModule?.title}</span>
                    <span className="w-px h-3 bg-[#0d0f0d]/10" />
                    <span>{lesson.duration}</span>
                    {lesson.isFree && (
                      <>
                        <span className="w-px h-3 bg-[#0d0f0d]/10" />
                        <span className="text-[#ff4b0b] font-semibold">Gratis</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl md:text-2xl font-bold text-[#0d0f0d]">{lesson.title}</h1>

                  <div
                    className="mt-6 text-sm text-[#666860] leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </motion.div>

                {/* Resources section (fallback if right panel has tab) */}
                {activeTab !== 'recursos' && resources.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0d0f0d] mb-4">Recursos de esta lección</h3>
                    <div className="space-y-2">
                      {resources.slice(0, 2).map(r => (
                        <ResourceCard key={r.id} resource={r} />
                      ))}
                      {resources.length > 2 && (
                        <button
                          onClick={() => setActiveTab('recursos')}
                          className="text-[10px] font-semibold text-[#ff4b0b] hover:opacity-70 transition-opacity"
                        >
                          Ver todos los recursos ({resources.length})
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom CTA (only if video hasn't ended) */}
                {!videoEnded && (
                  <div className="mt-12 pt-8 border-t border-[#0d0f0d]/6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0d0f0d]">
                          {nextLesson ? `Siguiente: ${nextLesson.title}` : 'Última lección del curso'}
                        </p>
                        <p className="text-[10px] text-[#666860] mt-0.5">
                          {currentIndex + 1} de {allLessons.length} lecciones
                        </p>
                      </div>
                      {nextLesson && (
                        <Link
                          to={`/panel/cursos/${slug}/leccion/${nextLesson.id}`}
                          className="px-5 py-2.5 text-xs font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all"
                        >
                          Siguiente lección →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Right panel (tabs) ─── */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  {/* Tabs */}
                  <div className="flex border-b border-[#0d0f0d]/10 mb-4">
                    {rightPanelTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 text-[9px] font-semibold uppercase tracking-wider py-2 transition-colors relative ${
                          activeTab === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className="ml-1 opacity-60">({tab.count})</span>
                        )}
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff4b0b]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab: Course content */}
                  {activeTab === 'contenido' && (
                    <div className="border border-[#0d0f0d]/8 bg-white divide-y divide-[#0d0f0d]/4 max-h-[60dvh] overflow-y-auto">
                      {modules.map((mod, mi) => (
                        <div key={mod.id} className="p-3">
                          <p className="text-[10px] font-bold text-[#ff4b0b] tracking-widest mb-1">
                            {String(mi + 1).padStart(2, '0')}
                          </p>
                          <p className="text-[11px] font-semibold text-[#0d0f0d]">{mod.title}</p>
                          <div className="mt-2 space-y-0.5">
                            {mod.lessons.map((l, li) => {
                              const lp = getVideoProgress(l.id)
                              return (
                                <Link
                                  key={l.id}
                                  to={`/panel/cursos/${slug}/leccion/${l.id}`}
                                  className={`flex items-center gap-2 text-[10px] py-1 px-2 transition-colors ${
                                    l.id === lessonId
                                      ? 'bg-[#ff4b0b]/10 text-[#ff4b0b] font-semibold'
                                      : lp.completed
                                        ? 'text-[#666860] line-through'
                                        : 'text-[#666860] hover:text-[#0d0f0d]'
                                  }`}
                                >
                                  {lp.completed && <span className="text-[8px]">✓</span>}
                                  {li + 1}. {l.title}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Resources */}
                  {activeTab === 'recursos' && (
                    <div className="space-y-2 max-h-[60dvh] overflow-y-auto">
                      {resources.length === 0 ? (
                        <p className="text-[10px] text-[#666860] py-4 text-center">No hay recursos para esta lección.</p>
                      ) : (
                        resources.map(r => (
                          <ResourceCard key={r.id} resource={r} />
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab: Transcript */}
                  {activeTab === 'transcripcion' && (
                    <div className="border border-[#0d0f0d]/8 bg-white divide-y divide-[#0d0f0d]/6 max-h-[60dvh] overflow-y-auto">
                      {transcript.length === 0 ? (
                        <p className="text-[10px] text-[#666860] p-4 text-center">Transcripción no disponible.</p>
                      ) : (
                        transcript.map((entry, i) => (
                          <div key={i} className="p-3 flex gap-3 hover:bg-[#0d0f0d]/2 transition-colors">
                            <span className="text-[9px] font-semibold text-[#ff4b0b] tabular-nums shrink-0 w-8">
                              {entry.time}
                            </span>
                            <p className="text-[10px] text-[#666860] leading-relaxed">
                              {entry.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
