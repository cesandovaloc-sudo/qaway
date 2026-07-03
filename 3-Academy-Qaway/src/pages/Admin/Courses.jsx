import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { courses } from '@/data/courses'
import { mockTeachers } from '@/data/internal'

export default function AdminCourses() {
  const [filter, setFilter] = useState('todos')

  const filtered = useMemo(() => {
    if (filter === 'todos') return courses
    if (filter === 'gratis') return courses.filter(c => c.isFree)
    if (filter === 'pago') return courses.filter(c => !c.isFree)
    return courses
  }, [filter])

  function getTeacherName(course) {
    const t = mockTeachers.find(t => t.coursesAssigned.includes(course.id))
    return t?.name || 'Sin asignar'
  }

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/admin" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Panel admin</Link>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">Cursos</h1>
          <p className="mt-2 text-sm text-[#666860]">{courses.length} cursos en total.Crea, edita y administra el catálogo.</p>
        </div>
      </section>

      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              {[
                { id: 'todos', label: 'Todos', count: courses.length },
                { id: 'gratis', label: 'Gratis', count: courses.filter(c => c.isFree).length },
                { id: 'pago', label: 'De pago', count: courses.filter(c => !c.isFree).length },
              ].map(tab => (
                <button key={tab.id} onClick={() => setFilter(tab.id)}
                  className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${filter === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'}`}>
                  {tab.label} <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>
            <Link to="/admin/cursos/nuevo"
              className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
              + Nuevo curso
            </Link>
          </div>
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#0d0f0d]/10">
                  <th className="py-3 pr-4 font-semibold text-[#666860] uppercase tracking-wider">Curso</th>
                  <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Nivel</th>
                  <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Precio</th>
                  <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Docente</th>
                  <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Lecciones</th>
                  <th className="py-3 pl-4 font-semibold text-[#666860] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course, i) => (
                  <motion.tr key={course.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                    className="border-b border-[#0d0f0d]/6 hover:bg-white/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-[#0d0f0d]">{course.title}</span>
                      <span className="block text-[10px] text-[#666860]">{course.category}</span>
                    </td>
                    <td className="py-3 px-4 text-[#666860] capitalize">{course.level}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${course.isFree ? 'text-green-600' : 'text-[#0d0f0d]'}`}>
                        {course.isFree ? 'Gratis' : `$${course.price}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#666860]">{getTeacherName(course)}</td>
                    <td className="py-3 px-4 text-[#666860]">{course.lessons}</td>
                    <td className="py-3 pl-4">
                      <div className="flex gap-2">
                        <Link to={`/admin/cursos/${course.slug}/editar`}
                          className="px-2 py-1 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">Editar</Link>
                        <Link to={`/cursos/${course.slug}`}
                          className="px-2 py-1 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all">Ver</Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
