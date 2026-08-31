import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Kanban,
  Table as TableIcon,
  PieChart,
  Bot,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Download,
  Search,
  Zap,
  Globe,
  Mail,
  Award,
  RefreshCw,
  Building2,
  ShoppingBag,
  Info,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  Phone,
  Printer,
  X,
  Sliders,
  ShieldCheck,
  Activity,
  BarChart2,
  Tag
} from 'lucide-react'

// LocalStorage persistence key
const STORAGE_KEY = 'qaway_marketing_workspace_v5'

// HubSpot Page 6: Exact Format Mapping
const HUBSPOT_FORMATS_BY_STAGE = {
  TOFU: [
    { name: 'Infografía', purpose: 'Fácil de compartir y aumenta el descubrimiento orgánico en redes.' },
    { name: 'Video Corto (Reels/TikTok/YT)', purpose: 'Ayuda a que nuevas personas descubran tu marca de forma ágil.' }
  ],
  MOFU: [
    { name: 'Ebook / Guía Especializada', purpose: 'Captar datos de contacto (leads) a cambio de alto valor.' },
    { name: 'Muestra Gratis / Demo', purpose: 'Permite probar el servicio/producto antes de hacer una inversión.' },
    { name: 'Webinar / Masterclass', purpose: 'Formato interactivo audiovisual de alta densidad de información.' }
  ],
  BOFU: [
    { name: 'Caso de Éxito (Case Study)', purpose: 'Compara soluciones y demuestra resultados reales obtenidos.' },
    { name: 'Testimonio / Demostración Social', purpose: 'Fotos/reseñas con prueba social directa para el cierre.' }
  ]
}

const PRESET_CHANNELS_B2B = ['LinkedIn', 'Google Search (SEO)', 'Email Corporativo', 'Webinars & Demos', 'WhatsApp Business']
const PRESET_CHANNELS_B2C = ['Instagram', 'TikTok', 'WhatsApp', 'YouTube', 'Google / Reseñas', 'Facebook']

