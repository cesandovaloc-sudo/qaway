import { Link, useParams } from 'react-router-dom'
import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from 'react'
import { getCourseBySlug, createModule, createLesson, updateLesson, deleteLesson, deleteModule } from '@/lib/services/courses'
import { useTeacherPreview } from '@/contexts/TeacherPreviewContext'
import {
  getLessonResources,
  uploadResource,
  deleteResource,
  getResourceIcon,
  detectResourceType,
  type StudentResource,
} from '@/lib/services/resources'
import { saveLessonTranscript, autoFetchTranscript } from '@/lib/services/transcript'
import QuizEditor from '@/components/teacher/QuizEditor'
import type { Course, Module, Lesson } from '@/lib/types'

interface UploadFormProps {
  courseId: string
  lessonId: string
  onUploaded: () => void
  onCancel: () => void
}

function UploadForm({ courseId, lessonId, onUploaded, onCancel }: UploadFormProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('PDF')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    // Auto-detect type and title from file
    setType(detectResourceType(f.type, f.name))
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) { setError('Selecciona un archivo'); return }
    if (!title.trim()) { setError('Escribe un título'); return }

    setUploading(true)
    setError('')
    try {
      await uploadResource({
        courseId,
        lessonId,
        file,
        title: title.trim(),
        type,
      })
      setFile(null)
      setTitle('')
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al subir el recurso')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-none border border-primary-200 bg-primary-50/50 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-field text-xs">Título del recurso</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-sm"
            placeholder="Ej: Guía de ejercicios"
          />
        </div>
        <div>
          <label className="label-field text-xs">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-field text-sm">
            <option value="PDF">📄 PDF</option>
            <option value="Excel">📊 Excel</option>
            <option value="Word">📝 Word</option>
            <option value="Video">🎬 Video</option>
            <option value="Enlace">🔗 Enlace</option>
            <option value="Ejercicio">📝 Ejercicio</option>
            <option value="Plantilla">📋 Plantilla</option>
            <option value="Archivo">📎 Archivo</option>
          </select>
        </div>
        <div>
          <label className="label-field text-xs">Archivo</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-surface-500 file:mr-3 file:rounded-none file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-200"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={uploading}
          className="btn-primary text-xs px-4 py-2"
        >
          {uploading ? 'Subiendo...' : 'Subir recurso'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function CourseManage() {
  const { slug } = useParams()
  const { previewLesson, setPreviewLesson, setCourseData } = useTeacherPreview()
  const [course, setCourse] = useState<Course | null>(null)
  const [resources, setResources] = useState<Record<string, StudentResource[]>>({}) // { lessonId: [resource, ...] }
  const [loading, setLoading] = useState(true)
  const [uploadOpenFor, setUploadOpenFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Module creation state
  const [creatingModule, setCreatingModule] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [moduleSaving, setModuleSaving] = useState(false)

  // Lesson creation state
  const [creatingLessonFor, setCreatingLessonFor] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonSaving, setLessonSaving] = useState(false)

  // Inline editing state
  const [editingLesson, setEditingLesson] = useState<string | null>(null) // lesson id
  const [editTitle, setEditTitle] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const loadCourse = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCourseBySlug(slug as string)
      if (!data) { setError('Curso no encontrado'); setLoading(false); return }
      setCourse(data)
      setCourseData(data)
      // Load resources for all lessons
      await loadAllResources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al cargar el curso')
    } finally {
      setLoading(false)
    }
  }, [slug, setCourseData])

  useEffect(() => {
    if (!slug) return
    loadCourse()
  }, [slug, loadCourse])

  async function loadAllResources(courseData: Course) {
    const resourceMap: Record<string, StudentResource[]> = {}
    const promises: Promise<void>[] = []
    for (const mod of courseData.modules || []) {
      for (const lesson of mod.lessons || []) {
        promises.push(
          getLessonResources(lesson.id).then(r => {
            resourceMap[lesson.id] = r || []
          })
        )
      }
    }
    await Promise.all(promises)
    setResources(resourceMap)
  }

  async function handleUploaded() {
    setUploadOpenFor(null)
    // Reload resources in parallel
    const promises: Promise<{ lessonId: string; resources: StudentResource[] }>[] = []
    for (const mod of course?.modules || []) {
      for (const lesson of mod.lessons || []) {
        promises.push(
          getLessonResources(lesson.id).then(r => ({ lessonId: lesson.id, resources: r || [] }))
        )
      }
    }
    const results = await Promise.all(promises)
    const resourceMap: Record<string, StudentResource[]> = {}
    for (const { lessonId, resources: r } of results) {
      resourceMap[lessonId] = r
    }
    setResources(resourceMap)
  }

  async function handleDelete(resourceId: string, fileUrl: string | null) {
    if (!confirm('¿Eliminar este recurso?')) return
    try {
      await deleteResource(resourceId, fileUrl)
      await handleUploaded() // reload
    } catch (err) {
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  /* ─── Module CRUD ─── */

  async function handleCreateModule(e: FormEvent) {
    e.preventDefault()
    if (!moduleTitle.trim()) return
    if (!course) return
    setModuleSaving(true)
    try {
      await createModule(course.id, moduleTitle.trim(), moduleDescription.trim())
      setModuleTitle('')
      setModuleDescription('')
      setCreatingModule(false)
      await loadCourse()
    } catch (err) {
      alert('Error al crear módulo: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setModuleSaving(false)
    }
  }

  /* ─── Lesson CRUD ─── */

  async function handleCreateLesson(moduleId: string) {
    if (!lessonTitle.trim()) return
    setLessonSaving(true)
    try {
      await createLesson(moduleId, lessonTitle.trim())
      setLessonTitle('')
      setCreatingLessonFor(null)
      await loadCourse()
    } catch (err) {
      alert('Error al crear lección: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLessonSaving(false)
    }
  }

  async function handleUpdateLesson(lessonId: string) {
    if (!editTitle.trim()) return
    setEditSaving(true)
    try {
      await updateLesson(lessonId, {
        title: editTitle.trim(),
        video_url: editVideoUrl.trim() || null,
      })
      setEditingLesson(null)
      await loadCourse()
    } catch (err) {
      alert('Error al actualizar lección: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setEditSaving(false)
    }
  }

  async function handleUpdateLessonStatus(lessonId: string, status: string) {
    try {
      await updateLesson(lessonId, { status })
      await loadCourse()
    } catch (err) {
      alert('Error al cambiar estado: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  function startEditingLesson(lesson: Lesson) {
    setEditSaving(false)
    setEditingLesson(lesson.id)
    setEditTitle(lesson.title)
    setEditVideoUrl(lesson.video_url || '')
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('¿Eliminar esta lección permanentemente?')) return
    try {
      await deleteLesson(lessonId)
      await loadCourse()
    } catch (err) {
      alert('Error al eliminar lección: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return
    try {
      await deleteModule(moduleId)
      await loadCourse()
    } catch (err) {
      alert('Error al eliminar módulo: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-12 text-center">
        <p className="text-surface-500">{error}</p>
        <Link to="/docente" className="btn-primary mt-4 inline-block">Volver al panel</Link>
      </div>
    )
  }

  if (!course) return null

  const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0
  const totalResources = Object.values(resources).reduce((s, arr) => s + arr.length, 0)

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-4">
        <Link to="/docente" className="hover:text-surface-600 transition-colors">Panel</Link>
        <span>/</span>
        <span className="text-surface-900 font-medium">{course.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">{course.title}</h1>
            <p className="section-subtitle mt-1">Gestiona el contenido y los recursos de tu curso</p>
          </div>
          <span className={`badge text-xs ${
            course.status === 'published' ? 'badge-success' :
            course.status === 'draft' ? 'badge' : 'badge-warning'
          }`}>
            {course.status === 'published' ? 'Publicado' :
             course.status === 'draft' ? 'Borrador' : course.status}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
          <span>📚 {course.modules?.length || 0} módulos</span>
          <span>📖 {totalLessons} lecciones</span>
          <span>📎 {totalResources} recurso{totalResources !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="space-y-6">
        {(course.modules || []).map((mod, modIdx) => (
          <div key={mod.id} className="card overflow-hidden">
            <div className="border-b border-surface-100 bg-surface-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-surface-900">
                    Módulo {modIdx + 1}: {mod.title}
                  </h2>
                  {mod.description && (
                    <p className="text-xs text-surface-400 mt-1">{mod.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteModule(mod.id)}
                  className="rounded-none px-2 py-1 text-xs text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Eliminar módulo"
                >
                  🗑
                </button>
              </div>
            </div>

            <div className="divide-y divide-surface-100">
              {(mod.lessons || [])
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((lesson) => {
                  const lessonResources = resources[lesson.id] || []
                  return (
                    <div key={lesson.id} className="px-6 py-4">
                      {/* Lesson header */}
                      {editingLesson === lesson.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-surface-500">
                              {lesson.sort_order || ((mod.lessons || []).indexOf(lesson) + 1)}
                            </span>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="input-field text-sm flex-1"
                              placeholder="Título de la lección"
                            />
                          </div>
                          <div className="ml-9">
                            <label className="label-field text-xs">URL del video</label>
                            <input
                              type="text"
                              value={editVideoUrl}
                              onChange={(e) => setEditVideoUrl(e.target.value)}
                              className="input-field text-sm"
                              placeholder="https://www.youtube.com/embed/... o dejar vacío"
                            />
                          </div>
                          <div className="ml-9 flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateLesson(lesson.id)}
                              disabled={editSaving}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              {editSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => setEditingLesson(null)}
                              className="btn-ghost text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-surface-500">
                              {lesson.sort_order || ((mod.lessons || []).indexOf(lesson) + 1)}
                            </span>
                            <span className="text-sm font-medium text-surface-800 truncate">
                              {lesson.title}
                            </span>
                            {lesson.video_url && (
                              <span className="text-xs text-surface-400 shrink-0" title="Tiene video">🎬</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Status quick toggle */}
                            <select
                              value={lesson.status || 'draft'}
                              onChange={(e) => handleUpdateLessonStatus(lesson.id, e.target.value)}
                              className={`text-xs rounded-none border-0 px-2 py-1 font-medium cursor-pointer ${
                                lesson.status === 'published' ? 'badge-success' :
                                lesson.status === 'review' ? 'badge-warning' :
                                'bg-surface-100 text-surface-500'
                              }`}
                            >
                              <option value="draft">Borrador</option>
                              <option value="review">Revisión</option>
                              <option value="published">Publicado</option>
                            </select>
                            <button
                              onClick={() => startEditingLesson(lesson)}
                              className="rounded-none px-2 py-1 text-xs font-medium text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                              title="Editar lección"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setPreviewLesson(lesson, course.title)}
                              className={`rounded-none px-2 py-1 text-xs font-medium transition-all ${
                                previewLesson?.id === lesson.id
                                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                                  : 'text-surface-400 hover:text-primary-600 hover:bg-primary-50'
                              }`}
                              title="Ver como estudiante"
                            >
                              👁
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="rounded-none px-2 py-1 text-xs text-surface-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Eliminar lección"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Transcript status indicator */}
                      <div className="mt-2 ml-10 flex items-center gap-2">
                        {lesson.transcript_status === 'auto' && (
                          <span className="inline-flex items-center gap-1 rounded-none bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            ✓ Transcripción automática
                          </span>
                        )}
                        {lesson.transcript_status === 'manual' && (
                          <span className="inline-flex items-center gap-1 rounded-none bg-surface-100 px-2.5 py-0.5 text-xs font-medium text-surface-600">
                            ✓ Transcripción manual
                          </span>
                        )}
                        {lesson.transcript_status === 'none' && lesson.video_url && (
                          <span className="inline-flex items-center gap-1 rounded-none bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            ⚠ Video sin transcripción
                          </span>
                        )}
                        {(lesson.transcript_status === 'none' || lesson.transcript_status === 'auto' || lesson.transcript_status === 'manual') && (
                          <button
                            onClick={async () => {
                              const text = prompt('Pega la transcripción del video (texto plano, con o sin [timestamp])')
                              if (text && text.trim()) {
                                try {
                                  await saveLessonTranscript(lesson.id, text.trim(), 'manual')
                                  alert('✅ Transcripción guardada correctamente')
                                  // Recargar curso para reflejar cambios
                                  loadCourse()
                                } catch (err) {
                                  alert('Error al guardar: ' + (err instanceof Error ? err.message : String(err)))
                                }
                              }
                            }}
                            className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
                          >
                            {lesson.transcript_status !== 'none' ? 'Reemplazar transcripción' : '+ Subir transcripción'}
                          </button>
                        )}
                        {lesson.transcript_status === 'none' && lesson.video_url && (
                          <button
                            onClick={async () => {
                              try {
                                const result = await autoFetchTranscript(lesson.video_url || '')
                                if (result.success && result.transcript) {
                                  await saveLessonTranscript(lesson.id, result.transcript, 'auto')
                                  alert('✅ Transcripción obtenida automáticamente de YouTube')
                                  loadCourse()
                                } else {
                                  alert('⚠ El video no tiene transcripción disponible. Puedes subirla manualmente.')
                                }
                              } catch (err) {
                                alert('Error al obtener transcripción: ' + (err instanceof Error ? err.message : String(err)))
                              }
                            }}
                            className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
                          >
                            Obtener de YouTube
                          </button>
                        )}
                      </div>

                      {/* Resources for this lesson */}
                      {lessonResources.length > 0 && (
                        <div className="mt-3 ml-10 space-y-1.5">
                          {lessonResources.map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-none bg-surface-50 px-3 py-2 group">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-sm">{getResourceIcon(r.type || 'Archivo')}</span>
                                <span className="text-xs text-surface-700 truncate">{r.title}</span>
                                <span className="text-xs text-surface-400">· {r.type}</span>
                                {r.file_size && (
                                  <span className="text-xs text-surface-400">{r.file_size}</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDelete(r.id, r.file_url || null)}
                                className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      <div className="mt-2 ml-10">
                        {uploadOpenFor === lesson.id ? (
                          <UploadForm
                            courseId={course.id}
                            lessonId={lesson.id}
                            onUploaded={handleUploaded}
                            onCancel={() => setUploadOpenFor(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setUploadOpenFor(lesson.id)}
                            className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
                          >
                            + Subir recurso
                          </button>
                        )}
                      </div>

                      {/* Quiz editor */}
                      <QuizEditor lessonId={lesson.id} />
                    </div>
                  )
                })}
            </div>

            {/* Add Lesson */}
            <div className="px-6 py-3 border-t border-dashed border-surface-200">
              {creatingLessonFor === mod.id ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleCreateLesson(mod.id) }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Título de la lección..."
                    className="input-field text-sm flex-1"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={lessonSaving}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    {lessonSaving ? '...' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreatingLessonFor(null); setLessonTitle('') }}
                    className="btn-ghost text-xs"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setCreatingLessonFor(mod.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <span className="text-sm">➕</span>
                  Añadir lección
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Module */}
        <div className="card border-dashed border-2 border-surface-200 flex items-center justify-center p-6">
          {creatingModule ? (
            <form onSubmit={handleCreateModule} className="w-full max-w-lg space-y-3">
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Título del módulo..."
                className="input-field text-sm"
                autoFocus
                required
              />
              <input
                type="text"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                className="input-field text-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={moduleSaving}
                  className="btn-primary text-xs px-4 py-2"
                >
                  {moduleSaving ? 'Creando...' : 'Crear módulo'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreatingModule(false); setModuleTitle(''); setModuleDescription('') }}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreatingModule(true)}
              className="flex items-center gap-2 text-sm font-medium text-surface-400 hover:text-primary-600 transition-colors"
            >
              <span className="text-lg">➕</span>
              Añadir módulo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
