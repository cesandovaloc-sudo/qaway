import { supabase } from '@/lib/supabase'
import type { Quiz, QuizQuestion, QuizAttempt } from '@/lib/types'

export interface QuizQuestionInput {
  question: string
  options: string[]
  correct_index: number
  explanation?: string
  sort_order?: number
}

export interface QuizAnswerInput {
  question_id: string
  selected_index: number
  correct: boolean
}

/**
 * Get quiz with questions for a lesson
 */
export async function getLessonQuiz(lessonId: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id, lesson_id, title, passing_score, max_attempts, created_at,
      questions:quiz_questions (
        id, question, options, correct_index, explanation, sort_order
      )
    `)
    .eq('lesson_id', lessonId)
    .order('sort_order', { foreignTable: 'quiz_questions', ascending: true })
    .maybeSingle()

  if (error) throw error
  return (data as Quiz) || null
}

/**
 * Create a quiz for a lesson
 */
export async function createQuiz(lessonId: string, title = 'Quiz de la lección'): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({ lesson_id: lessonId, title })
    .select()
    .single()

  if (error) throw error
  return data as Quiz
}

/**
 * Delete a quiz and all its questions
 */
export async function deleteQuiz(quizId: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)

  if (error) throw error
}

/**
 * Update quiz settings
 */
export async function updateQuiz(
  quizId: string,
  updates: Partial<Pick<Quiz, 'title' | 'passing_score' | 'max_attempts'>>,
): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', quizId)
    .select()
    .single()

  if (error) throw error
  return data as Quiz
}

/**
 * Add a question to a quiz
 */
export async function addQuestion(quizId: string, questionData: QuizQuestionInput): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({
      quiz_id: quizId,
      question: questionData.question,
      options: questionData.options,
      correct_index: questionData.correct_index,
      explanation: questionData.explanation || '',
      sort_order: questionData.sort_order || 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizQuestion
}

/**
 * Update a question
 */
export async function updateQuestion(questionId: string, questionData: QuizQuestionInput): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .update({
      question: questionData.question,
      options: questionData.options,
      correct_index: questionData.correct_index,
      explanation: questionData.explanation || '',
      sort_order: questionData.sort_order,
    })
    .eq('id', questionId)
    .select()
    .single()

  if (error) throw error
  return data as QuizQuestion
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId)

  if (error) throw error
}

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
  quizId: string,
  studentId: string,
  answers: QuizAnswerInput[],
  score: number,
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      answers,
      score,
      completed: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizAttempt
}

/**
 * Get student's best attempt for a quiz
 */
export async function getBestAttempt(quizId: string, studentId: string): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('student_id', studentId)
    .eq('completed', true)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return (data as QuizAttempt) || null
}

/**
 * Get all attempts for a quiz by a student
 */
export async function getStudentAttempts(quizId: string, studentId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('student_id', studentId)
    .eq('completed', true)
    .order('attempted_at', { ascending: false })

  if (error) throw error
  return (data as QuizAttempt[]) || []
}
