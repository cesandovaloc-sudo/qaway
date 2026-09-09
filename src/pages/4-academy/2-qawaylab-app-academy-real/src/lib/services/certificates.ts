import { supabase } from '@/lib/supabase'
import type { Certificate } from '@/lib/types'

export async function getCertificates(studentId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      id, certificate_url, issued_at,
      course:courses (id, title, slug, duration, instructor:instructor_id (full_name))
    `)
    .eq('student_id', studentId)
    .order('issued_at', { ascending: false })

  if (error) throw error
  return (data as unknown as Certificate[]) || []
}

export async function issueCertificate(studentId: string, courseId: string): Promise<Certificate> {
  const { data, error } = await supabase
    .from('certificates')
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Certificate
}

export async function verifyCertificate(certificateId: string): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      id, issued_at,
      student:student_id (full_name),
      course:courses (title, duration)
    `)
    .eq('id', certificateId)
    .single()

  if (error) throw error
  return (data as unknown as Certificate) || null
}
