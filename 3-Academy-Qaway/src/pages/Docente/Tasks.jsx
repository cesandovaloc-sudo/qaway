import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockAssignments } from '@/data/internal'
import { courses } from '@/data/courses'

// Mock submissions — en produccion vendrian de Supabase
const mockSubmissions = [
  { id: 'sub-1', assignmentId: 'asg-1', studentName: 'Maria Garcia', studentAvatar: 'https://picsum.photos/seed/maria/100/100', submittedAt: '2026-06-27T14:30:00', status: 'pending', fileUrl: '#' },
  { id: 'sub-2', assignmentId: 'asg-1', studentName: 'Pedro Lopez', studentAvatar: 'https://picsum.photos/seed/pedro/100/100', submittedAt: '2026-06-26T09:15:00', status: 'pending', fileUrl: '#' },
  { id: 'sub-3', assignmentId: 'asg-2', studentName: 'Ana Martinez', studentAvatar: 'https://picsum.photos/seed/ana/100/100', submittedAt: '2026-06-28T11:00:00', status: 'graded', score: 85, feedback: 'Excelente trabajo, muy bien detallado.' },
  { id: 'sub-4', assignmentId: 'asg-2', studentName: 'Laura Jimenez', studentAvatar: 'https://picsum.photos/seed/laura/100/100', submittedAt: '2026-06-25T08:30:00', status: 'pending', fileUrl: '#' },
  { id: 'sub-5', assignmentId: 'asg-3', studentName: 'Sofia Torres', studentAvatar: 'https://picsum.photos/seed/sofia/100/100', submittedAt: '2026-06-29T15:20:00', status: 'graded', score: 92, feedback: 'Buen analisis y propuesta solida.' },
  { id: 'sub-6', assignmentId: 'asg-1', studentName: 'Roberto Vega', studentAvatar: 'https://picsum.photos/seed/roberto/100/100', submittedAt: '2026-06-22T13:10:00', status: 'pending', fileUrl: '#' },
]

export default function DocenteTasks() {
  const [filter, setFilter] = useState('pendientes')
  const [gradingId, setGradingId] = useState(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')

  const pendingCount = mockSubmissions.filter(s => s.status === 'pending').length
  const gradedCount = mockSubmissions.filter(s => s.status === 'graded').length

  const filtered = filter === 'pendientes'
    ? mockSubmissions.filter(s => s.status === 'pending')
    : filter === 'calificadas'
    ? mockSubmissions.filter(s => s.status === 'graded')
    : mockSubmissions

  function getAssignmentTitle(assignmentId) {
    return mockAssignments.find(a => a.id === assignmentId)?.title || 'Tarea'
  }

  function getCourseForAssignment(assignmentId) {
    const asg = mockAssignments.find(a => a.id === assignmentId)
    if (!asg) return null
    return courses.find(c => c.id === asg.courseId)
  }

  function handleGrade(submissionId) {
    // Mock: en produccion actualizaria Supabase
    setGradingId(null)
    setScore('')
    setFeedback('')
  }

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/docente" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Mi panel</Link>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">Evaluacion de tareas</h1>
          <p className="mt-2 text-sm text-[#666860]">Revisa y califica las tareas entregadas por tus alumnos.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex gap-4">
            {[
              { id: 'pendientes', label: 'Pendientes', count: pendingCount },
              { id: 'calificadas', label: 'Calificadas', count: gradedCount },
              { id: 'todas', label: 'Todas', count: mockSubmissions.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${filter === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'}`}>
                {tab.label} <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Submissions */}
      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#666860] text-center py-16">No hay entregas en esta categoria.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((sub, i) => {
                const course = getCourseForAssignment(sub.assignmentId)
                return (
                  <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                    className="p-4 md:p-5 bg-white border border-[#0d0f0d]/8">

                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <img src={sub.studentAvatar} alt={sub.studentName} className="w-9 h-9 object-cover border border-[#0d0f0d]/10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#0d0f0d]">{sub.studentName}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {sub.status === 'graded' ? `Calificado (${sub.score}/100)` : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-xs text-[#0d0f0d] mt-1 font-medium">{getAssignmentTitle(sub.assignmentId)}</p>
                        {course && <p className="text-[10px] text-[#666860]">{course.title}</p>}
                        <p className="text-[9px] text-[#666860] mt-0.5">Entregado el {new Date(sub.submittedAt).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    {/* Grading form */}
                    {gradingId === sub.id ? (
                      <div className="mt-4 pt-4 border-t border-[#0d0f0d]/6 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Puntaje (0-100)</label>
                            <input type="number" value={score} onChange={e => setScore(e.target.value)} min={0} max={100}
                              className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
                          </div>
                          <div className="flex items-end">
                            {sub.fileUrl && sub.fileUrl !== '#' && (
                              <a href={sub.fileUrl} className="text-[10px] font-semibold text-[#ff4b0b] hover:opacity-70 transition-opacity">Descargar entrega</a>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Feedback</label>
                          <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Comentarios sobre la entrega..."
                            className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b] resize-none" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleGrade(sub.id)}
                            className="px-4 py-2 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">Guardar calificacion</button>
                          <button onClick={() => setGradingId(null)}
                            className="px-4 py-2 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all">Cancelar</button>
                        </div>
                      </div>
                    ) : sub.status === 'graded' ? (
                      <div className="mt-3 pt-3 border-t border-[#0d0f0d]/6">
                        <p className="text-[10px] text-[#666860] italic">"{sub.feedback}"</p>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-[#0d0f0d]/6">
                        <button onClick={() => { setGradingId(sub.id); setScore(''); setFeedback('') }}
                          className="px-3 py-1.5 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
                          Calificar
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
