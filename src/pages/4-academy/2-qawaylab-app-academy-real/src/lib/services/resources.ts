import { supabase } from '@/lib/supabase'
import type { Resource } from '@/lib/types'

export interface StudentResource {
  id: string
  title: string
  type?: string | null
  file_url?: string | null
  file_size?: string | number | null
  is_global?: boolean | null
  lesson?: { id: string; title: string; sort_order: number | null; module: { id: string; title: string; sort_order: number | null } | null } | null
  course?: { id: string; title: string; slug: string | null } | null
  created_at?: string
}

/**
 * Fetch all resources for a student's enrolled courses with signed URLs.
 * Used by the global Resources page (/panel/recursos).
 */
export async function getStudentResources(studentId: string): Promise<StudentResource[]> {
  // First get the student's enrolled course IDs
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', studentId)
    .in('status', ['active', 'completed'])

  if (enrollError) throw enrollError
  if (!enrollments || enrollments.length === 0) return []

  const courseIds = enrollments.map(e => e.course_id)

  // Fetch resources with course + module + lesson info
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id, title, type, file_url, file_size, is_global, created_at,
      lesson:lesson_id (id, title, sort_order, module:module_id (id, title, sort_order)),
      course:course_id (id, title, slug)
    `)
    .in('course_id', courseIds)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Resolve storage paths to signed URLs
  return resolveResourceUrls((data as unknown as StudentResource[]) || [])
}

/**
 * Fetch resources for a specific lesson with signed URLs.
 * Used by the Lesson page tab.
 */
export async function getLessonResources(lessonId: string): Promise<StudentResource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, type, file_url, file_size, created_at')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Resolve storage paths to signed URLs
  return resolveResourceUrls((data as unknown as StudentResource[]) || [])
}

/**
 * Get the display icon for a resource type
 */
export const RESOURCE_ICONS: Record<string, string> = {
  PDF: '📄',
  Video: '🎬',
  Enlace: '🔗',
  Ejercicio: '📝',
  Plantilla: '📋',
  Archivo: '📎',
  Excel: '📊',
  Word: '📝',
}

export function getResourceIcon(type: string | null | undefined): string {
  return (type && RESOURCE_ICONS[type]) || '📎'
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/**
 * Detect resource type from MIME type or file extension.
 */
export function detectResourceType(mimeType: string, fileName?: string): string {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  const mime = (mimeType || '').toLowerCase()

  if (mime.includes('pdf') || ext === 'pdf') return 'PDF'
  if (mime.includes('spreadsheet') || mime.includes('excel') || ['xlsx', 'xls', 'csv'].includes(ext || '')) return 'Excel'
  if (mime.includes('word') || mime.includes('document') || ['docx', 'doc'].includes(ext || '')) return 'Word'
  if (mime.includes('video') || ['mp4', 'webm', 'mov'].includes(ext || '')) return 'Video'
  if (mime.includes('zip') || ['zip', 'rar', '7z'].includes(ext || '')) return 'Archivo'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) return 'Archivo'
  return 'Archivo'
}

/**
 * Generate signed URLs for resource files in batch.
 * Only storage paths (not starting with http or /) get signed URLs.
 * Returns null on failure so the UI shows "No disponible".
 */
async function resolveResourceUrls<T extends { file_url?: string | null }>(resources: T[]): Promise<T[]> {
  if (!resources || resources.length === 0) return resources

  // Separate storage paths from static/legacy URLs
  const storagePaths: string[] = []
  const pathToIndex = new Map<string, number>()

  resources.forEach((r, i) => {
    if (!r.file_url) return
    if (r.file_url.startsWith('http') || r.file_url.startsWith('/')) return
    storagePaths.push(r.file_url)
    pathToIndex.set(r.file_url, i)
  })

  if (storagePaths.length === 0) return resources

  // Batch generate signed URLs (expires in 1 hour)
  try {
    const { data, error } = await supabase.storage
      .from('resources')
      .createSignedUrls(storagePaths, 3600)

    if (error) throw error

    // Map signed URLs back to their resources
    if (data) {
      data.forEach(({ path, signedUrl }) => {
        if (!path) return
        const idx = pathToIndex.get(path)
        if (idx === undefined) return
        resources[idx].file_url = signedUrl || null
      })
    }
  } catch {
    // On failure, set storage paths to null so UI shows "No disponible"
    storagePaths.forEach(path => {
      const idx = pathToIndex.get(path)
      if (idx !== undefined) {
        resources[idx].file_url = null
      }
    })
  }

  return resources
}

/**
 * Upload a resource file to Supabase Storage and create a DB record.
 * Stores the INTERNAL storage path (not a public URL) for security.
 * The frontend resolves signed URLs at query time.
 */
export async function uploadResource({
  courseId,
  lessonId,
  file,
  title,
  type,
}: {
  courseId: string
  lessonId: string
  file: File
  title: string
  type: string
}): Promise<StudentResource & { file_url: string | null }> {
  // 1. Generate a unique file path inside the bucket
  const ext = file.name.split('.').pop()
  const cleanName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const filePath = `${courseId}/${lessonId}/${Date.now()}-${cleanName}.${ext}`

  // 2. Upload to storage (bucket is private — no public URL)
  const { error: uploadError } = await supabase.storage
    .from('resources')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const fileSize = file.size ? `${(file.size / 1024).toFixed(1)} KB` : null

  // 3. Insert DB record with the INTERNAL path only
  const { data, error: dbError } = await supabase
    .from('resources')
    .insert({
      lesson_id: lessonId,
      course_id: courseId,
      title,
      type,
      file_url: filePath, // ← ruta interna, NO URL pública
      file_size: fileSize,
    })
    .select('id, title, type, file_url, file_size, created_at')
    .single()

  if (dbError) {
    // Rollback: remove the uploaded file
    await supabase.storage.from('resources').remove([filePath])
    throw dbError
  }

  // 4. Return with signed URL for immediate use
  const signedUrl = await resolveResourceUrl(filePath)
  return { ...(data as StudentResource), file_url: signedUrl }
}

/**
 * Delete a resource (from storage + DB).
 * Supports both storage paths and legacy URLs.
 */
export async function deleteResource(resourceId: string, fileUrl?: string | null): Promise<void> {
  if (fileUrl) {
    let storagePath: string | null = null

    if (!fileUrl.startsWith('http') && !fileUrl.startsWith('/')) {
      // It's already a storage path — use directly
      storagePath = fileUrl
    } else if (fileUrl.startsWith('http')) {
      // Legacy full URL — extract path
      try {
        const url = new URL(fileUrl)
        const pathParts = url.pathname.split('/')
        const resourcesIdx = pathParts.findIndex(p => p === 'resources')
        if (resourcesIdx >= 0) {
          storagePath = pathParts.slice(resourcesIdx).join('/')
        }
      } catch {
        // URL parsing failed, skip storage deletion
      }
    }

    // Delete from storage if we got a path
    if (storagePath) {
      await supabase.storage.from('resources').remove([storagePath])
    }
  }

  // Remove DB record
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId)

  if (error) throw error
}

/**
 * Fetch resources for a specific course (for teacher/admin management).
 */
export async function getCourseResources(courseId: string): Promise<StudentResource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      id, title, type, file_url, file_size, created_at,
      lesson:lesson_id (id, title, sort_order)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as unknown as StudentResource[]) || []
}

/**
 * Resolve a single storage path to a signed URL.
 */
async function resolveResourceUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('resources')
      .createSignedUrls([filePath], 3600)
    if (error) throw error
    return data?.[0]?.signedUrl ?? null
  } catch {
    return null
  }
}
