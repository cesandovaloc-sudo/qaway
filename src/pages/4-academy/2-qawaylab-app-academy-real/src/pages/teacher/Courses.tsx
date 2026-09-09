import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface TeacherCourseRow {
  id: string
  title: string
  slug: string
  status: string
  description: string | null
  short_description: string | null
  category: string | null
  level: string | null
  image_url: string | null
  created_at: string
  students: number
}

interface StatusInfo {
  badge: string
  label: string
}

const SORT_OPTIONS = [
  { id: 'alpha', label: 'A-Z', icon: '🔤' },
  { id: 'alphaDesc', label: 'Z-A', icon: '🔤' },
  { id: 'newest', label: 'Más recientes', icon: '📅' },
  { id: 'oldest', label: 'Más antiguos', icon: '📅' },
  { id: 'students', label: 'Más alumnos', icon: '👥' },
]

export default function TeacherCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<TeacherCourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('alpha')

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, slug, status, description, short_description, category, level, image_url, created_at')
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get enrollment counts per course
      const courseIds = (data || []).map(c => c.id)
      const enrollmentCounts: Record<string, number> = {}
      if (courseIds.length > 0) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .in('course_id', courseIds)

        for (const e of enrollments || []) {
          enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] || 0) + 1
        }
      }

      setCourses((data || []).map(c => ({
        ...c,
        students: enrollmentCounts[c.id] || 0,
      })))
    } catch (err) {
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    loadCourses()
  }, [user?.id, loadCourses])

  const statusColors: Record<string, StatusInfo> = {
    published: { badge: 'badge-success', label: 'Publicado' },
    draft: { badge: 'badge-warning', label: 'Borrador' },
    archived: { badge: 'badge', label: 'Archivado' },
  }

  // Filter by status
  const statusFiltered = filter === 'all'
    ? courses
    : courses.filter(c => c.status === filter)

  // Filter by search
  const q = searchQuery.toLowerCase().trim()
  const searched = !q
    ? statusFiltered
    : statusFiltered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.short_description?.toLowerCase().includes(q)
      )

  // Sort
  const sortedCourses = [...searched].sort((a, b) => {
    switch (sortBy) {
      case 'alpha': return a.title.localeCompare(b.title)
      case 'alphaDesc': return b.title.localeCompare(a.title)
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'students': return (b.students || 0) - (a.students || 0)
      default: return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">Mis Cursos</h1>
          <p className="section-subtitle mt-1">
            {courses.length} curso{courses.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Link to="/academy/app/docente/cursos/nuevo" className="btn-primary text-sm shrink-0">
          + Nuevo Curso
        </Link>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Todos', count: courses.length },
          { id: 'published', label: 'Publicados', count: courses.filter(c => c.status === 'published').length },
          { id: 'draft', label: 'Borradores', count: courses.filter(c => c.status === 'draft').length },
          { id: 'archived', label: 'Archivados', count: courses.filter(c => c.status === 'archived').length },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === f.id ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar cursos por nombre, categoría..."
            className="input-field pl-9 pr-8 h-10 text-sm w-full"
          />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 cursor-pointer">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-surface-400 shrink-0">Orden:</span>
          <div className="flex flex-wrap gap-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-none transition-colors ${
                  sortBy === opt.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-surface-400 hover:text-surface-700 hover:bg-surface-100'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {sortedCourses.length > 0 && (
        <p className="text-xs text-surface-400 mb-4">
          {sortedCourses.length} de {statusFiltered.length} curso{sortedCourses.length !== 1 ? 's' : ''}
          {searchQuery && ` para "${searchQuery}"`}
        </p>
      )}

      {/* Courses Grid */}
      {sortedCourses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCourses.map((course) => {
            const statusInfo = statusColors[course.status] || statusColors.draft
            return (
              <Link
                key={course.id}
                to={`/docente/cursos/${course.slug}`}
                className="card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group flex flex-col"
              >
                {/* Image / placeholder */}
                <div className="mb-4 rounded-none bg-gradient-to-br from-primary-500 to-primary-700 aspect-video flex items-center justify-center overflow-hidden">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📚</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge text-[10px] ${statusInfo.badge}`}>{statusInfo.label}</span>
                    {course.category && (
                      <span className="text-[10px] font-medium text-surface-400 uppercase tracking-wider">{course.category}</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-surface-900 transition-colors duration-300 group-hover:text-primary-700 mb-1">
                    {course.title}
                    <span className="inline-block ml-0.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                  </h3>

                  {course.short_description && (
                    <p className="text-xs text-surface-500 leading-relaxed line-clamp-2 mb-3">
                      {course.short_description}
                    </p>
                  )}
                </div>

                {/* Footer stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-surface-100 mt-3">
                  <span className="text-xs text-surface-400">👥 {course.students} alumno{course.students !== 1 ? 's' : ''}</span>
                  {course.level && (
                    <span className="text-xs text-surface-400">{course.level}</span>
                  )}
                  {course.created_at && (
                    <span className="text-xs text-surface-300 ml-auto" title={new Date(course.created_at).toLocaleDateString('es-PE')}>
                      {new Date(course.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-4xl block mb-4">{searchQuery ? '🔍' : '📚'}</span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {searchQuery
              ? 'No se encontraron cursos'
              : filter === 'all'
                ? 'No tienes cursos asignados'
                : 'No hay cursos en este estado'}
          </h3>
          <p className="text-sm text-surface-500 mb-4">
            {searchQuery
              ? 'Prueba con otros términos de búsqueda.'
              : filter === 'all'
                ? 'Los cursos que te asigne un administrador aparecerán aquí.'
                : 'Prueba con otro filtro.'}
          </p>
          <Link to="/academy/app/docente" className="btn-primary text-sm inline-flex items-center gap-2">
            ← Volver al panel
          </Link>
        </div>
      )}
    </div>
  )
}
