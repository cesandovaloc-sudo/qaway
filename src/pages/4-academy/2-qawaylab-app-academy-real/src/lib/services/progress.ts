import { supabase } from '@/lib/supabase'

const COMPLETION_THRESHOLD = 0.95

/**
 * Updates video progress with server-side validation.
 * Only accepts increasing seconds_watched (cheat-proof).
 * Marks completed when current_time/duration >= COMPLETION_THRESHOLD.
 */
export async function updateProgress(studentId: string, lessonId: string, currentTime: number, duration: number) {
  const { data, error } = await supabase.rpc('update_lesson_progress', {
    p_student_id: studentId,
    p_lesson_id: lessonId,
    p_current_time: Math.floor(currentTime),
    p_duration: Math.floor(duration),
  })

  if (error) throw error
  return data
}

/**
 * Returns whether the lesson should be considered completed
 * based on the 95% threshold. Used for local UI feedback
 * before the server responds.
 */
export function isLocallyComplete(currentTime: number, duration: number) {
  if (!duration || duration <= 0) return false
  return currentTime / duration >= COMPLETION_THRESHOLD
}
