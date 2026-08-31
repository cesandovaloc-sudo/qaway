import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  ArrowUp,
  Phone,
  Printer,
  X,
  Sliders,
  ShieldCheck,
  Activity,
  ChevronRight,
  ChevronDown,
  Filter,
  Share2,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  MoreHorizontal
} from 'lucide-react'

// LocalStorage persistence key
const STORAGE_KEY = 'qaway_marketing_workspace_v6'

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

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
]

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
    avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleType: 'Decisor',
    age: 'Entre 40 y 49 años',
    education: 'Maestría / MBA',
    industry: 'Tecnología & Servicios B2B',
    companySize: 'Entre 10 y 50 empleados',
    socialNetworks: ['linkedin', 'x', 'facebook'],
    commChannels: ['Correo electrónico', 'Teléfono / WhatsApp', 'Reuniones Virtuales'],
    reportingTo: 'Directorio / Junta Directiva',
    tools: ['Software de CRM', 'Sistemas ERP / Gestión', 'Correo electrónico corporativo'],
    kpis: ['Aumento de facturación', 'Reducción de costos operativos', 'Tasa de conversión comercial'],
    pains: [
      'Pérdida de leads por falta de seguimiento ágil',
      'Desorden en la base de datos de clientes',
      'Falta de visibilidad sobre el ROI de marketing'
    ],
    howWeHelp: 'Implementación de arquitectura comercial digital, dashboard en tiempo real y soporte dedicado.',
    infoSources: ['Investigación en línea, LinkedIn y recomendaciones de pares'],
    salary: '+$90,000 USD / año',
    location: 'Lima, Perú / Santiago',
    jtbd: 'Digitalizar y automatizar los procesos comerciales para reducir costos operativos y no depender de tareas manuales.',
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
    name: 'Roxana Jimenez',
    title: 'Fundadora & Directora Médica',
    type: 'B2B',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleType: 'Decisora Principal',
    age: 'Entre 35 y 44 años',
    education: 'Título profesional y Especialidad',
    industry: 'Cuidado de la salud / Clínica Dental',
    companySize: 'Entre 1 y 10 empleados',
    socialNetworks: ['instagram', 'facebook', 'linkedin'],
    commChannels: ['WhatsApp Business', 'Teléfono', 'Redes sociales'],
    reportingTo: 'Propietaria independiente',
    tools: ['Software Dental / Agenda', 'WhatsApp Web', 'Sistemas de gestión'],
    kpis: ['Crecimiento de pacientes nuevos', 'Retención de tratamientos', 'Satisfacción del paciente'],
    pains: [
      'Posicionar su marca de clínica dental frente a la competencia',
      'Competencia desleal en precios en el sector',
      'Falta de tiempo y recursos especializados para marketing'
    ],
    howWeHelp: 'Estrategia de posicionamiento de reputación médica, captación automatizada de citas y seguimiento por WhatsApp.',
    infoSources: ['Investigación en línea, redes sociales y recomendaciones de colegas'],
    salary: '+$45,000 USD / año',
    location: 'Bogotá / Lima',
    jtbd: 'Atraer pacientes calificados para tratamientos de alto valor sin depender de descuentos constantes.',
    gains: [
      'Agenda de citas llena con pacientes recurrentes',
      'Marca reconocida como referente de calidad en su ciudad',
      'Automatización de recordatorios de citas'
    ],
    dimensions: {
      external: 'Los pacientes cotizan por WhatsApp pero no asisten a la primera evaluación.',
      internal: 'Siente estrés de tener que atender consultas en su tiempo libre.',
      philosophical: 'Cree que la salud requiere profesionalismo y no tácticas agresivas de venta.'
    },
    guidePlan: {
      search: 'Busca agencias o plataformas confiables con casos de éxito médicos.',
      howWeHelp: 'Configuración de embudo médico con confirmación de citas y presencia web de confianza.',
      actionSteps: ['Diseño de landing de especialidad', 'Campaña de reputación', 'Atención guiada por WhatsApp']
    },
    habits: {
      channels: ['Instagram', 'WhatsApp', 'Facebook'],
      schedule: 'Tardes entre consultas (1:00 PM - 3:00 PM)',
      quote: '“Quiero que los pacientes valoren la calidad del tratamiento y no solo pregunten por el precio.”'
    },
    keyMessages: {
      marketing: 'Posiciona tu clínica con una imagen sólida y atrae pacientes que buscan excelencia médica.',
      sales: 'Multiplica la confirmación de tus citas y profesionaliza tu atención en menos de 14 días.',
      formats: [
        'Instagram & Reels: Videos educativos y testimonios de pacientes.',
        'Google Ads & Reseñas: Posicionamiento en búsquedas locales.',
        'WhatsApp Automation: Confirmaciones y recordatorios automáticos.'
      ]
    },
    channels: ['Instagram', 'WhatsApp', 'Google Search'],
    trigger: 'Vio que su competencia directa empezó a llenar agenda con pauta digital.'
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
    modelType: 'B2B'
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
  const [activePersonaId, setActivePersonaId] = useState(() => {
    return personas[0]?.id || 'p-1'
  })

  // Persona Center Canvas Mode: 'modular-view' | 'wizard' | 'generating'
  const [personaCanvasMode, setPersonaCanvasMode] = useState('modular-view')

  // HubSpot Conversational Wizard States
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardAnswers, setWizardAnswers] = useState({
    name: '',
    role: '',
    industry: '',
    challenge: '',
    howWeHelp: '',
    channels: ''
  })
  const [currentWizardInput, setCurrentWizardInput] = useState('')

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
  const [momVisitorsRate, setMomVisitorsRate] = useState(5.0)
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
  const [showContentModal, setShowContentModal] = useState(false)
  const [viewingExecutivePersona, setViewingExecutivePersona] = useState(null)
  const [executiveSlideTab, setExecutiveSlideTab] = useState('messages')
  const [slideDropdownOpen, setSlideDropdownOpen] = useState(false)

  const SLIDE_TABS = [
    { id: 'messages', label: 'Mensajes Clave & Formatos' },
    { id: 'dimensions', label: 'Dimensiones Psicológicas del Problema' },
    { id: 'guide', label: 'Plan de Acción & Hábitos de Consumo' }
  ]

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

  // Active persona object
  const currentPersona = useMemo(() => {
    return personas.find(p => p.id === activePersonaId) || personas[0] || INITIAL_PERSONAS[0]
  }, [personas, activePersonaId])

  // Calculations
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

  const calculatedLeads = useMemo(() => Math.round(simTraffic * (simTofuToMofu / 100)), [simTraffic, simTofuToMofu])
  const calculatedCustomers = useMemo(() => Math.round(calculatedLeads * (simMofuToBofu / 100)), [calculatedLeads, simMofuToBofu])
  const calculatedRevenue = useMemo(() => calculatedCustomers * simAov, [calculatedCustomers, simAov])
  const calculatedCac = useMemo(() => (calculatedCustomers > 0 ? Math.round(simAdSpend / calculatedCustomers) : 0), [simAdSpend, calculatedCustomers])
  const calculatedLtv = useMemo(() => Math.round(simAov * simLtvMultiplier), [simAov, simLtvMultiplier])
  const calculatedLtvCacRatio = useMemo(() => (calculatedCac > 0 ? (calculatedLtv / calculatedCac).toFixed(1) : '∞'), [calculatedLtv, calculatedCac])
  const calculatedRoas = useMemo(() => (simAdSpend > 0 ? (calculatedRevenue / simAdSpend).toFixed(1) : '0'), [calculatedRevenue, simAdSpend])

  // HubSpot Wizard Step Progression
  const wizardQuestions = [
    {
      step: 1,
      key: 'name',
      label: 'Describe tu cliente ideal',
      question: '¿Cuál es el nombre o arquetipo de tu cliente ideal?',
      placeholder: 'Ej. Roxana Jimenez / Directora Comercial',
      minLength: 3
    },
    {
      step: 2,
      key: 'challenge',
      label: '¿Cuál es su mayor desafío?',
      question: '¿Cuál es el principal desafío o problema que enfrenta?',
      placeholder: 'Ej. Posicionar su marca de clínica dental frente a competidores agresivos...',
      minLength: 6
    },
    {
      step: 3,
      key: 'howWeHelp',
      label: '¿Cómo puedes contribuir a su éxito?',
      question: '¿Cómo tu producto o servicio resuelve su necesidad?',
      placeholder: 'Ej. Proporcionamos una estrategia integral de captación digital y automatización de citas...',
      minLength: 8
    },
    {
      step: 4,
      key: 'channels',
      label: 'Canales y medios preferidos',
      question: '¿A través de qué canales prefiere comunicarse y buscar información?',
      placeholder: 'Ej. WhatsApp Business, Instagram, LinkedIn y recomendaciones...',
      minLength: 4
    }
  ]

  const handleWizardSubmit = (e) => {
    e.preventDefault()
    const activeQ = wizardQuestions[wizardStep - 1]
    if (!currentWizardInput.trim() || currentWizardInput.trim().length < activeQ.minLength) return

    const updatedAnswers = {
      ...wizardAnswers,
      [activeQ.key]: currentWizardInput.trim()
    }
    setWizardAnswers(updatedAnswers)
    setCurrentWizardInput('')

    if (wizardStep < wizardQuestions.length) {
      setWizardStep(wizardStep + 1)
    } else {
      // Completed all steps: trigger generation animation
      setPersonaCanvasMode('generating')
      setTimeout(() => {
        const newId = `p-${Date.now()}`
        const createdPersona = {
          id: newId,
          name: updatedAnswers.name || 'Nuevo Buyer Persona',
          title: updatedAnswers.name.includes('/') ? updatedAnswers.name.split('/')[1].trim() : 'Líder de Área / Decisor',
          type: businessModel,
          avatarImg: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
          roleType: businessModel === 'B2B' ? 'Decisor Principal' : 'Comprador Directo',
          age: 'Entre 35 y 44 años',
          education: 'Título profesional',
          industry: businessModel === 'B2B' ? 'Servicios Profesionales / Salud' : 'Consumo & Estilo de Vida',
          companySize: 'Entre 1 y 15 empleados',
          socialNetworks: ['linkedin', 'instagram', 'facebook', 'x'],
          commChannels: ['WhatsApp Business', 'Correo electrónico', 'Teléfono'],
          reportingTo: 'Dirección General / Propietario',
          tools: ['Software de CRM', 'WhatsApp Web', 'Sistemas de gestión'],
          kpis: ['Crecimiento de clientes', 'Retención de pacientes', 'Satisfacción y recomendación'],
          pains: [
            updatedAnswers.challenge || 'Posicionamiento frente a competidores',
            'Falta de recursos y tiempo para marketing constante',
            'Pérdida de prospectos por seguimiento manual'
          ],
          howWeHelp: updatedAnswers.howWeHelp || 'Infraestructura digital completa con automatización comercial y acompañamiento continuo.',
          infoSources: [updatedAnswers.channels || 'Investigación en línea, redes sociales y recomendaciones'],
          salary: '+$48,000 USD / año',
          location: 'Latinoamérica',
          jtbd: updatedAnswers.challenge ? `Superar el reto de ${updatedAnswers.challenge.toLowerCase()} de forma estructurada.` : 'Escalar su negocio con orden.',
          gains: [
            'Aumento comprobado en conversión y prospectos calificados',
            'Ahorro de horas operativas cada semana',
            'Posicionamiento como referente en su nicho'
          ],
          dimensions: {
            external: updatedAnswers.challenge || 'Dificultades operativas y comerciales en el día a día.',
            internal: 'Siente frustración cuando el esfuerzo no se traduce en crecimiento medible.',
            philosophical: 'Cree que todo negocio merece contar con herramientas modernas para crecer.'
          },
          guidePlan: {
            search: 'Busca soluciones probadas con soporte guiado.',
            howWeHelp: updatedAnswers.howWeHelp || 'Implementación estratégica paso a paso.',
            actionSteps: ['Diagnóstico inicial de cuellos de botella', 'Despliegue ágil en 14 días', 'Soporte y optimización']
          },
          habits: {
            channels: ['WhatsApp', 'LinkedIn', 'Google Search'],
            schedule: 'Horario comercial y tardes',
            quote: `“Buscamos soluciones que realmente nos den tranquilidad y resultados.”`
          },
          keyMessages: {
            marketing: `Descubre cómo superar ${updatedAnswers.challenge || 'tus desafíos'} con herramientas diseñadas a tu medida.`,
            sales: `Acompañamiento especializado con resultados medibles en los primeros 90 días.`,
            formats: ['Publicaciones en redes sociales', 'Videos demostrativos', 'Casos de éxito reales']
          },
          channels: ['WhatsApp Business', 'Instagram', 'LinkedIn'],
          trigger: 'Identificó una fuga de oportunidades y decidió profesionalizar su estrategia.'
        }

        setPersonas(prev => [...prev, createdPersona])
        setActivePersonaId(newId)
        setPersonaCanvasMode('modular-view')
        setWizardStep(1)
        setWizardAnswers({ name: '', role: '', industry: '', challenge: '', howWeHelp: '', channels: '' })
      }, 1200)
    }
  }

  const handleCycleAvatar = (personaId) => {
    setPersonas(prev => prev.map(p => {
      if (p.id === personaId) {
        const currentIndex = AVATAR_PRESETS.indexOf(p.avatarImg)
        const nextIndex = (currentIndex + 1) % AVATAR_PRESETS.length
        return { ...p, avatarImg: AVATAR_PRESETS[nextIndex] }
      }
      return p
    }))
  }

  const handleDeletePersona = (id) => {
    if (personas.length <= 1) return
    const remaining = personas.filter(p => p.id !== id)
    setPersonas(remaining)
    setActivePersonaId(remaining[0].id)
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

  // View Metadata for Cloud Header Bar
  const activeViewMeta = useMemo(() => {
    switch (currentView) {
      case 'personas':
        return {
          title: '1. Buyer Personas & Slides Ejecutivos',
          subtitle: 'Perfiles ICP, Dimensiones Psicológicas y Resumen Modular HubSpot',
          icon: Users,
          iconColor: 'bg-purple-500',
          actionText: personaCanvasMode === 'wizard' ? 'Volver a Fichas' : '+ Generar mi buyer persona',
          onAction: () => {
            if (personaCanvasMode === 'wizard') {
              setPersonaCanvasMode('modular-view')
            } else {
              setPersonaCanvasMode('wizard')
              setWizardStep(1)
              setCurrentWizardInput('')
            }
          }
        }
      case 'kanban':
        return {
          title: '2. Content Mapping (Página 6)',
          subtitle: 'Tablero Kanban por Nivel de Conciencia: TOFU, MOFU y BOFU',
          icon: Kanban,
          iconColor: 'bg-emerald-500',
          actionText: '+ Nueva Pieza',
          onAction: () => setShowContentModal(true)
        }
      case 'grid':
        return {
          title: '3. Base Relacional POEM',
          subtitle: 'Planilla estructurada de activos digitales y formatos certificados',
          icon: TableIcon,
          iconColor: 'bg-blue-500',
          actionText: '+ Agregar Fila',
          onAction: () => setShowContentModal(true)
        }
      case 'dashboard':
        return {
          title: '4. Dashboard & Unit Economics',
          subtitle: 'Widgets analíticos, Mix POEM y Simulador Financiero CAC / LTV',
          icon: PieChart,
          iconColor: 'bg-amber-500',
          actionText: 'Resetear Valores',
          onAction: () => {
            setSimTraffic(8500)
            setSimTofuToMofu(4.5)
            setSimMofuToBofu(12.0)
            setSimAov(480)
            setSimAdSpend(1500)
          }
        }
      case 'smart':
        return {
          title: '5. Automated SMART Engine',
          subtitle: 'Fórmula de Crecimiento Compuesto MoM y Mitigación de Obstáculos',
          icon: Bot,
          iconColor: 'bg-cyan-500',
          actionText: 'Exportar Meta',
          onAction: () => window.print()
        }
      default:
        return {
          title: 'Marketing Studio OS',
          subtitle: 'Modern Workspace',
          icon: Sparkles,
          iconColor: 'bg-slate-900',
          actionText: '+ Nuevo',
          onAction: () => {}
        }
    }
  }, [currentView, businessModel, personaCanvasMode])

  return (
    <div className="h-screen bg-[#f4f5f8] text-slate-900 selection:bg-slate-900 selection:text-white font-sans text-sm flex flex-col lg:flex-row overflow-hidden">
      
      {/* =========================================================================
          LEFT SIDEBAR: 5 BIG NAVIGATION BLOCKS & MODEL SWITCHER
         ========================================================================= */}
      <aside className="w-full lg:w-80 h-auto lg:h-screen lg:overflow-y-auto bg-white border-r border-slate-200/90 p-5 flex flex-col justify-between shrink-0 shadow-xs">
        
        <div className="space-y-6">
          
          {/* Qaway Lab Brand Header & Return Link */}
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <Link to="/hub" className="group flex items-center gap-2" title="Volver al Hub">
              <span className="text-xl font-bold tracking-[-0.055em] text-slate-900 group-hover:text-slate-700 transition-colors">
                Qaway <span className="text-[#fe6612]">Lab</span>
              </span>
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Studio OS
            </span>
          </div>

          {/* Business Model Switcher */}
          <div className="p-1 bg-slate-100 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setBusinessModel('B2B')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                businessModel === 'B2B'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modelo B2B</span>
            </button>

            <button
              type="button"
              onClick={() => setBusinessModel('B2C')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                businessModel === 'B2C'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modelo B2C</span>
            </button>
          </div>

          {/* 5 Big Navigation Blocks */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Ecosistema de Trabajo
            </div>

            {/* Block 1: Personas */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('personas')
                setPersonaCanvasMode('modular-view')
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentView === 'personas'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">1. Buyer Personas</div>
                  <div className={`text-[11px] ${currentView === 'personas' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Resumen Modular
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                currentView === 'personas' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {personas.length}
              </span>
            </button>

            {/* Block 2: Kanban */}
            <button
              type="button"
              onClick={() => setCurrentView('kanban')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentView === 'kanban'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Kanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">2. Content Mapping</div>
                  <div className={`text-[11px] ${currentView === 'kanban' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Reglas Página 6
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                currentView === 'kanban' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {contents.length}
              </span>
            </button>

            {/* Block 3: Grid */}
            <button
              type="button"
              onClick={() => setCurrentView('grid')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentView === 'grid'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <TableIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">3. Base Relacional</div>
                  <div className={`text-[11px] ${currentView === 'grid' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Matriz POEM
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${currentView === 'grid' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            {/* Block 4: Dashboard */}
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentView === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">4. Dashboard & ROI</div>
                  <div className={`text-[11px] ${currentView === 'dashboard' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Unit Economics
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            {/* Block 5: Automated SMART */}
            <button
              type="button"
              onClick={() => setCurrentView('smart')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                currentView === 'smart'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">5. Automated SMART</div>
                  <div className={`text-[11px] ${currentView === 'smart' ? 'text-slate-300' : 'text-slate-400'}`}>
                    Calculadora MoM
                  </div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${currentView === 'smart' ? 'text-white' : 'text-slate-400'}`} />
            </button>

          </div>

        </div>

        {/* Sidebar Footer Status */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SaaS Engine Activo
            </span>
            <span className="font-mono text-slate-400">v4.3</span>
          </div>
        </div>

      </aside>

      {/* =========================================================================
          MAIN WORKSPACE CANVAS & FLOATING CLOUD BAR
         ========================================================================= */}
      <main className="flex-1 h-auto lg:h-screen lg:overflow-y-auto flex flex-col min-w-0 pb-20">
        
        {/* FLOATING TOP CLOUD BAR */}
        <div className="sticky top-3 z-30 px-4 sm:px-8 pt-2">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Active View Title & Breadcrumb */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${activeViewMeta.iconColor} text-white flex items-center justify-center shadow-xs shrink-0`}>
                <activeViewMeta.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {activeViewMeta.title}
                </h2>
                <p className="text-xs text-slate-500">{activeViewMeta.subtitle}</p>
              </div>
            </div>

            {/* Cloud Bar Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                title="Imprimir o Exportar PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                onClick={activeViewMeta.onAction}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff4b0b] hover:bg-[#e04008] text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{activeViewMeta.actionText}</span>
              </button>
            </div>

          </div>
        </div>

        {/* WORKSPACE BODY CONTENT */}
        <div className="p-4 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">

            {/* =========================================================================
                1. BUYER PERSONAS: HUBSPOT RESUMEN MODULAR & CONVERSATIONAL WIZARD
               ========================================================================= */}
            {currentView === 'personas' && (
              <motion.div
                key="panel-personas"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                
                {/* -------------------------------------------------------------------
                    SUB-VIEW A: CONVERSATIONAL CREATION WIZARD (HUBSPOT INTERACTIVE)
                   ------------------------------------------------------------------- */}
                {personaCanvasMode === 'wizard' && (
                  <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-8">
                    
                    {/* Header with Step Indicator */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Asistente Conversacional HubSpot
                        </span>
                        <h3 className="text-xl font-black text-slate-900">
                          Paso {wizardStep} de {wizardQuestions.length}
                        </h3>
                      </div>
                      <button
                        onClick={() => setPersonaCanvasMode('modular-view')}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Previously Answered Questions as Clean Pills on Top Right */}
                    <div className="space-y-2">
                      {wizardQuestions.slice(0, wizardStep - 1).map((q) => (
                        <div key={q.step} className="flex flex-col items-end text-right">
                          <span className="text-xs text-slate-400 font-semibold">{q.label}</span>
                          <div className="mt-0.5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200">
                            <span>{wizardAnswers[q.key]}</span>
                            <button
                              onClick={() => {
                                setWizardStep(q.step)
                                setCurrentWizardInput(wizardAnswers[q.key])
                              }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Editar respuesta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Current Active Question */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                        {wizardQuestions[wizardStep - 1].question}
                      </h4>

                      <form onSubmit={handleWizardSubmit} className="space-y-4">
                        <div className="relative">
                          <textarea
                            rows="3"
                            autoFocus
                            placeholder={wizardQuestions[wizardStep - 1].placeholder}
                            value={currentWizardInput}
                            onChange={(e) => setCurrentWizardInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleWizardSubmit(e)
                              }
                            }}
                            className="w-full p-4 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none transition-all"
                          />
                          <button
                            type="submit"
                            disabled={!currentWizardInput.trim() || currentWizardInput.trim().length < wizardQuestions[wizardStep - 1].minLength}
                            className="absolute right-3 bottom-4 w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-slate-900 shadow-md transition-all"
                          >
                            <ArrowUp className="w-5 h-5 font-black" />
                          </button>
                        </div>

                        {currentWizardInput.trim().length > 0 && currentWizardInput.trim().length < wizardQuestions[wizardStep - 1].minLength && (
                          <div className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold inline-block">
                            Por favor, introduce al menos {wizardQuestions[wizardStep - 1].minLength} caracteres
                          </div>
                        )}
                      </form>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Presiona Enter para continuar</span>
                      <button
                        onClick={() => setPersonaCanvasMode('modular-view')}
                        className="text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>

                  </div>
                )}

                {/* -------------------------------------------------------------------
                    SUB-VIEW B: GENERATING LOADER ANIMATION
                   ------------------------------------------------------------------- */}
                {personaCanvasMode === 'generating' && (
                  <div className="max-w-md mx-auto p-12 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-6 my-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-8 h-8 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-48 h-2 bg-emerald-500 rounded-full mx-auto animate-pulse" />
                      <h3 className="text-lg font-bold text-slate-900">
                        Tu buyer persona se está generando...
                      </h3>
                      <p className="text-xs text-slate-400">
                        Sintetizando perfil, desafíos y ficha modular
                      </p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------------
                    SUB-VIEW C: HUBSPOT MODULAR RESUMEN GRID (SCREENSHOTS 4 & 5)
                   ------------------------------------------------------------------- */}
                {personaCanvasMode === 'modular-view' && (
                  <div className="space-y-6">
                    
                    {/* Top Hubspot Header: Persona Switcher Tabs & Actions */}
                    <div className="p-6 rounded-3xl bg-[#0d2a2c] text-white shadow-md space-y-6">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                            Resumen de tu buyer persona
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-300 mt-1">
                            Visualización modular certificada para equipos de marketing y ventas
                          </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setViewingExecutivePersona(currentPersona)
                              setExecutiveSlideTab('messages')
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-1.5"
                          >
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>Ver Slide</span>
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2.5 rounded-xl bg-[#ff4b0b] hover:bg-[#e04008] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-4 h-4" />
                            <span>Descargar / Exportar</span>
                          </button>

                          {personas.length > 1 && (
                            <button
                              onClick={() => handleDeletePersona(currentPersona.id)}
                              className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/20 transition-all"
                              title="Eliminar este persona"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Horizontal Persona Tabs */}
                      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/15 pb-2">
                        {personas.map((p) => {
                          const isActive = p.id === activePersonaId
                          return (
                            <button
                              key={p.id}
                              onClick={() => setActivePersonaId(p.id)}
                              className={`px-4 py-2 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
                                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{p.name}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="hubspot-active-tab"
                                  className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-white rounded-full"
                                />
                              )}
                            </button>
                          )
                        })}

                        <button
                          onClick={() => {
                            setPersonaCanvasMode('wizard')
                            setWizardStep(1)
                            setCurrentWizardInput('')
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-white/5 transition-all flex items-center gap-1 ml-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Generar nuevo</span>
                        </button>
                      </div>

                    </div>

                    {/* 3-COLUMN MODULAR CARD GRID (LIKE HUBSPOT) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      
                      {/* COLUMN 1: PERFIL GENERAL */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                          Perfil general
                        </div>

                        {/* Card: Avatar */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-3">
                          <img
                            src={currentPersona.avatarImg}
                            alt={currentPersona.name}
                            className="w-24 h-24 rounded-2xl object-cover mx-auto ring-4 ring-slate-100 shadow-sm"
                          />
                          <div>
                            <button
                              onClick={() => handleCycleAvatar(currentPersona.id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                            >
                              Cambiar avatar
                            </button>
                          </div>
                        </div>

                        {/* Card: Edad */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Rango de edad</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            • {currentPersona.age || 'Entre 35 y 44 años'}
                          </div>
                        </div>

                        {/* Card: Nivel de educación */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Nivel de educación más alto</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            • {currentPersona.education || 'Título profesional'}
                          </div>
                        </div>

                        {/* Card: Redes Sociales */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Redes sociales</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                              <Facebook className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                              <Instagram className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                              <Twitter className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                              <Linkedin className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Card: Industria */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Industria</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            • {currentPersona.industry || 'Cuidado de la salud'}
                          </div>
                        </div>

                        {/* Card: Tamaño organización */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Tamaño de la organización</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            • {currentPersona.companySize || 'Entre 1 y 10 empleados'}
                          </div>
                        </div>

                      </div>

                      {/* COLUMN 2: DETALLES PROFESIONALES */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                          Detalles profesionales
                        </div>

                        {/* Card: Canal favorito de comunicación */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Canal favorito de comunicación</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                            {currentPersona.commChannels?.map((ch, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{ch}</span>
                              </li>
                            )) || <li>• WhatsApp Business</li>}
                          </ul>
                        </div>

                        {/* Card: Su superior es */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Su superior es</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            • {currentPersona.reportingTo || 'Dirección General'}
                          </div>
                        </div>

                        {/* Card: Herramientas que necesita para trabajar */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Herramientas que necesita para trabajar</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                            {currentPersona.tools?.map((tool, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{tool}</span>
                              </li>
                            )) || <li>• Software de CRM</li>}
                          </ul>
                        </div>

                      </div>

                      {/* COLUMN 3: OBJETIVOS, DOLORES & CÓMO AYUDAMOS */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                          Objetivos y Desafíos
                        </div>

                        {/* Card: Su trabajo se mide en función de */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Su trabajo se mide en función de</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                            {currentPersona.kpis?.map((kpi, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{kpi}</span>
                              </li>
                            )) || <li>• Crecimiento de clientes</li>}
                          </ul>
                        </div>

                        {/* Card: Dificultades principales (Dolores) */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Dificultades principales (Dolores)</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                            {currentPersona.pains?.map((pain, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span>{pain}</span>
                              </li>
                            )) || <li>• Dificultad de posicionamiento</li>}
                          </ul>
                        </div>

                        {/* Card: Obtiene información a través de */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                            <span>Obtiene información a través de</span>
                            <MoreHorizontal className="w-4 h-4 text-slate-300" />
                          </div>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                            {currentPersona.infoSources?.map((source, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>{source}</span>
                              </li>
                            )) || <li>• Investigación en línea</li>}
                          </ul>
                        </div>

                        {/* Card: Cómo contribuimos a su éxito */}
                        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-100 shadow-sm space-y-2">
                          <div className="text-xs text-emerald-800 font-bold uppercase">
                            Cómo contribuimos a su éxito
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed">
                            {currentPersona.howWeHelp || currentPersona.jtbd}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Add Section Button (Like HubSpot Screenshot 5) */}
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setViewingExecutivePersona(currentPersona)
                          setExecutiveSlideTab('dimensions')
                        }}
                        className="w-full max-w-md py-3.5 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ver Análisis de Dimensiones Psicológicas (StoryBrand)</span>
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* =========================================================================
                2. KANBAN CONTENT MAPPING
               ========================================================================= */}
            {currentView === 'kanban' && (
              <motion.div
                key="panel-kanban"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
              >
                {[
                  { stage: 'TOFU', name: '1. Reconocimiento (TOFU)', badgeColor: 'bg-emerald-500', desc: 'Infografías y Videos Cortos (Descubrimiento)' },
                  { stage: 'MOFU', name: '2. Consideración (MOFU)', badgeColor: 'bg-blue-500', desc: 'Ebooks, Muestras y Webinars (Nutrición/Leads)' },
                  { stage: 'BOFU', name: '3. Decisión (BOFU)', badgeColor: 'bg-purple-500', desc: 'Casos de Éxito y Testimonios (Cierre/Ventas)' }
                ].map((col) => {
                  const colItems = contents.filter(c => c.stage === col.stage)
                  return (
                    <div key={col.stage} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 min-h-[480px]">
                      
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${col.badgeColor}`} />
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{col.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {colItems.length}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {col.desc}
                      </div>

                      <div className="space-y-3">
                        {colItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-3"
                          >
                            <h5 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h5>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.tagColor || 'bg-blue-100 text-blue-800'}`}>
                                {item.tag || 'Product'}
                              </span>
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                                {item.format}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                              <span>{item.date || '2026/08/30'}</span>
                              <span className="text-indigo-600 font-semibold">{item.channel}</span>
                            </div>

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
              </motion.div>
            )}

            {/* =========================================================================
                3. GRID TABLE VIEW
               ========================================================================= */}
            {currentView === 'grid' && (
              <motion.div
                key="panel-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4"
              >
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
                4. DASHBOARD & UNIT ECONOMICS
               ========================================================================= */}
            {currentView === 'dashboard' && (
              <motion.div
                key="panel-dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
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

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-2">
                      <div className="sm:col-span-5 flex justify-center">
                        <div className="relative w-40 h-40">
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
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

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Atribución multicanal calculada</span>
                      <span className="text-emerald-600 font-bold">Salud General: 88% Óptimo</span>
                    </div>
                  </div>

                </div>

                {/* Financial Simulator */}
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
                5. AUTOMATED SMART ENGINE
               ========================================================================= */}
            {currentView === 'smart' && (
              <motion.div
                key="panel-smart"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
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

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-indigo-700">S • Específico</span>
                    <input
                      type="text"
                      value={smartSpecific}
                      onChange={(e) => setSmartSpecific(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-blue-700">M • Medible</span>
                    <input
                      type="text"
                      value={smartMeasurable}
                      onChange={(e) => setSmartMeasurable(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-purple-700">A • Alcanzable</span>
                    <input
                      type="text"
                      value={smartAchievable}
                      onChange={(e) => setSmartAchievable(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-amber-700">R • Relevante</span>
                    <input
                      type="text"
                      value={smartRelevant}
                      onChange={(e) => setSmartRelevant(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-emerald-700">T • Límite de Tiempo</span>
                    <input
                      type="text"
                      value={smartTimeBound}
                      onChange={(e) => setSmartTimeBound(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Objetivo SMART Oficial</div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      "{smartSpecific} {smartRelevant} {smartTimeBound}"
                    </p>
                  </div>
                </div>

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

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* =========================================================================
          MODAL: CONTENT PIECE FORM
         ========================================================================= */}
      {showContentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl"
          >
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

              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950">
                <div className="font-bold mb-0.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Propósito Metodológico Oficial (HubSpot):</span>
                </div>
                <div>{newContent.purpose}</div>
              </div>

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
          MODAL: EXECUTIVE SLIDE PRESENTATION
         ========================================================================= */}
      {viewingExecutivePersona && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-slide-modal, #printable-slide-modal * {
                visibility: visible !important;
              }
              #printable-slide-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 24px !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          <motion.div
            id="printable-slide-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 max-w-5xl w-full space-y-6 shadow-2xl my-auto print:border-none print:shadow-none print:rounded-none"
          >
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

              <div className="relative no-print">
                <button
                  type="button"
                  onClick={() => setSlideDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all"
                >
                  <span>{SLIDE_TABS.find(t => t.id === executiveSlideTab)?.label || 'Seleccionar Vista'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {slideDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setSlideDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 space-y-1">
                      {SLIDE_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setExecutiveSlideTab(tab.id)
                            setSlideDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                            executiveSlideTab === tab.id
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {executiveSlideTab === tab.id && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto no-print">
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

            {/* SLIDE CANVAS */}
            <div className="bg-[#fafbfc] rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-inner print:bg-white print:border-none print:shadow-none print:p-0">
              
              {/* 1. SLIDE: MENSAJES CLAVE */}
              {executiveSlideTab === 'messages' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Mensajes clave
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Estrategia de comunicación diferenciada para atraer y convertir
                      </p>
                    </div>

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

                  <div className="space-y-4">
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

    </div>
  )
}
