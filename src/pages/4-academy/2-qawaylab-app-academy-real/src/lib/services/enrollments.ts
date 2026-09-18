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

export interface UserAccessResult {
  hasAccess: boolean
  accessType: 'free' | 'enrollment' | 'subscription' | 'none'
}

/**
 * Resuelve de forma unificada si un estudiante tiene acceso a un curso:
 * 1. Curso 100% gratuito (is_free = true)
 * 2. Inscripción activa / compra individual en enrollments
 * 3. Suscripción activa recurrente en Supabase Central (Commerce RPC)
 */
export async function resolveUserCourseAccess(
  studentId: string | null | undefined,
  course: { id: string; is_free?: boolean | null } | null | undefined
): Promise<UserAccessResult> {
  if (!course) return { hasAccess: false, accessType: 'none' }

  // 1. Curso gratuito
  if (course.is_free) {
    return { hasAccess: true, accessType: 'free' }
  }

  if (!studentId) {
    return { hasAccess: false, accessType: 'none' }
  }

  // 2. Inscripción directa
  try {
    const enrollment = await getEnrollment(studentId, course.id)
    if (enrollment && enrollment.status === 'active') {
      return { hasAccess: true, accessType: 'enrollment' }
    }
  } catch (err) {
    console.warn('[resolveUserCourseAccess] Error verificando enrollment:', err)
  }

  // 3. Suscripción activa en Commerce
  try {
    const { checkUserSubscriptionAccess } = await import('./commerceBridge')
    const hasSubAccess = await checkUserSubscriptionAccess(studentId, course.id)
    if (hasSubAccess) {
      return { hasAccess: true, accessType: 'subscription' }
    }
  } catch (err) {
    console.warn('[resolveUserCourseAccess] Error verificando suscripción:', err)
  }

  return { hasAccess: false, accessType: 'none' }
}
