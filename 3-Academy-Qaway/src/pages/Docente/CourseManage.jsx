import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCourseBySlug } from '@/data/courses'
import { generateMockModules, mockResources, getAssignmentsForCourse } from '@/data/internal'

export default function DocenteCourseManage() {
  const { slug } = useParams()
  const course = getCourseBySlug(slug)
  const modules = course ? generateMockModules(slug) : []
  const resources = course ? mockResources.filter(r => r.courseId === course.id) : []
  const assignments = course ? getAssignmentsForCourse(course.id) : []

  const [activeTab, setActiveTab] = useState('modulos')
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [showModuleForm, setShowModuleForm] = useState(false)

  if (!course) {
    return (
      <div className="pt-28 pb-16 bg-[#f5f5f4] min-h-screen">
        <div className="section-container">
          <p className="text-sm text-[#666860]">Curso no encontrado.</p>
          <Link to="/docente" className="text-[#ff4b0b] text-xs font-semibold mt-4 inline-block">← Volver a mi panel</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'modulos', label: 'Modulos y lecciones', count: modules.reduce((a, m) => a + m.lessons.length, 0) },
    { id: 'recursos', label: 'Recursos', count: resources.length },
    { id: 'tareas', label: 'Tareas', count: assignments.length },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/docente" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Mi panel</Link>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{course.title}</h1>
          <p className="mt-1 text-sm text-[#666860]">{course.modules} modulos · {course.lessons} lecciones · {course.duration}</p>
          <div className="flex gap-3 mt-4">
            <Link to={`/cursos/${course.slug}`}
              className="px-3 py-1.5 text-[10px] font-semibold border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all">Ver publico</Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${activeTab === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'}`}>
                {tab.label} <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">

          {/* ─── TAB: MODULOS ─── */}
          {activeTab === 'modulos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-[#0d0f0d]">Contenido del curso</h2>
                <button onClick={() => setShowModuleForm(true)}
                  className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
                  + Nuevo modulo
                </button>
              </div>

              <div className="space-y-4">
                {modules.map((mod, mi) => (
                  <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: mi * 0.05 }}
                    className="bg-white border border-[#0d0f0d]/8">
                    {/* Module header */}
                    <div className="p-4 md:p-5 border-b border-[#0d0f0d]/6 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#ff4b0b]">Modulo {mod.position}</span>
                        <h3 className="text-sm font-semibold text-[#0d0f0d] mt-0.5">{mod.title}</h3>
                        <span className="text-[10px] text-[#666860]">{mod.lessons.length} lecciones</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowLessonForm(true)}
                          className="px-3 py-1.5 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">+ Leccion</button>
                        <button className="px-3 py-1.5 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all">Editar</button>
                      </div>
                    </div>

                    {/* Lessons list */}
                    <div className="divide-y divide-[#0d0f0d]/4">
                      {mod.lessons.map((lesson, li) => (
                        <div key={lesson.id} className="px-4 md:px-5 py-3 flex items-center justify-between hover:bg-[#0d0f0d]/2 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 flex items-center justify-center text-[9px] font-bold border border-[#0d0f0d]/10 text-[#666860]">{lesson.position}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-medium text-[#0d0f0d] block truncate">{lesson.title}</span>
                              <span className="text-[9px] text-[#666860]">{lesson.duration}{lesson.isFree ? ' · Gratis' : ''}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0 ml-4">
                            <button className="px-2 py-1 text-[8px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">Editar</button>
                            <button className="px-2 py-1 text-[8px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all">Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Module form modal */}
              {showModuleForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModuleForm(false)}>
                  <div className="bg-white w-full max-w-lg p-6 border border-[#0d0f0d]/10" onClick={e => e.stopPropagation()}>
                    <h2 className="text-sm font-bold text-[#0d0f0d]">Nuevo modulo</h2>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Titulo</label>
                        <input type="text" placeholder="Ej: Introduccion al tema"
                          className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Posicion</label>
                        <input type="number" min={1} defaultValue={modules.length + 1}
                          className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowModuleForm(false)}
                          className="px-4 py-2 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all flex-1">Cancelar</button>
                        <button onClick={() => setShowModuleForm(false)}
                          className="px-4 py-2 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all flex-1">Crear modulo</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson form modal */}
              {showLessonForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowLessonForm(false)}>
                  <div className="bg-white w-full max-w-lg p-6 border border-[#0d0f0d]/10" onClick={e => e.stopPropagation()}>
                    <h2 className="text-sm font-bold text-[#0d0f0d]">Nueva leccion</h2>
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Titulo</label>
                        <input type="text" placeholder="Ej: Conceptos fundamentales"
                          className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">URL del video</label>
                        <input type="url" placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Duracion (minutos)</label>
                          <input type="number" placeholder="10"
                            className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Modulo</label>
                          <select className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]">
                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Contenido HTML</label>
                        <textarea rows={4} placeholder="Contenido de la leccion..."
                          className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b] resize-none" />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-[#0d0f0d] cursor-pointer">
                        <input type="checkbox" className="accent-[#ff4b0b]" />
                        Leccion gratuita (vista sin inscripcion)
                      </label>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowLessonForm(false)}
                          className="px-4 py-2 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all flex-1">Cancelar</button>
                        <button onClick={() => setShowLessonForm(false)}
                          className="px-4 py-2 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all flex-1">Crear leccion</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: RECURSOS ─── */}
          {activeTab === 'recursos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-[#0d0f0d]">Recursos del curso ({resources.length})</h2>
                <button className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
                  + Subir recurso
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map((res, i) => (
                  <motion.div key={res.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                    className="p-4 bg-white border border-[#0d0f0d]/8 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#0d0f0d] block truncate">{res.title}</span>
                      <p className="text-[10px] text-[#666860] mt-0.5">{res.description}</p>
                      <span className="text-[9px] text-[#ff4b0b] mt-1 block">{res.fileType.toUpperCase()} · {res.fileSize}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="px-2 py-1 text-[8px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">Editar</button>
                      <button className="px-2 py-1 text-[8px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all">Eliminar</button>
                    </div>
                  </motion.div>
                ))}
                {resources.length === 0 && (
                  <p className="text-xs text-[#666860] col-span-2 py-8 text-center">Aun no hay recursos para este curso.</p>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB: TAREAS ─── */}
          {activeTab === 'tareas' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-[#0d0f0d]">Tareas del curso ({assignments.length})</h2>
                <button className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
                  + Nueva tarea
                </button>
              </div>
              <div className="space-y-3">
                {assignments.map((asg, i) => (
                  <motion.div key={asg.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                    className="p-4 bg-white border border-[#0d0f0d]/8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#0d0f0d]">{asg.title}</span>
                        <p className="text-[10px] text-[#666860] mt-1">{asg.description}</p>
                        <div className="flex gap-3 mt-2 text-[9px] text-[#666860]">
                          <span>Entrega: {asg.dueDays} dias</span>
                          <span>Puntaje max: {asg.maxScore}</span>
                        </div>
                      </div>
                      <button className="px-2 py-1 text-[8px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all shrink-0">Editar</button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/docente/tareas"
                  className="text-xs font-semibold text-[#ff4b0b] hover:opacity-70 transition-opacity">
                  Ir a la bandeja de evaluacion →
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
