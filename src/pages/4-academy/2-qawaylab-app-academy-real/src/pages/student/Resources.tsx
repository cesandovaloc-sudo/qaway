import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { getStudentResources, getResourceIcon, type StudentResource } from '@/lib/services/resources'
import ResourcePreview from '@/components/student/ResourcePreview'
import type { Course, Module, Lesson } from '@/lib/types'

const PREVIEWABLE_TYPES = ['PDF', 'Word', 'Excel']

/* ─── Type color config ─── */
const TYPE_STYLES: Record<string, { iconBg: string; iconText: string; badge: string; accent: string }> = {
  PDF:       { iconBg: 'bg-red-50',        iconText: 'text-red-600',        badge: 'bg-red-100 text-red-700',       accent: '#fca5a5' },
  Excel:     { iconBg: 'bg-emerald-50',    iconText: 'text-emerald-600',    badge: 'badge-success', accent: '#6ee7b7' },
  Word:      { iconBg: 'bg-blue-50',       iconText: 'text-blue-600',       badge: 'bg-surface-100 text-surface-600',       accent: '#93c5fd' },
  Video:     { iconBg: 'bg-violet-50',     iconText: 'text-violet-600',     badge: 'bg-violet-100 text-violet-700',   accent: '#c4b5fd' },
  Enlace:    { iconBg: 'bg-cyan-50',       iconText: 'text-cyan-600',       badge: 'bg-cyan-100 text-cyan-700',       accent: '#67e8f9' },
  Ejercicio: { iconBg: 'bg-amber-50',      iconText: 'text-amber-600',      badge: 'badge-warning',     accent: '#fcd34d' },
  Plantilla: { iconBg: 'bg-orange-50',     iconText: 'text-orange-600',     badge: 'bg-orange-100 text-orange-700',   accent: '#fdba74' },
  Archivo:   { iconBg: 'bg-surface-100',   iconText: 'text-surface-500',    badge: 'bg-surface-200 text-surface-600', accent: '#cbd5e1' },
}

function typeStyle(type: string | null | undefined) {
  return TYPE_STYLES[type || 'Archivo'] || TYPE_STYLES.Archivo
}

/* ─── Group shapes ─── */
interface LessonGroup {
  lesson: Lesson | { id: string; title: string; sort_order?: number | null }
  resources: StudentResource[]
}

interface ModuleGroup {
  module: Module | { id: string; title: string }
  lessons: Record<string, LessonGroup>
}

interface CourseGroup {
  course: Course | { id: string; title: string; slug?: string | null }
  modules: Record<string, ModuleGroup>
}

/* ─── Group resources by course → module → lesson ─── */
function groupByCourse(resources: StudentResource[]): CourseGroup[] {
  const map: Record<string, CourseGroup> = {}
  for (const r of resources || []) {
    const courseId = r.course?.id
    if (!courseId) continue
    if (!map[courseId]) {
      map[courseId] = {
        course: r.course ?? { id: courseId, title: 'Curso' },
        modules: {},
      }
    }
    const moduleId = r.lesson?.module?.id || '__no_module'
    if (!map[courseId].modules[moduleId]) {
      map[courseId].modules[moduleId] = {
        module: r.lesson?.module || { id: '__no_module', title: 'General' },
        lessons: {},
      }
    }
    const lessonId = r.lesson?.id || '__no_lesson'
    if (!map[courseId].modules[moduleId].lessons[lessonId]) {
      map[courseId].modules[moduleId].lessons[lessonId] = {
        lesson: r.lesson || { id: '__no_lesson', title: 'General' },
        resources: [],
      }
    }
    map[courseId].modules[moduleId].lessons[lessonId].resources.push(r)
  }
  return Object.values(map).sort((a, b) => a.course.title.localeCompare(b.course.title))
}

/* ─── Helper: total count for a module ─── */
function moduleCount(mod: ModuleGroup): number {
  return Object.values(mod.lessons).reduce((s, l) => s + l.resources.length, 0)
}

