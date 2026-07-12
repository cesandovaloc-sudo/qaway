import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Calendar, Clock, Copy, Linkedin, Mail, Send, Share2, Sparkles } from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import { formatBlogDate, getPostBySlug, getRelatedPosts } from './blog.utils'

const shareBaseClass = 'inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-700 transition hover:border-[#ff4b0b]/30 hover:text-[#ff4b0b]'

function renderBlock(block) {
  if (block.type === 'subheading') return <h3 key={block.content} className="text-xl font-bold text-zinc-950">{block.content}</h3>
  if (block.type === 'list') return <ul key={block.items.join('-')} className="list-disc space-y-2 pl-5 text-zinc-700 marker:text-[#ff4b0b]">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
  return <p key={block.content} className="text-base leading-relaxed text-zinc-700 md:text-lg">{block.content}</p>
}

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentSubmitted, setCommentSubmitted] = useState(false)
  const [commentError, setCommentError] = useState(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [newsletterError, setNewsletterError] = useState(null)
  const article = getPostBySlug(id)

  const shareLinks = useMemo(() => {
    if (typeof window === 'undefined' || !article) return null
    const url = `${window.location.origin}/blog/articulo/${article.slug}`
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(article.title)
    return {
      url,
      linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      mail: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    }
  }, [article])

  const fallbackComments = [
    { id: 'mock-1', name: 'Maria Silva', comment: 'Excelente explicacion. Ya logre integrar mi primer webhook entre Stripe y Make y me ahorro mucho trabajo manual.', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'mock-2', name: 'Roberto K.', comment: 'Muy buen articulo. Me interesa ver mas ejemplos de CRM conectado con automatizaciones de WhatsApp.', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ]

  useEffect(() => {
    async function loadComments() {
      if (!article) return
      setLoadingComments(true)
      try {
        const { data, error } = await supabase.from('blog_comments').select('*').eq('article_id', id).eq('approved', true).order('created_at', { ascending: true })
        if (error) throw error
        setComments(data?.length ? data : fallbackComments)
      } catch (error) {
        console.error('Error al cargar comentarios:', error)
        setComments(fallbackComments)
      } finally {
        setLoadingComments(false)
      }
    }

    loadComments()
    setCommentSubmitted(false)
    setNewsletterSubmitted(false)
    setCommentError(null)
    setNewsletterError(null)
  }, [article, id])

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) setScrollProgress((window.scrollY / totalHeight) * 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sendEmailNotification = async (subject, message) => {
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    if (!accessKey) return
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: accessKey, subject, from_name: 'Qaway Lab Web', to_email: 'qaway.myc@gmail.com', message }),
      })
    } catch (error) {
      console.error('Error enviando notificacion por correo:', error)
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    setCommentSubmitting(true)
    setCommentError(null)
    try {
      const { error } = await supabase.from('blog_comments').insert([{ article_id: id, name: commentName, email: commentEmail, comment: commentText, approved: false }])
      if (error) throw error
      await sendEmailNotification(`Nuevo comentario en el Blog: "${article?.title || id}"`, `Articulo: ${article?.title || id}\nNombre: ${commentName}\nCorreo: ${commentEmail}\nComentario: ${commentText}`)
      setCommentSubmitted(true)
      setCommentText('')
    } catch (error) {
      console.error('Error al comentar:', error)
      setCommentError(error.message || 'Error al enviar el comentario. Intentalo de nuevo.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()
    setNewsletterSubmitting(true)
    setNewsletterError(null)
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email: newsletterEmail }])
      if (error) {
        if (error.code === '23505') throw new Error('Esta direccion de correo ya esta registrada en el boletin.')
        throw error
      }
      await sendEmailNotification('Nueva suscripcion al Boletin Semanal', `Correo: ${newsletterEmail}\nFecha: ${new Date().toLocaleString('es-PE')}`)
      setNewsletterSubmitted(true)
      setNewsletterEmail('')
    } catch (error) {
      console.error('Error en suscripcion:', error)
      setNewsletterError(error.message || 'Error al procesar la suscripcion. Intentalo de nuevo.')
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  if (!article) {
    return <div className="mt-[73px] flex min-h-screen items-center justify-center bg-zinc-50 p-8"><div className="max-w-md rounded-[15px] border border-zinc-200 bg-white p-8 text-center shadow-sm"><BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-400" /><h2 className="mb-2 text-xl font-bold text-zinc-950">Articulo no encontrado</h2><p className="mb-6 text-sm text-zinc-500">El articulo que estas buscando no existe o fue movido.</p><Link to="/blog" className="inline-flex items-center gap-2 rounded-[15px] bg-zinc-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-zinc-800"><ArrowLeft className="h-4 w-4" />Volver al Blog</Link></div></div>
  }

  const recommendedArticles = getRelatedPosts(article.slug)
  return (
    <div className="relative min-h-screen bg-zinc-50 pb-24 pt-[100px] text-zinc-900">
      <div className="fixed left-0 right-0 top-[80px] z-40 h-1 bg-zinc-100"><div className="h-full bg-gradient-to-r from-qaway-accent to-qaway-accent-dark transition-all duration-100" style={{ width: `${scrollProgress}%` }} /></div>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8"><Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-950"><ArrowLeft className="h-4 w-4" />Volver al listado</Link></motion.div>
        <div className="mb-8">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-full border border-qaway-accent/20 bg-qaway-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-qaway-accent-dark">{article.categoryLabel}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 mt-4 text-3xl font-black leading-tight tracking-tight text-zinc-950 md:text-4xl lg:text-5xl">{article.title}</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-6 font-mono text-xs text-zinc-400"><span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatBlogDate(article.publishedAt)}</span><span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readTime} de lectura</span></motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative mb-12 h-[250px] overflow-hidden rounded-[15px] border border-black/5 bg-zinc-900 shadow-sm md:h-[400px]"><img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" /></motion.div>

        <div className="mb-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 rounded-[15px] border border-zinc-200/80 bg-white p-8 text-zinc-800 shadow-sm md:p-10">{article.blocks.map(renderBlock)}</motion.article>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-6 rounded-[15px] border border-zinc-200/80 bg-white p-8 shadow-sm md:p-10">
              <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-3 text-base font-extrabold uppercase tracking-widest text-zinc-800">Comentarios y opiniones</h3>
              <div className="space-y-4">
                {loadingComments ? <p className="animate-pulse font-mono text-xs italic text-zinc-400">Cargando comentarios...</p> : comments.length > 0 ? comments.map((comment) => { const dateObj = new Date(comment.created_at); const formattedDate = Number.isNaN(dateObj.getTime()) ? 'Hace momentos' : dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }); return <div key={comment.id} className="rounded-[15px] border border-zinc-200/50 bg-zinc-50 p-4"><div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-bold text-zinc-800">{comment.name}</span><span className="font-mono text-[9px] text-zinc-400">{formattedDate}</span></div><p className="whitespace-pre-line text-xs leading-relaxed text-zinc-600">{comment.comment}</p></div> }) : <p className="font-mono text-xs italic text-zinc-400">No hay comentarios aun. Se el primero en opinar.</p>}
              </div>
              {commentSubmitted ? <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[15px] border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800"><h4 className="mb-1 text-sm font-bold">Gracias por comentar</h4><p className="text-xs text-emerald-600">Tu opinion se enviara a moderacion antes de publicarse.</p></motion.div> : <form onSubmit={handleCommentSubmit} className="space-y-4 border-t border-zinc-100 pt-4"><h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Deja tu opinion</h4><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><input type="text" required value={commentName} onChange={(event) => setCommentName(event.target.value)} placeholder="Nombre" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all focus:border-zinc-300 focus:bg-white" /><input type="email" required value={commentEmail} onChange={(event) => setCommentEmail(event.target.value)} placeholder="Correo (no se publicara)" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all focus:border-zinc-300 focus:bg-white" /></div><textarea required rows={4} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Escribe tu comentario..." className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all focus:border-zinc-300 focus:bg-white" />{commentError ? <p className="text-[11px] font-semibold text-rose-500">{commentError}</p> : null}<button type="submit" disabled={commentSubmitting} className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 hover:bg-zinc-800 disabled:bg-zinc-400"><Send className="h-3.5 w-3.5" />{commentSubmitting ? 'Enviando...' : 'Enviar comentario'}</button></form>}
            </motion.div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-[85px]">
            <div className="rounded-[15px] border border-zinc-200/80 bg-white p-6 shadow-sm"><h4 className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Lectura</h4><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-zinc-500">Leido hasta:</span><span className="font-bold text-zinc-900">{Math.round(scrollProgress)}%</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100"><div className="h-full bg-qaway-accent transition-all duration-100" style={{ width: `${scrollProgress}%` }} /></div></div>
            <div className="rounded-[15px] border border-zinc-200/80 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-2"><Share2 className="h-4 w-4 text-[#ff4b0b]" /><h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Compartir</h4></div><div className="flex flex-wrap gap-2"><button type="button" onClick={async () => { if (shareLinks?.url && navigator?.clipboard) await navigator.clipboard.writeText(shareLinks.url) }} className={shareBaseClass}><Copy className="h-3.5 w-3.5" />Copiar</button>{shareLinks ? <><a href={shareLinks.linkedIn} target="_blank" rel="noreferrer" className={shareBaseClass}><Linkedin className="h-3.5 w-3.5" />LinkedIn</a><a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className={shareBaseClass}><Send className="h-3.5 w-3.5" />WhatsApp</a><a href={shareLinks.mail} className={shareBaseClass}><Mail className="h-3.5 w-3.5" />Correo</a></> : null}</div></div>
            <div className="relative overflow-hidden rounded-[15px] border border-white/5 bg-[#0c0c0e] p-6 text-white shadow-sm"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,210,0,0.08),transparent_50%)]" /><h4 className="mb-2 flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-qaway-accent"><Sparkles className="h-3 w-3" />Boletin semanal</h4><h5 className="mb-1.5 text-sm font-black leading-tight">Unete al manual de operaciones de IA</h5><p className="mb-4 text-[11px] leading-relaxed text-zinc-400">Recibe ideas practicas de automatizacion directamente en tu correo cada semana.</p>{newsletterSubmitted ? <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-qaway-accent/20 bg-qaway-accent/10 p-5 text-center text-qaway-accent-light"><h5 className="mb-1 text-xs font-bold">Suscrito con exito</h5><p className="text-[10px] leading-normal text-zinc-400">Pronto recibiras el manual en tu correo.</p></motion.div> : <form onSubmit={handleNewsletterSubmit} className="space-y-2.5"><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" /><input type="email" required value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Tu correo electronico" className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-10 pr-4 text-xs font-semibold text-white outline-none transition-all placeholder:text-zinc-500 focus:border-white/20" /></div>{newsletterError ? <p className="px-1 text-[10px] font-semibold text-rose-400">{newsletterError}</p> : null}<button type="submit" disabled={newsletterSubmitting} className="w-full rounded-xl bg-qaway-accent py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-950 transition-all duration-300 active:scale-95 hover:bg-qaway-accent-light disabled:bg-zinc-600">{newsletterSubmitting ? 'Procesando...' : 'Suscribirme'}</button></form>}</div>
            <div className="rounded-[15px] border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center shadow-2xs"><div className="mb-3 inline-flex items-center rounded-full border border-[#ff4b0b]/20 bg-[#ff4b0b]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">Beta</div><h4 className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Publicacion directa</h4><p className="mb-4 text-[11px] leading-relaxed text-zinc-500">En prueba. La publicacion directa con APIs se mostrara aqui apenas terminemos el flujo seguro.</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 hover:bg-zinc-800">Ver estado</a></div>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-12"><div className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />Otras publicaciones interesantes</div><div className="grid gap-6 md:grid-cols-3">{recommendedArticles.map((post) => <Link key={post.slug} to={`/blog/articulo/${post.slug}`} className="group flex h-full flex-col justify-between overflow-hidden rounded-[15px] border border-black/10 bg-white transition-all duration-300 hover:shadow-md"><div><div className="relative aspect-video w-full overflow-hidden border-b border-black/5 bg-zinc-900"><img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="p-4"><span className="mb-2 block max-w-max rounded border border-zinc-200/50 bg-zinc-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-500">{post.categoryLabel}</span><h4 className="line-clamp-2 text-xs font-bold leading-tight text-zinc-900 transition-colors group-hover:text-qaway-accent-dark">{post.title}</h4></div></div><div className="flex items-center justify-between border-t border-zinc-100 px-4 pb-4 pt-2 font-mono text-[9px] text-zinc-400"><span>{formatBlogDate(post.publishedAt)}</span><span>{post.readTime}</span></div></Link>)}</div></div>
      </div>
    </div>
  )
}