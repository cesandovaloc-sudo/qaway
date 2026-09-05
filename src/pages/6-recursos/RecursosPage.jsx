import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import {
  FileText, BookMarked, MessageSquare, ClipboardCheck,
  Terminal, ArrowRight, ArrowLeft, Star, TrendingUp, Sparkles, ChevronRight, Search,
  Sliders, Zap
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import { supabase } from '@/config/supabase'
import qawayCalendarImage from './assets/qaway-calendar.png'
import qawayScriptBackupImage from './assets/qaway-script-backup.png'
import primerosFlujosImage from './1-primeros-flujos IA/ChatGPT Image 1 sept 2026, 19_04_24.png'
import { isPublicSiteMode } from '@/config/siteVisibility'

const categories = [
  { icon: BookMarked, title: 'Ebooks & Guías', key: 'ebooks', description: 'Experiencias de lectura digital, descargables y conectadas con tu ecosistema de recursos.' },
  { icon: Terminal, title: 'Scripts & CLI', key: 'scripts', description: 'Pasos de configuración técnica para workflows de automatización e integraciones IA.' },
  { icon: FileText, title: 'Plantillas', key: 'plantillas', description: 'Materiales editables y organizados listos para estandarizar la operación de tu negocio.' },
  { icon: MessageSquare, title: 'Prompts', key: 'prompts', description: 'Instrucciones avanzadas para procesos creativos y operativos con Inteligencia Artificial.' },
  { icon: ClipboardCheck, title: 'Checklists', key: 'checklists', description: 'Listas de control tácticas para ejecutar lanzamientos y flujos de trabajo sin fallas.' },
]

// Recursos base reales y funcionales disponibles en el proyecto
const baseResources = [
  {
    id: 'primeros-flujos-ia',
    category: 'ebooks',
    categoryLabel: 'Ebooks',
    title: 'Cómo estructurar tus primeros flujos de trabajo con IA',
    description: 'Aprende a identificar una tarea, dividirla en pasos y trabajar mejor con IA sin complicarte con diez herramientas.',
    type: 'Guía Práctica Oficial (10 Páginas)',
    badge: 'Gratis',
    publishedAt: '2026-09-01',
    public: true,
    homeSection: 'featured',
    featured: {
      order: 1,
      label: 'Nuevo Lanzamiento',
      icon: 'star'
    },
    path: '/recursos/primeros-flujos-ia',
    image: primerosFlujosImage
  },
  {
    id: 'optimizador-imagenes-webp',
    category: 'scripts',
    categoryLabel: 'Scripts',
    title: 'Cómo optimizar imágenes web y reducir hasta 95% su peso con WebP (CLI)',
    description: 'Script NodeJS con motor Sharp para automatizar la conversión masiva de carpetas enteras de JPG y PNG en WebP ultralivianos.',
    type: 'Script Node.js + Guía CLI',
    badge: 'Gratis',
    publishedAt: '2026-09-03',
    public: false,
    homeSection: 'featured',
    featured: {
      order: 2,
      label: 'Herramienta Técnica',
      icon: 'trending'
    },
    path: '/recursos/optimizador-imagenes-webp',
    image: qawayScriptBackupImage
  },
  {
    id: 'google-calendar-dominado',
    category: 'ebooks',
    categoryLabel: 'Ebooks',
    title: 'Google Calendar Dominado',
    description: 'Nuestra guía completa y plantilla para integrar Inteligencia Artificial en tu agenda diaria y automatizar flujos semanales.',
    type: 'Ebook Digital Interactivo',
    badge: 'Gratis',
    publishedAt: '2026-07-08',
    public: true,
    homeSection: 'new',
    path: '/recursos/ebooks/google-calendar-dominado',
    image: qawayCalendarImage
  },
]

const displayFont = {
  fontFamily: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif',
  letterSpacing: '-0.03em',
}

export default function RecursosPage() {
  const { category } = useParams()
  const [activeCategory, setActiveCategory] = useState(category || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dbResources, setDbResources] = useState([])
  const [loadingDb, setLoadingDb] = useState(false)

  // 1. Cargar recursos dinámicos desde Supabase si existen
  useEffect(() => {
    async function fetchSupabaseResources() {
      setLoadingDb(true)
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('public', true)

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id || item.slug,
            category: item.category || 'scripts',
            categoryLabel: item.category_label || item.category || 'General',
            title: item.title,
            description: item.description,
            type: item.type || 'Recurso',
            badge: item.badge || 'Gratis',
            publishedAt: item.published_at || item.created_at,
            public: true,
            homeSection: item.home_section || 'starter',
            path: item.path || `/recursos/${item.category}/${item.slug || item.id}`,
            image: item.image_url || qawayScriptBackupImage
          }))
          setDbResources(mapped)
        }
      } catch (err) {
        console.warn('[Supabase Recursos]', err.message)
      } finally {
        setLoadingDb(false)
      }
    }

    fetchSupabaseResources()
  }, [])

  useEffect(() => {
    setActiveCategory(category || null)
  }, [category])

  // Combinación de recursos locales reales y Supabase sin duplicados
  const allResources = useMemo(() => {
    const map = new Map()
    baseResources
      .filter(r => r.public === true)
      .forEach(r => map.set(r.id, r))
    dbResources.forEach(r => map.set(r.id, r))
    return Array.from(map.values())
  }, [dbResources])

  // Categorías que REALMENTE tienen recursos disponibles
  const availableCategories = useMemo(() => {
    return categories.filter(cat => {
      return allResources.some(res => res.category === cat.key)
    })
  }, [allResources])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const isSearchActive = normalizedSearch.length > 0

  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      const matchesCategory = activeCategory ? resource.category === activeCategory : true
      const searchableText = [
        resource.title,
        resource.description,
        resource.type,
        resource.categoryLabel,
        resource.badge,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = isSearchActive ? searchableText.includes(normalizedSearch) : true
      return matchesCategory && matchesSearch
    })
  }, [allResources, activeCategory, isSearchActive, normalizedSearch])

  const selectCategory = (nextCategory) => {
    setActiveCategory(nextCategory)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', nextCategory ? '/recursos/' + nextCategory : '/recursos')
    }
  }

  const featured = useMemo(() => {
    return allResources
      .filter(resource => resource.featured)
      .sort((a, b) => a.featured.order - b.featured.order)
      .slice(0, 2)
  }, [allResources])

  const highlighted = useMemo(() => {
    return allResources.filter(resource => resource.homeSection === 'starter')
  }, [allResources])

  const newResources = useMemo(() => {
    return allResources
      .filter(resource => resource.homeSection === 'new' || resource.featured)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 4)
  }, [allResources])

  const featuredStyles = [
    {
      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 40%, #c4b5fd 100%)',
      badgeBackground: 'rgba(124,58,237,0.15)',
      badgeColor: '#5b21b6',
      typeColor: '#6d28d9',
      titleColor: '#3b0764',
      shadow: '0 20px 50px rgba(139,92,246,0.15)'
    },
    {
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 40%, #80deea 100%)',
      badgeBackground: 'rgba(14,116,144,0.15)',
      badgeColor: '#155e75',
      typeColor: '#0e7490',
      titleColor: '#064e3b',
      shadow: '0 20px 50px rgba(6,182,212,0.15)'
    }
  ]

  const featuredIcons = {
    trending: TrendingUp,
    star: Star,
  }

  const FeaturedCard = ({ res, idx }) => {
    if (!res) return null
    const style = featuredStyles[idx] || featuredStyles[0]
    const FeaturedIcon = featuredIcons[res.featured?.icon] || Sparkles

    return (
      <Link to={res.path || '#'} className="block">
        <motion.div
          className="group relative flex flex-col-reverse sm:flex-col justify-between sm:justify-end overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 transition-all cursor-pointer min-h-[auto] sm:min-h-[300px]"
          style={{ background: style.background }}
          initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          whileHover={{ y: -6, boxShadow: style.shadow }}
        >
          <img 
            src={res.image} 
            alt={res.title || 'Recurso destacado'} 
            className="relative sm:absolute sm:-right-2 sm:top-1/2 sm:-translate-y-1/2 w-full max-w-[220px] sm:max-w-[320px] sm:w-[52%] mx-auto sm:mx-0 mt-4 sm:mt-0 rotate-1 sm:rotate-3 rounded-xl object-cover shadow-xl sm:shadow-2xl transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105" 
          />
          <div className="relative z-10 w-full sm:w-[58%]">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: style.badgeBackground, color: style.badgeColor }}>
              <FeaturedIcon size={12} strokeWidth={3} /> {res.featured?.label || 'Destacado'}
            </span>
            <p className="mb-1 text-[13px] font-medium" style={{ color: style.typeColor }}>{res.type}</p>
            <h3 className="text-[clamp(1.3rem,3vw,1.8rem)] font-bold leading-[1.15]" style={{ color: style.titleColor }}>
              {res.title}
            </h3>
          </div>
        </motion.div>
      </Link>
    )
  }
  const GalleryCard = ({ res, idx }) => {
    const isExternal = res.path.startsWith('http')
    const CardWrapper = isExternal ? 'a' : Link
    const wrapperProps = isExternal
      ? { href: res.path, target: '_blank', rel: 'noopener noreferrer' }
      : { to: res.path }

    return (
      <CardWrapper {...wrapperProps} className="group flex flex-col justify-between overflow-hidden rounded-md border border-black/10 bg-white transition-all hover:border-[#ff4b0b]/40 hover:shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: idx * 0.07 }}
          className="flex h-full flex-col"
        >
          <div className="relative w-full overflow-hidden bg-[#f8f9fc] pt-[65%]">
            <img 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              src={res.image} 
              alt={res.title} 
              loading="lazy" 
            />
          </div>
          <div className="flex flex-1 flex-col items-start justify-between p-5">
            <p className="text-sm font-bold leading-snug text-[#191918]">{res.title}</p>
            <span className={`mt-3 inline-block rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              res.badge === 'Premium' ? 'bg-[#ff4b0b]/10 text-[#ff4b0b]' : 'bg-[#191918]/5 text-[#191918]'
            }`}>
              {res.badge}
            </span>
          </div>
        </motion.div>
      </CardWrapper>
    )
  }

  const ListCard = ({ res, idx }) => {
    const isExternal = res.path.startsWith('http')
    const CardWrapper = isExternal ? 'a' : Link
    const wrapperProps = isExternal
      ? { href: res.path, target: '_blank', rel: 'noopener noreferrer' }
      : { to: res.path }
    const catObj = categories.find(c => c.key === res.category)
    const Icon = catObj ? catObj.icon : FileText

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: idx * 0.05 }}
      >
        <CardWrapper {...wrapperProps} className="group mb-3 flex items-center justify-between gap-6 rounded-md border border-black/10 bg-white p-5 transition-all hover:border-[#ff4b0b]/40 hover:shadow-lg">
          <div className="flex flex-1 items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-black/10 bg-[#f8f9fc] text-black/60 transition-colors group-hover:border-[#ff4b0b]/30 group-hover:bg-[#ff4b0b]/10 group-hover:text-[#ff4b0b]">
              <Icon size={20} />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#191918]/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#191918]/70">
                  {res.categoryLabel}
                </span>
                <span className="rounded-md bg-[#ff4b0b]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                  {res.type}
                </span>
              </div>
              <p className="text-[15px] font-bold leading-snug text-[#191918]">{res.title}</p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-black/60">{res.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-md bg-[#191918] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors group-hover:bg-[#ff4b0b]">
            <span>Abrir</span>
            <ArrowRight size={14} />
          </div>
        </CardWrapper>
      </motion.div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white selection:bg-[#ff4b0b] selection:text-white">
      <div>
        {/* ========================================================================= */}
        {/* HERO WORDPRESS STYLE: DEGRADADO SUAVE CON CONTROLES INTEGRADOS            */}
        {/* ========================================================================= */}
        <section className="relative z-20 overflow-hidden border-b border-black/5 bg-gradient-to-b from-white via-[#ffe6d8] to-[#ffd0b5] pb-8 pt-20 sm:pb-10 sm:pt-28">
          <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
            
            {/* Cabecera del Hero */}
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4b0b]">
                <span>/ Recursos</span>
              </div>

              <motion.h1
                className="text-4xl font-bold tracking-tight text-[#191918] sm:text-5xl lg:text-6xl"
                style={displayFont}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Recursos<span className="text-[#ff4b0b]">.</span>
              </motion.h1>

              <motion.p
                className="mt-4 max-w-2xl text-base leading-relaxed text-black/70 sm:text-lg"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Explora herramientas, plantillas, ebooks y recursos prácticos sobre IA, sistemas y productividad aplicada.
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

                {/* Categorías (SOLO LAS QUE TIENEN RECURSOS) */}
                {availableCategories.map((cat) => {
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
                    placeholder="Buscar temas o recursos..."
                    aria-label="Buscar temas o recursos"
                    className="w-full bg-transparent text-xs sm:text-sm text-[#191918] outline-none placeholder:text-black/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Limpiar búsqueda"
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
          <div className="mx-auto max-w-[1240px] px-6 sm:px-9">
          {!activeCategory && !isSearchActive ? (
            /* VIEW: NO FILTER SELECTED */
            <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {featured.length > 0 && (
                <div className="mb-14 grid gap-6 md:grid-cols-2">
                  {featured.map((res, idx) => (
                    <FeaturedCard key={res.id} res={res} idx={idx} />
                  ))}
                </div>
              )}
              {highlighted.length > 0 && (
                <>
                  <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                    <h2 className="qw-section-title--sm uppercase text-[#191918]" style={displayFont}>Para empezar</h2>
                    <Link to="/recursos/prompts" className="flex items-center gap-2 text-sm font-bold text-[#191918]/60 transition-colors hover:text-[#ff4b0b]">
                      Ver Mas <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {highlighted.map((res, idx) => (
                      <GalleryCard key={idx} res={res} idx={idx} />
                    ))}
                  </div>
                </>
              )}
              {newResources.length > 0 && (
                <>
                  <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                    <h2 className="qw-section-title--sm uppercase text-[#191918]" style={displayFont}>Recien agregados</h2>
                  </div>
                  <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {newResources.map((res, idx) => (
                      <GalleryCard key={idx} res={res} idx={idx} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {filteredResources.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#191918]/45">
                      {filteredResources.length} resultado{filteredResources.length !== 1 ? 's' : ''}
                    </p>
                    <button type="button" onClick={() => { selectCategory(null); setSearchQuery('') }} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#191918]/55 transition-colors hover:text-[#ff4b0b]">
                      <ArrowLeft size={13} /> Volver a todos
                    </button>
                  </div>
                  <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredResources.map((res, idx) => (
                      <GalleryCard key={idx} res={res} idx={idx} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="mb-16 rounded-md border border-dashed border-black/20 py-24 text-center">
                  <p className="text-[#191918]/50 font-bold uppercase tracking-widest text-sm">No encontramos recursos con ese criterio.</p>
                </div>
              )}
            </motion.div>
          )}          <div className="flex flex-wrap items-center gap-10 rounded-md border border-[#ff4b0b]/20 bg-[#ff4b0b]/5 px-10 py-12">
            <div className="flex-1 min-w-[300px]">
              <h2 className="qw-section-title--sm mb-3 uppercase text-[#ff4b0b]" style={{ ...displayFont }}>
                Acelera con Qaway Academy
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#191918]/70">
                Aprende a integrar herramientas de automatizacion, IA y marketing en flujos reales. Menos teoria suelta, mas capacidad instalada.
              </p>
              {isPublicSiteMode ? (
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                  Consultar Programas <ArrowRight size={16} />
                </a>
              ) : (
                <Link to="/academy" className="inline-flex items-center gap-2 rounded-md bg-[#ff4b0b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#dc3d00]">
                  Explorar Programas <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <img src="/assets/pages/9-pruebas/academy/curso-productividad-ia.png" alt="Academy" className="w-[320px] max-w-full rounded-md object-contain" />
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}


