import { supabase } from '@/lib/supabase'

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })

  if (error) console.error('Failed to log activity:', error)
}

export async function getRecentActivity(limit = 10) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id, action, entity_type, metadata, created_at,
      user:user_id (id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getCourseActivity(courseId: string, limit = 20) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      id, action, metadata, created_at,
      user:user_id (full_name)
    `)
    .eq('entity_id', courseId)
    .eq('entity_type', 'course')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
