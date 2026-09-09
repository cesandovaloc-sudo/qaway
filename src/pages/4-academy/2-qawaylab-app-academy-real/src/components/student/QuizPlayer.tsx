import { useState, useEffect, useCallback } from 'react'
import { getLessonQuiz, submitQuizAttempt, getBestAttempt, type QuizAnswerInput } from '@/lib/services/quizzes'
import { useAuth } from '@/contexts/AuthContext'
import type { Quiz, QuizAttempt } from '@/lib/types'

interface AttemptResult {
  score: number
  correctCount: number
  total: number
  answers: QuizAnswerInput[]
}

export default function QuizPlayer({ lessonId }: { lessonId: string }) {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null)

  const loadQuiz = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLessonQuiz(lessonId)
      setQuiz(data)
      if (data && user) {
        const best = await getBestAttempt(data.id, user.id)
        setBestAttempt(best)
        if (best) setShowResults(true)
      }
    } catch (err) {
      console.error('Error loading quiz:', err)
    } finally {
      setLoading(false)
    }
  }, [lessonId, user])

  useEffect(() => {
    if (!lessonId) return
    loadQuiz()
  }, [lessonId, loadQuiz])

  function handleSelect(questionId: string, optionIndex: number) {
    if (submitted) return
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  async function handleSubmit() {
    if (!quiz || !user) return
    const questions = quiz.questions || []
    const answered = Object.keys(selectedAnswers).length
    if (answered < questions.length) {
      // Allow partial - show warning but still submit
    }

    setSubmitting(true)
    try {
      const answers: QuizAnswerInput[] = questions.map(q => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] ?? -1,
        correct: selectedAnswers[q.id] === q.correct_index,
      }))

      const correctCount = answers.filter(a => a.correct).length
      const score = Math.round((correctCount / questions.length) * 100)

      await submitQuizAttempt(quiz.id, user.id, answers, score)
      setAttemptResult({ score, correctCount, total: questions.length, answers })
      setSubmitted(true)
      setShowResults(true)
      // Reload to get best attempt
      const best = await getBestAttempt(quiz.id, user.id)
      setBestAttempt(best)
    } catch (err) {
      console.error('Error submitting quiz:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setSelectedAnswers({})
    setSubmitted(false)
    setAttemptResult(null)
    setShowResults(false)
    setCurrentIndex(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="rounded-none border border-surface-200 bg-surface-50 p-8 text-center">
        <span className="text-3xl block mb-3">❓</span>
        <h3 className="text-sm font-semibold text-surface-700 mb-1">Sin quiz disponible</h3>
        <p className="text-xs text-surface-500">Esta lección no tiene preguntas de práctica.</p>
      </div>
    )
  }

  const questions = quiz.questions || []
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(selectedAnswers).length
  const allAnswered = answeredCount === questions.length

  // Results view
  if (showResults && (submitted || bestAttempt)) {
    const bestAnswers = (bestAttempt?.answers as QuizAnswerInput[] | null) || []
    const result: AttemptResult = attemptResult || {
      score: bestAttempt?.score ?? 0,
      correctCount: bestAnswers.filter(a => a.correct).length,
      total: questions.length,
      answers: bestAnswers,
    }

    return (
      <div className="space-y-6">
        <div className="rounded-none border border-surface-200 bg-surface-50 p-6 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
            result.score >= (quiz.passing_score ?? 0)
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            <span className="text-2xl font-bold">{result.score}%</span>
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-1">
            {result.score >= (quiz.passing_score ?? 0) ? '✅ ¡Aprobado!' : '🔄 Sigue practicando'}
          </h3>
          <p className="text-sm text-surface-500">
            {result.correctCount} de {result.total} respuestas correctas
            {(quiz.passing_score ?? 0) > 0 && ` · Mínimo: ${quiz.passing_score}%`}
          </p>
          {bestAttempt && !submitted && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600 rounded-none">
                Mejor intento
              </span>
            </div>
          )}
          {(quiz.max_attempts === 0 || ((bestAttempt as QuizAttempt & { attempts?: number } | null)?.attempts || 0) < (quiz.max_attempts ?? 0)) ? (
            <button
              onClick={handleRetry}
              className="btn-primary text-sm mt-4"
            >
              {submitted ? 'Intentar de nuevo' : 'Reintentar'}
            </button>
          ) : null}
        </div>

        {/* Review answers */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-surface-700">Revisión de respuestas</h4>
          {questions.map((q, idx) => {
            const answer = result.answers?.find(a => a.question_id === q.id)
            const isCorrect = answer?.correct
            return (
              <div key={q.id} className={`rounded-none border p-4 ${
                isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-surface-900 flex-1">
                    {idx + 1}. {q.question}
                  </p>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-none ${
                    isCorrect ? 'badge-success' : 'badge-danger'
                  }`}>
                    {isCorrect ? 'Correcto' : 'Incorrecto'}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {(q.options || []).map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2 rounded-none px-3 py-1.5 text-xs ${
                        optIdx === q.correct_index
                          ? 'bg-emerald-100 text-emerald-800 font-medium'
                          : optIdx === answer?.selected_index && !isCorrect
                          ? 'bg-red-100 text-red-800'
                          : 'bg-white text-surface-500'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        optIdx === q.correct_index
                          ? 'bg-emerald-500 text-white'
                          : optIdx === answer?.selected_index && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-surface-200 text-surface-500'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                      {optIdx === q.correct_index && (
                        <span className="ml-auto text-emerald-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-2 text-xs text-surface-500 italic bg-white/50 rounded-none px-3 py-2">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Question view
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-surface-500">
          Pregunta {currentIndex + 1} de {questions.length}
        </span>
        <span className="text-xs text-surface-400">
          {answeredCount} de {questions.length} respondidas
        </span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-none border border-surface-200 p-5">
        <p className="text-sm font-medium text-surface-900 mb-4">
          {currentQuestion.question}
        </p>
        <div className="space-y-2">
          {(currentQuestion.options || []).map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === idx
            return (
              <button
                key={idx}
                onClick={() => handleSelect(currentQuestion.id, idx)}
                className={`w-full flex items-center gap-3 rounded-none border px-4 py-3 text-left text-sm transition-all ${
                  isSelected
                    ? 'border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                    : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-100 text-surface-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              className="btn-ghost text-sm"
            >
              ← Anterior
            </button>
          )}
          {currentIndex < questions.length - 1 && (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="btn-primary text-sm"
            >
              Siguiente →
            </button>
          )}
        </div>
        {allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-sm bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? 'Enviando...' : '✅ Enviar respuestas'}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex gap-1.5 justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'bg-primary-600 scale-125'
                : selectedAnswers[q.id] !== undefined
                ? 'bg-primary-300'
                : 'bg-surface-200 hover:bg-surface-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
