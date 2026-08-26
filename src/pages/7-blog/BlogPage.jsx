import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { isPublicSiteMode } from '@/config/siteVisibility'
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
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

export default function BlogPage() {
  const { category } = useParams()
  const [activeCategory, setActiveCategory] = useState(category || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  useEffect(() => {
    setActiveCategory(category || null)
  }, [category])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const isSearchActive = normalizedSearch.length > 0
  const shouldExpandSearch = isSearchExpanded || isSearchActive

  const filteredArticles = visibleArticles.filter((article) => {
    const matchesCategory = activeCategory ? article.category === activeCategory : true
    const searchableText = [
      article.title,
      article.excerpt,
      article.categoryLabel,
      article.formatLabel,
      article.content.replace(/<[^>]+>/g, ' '),
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = isSearchActive ? searchableText.includes(normalizedSearch) : true
    return matchesCategory && matchesSearch
  })

  const categoriesWithCounts = categories.map((cat) => {
    const count = visibleArticles.filter((article) => article.category === cat.key).length
    return {
      ...cat,
      count: `${count} publicación${count !== 1 ? 'es' : ''}`,
    }
  })

  const activeCategoryObj = categoriesWithCounts.find((cat) => cat.key === activeCategory)

  const selectCategory = (nextCategory) => {
    setActiveCategory(nextCategory)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', nextCategory ? '/blog/' + nextCategory : '/blog')
    }
  }

  const highlightedArticles = visibleArticles
    .filter((article) => article.featured)
    .sort((a, b) => a.featured.order - b.featured.order)

  const secondaryArticles = visibleArticles
    .filter((article) => article.homeSection === 'more' || !article.featured)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  const renderArticleCard = (article, idx) => (
    <Link to={`/blog/articulo/${article.id}`} key={article.id} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: idx * 0.08 }}
        className="group flex h-full flex-col justify-between overflow-hidden rounded-[12px] border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-500 hover:border-[#ff4b0b]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)]"
      >
        <div>
          <div className="relative h-48 overflow-hidden bg-zinc-950">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-[#191918] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                {article.categoryLabel}
              </span>
              <span className="rounded-full border border-[#ff4b0b]/20 bg-[#ff4b0b]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                {article.formatLabel}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-4 font-mono text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[#ff4b0b]" /> {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#ff4b0b]" /> {article.readTime}
              </span>
            </div>
            <h3 className="mb-2 text-base font-bold leading-tight text-[#191918] transition-colors group-hover:text-[#ff4b0b]">
              {article.title}
            </h3>
            <p className="line-clamp-3 text-xs font-normal leading-relaxed text-black/60">
              {article.excerpt}
            </p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-[#191918] transition-colors group-hover:text-[#ff4b0b]">
            <span>Leer artículo completo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        <section className="relative z-20 overflow-hidden border-b border-black/5 bg-gradient-to-b from-white via-[#fff9f6] to-[#fff1eb] pb-14 pt-24 sm:pb-20 sm:pt-32">
          <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
            <div className="max-w-3xl">
              
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
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
                Explora ideas por <strong className="font-semibold text-[#191918]">pilares reales del negocio</strong>, no por etiquetas editoriales sueltas.
              </motion.p>

              {/* Buscador Integrado (Borde de foco Naranja) */}
              <motion.div
                className="mt-8 max-w-xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all focus-within:border-[#ff4b0b] focus-within:shadow-[0_8px_30px_rgba(255,75,11,0.15)]">
                  <Search className="h-5 w-5 text-black/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar temas, artículos o herramientas..."
                    className="w-full bg-transparent text-sm text-[#191918] outline-none placeholder:text-black/40"
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
              </motion.div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BARRA DE PÍLDORAS / CATEGORÍAS (FONDO BLANCO + BOTÓN ACTIVO SUAVE)        */}
        {/* ========================================================================= */}
        <div className="border-b border-black/10 bg-white py-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="mx-auto flex max-w-[94rem] items-center justify-between gap-4 px-6 sm:px-10 lg:px-14">
            
            {/* Lista de píldoras horizontal */}
            <div className="flex flex-1 items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {/* Botón Todos */}
              <button
                type="button"
                onClick={() => selectCategory(null)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                  activeCategory === null
                    ? 'bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] text-white shadow-sm shadow-[#ff4b0b]/20'
                    : 'border border-black/10 bg-white text-[#191918] hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b]'
                }`}
              >
                Todos
              </button>

              {/* Categorías */}
              {categoriesWithCounts.map((cat) => {
                const isActive = activeCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => selectCategory(cat.key)}
                    className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#ff703d] via-[#ff5a22] to-[#ff4b0b] text-white shadow-sm shadow-[#ff4b0b]/20'
                        : 'border border-black/10 bg-white text-[#191918] hover:border-[#ff4b0b]/40 hover:text-[#ff4b0b]'
                    }`}
                  >
                    {cat.title}
                  </button>
                )
              })}
            </div>

            {/* Selector lateral "Ver Todos" */}
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={() => { selectCategory(null); setSearchQuery('') }}
                className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#191918] transition-colors hover:border-[#ff4b0b]/50 hover:text-[#ff4b0b]"
              >
                <span>Ver Todos</span>
                <ChevronDown className="h-3.5 w-3.5 text-black/50" />
              </button>
            </div>

          </div>
        </div>

        <section className="bg-white pb-12 pt-8 lg:pb-24 lg:pt-10">
          <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
            {activeCategory || isSearchActive ? (
              <>
                {filteredArticles.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#191918]/45">
                        {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''}
                      </p>
                      <button type="button" onClick={() => { selectCategory(null); setSearchQuery('') }} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#191918]/55 transition-colors hover:text-[#ff4b0b]">
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
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-black/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#191918] sm:text-3xl" style={displayFont}>
                      Pilares destacados
                    </h2>
                    <p className="mt-1 text-xs text-black/60 sm:text-sm">
                      Temas y guías seleccionadas por el equipo de Qaway Lab.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectCategory(null)}
                    className="self-start sm:self-auto rounded-lg border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-[#191918] transition-colors hover:border-black/40 hover:bg-[#f4f6fa]"
                  >
                    Ver todos
                  </button>
                </div>

                {highlightedArticles.length > 0 && (
                  <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {highlightedArticles.map((article, idx) => renderArticleCard(article, idx))}
                  </div>
                )}

                {secondaryArticles.length > 0 && (
                  <>
                    <div className="mb-8 border-b border-black/10 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff4b0b]" />
                        Más publicaciones
                      </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {secondaryArticles.map((article, idx) => renderArticleCard(article, idx))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
