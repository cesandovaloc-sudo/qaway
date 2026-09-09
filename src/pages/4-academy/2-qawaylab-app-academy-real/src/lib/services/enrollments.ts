import { supabase } from '@/lib/supabase'
import type { Enrollment } from '@/lib/types'

export async function getEnrollments(studentId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, status, enrolled_at, completed_at,
      course:courses (
        id, title, slug, image_url, category, level, duration, price, is_free,
        instructor:instructor_id (full_name)
      )
    `)
    .eq('student_id', studentId)
    .order('enrolled_at', { ascending: false })

  if (error) throw error
  return (data as unknown as Enrollment[]) || []
}

export async function enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Enrollment
}

export async function getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as unknown as Enrollment) || null
}
