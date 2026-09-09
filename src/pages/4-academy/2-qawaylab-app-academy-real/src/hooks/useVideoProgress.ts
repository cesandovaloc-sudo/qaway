import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProgress, isLocallyComplete } from '@/lib/services'
import { extractVideoId } from '@/lib/services/video'

const HEARTBEAT_INTERVAL = 15000
const API_CHECK_TIMEOUT = 10000

const YT_PLAYER_VARS = {
  controls: 0,
  rel: 0,
  modestbranding: 1,
  iv_load_policy: 3,
  cc_load_policy: 1,
  fs: 0,
  disablekb: 0,
  hl: 'es',
  playsinline: 1,
  origin: typeof window !== 'undefined' ? window.location.origin : '',
}

// ─── Tipos mínimos de la API de YouTube IFrame ───
declare global {
  interface Window {
    YT?: {
      loaded?: number
      PlayerState?: { PLAYING: number; PAUSED: number; ENDED: number }
      Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayerInstance
    }
    onYouTubeIframeAPIReady?: (() => void) | null
  }
}

interface YTPlayerInstance {
  getDuration: () => number
  getCurrentTime: () => number
  getVideoLoadedFraction?: () => number
  getVolume?: () => number
  isMuted?: () => boolean
  getPlaybackRate?: () => number
  getAvailablePlaybackRates?: () => number[]
  getPlaybackQuality?: () => string
  getAvailableQualityLevels?: () => string[]
  setVolume?: (vol: number) => void
  mute?: () => void
  unMute?: () => void
  setPlaybackRate?: (rate: number) => void
  setPlaybackQuality?: (quality: string) => void
  playVideo?: () => void
  pauseVideo?: () => void
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void
  destroy?: () => void
}

export interface VideoProgressState {
  playerReady: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  bufferedPct: number
  completed: boolean
  progressPct: number
  isFullscreen: boolean
  volume: number
  isMuted: boolean
  playbackRate: number
  availablePlaybackRates: number[]
  playbackQuality: string
  availableQualities: string[]
  togglePlay: () => void
  seekTo: (seconds: number) => void
  seekBy: (deltaSeconds: number) => void
  toggleMute: () => void
  setVolume: (nextVolume: number) => void
  setPlaybackRate: (nextRate: number) => void
  setPlaybackQuality: (nextQuality: string) => void
  toggleFullscreen: () => void
  playerRef: RefObject<YTPlayerInstance | null>
}

