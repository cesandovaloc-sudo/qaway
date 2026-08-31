import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { isPublicSiteMode } from '@/config/siteVisibility'
import { supabase } from '@/config/supabase'
import qawayCalendarImage from '../6-recursos/assets/qaway-calendar.png'
import {
  Newspaper,
  TrendingUp,
  BookOpen,
  Target,
  Cpu,
  ArrowRight,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Sparkles,
  Zap,
  Bot,
  Compass,
  Layers,
  Star,
  ChevronDown,
  ChevronRight,
  Headphones,
  Volume2,
} from 'lucide-react'

const categories = [
  {
    icon: Sparkles,
    title: 'I. Artificial',
    key: 'inteligencia-artificial',
    path: '/blog/inteligencia-artificial',
    description: 'Ideas, herramientas y criterio aplicado para entender la IA más allá del ruido.',
  },
  {
    icon: BookOpen,
    title: 'Productividad',
    key: 'productividad',
    path: '/blog/productividad',
    description: 'Sistemas, hábitos y recursos para trabajar con más claridad y menos fricción.',
  },
  {
    icon: TrendingUp,
    title: 'Marketing',
    key: 'marketing',
    path: '/blog/marketing',
    description: 'Captación, contenidos, CRM y decisiones comerciales conectadas a negocio real.',
  },
  {
    icon: Target,
    title: 'Diseño',
    key: 'diseno-branding',
    path: '/blog/diseno-branding',
    description: 'Comunicación visual, identidad y percepción de marca con criterio digital.',
  },
  {
    icon: Cpu,
    title: 'Automatización',
    key: 'automatizacion',
    path: '/blog/automatizacion',
    description: 'Workflows, integraciones y operaciones digitales que ahorran tiempo y errores.',
  },
]

