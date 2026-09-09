import { useState } from 'react'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { reviewSubmission } from '@/lib/services/tasks'

interface SubmissionRow {
  id: string
  status: string | null
  grade: string | null
  file_url: string | null
  notes: string | null
  feedback: string | null
  submitted_at: string | null
  reviewed_at: string | null
  task: {
    id: string
    title: string
    lesson: {
      module: {
        course: {
          id: string
          title: string
          instructor_id: string | null
        } | null
      } | null
    } | null
  } | null
  student: { id: string; full_name: string | null } | null
}

async function loadSubmissions(teacherId: string | undefined): Promise<SubmissionRow[]> {
  if (!teacherId) return []

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, status, grade, file_url, notes, feedback, submitted_at, reviewed_at,
      task:tasks (
        id, title,
        lesson:lessons (
          module:modules (
            course:courses (id, title, instructor_id)
          )
        )
      ),
      student:student_id (id, full_name)
    `)
    .order('submitted_at', { ascending: false })
    .limit(100)

  if (error) throw error

  // Filter for teacher's courses only
  return ((data as unknown as SubmissionRow[]) || []).filter(
    s => s.task?.lesson?.module?.course?.instructor_id === teacherId
  )
}

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Corregir',
  approved: 'Aprobada',
  returned: 'Devuelta',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  reviewed: 'badge-success',
  approved: 'badge-success',
  returned: 'badge-danger',
}

const GRADE_COLORS: Record<string, string> = {
  Aprobado: 'badge-success',
  Aprobada: 'badge-success',
  Corregir: 'badge-warning',
  Devuelta: 'badge-warning',
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-PE')
}

export default function TaskReview() {
  const { user } = useAuth()
  const { data: submissions, loading, error, refetch } = useData(
    () => loadSubmissions(user?.id),
    [user?.id]
  )

  const [filter, setFilter] = useState('Todas')
  const [reviewingSubmission, setReviewingSubmission] = useState<SubmissionRow | null>(null)
  const [reviewForm, setReviewForm] = useState({ grade: 'Aprobado', feedback: '' })
  const [reviewing, setReviewing] = useState(false)

  const filtered = !submissions ? [] : filter === 'Todas'
    ? submissions
    : submissions.filter(s => {
        const label = STATUS_MAP[s.status || ''] || s.status
        return label === filter
      })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-surface-500">
        Error al cargar las entregas
      </div>
    )
  }

  const filterOptions = ['Todas', 'Pendiente', 'Corregir', 'Aprobada', 'Devuelta']

  async function handleReview() {
    if (!reviewingSubmission) return
    setReviewing(true)
    try {
      await reviewSubmission(reviewingSubmission.id, {
        status: reviewForm.grade === 'Aprobado' ? 'approved' : reviewForm.grade === 'Devuelta' ? 'returned' : 'reviewed',
        grade: null,
        feedback: reviewForm.feedback.trim(),
      })
      setReviewingSubmission(null)
      setReviewForm({ grade: 'Aprobado', feedback: '' })
      refetch()
    } catch (err) {
      alert('Error al revisar: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div>
      {/* Sticky header with title + filters */}
      <div className="sticky top-16 z-20 -mx-8 px-8 pb-4 mb-6 bg-surface-50/95 backdrop-blur-sm border-b border-surface-200/80">
        <div className="pt-4 pb-3">
          <h1 className="section-title">Revisión de Tareas</h1>
          <p className="section-subtitle mt-1">Revisa y califica las entregas de tus alumnos</p>
        </div>
        <div className="flex gap-2 flex-wrap pb-2">
          {filterOptions.map((f) => {
            const count = f === 'Todas'
              ? (submissions?.length || 0)
              : (submissions || []).filter(s => (STATUS_MAP[s.status || ''] || s.status) === f).length

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
                }`}
              >
                {f} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Submissions */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((s) => {
            const courseTitle = s.task?.lesson?.module?.course?.title
            return (
              <div key={s.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 text-sm font-semibold text-surface-600">
                      {(s.student?.full_name || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{s.student?.full_name || '—'}</p>
                      <p className="text-xs text-surface-400">
                        {s.task?.title || 'Tarea'} {courseTitle ? `· ${courseTitle}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`badge text-xs ${STATUS_COLORS[s.status || ''] || 'badge'}`}>
                    {STATUS_MAP[s.status || ''] || s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    {s.file_url && <span>📎 Adjunto</span>}
                    {s.file_url && s.submitted_at && <span>·</span>}
                    <span>{timeAgo(s.submitted_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">                    {s.status === 'pending' && (
                          <button
                            onClick={() => {
                              setReviewingSubmission(s)
                              setReviewForm({ grade: 'Aprobado', feedback: '' })
                            }}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Revisar
                          </button>
                        )}
                  </div>
                </div>
                {s.grade && (
                  <div className={`mt-3 rounded-none px-3 py-2 text-xs font-medium ${GRADE_COLORS[s.grade] || 'bg-surface-50 text-surface-700'}`}>
                    {s.grade}
                  </div>
                )}
                {s.feedback && (
                  <div className="mt-2 text-xs text-surface-500 italic">
                    "{s.feedback}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <span className="text-5xl block mb-4">
            {filter === 'Todas' || filter === 'Pendiente' ? '✅' : '📋'}
          </span>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            {filter === 'Todas'
              ? 'No hay entregas aún'
              : `No hay entregas en "${filter}"`}
          </h3>
          <p className="text-sm text-surface-500">
            {filter === 'Pendiente'
              ? 'Todas las entregas han sido revisadas'
              : 'Los estudiantes enviarán sus tareas aquí'}
          </p>
        </div>
      )}
      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !reviewing && setReviewingSubmission(null)}>
          <div className="w-full max-w-lg rounded-none bg-white" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-surface-900">Revisar entrega</h2>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-none text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
                disabled={reviewing}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-5">
              {/* Student info */}
              <div className="flex items-center gap-3 rounded-none bg-surface-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-base font-bold text-primary-700">
                  {(reviewingSubmission.student?.full_name || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-surface-900">{reviewingSubmission.student?.full_name || '—'}</p>
                  <p className="text-sm text-surface-500">{reviewingSubmission.task?.title || 'Tarea'}</p>
                  <p className="text-xs text-surface-400">{reviewingSubmission.task?.lesson?.module?.course?.title || ''}</p>
                </div>
              </div>

              {/* File attachment */}
              {reviewingSubmission.file_url && (
                <div>
                  <label className="label-field text-xs mb-1.5">Archivo adjunto</label>
                  <a
                    href={reviewingSubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-none border border-surface-200 bg-white px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ver archivo adjunto
                    <span className="ml-auto text-xs text-surface-400">↗</span>
                  </a>
                </div>
              )}

              {/* Student notes */}
              {reviewingSubmission.notes && (
                <div>
                  <label className="label-field text-xs mb-1.5">Notas del estudiante</label>
                  <div className="rounded-none border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-700 italic">
                    "{reviewingSubmission.notes}"
                  </div>
                </div>
              )}

              {/* Grade selector */}
              <div>
                <label className="label-field text-xs mb-1.5">Calificación</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Aprobado', 'Corregir', 'Devuelta'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, grade: g }))}
                      className={`rounded-none border-2 px-4 py-3 text-sm font-medium transition-all ${
                        reviewForm.grade === g
                          ? g === 'Aprobado'
                            ? 'border-primary-500 bg-primary-50'
                            : g === 'Corregir'
                            ? 'border-amber-500 badge-warning'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      {g === 'Aprobado' ? '✅ Aprobado' : g === 'Corregir' ? '🔄 Corregir' : '↩️ Devuelta'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="label-field text-xs mb-1.5">Feedback para el estudiante</label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm(f => ({ ...f, feedback: e.target.value }))}
                  className="input-field min-h-[100px] resize-y text-sm"
                  placeholder="Escribe sugerencias, correcciones o comentarios…"
                  rows={4}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-surface-200 px-6 py-4">
              <span className="text-xs text-surface-400">
                {reviewingSubmission.submitted_at && `Entregado ${new Date(reviewingSubmission.submitted_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewingSubmission(null)}
                  className="btn-ghost text-sm px-4 py-2"
                  disabled={reviewing}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReview}
                  disabled={reviewing}
                  className="btn-primary text-sm px-6 py-2"
                >
                  {reviewing ? 'Guardando…' : 'Guardar revisión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
