import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Send,
  Mail,
  Sparkles,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Headphones,
  RotateCcw,
  ChevronRight,
  Copy,
  Check,
  MessageCircle,
  Linkedin,
  Share2,
} from 'lucide-react'
import { visibleArticles } from './BlogPage'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

function sanitizeAndDecodeContent(htmlContent) {
  if (!htmlContent) return ''
  let decoded = htmlContent
  // Desescapar entidades HTML que TipTap serializa en bloques personalizados
  if (decoded.includes('&lt;') && decoded.includes('&gt;')) {
    decoded = decoded
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
  }
  return decoded
}

export default function ArticleDetailPage() {
  useSetNavbarVariant('light')
  const { id } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const articleRef = useRef(null)

  // Estado del artículo (Caché SWR instantáneo a 0ms de Supabase con fallback local)
  const [article, setArticle] = useState(() => {
    try {
      const cached = localStorage.getItem('qaway_blog_articles_cache')
      if (cached) {
        const list = JSON.parse(cached)
        const found = list.find((art) => art.id === id || art.slug === id)
        if (found) return found
      }
    } catch (e) {}
    return visibleArticles.find((art) => art.id === id) || null
  })

  const [loadingArticle, setLoadingArticle] = useState(() => {
    try {
      const cached = localStorage.getItem('qaway_blog_articles_cache')
      if (cached) {
        const list = JSON.parse(cached)
        const found = list.find((art) => art.id === id || art.slug === id)
        if (found) return false
      }
    } catch (e) {}
    return !visibleArticles.some((art) => art.id === id)
  })

  // Estados para comentarios de Supabase
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)

  // Estados del formulario de comentarios
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentSubmitted, setCommentSubmitted] = useState(false)
  const [commentError, setCommentError] = useState(null)

  // Estados del boletín de suscripción
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [newsletterError, setNewsletterError] = useState(null)

  // =========================================================================
  // REPRODUCTOR DE AUDIO DE LECTURA (WEB SPEECH API / SÍNTESIS DE VOZ)
  // =========================================================================
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isPausedAudio, setIsPausedAudio] = useState(false)
  const [audioSpeed, setAudioSpeed] = useState(1.0)
  const [audioProgress, setAudioProgress] = useState(0)
  const chunksRef = useRef([])
  const currentChunkIdxRef = useRef(0)
  const isSpeakingRef = useRef(false)

  // Compartir en Redes Sociales
  const [copied, setCopied] = useState(false)
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`${article?.title || 'Artículo de Blog'} - ${window.location.href}`)
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
    }
  }

  const handleShareLinkedIn = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href)
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
    }
  }

  const handleShareX = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(article?.title || 'Artículo de Blog')
      const url = encodeURIComponent(window.location.href)
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    }
  }

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href)
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    }
  }

  // Cargar artículo si no está en memoria local
  useEffect(() => {
    async function loadArticle() {
      const local = visibleArticles.find((art) => art.id === id)
      if (local) {
        setArticle(local)
        return
      }

      setLoadingArticle(true)
      try {
        let { data, error } = await supabase
          .from('posts')
          .select('*')
          .or(`slug.eq.${id},id.eq.${id}`)
          .single()

        if (error || !data) {
          const res = await supabase
            .from('blog_articles')
            .select('*')
            .or(`slug.eq.${id},id.eq.${id}`)
            .single()
          if (!res.error && res.data) {
            data = res.data
            error = null
          }
        }

        if (!error && data) {
          setArticle({
            id: data.slug || data.id,
            category: data.category,
            categoryLabel: data.category || data.category_label || 'General',
            formatLabel: data.format_label || 'Guía',
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content_html || data.content || data.body || '',
            date: data.published_at ? new Date(data.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : data.date || 'Reciente',
            readTime: data.reading_time ? `${data.reading_time} min` : data.read_time || '4 min',
            publishedAt: data.published_at || data.created_at,
            public: data.status === 'publicado' || data.public !== false,
            featured: data.featured ? { order: data.featured_order || 1, label: data.featured_label || 'Destacado' } : null,
            image: data.cover_url || data.image || data.cover_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
            headerLayout: data.header_layout || data.headerLayout || 'split',
            audioUrl: data.audio_url || null,
          })
        }
      } catch (err) {
        console.warn('[Article] Error cargando artículo de Supabase:', err)
      } finally {
        setLoadingArticle(false)
      }
    }

    loadArticle()
  }, [id])

  // Precargar lista de voces del navegador al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      const onVoicesReady = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.onvoiceschanged = onVoicesReady
      return () => {
        if (window.speechSynthesis.onvoiceschanged === onVoicesReady) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    }
  }, [])

  // Detener audio al desmontar o cambiar de artículo
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      isSpeakingRef.current = false
    }
  }, [id])

  const playChunk = (index) => {
    if (!isSpeakingRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const chunks = chunksRef.current
    if (!chunks || index >= chunks.length) {
      setIsPlayingAudio(false)
      setIsPausedAudio(false)
      isSpeakingRef.current = false
      setAudioProgress(100)
      setTimeout(() => setAudioProgress(0), 1200)
      return
    }

    currentChunkIdxRef.current = index
    const textToSpeak = chunks[index]
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'es-ES'
    utterance.rate = audioSpeed
    utterance.pitch = 1.0

    // Buscar y asignar la mejor voz en español
    const allVoices = window.speechSynthesis.getVoices() || []
    const spanishVoices = allVoices.filter((v) => 
      v.lang && (v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().includes('es-') || v.lang.toLowerCase().includes('es_'))
    )
    
    if (spanishVoices.length > 0) {
      const bestFemaleVoice = 
        spanishVoices.find((v) => /(natural|neural|online)/i.test(v.name) && /(paloma|elena|salma|dalia|ximena|monica|paulina|female|mujer)/i.test(v.name))
        || spanishVoices.find((v) => /(natural|neural|online|google)/i.test(v.name))
        || spanishVoices.find((v) => /google español/i.test(v.name))
        || spanishVoices.find((v) => /(paloma|elena|salma|dalia|ximena|monica|paulina|laura|marta|sofia|victoria|lucia|conchita|mia|sabina|helena)/i.test(v.name))
        || spanishVoices[0]

      if (bestFemaleVoice) {
        utterance.voice = bestFemaleVoice
      }
    }

    utterance.onend = () => {
      if (!isSpeakingRef.current) return
      const nextIdx = index + 1
      const progress = Math.min(100, Math.round((nextIdx / chunks.length) * 100))
      setAudioProgress(progress)
      playChunk(nextIdx)
    }

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('[Audio Speech Error]', e)
        setIsPlayingAudio(false)
        setIsPausedAudio(false)
        isSpeakingRef.current = false
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  const startSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !article) return

    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()

    // Limpiar texto de HTML para una lectura fluida
    const cleanContent = (article.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const fullTextToRead = `${article.title}. ${article.excerpt ? article.excerpt + '.' : ''} ${cleanContent}`

    // Dividir en oraciones naturales de menos de 150 caracteres para evitar limitaciones del navegador
    const sentences = fullTextToRead.match(/[^.!?\n]+[.!?\n]*/g) || [fullTextToRead]
    const chunks = []
    let buffer = ''

    sentences.forEach((s) => {
      const trimmed = s.trim()
      if (!trimmed) return
      if ((buffer + ' ' + trimmed).length < 160) {
        buffer += (buffer ? ' ' : '') + trimmed
      } else {
        if (buffer) chunks.push(buffer)
        buffer = trimmed
      }
    })
    if (buffer) chunks.push(buffer)

    if (chunks.length === 0) return

    chunksRef.current = chunks
    currentChunkIdxRef.current = 0
    isSpeakingRef.current = true
    setIsPlayingAudio(true)
    setIsPausedAudio(false)
    setAudioProgress(0)

    playChunk(0)
  }

  const togglePlayAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (!isPlayingAudio) {
      startSpeech()
    } else if (isPausedAudio) {
      window.speechSynthesis.resume()
      setIsPausedAudio(false)
    } else {
      window.speechSynthesis.pause()
      setIsPausedAudio(true)
    }
  }

  const stopAudio = () => {
    isSpeakingRef.current = false
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    chunksRef.current = []
    currentChunkIdxRef.current = 0
    setIsPlayingAudio(false)
    setIsPausedAudio(false)
    setAudioProgress(0)
  }

  const changeAudioSpeed = (speed) => {
    setAudioSpeed(speed)
    if (isPlayingAudio && !isPausedAudio) {
      startSpeech()
    }
  }

  // Comentarios iniciales de respaldo en caso de que no haya conexión a Supabase o esté vacío
  const fallbackComments = [
    {
      id: 'mock-1',
      name: 'María Silva',
      comment: '¡Excelente explicación! Ya logré integrar mi primer webhook entre Stripe y Make. El truco de ChatGPT para procesar los datos fiscales me ahorró muchísimo tiempo de configuración manual.',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'mock-2',
      name: 'Roberto K.',
      comment: 'Muy buen artículo. ¿Recomiendan usar la API de WhatsApp oficial o algún proveedor externo para los envíos automatizados desde el CRM de Notion? Estaré atento a sus tutoriales.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Cargar comentarios desde Supabase
  useEffect(() => {
    async function loadComments() {
      setLoadingComments(true)
      try {
        const { data, error } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('article_id', id)
          .eq('approved', true)
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setComments(data)
        } else {
          setComments(fallbackComments)
        }
      } catch (err) {
        console.error('Error al cargar comentarios:', err)
        setComments(fallbackComments)
      } finally {
        setLoadingComments(false)
      }
    }
    loadComments()

    // Reiniciar estados de formularios al cambiar de artículo
    setCommentSubmitted(false)
    setNewsletterSubmitted(false)
    setCommentError(null)
    setNewsletterError(null)
  }, [id])

  // Escuchar el progreso de scroll respecto al artículo
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      
      const { top, bottom, height } = articleRef.current.getBoundingClientRect()
      // La altura visible del viewport
      const windowHeight = window.innerHeight
      
      // Si el artículo aún no entra en pantalla
      if (top > windowHeight) {
        setScrollProgress(0)
        return
      }
      
      // La distancia que hemos scrolleado dentro del artículo
      // (top es negativo o menor a windowHeight cuando ya estamos bajando)
      const scrolled = windowHeight - top
      // Para evitar que sea más del 100%
      const progress = Math.min(Math.max((scrolled / height) * 100, 0), 100)
      
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Ejecutar una vez para inicializar
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [article])

  // Enviar correo de notificación a qaway.myc@gmail.com vía Web3Forms
  const sendEmailNotification = async (subject, messageDetails) => {
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    if (!accessKey) {
      console.warn('[Web3Forms] No se pudo enviar la copia por correo porque VITE_WEB3FORMS_ACCESS_KEY no está configurado.')
      return
    }
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: subject,
          from_name: 'Qaway Lab Web',
          to_email: 'qaway.myc@gmail.com',
          message: messageDetails
        })
      })
    } catch (err) {
      console.error('Error enviando notificación por correo:', err)
    }
  }

  // Enviar comentario a Supabase y notificar
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    setCommentSubmitting(true)
    setCommentError(null)

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert([
          {
            article_id: id,
            name: commentName,
            email: commentEmail,
            comment: commentText,
            approved: false
          }
        ])

      if (error) throw error

      // Notificación por correo
      const emailSubject = `Nuevo comentario en el Blog: "${article?.title || id}"`
      const emailBody = `Se ha recibido un nuevo comentario para moderar.\n\n` +
        `Artículo: ${article?.title || id}\n` +
        `Nombre: ${commentName}\n` +
        `Correo: ${commentEmail}\n` +
        `Comentario: ${commentText}\n\n` +
        `Este comentario no se mostrará públicamente hasta que lo apruebes en Supabase (campo approved = true).`

      await sendEmailNotification(emailSubject, emailBody)

      setCommentSubmitted(true)
      setCommentText('')
    } catch (err) {
      console.error('Error al comentar:', err)
      setCommentError(err.message || 'Error al enviar el comentario. Inténtalo de nuevo.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  // Enviar suscripción a Supabase y notificar
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterSubmitting(true)
    setNewsletterError(null)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: newsletterEmail }])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Esta dirección de correo ya está registrada en el boletín.')
        }
        throw error
      }

      // Notificación por correo
      const emailSubject = `Nueva suscripción al Boletín Semanal`
      const emailBody = `Se ha registrado una nueva suscripción al Boletín Semanal de Qaway Lab.\n\n` +
        `Correo: ${newsletterEmail}\n` +
        `Fecha: ${new Date().toLocaleString()}`

      await sendEmailNotification(emailSubject, emailBody)

      setNewsletterSubmitted(true)
      setNewsletterEmail('')
    } catch (err) {
      console.error('Error en suscripción:', err)
      setNewsletterError(err.message || 'Error al procesar la suscripción. Inténtalo de nuevo.')
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  // Skeleton de carga suave (solo si se ingresa por link directo sin caché previa)
  if (loadingArticle && !article) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-[120px] pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 animate-pulse space-y-8">
          <div className="h-5 w-28 bg-black/10 rounded-full" />
          <div className="h-12 w-3/4 bg-black/10 rounded-xl" />
          <div className="h-4 w-48 bg-black/10 rounded" />
          <div className="aspect-[16/9] w-full bg-black/10 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Si la red confirmó que no existe el artículo
  if (!loadingArticle && !article) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 mt-[73px]">
        <div className="text-center max-w-md bg-white p-8 rounded-[15px] border border-zinc-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-950 mb-2">Artículo no encontrado</h2>
          <p className="text-zinc-500 text-sm mb-6">El artículo que estás buscando no existe o ha sido movido.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3 rounded-[15px] font-bold uppercase tracking-wider text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Blog
          </Link>
        </div>
      </div>
    )
  }

  // Obtener artículos recomendados (excluyendo el actual, máximo 3)
  const recommendedArticles = visibleArticles
    .filter(art => art.id !== article.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pt-[100px] pb-24 relative">
      
      {/* Barra de progreso de lectura pegajosa en el techo exacto de la pantalla */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-200/80 z-50">
        <div 
          className="h-full bg-linear-to-r from-qaway-accent to-qaway-accent-dark transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* 1. BREADCRUMBS EDITORIAL (ESTILO HUBSPOT) */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-2 text-xs font-semibold text-zinc-500"
        >
          <Link to="/" className="hover:text-[#ff4b0b] transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
          <Link to="/blog" className="hover:text-[#ff4b0b] transition-colors">Blog</Link>
          {article.categoryLabel && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-zinc-950 font-bold">{article.categoryLabel}</span>
            </>
          )}
        </motion.div>

        {/* 2. CABECERA EDITORIAL COMPLETA */}
        <div className="mb-8 max-w-4xl">
          {/* Categoría Badge */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#ff4b0b]/10 text-[#ff4b0b] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff4b0b]/20 mb-3 font-mono"
          >
            {article.categoryLabel}
          </motion.span>

          {/* Título Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-[46px] font-black text-zinc-950 tracking-tight mb-5 leading-[1.12]"
          >
            {article.title}
          </motion.h1>

          {/* Ficha de Autor y Metadatos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 text-xs sm:text-[13px] text-zinc-600 mb-6 font-medium"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ff703d] to-[#ff4b0b] flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
                Q
              </div>
              <span>
                Escrito por:{' '}
                <strong className="text-zinc-950 underline decoration-[#ff4b0b] decoration-2 underline-offset-4">
                  Qaway Lab
                </strong>
              </span>
            </div>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5 text-zinc-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#ff4b0b]" /> {article.date}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5 text-zinc-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#ff4b0b]" /> {article.readTime}
            </span>
          </motion.div>
        </div>

        {/* 2. BARRA DE ACCIONES AL TOPE DE ANCHO (AUDIO + COMPARTIR) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-5 rounded-2xl bg-white border border-black/5 shadow-2xs mb-8 w-full"
        >
          {/* Reproductor de Audio */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-zinc-950 text-white hover:bg-zinc-800 px-4 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isPlayingAudio && !isPausedAudio ? (
                <Pause className="h-3.5 w-3.5 text-[#ff4b0b] fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 text-[#ff4b0b] fill-current" />
              )}
              <span>{isPlayingAudio ? (isPausedAudio ? 'Pausado' : `Escuchando ${audioProgress}%`) : 'Escuchar audio'}</span>
            </button>

            {isPlayingAudio && (
              <div className="inline-flex items-center gap-1">
                {[1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => changeAudioSpeed(speed)}
                    className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${
                      audioSpeed === speed ? 'bg-[#ff4b0b] text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
                <button
                  type="button"
                  onClick={stopAudio}
                  className="rounded px-2 py-0.5 text-xs font-bold text-red-500 hover:bg-red-50"
                  title="Detener audio"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Botones de Compartir con Redes Sociales Oficiales */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <span className="text-zinc-400 mr-1 text-xs font-mono uppercase tracking-wider hidden sm:inline">Compartir:</span>
            
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              title="Compartir en WhatsApp"
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366] text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-95"
            >
              <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.179-.556-1.503-.625-2.455-2.167-2.529-2.267-.074-.1-6.17-8.196.02-1.378.334-.614.67-.629.932-.629.176 0 .373.003.535.011.174.009.406-.066.634.48.238.573.811 1.979.882 2.124.072.145.12.316.024.509-.095.193-.143.313-.286.485-.143.173-.3.386-.429.518-.143.144-.292.3-.125.588.167.288.742 1.226 1.593 1.984 1.096.977 2.02 1.279 2.308 1.423.287.144.455.12.624-.073.167-.193.717-.834.908-1.12.19-.288.381-.24.644-.144.263.096 1.671.787 1.958.931.287.144.478.216.549.336.072.12.072.697-.072 1.102z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.637 0-3.153-.497-4.42-1.353l-.317-.213-3.284.862.877-3.201-.233-.37A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
              </svg>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              title="Compartir en LinkedIn"
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 hover:text-[#0A66C2] text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-95"
            >
              <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
              </svg>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={handleShareX}
              title="Compartir en X (Twitter)"
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/10 hover:border-black/40 hover:text-black text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-95"
            >
              <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={handleShareFacebook}
              title="Compartir en Facebook"
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:text-[#1877F2] text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs group active:scale-95"
            >
              <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Copiar Enlace */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar enlace"
              className="p-2 rounded-xl border border-black/10 hover:border-[#ff4b0b] hover:text-[#ff4b0b] bg-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs group active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold hidden md:inline">Copiar link</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 3. FILA DE PORTADA 16:9 + BLOQUE LATERAL DE LA MISMA ALTURA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch">
          
          {/* Imagen de Portada */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="lg:col-span-8 relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-black/10 shadow-sm"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Bloque Lateral con la misma altura que la imagen */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-[#ff4b0b]/25 bg-gradient-to-br from-[#fff9f6] via-[#fff2eb] to-[#ffe7d9] p-6 sm:p-7 shadow-xs"
          >
            <div>
              <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#ff4b0b] bg-[#ff4b0b]/10 px-3 py-1 rounded-md mb-3 font-mono">
                Recurso Destacado
              </div>
              <h4 className="text-base sm:text-lg font-black text-zinc-950 mb-2 leading-snug">
                Guía y Prompts de IA para Negocios
              </h4>
              <p className="text-[13px] text-zinc-600 leading-relaxed mb-4">
                Maximiza la productividad de tu equipo y automatiza tareas repetitivas con nuestras plantillas listas para usar.
              </p>
            </div>
            <div>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff703d] to-[#ff4b0b] hover:from-[#ff5a22] hover:to-[#e03d00] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-[#ff4b0b]/25 transition-all cursor-pointer"
              >
                Descargar Guía Gratis <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* CONTENEDOR DE DOS COLUMNAS OPTIMIZADO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
          
          {/* COLUMNA IZQUIERDA: Articulo + Comentarios (70%) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Cuerpo del Artículo */}
            <motion.article
              ref={articleRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-zinc-200/80 rounded-[15px] p-8 md:p-10 shadow-xs"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeAndDecodeContent(article.content) }} 
                className="blog-content blog-prose w-full"
              />
            </motion.article>

            {/* CTA Dinámico del Artículo */}
            {article.relatedCta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-950 border border-zinc-800 rounded-[15px] p-8 md:p-10 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,210,0,0.1),transparent_50%)] pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-qaway-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img 
                        src={article.relatedCta.image} 
                        alt={article.relatedCta.title}
                        className="w-48 h-auto object-contain drop-shadow-2xl group-hover:-translate-y-2 transition-transform duration-500 relative z-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 text-center md:text-left space-y-4">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {article.relatedCta.title}
                    </h3>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                      {article.relatedCta.description}
                    </p>
                    <div className="pt-2">
                      <Link 
                        to={article.relatedCta.link}
                        className="inline-flex items-center gap-2 bg-qaway-accent hover:bg-[#E5BE3A] text-black font-extrabold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-qaway-accent/20"
                      >
                        {article.relatedCta.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sección de Comentarios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white border border-zinc-200/80 rounded-[15px] p-8 md:p-10 shadow-xs space-y-6"
            >
              <h3 className="text-base font-extrabold uppercase tracking-widest text-zinc-800 flex items-center gap-2 border-b border-zinc-100 pb-3">
                Comentarios y Opiniones
              </h3>
              
              {/* Comentarios Dinámicos */}
              <div className="space-y-4">
                {loadingComments ? (
                  <p className="text-xs text-zinc-400 font-mono italic animate-pulse">Cargando comentarios...</p>
                ) : comments.length > 0 ? (
                  comments.map((comm) => {
                    const dateObj = new Date(comm.created_at)
                    const formattedDate = isNaN(dateObj.getTime())
                      ? 'Hace momentos'
                      : dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
                    
                    return (
                      <div key={comm.id} className="p-4 sm:p-5 bg-zinc-50 rounded-[15px] border border-zinc-200/60">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-zinc-900">{comm.name}</span>
                          <span className="text-xs text-zinc-400 font-mono">{formattedDate}</span>
                        </div>
                        <p className="text-[15px] text-zinc-700 leading-relaxed whitespace-pre-line">
                          {comm.comment}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-zinc-400 font-mono italic">No hay comentarios aún. ¡Sé el primero en opinar!</p>
                )}
              </div>

              {/* Formulario de Comentarios */}
              {commentSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[15px] text-center"
                >
                  <h4 className="font-bold text-sm mb-1">¡Gracias por comentar!</h4>
                  <p className="text-xs text-emerald-600">Tu opinión ha sido enviada y se publicará tras ser revisada por moderación.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="space-y-4 pt-4 border-t border-zinc-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono">Deja tu opinión</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Nombre"
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                    <input
                      type="email"
                      required
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="Correo (No se publicará)"
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all resize-none"
                  />
                  {commentError && (
                    <p className="text-xs text-rose-500 font-semibold">{commentError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> 
                    {commentSubmitting ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                </form>
              )}
            </motion.div>

          </div>

          {/* COLUMNA DERECHA: Sidebar Sticky con Progreso de Lectura, Boletín y Patrocinio (30%) */}
          <div className="space-y-6 lg:sticky lg:top-[85px]">
            
            {/* 1. Widget: Progreso de Lectura */}
            <div className="bg-white border border-zinc-200/80 rounded-[18px] p-5 shadow-2xs">
              <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3 font-mono">Lectura</h4>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-500 font-semibold">Leído hasta:</span>
                <span className="font-bold text-zinc-900 font-mono">{Math.round(scrollProgress)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff4b0b] transition-all duration-100" 
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            {/* 5. Widget: Newsletter (Captación) */}
            <div className="bg-white border border-zinc-200/80 rounded-[18px] p-6 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff703d] to-[#ff4b0b] rounded-t-[18px]" />
              <h4 className="text-xs font-extrabold text-[#ff4b0b] uppercase tracking-widest mb-2 flex items-center gap-1.5 mt-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Boletín Semanal
              </h4>
              <h5 className="text-base font-black mb-1.5 leading-tight text-zinc-900">Únete al manual de operaciones de IA</h5>
              <p className="text-[13px] text-zinc-500 mb-4 leading-relaxed">Recibe ideas prácticas de automatización directamente en tu correo cada semana.</p>
              
              {newsletterSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#ff4b0b]/8 border border-[#ff4b0b]/20 text-zinc-800 rounded-xl text-center"
                >
                  <h5 className="font-bold text-xs mb-1">¡Suscrito con éxito!</h5>
                  <p className="text-xs text-zinc-500 leading-normal">Pronto recibirás el manual de operaciones en tu correo.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Tu correo electrónico"
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 text-sm rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-[#ff4b0b] focus:bg-white transition-all font-semibold"
                    />
                  </div>
                  {newsletterError && (
                    <p className="text-xs text-rose-500 font-semibold px-1">{newsletterError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    {newsletterSubmitting ? 'Procesando...' : 'Suscribirme'}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* RECOMENDACIONES / OTROS ARTÍCULOS */}
        <div className="pt-12 border-t border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest mb-8 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />
            Otras publicaciones interesantes
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendedArticles.map((art) => (
              <Link
                key={art.id}
                to={`/blog/articulo/${art.id}`}
                className="group bg-white rounded-[18px] border border-black/10 overflow-hidden hover:shadow-md hover:border-black/20 transition-all duration-300 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="relative w-full aspect-video overflow-hidden bg-zinc-900 border-b border-black/5">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-zinc-200/70 inline-block mb-2.5 font-mono">
                      {art.categoryLabel}
                    </span>
                    <h4 className="text-sm sm:text-[15px] font-bold text-zinc-900 leading-snug group-hover:text-[#ff4b0b] transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </div>
                </div>
                <div className="px-5 pb-4 pt-3 text-xs text-zinc-400 font-mono border-t border-zinc-100 flex justify-between items-center">
                  <span>{art.date}</span>
                  <span>{art.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
