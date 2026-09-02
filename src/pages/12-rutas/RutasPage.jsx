import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Search, ChevronDown, ExternalLink, Copy, Check, Compass, Layers, Globe, Shield, Sparkles, Terminal } from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import './rutas.css'

const allRoutesData = [
  // 1. PRINCIPALES
  {
    path: '/',
    title: 'Inicio Principal',
    description: 'Portada institucional de Qaway Lab con hero interactivo, manifiesto, portafolio y acceso a servicios.',
    segment: 'Principales',
    badge: 'Producción',
    badgeType: 'public',
    tags: ['Hero V1', 'Manifiesto', 'Portafolio'],
  },
  {
    path: '/inicio-v2',
    title: 'Inicio V2 (Variante)',
    description: 'Segunda iteración de la página de inicio con enfoque y distribución visual alternativa.',
    segment: 'Principales',
    badge: 'Variante',
    badgeType: 'dev',
    tags: ['Exploración', 'Hero V2'],
  },
  {
    path: '/inicio-v3',
    title: 'Inicio V3 (Variante)',
    description: 'Tercera propuesta conceptual de portada enfocada en alta conversión y narrativa de marca.',
    segment: 'Principales',
    badge: 'Variante',
    badgeType: 'dev',
    tags: ['Exploración', 'Hero V3'],
  },

  // 2. ESTUDIO
  {
    path: '/estudio',
    title: 'Estudio Creativo (Portada)',
    description: 'Visión general de servicios de branding, dirección de arte, contenido y presencia ejecutiva.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Branding', 'Dirección de Arte', 'Estrategia'],
  },
  {
    path: '/estudio/branding-digital',
    title: 'Branding Digital',
    description: 'Creación de sistemas de identidad visual, tipografía, paletas cromáticas y aplicaciones digitales.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Identidad', 'Manual de Marca'],
  },
  {
    path: '/estudio/contenido-visual',
    title: 'Contenido Visual',
    description: 'Producción multimedia, fotografía editorial, motion design y piezas para canales digitales.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Audiovisual', 'Social Media'],
  },
  {
    path: '/estudio/presencia-profesional',
    title: 'Presencia Profesional',
    description: 'Posicionamiento para fundadores y ejecutivos: perfiles de alto impacto y comunicación estratégica.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['LinkedIn', 'Personal Branding'],
  },
  {
    path: '/estudio/estrategia-digital',
    title: 'Estrategia Digital (Estudio)',
    description: 'Planificación de marca y arquitectura de comunicación para acelerar el posicionamiento.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Posicionamiento', 'Growth'],
  },
  {
    path: '/estudio/consultoria',
    title: 'Consultoría Estratégica',
    description: 'Sesiones 1 a 1 de diagnóstico y hoja de ruta para elevar la percepción de marca.',
    segment: 'Estudio',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Consultoría 1:1', 'Auditoría'],
  },

  // 3. SISTEMAS DIGITALES
  {
    path: '/sistemas-digitales',
    title: 'Sistemas Digitales (Portada)',
    description: 'Arquitectura de operaciones digitales: automatización, integraciones, CRM y agentes IA.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Operaciones', 'IA', 'Automatización'],
  },
  {
    path: '/sistemas-digitales/automatizacion',
    title: 'Automatización de Procesos',
    description: 'Eliminación de fricción operativa conectando Make, Zapier, n8n y modelos de lenguaje.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Make', 'n8n', 'Workflows'],
  },
  {
    path: '/sistemas-digitales/canales-digitales',
    title: 'Canales Digitales & Mensajería',
    description: 'Integración y orquestación multicanal: WhatsApp Business API, email marketing y chatbots.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['WhatsApp API', 'Omnicanalidad'],
  },
  {
    path: '/sistemas-digitales/webs-y-landings',
    title: 'Webs & Landings de Alto Rendimiento',
    description: 'Desarrollo web a medida con React, Vite y Tailwind optimizado para SEO y conversión.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['React', 'Next.js', 'Vite'],
  },
  {
    path: '/sistemas-digitales/crm-datos-dashboards',
    title: 'CRM, Datos & Dashboards',
    description: 'Centralización de métricas de negocio, pipelines comerciales y tableros interactivos.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Dashboards', 'Supabase', 'Analytics'],
  },
  {
    path: '/sistemas-digitales/agentes-ia',
    title: 'Agentes de IA Autónomos',
    description: 'Despliegue de asistentes inteligentes entrenados con datos corporativos para soporte y ventas.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Agentes IA', 'LLMs', 'RAG'],
  },
  {
    path: '/sistemas-digitales/herramientas-internas',
    title: 'Herramientas Internas',
    description: 'Paneles de administración, gestores de datos y micro-herramientas para equipos operativos.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Backoffice', 'Portales'],
  },
  {
    path: '/sistemas-digitales/estrategia-digital',
    title: 'Estrategia de Sistemas',
    description: 'Diseño del stack tecnológico ideal para escalar operaciones sin aumentar la carga manual.',
    segment: 'Sistemas Digitales',
    badge: 'Servicio',
    badgeType: 'area',
    tags: ['Stack Tecnológico', 'Escalabilidad'],
  },

  // 4. QAWAY HUB
  {
    path: '/hub',
    title: 'Qaway Hub Central',
    description: 'Consola integral y suite de herramientas internas para el equipo de Qaway Lab.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Dashboard', 'Suite'],
  },
  {
    path: '/hub/blog-editor',
    title: 'Editor de Blog',
    description: 'Consola editorial WYSIWYG conectada a Supabase para redacción, vista previa y publicación.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Editorial', 'WYSIWYG', 'Supabase'],
  },
  {
    path: '/editor/new',
    title: 'Nuevo Artículo (Editor Visual)',
    description: 'Lienzo en blanco sincronizado 1:1 con la tipografía y layout final de producción.',
    segment: 'Qaway Hub',
    badge: 'Editor',
    badgeType: 'hub',
    tags: ['Post Builder', 'Audio Speech'],
  },
  {
    path: '/hub/crm',
    title: 'CRM de Contactos & Leads',
    description: 'Gestión comercial de prospectos, estados de negociación y trazabilidad de clientes.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Pipeline', 'Leads'],
  },
  {
    path: '/hub/waba-crm',
    title: 'WABA CRM (WhatsApp Console)',
    description: 'Bandeja centralizada de mensajería empresarial conectada a WhatsApp Business API.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['WhatsApp Cloud', 'Chats'],
  },
  {
    path: '/hub/gestor-proyectos',
    title: 'Gestor de Proyectos Hub',
    description: 'Planificación de entregas, fases de trabajo, hitos y cronogramas de clientes.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Timeline', 'Hitos', 'Tasks'],
  },
  {
    path: '/hub/analytics',
    title: 'Analytics Studio',
    description: 'Métricas de navegación, fuentes de tráfico, interacción y rendimiento de conversión.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Métricas', 'Traffic', 'KPIs'],
  },
  {
    path: '/hub/marketing',
    title: 'Marketing Studio',
    description: 'Estrategia de contenidos, lanzamientos y control de campañas multicanal.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Campañas', 'Calendario'],
  },
  {
    path: '/hub/marketing2',
    title: 'Marketing Studio Twenty',
    description: 'Módulo extendido de experimentación y segmentación de audiencias para growth.',
    segment: 'Qaway Hub',
    badge: 'Hub Interno',
    badgeType: 'hub',
    tags: ['Growth', 'Experimentación'],
  },

  // 5. PROYECTOS & DEMOS
  {
    path: '/proyectos',
    title: 'Catálogo de Proyectos',
    description: 'Galería pública de casos de éxito, desarrollos web y sistemas implementados.',
    segment: 'Proyectos & Demos',
    badge: 'Producción',
    badgeType: 'public',
    tags: ['Portafolio', 'Casos de Éxito'],
  },
  {
    path: '/proyectos/horizonte',
    title: 'Horizonte Inmobiliaria',
    description: 'Ecosistema inmobiliario interactivo con recorridos 3D y captación automatizada.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Inmobiliaria', '3D Tours'],
  },
  {
    path: '/proyectos/horizonte-real',
    title: 'Horizonte Inmobiliaria (Versión Real)',
    description: 'Entorno de despliegue real para el portal inmobiliario Horizonte.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Producción', 'Inmobiliaria'],
  },
  {
    path: '/proyectos/mesa-selecta',
    title: 'Mesa Selecta',
    description: 'Plataforma gastronómica con catálogo gourmet, blog culinario y estética editorial.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Gastronomía', 'E-commerce'],
  },
  {
    path: '/proyectos/epc',
    title: 'EPC Estudio Contable',
    description: 'Sitio corporativo y portal de servicios contables, tributarios y financieros.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Finanzas', 'Contabilidad'],
  },
  {
    path: '/proyectos/panaderia-josue',
    title: 'Panadería Josué',
    description: 'E-commerce y vitrina de productos artesanales con pedidos directos.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['E-commerce', 'Artesanal'],
  },
  {
    path: '/proyectos/aurea-skincare',
    title: 'Áurea Skincare',
    description: 'Tienda digital de cosmética y cuidado facial de alta gama.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Skincare', 'Tienda Online'],
  },
  {
    path: '/proyectos/plantora',
    title: 'Plantora',
    description: 'Catálogo botánico y plataforma de comercio de plantas de interior.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Botánica', 'Tienda Verde'],
  },
  {
    path: '/proyectos/saniclick',
    title: 'Saniclick',
    description: 'Web de servicios de higiene industrial y desinfección profesional.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Servicios', 'Sanitización'],
  },
  {
    path: '/proyectos/dental',
    title: 'Dental Clinic',
    description: 'Plataforma médica odontológica con agenda de citas y catálogo de especialidades.',
    segment: 'Proyectos & Demos',
    badge: 'Demo Web',
    badgeType: 'demo',
    tags: ['Salud', 'Odontología'],
  },

  // 6. RECURSOS & EBOOKS
  {
    path: '/recursos',
    title: 'Biblioteca de Recursos',
    description: 'Hub de descargas de guías prácticas, ebooks, checklists y plantillas operativas.',
    segment: 'Recursos',
    badge: 'Producción',
    badgeType: 'public',
    tags: ['Ebooks', 'Guías', 'Descargas'],
  },
  {
    path: '/recursos/primeros-flujos-ia',
    title: 'Primeros Flujos con IA',
    description: 'Guía interactiva paso a paso para dar los primeros pasos en automatización con IA.',
    segment: 'Recursos',
    badge: 'Recurso',
    badgeType: 'public',
    tags: ['Guía Interactiva', 'IA'],
  },
  {
    path: '/recursos/ebooks/google-calendar-dominado',
    title: 'Google Calendar Dominado',
    description: 'Sistema operativo semanal para organizar tu tiempo con bloques y apoyo de IA.',
    segment: 'Recursos',
    badge: 'Ebook',
    badgeType: 'public',
    tags: ['Productividad', 'Time Blocking'],
  },

  // 7. BLOG & ARTÍCULOS
  {
    path: '/blog',
    title: 'Blog Oficial de Qaway Lab',
    description: 'Publicaciones sobre IA aplicada, automatización de negocios, diseño y productividad.',
    segment: 'Blog',
    badge: 'Producción',
    badgeType: 'public',
    tags: ['Artículos', 'Editorial'],
  },
  {
    path: '/blog/inteligencia-artificial',
    title: 'Blog: Inteligencia Artificial',
    description: 'Artículos y análisis sobre el impacto y aplicaciones prácticas de la IA.',
    segment: 'Blog',
    badge: 'Categoría',
    badgeType: 'public',
    tags: ['IA', 'LLMs'],
  },
  {
    path: '/blog/productividad',
    title: 'Blog: Productividad',
    description: 'Sistemas de trabajo, organización semanal y métodos sin fricción.',
    segment: 'Blog',
    badge: 'Categoría',
    badgeType: 'public',
    tags: ['Hábitos', 'Sistemas'],
  },
  {
    path: '/blog/marketing',
    title: 'Blog: Marketing',
    description: 'Captación de leads, estrategias de contenido y decisiones de negocio real.',
    segment: 'Blog',
    badge: 'Categoría',
    badgeType: 'public',
    tags: ['Growth', 'Ventas'],
  },
  {
    path: '/blog/diseno-branding',
    title: 'Blog: Diseño & Branding',
    description: 'Criterio visual, identidad corporativa y percepción de marca en medios digitales.',
    segment: 'Blog',
    badge: 'Categoría',
    badgeType: 'public',
    tags: ['Branding', 'Diseño'],
  },
  {
    path: '/blog/automatizacion',
    title: 'Blog: Automatización',
    description: 'Workflows prácticos, integraciones y eliminación de tareas repetitivas.',
    segment: 'Blog',
    badge: 'Categoría',
    badgeType: 'public',
    tags: ['Workflows', 'No-code'],
  },
  {
    path: '/blog/articulo/habilidades-clave-para-trabajar-con-ia-guia-practica',
    title: 'Artículo: Habilidades Clave para Trabajar con IA',
    description: 'Guía práctica sobre las capacidades fundamentales que demandará el mercado digital.',
    segment: 'Blog',
    badge: 'Artículo',
    badgeType: 'public',
    tags: ['Guía Práctica', 'Habilidades'],
  },

  // 8. LANDINGS ESPECÍFICAS
  {
    path: '/landings',
    title: 'Directorio de Landings',
    description: 'Catálogo de páginas de aterrizaje y embudos de captación segmentados.',
    segment: 'Landings',
    badge: 'Directorio',
    badgeType: 'landing',
    tags: ['Embudos', 'Conversión'],
  },
  {
    path: '/landings/desarrollo-web',
    title: 'Landing: Desarrollo Web & Software',
    description: 'Página de alta conversión para venta de servicios de desarrollo y diseño web profesional.',
    segment: 'Landings',
    badge: 'Producción',
    badgeType: 'landing',
    tags: ['Ventas', 'Desarrollo Web'],
  },
  {
    path: '/landings/sistema-contenido-notion',
    title: 'Landing: Sistema de Contenido en Notion',
    description: 'Oferta del gestor y calendario de contenidos automatizado en Notion.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Notion', 'Content System'],
  },
  {
    path: '/landings/identidad-visual',
    title: 'Landing: Identidad Visual',
    description: 'Propuesta de valor integral para proyectos de branding y rediseño de marca.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Branding', 'Diseño'],
  },
  {
    path: '/landings/contable',
    title: 'Landing: Servicios Contables',
    description: 'Página especializada en captación para asesoría contable y tributaria.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Contable', 'Tributario'],
  },
  {
    path: '/landings/restauracion-fotografica',
    title: 'Landing: Restauración Fotográfica',
    description: 'Servicio de rescate y digitalización de fotografías antiguas con IA.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Fotografía', 'Restauración'],
  },
  {
    path: '/landings/restauracion-fotografica2',
    title: 'Landing: Restauración Fotográfica V2',
    description: 'Variante optimizada para campañas publicitarias de restauración fotográfica.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Fotografía', 'Campañas'],
  },
  {
    path: '/landings/fotografia-linkedin',
    title: 'Landing: Fotografía para LinkedIn',
    description: 'Sesiones de retrato ejecutivo orientadas a optimizar la imagen en LinkedIn.',
    segment: 'Landings',
    badge: 'Landing',
    badgeType: 'landing',
    tags: ['Headshots', 'LinkedIn'],
  },

  // 9. ACADEMY & BRIEFS
  {
    path: '/academy',
    title: 'Qaway Academy',
    description: 'Espacio formativo con cursos, workshops y entrenamientos en herramientas de IA.',
    segment: 'Academy & Briefs',
    badge: 'Formación',
    badgeType: 'public',
    tags: ['Educación', 'Workshops'],
  },
  {
    path: '/brief',
    title: 'Brief de Branding Digital',
    description: 'Formulario paso a paso para recopilar el contexto y visión de nuevos clientes.',
    segment: 'Academy & Briefs',
    badge: 'Formulario',
    badgeType: 'public',
    tags: ['Briefing', 'Onboarding'],
  },

  // 10. PORTALES & AUTH
  {
    path: '/login',
    title: 'Portal de Acceso (Login)',
    description: 'Autenticación para administradores y equipo operativo de Qaway Lab.',
    segment: 'Portales & Auth',
    badge: 'Seguridad',
    badgeType: 'auth',
    tags: ['Auth', 'Supabase Login'],
  },
  {
    path: '/portal/demo-cliente',
    title: 'Portal de Cliente (Ruta Dinámica)',
    description: 'Visualizador de estado de proyecto, entregables y avance en tiempo real para clientes.',
    segment: 'Portales & Auth',
    badge: 'Portal Privado',
    badgeType: 'auth',
    tags: ['/portal/:slug', 'Client Area'],
  },

  // 11. PRUEBAS & DESCARTADAS
  {
    path: '/pruebas/inicio-descartado',
    title: 'Inicio (Versión Archivada)',
    description: 'Diseño conceptual preliminar archivado para referencia histórica del equipo.',
    segment: 'Pruebas',
    badge: 'Archivado',
    badgeType: 'dev',
    tags: ['Archivo', 'Referencia'],
  },
]

