import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/academy/ProgressBar'
import { mockStudents, getStudentStatus, getStudentsNeedingMotivation } from '@/data/internal'

export default function AdminStudents() {
  const [filter, setFilter] = useState('todos')

  const filteredStudents = useMemo(() => {
    if (filter === 'todos') return mockStudents
    if (filter === 'motivacion') return getStudentsNeedingMotivation(mockStudents)
    return mockStudents.filter(s => {
      const status = getStudentStatus(s.lastActivity)
      return filter === 'activos' ? status === 'active' : filter === 'riesgo' ? status === 'at-risk' : status === 'inactive'
    })
  }, [filter])

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/admin" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">
            ← Panel admin
          </Link>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">Alumnos</h1>
          <p className="mt-2 text-sm text-[#666860]">Monitoreo y seguimiento de alumnos inscritos.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex gap-4">
            {[
              { id: 'todos', label: 'Todos', count: mockStudents.length },
              { id: 'activos', label: 'Activos', count: mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'active').length },
              { id: 'riesgo', label: 'En riesgo', count: mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'at-risk').length },
              { id: 'inactivos', label: 'Inactivos', count: mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'inactive').length },
              { id: 'motivacion', label: 'Necesitan email', count: getStudentsNeedingMotivation(mockStudents).length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${
                  filter === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-[#666860] text-center py-16">No hay alumnos en esta categoria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#0d0f0d]/10">
                    <th className="py-3 pr-4 font-semibold text-[#666860] uppercase tracking-wider">Alumno</th>
                    <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Cursos</th>
                    <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Progreso</th>
                    <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Ultima actividad</th>
                    <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Estado</th>
                    <th className="py-3 pl-4 font-semibold text-[#666860] uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, i) => {
                    const status = getStudentStatus(student.lastActivity)
                    const daysSince = Math.floor((Date.now() - new Date(student.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
                    const needsEmail = daysSince >= 5 && student.avgProgress < 50

                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-[#0d0f0d]/6 hover:bg-white/50 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 object-cover border border-[#0d0f0d]/10" />
                            <div>
                              <span className="font-semibold text-[#0d0f0d]">{student.name}</span>
                              <span className="block text-[10px] text-[#666860]">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#666860]">{student.enrolledCourses} activos</td>
                        <td className="py-3 px-4">
                          <div className="w-28">
                            <ProgressBar value={student.avgProgress} size="sm" />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#666860] tabular-nums">
                          {daysSince === 0 ? 'Hoy' : daysSince === 1 ? 'Ayer' : `Hace ${daysSince} dias`}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            status === 'active' ? 'bg-green-100 text-green-700' :
                            status === 'at-risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {status === 'active' ? 'Activo' : status === 'at-risk' ? 'En riesgo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 pl-4">
                          {needsEmail ? (
                            <span className="text-[#ff4b0b] font-semibold text-[10px]">Enviar motivacion</span>
                          ) : (
                            <span className="text-[#666860] text-[10px]">Al dia</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
