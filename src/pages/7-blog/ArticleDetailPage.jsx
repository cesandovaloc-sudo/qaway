import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, Send, Mail, Sparkles } from 'lucide-react'
import { visibleArticles } from './BlogPage'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const articleRef = useRef(null)

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

  // Buscar el artículo por su ID
  const article = visibleArticles.find(art => art.id === id)

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

  if (!article) {
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
      
      {/* Barra de progreso de lectura pegajosa justo debajo del Navbar */}
      <div className="fixed top-[80px] left-0 right-0 h-1 bg-zinc-100 z-40">
        <div 
          className="h-full bg-linear-to-r from-qaway-accent to-qaway-accent-dark transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Botón de regreso */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al listado
          </Link>
        </motion.div>

        {/* Cabecera del Artículo */}
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-qaway-accent/10 text-qaway-accent-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-qaway-accent/20"
          >
            {article.categoryLabel}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight mt-4 mb-6 leading-tight"
          >
            {article.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 text-xs text-zinc-400 font-mono"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {article.readTime} de lectura
            </span>
          </motion.div>
        </div>

        {/* Imagen de Portada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative h-[250px] md:h-[400px] rounded-[15px] overflow-hidden bg-zinc-900 mb-12 border border-black/5 shadow-xs"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

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
              className="bg-white border border-zinc-200/80 rounded-[15px] p-8 md:p-10 shadow-xs text-zinc-800 text-base md:text-lg leading-relaxed space-y-6"
            >
              <div 
                dangerouslySetInnerHTML={{ __html: article.content }} 
                className="space-y-6"
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

          {/* COLUMNA DERECHA: Sidebar de Información y Publicidad (30%) */}
          <div className="space-y-8 lg:sticky lg:top-[85px]">
            
            {/* Widget: Progreso de Lectura */}
            <div className="bg-white border border-zinc-200/80 rounded-[15px] p-6 shadow-xs">
              <h4 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Lectura</h4>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-500 font-semibold">Leído hasta:</span>
                <span className="font-bold text-zinc-900">{Math.round(scrollProgress)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-qaway-accent transition-all duration-100" 
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            {/* Widget: Newsletter (Captación) */}
            <div className="bg-white border border-zinc-200/80 rounded-[15px] p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-qaway-accent/60 via-qaway-accent to-qaway-accent/60 rounded-t-[15px]" />
              <h4 className="text-[9px] font-extrabold text-qaway-accent uppercase tracking-widest mb-2 flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" /> Boletín Semanal
              </h4>
              <h5 className="text-sm font-black mb-1.5 leading-tight text-zinc-900">Únete al manual de operaciones de IA</h5>
              <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">Recibe ideas prácticas de automatización directamente en tu correo cada semana.</p>
              
              {newsletterSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-qaway-accent/8 border border-qaway-accent/20 text-zinc-800 rounded-xl text-center"
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
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 text-xs rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-zinc-300 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                  {newsletterError && (
                    <p className="text-[10px] text-rose-500 font-semibold px-1">{newsletterError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 active:scale-95"
                  >
                    {newsletterSubmitting ? 'Procesando...' : 'Suscribirme'}
                  </button>
                </form>
              )}
            </div>

            {/* Widget: Espacio Publicitario / Patrocinio */}
            <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-[15px] p-6 text-center shadow-2xs">
              <h4 className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest mb-2.5">Patrocinio</h4>
              <div className="h-44 bg-zinc-200/30 rounded-xl flex flex-col items-center justify-center border border-zinc-200 p-4">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Qaway LAB Consulting</span>
                <p className="text-zinc-500 text-[9px] leading-normal mb-3">¿Buscas automatizar las operaciones de tu empresa con IA? Agenda una sesión hoy.</p>
                <a 
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all active:scale-95"
                >
                  Agendar Sesión
                </a>
              </div>
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