export const articles = [
  {
    id: 'google-calendar-dominado-guia-productividad',
    category: 'productividad',
    categoryLabel: 'Productividad',
    formatLabel: 'Guia',
    title: 'Google Calendar Dominado: guia para ordenar tu semana con IA',
    excerpt: 'Aprende a usar Google Calendar con metodo, bloques de tiempo, tareas y apoyo de IA para reducir friccion operativa.',
    content: "<p className='mb-4'>Google Calendar puede ser mucho mas que una agenda de reuniones. Usado con metodo, se convierte en un sistema operativo semanal para decidir prioridades, proteger bloques de trabajo profundo y coordinar tareas sin depender de la memoria.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>La idea central</h3><p className='mb-4'>Primero separa eventos, tareas y recordatorios. Luego crea calendarios secundarios para distinguir trabajo, foco, seguimiento comercial y vida personal. Esta estructura permite que la IA sugiera horarios, detecte conflictos y ayude a planificar semanas mas realistas.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>Como empezar</h3><p className='mb-4'>Define bloques fijos, deja espacios de recuperacion y revisa tu calendario cada viernes. Si quieres profundizar, el recurso Google Calendar Dominado incluye una guia extendida y una plantilla practica para aplicar este sistema paso a paso.</p>",
    date: '08 Jul 2026',
    readTime: '7 min',
    publishedAt: '2026-07-08',
    public: true,
    homeSection: 'featured',
    featured: {
      order: 1,
      label: 'Guia publica',
      icon: 'book'
    },
    image: qawayCalendarImage,
    relatedCta: {
      title: 'Google Calendar Dominado',
      description: 'Descarga nuestra guía extendida y plantilla práctica para aplicar este sistema de productividad paso a paso y tomar el control de tu tiempo.',
      image: qawayCalendarImage,
      link: '/recursos/ebooks/google-calendar-dominado',
      buttonText: 'Acceder al Recurso'
    }
  },
  {
    id: 'como-automatizar-facturacion-make-chatgpt',
    category: 'automatizacion',
    categoryLabel: 'Automatización',
    formatLabel: 'Tutorial',
    title: 'Cómo estructurar una facturación automática con Make y ChatGPT',
    excerpt: 'Automatiza la generación de facturas, almacenamiento de PDFs y envío por correo sin mover un solo dedo.',
    content: "<p className='mb-4'>Automatizar tareas repetitivas es uno de los mejores retornos de inversión cuando implementas Inteligencia Artificial en tu negocio. En este artículo, aprenderás a construir un flujo automatizado que toma datos de un formulario de venta, genera una factura formal usando ChatGPT, crea un PDF limpio y lo envía al correo del cliente de manera 100% autónoma.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>El workflow en 3 pasos clave:</h3><ul className='list-disc pl-5 mb-4 space-y-2'><li><strong>Paso 1: El disparador (Trigger):</strong> Conectamos la pasarela de pagos (como Stripe o WooCommerce) a Make para detectar cada nueva compra.</li><li><strong>Paso 2: Procesamiento y estructura con ChatGPT:</strong> La IA se encarga de formatear el concepto, validar el tipo de cambio y estructurar la información fiscal sin errores.</li><li><strong>Paso 3: Generación del PDF y Envío:</strong> Usamos un generador de plantillas PDF para crear el documento final y enviarlo vía Gmail automáticamente.</li></ul><p>Este sistema reduce a cero los errores de facturación y libera más de 10 horas de trabajo operativo al mes para tu equipo.</p>",
    date: '04 Jun 2026',
    readTime: '5 min',
    publishedAt: '2026-06-04',
    homeSection: 'featured',
    featured: {
      order: 1,
      label: 'Destacado',
      icon: 'trending'
    },
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'guia-crm-notion-whatsapp',
    category: 'marketing',
    categoryLabel: 'Marketing',
    formatLabel: 'Guía',
    title: 'Guía paso a paso: CRM en Notion y envíos por WhatsApp',
    excerpt: 'Crea un embudo comercial conectado a WhatsApp para notificar a tu equipo sobre leads calificados al instante.',
    content: "<p className='mb-4'>Tener un CRM no tiene por qué ser costoso ni complejo. Con Notion y la integración correcta de WhatsApp, puedes centralizar tus contactos comerciales y recibir notificaciones instantáneas cada vez que entra un nuevo lead.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>¿Cómo conectar ambos mundos?</h3><p className='mb-4'>El truco consiste en utilizar webhooks intermedios que conecten tu base de datos de Notion con la API de WhatsApp Business. De esta manera, cuando mueves una tarjeta de prospecto a la columna de 'Contactado', el sistema puede enviar un mensaje predeterminado al cliente automáticamente.</p><p className='mb-4'>Este enfoque híbrido de CRM combina la flexibilidad visual de Notion con la inmediatez de WhatsApp para aumentar tus tasas de cierre comerciales de manera sustancial.</p>",
    date: '02 Jun 2026',
    readTime: '8 min',
    publishedAt: '2026-06-02',
    homeSection: 'featured',
    featured: {
      order: 2,
      label: 'Guia clave',
      icon: 'book'
    },
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'por-que-tu-negocio-necesita-adn-visual',
    category: 'diseno-branding',
    categoryLabel: 'Diseño',
    formatLabel: 'Análisis',
    title: 'Por qué tu negocio necesita un ADN visual único',
    excerpt: 'La coherencia de marca reduce el costo de adquisición de clientes y genera autoridad inmediata. Estrategia de marca moderna.',
    content: "<p className='mb-4'>En un mercado saturado de plantillas genéricas, la coherencia de marca y un diseño premium no son lujos, son herramientas de conversión directa. Un ADN visual consistente reduce el costo de adquisición de tus clientes al generar confianza inmediata.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>La regla de la primera impresión</h3><p className='mb-4'>Los usuarios juzgan la credibilidad de tu negocio en los primeros 3 segundos de cargar tu sitio web. Si tu tipografía, colores y composiciones lucen amateur, el prospecto asumirá que tu servicio también lo es. Trabajar en una identidad visual sólida y consistente es la base de cualquier estrategia de marketing digital exitosa.</p>",
    date: '28 May 2026',
    readTime: '6 min',
    publishedAt: '2026-05-28',
    homeSection: 'featured',
    featured: {
      order: 3,
      label: 'Analisis',
      icon: 'target'
    },
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'agentes-autonomos-ia-productividad',
    category: 'inteligencia-artificial',
    categoryLabel: 'I. Artificial',
    formatLabel: 'Tendencia',
    title: 'Agentes autónomos de IA: El futuro de la productividad en 2026',
    excerpt: 'Los agentes ya no solo responden preguntas; ejecutan tareas operativas completas con criterio propio. Análisis de tendencias.',
    content: "<p className='mb-4'>Los chatbots de preguntas y respuestas son cosa del pasado. En 2026, los agentes autónomos de IA tienen la capacidad de ejecutar flujos completos de trabajo, interactuar con APIs externas, tomar decisiones lógicas y aprender de sus propios errores.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>El impacto en los equipos operativos</h3><p className='mb-4'>Un agente de IA ahora puede revisar una bandeja de correo de soporte, clasificar las solicitudes, consultar la base de datos interna y responder con una solución personalizada de forma autónoma. La productividad de las empresas se está multiplicando gracias a estos copilotos autónomos.</p>",
    date: '25 May 2026',
    readTime: '4 min',
    publishedAt: '2026-05-25',
    homeSection: 'more',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'sops-notion-organizar-procesos-delegar',
    category: 'productividad',
    categoryLabel: 'Productividad',
    formatLabel: 'Guía',
    title: 'SOPs en Notion: Cómo organizar procesos para delegar sin caos',
    excerpt: 'Convierte la memoria de tu equipo en un sistema documentado y automatizado para dejar de depender de supervisión constante.',
    content: "<p className='mb-4'>Delegar tareas es la única forma de escalar un negocio, pero hacerlo sin procesos documentados (SOPs) solo genera caos y pérdida de calidad. En esta guía te enseñamos a administrar una base de conocimientos en Notion.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>Estructura de un SOP efectivo:</h3><p className='mb-4'>Cada SOP debe responder 3 preguntas básicas de forma visual: ¿Qué se hace? ¿Cómo se hace? (con capturas o videos cortos) y ¿Qué hacer si algo sale mal? Notion es la plataforma perfecta para mantener estos documentos vivos y accesibles a todo tu equipo.</p>",
    date: '18 May 2026',
    readTime: '7 min',
    publishedAt: '2026-05-18',
    homeSection: 'more',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'automatizacion-contenidos-ia-coherencia',
    category: 'marketing',
    categoryLabel: 'Marketing',
    formatLabel: 'Tutorial',
    title: 'Automatización de contenidos con IA sin perder coherencia',
    excerpt: 'Una metodología clara para generar copys y programar posts manteniendo intacta la voz y valores de tu marca.',
    content: "<p className='mb-4'>Automatizar la creación de contenido es tentador, pero el spam automatizado destruye la reputación de tu marca. Aquí te mostramos una metodología para usar IA como un amplificador creativo de tu voz real.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>Manteniendo la voz de marca</h3><p className='mb-4'>El secreto está en entrenar a tu modelo de lenguaje con ejemplos exactos de tu estilo de escritura, tono de comunicación y valores. La IA debe encargarse del borrador inicial y del formato para diferentes canales, pero la curación final y el toque humano siguen siendo indispensables.</p>",
    date: '10 May 2026',
    readTime: '6 min',
    publishedAt: '2026-05-10',
    homeSection: 'more',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  },
]

