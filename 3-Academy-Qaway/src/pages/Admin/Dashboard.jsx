import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/academy/SectionHeader'
import { mockStudents, getStudentStatus, getStudentsNeedingMotivation } from '@/data/internal'
import { courses } from '@/data/courses'

export default function AdminDashboard() {
  const stats = useMemo(() => {
    const total = mockStudents.length
    const active = mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'active').length
    const atRisk = mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'at-risk').length
    const inactive = mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'inactive').length
    const needMotivation = getStudentsNeedingMotivation(mockStudents)
    const avgProgress = Math.round(mockStudents.reduce((a, s) => a + s.avgProgress, 0) / total)
    return { total, active, atRisk, inactive, needMotivation, avgProgress }
  }, [])

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <SectionHeader
            eyebrow="Administracion"
            title="Panel de control"
            description="Monitorea alumnos, cursos y progreso general de la plataforma."
            dark
          />
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Alumnos totales', value: stats.total },
              { label: 'Activos', value: stats.active, color: 'text-green-600' },
              { label: 'En riesgo', value: stats.atRisk, color: 'text-amber-600' },
              { label: 'Inactivos', value: stats.inactive, color: 'text-red-600' },
              { label: 'Progreso promedio', value: `${stats.avgProgress}%` },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <span className={`text-xl md:text-2xl font-bold ${s.color || 'text-[#0d0f0d]'}`}>{s.value}</span>
                <p className="text-[10px] text-[#666860] uppercase tracking-wider mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="py-8 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/alumnos" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
              Alumnos
            </Link>
            <Link to="/admin/docentes" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
              Docentes
            </Link>
            <Link to="/admin/cursos" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
              Cursos
            </Link>
            <Link to="/admin/permisos" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
              Roles y permisos
            </Link>
          </div>
        </div>
      </section>

      <div className="py-section md:py-[80px] bg-[#f5f5f4]">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Alumnos que necesitan atención */}
            <div>
              <h2 className="text-sm font-bold text-[#0d0f0d] mb-4">
                Alumnos que necesitan motivacion ({stats.needMotivation.length})
              </h2>
              <div className="space-y-2">
                {stats.needMotivation.map(student => {
                  const daysSince = Math.floor((Date.now() - new Date(student.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={student.id} className="p-3 bg-white border border-[#0d0f0d]/8 flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-8 h-8 object-cover border border-[#0d0f0d]/10" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-[#0d0f0d] block truncate">{student.name}</span>
                        <span className="text-[10px] text-[#666860]">
                          {daysSince} dias sin actividad · {student.avgProgress}% de progreso
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                        daysSince > 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {daysSince > 7 ? 'Inactivo' : 'En riesgo'}
                      </span>
                    </div>
                  )
                })}
                {stats.needMotivation.length === 0 && (
                  <p className="text-xs text-[#666860]">Todos los alumnos estan al dia.</p>
                )}
              </div>
            </div>

            {/* Resumen de cursos */}
            <div>
              <h2 className="text-sm font-bold text-[#0d0f0d] mb-4">Resumen de cursos ({courses.length})</h2>
              <div className="space-y-2">
                {courses.slice(0, 5).map(course => {
                  const enrolled = mockStudents.filter(s => s.enrolledCourses > 0).length
                  const avg = Math.round(mockStudents.reduce((a, s) => a + s.avgProgress, 0) / mockStudents.length)
                  return (
                    <div key={course.id} className="p-3 bg-white border border-[#0d0f0d]/8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#0d0f0d] truncate">{course.title}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          course.isFree ? 'bg-[#ff4b0b]/10 text-[#ff4b0b]' : 'bg-[#0d0f0d]/6 text-[#0d0f0d]'
                        }`}>
                          {course.isFree ? 'Gratis' : `$${course.price}`}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-[10px] text-[#666860]">
                        <span>{course.lessons} lecciones</span>
                        <span>{course.duration}</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