export function useVideoProgress(
  videoUrl: string | null,
  lessonId: string | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
  fullscreenTargetRef: RefObject<HTMLDivElement | null> = containerRef,
): VideoProgressState {
  const { user } = useAuth()
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPct, setBufferedPct] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    if (typeof localStorage === 'undefined') return 100
    const saved = localStorage.getItem('qaway_volume')
    return saved ? Number(saved) : 100
  })
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [availablePlaybackRates, setAvailablePlaybackRates] = useState<number[]>([1])
  const [playbackQuality, setPlaybackQualityState] = useState('auto')
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastHeartbeatRef = useRef(0)
  const apiLoadedRef = useRef(false)
  const onReadyFiredRef = useRef(false)
  const sendHeartbeatRef = useRef<(time: number, dur: number, forceComplete?: boolean) => Promise<void>>(
    async () => {},
  )

  const sendHeartbeat = useCallback(
    async (time: number, dur: number, forceComplete = false) => {
      if (!user?.id || !lessonId || !dur) return
      const timeInt = Math.floor(time)
      const durInt = Math.floor(dur)
      if (timeInt <= lastHeartbeatRef.current && !forceComplete) return
      lastHeartbeatRef.current = timeInt
      try {
        const result = await updateProgress(user.id, lessonId, timeInt, durInt)
        if (result?.completed) setCompleted(true)
      } catch (err) {
        console.error('Heartbeat error:', err)
      }
    },
    [user?.id, lessonId],
  )

  sendHeartbeatRef.current = sendHeartbeat

  useEffect(() => {
    if (apiLoadedRef.current) return
    if (window.YT && window.YT.Player) {
      apiLoadedRef.current = true
      return
    }

    apiLoadedRef.current = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)

    return () => {
      apiLoadedRef.current = false
      window.onYouTubeIframeAPIReady = null
    }
  }, [])

  useEffect(() => {
    if (!videoUrl || !lessonId || !containerRef?.current) return
    if (onReadyFiredRef.current) return

    const videoId = extractVideoId(videoUrl)
    if (!videoId) return

    let playerInstance: YTPlayerInstance | null = null
    let cancelled = false
    let attempts = 0
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let fallbackInterval: ReturnType<typeof setInterval> | null = null
    const maxAttempts = API_CHECK_TIMEOUT / 500

    function syncPlayerMeta(player: YTPlayerInstance | null) {
      if (!player) return
      setDuration(player.getDuration?.() || 0)
      setVolumeState(player.getVolume?.() ?? 100)
      setIsMuted(player.isMuted?.() ?? false)
      setPlaybackRateState(player.getPlaybackRate?.() ?? 1)
      setAvailablePlaybackRates(player.getAvailablePlaybackRates?.() || [1])
      setPlaybackQualityState(player.getPlaybackQuality?.() || 'auto')
      setAvailableQualities(player.getAvailableQualityLevels?.() || [])
    }

    function destroyPlayer(player: YTPlayerInstance | null) {
      if (!player?.destroy) return
      try {
        player.destroy()
      } catch {
        /* noop */
      }
    }

    function initPlayer() {
      if (cancelled) return
      if (!window.YT || !window.YT.Player) {
        attempts += 1
        if (attempts < maxAttempts) {
          retryTimeout = setTimeout(initPlayer, 500)
        }
        return
      }

      // Solo crear el reproductor si el contenedor sigue conectado al DOM:
      // al navegar entre lecciones el contenedor puede desaparecer antes de que
      // la API de YouTube termine de cargar, y crear el player ahí lanzaría un error
      if (!containerRef.current?.isConnected) return

      onReadyFiredRef.current = true
      try {
        const container = containerRef.current
        playerInstance = new window.YT.Player(container, {
          videoId,
          height: '100%',
          width: '100%',
          playerVars: YT_PLAYER_VARS,
          events: {
            onReady: () => {
              playerRef.current = playerInstance
              // Aplicar volumen guardado al reproductor de YouTube
              const savedVol = Number(localStorage.getItem('qaway_volume'))
              if (savedVol && savedVol >= 0 && savedVol <= 100) {
                playerInstance?.setVolume?.(savedVol)
              }
              setPlayerReady(true)
              syncPlayerMeta(playerInstance)
            },
            onStateChange: (event: { data: number }) => {
              const playing = event.data === window.YT?.PlayerState?.PLAYING
              setIsPlaying(playing)

              if (event.data === window.YT?.PlayerState?.ENDED) {
                const player = playerRef.current
                if (player) {
                  const time = player.getCurrentTime?.() || 0
                  const dur = player.getDuration?.() || 0
                  setCurrentTime(time)
                  setProgressPct(100)
                  sendHeartbeatRef.current(time, dur, true)
                  setCompleted(true)
                }
              }

              if (event.data === window.YT?.PlayerState?.PAUSED) {
                const player = playerRef.current
                if (player) {
                  const time = player.getCurrentTime?.() || 0
                  const dur = player.getDuration?.() || 0
                  setCurrentTime(time)
                  setProgressPct(dur > 0 ? Math.round((time / dur) * 100) : 0)
                  sendHeartbeatRef.current(time, dur)
                }
              }
            },
            onPlaybackRateChange: (event: { data: number }) => {
              setPlaybackRateState(event.data || 1)
            },
            onPlaybackQualityChange: (event: { data: string }) => {
              setPlaybackQualityState(event.data || 'auto')
            },
            onApiChange: () => {
              syncPlayerMeta(playerRef.current)
            },
          },
        })
      } catch (err) {
        console.error('Error creando reproductor de video:', err)
        onReadyFiredRef.current = false
      }
    }

    window.onYouTubeIframeAPIReady = () => initPlayer()

    if (window.YT && window.YT.loaded) {
      initPlayer()
    } else {
      fallbackInterval = setInterval(() => {
        if (cancelled) {
          if (fallbackInterval) clearInterval(fallbackInterval)
          return
        }
        attempts += 1
        if (window.YT && window.YT.loaded) {
          if (fallbackInterval) clearInterval(fallbackInterval)
          initPlayer()
        } else if (attempts >= maxAttempts) {
          if (fallbackInterval) clearInterval(fallbackInterval)
        }
      }, 500)
    }

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (fallbackInterval) clearInterval(fallbackInterval)
      window.onYouTubeIframeAPIReady = null
      onReadyFiredRef.current = false
      setPlayerReady(false)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setProgressPct(0)
      setBufferedPct(0)
      // Destrucción segura: si el contenedor ya no está en el DOM (navegación entre lecciones),
      // destroy() de YouTube puede lanzar una excepción que tumbaría toda la app
      destroyPlayer(playerRef.current || playerInstance)
      playerRef.current = null
    }
  }, [videoUrl, lessonId, containerRef])

  useEffect(() => {
    if (!playerRef.current || !playerReady) return

    const timeInterval = setInterval(() => {
      const player = playerRef.current
      if (!player?.getCurrentTime) return
      const time = player.getCurrentTime() || 0
      const dur = player.getDuration() || 0
      const loadedFraction = player.getVideoLoadedFraction?.() || 0
      setCurrentTime(time)
      setDuration(dur)
      setProgressPct(dur > 0 ? Math.round((time / dur) * 100) : 0)
      setBufferedPct(Math.max(0, Math.min(100, Math.round(loadedFraction * 100))))
      setVolumeState(player.getVolume?.() ?? 100)
      setIsMuted(player.isMuted?.() ?? false)
    }, 500)

    return () => clearInterval(timeInterval)
  }, [playerReady])

  useEffect(() => {
    if (!isPlaying || !playerRef.current || !playerReady) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(async () => {
      const player = playerRef.current
      if (!player?.getCurrentTime) return
      const time = player.getCurrentTime()
      const dur = player.getDuration() || 1
      const pct = Math.round((time / dur) * 100)
      setProgressPct(pct)
      await sendHeartbeatRef.current(time, dur)
      if (isLocallyComplete(time, dur)) {
        setCompleted(true)
      }
    }, HEARTBEAT_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, playerReady])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo?.()
    } else {
      player.playVideo?.()
    }
  }, [isPlaying])

  const seekTo = useCallback((seconds: number) => {
    const player = playerRef.current
    if (!player?.seekTo) return
    const safeSeconds = Math.max(0, Math.min(player.getDuration?.() || 0, seconds))
    player.seekTo(safeSeconds, true)
    setCurrentTime(safeSeconds)
  }, [])

  const seekBy = useCallback((deltaSeconds: number) => {
    const player = playerRef.current
    if (!player?.getCurrentTime) return
    const time = player.getCurrentTime() || 0
    const dur = player.getDuration() || 0
    const target = Math.max(0, Math.min(dur, time + deltaSeconds))
    player.seekTo?.(target, true)
    setCurrentTime(target)
    setProgressPct(dur > 0 ? Math.round((target / dur) * 100) : 0)
  }, [])

  const toggleMute = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (player.isMuted?.()) {
      player.unMute?.()
      setIsMuted(false)
      setVolumeState(player.getVolume?.() ?? 100)
    } else {
      player.mute?.()
      setIsMuted(true)
    }
  }, [])

  const setVolume = useCallback((nextVolume: number) => {
    const player = playerRef.current
    if (!player?.setVolume) return
    const safeVolume = Math.max(0, Math.min(100, nextVolume))
    player.setVolume(safeVolume)
    if (safeVolume === 0) {
      player.mute?.()
      setIsMuted(true)
    } else {
      player.unMute?.()
      setIsMuted(false)
    }
    setVolumeState(safeVolume)
    localStorage.setItem('qaway_volume', String(safeVolume))
  }, [])

  const setPlaybackRate = useCallback((nextRate: number) => {
    const player = playerRef.current
    if (!player?.setPlaybackRate) return
    player.setPlaybackRate(nextRate)
    setPlaybackRateState(nextRate)
  }, [])

  const setPlaybackQuality = useCallback((nextQuality: string) => {
    const player = playerRef.current
    if (!player?.setPlaybackQuality) return
    player.setPlaybackQuality(nextQuality)
    setPlaybackQualityState(nextQuality)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = fullscreenTargetRef?.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [fullscreenTargetRef])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return {
    playerReady,
    isPlaying,
    currentTime,
    duration,
    bufferedPct,
    completed,
    progressPct,
    isFullscreen,
    volume,
    isMuted,
    playbackRate,
    availablePlaybackRates,
    playbackQuality,
    availableQualities,
    togglePlay,
    seekTo,
    seekBy,
    toggleMute,
    setVolume,
    setPlaybackRate,
    setPlaybackQuality,
    toggleFullscreen,
    playerRef,
  }
}
