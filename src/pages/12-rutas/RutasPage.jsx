import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Compass,
  Layers,
  Sparkles,
  PenTool,
  Cpu,
  Palette,
  FolderKanban,
  BookOpen,
  Globe,
  Shield,
  ExternalLink,
  Sliders,
  ChevronRight,
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import './rutas.css'

// =========================================================================
// ESTRUCTURA JERÁRQUICA DE RUTAS (MANDOS SUPERIORES -> HIJOS)
// =========================================================================
const hierarchicalRoutes = [
  // 1. BLOG & SISTEMA EDITORIAL
  {
    id: 'blog-publico',
    title: 'Página de Blog',
    path: '/blog',
    category: 'Blog & Editorial',
    icon: Sparkles,
    badge: 'Público',
    badgeType: 'public',
    summary: 'Portada pública del blog, artículos recomendados y navegación por pilares temáticos.',
    children: [
      {
        title: 'Categoría: Inteligencia Artificial',
        path: '/blog/inteligencia-artificial',
        description: 'Ideas, herramientas y criterio aplicado para entender la IA más allá del ruido.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Productividad',
        path: '/blog/productividad',
        description: 'Sistemas, hábitos y recursos para trabajar con más claridad y menos fricción.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Marketing',
        path: '/blog/marketing',
        description: 'Captación, contenidos, CRM y decisiones comerciales conectadas a negocio real.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Diseño & Branding',
        path: '/blog/diseno-branding',
        description: 'Comunicación visual, identidad y percepción de marca con criterio digital.',
        tag: 'Pilar',
      },
      {
        title: 'Categoría: Automatización',
        path: '/blog/automatizacion',
        description: 'Workflows, integraciones y operaciones digitales que ahorran tiempo y errores.',
        tag: 'Pilar',
      },
      {
        title: 'Artículo: Habilidades Clave con IA',
        path: '/blog/articulo/habilidades-clave-para-trabajar-con-ia-guia-practica',
        description: 'Guía práctica de capacidades fundamentales para el trabajo con IA.',
        tag: 'Post Producción',
      },
      {
        title: 'Render Dinámico de Artículo',
        path: '/blog/articulo/:id',
        description: 'Plantilla de lectura con audio por voz secuencial y cálculo de tiempo de lectura.',
        tag: 'Template',
      },
    ],
  },
  {
    id: 'blog-editor',
    title: 'Editor de Blog & Consola Editorial',
    path: '/hub/blog-editor',
    category: 'Blog & Editorial',
    icon: PenTool,
    badge: 'Hub Interno',
    badgeType: 'hub',
    summary: 'Consola editorial WYSIWYG conectada a Supabase para redacción, vista previa y publicación sincronizada 1:1.',
    children: [
      {
        title: 'Crear Artículo Nuevo',
        path: '/editor/new',
        description: 'Lienzo en blanco con formato calibrado a 18px, interlineado 1.68 y ancho de 712px.',
        tag: 'WYSIWYG',
      },
      {
        title: 'Editor de Artículo Existente',
        path: '/editor/:id',
        description: 'Editor visual directo con auto-guardado y gestión de metadatos.',
        tag: 'WYSIWYG',
      },
      {
        title: 'Editor en Contexto de Hub',
        path: '/hub/blog-editor/editor/:id',
        description: 'Ruta interna anidada dentro del contenedor del Hub administrativo.',
        tag: 'Admin',
      },
    ],
  },

  // 2. QAWAY HUB
  {
    id: 'qaway-hub',
    title: 'Qaway Hub Central',
    path: '/hub',
    category: 'Qaway Hub',
    icon: Layers,
    badge: 'Hub Interno',
    badgeType: 'hub',
    summary: 'Consola central de operaciones y accesos a herramientas de gestión del equipo.',
    children: [
      {
        title: 'CRM de Ventas & Leads',
        path: '/hub/crm',
        description: 'Bandeja de prospectos comerciales, estados de seguimiento y trazabilidad.',
        tag: 'CRM',
      },
      {
        title: 'WABA CRM (WhatsApp Console)',
        path: '/hub/waba-crm',
        description: 'Bandeja centralizada de mensajería empresarial vía WhatsApp Cloud API.',
        tag: 'WhatsApp API',
      },
      {
        title: 'Gestor de Proyectos & Timelines',
        path: '/hub/gestor-proyectos',
        description: 'Panel de control de hitos, fases operativas y cronogramas de entrega.',
        tag: 'Gestión',
      },
      {
        title: 'Analytics Studio & Dashboards',
        path: '/hub/analytics',
        description: 'Métricas de navegación, fuentes de tráfico, interacción y tasas de conversión.',
        tag: 'Analítica',
      },
      {
        title: 'Marketing Studio',
        path: '/hub/marketing',
        description: 'Planificación editorial, lanzamientos de productos y campañas de contenido.',
        tag: 'Marketing',
      },
      {
        title: 'Marketing Studio Twenty',
        path: '/hub/marketing2',
        description: 'Módulo extendido de experimentación y segmentación de audiencias para growth.',
        tag: 'Growth',
      },
    ],
  },

  // 3. SISTEMAS DIGITALES
  {
    id: 'sistemas-digitales',
    title: 'Sistemas Digitales',
    path: '/sistemas-digitales',
    category: 'Sistemas Digitales',
    icon: Cpu,
    badge: 'Servicios',
    badgeType: 'area',
    summary: 'Suite de soluciones tecnológicas para automatizar y escalar operaciones comerciales.',
    children: [
      {
        title: 'Automatización de Procesos',
        path: '/sistemas-digitales/automatizacion',
        description: 'Flujos sin código conectando Make, n8n, Zapier y OpenAI para ahorrar horas manuales.',
        tag: 'Workflows',
      },
      {
        title: 'Canales Digitales & Mensajería',
        path: '/sistemas-digitales/canales-digitales',
        description: 'Orquestación de WhatsApp API, correos transaccionales y soporte omnicanal.',
        tag: 'Mensajería',
      },
      {
        title: 'Webs & Landings de Alto Rendimiento',
        path: '/sistemas-digitales/webs-y-landings',
        description: 'Desarrollo web a medida con React, Vite y Tailwind enfocado en velocidad y conversión.',
        tag: 'Desarrollo',
      },
      {
        title: 'CRM, Datos & Dashboards',
        path: '/sistemas-digitales/crm-datos-dashboards',
        description: 'Modelado de bases de datos en Supabase y tableros interactivos para toma de decisiones.',
        tag: 'Datos',
      },
      {
        title: 'Agentes de IA Autónomos',
        path: '/sistemas-digitales/agentes-ia',
        description: 'Asistentes de IA contextuales entrenados con datos del negocio para soporte y ventas.',
        tag: 'Agentes IA',
      },
      {
        title: 'Herramientas Internas',
        path: '/sistemas-digitales/herramientas-internas',
        description: 'Paneles de administración y backoffices a medida para equipos operativos.',
        tag: 'Backoffice',
      },
      {
        title: 'Estrategia de Sistemas',
        path: '/sistemas-digitales/estrategia-digital',
        description: 'Diseño y optimización del stack tecnológico para escalar la infraestructura digital.',
        tag: 'Estrategia',
      },
    ],
  },

  // 4. ESTUDIO CREATIVO
  {
    id: 'estudio',
    title: 'Estudio Creativo',
    path: '/estudio',
    category: 'Estudio',
    icon: Palette,
    badge: 'Servicios',
    badgeType: 'area',
    summary: 'Dirección de arte, creación de identidad visual de marca y posicionamiento profesional.',
    children: [
      {
        title: 'Branding Digital',
        path: '/estudio/branding-digital',
        description: 'Sistemas de identidad visual, tipografía, paletas cromáticas y aplicaciones digitales.',
        tag: 'Identidad',
      },
      {
        title: 'Contenido Visual',
        path: '/estudio/contenido-visual',
        description: 'Producción multimedia, fotografía editorial y piezas para canales digitales.',
        tag: 'Audiovisual',
      },
      {
        title: 'Presencia Profesional',
        path: '/estudio/presencia-profesional',
        description: 'Posicionamiento estratégico para fundadores y ejecutivos en LinkedIn.',
        tag: 'Perfiles',
      },
      {
        title: 'Estrategia Digital (Estudio)',
        path: '/estudio/estrategia-digital',
        description: 'Planificación de marca y arquitectura de comunicación visual.',
        tag: 'Branding',
      },
      {
        title: 'Consultoría Estratégica',
        path: '/estudio/consultoria',
        description: 'Diagnóstico 1 a 1 y hoja de ruta para elevar la percepción comercial de la marca.',
        tag: 'Consultoría',
      },
    ],
  },

  // 5. PROYECTOS & DEMOS
  {
    id: 'proyectos',
    title: 'Catálogo de Proyectos',
    path: '/proyectos',
    category: 'Proyectos & Demos',
    icon: FolderKanban,
    badge: 'Portafolio',
    badgeType: 'demo',
    summary: 'Portafolio interactivo de sitios web, ecosistemas digitales y casos de éxito reales.',
    children: [
      {
        title: 'Horizonte Inmobiliaria',
        path: '/proyectos/horizonte',
        description: 'Ecosistema web con recorridos 3D y captación automatizada a WhatsApp.',
        tag: 'Inmobiliaria',
      },
      {
        title: 'Horizonte (Versión Producción)',
        path: '/proyectos/horizonte-real',
        description: 'Entorno de despliegue real del portal inmobiliario.',
        tag: 'Live Demo',
      },
      {
        title: 'Mesa Selecta',
        path: '/proyectos/mesa-selecta',
        description: 'Plataforma gastronómica con catálogo gourmet y blog editorial.',
        tag: 'Gastronomía',
      },
      {
        title: 'EPC Estudio Contable',
        path: '/proyectos/epc',
        description: 'Sitio corporativo y portal de servicios contables y tributarios.',
        tag: 'Finanzas',
      },
      {
        title: 'Panadería Josué',
        path: '/proyectos/panaderia-josue',
        description: 'E-commerce y vitrina de productos artesanales con pedidos directos.',
        tag: 'E-commerce',
      },
      {
        title: 'Áurea Skincare',
        path: '/proyectos/aurea-skincare',
        description: 'Tienda digital de cosmética y cuidado facial de alta gama.',
        tag: 'Skincare',
      },
      {
        title: 'Plantora',
        path: '/proyectos/plantora',
        description: 'Catálogo botánico y plataforma de comercio de plantas de interior.',
        tag: 'Botánica',
      },
      {
        title: 'Saniclick',
        path: '/proyectos/saniclick',
        description: 'Web de servicios de higiene industrial y desinfección profesional.',
        tag: 'Servicios',
      },
      {
        title: 'Dental Clinic',
        path: '/proyectos/dental',
        description: 'Portal odontológico con reserva de citas y catálogo de especialidades.',
        tag: 'Salud',
      },
    ],
  },

  // 6. LANDINGS DE CAPTACIÓN
  {
    id: 'landings',
    title: 'Directorio de Landings',
    path: '/landings',
    category: 'Landings',
    icon: Globe,
    badge: 'Conversión',
    badgeType: 'landing',
    summary: 'Embudos de captación publicitaria y páginas de venta de servicios específicos.',
    children: [
      {
        title: 'Landing: Desarrollo Web & Software',
        path: '/landings/desarrollo-web',
        description: 'Página principal de ventas para servicios de diseño y programación web.',
        tag: 'Core Sales',
      },
      {
        title: 'Landing: Sistema de Contenido en Notion',
        path: '/landings/sistema-contenido-notion',
        description: 'Oferta del gestor y calendario editorial automatizado en Notion.',
        tag: 'Notion',
      },
      {
        title: 'Landing: Identidad Visual & Branding',
        path: '/landings/identidad-visual',
        description: 'Página de captación para proyectos de rediseño e identidad corporativa.',
        tag: 'Branding',
      },
      {
        title: 'Landing: Servicios Contables',
        path: '/landings/contable',
        description: 'Embudo de conversión para asesoría tributaria y contable.',
        tag: 'Contable',
      },
      {
        title: 'Landing: Restauración Fotográfica',
        path: '/landings/restauracion-fotografica',
        description: 'Servicio de restauración y remasterización digital de fotos familiares con IA.',
        tag: 'Servicios',
      },
      {
        title: 'Landing: Fotografía para LinkedIn',
        path: '/landings/fotografia-linkedin',
        description: 'Sesiones de retrato ejecutivo para perfiles corporativos en LinkedIn.',
        tag: 'Fotografía',
      },
    ],
  },

  // 7. RECURSOS & EBOOKS
  {
    id: 'recursos',
    title: 'Biblioteca de Recursos',
    path: '/recursos',
    category: 'Recursos',
    icon: BookOpen,
    badge: 'Público',
    badgeType: 'public',
    summary: 'Centro de descargas con guías prácticas, ebooks, checklists y plantillas de trabajo.',
    children: [
      {
        title: 'Guía: Primeros Flujos con IA',
        path: '/recursos/primeros-flujos-ia',
        description: 'Guía paso a paso para implementar tus primeras automatizaciones con IA.',
        tag: 'Guía Práctica',
      },
      {
        title: 'Ebook: Google Calendar Dominado',
        path: '/recursos/ebooks/google-calendar-dominado',
        description: 'Sistema operativo semanal para organizar tu tiempo con bloques y apoyo de IA.',
        tag: 'Ebook',
      },
      {
        title: 'Visor Dinámico de Recursos',
        path: '/recursos/:category',
        description: 'Filtrado dinámico por categoría y tipo de recurso descargable.',
        tag: 'Filtro',
      },
    ],
  },

  // 8. PÁGINAS PRINCIPALES & PORTALES
  {
    id: 'portales-principales',
    title: 'Portales, Accesos & Variantes',
    path: '/',
    category: 'Portales & Principales',
    icon: Shield,
    badge: 'Core',
    badgeType: 'area',
    summary: 'Portadas institucionales, acceso administrativo y portal privado para clientes.',
    children: [
      {
        title: 'Inicio Principal (V1)',
        path: '/',
        description: 'Portada oficial con hero interactivo, servicios y manifiesto.',
        tag: 'Producción',
      },
      {
        title: 'Inicio V2 & V3 (Variantes)',
        path: '/inicio-v2',
        description: 'Versiones de experimentación y prueba de conversión.',
        tag: 'Variantes',
      },
      {
        title: 'Portal de Cliente (Dinámico)',
        path: '/portal/:slug',
        description: 'Visualizador de estado de proyecto y cronograma en vivo para clientes.',
        tag: 'Privado',
      },
      {
        title: 'Recorrido de Proyecto',
        path: '/proyectos/recorrido/:slug',
        description: 'Visualizador interactivo de hitos y avances de entregables.',
        tag: 'Privado',
      },
      {
        title: 'Portal de Acceso (Login)',
        path: '/login',
        description: 'Autenticación para administradores y equipo de Qaway Lab.',
        tag: 'Auth',
      },
      {
        title: 'Qaway Academy',
        path: '/academy',
        description: 'Programas formativos y workshops en herramientas digitales e IA.',
        tag: 'Formación',
      },
      {
        title: 'Brief de Branding Digital',
        path: '/brief',
        description: 'Formulario de recopilación de requerimientos para nuevos proyectos.',
        tag: 'Onboarding',
      },
      {
        title: 'Pruebas Archivadas',
        path: '/pruebas/inicio-descartado',
        description: 'Bocetos y exploraciones conceptuales previas.',
        tag: 'Archivo',
      },
    ],
  },
]

