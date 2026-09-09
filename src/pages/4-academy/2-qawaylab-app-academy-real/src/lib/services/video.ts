/**
 * Extrae el ID de un video de YouTube desde diferentes formatos de URL
 */
export function extractVideoId(url: string | null | undefined) {
  if (!url) return null
  const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return shortMatch[1]
  return null
}

/**
 * Formatea segundos a m:ss
 */
export function formatTime(seconds: number | null | undefined) {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
