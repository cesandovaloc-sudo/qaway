import { supabase } from '@/lib/supabase'

export interface TaskItem {
  id: string
  title: string
  description?: string | null
  due_days?: number | null
  created_at?: string
}

export interface Submission {
  id: string
  file_url?: string | null
  notes?: string | null
  status?: string | null
  grade?: number | null
  feedback?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  student?: { id: string; full_name: string | null; avatar_url: string | null } | null
  task?: {
    id: string
    title: string
    lesson?: {
      module?: {
        course?: { id: string; title: string; instructor_id: string } | null
      } | null
    } | null
  } | null
}

export async function getLessonTasks(lessonId: string): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, description, due_days')
    .eq('lesson_id', lessonId)

  if (error) throw error
  return (data as TaskItem[]) || []
}

export async function getSubmissions(
  taskId: string,
  options: { status?: string } = {},
): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select(`
      id, file_url, notes, status, grade, feedback, submitted_at, reviewed_at,
      student:student_id (id, full_name, avatar_url)
    `)
    .eq('task_id', taskId)

  if (options.status) query = query.eq('status', options.status)
  query = query.order('submitted_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as Submission[]) || []
}

export async function submitTask(
  taskId: string,
  studentId: string,
  { file_url, notes }: { file_url?: string | null; notes?: string | null },
): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .insert({ task_id: taskId, student_id: studentId, file_url, notes })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Submission
}

export async function reviewSubmission(
  submissionId: string,
  { status, grade, feedback }: { status: string; grade?: number | null; feedback?: string | null },
): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .update({ status, grade, feedback, reviewed_at: new Date().toISOString() })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw error
  return data as unknown as Submission
}

export async function getPendingSubmissions(teacherId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, status, submitted_at,
      task:tasks (
        id, title,
        lesson:lessons (
          module:modules (
            course:courses (
              id, title, instructor_id
            )
          )
        )
      ),
      student:student_id (id, full_name)
    `)
    .eq('status', 'pending')
    .eq('task.lesson.module.course.instructor_id', teacherId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data as unknown as Submission[]) || []
}
