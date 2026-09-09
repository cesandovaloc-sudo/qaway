import { supabase } from '@/lib/supabase'
import type { CourseProgress } from '@/lib/types'

export async function getLesson(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id, title, content, video_url, duration, sort_order,
      module:module_id (id, title, course_id),
      resources:resources (id, title, type, file_url, file_size)
    `)
    .eq('id', lessonId)
    .single()

  if (error) throw error
  return data
}

export async function getModuleLessons(moduleId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, duration, sort_order, status')
    .eq('module_id', moduleId)
    .eq('status', 'published')
    .order('sort_order')

  if (error) throw error
  return data
}

export async function markLessonComplete(studentId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

function parseDurationToSeconds(durationStr: string | null | undefined): number {
  if (!durationStr) return 0
  const minMatch = durationStr.match(/^(\d+)\s*min/)
  if (minMatch) return parseInt(minMatch[1]) * 60
  const secMatch = durationStr.match(/^(\d+)\s*s/)
  if (secMatch) return parseInt(secMatch[1])
  return 0
}

export async function getCourseProgress(studentId: string, courseId: string): Promise<CourseProgress> {
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      duration,
      module:module_id!inner (course_id)
    `)
    .eq('module.course_id', courseId)
    .eq('status', 'published')

  if (lessonsError) throw lessonsError

  const lessonIds = lessons.map(l => l.id)

  // Single query for all student progress in this course
  const { data: progressData, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id, completed, seconds_watched')
    .eq('student_id', studentId)
    .in('lesson_id', lessonIds)

  if (progressError) throw progressError

  const completedIds = (progressData || []).filter(p => p.completed).map(p => p.lesson_id)
  const totalSecondsWatched = (progressData || []).reduce((sum, p) => sum + (p.seconds_watched || 0), 0)
  const totalDurationSeconds = lessons.reduce((sum, l) => sum + parseDurationToSeconds(l.duration), 0)

  return {
    total: lessonIds.length,
    completedIds,
    completed: completedIds.length,
    percentage: lessonIds.length > 0
      ? Math.round((completedIds.length / lessonIds.length) * 100)
      : 0,
    totalSecondsWatched,
    totalDurationSeconds,
    minutesWatched: Math.round(totalSecondsWatched / 60),
    totalMinutes: Math.round(totalDurationSeconds / 60),
  }
}
