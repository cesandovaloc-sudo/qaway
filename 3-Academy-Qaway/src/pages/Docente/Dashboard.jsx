import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses, instructors } from '@/data/courses'
import { mockStudents, mockAssignments, getStudentStatus } from '@/data/internal'

export default function DocenteDashboard() {
  const instructor = instructors[0] // Mock: instructor actual
  const misCursos = courses.slice(0, 3)

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b]">Panel Docente</span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
              Bienvenido, {instructor?.name || 'Instructor'}
            </h1>
            <p className="mt-2 text-sm text-[#666860]">Gestiona tus cursos, revisa tareas y monitorea el progreso de tus alumnos.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cursos activos', value: misCursos.length },
              { label: 'Alumnos totales', value: mockStudents.filter(s => s.enrolledCourses > 0).length },
              { label: 'Tareas por revisar', value: mockAssignments.length },
              { label: 'Alumnos en riesgo', value: mockStudents.filter(s => getStudentStatus(s.lastActivity) === 'at-risk').length },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <span className="text-xl md:text-2xl font-bold text-[#0d0f0d]">{s.value}</span>
                <p className="text-[10px] text-[#666860] uppercase tracking-wider mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Acciones rapidas */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex flex-wrap gap-3">
            <Link to="/docente/tareas" className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
              Evaluar tareas
            </Link>
          </div>
        </div>
      </section>

      {/* Mis cursos */}
      <section className="py-section md:py-[80px] bg-[#f5f5f4]">
        <div className="section-container">
          <h2 className="text-sm font-bold text-[#0d0f0d] mb-6">Mis cursos</h2>
          <div className="space-y-3">
            {misCursos.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/docente/cursos/${course.slug}`}
                  className="block p-4 md:p-6 bg-white border border-[#0d0f0d]/8 hover:border-[#ff4b0b]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#0d0f0d]">{course.title}</h3>
                      <p className="mt-1 text-[11px] text-[#666860]">
                        {course.modules} modulos · {course.lessons} lecciones · {course.duration}
                      </p>
                      <p className="text-[10px] text-[#666860] mt-0.5">
                        {mockStudents.filter(s => s.enrolledCourses > 0).length} alumnos inscritos
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      course.isFree ? 'bg-[#ff4b0b]/10 text-[#ff4b0b]' : 'bg-[#0d0f0d]/6 text-[#0d0f0d]'
                    }`}>
                      {course.isFree ? 'Gratis' : `$${course.price}`}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