const TAG_PRESETS = [
  { name: 'Product', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Design', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'SEO', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Viral', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { name: 'Ventas', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
]

const INITIAL_PERSONAS = [
  {
    id: 'p-1',
    name: 'Carlos Mendoza',
    title: 'Director de Operaciones / CEO',
    type: 'B2B',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleType: 'Decisor',
    age: '46 años',
    salary: '+$90,000 USD / año',
    location: 'Lima, Perú / Santiago',
    experience: '8 años como director',
    family: 'Casado, 2 hijos',
    jtbd: 'Digitalizar y automatizar los procesos comerciales para reducir costos operativos y no depender de tareas manuales.',
    pains: [
      'Pérdida de leads por falta de seguimiento ágil',
      'Desorden en la base de datos de clientes',
      'Falta de visibilidad sobre el ROI de marketing'
    ],
    gains: [
      'Control total de métricas en un solo dashboard',
      'Aumento del 35% en conversión de leads a ventas',
      'Ahorro de 15 horas semanales del equipo comercial'
    ],
    dimensions: {
      external: 'Los KPIs del área no cumplen con las expectativas de la empresa, lo que pone en riesgo el crecimiento y genera presión constante del directorio.',
      internal: 'Se siente frustrado porque los resultados del área no reflejan el esfuerzo de su equipo, afectando su liderazgo y tranquilidad.',
      philosophical: 'Cree firmemente que un negocio moderno no debe perder ventas por procesos manuales obsoletos cuando existe tecnología accesible.'
    },
    guidePlan: {
      search: 'Busca información sobre cómo automatizar flujos comerciales y medir el ROI con claridad.',
      howWeHelp: 'Auditoría inicial de embudo, desarrollo de infraestructura digital de alta conversión y soporte continuo.',
      actionSteps: [
        'Diagnóstico inicial: Auditoría de flujos y cuellos de botella actuales.',
        'Optimización de KPIs: Configurar reportes automáticos y dashboard de conversión.',
        'Implementación guiada: Despliegue ágil en menos de 14 días con capacitación.'
      ]
    },
    habits: {
      channels: ['LinkedIn', 'Google Search (SEO)', 'Email Corporativo'],
      schedule: 'Miércoles y jueves de 2:00 PM a 4:00 PM (Receptivo a llamadas) • Noches 8:00 PM para webinars',
      quote: '“Es frustrante intentar cumplir con los objetivos comerciales cuando no tenemos las herramientas para medir en tiempo real.”'
    },
    keyMessages: {
      marketing: 'Optimiza tu área comercial con herramientas diseñadas para mejorar los KPIs, reducir tiempos de respuesta y aumentar las ventas. Solicita tu demo estratégica ahora.',
      sales: 'Nuestros clientes han reportado un aumento del 35% en conversión y un ahorro de 15 horas semanales durante los primeros 90 días. Implementación ágil con soporte dedicado.',
      formats: [
        'Redes sociales (LinkedIn): Publicaciones educativas sobre KPIs y automatizaciones.',
        'Anuncios pagados: Video corto mostrando la solución y comparativas de ROI.',
        'Blogs & Ebooks: Guías paso a paso sobre arquitectura comercial.',
        'Newsletters & Demos: Casos de éxito en PDF y webinars interactivos.'
      ]
    },
    channels: ['LinkedIn', 'Google Search (SEO)', 'Email Corporativo'],
    trigger: 'El equipo comercial perdió una cuenta clave por falta de trazabilidad en WhatsApp.'
  },
  {
    id: 'p-2',
    name: 'Valeria Ramos',
    title: 'Compradora Digital & Emprendedora',
    type: 'B2C',
    avatarImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    roleType: 'Compradora Directa',
    age: '29 años',
    salary: '+$28,000 USD / año',
    location: 'Bogotá / Ciudad de México',
    experience: 'Emprendedora digital',
    family: 'Soltera',
    jtbd: 'Encontrar soluciones de bienestar y estilo de vida confiables con compra inmediata y entrega garantizada.',
    pains: [
      'Páginas de compra lentas o confusas',
      'Poca claridad en los beneficios reales',
      'Desconfianza en marcas sin prueba social'
    ],
    gains: [
      'Experiencia de compra fluida en 2 clics',
      'Garantía de satisfacción y reviews verificadas',
      'Atención rápida y personalizada por WhatsApp'
    ],
    dimensions: {
      external: 'Pierde tiempo navegando en sitios lentos con pasarelas de pago dudosas que fallan al momento de pagar.',
      internal: 'Siente ansiedad e inseguridad de que el producto no llegue como se muestra en fotos o que no haya atención.',
      philosophical: 'Cree que comprar en línea debe ser una experiencia placentera, transparente y sin complicaciones.'
    },
    guidePlan: {
      search: 'Descubre marcas a través de videos cortos en TikTok e Instagram Reels.',
      howWeHelp: 'Plataforma de compra ultra-rápida, testimonios en video reales y confirmación directa por WhatsApp.',
      actionSteps: [
        'Descubrimiento visual en redes sociales.',
        'Checkout transparente en 2 pasos con múltiples opciones de pago.',
        'Seguimiento automático del pedido por WhatsApp.'
      ]
    },
    habits: {
      channels: ['Instagram', 'TikTok', 'WhatsApp'],
      schedule: 'Tardes 1:00 PM a 3:00 PM y Noches 7:00 PM a 10:00 PM en redes móviles',
      quote: '“Si una tienda online no me da confianza en los primeros 5 segundos o no tiene reseñas reales, me voy a otra.”'
    },
    keyMessages: {
      marketing: 'Descubre la forma más fácil y segura de comprar lo que necesitas con entrega rápida y garantía total.',
      sales: 'Más de 1,200 clientes satisfechos con calificación 4.9/5. Envío gratis y garantía de satisfacción de 30 días.',
      formats: [
        'Instagram & TikTok: Videos cortos con testimonios y unboxing de producto.',
        'Anuncios en Stories: Ofertas flash y llamado directo a WhatsApp.',
        'Demostración social: Fotos reales de clientes con el hashtag de marca.'
      ]
    },
    channels: ['Instagram', 'TikTok', 'WhatsApp'],
    trigger: 'Vio un video testimonial en redes sociales que resolvió su duda principal.'
  }
]

const INITIAL_CONTENT = [
  {
    id: 'c-1',
    title: 'Infografía: 5 Errores Costosos en la Gestión de Clientes',
    stage: 'TOFU',
    stageName: 'Reconocimiento',
    format: 'Infografía',
    purpose: 'Fácil de compartir y aumenta el descubrimiento orgánico en redes.',
    channel: 'Instagram & LinkedIn',
    tag: 'Product',
    tagColor: 'bg-blue-100 text-blue-800',
    date: '2026/08/30',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-2',
    title: 'Video Corto: Cómo Ahorrar 15 Horas Semanales con Automatizaciones',
    stage: 'TOFU',
    stageName: 'Reconocimiento',
    format: 'Video Corto (Reels/TikTok/YT)',
    purpose: 'Ayuda a que nuevas personas descubran tu marca de forma ágil.',
    channel: 'TikTok & Reels',
    tag: 'Design',
    tagColor: 'bg-amber-100 text-amber-800',
    date: '2026/08/28',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-3',
    title: 'Ebook: Guía Definitiva de Arquitectura Comercial para Empresas',
    stage: 'MOFU',
    stageName: 'Consideración',
    format: 'Ebook / Guía Especializada',
    purpose: 'Captar datos de contacto (leads) a cambio de alto valor.',
    channel: 'Landing Page & Ads',
    tag: 'SEO',
    tagColor: 'bg-purple-100 text-purple-800',
    date: '2026/09/05',
    personaId: 'p-1',
    status: 'En Progreso',
    modelType: 'B2B'
  },
  {
    id: 'c-4',
    title: 'Webinar: Cómo Escalar Operaciones Digitales en 90 Días',
    stage: 'MOFU',
    stageName: 'Consideración',
    format: 'Webinar / Masterclass',
    purpose: 'Formato interactivo audiovisual de alta densidad de información.',
    channel: 'Email Marketing & Zoom',
    tag: 'Product',
    tagColor: 'bg-blue-100 text-blue-800',
    date: '2026/09/12',
    personaId: 'p-1',
    status: 'Borrador',
    modelType: 'B2B'
  },
  {
    id: 'c-5',
    title: 'Caso de Éxito: Empresa B2B Multiplica x3 sus Ventas',
    stage: 'BOFU',
    stageName: 'Decisión',
    format: 'Caso de Éxito (Case Study)',
    purpose: 'Compara soluciones y demuestra resultados reales obtenidos.',
    channel: 'Landing Page & Ventas',
    tag: 'Ventas',
    tagColor: 'bg-emerald-100 text-emerald-800',
    date: '2026/08/25',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-6',
    title: 'Testimonio en Video de Cliente Satisfecho con Resultados Reales',
    stage: 'BOFU',
    stageName: 'Decisión',
    format: 'Testimonio / Demostración Social',
    purpose: 'Fotos/reseñas con prueba social directa para el cierre.',
    channel: 'Instagram Stories & Web',
    tag: 'Viral',
    tagColor: 'bg-rose-100 text-rose-800',
    date: '2026/08/29',
    personaId: 'p-2',
    status: 'Publicado',
    modelType: 'B2C'
  }
]

const INITIAL_POEM = [
  { id: 'poem-1', category: 'Owned', channel: 'Sitio Web & Blog Principal', efficiency: 'Alta', health: 92, share: 35, color: '#6366f1' },
  { id: 'poem-2', category: 'Owned', channel: 'Lista de Suscriptores Email', efficiency: 'Media', health: 74, share: 20, color: '#3b82f6' },
  { id: 'poem-3', category: 'Earned', channel: 'Reseñas & Testimonios', efficiency: 'Alta', health: 88, share: 15, color: '#10b981' },
  { id: 'poem-4', category: 'Earned', channel: 'Menciones Orgánicas en Redes', efficiency: 'Baja', health: 45, share: 10, color: '#f59e0b' },
  { id: 'poem-5', category: 'Paid', channel: 'Google Search Ads', efficiency: 'Alta', health: 85, share: 12, color: '#ec4899' },
  { id: 'poem-6', category: 'Paid', channel: 'Meta Ads Retargeting', efficiency: 'Alta', health: 90, share: 8, color: '#8b5cf6' }
]

export default function MarketingStudioPage() {
  // Global Business Model Switch: 'B2B' | 'B2C'
  const [businessModel, setBusinessModel] = useState('B2B')

  // Multi-View Selector: 'personas' (1) | 'kanban' (2) | 'grid' (3) | 'dashboard' (4) | 'smart' (5)
  const [currentView, setCurrentView] = useState('personas')

  // State initialization with LocalStorage
  const [personas, setPersonas] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_personas`)
    return saved ? JSON.parse(saved) : INITIAL_PERSONAS
  })
  const [contents, setContents] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contents`)
    return saved ? JSON.parse(saved) : INITIAL_CONTENT
  })
  const [poemChannels, setPoemChannels] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_poem`)
    return saved ? JSON.parse(saved) : INITIAL_POEM
  })

  // SMART Goal Builder State (HubSpot Sheets)
  const [smartSpecific, setSmartSpecific] = useState('Aumentar leads calificados desde nuestro sitio web para el equipo comercial.')
  const [smartMeasurable, setSmartMeasurable] = useState('+20% en volumen de MQLs mensuales.')
  const [smartAchievable, setSmartAchievable] = useState('Escalar de 100 leads actuales a 120 leads/mes.')
  const [smartRelevant, setSmartRelevant] = useState('Los leads del sitio web cierran a una tasa 3x mayor que pauta fría.')
  const [smartTimeBound, setSmartTimeBound] = useState('Plazo límite de 6 meses con evaluación mensual.')

  // MoM Growth Calculator States (HubSpot Sheet 2)
  const [momVisitorsCurrent, setMomVisitorsCurrent] = useState(1000)
  const [momVisitorsRate, setMomVisitorsRate] = useState(5.0) // 5% MoM
  const [momMonths, setMomMonths] = useState(6)

  const [momConvRateCurrent, setMomConvRateCurrent] = useState(5.0)
  const [momConvRateGrowth, setMomConvRateGrowth] = useState(3.0)

  const [momCloseRateCurrent, setMomCloseRateCurrent] = useState(5.0)
  const [momCloseRateGrowth, setMomCloseRateGrowth] = useState(5.0)

  // Unit Economics & Funnel Simulator States
  const [simTraffic, setSimTraffic] = useState(8500)
  const [simTofuToMofu, setSimTofuToMofu] = useState(4.5)
  const [simMofuToBofu, setSimMofuToBofu] = useState(12.0)
  const [simAov, setSimAov] = useState(480)
  const [simAdSpend, setSimAdSpend] = useState(1500)
  const [simLtvMultiplier, setSimLtvMultiplier] = useState(2.8)

  // Modals state
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [editingPersona, setEditingPersona] = useState(null)
  const [viewingExecutivePersona, setViewingExecutivePersona] = useState(null)
  const [executiveSlideTab, setExecutiveSlideTab] = useState('messages') // 'messages' | 'dimensions' | 'guide'

  const [newPersona, setNewPersona] = useState({
    name: '',
    title: '',
    type: 'B2B',
    jtbd: '',
    pains: '',
    gains: '',
    channels: [],
    trigger: ''
  })

  const [showContentModal, setShowContentModal] = useState(false)
  const [newContent, setNewContent] = useState({
    title: '',
    stage: 'TOFU',
    format: 'Infografía',
    purpose: 'Fácil de compartir y aumenta el descubrimiento orgánico en redes.',
    channel: '',
    tag: 'Product',
    tagColor: 'bg-blue-100 text-blue-800',
    personaId: 'p-1',
    status: 'Borrador',
    modelType: 'B2B'
  })

  // Auto-update default format and purpose when stage changes in modal
  useEffect(() => {
    const available = HUBSPOT_FORMATS_BY_STAGE[newContent.stage]
    if (available && available[0]) {
      setNewContent(prev => ({
        ...prev,
        format: available[0].name,
        purpose: available[0].purpose
      }))
    }
  }, [newContent.stage])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_personas`, JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contents`, JSON.stringify(contents))
  }, [contents])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_poem`, JSON.stringify(poemChannels))
  }, [poemChannels])

  // HubSpot MoM Compounding Calculations
  const calculatedMomVisitorsGoal = useMemo(() => {
    return Math.round(momVisitorsCurrent * Math.pow(1 + momVisitorsRate / 100, momMonths))
  }, [momVisitorsCurrent, momVisitorsRate, momMonths])

  const calculatedMomConvRateGoal = useMemo(() => {
    return (momConvRateCurrent * Math.pow(1 + momConvRateGrowth / 100, momMonths)).toFixed(2)
  }, [momConvRateCurrent, momConvRateGrowth, momMonths])

  const calculatedMomLeadsGoal = useMemo(() => {
    return Math.round(momVisitorsCurrent * (calculatedMomConvRateGoal / 100))
  }, [momVisitorsCurrent, calculatedMomConvRateGoal])

  const calculatedMomCloseRateGoal = useMemo(() => {
    return (momCloseRateCurrent * Math.pow(1 + momCloseRateGrowth / 100, momMonths)).toFixed(2)
  }, [momCloseRateCurrent, momCloseRateGrowth, momMonths])

  const calculatedMomCustomersGoal = useMemo(() => {
    return Math.round(100 * (calculatedMomCloseRateGoal / 100))
  }, [calculatedMomCloseRateGoal])

  // Simulator Calculations
  const calculatedLeads = useMemo(() => Math.round(simTraffic * (simTofuToMofu / 100)), [simTraffic, simTofuToMofu])
  const calculatedCustomers = useMemo(() => Math.round(calculatedLeads * (simMofuToBofu / 100)), [calculatedLeads, simMofuToBofu])
  const calculatedRevenue = useMemo(() => calculatedCustomers * simAov, [calculatedCustomers, simAov])
  const calculatedCac = useMemo(() => (calculatedCustomers > 0 ? Math.round(simAdSpend / calculatedCustomers) : 0), [simAdSpend, calculatedCustomers])
  const calculatedLtv = useMemo(() => Math.round(simAov * simLtvMultiplier), [simAov, simLtvMultiplier])
  const calculatedLtvCacRatio = useMemo(() => (calculatedCac > 0 ? (calculatedLtv / calculatedCac).toFixed(1) : '∞'), [calculatedLtv, calculatedCac])
  const calculatedRoas = useMemo(() => (simAdSpend > 0 ? (calculatedRevenue / simAdSpend).toFixed(1) : '0'), [calculatedRevenue, simAdSpend])

  // Handlers for Personas
  const handleSavePersona = (e) => {
    e.preventDefault()
    if (!newPersona.name || !newPersona.jtbd) return

    const resolvedChannels = Array.isArray(newPersona.channels)
      ? newPersona.channels
      : (typeof newPersona.channels === 'string' ? newPersona.channels.split(',').map(s => s.trim()).filter(Boolean) : [])

    if (editingPersona) {
      setPersonas(prev => prev.map(p => (p.id === editingPersona.id ? {
        ...editingPersona,
        ...newPersona,
        type: businessModel,
        pains: typeof newPersona.pains === 'string' ? newPersona.pains.split('\n').filter(Boolean) : newPersona.pains,
        gains: typeof newPersona.gains === 'string' ? newPersona.gains.split('\n').filter(Boolean) : newPersona.gains,
        channels: resolvedChannels
      } : p)))
    } else {
      const created = {
        id: `p-${Date.now()}`,
        name: newPersona.name,
        title: newPersona.title,
        type: businessModel,
        avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        roleType: businessModel === 'B2B' ? 'Decisor' : 'Comprador Directo',
        age: '38 años',
        salary: '+$45,000 USD / año',
        location: 'Latinoamérica',
        experience: 'Profesional activo',
        family: 'Familia',
        jtbd: newPersona.jtbd,
        pains: typeof newPersona.pains === 'string' ? newPersona.pains.split('\n').filter(Boolean) : newPersona.pains,
        gains: typeof newPersona.gains === 'string' ? newPersona.gains.split('\n').filter(Boolean) : newPersona.gains,
        channels: resolvedChannels.length > 0 ? resolvedChannels : (businessModel === 'B2B' ? ['LinkedIn', 'Google Search'] : ['Instagram', 'TikTok']),
        dimensions: {
          external: 'Dificultad para encontrar soluciones confiables y medir el impacto real.',
          internal: 'Frustración por la falta de resultados visibles y pérdida de tiempo.',
          philosophical: 'Cree que las herramientas digitales deben simplificar la vida del negocio.'
        },
        guidePlan: {
          search: 'Busca comparativas claras y asesoría confiable.',
          howWeHelp: 'Implementación guiada, soporte dedicado y métricas claras.',
          actionSteps: ['Auditoría inicial', 'Configuración de herramientas', 'Capacitación y soporte']
        },
        habits: {
          channels: resolvedChannels,
          schedule: 'Horario comercial regular',
          quote: `“Buscamos soluciones que nos den tranquilidad y resultados.”`
        },
        keyMessages: {
          marketing: `Optimiza tu operación con tecnología de alta gama. Solicita tu asesoría estratégica.`,
          sales: `Resultados comprobados con implementación ágil y garantía total de satisfacción.`,
          formats: ['LinkedIn / Redes Sociales', 'Ebook / Guía', 'Demostración en vivo']
        },
        trigger: newPersona.trigger || 'Detectó una fuga de oportunidades y decidió actuar.'
      }
      setPersonas(prev => [...prev, created])
    }
    setShowPersonaModal(false)
    setEditingPersona(null)
    setNewPersona({ name: '', title: '', type: businessModel, jtbd: '', pains: '', gains: '', channels: [], trigger: '' })
  }

  const handleDeletePersona = (id) => {
    setPersonas(prev => prev.filter(p => p.id !== id))
    if (viewingExecutivePersona?.id === id) setViewingExecutivePersona(null)
  }

  const handleOpenEditPersona = (persona) => {
    setEditingPersona(persona)
    setNewPersona({
      name: persona.name,
      title: persona.title,
      type: persona.type,
      jtbd: persona.jtbd,
      pains: Array.isArray(persona.pains) ? persona.pains.join('\n') : persona.pains,
      gains: Array.isArray(persona.gains) ? persona.gains.join('\n') : persona.gains,
      channels: Array.isArray(persona.channels) ? persona.channels : [],
      trigger: persona.trigger || ''
    })
    setShowPersonaModal(true)
  }

  // Handlers for Content Mapping
  const handleSaveContent = (e) => {
    e.preventDefault()
    if (!newContent.title) return
    const stageNames = { TOFU: 'Reconocimiento', MOFU: 'Consideración', BOFU: 'Decisión' }
    const created = {
      id: `c-${Date.now()}`,
      ...newContent,
      stageName: stageNames[newContent.stage] || 'TOFU',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      modelType: businessModel
    }
    setContents(prev => [created, ...prev])
    setShowContentModal(false)
    setNewContent({
      title: '',
      stage: 'TOFU',
      format: 'Infografía',
      purpose: 'Fácil de compartir y aumenta el descubrimiento orgánico en redes.',
      channel: '',
      tag: 'Product',
      tagColor: 'bg-blue-100 text-blue-800',
      personaId: personas[0]?.id || 'p-1',
      status: 'Borrador',
      modelType: businessModel
    })
  }

  const handleDeleteContent = (id) => {
    setContents(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 selection:bg-slate-900 selection:text-white font-sans text-sm pb-24">
      
      {/* 1. MODERN WORKSPACE TOPBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Suite Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Marketing Studio OS</h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Modern Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-View System • Metas SMART, Content Mapping (Pág. 6) y Unit Economics
              </p>
            </div>
          </div>

          {/* Quick Controls: Model Switcher & New Asset */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Global Business Model Switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBusinessModel('B2B')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  businessModel === 'B2B'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Modelo B2B</span>
              </button>

              <button
                type="button"
                onClick={() => setBusinessModel('B2C')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  businessModel === 'B2C'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Modelo B2C</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                if (currentView === 'personas') {
                  setEditingPersona(null)
                  setNewPersona({ name: '', title: '', type: businessModel, jtbd: '', pains: '', gains: '', channels: [], trigger: '' })
                  setShowPersonaModal(true)
                } else {
                  setShowContentModal(true)
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{currentView === 'personas' ? 'Nueva Persona' : 'Nueva Pieza'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* 2. ORDERED MULTI-VIEW SELECTOR BAR (1. BUYER PERSONAS AS FIRST TAB) */}
        <div className="p-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
          
          {/* 1. Personas View (FIRST) */}
          <button
            type="button"
            onClick={() => setCurrentView('personas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentView === 'personas'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-purple-500 text-white flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span>1. Buyer Personas & Slides</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 font-mono">
              {personas.length}
            </span>
          </button>

          {/* 2. Kanban View */}
          <button
            type="button"
            onClick={() => setCurrentView('kanban')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentView === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Kanban className="w-3.5 h-3.5" />
            </div>
            <span>2. Content Mapping (Pág. 6)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700 font-mono">
              {contents.length}
            </span>
          </button>

          {/* 3. Grid Table View */}
          <button
            type="button"
            onClick={() => setCurrentView('grid')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentView === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center shrink-0">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <span>3. Base Relacional POEM</span>
          </button>

          {/* 4. Dashboard View */}
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentView === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <span>4. Dashboard & Unit Economics</span>
          </button>

          {/* 5. Automated SMART */}
          <button
            type="button"
            onClick={() => setCurrentView('smart')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              currentView === 'smart'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>5. Automated SMART</span>
          </button>

        </div>

        {/* 3. ACTIVE VIEW CONTENT */}
        <AnimatePresence mode="wait">

          {/* =========================================================================
              VIEW 1: PERSONAS & PRESENTATION SLIDES (FIRST TAB)
             ========================================================================= */}
          {currentView === 'personas' && (
            <motion.div
              key="view-personas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>Perfiles de Buyer Personas & Fichas de Presentación</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Diseño de fichas ejecutivas listas para exportar en PDF y presentar a clientes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPersona(null)
                    setNewPersona({ name: '', title: '', type: businessModel, jtbd: '', pains: '', gains: '', channels: [], trigger: '' })
                    setShowPersonaModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs"
                >
                  + Agregar Persona
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {personas.map((persona) => (
                  <div key={persona.id} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    
                    {/* Header with Avatar & Tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={persona.avatarImg}
                          alt={persona.name}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
                        />
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{persona.name}</h4>
                          <p className="text-xs sm:text-sm text-slate-500">{persona.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800">
                          {persona.roleType}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          persona.type === 'B2B' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {persona.type}
                        </span>
                      </div>
                    </div>

                    {/* JTBD Quotation Card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      "{persona.jtbd}"
                    </div>

                    {/* Pains & Gains Pastel Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-100">
                        <div className="font-bold text-red-800 mb-1.5">Dolores Principales</div>
                        <ul className="space-y-1 text-slate-700">
                          {persona.pains.slice(0, 2).map((p, i) => (
                            <li key={i} className="truncate">• {p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <div className="font-bold text-emerald-800 mb-1.5">Ganancias Deseadas</div>
                        <ul className="space-y-1 text-slate-700">
                          {persona.gains.slice(0, 2).map((g, i) => (
                            <li key={i} className="truncate">• {g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions & Slide Presentation Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setViewingExecutivePersona(persona)
                          setExecutiveSlideTab('messages')
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Ver Ficha Diapositiva (Slide)</span>
                      </button>

                      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
                        <button onClick={() => handleOpenEditPersona(persona)} className="text-indigo-600 hover:text-indigo-800">
                          Editar
                        </button>
                        <button onClick={() => handleDeletePersona(persona.id)} className="text-red-500 hover:text-red-700">
                          Eliminar
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 2: KANBAN VIEW (CONTENT MAPPING & TOFU-MOFU-BOFU STAGES)
             ========================================================================= */}
          {currentView === 'kanban' && (
            <motion.div
              key="view-kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Mapeo de Contenidos por Etapas de Funnel (Pág. 6)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Formato Kanban con etiquetas pastel, objetivos y reglas de HubSpot.
                  </p>
                </div>
              </div>

              {/* 3 Columns: TOFU, MOFU, BOFU */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {[
                  { stage: 'TOFU', name: '1. Reconocimiento (TOFU)', badgeColor: 'bg-emerald-500', desc: 'Infografías y Videos Cortos (Descubrimiento)' },
                  { stage: 'MOFU', name: '2. Consideración (MOFU)', badgeColor: 'bg-blue-500', desc: 'Ebooks, Muestras y Webinars (Nutrición/Leads)' },
                  { stage: 'BOFU', name: '3. Decisión (BOFU)', badgeColor: 'bg-purple-500', desc: 'Casos de Éxito y Testimonios (Cierre/Ventas)' }
                ].map((col) => {
                  const colItems = contents.filter(c => c.stage === col.stage)
                  return (
                    <div key={col.stage} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 min-h-[480px]">
                      
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${col.badgeColor}`} />
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{col.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {colItems.length}
                        </span>
                      </div>

                      {/* Column Subtitle / Rule */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {col.desc}
                      </div>

                      {/* Cards Stack */}
                      <div className="space-y-3">
                        {colItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-3"
                          >
                            {/* Card Title */}
                            <h5 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h5>

                            {/* Pastel Tags (Lark Style) */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.tagColor || 'bg-blue-100 text-blue-800'}`}>
                                {item.tag || 'Product'}
                              </span>
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                                {item.format}
                              </span>
                            </div>

                            {/* Date & Channel */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                              <span>{item.date || '2026/08/30'}</span>
                              <span className="text-indigo-600 font-semibold">{item.channel}</span>
                            </div>

                            {/* Card Wireframe Visual Elements (Like Reference Image) */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center text-xs font-bold text-emerald-700">
                                ✓ Formato Pág. 6
                              </div>
                              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-center text-xs font-bold text-blue-700">
                                {item.status}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Quick Add Placeholder */}
                        <button
                          onClick={() => {
                            setNewContent(prev => ({ ...prev, stage: col.stage }))
                            setShowContentModal(true)
                          }}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Añadir Pieza
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 3: GRID TABLE VIEW (STRUCTURED RELATIONAL SPREADSHEET)
             ========================================================================= */}
          {currentView === 'grid' && (
            <motion.div
              key="view-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-500 text-white flex items-center justify-center">
                    <TableIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Grid View • Base Relacional de Contenidos</h3>
                </div>
                <button
                  onClick={() => setShowContentModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm"
                >
                  + Agregar Fila
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Título del Activo</th>
                      <th className="py-3 px-4">Etapa Funnel</th>
                      <th className="py-3 px-4">Formato (Pág. 6)</th>
                      <th className="py-3 px-4">Canal</th>
                      <th className="py-3 px-4">Tag</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {contents.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.title}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                            {item.stage} • {item.stageName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{item.format}</td>
                        <td className="py-3.5 px-4 text-indigo-600 font-medium">{item.channel}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.tagColor || 'bg-blue-100 text-blue-800'}`}>
                            {item.tag || 'Product'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 4: DASHBOARD VIEW (WIDGETS, DONUT CHART & UNIT ECONOMICS)
             ========================================================================= */}
          {currentView === 'dashboard' && (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Top Widgets Grid (Like Reference Image: Giant Numbers 20, 17, Donut Chart) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Left Mini KPI Cards (Giant Numbers 20, 17) */}
                <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                  
                  {/* Card 1: Giant 20 (Green) */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-slate-400 text-xs sm:text-sm font-bold">
                      <span>Piezas de Contenido Activas</span>
                      <span>•••</span>
                    </div>
                    <div className="text-5xl font-black font-mono text-emerald-500 tracking-tight">
                      {contents.length * 3 + 2}
                    </div>
                    <div className="w-16 h-1.5 bg-emerald-500 rounded-full" />
                    <div className="text-xs text-slate-500 pt-1 font-medium">
                      +15% de alcance orgánico mensual
                    </div>
                  </div>

                  {/* Card 2: Giant 17 (Orange) */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-slate-400 text-xs sm:text-sm font-bold">
                      <span>Canales & Rutas POEM Auditadas</span>
                      <span>•••</span>
                    </div>
                    <div className="text-5xl font-black font-mono text-amber-500 tracking-tight">
                      {poemChannels.length * 2 + 5}
                    </div>
                    <div className="w-16 h-1.5 bg-amber-500 rounded-full" />
                    <div className="text-xs text-slate-500 pt-1 font-medium">
                      Medios Propios, Obtenidos y Pagados
                    </div>
                  </div>

                </div>

                {/* Right Donut Chart & POEM Breakdown (Like Reference Image) */}
                <div className="md:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-purple-600" />
                        Distribución de Canales & Salud POEM
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Porcentaje de impacto por medio</p>
                    </div>
                    <span className="text-slate-400 text-xs font-bold">•••</span>
                  </div>

                  {/* Donut Chart Simulation */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-2">
                    
                    {/* SVG Donut Visual */}
                    <div className="sm:col-span-5 flex justify-center">
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          {/* Circle Segments */}
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#6366f1" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="0" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-35" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-55" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-70" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ec4899" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-88" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xl font-black font-mono text-slate-900">100%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mix POEM</span>
                        </div>
                      </div>
                    </div>

                    {/* Channel Legend List */}
                    <div className="sm:col-span-7 space-y-2">
                      {poemChannels.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-bold text-slate-800">{item.channel}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400 text-xs">{item.efficiency}</span>
                            <span className="font-bold text-slate-900">{item.share}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Atribución multicanal calculada</span>
                    <span className="text-emerald-600 font-bold">Salud General: 88% Óptimo</span>
                  </div>
                </div>

              </div>

              {/* Financial Simulator & Unit Economics (CAC, LTV, ROAS) */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Simulador de Retorno Financiero & Unit Economics ({businessModel})
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Ajusta los parámetros para proyectar facturación y rentabilidad</p>
                  </div>
                  <div className="text-right font-mono text-sm font-bold text-emerald-600">
                    ROAS: {calculatedRoas}x
                  </div>
                </div>

                {/* 4 Financial Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-xs text-slate-400 font-bold uppercase">Facturación Estimada</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">${calculatedRevenue.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-xs text-slate-400 font-bold uppercase">CAC (Costo Adquisición)</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">${calculatedCac}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-xs text-slate-400 font-bold uppercase">LTV (Valor de Vida)</div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">${calculatedLtv}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-xs text-slate-400 font-bold uppercase">Ratio LTV / CAC</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{calculatedLtvCacRatio}x</div>
                  </div>
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                      <span>Tráfico Mensual:</span>
                      <span className="font-mono text-indigo-600">{simTraffic.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={simTraffic}
                      onChange={(e) => setSimTraffic(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                      <span>Conversión a Lead:</span>
                      <span className="font-mono text-blue-600">{simTofuToMofu}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={simTofuToMofu}
                      onChange={(e) => setSimTofuToMofu(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                      <span>Ticket Promedio (AOV):</span>
                      <span className="font-mono text-emerald-600">${simAov}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="3000"
                      step="50"
                      value={simAov}
                      onChange={(e) => setSimAov(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* =========================================================================
              VIEW 5: AUTOMATED SMART GOALS & MOM WORKFLOW (HUBSPOT SHEETS ENGINE)
             ========================================================================= */}
          {currentView === 'smart' && (
            <motion.div
              key="view-smart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-600" />
                    <span>Automated SMART Engine • Planificador & Calculadora MoM</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Fórmula matemática de crecimiento compuesto y evaluación de capacidad operativa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 5-Step S-M-A-R-T Automated Workflow (Like Reference Image) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-cyan-500 text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Automated SMART Workflow</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Paso a Paso</span>
                  </div>

                  {/* S */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-indigo-700">S • Específico</span>
                    <input
                      type="text"
                      value={smartSpecific}
                      onChange={(e) => setSmartSpecific(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* M */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-blue-700">M • Medible</span>
                    <input
                      type="text"
                      value={smartMeasurable}
                      onChange={(e) => setSmartMeasurable(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* A */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-purple-700">A • Alcanzable</span>
                    <input
                      type="text"
                      value={smartAchievable}
                      onChange={(e) => setSmartAchievable(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* R */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-amber-700">R • Relevante</span>
                    <input
                      type="text"
                      value={smartRelevant}
                      onChange={(e) => setSmartRelevant(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* T */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-emerald-700">T • Límite de Tiempo</span>
                    <input
                      type="text"
                      value={smartTimeBound}
                      onChange={(e) => setSmartTimeBound(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  {/* Final Statement */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Objetivo SMART Oficial</div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      "{smartSpecific} {smartRelevant} {smartTimeBound}"
                    </p>
                  </div>
                </div>

                {/* MoM Compound Calculator */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Calculadora MoM (Compuesto)
                      </h4>
                      <span className="text-xs font-mono font-bold text-indigo-600">{momMonths} Meses</span>
                    </div>

                    <div className="space-y-3.5 text-xs sm:text-sm">
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>Visitantes Iniciales:</span>
                          <span className="font-mono">{momVisitorsCurrent}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-mono font-bold">
                          Meta Tráfico: {calculatedMomVisitorsGoal.toLocaleString()} visitas/mes
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>Conversión a Lead:</span>
                          <span className="font-mono">{momConvRateCurrent}%</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-800 font-mono font-bold">
                          Meta Leads: {calculatedMomConvRateGoal}% ({calculatedMomLeadsGoal} leads/mes)
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>Cierre a Clientes:</span>
                          <span className="font-mono">{momCloseRateCurrent}%</span>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-800 font-mono font-bold">
                          Meta Cierre: {calculatedMomCloseRateGoal}% ({calculatedMomCustomersGoal} clientes/mes)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Obstacle Test Box */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 text-amber-900">
                    <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Evaluación de Obstáculos & Capacidad</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Para asegurar el cumplimiento de esta meta, se recomienda reservar <strong>6 a 8 horas semanales</strong> del equipo comercial dedicadas a la nutrición de prospectos.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* =========================================================================
            MODAL 1: PERSONA CREATION / EDITING (MODERN WORKSPACE REDESIGN)
           ========================================================================= */}
        {showPersonaModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {editingPersona ? 'Editar Buyer Persona' : 'Crear Nuevo Buyer Persona'}
                    </h3>
                    <p className="text-xs text-slate-500">Framework JTBD, StoryBrand & HubSpot Standards</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPersonaModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePersona} className="space-y-4 text-xs sm:text-sm">
                
                {/* Name & Role Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={newPersona.name}
                      onChange={(e) => setNewPersona(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      {businessModel === 'B2B' ? 'Cargo / Rol' : 'Arquetipo'}
                    </label>
                    <input
                      type="text"
                      placeholder={businessModel === 'B2B' ? 'Ej. Director de Operaciones / CEO' : 'Ej. Compradora Frecuente'}
                      value={newPersona.title}
                      onChange={(e) => setNewPersona(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* JTBD */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Job To Be Done (Progreso que busca)</label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Describe exactamente qué problema busca resolver y el resultado deseado..."
                    value={newPersona.jtbd}
                    onChange={(e) => setNewPersona(p => ({ ...p, jtbd: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
                  />
                </div>

                {/* Pains & Gains */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100/80 space-y-1">
                    <label className="block text-red-900 font-bold mb-1">Dolores Principales (1 por línea)</label>
                    <textarea
                      rows="3"
                      placeholder="Pérdida de leads&#10;Falta de visibilidad ROI"
                      value={newPersona.pains}
                      onChange={(e) => setNewPersona(p => ({ ...p, pains: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-slate-900 focus:outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-1">
                    <label className="block text-emerald-900 font-bold mb-1">Ganancias Deseadas (1 por línea)</label>
                    <textarea
                      rows="3"
                      placeholder="Aumento del 35%&#10;Ahorro de 15 horas"
                      value={newPersona.gains}
                      onChange={(e) => setNewPersona(p => ({ ...p, gains: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 text-slate-900 focus:outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Channel Badges Selector */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Canales de Información ({businessModel})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(businessModel === 'B2B' ? PRESET_CHANNELS_B2B : PRESET_CHANNELS_B2C).map(ch => {
                      const currentChannels = Array.isArray(newPersona.channels)
                        ? newPersona.channels
                        : (typeof newPersona.channels === 'string' ? newPersona.channels.split(',').map(s => s.trim()) : [])
                      const isSelected = currentChannels.includes(ch)
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            let updated
                            if (isSelected) {
                              updated = currentChannels.filter(c => c !== ch)
                            } else {
                              updated = [...currentChannels, ch]
                            }
                            setNewPersona(p => ({ ...p, channels: updated }))
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? `✓ ${ch}` : `+ ${ch}`}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPersonaModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 text-xs sm:text-sm shadow-sm transition-all"
                  >
                    Guardar Persona
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: CONTENT PIECE FORM (MODERN WORKSPACE REDESIGN)
           ========================================================================= */}
        {showContentModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Kanban className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Mapear Pieza de Contenido
                    </h3>
                    <p className="text-xs text-slate-500">Validador de Formatos & Propósito (Página 6 HubSpot)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveContent} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Título de la Pieza</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Infografía de Errores Comunes"
                    value={newContent.title}
                    onChange={(e) => setNewContent(c => ({ ...c, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition-all text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Etapa de Funnel</label>
                    <select
                      value={newContent.stage}
                      onChange={(e) => setNewContent(c => ({ ...c, stage: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none font-semibold text-xs sm:text-sm"
                    >
                      <option value="TOFU">1. Reconocimiento (TOFU)</option>
                      <option value="MOFU">2. Consideración (MOFU)</option>
                      <option value="BOFU">3. Decisión (BOFU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Formato (Página 6)</label>
                    <select
                      value={newContent.format}
                      onChange={(e) => {
                        const selectedFormat = e.target.value
                        const match = HUBSPOT_FORMATS_BY_STAGE[newContent.stage]?.find(f => f.name === selectedFormat)
                        setNewContent(c => ({
                          ...c,
                          format: selectedFormat,
                          purpose: match ? match.purpose : ''
                        }))
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none font-semibold text-xs sm:text-sm"
                    >
                      {HUBSPOT_FORMATS_BY_STAGE[newContent.stage]?.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Purpose Alert */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950">
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Propósito Metodológico Oficial (HubSpot):</span>
                  </div>
                  <div>{newContent.purpose}</div>
                </div>

                {/* Tag Selection */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">Etiqueta Visual</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_PRESETS.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setNewContent(c => ({ ...c, tag: t.name, tagColor: t.color }))}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          newContent.tag === t.name
                            ? 'ring-2 ring-slate-900 shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                        } ${t.color}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Canal de Distribución</label>
                  <input
                    type="text"
                    placeholder={businessModel === 'B2B' ? 'LinkedIn, Blog, Email' : 'Instagram, TikTok, WhatsApp'}
                    value={newContent.channel}
                    onChange={(e) => setNewContent(c => ({ ...c, channel: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowContentModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 text-xs sm:text-sm shadow-sm transition-all"
                  >
                    Guardar Pieza
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: EXECUTIVE SLIDE PRESENTATION (IDENTICAL TO REFERENCE SLIDE)
           ========================================================================= */}
        {viewingExecutivePersona && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 max-w-5xl w-full space-y-6 shadow-2xl my-auto"
            >
              {/* Slide Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                    Ficha Ejecutiva HubSpot
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {viewingExecutivePersona.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {viewingExecutivePersona.title} • Modelo {viewingExecutivePersona.type}
                    </p>
                  </div>
                </div>

                {/* Slide Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto">
                  {[
                    { id: 'messages', label: '1. Mensajes Clave (Slide)' },
                    { id: 'dimensions', label: '2. 3 Dimensiones del Dolor' },
                    { id: 'guide', label: '3. Plan de Acción & Hábitos' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setExecutiveSlideTab(tab.id)}
                      className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                        executiveSlideTab === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Print & Close */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    title="Imprimir o Guardar como PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Guardar PDF</span>
                  </button>
                  <button
                    onClick={() => setViewingExecutivePersona(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SLIDE CANVAS (HUBSPOT PRESENTATION LAYOUT) */}
              <div className="bg-[#fafbfc] rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-inner">
                
                {/* 1. SLIDE: MENSAJES CLAVE (EXACT HUBSPOT IMAGE LAYOUT) */}
                {executiveSlideTab === 'messages' && (
                  <div className="space-y-6">
                    {/* Slide Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          Mensajes clave
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Estrategia de comunicación diferenciada para atraer y convertir
                        </p>
                      </div>

                      {/* Header Capsule Info Box */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 max-w-sm">
                        <img
                          src={viewingExecutivePersona.avatarImg}
                          alt={viewingExecutivePersona.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-200 shrink-0"
                        />
                        <div className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          Define los mensajes principales desde las perspectivas de marketing y ventas
                        </div>
                      </div>
                    </div>

                    {/* Nodes & Connector Quotation Cards (Layout 1 - 2 - 3) */}
                    <div className="space-y-4">
                      
                      {/* Node 1: Mensaje de Marketing */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                          <div>
                            <div className="text-xs sm:text-sm font-bold">Mensaje de marketing</div>
                            <div className="text-xs text-slate-300">Respuesta a la problemática del cliente.</div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                            1
                          </div>
                        </div>
                        <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm font-medium text-slate-800 shadow-sm italic leading-relaxed">
                          "{viewingExecutivePersona.keyMessages?.marketing || viewingExecutivePersona.jtbd}"
                        </div>
                      </div>

                      {/* Node 2: Mensaje de Ventas */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                          <div>
                            <div className="text-xs sm:text-sm font-bold">Mensaje de ventas</div>
                            <div className="text-xs text-slate-300">Respuesta de ventas para llegar al cliente.</div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                            2
                          </div>
                        </div>
                        <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm font-medium text-slate-800 shadow-sm leading-relaxed">
                          "{viewingExecutivePersona.keyMessages?.sales || 'Prueba social y resultados comprobados con soporte dedicado.'}"
                        </div>
                      </div>

                      {/* Node 3: Formatos Recomendados */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                          <div>
                            <div className="text-xs sm:text-sm font-bold">Formatos</div>
                            <div className="text-xs text-slate-300">Contenido más adecuado para transmitir los mensajes.</div>
                          </div>
                          <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                            3
                          </div>
                        </div>
                        <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm text-slate-700 shadow-sm space-y-1.5">
                          {viewingExecutivePersona.keyMessages?.formats?.map((fmt, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                              <span>{fmt}</span>
                            </div>
                          )) || (
                            <div>Formatos personalizados según etapa del funnel.</div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. SLIDE: 3 DIMENSIONES DEL DOLOR */}
                {executiveSlideTab === 'dimensions' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Dimensión Psicológica del Problema</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Framework StoryBrand & HubSpot para entender la raíz del dolor</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-700">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-black">1</span>
                          <span>Problema Externo (Tangible)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {viewingExecutivePersona.dimensions?.external || viewingExecutivePersona.pains[0]}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-700">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-black">2</span>
                          <span>Problema Interno (Emocional)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {viewingExecutivePersona.dimensions?.internal || viewingExecutivePersona.pains[1]}
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-black">3</span>
                          <span>Problema Filosófico (Valores)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {viewingExecutivePersona.dimensions?.philosophical || 'Cree que un negocio debe operar con excelencia y tecnología moderna.'}
                        </p>
                      </div>

                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs sm:text-sm text-amber-900 italic">
                      <strong>Cita Textual del Cliente:</strong> {viewingExecutivePersona.habits?.quote || '“Buscamos soluciones que nos permitan crecer con orden y tranquilidad.”'}
                    </div>
                  </div>
                )}

                {/* 3. SLIDE: PLAN DE ACCIÓN & HÁBITOS */}
                {executiveSlideTab === 'guide' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Tu Empresa como Guía & Hábitos de Consumo</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Plan estratégico de implementación y momentos ideales de contacto</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Plan de Acción en 3 Pasos</h4>
                        <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                          {viewingExecutivePersona.guidePlan?.actionSteps?.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="font-bold text-indigo-600 shrink-0">Paso {i + 1}:</span>
                              <span>{step}</span>
                            </div>
                          )) || (
                            <div>Diagnóstico ➔ Implementación ➔ Soporte</div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Horarios & Canales de Receptividad</h4>
                        <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-slate-900 block mb-0.5">Canales Digitales:</span>
                            <span>{viewingExecutivePersona.channels?.join(', ')}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="font-bold text-slate-900 block mb-0.5">Ventanas de Contacto Óptimas:</span>
                            <span>{viewingExecutivePersona.habits?.schedule || 'Horario laboral regular'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}

      </main>
    </div>
  )
}