const categoriesList = [
  'Todos',
  'Blog & Editorial',
  'Qaway Hub',
  'Sistemas Digitales',
  'Estudio',
  'Proyectos & Demos',
  'Landings',
  'Recursos',
  'Portales & Principales',
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
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200'
  }
}

// =========================================================================
// TARJETA DESPLEGABLE MINIMALISTA (ESTILO CLAUDE / ANTHROPIC DOCS)
// =========================================================================
function HierarchicalRouteCard({ item, isExpanded, onToggle, onCopy, copiedPath }) {
  const IconComponent = item.icon || Sparkles

  return (
    <div
      className={`rutas-card rounded-2xl border bg-white transition-all duration-200 ${
        isExpanded
          ? 'border-zinc-300 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
          : 'border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-zinc-300'
      }`}
    >
      {/* CABECERA MINIMALISTA DE LA TARJETA */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lado izquierdo: Ícono + Título + Descripción + Badge */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200/80">
            <IconComponent className="h-5 w-5 text-[#fe6612]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-zinc-950 tracking-[-0.02em] truncate">
                {item.title}
              </h2>
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle(item.badgeType)}`}>
                {item.badge}
              </span>
              <code className="hidden md:inline-block text-[11px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200/60">
                {item.path}
              </code>
            </div>

            <p className="text-[13.5px] leading-relaxed text-zinc-500 line-clamp-2 sm:line-clamp-1">
              {item.summary}
            </p>
          </div>
        </div>

        {/* Lado derecho: Botón directo + Control Desplegable */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-between sm:justify-end">
          
          <Link
            to={item.path}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <span>Ir a la ruta</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#fe6612]" />
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isExpanded
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <span>{isExpanded ? 'Ocultar' : `Ver ${item.children.length} sub-rutas`}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        </div>

      </div>

      {/* PANEL DESPLEGABLE CON LAS SUB-RUTAS (HIJOS) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-zinc-100 bg-zinc-50/70 rounded-b-2xl"
          >
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Sub-rutas de {item.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {item.children.length} rutas asociadas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {item.children.map((child) => (
                  <div
                    key={child.path + child.title}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-[#fe6612]/40 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[13.5px] font-bold text-zinc-900 tracking-[-0.01em]">
                          {child.title}
                        </span>
                        {child.tag && (
                          <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                            {child.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] leading-relaxed text-zinc-500 mb-3">
                        {child.description}
                      </p>
                    </div>

                    {/* Fila de Path y Acciones */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100/80">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <code className="text-[11.5px] font-mono text-zinc-800 truncate">
                          {child.path}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => onCopy(child.path, e)}
                          title="Copiar URL"
                          className="shrink-0 p-1 text-zinc-400 hover:text-[#fe6612] transition-colors"
                        >
                          {copiedPath === child.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <Link
                        to={child.path}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-[#fe6612] hover:text-[#e0550a] transition-colors shrink-0"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =========================================================================
// COMPONENTE PRINCIPAL
// =========================================================================
export default function RutasPage() {
  useSetNavbarVariant('transparent')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState(() => ({}))
  const [copiedPath, setCopiedPath] = useState(null)

  const handleCopy = (path, e) => {
    e.preventDefault()
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${path}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  // Filtrado jerárquico inteligente
  const filteredParents = useMemo(() => {
    return hierarchicalRoutes.filter((parent) => {
      const matchesCategory = activeCategory === 'Todos' || parent.category === activeCategory
      const q = searchQuery.toLowerCase().trim()

      if (!q) return matchesCategory

      const matchesParent =
        parent.title.toLowerCase().includes(q) ||
        parent.path.toLowerCase().includes(q) ||
        parent.summary.toLowerCase().includes(q) ||
        parent.category.toLowerCase().includes(q)

      const matchesAnyChild = parent.children.some(
        (child) =>
          child.title.toLowerCase().includes(q) ||
          child.path.toLowerCase().includes(q) ||
          child.description.toLowerCase().includes(q) ||
          (child.tag && child.tag.toLowerCase().includes(q))
      )

      return matchesCategory && (matchesParent || matchesAnyChild)
    })
  }, [activeCategory, searchQuery])

  // Conteo total de sub-rutas
  const totalSubRoutes = useMemo(() => {
    return hierarchicalRoutes.reduce((acc, curr) => acc + curr.children.length + 1, 0)
  }, [])

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const expandAll = () => {
    const allExpanded = {}
    hierarchicalRoutes.forEach((p) => {
      allExpanded[p.id] = true
    })
    setExpandedCards(allExpanded)
  }

  const collapseAll = () => {
    setExpandedCards({})
  }

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
              <span>/ Sistema de Rutas & Mandos</span>
            </div>

            {/* Título Principal */}
            <h1
              className="text-[clamp(2.4rem,4.2vw,3.6rem)] font-extrabold text-white leading-[1.12] tracking-[-0.03em] mb-4 text-balance"
              style={{ fontWeight: 800 }}
            >
              Directorio de Rutas<span className="text-[#fe6612]">.</span>
            </h1>

            {/* Bajada */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-7 text-balance font-normal">
              Estructura jerárquica con mandos superiores y sub-rutas segmentadas para navegación y pruebas del sistema.
            </p>

            {/* Buscador Integrado Centrado */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 rounded-[12px] border border-white/20 bg-zinc-900/90 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#fe6612] focus-within:border-transparent">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por módulo, ruta padre o hijo (/blog, /editor, /hub)..."
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
                <strong>{hierarchicalRoutes.length}</strong> mandos superiores
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                <strong>{totalSubRoutes}</strong> rutas totales mapeadas
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BARRA DE PÍLDORAS / FILTROS (MANDOS SUPERIORES) */}
      {/* ========================================================================= */}
      <div id="rutas-listado" className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur-md py-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="rutas-shell flex items-center justify-between gap-4">
          
          {/* Lista de píldoras horizontal */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categoriesList.map((category) => {
              const isActive = activeCategory === category
              const count = category === 'Todos'
                ? hierarchicalRoutes.length
                : hierarchicalRoutes.filter((r) => r.category === category).length

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[12.5px] sm:text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fe6612] text-white shadow-sm shadow-[#fe6612]/20'
                      : 'border border-black/10 bg-white text-[#191918] hover:border-[#fe6612]/40 hover:text-[#fe6612]'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Botones de control rápido */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Desplegar todo
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Colapsar
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* LISTADO JERÁRQUICO DE TARJETAS MINIMALISTAS */}
      {/* ========================================================================= */}
      <section className="rutas-listing py-10 sm:py-12">
        <div className="rutas-shell">
          
          {filteredParents.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg font-bold text-zinc-900 mb-1">No se encontraron mandos superiores para tu búsqueda</p>
              <p className="text-sm text-zinc-500 mb-6">Prueba buscando otro término o selecciona "Todos".</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('Todos'); setSearchQuery('') }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#fe6612] text-white text-xs font-bold hover:bg-[#e0550a] transition-all"
              >
                Ver todas las categorías
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParents.map((parent) => (
                <HierarchicalRouteCard
                  key={parent.id}
                  item={parent}
                  isExpanded={Boolean(expandedCards[parent.id] || searchQuery)}
                  onToggle={() => toggleCard(parent.id)}
                  onCopy={handleCopy}
                  copiedPath={copiedPath}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
