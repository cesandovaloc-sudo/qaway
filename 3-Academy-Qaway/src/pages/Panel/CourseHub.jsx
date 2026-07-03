import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/academy/SectionHeader'
import ProgressBar from '@/components/academy/ProgressBar'
import LessonCard from '@/components/academy/LessonCard'
import ResourceCard from '@/components/academy/ResourceCard'
import { getCourseBySlug } from '@/data/courses'
import { getModulesForCourse, getResourcesForCourse, getAssignmentsForCourse, mockMyEnrollments } from '@/data/internal'

export default function CourseHub() {
  const { slug } = useParams()
  const course = getCourseBySlug(slug)
  const enrollment = mockMyEnrollments.find(e => e.courseSlug === slug)
  const modules = course ? getModulesForCourse(slug) : []
  const resources = course ? getResourcesForCourse(course.id) : []
  const assignments = course ? getAssignmentsForCourse(course.id) : []
  const [activeTab, setActiveTab] = useState('contenido')

  if (!course) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#f5f5f4]">
        <div className="section-container text-center">
          <h1 className="text-xl font-bold text-[#0d0f0d]">Curso no encontrado</h1>
          <Link to="/panel" className="mt-3 inline-block text-sm text-[#ff4b0b] hover:underline">Volver al panel</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'contenido', label: 'Contenido' },
    { id: 'recursos', label: 'Recursos', count: resources.length },
    { id: 'tareas', label: 'Tareas', count: assignments.length },
  ]

  return (
    <div>
      {/* ─── Header ─── */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <Link to="/panel" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">
              ← Mi Panel
            </Link>
            <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">{course.title}</h1>
            {enrollment && (
              <div className="mt-4 max-w-md">
                <ProgressBar value={enrollment.progress} size="md" />
                <p className="mt-1.5 text-[10px] text-[#666860]">
                  {enrollment.completedLessons} de {enrollment.totalLessons} lecciones completadas
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Tabs ─── */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors relative ${
                  activeTab === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4b0b]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="py-section md:py-[80px] bg-[#f5f5f4]">
        <div className="section-container">
          {activeTab === 'contenido' && (
            <div className="max-w-3xl">
              {modules.length === 0 ? (
                <p className="text-sm text-[#666860]">El contenido del curso se está preparando.</p>
              ) : (
                <div className="space-y-8">
                  {modules.map((mod, mi) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: mi * 0.05 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-[#ff4b0b] tracking-widest">
                          {String(mi + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-bold text-[#0d0f0d]">{mod.title}</h3>
                        <span className="text-[10px] text-[#666860] ml-auto">{mod.lessons.length} lecciones</span>
                      </div>
                      <div className="border border-[#0d0f0d]/8 bg-white divide-y divide-[#0d0f0d]/4">
                        {mod.lessons.map((lesson, li) => (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            moduleIndex={mi}
                            lessonIndex={li}
                            courseSlug={slug}
                            completed={li < 2}
                            locked={li > 3 && !enrollment}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recursos' && (
            <div className="max-w-2xl">
              {resources.length === 0 ? (
                <p className="text-sm text-[#666860]">No hay recursos disponibles para este curso.</p>
              ) : (
                <div className="space-y-2">
                  {resources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tareas' && (
            <div className="max-w-2xl">
              {assignments.length === 0 ? (
                <p className="text-sm text-[#666860]">No hay tareas asignadas para este curso.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(asg => (
                    <div key={asg.id} className="p-4 bg-white border border-[#0d0f0d]/8">
                      <h4 className="text-xs font-semibold text-[#0d0f0d]">{asg.title}</h4>
                      <p className="mt-1 text-[11px] text-[#666860] leading-relaxed">{asg.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-[10px] text-[#666860]">
                        <span>Vence en {asg.dueDays} días</span>
                        <span>Puntaje máximo: {asg.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
