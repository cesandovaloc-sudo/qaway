import { supabase } from '@/lib/supabase'
import { extractVideoId } from './video'

export interface TranscriptSegment {
  offset: number
  text: string
}

export interface TranscriptResult {
  success: boolean
  transcript?: string
  error?: string
}

/**
 * Obtiene la transcripción de una lección desde la BD
 */
export async function getLessonTranscript(lessonId: string): Promise<{ transcript: string | null; transcript_status: string | null } | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('transcript, transcript_status')
    .eq('id', lessonId)
    .single()

  if (error) throw error
  return data
}

/**
 * Guarda la transcripción de una lección en la BD
 */
export async function saveLessonTranscript(lessonId: string, transcript: string, status: 'manual' | 'auto' = 'manual'): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({
      transcript,
      transcript_status: status,
    })
    .eq('id', lessonId)

  if (error) throw error
}

/**
 * Llama a la Edge Function de Supabase para obtener la transcripción
 * desde YouTube automáticamente.
 */
export async function autoFetchTranscript(videoUrl: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) {
    return { success: false, error: 'No se pudo extraer el ID del video' }
  }

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    if (!supabaseUrl) {
      return { success: false, error: 'Supabase URL no configurada' }
    }
    const response = await fetch(
      `${supabaseUrl}/functions/v1/fetch-transcript?videoId=${videoId}`,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: text || 'Error al obtener transcripción' }
    }

    const data = await response.json()
    return { success: true, transcript: data.transcript }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) || 'Error de conexión con el servidor' }
  }
}

/**
 * Formatea un array de segmentos de transcripción a texto plano
 * con timestamps
 */
export function formatTranscriptToText(transcript: unknown): string {
  if (!transcript || typeof transcript === 'string') return (transcript as string) || ''

  // Si es un array de objetos { text, duration, offset }
  if (Array.isArray(transcript)) {
    return transcript
      .map((seg) => {
        const time = formatTime(seg.offset)
        return `[${time}] ${seg.text}`
      })
      .join('\n')
  }

  // Si es un objeto con segments
  const withSegments = transcript as { segments?: Array<{ offset?: number; start?: number; text: string }> }
  if (withSegments.segments && Array.isArray(withSegments.segments)) {
    return withSegments.segments
      .map((seg) => {
        const time = formatTime(seg.offset || seg.start || 0)
        return `[${time}] ${seg.text}`
      })
      .join('\n')
  }

  return String(transcript)
}

/**
 * Parsea texto plano de transcripción a segmentos con timestamp
 */
export function parseTranscriptToSegments(text: string): TranscriptSegment[] {
  if (!text) return []

  const lines = text.split('\n').filter(Boolean)
  return lines.map((line) => {
    const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      return {
        offset: minutes * 60 + seconds,
        text: match[3],
      }
    }
    return { offset: 0, text: line }
  })
}

function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
