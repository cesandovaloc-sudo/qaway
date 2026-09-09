// Supabase Edge Function: fetch-transcript
// Obtiene la transcripción de un video de YouTube automáticamente
//
// Deploy: supabase functions deploy fetch-transcript --no-verify-jwt
// Dependencias: youtube-transcript (agregar a import_map.json)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface TranscriptSegment {
  text: string
  duration: number
  offset: number
}

interface TranscriptResponse {
  success: boolean
  transcript?: string
  segments?: TranscriptSegment[]
  error?: string
  hasTranscript: boolean
}

// Función para obtener transcripción vía youtubetranscript.com API
async function fetchTranscriptFromAPI(videoId: string): Promise<TranscriptSegment[] | null> {
  try {
    // Opción 1: YouTube timedtext API (funciona sin API key si el video tiene captions públicas)
    const url = `https://www.youtube.com/watch?v=${videoId}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QawayBot/1.0)',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    // Buscar la URL de los subtítulos en el HTML de la página
    // YouTube incrusta los datos de captions en un script con la variable ytInitialPlayerResponse
    const captionsMatch = html.match(/"captionTracks":\s*\[(.*?)\]/)
    if (!captionsMatch) return null

    // Extraer la primera URL de captions (priorizar español, luego inglés)
    let captionsUrl = ''
    const esMatch = captionsMatch[1].match(/"languageCode":"es".*?"baseUrl":"([^"]+)"/)
    const enMatch = captionsMatch[1].match(/"languageCode":"en".*?"baseUrl":"([^"]+)"/)
    const anyMatch = captionsMatch[1].match(/"baseUrl":"([^"]+)"/)

    if (esMatch) {
      captionsUrl = esMatch[1].replace(/\\u0026/g, '&')
    } else if (enMatch) {
      captionsUrl = enMatch[1].replace(/\\u0026/g, '&')
    } else if (anyMatch) {
      captionsUrl = anyMatch[1].replace(/\\u0026/g, '&')
    }

    if (!captionsUrl) return null

    // Obtener el XML de subtítulos
    const captionsResponse = await fetch(captionsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!captionsResponse.ok) return null

    const captionsXml = await captionsResponse.text()

    // Parsear el XML a segmentos
    const segments: TranscriptSegment[] = []
    const textMatch = captionsXml.matchAll(/<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g)

    for (const match of textMatch) {
      const start = parseFloat(match[1])
      const dur = parseFloat(match[2])
      const text = match[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\n/g, ' ')

      segments.push({
        text: text.trim(),
        duration: dur,
        offset: start,
      })
    }

    return segments.length > 0 ? segments : null
  } catch {
    return null
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function segmentsToPlainText(segments: TranscriptSegment[]): string {
  return segments
    .map((seg) => `[${formatTime(seg.offset)}] ${seg.text}`)
    .join('\n')
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const videoId = url.searchParams.get('videoId')

    if (!videoId) {
      const response: TranscriptResponse = {
        success: false,
        error: 'Falta el parámetro videoId',
        hasTranscript: false,
      }
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Intentar obtener la transcripción
    const segments = await fetchTranscriptFromAPI(videoId)

    if (!segments || segments.length === 0) {
      const response: TranscriptResponse = {
        success: true,
        hasTranscript: false,
        transcript: '',
        segments: [],
        error: 'El video no tiene transcripción disponible. Sube una manualmente.',
      }
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const plainText = segmentsToPlainText(segments)

    const response: TranscriptResponse = {
      success: true,
      hasTranscript: true,
      transcript: plainText,
      segments,
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const response: TranscriptResponse = {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
      hasTranscript: false,
    }
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