export const visibleArticles = isPublicSiteMode
  ? articles.filter((article) => article.public)
  : articles

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

export default function BlogPage() {
  const { category } = useParams()
  const [activeCategory, setActiveCategory] = useState(category || null)
  const [searchQuery, setSearchQuery] = useState('')
  // Caché instantáneo (SWR) para mostrar artículos en 0ms al abrir la página
  const [articlesList, setArticlesList] = useState(() => {
    try {
      const cached = localStorage.getItem('qaway_blog_articles_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return []
  })

  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('qaway_blog_articles_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return false
      }
    } catch (e) {}
    return true
  })

  useEffect(() => {
    setActiveCategory(category || null)
  }, [category])

  // Cargar artículos dinámicamente desde Supabase (sincronizado con Blog Studio)
  useEffect(() => {
    async function fetchSupabaseArticles() {
      try {
        // Intentar consultar la tabla posts (del editor)
        let { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'publicado')
          .order('published_at', { ascending: false })

        // Si no encuentra la tabla posts o viene vacía, consultar blog_articles
        if (error || !data || data.length === 0) {
          const res = await supabase
            .from('blog_articles')
            .select('*')
            .eq('public', true)
            .order('published_at', { ascending: false })
          if (!res.error && res.data && res.data.length > 0) {
            data = res.data
            error = null
          }
        }

        if (!error && data && data.length > 0) {
          const mappedArticles = data.map((item) => ({
            id: item.slug || item.id,
            category: item.category ? item.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-') : 'marketing',
            categoryLabel: item.category || item.category_label || 'General',
            formatLabel: item.format_label || 'Guía',
            title: item.title,
            excerpt: item.excerpt || '',
            content: item.content_html || item.content || item.body || '',
            date: item.published_at ? new Date(item.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : item.date || 'Reciente',
            readTime: item.reading_time ? `${item.reading_time} min` : item.read_time || '4 min',
            publishedAt: item.published_at || item.created_at,
            public: item.status === 'publicado' || item.public !== false,
            featured: item.featured ? { order: item.featured_order || 1, label: item.featured_label || 'Destacado' } : null,
            image: item.cover_url || item.image || item.cover_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
            audioUrl: item.audio_url || null,
          }))
          setArticlesList(mappedArticles)
          // Guardar en caché para la próxima visita inmediata (0ms)
          try {
            localStorage.setItem('qaway_blog_articles_cache', JSON.stringify(mappedArticles))
          } catch (e) {}
        } else {
          // Fallback a artículos locales solo si no hay ninguno en Supabase
          setArticlesList(visibleArticles)
        }
      } catch (err) {
        console.warn('[Blog] Fallback a artículos locales:', err)
        setArticlesList((prev) => (prev.length > 0 ? prev : visibleArticles))
      } finally {
        setLoading(false)
      }
    }

    fetchSupabaseArticles()
  }, [])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const isSearchActive = normalizedSearch.length > 0

  const filteredArticles = articlesList.filter((article) => {
    const matchesCategory = activeCategory ? article.category === activeCategory : true
    const searchableText = [
      article.title,
      article.excerpt,
      article.categoryLabel,
      article.formatLabel,
      (article.content || '').replace(/<[^>]+>/g, ' '),
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = isSearchActive ? searchableText.includes(normalizedSearch) : true
    return matchesCategory && matchesSearch
  })

  // Conteo de artículos por categoría
  const categoriesWithCounts = categories.map((cat) => {
    const count = articlesList.filter((article) => article.category === cat.key).length
    return {
      ...cat,
      countNum: count,
      count: `${count} publicación${count !== 1 ? 'es' : ''}`,
    }
  })

  // REGLA: SOLO mostrar categorías que tienen artículos publicados (count > 0)
  const activeCategoriesWithArticles = categoriesWithCounts.filter((cat) => cat.countNum > 0)

  const activeCategoryObj = categoriesWithCounts.find((cat) => cat.key === activeCategory)

  const selectCategory = (nextCategory) => {
    setActiveCategory(nextCategory)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', nextCategory ? '/blog/' + nextCategory : '/blog')
    }
  }

  // 1. Artículos con marca explícita de destacados
  const explicitlyFeatured = articlesList
    .filter((article) => article.featured)
    .sort((a, b) => (a.featured?.order || 1) - (b.featured?.order || 1))

  let highlightedArticles = []
  let secondaryArticles = []

  if (explicitlyFeatured.length > 0) {
    highlightedArticles = explicitlyFeatured
    secondaryArticles = articlesList
      .filter((article) => !article.featured)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  } else if (articlesList.length <= 3) {
    // Si hay 3 o menos publicaciones en total, todas van a Destacados (portada principal llena)
    highlightedArticles = [...articlesList].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    secondaryArticles = []
  } else {
    // Si hay más de 3 y ninguna marcada: las primeras 3 más recientes son Destacadas, el resto va a Últimos artículos
    const sorted = [...articlesList].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    highlightedArticles = sorted.slice(0, 3)
    secondaryArticles = sorted.slice(3)
  }

  const renderArticleCard = (article, idx) => (
    <Link to={`/blog/articulo/${article.id}`} key={article.id} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: idx * 0.08 }}
        className="group flex h-full flex-col justify-between overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-400 hover:border-black/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]"
      >
        <div>
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-[#191918]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
                {article.categoryLabel}
              </span>
              <span className="rounded-full border border-white/20 bg-gradient-to-r from-[#ea580c] to-[#c2410c] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                {article.formatLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <div className="mb-3 flex items-center gap-4 font-mono text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#ea580c]" /> {article.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#ea580c]" /> {article.readTime}
                </span>
              </div>
              <h3
                className="mb-2.5 text-[20px] font-bold leading-snug text-[#191918] transition-colors duration-300 group-hover:text-zinc-600 sm:text-[22px]"
                style={displayFont}
              >
                {article.title}
              </h3>
              <p className="line-clamp-3 text-sm font-normal leading-relaxed text-black/70">
                {article.excerpt}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm font-bold text-[#191918] transition-colors duration-300 group-hover:text-[#ff4b0b]">
              <span>Leer artículo completo</span>
              <ArrowRight className="h-4 w-4 transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:text-[#ff4b0b]" />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white selection:bg-[#ff4b0b] selection:text-white">
      <div>
        {/* ========================================================================= */}
        {/* HERO WORDPRESS STYLE: DEGRADADO SUAVE (BLANCO EN EL NAVBAR -> CÁLIDO)     */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* HERO WORDPRESS STYLE: DEGRADADO SUAVE CON CONTROLES INTEGRADOS            */}
        {/* ========================================================================= */}
        <section className="relative z-20 overflow-hidden border-b border-black/5 bg-gradient-to-b from-white via-[#fff9f6] to-[#fff1eb] pb-8 pt-20 sm:pb-10 sm:pt-28">
          <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
            
            {/* Cabecera del Hero */}
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Blog</span>
              </div>

              <motion.h1
                className="text-4xl font-bold tracking-tight text-[#191918] sm:text-5xl lg:text-6xl"
                style={displayFont}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Blog<span className="text-[#ff4b0b]">.</span>
              </motion.h1>

              <motion.p
                className="mt-4 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Encuentra artículos, tutoriales y guías sobre IA, automatización, marketing, diseño y sistemas digitales.
              </motion.p>
            </div>

            {/* Fila Integrada de Control (Filtros a la izquierda + Buscador a la derecha) */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* 1. Lista de píldoras horizontal (Izquierda) */}
              <div className="flex flex-wrap items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {/* Botón Todos */}
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-[13px] sm:text-sm font-semibold transition-all shadow-xs ${
                    activeCategory === null
                      ? 'bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] text-white shadow-sm shadow-[#ff4b0b]/25'
                      : 'border border-black/10 bg-white/85 backdrop-blur-xs text-[#191918] hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b]'
                  }`}
                >
                  Todos
                </button>

                {/* Categorías (SOLO LAS QUE TIENEN ARTÍCULOS) */}
                {activeCategoriesWithArticles.map((cat) => {
                  const isActive = activeCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => selectCategory(cat.key)}
                      className={`shrink-0 rounded-lg px-4 py-2.5 text-[13px] sm:text-sm font-semibold transition-all shadow-xs ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] text-white shadow-sm shadow-[#ff4b0b]/25'
                          : 'border border-black/10 bg-white/85 backdrop-blur-xs text-[#191918] hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b]'
                      }`}
                    >
                      {cat.title}
                    </button>
                  )
                })}
              </div>

              {/* 2. Buscador Compacto en la misma fila (Derecha) */}
              <div className="w-full sm:w-80 md:w-96 shrink-0">
                <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2.5 shadow-xs backdrop-blur-xs transition-all focus-within:border-[#ff4b0b] focus-within:bg-white focus-within:shadow-[0_6px_24px_rgba(255,75,11,0.14)]">
                  <Search className="h-4 w-4 text-black/40 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar temas o herramientas..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#191918] outline-none placeholder:text-black/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-black/40 hover:text-[#ff4b0b]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        <section className="bg-white pb-16 pt-8 sm:pt-10 lg:pb-24">
          <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
            {loading ? (
              /* Skeleton Loader suave mientras conecta con Supabase */
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-black/5 bg-[#fafafc] p-4">
                    <div className="aspect-[16/9] w-full rounded-xl bg-black/5 mb-4" />
                    <div className="h-4 w-1/4 rounded bg-black/5 mb-3" />
                    <div className="h-6 w-3/4 rounded bg-black/5 mb-2" />
                    <div className="h-4 w-full rounded bg-black/5 mb-4" />
                    <div className="h-3 w-1/3 rounded bg-black/5" />
                  </div>
                ))}
              </div>
            ) : activeCategory || isSearchActive ? (
              <>
                {filteredArticles.length > 0 ? (
                  <>
                    <div className="mb-6 flex items-center justify-between gap-4 border-b border-black/10 pb-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#191918]/60">
                        {filteredArticles.length} publicación{filteredArticles.length !== 1 ? 'es' : ''} encontrada{filteredArticles.length !== 1 ? 's' : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => { selectCategory(null); setSearchQuery('') }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#191918] transition-colors hover:text-[#ff4b0b]"
                      >
                        <ArrowLeft size={13} /> Ver todo el blog
                      </button>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {filteredArticles.map((article, idx) => renderArticleCard(article, idx))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-black/10 bg-white py-20 text-center">
                    <Newspaper className="mx-auto mb-4 h-12 w-12 text-[#191918]/30" />
                    <p className="text-sm font-bold uppercase tracking-wider text-[#191918]/60">
                      No encontramos publicaciones con ese criterio.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 1. SECCIÓN DESTACADOS (Sin raya divisoria sobrante) */}
                {highlightedArticles.length > 0 && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold tracking-tight text-[#191918] sm:text-3xl" style={displayFont}>
                        Destacados
                      </h2>
                      <p className="mt-1 text-xs text-black/60 sm:text-sm">
                        Guías y temas seleccionados por el equipo de Qaway Lab.
                      </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {highlightedArticles.map((article, idx) => renderArticleCard(article, idx))}
                    </div>
                  </div>
                )}

                {/* 2. SECCIÓN ÚLTIMOS ARTÍCULOS */}
                {secondaryArticles.length > 0 && (
                  <div className="mt-16">
                    <div className="mb-8 border-b border-black/10 pb-4">
                      <h2 className="text-2xl font-bold tracking-tight text-[#191918] sm:text-3xl" style={displayFont}>
                        Últimos artículos
                      </h2>
                      <p className="mt-1 text-xs text-black/60 sm:text-sm">
                        Todas las publicaciones y novedades recientes.
                      </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {secondaryArticles.map((article, idx) => renderArticleCard(article, idx))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
