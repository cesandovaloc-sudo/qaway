import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Header } from '@/pages/9-pruebas/5-Recursos/RecursosPruebaPage'
import {
  Newspaper, TrendingUp, BookOpen, Target,
  Cpu, ArrowRight, Calendar, Clock, ArrowLeft
} from 'lucide-react'

const categories = [
  { icon: TrendingUp, title: 'Noticias y Tendencias', description: 'Análisis de novedades en IA, tecnología, marketing y diseño.', path: '/blog/tendencias', count: '2 artículos' },
  { icon: BookOpen, title: 'Tutoriales', description: 'Artículos prácticos paso a paso sobre herramientas y procesos digitales.', path: '/blog/tutoriales', count: '2 artículos' },
  { icon: Target, title: 'Estrategia', description: 'Análisis y criterio para tomar mejores decisiones digitales.', path: '/blog/estrategia', count: '1 artículo' },
  { icon: Cpu, title: 'Sistemas Digitales', description: 'Implementación práctica de IA, automatización y mejora operativa.', path: '/blog/sistemas-digitales', count: '2 artículos' },
]

export const articles = [
  {
    id: 'como-automatizar-facturacion-make-chatgpt',
    category: 'sistemas-digitales',
    categoryLabel: 'Sistemas Digitales',
    title: 'Cómo estructurar una facturación automática con Make y ChatGPT',
    excerpt: 'Automatiza la generación de facturas, almacenamiento de PDFs y envío por correo sin mover un solo dedo.',
    content: "<p className='mb-4'>Automatizar tareas repetitivas es uno de los mejores retornos de inversión cuando implementas Inteligencia Artificial en tu negocio. En este artículo, aprenderás a construir un flujo automatizado que toma datos de un formulario de venta, genera una factura formal usando ChatGPT, crea un PDF limpio y lo envía al correo del cliente de manera 100% autónoma.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>El workflow en 3 pasos clave:</h3><ul className='list-disc pl-5 mb-4 space-y-2'><li><strong>Paso 1: El disparador (Trigger):</strong> Conectamos la pasarela de pagos (como Stripe o WooCommerce) a Make para detectar cada nueva compra.</li><li><strong>Paso 2: Procesamiento y estructura con ChatGPT:</strong> La IA se encarga de formatear el concepto, validar el tipo de cambio y estructurar la información fiscal sin errores.</li><li><strong>Paso 3: Generación del PDF y Envío:</strong> Usamos un generador de plantillas PDF para crear el documento final y enviarlo vía Gmail automáticamente.</li></ul><p>Este sistema reduce a cero los errores de facturación and libera más de 10 horas de trabajo operativo al mes para tu equipo.</p>",
    date: '04 Jun 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'guia-crm-notion-whatsapp',
    category: 'tutoriales',
    categoryLabel: 'Tutoriales',
    title: 'Guía paso a paso: CRM en Notion y envíos por WhatsApp',
    excerpt: 'Crea un embudo comercial conectado a WhatsApp para notificar a tu equipo sobre leads calificados al instante.',
    content: "<p className='mb-4'>Tener un CRM no tiene por qué ser costoso ni complejo. Con Notion y la integración correcta de WhatsApp, puedes centralizar tus contactos comerciales y recibir notificaciones instantáneas cada vez que entra un nuevo lead.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>¿Cómo conectar ambos mundos?</h3><p className='mb-4'>El truco consiste en utilizar webhooks intermedios que conecten tu base de datos de Notion con la API de WhatsApp Business. De esta manera, cuando mueves una tarjeta de prospecto a la columna de 'Contactado', el sistema puede enviar un mensaje predeterminado al cliente automáticamente.</p><p className='mb-4'>Este enfoque híbrido de CRM combina la flexibilidad visual de Notion con la inmediatez de WhatsApp para aumentar tus tasas de cierre comerciales de manera sustancial.</p>",
    date: '02 Jun 2026',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'por-que-tu-negocio-necesita-adn-visual',
    category: 'estrategia',
    categoryLabel: 'Estrategia',
    title: 'Por qué tu negocio necesita un ADN visual único',
    excerpt: 'La coherencia de marca reduce el costo de adquisición de clientes y genera autoridad inmediata. Estrategia de marca moderna.',
    content: "<p className='mb-4'>En un mercado saturado de plantillas genéricas, la coherencia de marca y un diseño premium no son lujos, son herramientas de conversión directa. Un ADN visual consistente reduce el costo de adquisición de tus clientes al generar confianza inmediata.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>La regla de la primera impresión</h3><p className='mb-4'>Los usuarios juzgan la credibilidad de tu negocio en los primeros 3 segundos de cargar tu sitio web. Si tu tipografía, colores y composiciones lucen amateur, el prospecto asumirá que tu servicio también lo es. Trabajar en una identidad visual sólida y consistente es la base de cualquier estrategia de marketing digital exitosa.</p>",
    date: '28 May 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'agentes-autonomos-ia-productividad',
    category: 'tendencias',
    categoryLabel: 'Noticias y Tendencias',
    title: 'Agentes autónomos de IA: El futuro de la productividad en 2026',
    excerpt: 'Los agentes ya no solo responden preguntas; ejecutan tareas operativas completas con criterio propio. Análisis de tendencias.',
    content: "<p className='mb-4'>Los chatbots de preguntas y respuestas son cosa del pasado. En 2026, los agentes autónomos de IA tienen la capacidad de ejecutar flujos completos de trabajo, interactuar con APIs externas, tomar decisiones lógicas y aprender de sus propios errores.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>El impacto en los equipos operativos</h3><p className='mb-4'>Un agente de IA ahora puede revisar una bandeja de correo de soporte, clasificar las solicitudes, consultar la base de datos interna y responder con una solución personalizada de forma autónoma. La productividad de las empresas se está multiplicando gracias a estos copilotos autónomos.</p>",
    date: '25 May 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sops-notion-organizar-procesos-delegar',
    category: 'sistemas-digitales',
    categoryLabel: 'Sistemas Digitales',
    title: 'SOPs en Notion: Cómo organizar procesos para delegar sin caos',
    excerpt: 'Convierte la memoria de tu equipo en un sistema documentado y automatizado para dejar de depender de supervisión constante.',
    content: "<p className='mb-4'>Delegar tareas es la única forma de escalar un negocio, pero hacerlo sin procesos documentados (SOPs) solo genera caos y pérdida de calidad. En esta guía te enseñamos a administrar una base de conocimientos en Notion.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>Estructura de un SOP efectivo:</h3><p className='mb-4'>Cada SOP debe responder 3 preguntas básicas de forma visual: ¿Qué se hace? ¿Cómo se hace? (con capturas o videos cortos) y ¿Qué hacer si algo sale mal? Notion es la plataforma perfecta para mantener estos documentos vivos y accesibles a todo tu equipo.</p>",
    date: '18 May 2026',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'automatizacion-contenidos-ia-coherencia',
    category: 'tutoriales',
    categoryLabel: 'Tutoriales',
    title: 'Automatización de contenidos con IA sin perder coherencia',
    excerpt: 'Una metodología clara para generar copys y programar posts manteniendo intacta la voz y valores de tu marca.',
    content: "<p className='mb-4'>Automatizar la creación de contenido es tentador, pero el spam automatizado destruye la reputación de tu marca. Aquí te mostramos una metodología para usar IA como un amplificador creativo de tu voz real.</p><h3 className='text-xl font-bold mt-6 mb-3 text-zinc-950'>Manteniendo la voz de marca</h3><p className='mb-4'>El secreto está en entrenar a tu modelo de lenguaje con ejemplos exactos de tu estilo de escritura, tono de comunicación y valores. La IA debe encargarse del borrador inicial y del formato para diferentes canales, pero la curación final y el toque humano siguen siendo indispensables.</p>",
    date: '10 May 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
  }
]

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