/* ─── Chevron SVG ─── */
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/* ─── Module Section ─── */
function ModuleSection({ moduleData, onPreview }: { moduleData: ModuleGroup; onPreview: (r: StudentResource) => void }) {
  const [open, setOpen] = useState(false)
  const count = moduleCount(moduleData)

  return (
    <div className="border-b border-surface-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-6 py-3 hover:bg-surface-50 transition-colors text-left"
      >
        <ChevronDown open={open} />
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-amber-50 text-sm">
          📁
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-700 truncate">
            {moduleData.module.title}
          </p>
          <p className="text-xs text-surface-400">{count} recurso{count !== 1 ? 's' : ''}</p>
        </div>
        {count > 0 && (
          <span className="inline-flex items-center justify-center rounded-none bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500 tabular-nums">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="pb-4 space-y-3">
          {Object.values(moduleData.lessons)
            .sort((a, b) => (a.lesson.sort_order || 0) - (b.lesson.sort_order || 0))
            .map((lessonData) => (
              <div key={lessonData.lesson.id} className="ml-14 mr-6">
                <p className="flex items-center gap-2 mb-2 text-sm font-medium text-surface-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-600">
                    {(lessonData.lesson.sort_order || 0) + 1}
                  </span>
                  <span className="truncate">{lessonData.lesson.title}</span>
                </p>
                <div className="space-y-1.5">
                  {lessonData.resources.map((r) => (
                    <ResourceRow key={r.id} resource={r} onPreview={onPreview} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

/* ─── Resource Row ─── */
function ResourceRow({ resource: r, onPreview }: { resource: StudentResource; onPreview: (r: StudentResource) => void }) {
  const style = typeStyle(r.type)
  const canPreview = PREVIEWABLE_TYPES.includes(r.type || '') && Boolean(r.file_url)

  return (
    <div className="group relative flex items-center justify-between rounded-none bg-white px-3.5 py-2.5 transition-all duration-200 hover:translate-y-[-1px] hover:bg-surface-50 border border-transparent hover:border-surface-200">
      {/* Left accent bar by type — uses inline style to avoid Tailwind JIT purge */}
      <div
        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: style.accent }}
      />

      <div className="flex items-center gap-3 min-w-0 pl-1">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none ${style.iconBg} ${style.iconText} text-lg transition-transform duration-200 group-hover:scale-110`}>
          {getResourceIcon(r.type || 'Archivo')}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-800 truncate leading-snug">{r.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none ${style.badge}`}>
              {r.type}
            </span>
            {r.file_size && (
              <>
                <span className="text-surface-300 text-xs">·</span>
                <span className="text-xs text-surface-400">{r.file_size}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {canPreview && (
          <button
            type="button"
            onClick={() => onPreview(r)}
            className="btn-ghost text-xs px-2.5 py-1.5 text-primary-600 font-semibold"
          >
            Vista previa
          </button>
        )}
        {r.file_url ? (
          <a
            href={r.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Descargar
          </a>
        ) : (
          <span className="text-xs text-surface-400 px-2 italic">No disponible</span>
        )}
      </div>
    </div>
  )
}

/* ─── Loading State ─── */
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm text-surface-500">Cargando recursos...</p>
      </div>
    </div>
  )
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-none bg-surface-100 text-4xl mb-4">📎</span>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">No tienes recursos</h3>
      <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
        Los recursos aparecerán cuando te inscribas en un curso
      </p>
      <Link to="/cursos" className="btn-primary">Explorar Cursos</Link>
    </div>
  )
}

/* ─── Page Component ─── */
export default function Resources() {
  const { user } = useAuth()
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [previewResource, setPreviewResource] = useState<StudentResource | null>(null)

  const { data: resources, loading } = useData(
    () => user?.id ? getStudentResources(user.id) : Promise.resolve([]),
    [user?.id]
  )

  const groups = groupByCourse(resources || [])
  const totalCount = resources?.length || 0

  if (loading) return <LoadingState />

  if (previewResource) {
    return (
      <ResourcePreview
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Mis Recursos</h1>
        <p className="section-subtitle mt-1">
          {totalCount > 0
            ? `${totalCount} recursos en ${groups.length} curso${groups.length !== 1 ? 's' : ''}`
            : 'Todos tus materiales descargables en un solo lugar'}
        </p>
      </div>

      {totalCount > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => {
            const isOpen = expandedCourse === group.course.id
            const totalResources = Object.values(group.modules).reduce(
              (sum, m) => sum + moduleCount(m), 0
            )

            return (
              <div
                key={group.course.id}
                className={`card overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md ring-1 ring-primary-100' : 'hover:shadow-sm'}`}
              >
                {/* ── Course header ── */}
                <button
                  onClick={() => setExpandedCourse(isOpen ? null : group.course.id)}
                  className="flex w-full items-center justify-between p-5 hover:bg-surface-50 transition-colors relative"
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors duration-300 ${isOpen ? 'bg-primary-500' : 'bg-transparent'}`} />

                  <div className="flex items-center gap-4 min-w-0 pl-2">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-primary-50 text-xl transition-all duration-300 ${isOpen ? 'scale-110' : ''}`}>
                      📚
                    </span>
                    <div className="text-left min-w-0">
                      <h2 className="font-semibold text-surface-900 truncate leading-snug">
                        {group.course.title}
                      </h2>
                      <p className="text-sm text-surface-500 mt-0.5">
                        {totalResources} recurso{totalResources !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/cursos/${group.course.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="btn-ghost text-xs font-medium text-primary-600 hover:text-primary-700 hidden sm:inline-flex"
                    >
                      Ir al curso →
                    </Link>
                    <span className="inline-flex items-center justify-center rounded-none bg-surface-100 px-2.5 py-0.5 text-xs font-medium text-surface-500 tabular-nums transition-all duration-200">
                      {totalResources}
                    </span>
                    <span className={`text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </button>

                {/* ── Expanded content ── */}
                {isOpen && (
                  <div className="border-t border-surface-100 bg-surface-50/40">
                    {Object.values(group.modules)
                      .sort((a, b) => ((a.module as Module).sort_order || 0) - ((b.module as Module).sort_order || 0))
                      .filter(mod => Object.values(mod.lessons).some(l => l.resources.length > 0))
                      .map((mod) => (
                        <ModuleSection key={mod.module.id} moduleData={mod} onPreview={setPreviewResource} />
                      ))}

                    {Object.values(group.modules).filter(mod =>
                      Object.values(mod.lessons).some(l => l.resources.length > 0)
                    ).length === 0 && (
                      <div className="px-6 py-8 text-center">
                        <p className="text-sm text-surface-400">No hay recursos en este curso</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
