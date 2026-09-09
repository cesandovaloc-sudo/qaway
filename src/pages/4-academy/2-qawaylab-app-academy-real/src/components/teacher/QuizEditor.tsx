import { useState, useEffect, useCallback } from 'react'
import { getLessonQuiz, createQuiz, deleteQuiz, addQuestion, deleteQuestion, updateQuiz, type QuizQuestionInput } from '@/lib/services/quizzes'
import type { Quiz } from '@/lib/types'

export default function QuizEditor({ lessonId }: { lessonId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadQuiz = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLessonQuiz(lessonId)
      setQuiz(data)
    } catch (err) {
      console.error('Error loading quiz:', err)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    if (!lessonId) return
    loadQuiz()
  }, [lessonId, loadQuiz])

  async function handleCreateQuiz() {
    setSaving(true)
    try {
      const data = await createQuiz(lessonId)
      setQuiz(data)
      setEditing(true)
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error desconocido'
      alert('Error al crear quiz: ' + message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteQuiz() {
    if (!quiz) return
    if (!confirm('¿Eliminar todo el quiz y sus preguntas?')) return
    setSaving(true)
    try {
      await deleteQuiz(quiz.id)
      setQuiz(null)
      setEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error desconocido'
      alert('Error al eliminar: ' + message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddQuestion(data: QuizQuestionInput) {
    if (!quiz) return
    setSaving(true)
    try {
      await addQuestion(quiz.id, {
        ...data,
        sort_order: (quiz.questions?.length || 0),
      })
      await loadQuiz()
      setShowNewQuestion(false)
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error desconocido'
      alert('Error al agregar pregunta: ' + message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return
    setSaving(true)
    try {
      await deleteQuestion(questionId)
      await loadQuiz()
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error desconocido'
      alert('Error al eliminar: ' + message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateSettings(passingScore: number, maxAttempts: number) {
    if (!quiz) return
    setSaving(true)
    try {
      await updateQuiz(quiz.id, {
        passing_score: passingScore || 70,
        max_attempts: maxAttempts || 0,
      })
      await loadQuiz()
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error desconocido'
      alert('Error al actualizar: ' + message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!quiz && !loading) {
    return (
      <div className="mt-3 ml-10">
        <div className="rounded-none border border-dashed border-surface-300 bg-surface-50/50 p-4 text-center">
          <p className="text-xs text-surface-500 mb-2">Sin quiz configurado</p>
          <button
            onClick={handleCreateQuiz}
            disabled={saving}
            className="btn-primary text-xs px-4 py-2"
          >
            {saving ? 'Creando...' : '+ Crear Quiz'}
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) return null

  return (
    <div className="mt-3 ml-10">
      <div className="rounded-none border border-primary-200 bg-primary-50/30 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">❓</span>
            <span className="text-sm font-medium text-surface-800">
              Quiz: {quiz.title}
            </span>
            <span className="badge text-[10px]">
              {quiz.questions?.length || 0} preguntas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="btn-ghost text-xs px-2 py-1"
            >
              {editing ? 'Listo' : 'Editar'}
            </button>
            <button
              onClick={handleDeleteQuiz}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Settings */}
        {editing && (
          <div className="mb-3 flex items-center gap-4">
            <div>
              <label className="text-[10px] font-medium text-surface-500 block mb-0.5">Nota mínima (%)</label>
              <input
                type="number"
                defaultValue={quiz.passing_score ?? 70}
                min={0}
                max={100}
                className="input-field text-xs w-20 py-1"
                onBlur={e => handleUpdateSettings(Number(e.target.value), quiz.max_attempts ?? 0)}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-surface-500 block mb-0.5">Intentos máx.</label>
              <input
                type="number"
                defaultValue={quiz.max_attempts ?? 0}
                min={0}
                className="input-field text-xs w-20 py-1"
                onBlur={e => handleUpdateSettings(quiz.passing_score ?? 70, Number(e.target.value))}
              />
              <p className="text-[9px] text-surface-400 mt-0.5">0 = ilimitado</p>
            </div>
          </div>
        )}

        {/* Questions list */}
        {quiz.questions && quiz.questions.length > 0 && (
          <div className="space-y-2 mb-3">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="rounded-none bg-white border border-surface-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-surface-800 flex-1">
                    {idx + 1}. {q.question}
                  </p>
                  {editing && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {(q.options || []).map((opt, optIdx) => (
                    <div key={optIdx} className={`flex items-center gap-1.5 text-[11px] ${
                      optIdx === q.correct_index ? 'text-emerald-700 font-medium' : 'text-surface-500'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        optIdx === q.correct_index ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                      {optIdx === q.correct_index && <span className="text-emerald-500">✓</span>}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-1 text-[10px] text-surface-400 italic">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add question button / form */}
        {editing && !showNewQuestion && (
          <button
            onClick={() => setShowNewQuestion(true)}
            className="btn-ghost text-xs text-primary-600"
          >
            + Agregar pregunta
          </button>
        )}

        {editing && showNewQuestion && (
          <NewQuestionForm
            onSave={handleAddQuestion}
            onCancel={() => setShowNewQuestion(false)}
            saving={saving}
          />
        )}

        {!editing && quiz.questions?.length === 0 && (
          <p className="text-xs text-surface-400 text-center py-2">Sin preguntas aún. Edita para agregar.</p>
        )}
      </div>
    </div>
  )
}

function NewQuestionForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (data: QuizQuestionInput) => void
  onCancel: () => void
  saving: boolean
}) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')

  function handleOptionChange(idx: number, value: string) {
    setOptions(prev => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!question.trim()) { setError('Escribe la pregunta'); return }
    const validOptions = options.filter(o => o.trim())
    if (validOptions.length < 2) { setError('Agrega al menos 2 opciones'); return }
    if (correctIndex >= options.length || !options[correctIndex]?.trim()) {
      setError('Selecciona una respuesta correcta válida')
      return
    }

    onSave({
      question: question.trim(),
      options,
      correct_index: correctIndex,
      explanation: explanation.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-none bg-white border border-primary-200 p-3">
      <div>
        <label className="label-field text-[10px]">Pregunta</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="input-field text-xs py-1.5"
          rows={2}
          placeholder="¿Cuál es la capital de Francia?"
        />
      </div>

      <div>
        <label className="label-field text-[10px] mb-1">Opciones</label>
        <div className="space-y-1.5">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(idx)}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  correctIndex === idx
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-200'
                    : 'bg-surface-100 text-surface-400'
                }`}
                title={`Opción ${String.fromCharCode(65 + idx)}${correctIndex === idx ? ' (correcta)' : ''}`}
              >
                {String.fromCharCode(65 + idx)}
              </button>
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                className="input-field text-xs py-1.5 flex-1"
                placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
              />
              {correctIndex === idx && (
                <span className="text-[10px] text-emerald-600 font-medium shrink-0">Correcta</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label-field text-[10px]">Explicación (opcional)</label>
        <input
          type="text"
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          className="input-field text-xs py-1.5"
          placeholder="Se muestra después de responder"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-xs px-4 py-2">
          {saving ? 'Guardando...' : 'Agregar pregunta'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}