export default function BlogPage() {
  const { category } = useParams()
  const activeCategory = category || null

  const filteredArticles = activeCategory
    ? articles.filter(art => art.category === activeCategory)
    : articles

  // Calcular conteos dinámicamente
  const categoriesWithCounts = categories.map(cat => {
    const catKey = cat.path.split('/').pop()
    const count = articles.filter(art => art.category === catKey).length
    return {
      ...cat,
      count: `${count} artículo${count !== 1 ? 's' : ''}`
    }
  })

  const activeCategoryObj = categoriesWithCounts.find(cat => cat.path.endsWith(`/${activeCategory}`))
  const categoryTitle = activeCategoryObj ? activeCategoryObj.title : 'Categoría'

  const renderArticleCard = (art, idx) => (
    <Link to={`/blog/articulo/${art.id}`} key={art.id} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: idx * 0.08 }}
        className="group bg-white rounded-[12px] border border-black/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:border-[#ff4b0b]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full justify-between"
      >
        <div>
          <div className="relative h-48 overflow-hidden bg-zinc-955">
            <img
              src={art.image}
              alt={art.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-[#191918] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {art.categoryLabel}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#ff4b0b]" /> {art.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#ff4b0b]" /> {art.readTime}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#191918] mb-2 leading-tight group-hover:text-[#ff4b0b] transition-colors">
              {art.title}
            </h3>
            <p className="text-xs text-black/60 font-normal leading-relaxed line-clamp-3">
              {art.excerpt}
            </p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#191918] group-hover:text-[#ff4b0b] transition-colors">
            <span>Leer artículo completo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.article>
    </Link>
  )

  return (
    <div className="min-h-screen bg-[#f2f1ef] selection:bg-[#ff4b0b] selection:text-white flex flex-col justify-between">
      <div>
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden bg-[#f5f5f4] pt-28 pb-16 text-[#191918] sm:pt-36 sm:pb-24 border-b border-black/10 z-20">
          
          {/* Background CSS Decoration */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#f5f5f4]">
            {/* Subtle technical grid pattern */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Light radial glow to soften layout */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7),transparent_70%)]" />

            {/* Dark Architectural Facade on the right */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-[42%] md:w-[34%] lg:w-[28%] bg-[#1a1918] transition-all duration-300 shadow-2xl"
              style={{
                clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)'
              }}
            >
              {/* Concrete panel joints / lines */}
              <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:55px_75px]" />
              {/* Soft shadow gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.5),transparent_70%)]" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent" />
              {/* Inner highlight line along the diagonal border */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
            </div>
          </div>

          <Header />

          <div className="relative z-10 mx-auto max-w-[94rem] px-6 text-left sm:px-10 lg:px-14">
            <div className="min-h-[190px] sm:h-[220px]">
              <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Blog</span>
              </div>

              <motion.h1 
                className="text-[clamp(3rem,6.5vw,5rem)] font-bold uppercase leading-[0.85] tracking-[-0.03em] text-[#191918]"
                style={displayFont}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Blog<span className="text-[#ff4b0b]">.</span>
              </motion.h1>
              
              <motion.p 
                className="mt-6 max-w-xl text-[15px] sm:text-base leading-relaxed text-[#191918]/70"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Tu manual de operaciones para la era de la <strong className="font-bold text-[#ff4b0b]">inteligencia artificial.</strong>
              </motion.p>
            </div>

            {/* CATEGORIES BUTTONS */}
            <div className="mt-12 flex flex-wrap items-center gap-3 max-w-4xl relative">
              <Link
                to="/blog"
                className={`group flex flex-1 items-center justify-center min-w-[110px] gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${
                  activeCategory === null ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'
                }`}
              >
                <span className={`text-[11px] font-bold uppercase tracking-widest ${activeCategory === null ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>Todos</span>
              </Link>

              {categoriesWithCounts.map((cat, i) => {
                const Icon = cat.icon
                const catKey = cat.path.split('/').pop()
                const isActive = activeCategory === catKey
                return (
                  <Link
                    key={i}
                    to={cat.path}
                    className={`group flex flex-1 items-center justify-center min-w-[130px] gap-2 rounded-md border border-black/10 px-5 py-3 transition-all hover:border-[#ff4b0b]/40 hover:shadow-sm ${
                      isActive ? 'bg-[#191918] text-[#ff4b0b]' : 'bg-white text-[#191918]'
                    }`}
                  >
                    <Icon size={16} className={`transition-colors ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]/40 group-hover:text-[#ff4b0b]'}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-[#ff4b0b]' : 'text-[#191918]'}`}>{cat.title}</span>
                  </Link>
                )
              })}

              {/* Dot grid decoration */}
              <div className="absolute right-0 translate-x-[110%] -bottom-1 hidden lg:block opacity-60 pointer-events-none">
                <svg width="45" height="30" viewBox="0 0 45 30" fill="none">
                  <circle cx="5" cy="5" r="1.5" fill="#ff4b0b" />
                  <circle cx="15" cy="5" r="1.5" fill="#ff4b0b" />
                  <circle cx="25" cy="5" r="1.5" fill="#ff4b0b" />
                  <circle cx="35" cy="5" r="1.5" fill="#ff4b0b" />
                  <circle cx="5" cy="15" r="1.5" fill="#ff4b0b" />
                  <circle cx="15" cy="15" r="1.5" fill="#ff4b0b" />
                  <circle cx="25" cy="15" r="1.5" fill="#ff4b0b" />
                  <circle cx="35" cy="15" r="1.5" fill="#ff4b0b" />
                  <circle cx="5" cy="25" r="1.5" fill="#ff4b0b" />
                  <circle cx="15" cy="25" r="1.5" fill="#ff4b0b" />
                  <circle cx="25" cy="25" r="1.5" fill="#ff4b0b" />
                  <circle cx="35" cy="25" r="1.5" fill="#ff4b0b" />
                </svg>
              </div>
            </div>

          </div>
        </section>
   
        {/* Listado de Artículos */}
        <section className="pb-12 pt-10 lg:pb-24 lg:pt-16 bg-[#f2f1ef]">
          <div className="mx-auto max-w-[94rem] px-6 sm:px-10 lg:px-14">
            
            {activeCategory ? (
              // 1. Vista con Filtro de Categoría Activo
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-4 border-b border-black/10">
                  <div>
                    <div className="flex items-center gap-2 text-black/40 text-xs font-bold uppercase tracking-widest mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />
                      Categoría
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-[#191918]" style={displayFont}>
                      {categoryTitle}
                    </h2>
                  </div>
                  <div className="shrink-0">
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 border border-black/10 text-[#191918] px-5 py-2.5 rounded-md font-bold uppercase tracking-widest text-xs transition-all duration-300"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Ver todos los artículos
                    </Link>
                  </div>
                </div>

                {filteredArticles.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.map((art, idx) => renderArticleCard(art, idx))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white border border-black/10 rounded-xl">
                    <Newspaper className="w-12 h-12 text-[#191918]/30 mx-auto mb-4" />
                    <p className="text-[#191918]/60 text-sm font-bold uppercase tracking-wider">No se encontraron artículos en esta categoría por el momento.</p>
                  </div>
                )}
              </>
            ) : (
              // 2. Vista General (Sin Filtro): Secciones "Artículos destacados" y "Más artículos"
              <>
                {/* Sección 1: Artículos destacados */}
                <div className="mb-8 border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2 text-black/40 text-xs font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />
                    Artículos destacados
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {articles.slice(0, 3).map((art, idx) => renderArticleCard(art, idx))}
                </div>

                {/* Sección 2: Más artículos */}
                <div className="mb-8 border-b border-black/10 pb-4">
                  <div className="flex items-center gap-2 text-black/40 text-xs font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />
                    Más artículos
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.slice(3).map((art, idx) => renderArticleCard(art, idx))}
                </div>
              </>
            )}

          </div>
        </section>
      </div>
    </div>
  )
}
