import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockTeachers } from '@/data/internal'
import { courses as allCourses } from '@/data/courses'

export default function AdminTeachers() {
  const [showForm, setShowForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [filter, setFilter] = useState('todos')

  const filtered = useMemo(() => {
    if (filter === 'todos') return mockTeachers
    return mockTeachers.filter(t => t.status === filter)
  }, [filter])

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/admin" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Panel admin</Link>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">Docentes</h1>
          <p className="mt-2 text-sm text-[#666860]">Gestiona los instructores de la plataforma, asigna cursos y administra permisos.</p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4">
              {[
                { id: 'todos', label: 'Todos', count: mockTeachers.length },
                { id: 'active', label: 'Activos', count: mockTeachers.filter(t => t.status === 'active').length },
              ].map(tab => (
                <button key={tab.id} onClick={() => setFilter(tab.id)}
                  className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${filter === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'}`}>
                  {tab.label} <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setEditingTeacher(null); setShowForm(true) }}
              className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
              + Nuevo docente
            </button>
          </div>
        </div>
      </section>

      {/* Teacher list */}
      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          <div className="space-y-3">
            {filtered.map((teacher, i) => (
              <motion.div key={teacher.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="p-4 md:p-5 bg-white border border-[#0d0f0d]/8 flex flex-col sm:flex-row items-start gap-4">
                <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 object-cover border border-[#0d0f0d]/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-[#0d0f0d]">{teacher.name}</span>
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#0d0f0d]/6 text-[#0d0f0d]">{teacher.role}</span>
                  </div>
                  <p className="text-[11px] text-[#666860] mt-0.5">{teacher.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacher.coursesAssigned.map(cId => {
                      const c = allCourses.find(c => c.id === cId)
                      return c ? <span key={cId} className="px-2 py-0.5 text-[9px] bg-[#ff4b0b]/10 text-[#ff4b0b]">{c.title}</span> : null
                    })}
                    {teacher.coursesAssigned.length === 0 && <span className="text-[10px] text-[#666860]">Sin cursos asignados</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditingTeacher(teacher); setShowForm(true) }}
                    className="px-3 py-1.5 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">
                    Editar
                  </button>
                  <button className="px-3 py-1.5 text-[10px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                    Desactivar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg p-6 md:p-8 border border-[#0d0f0d]/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-[#0d0f0d]">{editingTeacher ? 'Editar docente' : 'Nuevo docente'}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Nombre completo</label>
                <input type="text" defaultValue={editingTeacher?.name || ''} placeholder="Nombre del docente"
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm text-[#0d0f0d] focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Correo electrónico</label>
                <input type="email" defaultValue={editingTeacher?.email || ''} placeholder="docente@qaway.com"
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm text-[#0d0f0d] focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Cursos asignados</label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#0d0f0d]/10 p-3">
                  {allCourses.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-xs text-[#0d0f0d] cursor-pointer">
                      <input type="checkbox" defaultChecked={editingTeacher?.coursesAssigned.includes(c.id)} className="accent-[#ff4b0b]" />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all flex-1">Cancelar</button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all flex-1">
                  {editingTeacher ? 'Guardar cambios' : 'Crear docente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
