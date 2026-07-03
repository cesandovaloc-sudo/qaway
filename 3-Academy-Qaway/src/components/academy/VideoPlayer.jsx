import { useState, useRef, useEffect, useCallback } from 'react'
import { getVideoProgress, saveVideoProgress, markLessonCompleted } from '@/data/internal'

export default function VideoPlayer({
  url,
  provider = 'youtube',
  title = '',
  lessonId = '',
  focusMode = false,
  onToggleFocus,
  onVideoEnded,
  autoplay: initialAutoplay = true,
}) {
  const [loaded, setLoaded] = useState(false)
  const [autoplay, setAutoplay] = useState(() => {
    const saved = localStorage.getItem('qaway-autoplay')
    return saved !== null ? saved === 'true' : initialAutoplay
  })
  const [videoEnded, setVideoEnded] = useState(false)
  const [hasProgress, setHasProgress] = useState(false)
  const iframeRef = useRef(null)
  const progressInterval = useRef(null)

  const embedUrl = provider === 'youtube' && url
    ? (url.includes('?') ? url + '&autoplay=1&enablejsapi=1' : url + '?autoplay=1&enablejsapi=1')
    : null

  // Cargar progreso guardado
  useEffect(() => {
    if (!lessonId) return
    const saved = getVideoProgress(lessonId)
    if (saved.watched || saved.completed) {
      setHasProgress(true)
    }
  }, [lessonId])

  // Guardar progreso periódicamente
  useEffect(() => {
    if (!lessonId || !loaded) return
    progressInterval.current = setInterval(() => {
      const current = getVideoProgress(lessonId)
      saveVideoProgress(lessonId, { ...current, watched: true, lastTime: Date.now() })
    }, 15000) // cada 15s

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [lessonId, loaded])

  const toggleAutoplay = useCallback(() => {
    setAutoplay(prev => {
      const next = !prev
      localStorage.setItem('qaway-autoplay', String(next))
      return next
    })
  }, [])

  const handleEnded = useCallback(() => {
    setVideoEnded(true)
    if (lessonId) markLessonCompleted(lessonId)
    if (onVideoEnded) onVideoEnded()
  }, [lessonId, onVideoEnded])

  // Listener for iframe message (YouTube ended event simulation)
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data || typeof e.data !== 'string') return
      if (e.data.includes('ended')) {
        handleEnded()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleEnded])

  // Also detect end by time — since YouTube API via iframe is limited without SDK
  // we rely on the onEnded callback being passed from parent or manual detection

  return (
    <div className={`relative bg-[#0d0f0d] w-full transition-all duration-500 ${
      focusMode ? 'fixed inset-0 z-50' : 'aspect-video'
    }`}>
      {/* Progress bar (watched indicator) */}
      {hasProgress && !focusMode && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#ff4b0b] text-white">
            Visto
          </span>
        </div>
      )}

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0f0d]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#ff4b0b] border-t-transparent animate-spin mx-auto" />
            <p className="mt-3 text-xs text-[#666860]">Cargando video...</p>
          </div>
        </div>
      )}

      {embedUrl ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || 'Video de la lección'}
          className={`w-full h-full ${focusMode ? 'max-h-screen' : ''}`}
          style={focusMode ? { height: '100dvh' } : undefined}
          allow={`accelerometer; ${autoplay ? 'autoplay;' : ''} clipboard-write; encrypted-media; gyroscope; picture-in-picture`}
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center bg-[#0d0f0d] ${focusMode ? 'h-screen' : ''}`}>
          <p className="text-xs text-[#666860]">
            {url ? 'Formato de video no soportado' : 'Video próximamente'}
          </p>
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent ${
        videoEnded ? 'opacity-100' : 'opacity-0 hover:opacity-100'
      } transition-opacity`}>
        <div className="flex items-center justify-between">
          {/* Autoplay toggle */}
          <button
            onClick={toggleAutoplay}
            className={`flex items-center gap-1.5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
              autoplay ? 'text-white/90' : 'text-white/50'
            }`}
            title={autoplay ? 'Autoreproducción activada' : 'Autoreproducción desactivada'}
          >
            <span className={`w-2.5 h-2.5 rounded-full border ${
              autoplay ? 'bg-[#ff4b0b] border-[#ff4b0b]' : 'border-white/40'
            }`} />
            Autoplay
          </button>

          {/* Focus mode toggle */}
          {onToggleFocus && (
            <button
              onClick={onToggleFocus}
              className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors"
              title={focusMode ? 'Salir de modo enfoque' : 'Modo enfoque'}
            >
              {focusMode ? '⊘ Salir' : '⛶ Enfoque'}
            </button>
          )}
        </div>
      </div>

      {/* Video ended overlay */}
      {videoEnded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <p className="text-white/80 text-xs font-semibold tracking-wider uppercase">
            Lección completada
          </p>
        </div>
      )}
    </div>
  )
}
