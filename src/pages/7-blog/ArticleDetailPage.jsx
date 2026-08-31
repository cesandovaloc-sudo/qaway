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
  const utteranceRef = useRef(null)
  const textCharsCountRef = useRef(0)

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

  // Detener audio al desmontar o cambiar de artículo
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [id])

  const startSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !article) return

    window.speechSynthesis.cancel()

    // Limpiar texto de HTML para una lectura fluida
    const cleanContent = (article.content || '').replace(/<[^>]+>/g, ' ')
    const fullTextToRead = `${article.title}. ${article.excerpt ? article.excerpt + '.' : ''} ${cleanContent}`
    textCharsCountRef.current = fullTextToRead.length

    const utterance = new SpeechSynthesisUtterance(fullTextToRead)
    utterance.lang = 'es-ES'
    utterance.rate = audioSpeed
    utterance.pitch = 1.0

    // Buscar una voz en español si está disponible
    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find((v) => v.lang.startsWith('es') || v.lang.includes('es-'))
    if (spanishVoice) {
      utterance.voice = spanishVoice
    }

    utterance.onboundary = (event) => {
      if (textCharsCountRef.current > 0) {
        const progress = Math.min(100, Math.round((event.charIndex / textCharsCountRef.current) * 100))
        setAudioProgress(progress)
      }
    }

    utterance.onend = () => {
      setIsPlayingAudio(false)
      setIsPausedAudio(false)
      setAudioProgress(100)
    }

    utterance.onerror = () => {
      setIsPlayingAudio(false)
      setIsPausedAudio(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsPlayingAudio(true)
    setIsPausedAudio(false)
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      setIsPausedAudio(false)
      setAudioProgress(0)
    }
  }

  const changeAudioSpeed = (speed) => {
    setAudioSpeed(speed)
    if (isPlayingAudio && !isPausedAudio) {
      // Reiniciar con la nueva velocidad
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

        {/* 2. TÍTULO EDITORIAL DOMINANTE */}
        <div className="mb-8 max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#ff4b0b]/10 text-[#ff4b0b] text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff4b0b]/20 mb-3 font-mono"
          >
            {article.categoryLabel}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-black text-zinc-950 tracking-tight leading-[1.14]"
          >
            {article.title}
          </motion.h1>
        </div>

        {/* 3. CUADRÍCULA UNIFORME DE DOS COLUMNAS (ESTILO HOSTINGER / WORDPRESS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
          
          {/* COLUMNA IZQUIERDA: Portada + Audio + Artículo + Comentarios (70%) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Portada 16:9 Alineada al 100% con los bordes de la columna de lectura */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative aspect-[16/9] w-full rounded-[18px] overflow-hidden bg-zinc-950 border border-black/10 shadow-xs"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>

            {/* Barra de Audio Integrada */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
              <button
                type="button"
                onClick={togglePlayAudio}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-zinc-950 text-white hover:bg-zinc-800 px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {isPlayingAudio && !isPausedAudio ? (
                  <Pause className="h-3.5 w-3.5 text-[#ff4b0b] fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-[#ff4b0b] fill-current" />
                )}
                <span>{isPlayingAudio ? (isPausedAudio ? 'Pausado' : `Escuchando ${audioProgress}%`) : 'Escuchar artículo en audio'}</span>
              </button>

              {isPlayingAudio && (
                <div className="inline-flex items-center gap-1">
                  {[1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => changeAudioSpeed(speed)}
                      className={`rounded px-2 py-1 text-[11px] font-bold ${
                        audioSpeed === speed ? 'bg-[#ff4b0b] text-white' : 'bg-black/5 text-black/60'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={stopAudio}
                    className="rounded px-2 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50"
                    title="Detener audio"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            
            {/* Cuerpo del Artículo */}
            <motion.article
              ref={articleRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-zinc-200/80 rounded-[15px] p-8 md:p-10 shadow-xs space-y-6"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: sanitizeAndDecodeContent(article.content) }} 
                className="space-y-6 text-base md:text-lg leading-relaxed text-zinc-800 [&_h2]:text-2xl sm:[&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:text-zinc-950 [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl sm:[&_h3]:text-[22px] [&_h3]:font-bold [&_h3]:text-zinc-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-[1.75] [&_p]:text-zinc-700"
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
                      <div key={comm.id} className="p-4 bg-zinc-50 rounded-[15px] border border-zinc-200/50">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-zinc-800">{comm.name}</span>
                          <span className="text-[9px] text-zinc-400 font-mono">{formattedDate}</span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
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
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Deja tu opinión</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Nombre"
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                    <input
                      type="email"
                      required
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="Correo (No se publicará)"
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-zinc-300 transition-all resize-none"
                  />
                  {commentError && (
                    <p className="text-[11px] text-rose-500 font-semibold">{commentError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> 
                    {commentSubmitting ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                </form>
              )}
            </motion.div>

          </div>

          {/* COLUMNA DERECHA: Sidebar Sticky con Autor, CTA HubSpot, Compartir y Boletín (30%) */}
          <div className="space-y-6 lg:sticky lg:top-[85px]">
            
            {/* 1. Ficha de Autor (Estilo Hostinger / WordPress) */}
            <div className="bg-white border border-zinc-200/80 rounded-[18px] p-5 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ff703d] to-[#ff4b0b] flex items-center justify-center text-white text-base font-black shadow-xs shrink-0">
                Q
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-0.5 font-mono">
                  Publicado por
                </span>
                <h4 className="text-sm font-bold text-zinc-950 leading-tight truncate">
                  Qaway Lab
                </h4>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {article.date} • {article.readTime}
                </p>
              </div>
            </div>

            {/* 2. Tarjeta CTA Estilo HubSpot (Alta Conversión) */}
            <div className="rounded-[18px] border border-[#ff4b0b]/25 bg-gradient-to-br from-[#fff9f6] via-[#fff2eb] to-[#ffe7d9] p-6 shadow-xs relative overflow-hidden">
              <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#ff4b0b] bg-[#ff4b0b]/10 px-2.5 py-1 rounded-md mb-2.5 font-mono">
                Recurso Gratuito
              </div>
              <h4 className="text-base font-black text-zinc-950 mb-2 leading-snug">
                Guía y Prompts de IA para Negocios
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                Maximiza la productividad de tu equipo y automatiza tareas repetitivas con nuestras plantillas listas para usar.
              </p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff703d] to-[#ff4b0b] hover:from-[#ff5a22] hover:to-[#e03d00] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-sm shadow-[#ff4b0b]/25 transition-all cursor-pointer"
              >
                Descargar Guía Gratis <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3. Barra de Compartir Rápido */}
            <div className="bg-white border border-zinc-200/80 rounded-[18px] p-5 shadow-2xs">
              <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 font-mono">
                Compartir Artículo
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-black/10 hover:border-green-500 hover:text-green-600 bg-zinc-50 hover:bg-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-black/10 hover:border-blue-600 hover:text-blue-600 bg-zinc-50 hover:bg-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copiar enlace"
                  className="p-2.5 rounded-xl border border-black/10 hover:border-[#ff4b0b] hover:text-[#ff4b0b] bg-zinc-50 hover:bg-white transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. Widget: Progreso de Lectura */}
            <div className="bg-white border border-zinc-200/80 rounded-[18px] p-5 shadow-2xs">
              <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3 font-mono">Lectura</h4>
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
              <h4 className="text-[10px] font-extrabold text-[#ff4b0b] uppercase tracking-widest mb-2 flex items-center gap-1 mt-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Boletín Semanal
              </h4>
              <h5 className="text-sm font-black mb-1.5 leading-tight text-zinc-900">Únete al manual de operaciones de IA</h5>
              <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">Recibe ideas prácticas de automatización directamente en tu correo cada semana.</p>
              
              {newsletterSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#ff4b0b]/8 border border-[#ff4b0b]/20 text-zinc-800 rounded-xl text-center"
                >
                  <h5 className="font-bold text-xs mb-1">¡Suscrito con éxito!</h5>
                  <p className="text-[10px] text-zinc-500 leading-normal">Pronto recibirás el manual de operaciones en tu correo.</p>
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
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 text-xs rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-[#ff4b0b] focus:bg-white transition-all font-semibold"
                    />
                  </div>
                  {newsletterError && (
                    <p className="text-[10px] text-rose-500 font-semibold px-1">{newsletterError}</p>
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
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Otras publicaciones interesantes
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendedArticles.map((art, idx) => (
              <Link
                key={art.id}
                to={`/blog/articulo/${art.id}`}
                className="group bg-white rounded-[15px] border border-black/10 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between"
              >
                <div>
                  <div className="relative w-full aspect-video overflow-hidden bg-zinc-900 border-b border-black/5">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-[8px] bg-zinc-100 text-zinc-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-200/50 block mb-2 max-w-max">
                      {art.categoryLabel}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 leading-tight group-hover:text-qaway-accent-dark transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-2 text-[9px] text-zinc-400 font-mono border-t border-zinc-100 flex justify-between items-center">
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