const segmentsList = [
  'Todos',
  'Principales',
  'Estudio',
  'Sistemas Digitales',
  'Qaway Hub',
  'Proyectos & Demos',
  'Recursos',
  'Blog',
  'Landings',
  'Academy & Briefs',
  'Portales & Auth',
  'Pruebas',
]

function getBadgeStyle(badgeType) {
  switch (badgeType) {
    case 'public':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'hub':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'demo':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'landing':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'area':
      return 'bg-zinc-100 text-zinc-800 border-zinc-200'
    case 'auth':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'dev':
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200'
  }
}

export default function RutasPage() {
  useSetNavbarVariant('transparent')
  const [activeSegment, setActiveSegment] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedPath, setCopiedPath] = useState(null)

  const handleCopy = (path, e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const filteredRoutes = allRoutesData.filter((route) => {
    const matchesSegment = activeSegment === 'Todos' || route.segment === activeSegment
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      route.path.toLowerCase().includes(q) ||
      route.title.toLowerCase().includes(q) ||
      route.description.toLowerCase().includes(q) ||
      route.segment.toLowerCase().includes(q) ||
      route.tags.some((t) => t.toLowerCase().includes(q))

    return matchesSegment && matchesSearch
  })

  return (
    <main className="rutas-page">
      {/* ========================================================================= */}
      {/* HERO SECTION: ENCABEZADO CARBÓN DIFUMINADO ESTÉTICO */}
      {/* ========================================================================= */}
      <section className="rutas-hero border-b border-white/10">
        <div className="rutas-shell">
          <motion.div
            className="rutas-hero__center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Kicker en Cápsula translúcida */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#fe6612]" />
              <span>/ Mapa de Rutas</span>
            </div>

            {/* Título Principal */}
            <h1
              className="text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Ecosistema de Rutas<span className="text-[#fe6612]">.</span>
            </h1>

            {/* Bajada */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Directorio integral y segmentado de todas las vistas, aplicaciones internas, portales de clientes y landings de Qaway Lab.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[12px] border border-white/20 bg-zinc-900/90 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#fe6612] focus-within:border-transparent">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ruta (/hub, /estudio), título o tag..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-zinc-400 hover:text-[#fe6612] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#fe6612]" />
                <strong>{filteredRoutes.length}</strong> {filteredRoutes.length === 1 ? 'ruta encontrada' : 'rutas registradas'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <strong>{segmentsList.length - 1}</strong> segmentos
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE PÍLDORAS / FILTROS (ESTRUCTURA IDÉNTICA A PROYECTOS) */}
      {/* ========================================================================= */}
      <div id="rutas-listado" className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="rutas-shell flex items-center justify-between gap-4">
          
          {/* Lista de píldoras horizontal */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {segmentsList.map((segment) => {
              const isActive = activeSegment === segment
              const countInSegment = segment === 'Todos' ? allRoutesData.length : allRoutesData.filter((r) => r.segment === segment).length
              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => setActiveSegment(segment)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] sm:text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/20'
                      : 'border border-black/10 bg-white text-[#191918] hover:border-[#fe6612]/40 hover:text-[#fe6612]'
                  }`}
                >
                  <span>{segment}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    {countInSegment}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Selector lateral "Ver Todos" */}
          <div className="hidden sm:block shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveSegment('Todos')
                setSearchQuery('')
              }}
              className="flex items-center gap-2 rounded-[10px] border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#191918] transition-colors hover:border-[#fe6612]/50 hover:text-[#fe6612]"
            >
              <span>Restablecer</span>
              <ChevronDown className="h-3.5 w-3.5 text-black/50" />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID DE RUTAS SEGMENTADAS */}
      {/* ========================================================================= */}
      <section className="rutas-listing py-10 sm:py-14">
        <div className="rutas-shell">
          
          {filteredRoutes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-bold text-zinc-900 mb-1">No se encontraron rutas para tu búsqueda</p>
              <p className="text-sm text-zinc-500 mb-6">Prueba buscando otro término o restablece los filtros.</p>
              <button
                type="button"
                onClick={() => { setActiveSegment('Todos'); setSearchQuery('') }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#fe6612] text-white text-xs font-bold hover:bg-[#e0550a] transition-all"
              >
                Ver todas las rutas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredRoutes.map((route, index) => (
                <motion.article
                  key={route.path + route.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.25), ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col justify-between rounded-[14px] border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-[#fe6612]/40 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                >
                  <div>
                    {/* Header de la tarjeta: Segmento y Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                        {route.segment}
                      </span>
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(route.badgeType)}`}>
                        {route.badge}
                      </span>
                    </div>

                    {/* Path / URL con botón de copiar */}
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-[8px] bg-zinc-50 px-3 py-1.5 border border-zinc-200/70">
                      <code className="text-[12px] font-mono font-semibold text-[#18181b] truncate">
                        {route.path}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(route.path, e)}
                        title="Copiar URL completa"
                        className="shrink-0 p-1 text-zinc-400 hover:text-[#fe6612] transition-colors rounded-md"
                      >
                        {copiedPath === route.path ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Título y Descripción */}
                    <h3 className="text-[17px] font-bold text-zinc-900 tracking-[-0.02em] mb-1.5 group-hover:text-[#fe6612] transition-colors leading-snug">
                      {route.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-zinc-600 mb-4">
                      {route.description}
                    </p>
                  </div>

                  {/* Footer de la tarjeta: Tags y Botón de acceso */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1.5">
                      {route.tags.map((tag) => (
                        <span key={tag} className="text-[10.5px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={route.path}
                      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#fe6612] hover:text-[#e0550a] transition-colors group-hover:translate-x-0.5"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
