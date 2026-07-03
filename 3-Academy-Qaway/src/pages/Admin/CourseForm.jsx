import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCourseBySlug, categories, levels } from '@/data/courses'
import { mockTeachers } from '@/data/internal'

export default function CourseForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const existing = slug ? getCourseBySlug(slug) : null
  const isEditing = !!existing

  const [form, setForm] = useState({
    title: existing?.title || '',
    slug: existing?.slug || '',
    summary: existing?.summary || '',
    description: existing?.description || '',
    level: existing?.level || 'basico',
    category: existing?.category || 'ia-aplicada',
    price: existing?.price || 0,
    isFree: existing?.isFree || false,
    duration: existing?.duration || '',
    instructorId: existing?.instructorId || '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock: en produccion enviaria a Supabase
    navigate(isEditing ? '/admin/cursos' : '/admin/cursos')
  }

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/admin/cursos" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Gestión de cursos</Link>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{isEditing ? 'Editar curso' : 'Nuevo curso'}</h1>
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4]">
        <div className="section-container max-w-2xl">
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Título del curso</label>
                <input type="text" value={form.title} onChange={e => update('title', e.target.value)} required
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => update('slug', e.target.value)} required
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Duración</label>
                <input type="text" value={form.duration} onChange={e => update('duration', e.target.value)} placeholder="6 horas"
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Resumen</label>
                <input type="text" value={form.summary} onChange={e => update('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Descripción</label>
                <textarea rows={4} value={form.description} onChange={e => update('description', e.target.value)}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b] resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Nivel</label>
                <select value={form.level} onChange={e => update('level', e.target.value)}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]">
                  {levels.map(l => <option key={l.slug} value={l.slug}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Categoría</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]">
                  {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Precio ($)</label>
                <input type="number" value={form.price} onChange={e => update('price', Number(e.target.value))} min={0}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-[#0d0f0d] cursor-pointer">
                  <input type="checkbox" checked={form.isFree} onChange={e => { update('isFree', e.target.checked); if (e.target.checked) update('price', 0) }} className="accent-[#ff4b0b]" />
                  Curso gratuito
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666860] mb-1">Docente asignado</label>
                <select value={form.instructorId} onChange={e => update('instructorId', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#0d0f0d]/10 text-sm focus:outline-none focus:border-[#ff4b0b]">
                  <option value="">Seleccionar docente...</option>
                  {mockTeachers.filter(t => t.role === 'instructor').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Link to="/admin/cursos" className="px-5 py-2.5 text-[10px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all">Cancelar</Link>
              <button type="submit" className="px-5 py-2.5 text-[10px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">
                {isEditing ? 'Guardar cambios' : 'Crear curso'}
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  )
}
