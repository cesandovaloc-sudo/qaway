import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronDown,
  Filter,
  Share2,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  MoreHorizontal,
  GraduationCap,
  UserCheck,
  Wrench,
  MessageSquare,
  Briefcase,
  Target,
  Activity
} from 'lucide-react'

import { supabase } from '@/config/supabase'

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

  // Sidebar Collapse / Expand State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Company Profile Context (Supabase + LocalStorage Cache)
  const [companyContext, setCompanyContext] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_company`)
    return saved ? JSON.parse(saved) : {
      name: 'Qaway Lab',
      industry: 'Tecnología, IA y Sistemas Digitales',
      offer: 'Desarrollo web de alta conversión, automatización con IA y CRM de WhatsApp',
      valueProp: 'Digitalizamos y automatizamos tus procesos comerciales para escalar ventas con orden.',
      targetNiche: 'Clínicas, Consultorías, Negocios y Empresas de Servicios'
    }
  })
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(companyContext)
  const [companySaveStatus, setCompanySaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved'

  // Load Company from Supabase on mount
  useEffect(() => {
    async function loadCompanyFromSupabase() {
      try {
        const { data, error } = await supabase.from('company_profiles').select('*').limit(1).single()
        if (data && !error) {
          const loaded = {
            name: data.name || 'Qaway Lab',
            industry: data.industry || 'Tecnología, IA y Sistemas Digitales',
            offer: data.offer || 'Desarrollo web de alta conversión, automatización con IA y CRM de WhatsApp',
            valueProp: data.value_prop || 'Digitalizamos y automatizamos tus procesos comerciales para escalar ventas con orden.',
            targetNiche: data.target_niche || 'Clínicas, Consultorías y Empresas de Servicios'
          }
          setCompanyContext(loaded)
          setEditingCompany(loaded)
          localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(loaded))
        }
      } catch (e) {
        // Fallback to local storage silently
      }
    }
    loadCompanyFromSupabase()
  }, [])

  const handleSaveCompanyContext = async (e) => {
    if (e) e.preventDefault()
    setCompanySaveStatus('saving')
    setCompanyContext(editingCompany)
    localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(editingCompany))
    
    try {
      await supabase.from('company_profiles').upsert([{
        id: 'default-company',
        name: editingCompany.name,
        industry: editingCompany.industry,
        offer: editingCompany.offer,
        value_prop: editingCompany.valueProp,
        target_niche: editingCompany.targetNiche,
        updated_at: new Date().toISOString()
      }])
    } catch (err) {
      console.log('[Supabase] Guardado local exitoso:', err)
    }

    setTimeout(() => {
      setCompanySaveStatus('saved')
      setTimeout(() => {
        setCompanySaveStatus('idle')
      }, 2500)
    }, 600)
  }

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
    age: '',
    education: '',
    industrySize: '',
    challenge: '',
    howWeHelp: '',
    channelsHabits: ''
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
  const [executiveSlideTab, setExecutiveSlideTab] = useState('demography')
  const [slideDropdownOpen, setSlideDropdownOpen] = useState(false)

  const SLIDE_TABS = [
    { id: 'demography', label: '1. Demografía (Perfil & Personalidad)' },
    { id: 'needs', label: '2. Necesidades (Dolores & Dimensiones)' },
    { id: 'solution', label: '3. Solución (Guía & Plan de Acción)' },
    { id: 'diffusion', label: '4. Difusión (Citas & Canales)' },
    { id: 'messages', label: '5. Mensajes Clave (Marketing & Ventas)' }
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
    return Math.round(calculatedMomVisitorsGoal * (parseFloat(calculatedMomConvRateGoal) / 100))
  }, [calculatedMomVisitorsGoal, calculatedMomConvRateGoal])

  const calculatedLeadsGoal = calculatedMomLeadsGoal

  const calculatedMomCloseRateGoal = useMemo(() => {
    return (momCloseRateCurrent * Math.pow(1 + momCloseRateGrowth / 100, momMonths)).toFixed(2)
  }, [momCloseRateCurrent, momCloseRateGrowth, momMonths])

  const calculatedMomCustomersGoal = useMemo(() => {
    return Math.round(calculatedMomLeadsGoal * (parseFloat(calculatedMomCloseRateGoal) / 100))
  }, [calculatedMomLeadsGoal, calculatedMomCloseRateGoal])

  const calculatedRevenue = useMemo(() => {
    return calculatedMomCustomersGoal * simAov
  }, [calculatedMomCustomersGoal, simAov])

  const calculatedCac = useMemo(() => {
    return calculatedMomCustomersGoal > 0 ? (simAdSpend / calculatedMomCustomersGoal).toFixed(1) : '0'
  }, [calculatedMomCustomersGoal, simAdSpend])

  const calculatedLtv = useMemo(() => {
    return Math.round(simAov * simLtvMultiplier)
  }, [simAov, simLtvMultiplier])

  const calculatedLtvCacRatio = useMemo(() => (parseFloat(calculatedCac) > 0 ? (calculatedLtv / parseFloat(calculatedCac)).toFixed(1) : '∞'), [calculatedLtv, calculatedCac])
  const calculatedRoas = useMemo(() => (simAdSpend > 0 ? (calculatedRevenue / simAdSpend).toFixed(1) : '0'), [calculatedRevenue, simAdSpend])

  // HubSpot Wizard Step Progression (Official Structured Steps)
  const wizardQuestions = [
    {
      step: 1,
      key: 'name',
      label: 'Nombre del buyer persona',
      question: '1. ¿Cómo se llama tu buyer persona?',
      placeholder: 'Ej. Mauricio Gutiérrez, Carlos Mendoza, Mary Gonzales...',
      type: 'text',
      minLength: 3
    },
    {
      step: 2,
      key: 'role',
      label: 'Puesto o Cargo',
      question: '2. ¿Cuál es su puesto de trabajo o cargo?',
      placeholder: 'Ej. Gerente de Auditoría, Dueño de clínica dental, Director Comercial...',
      type: 'text',
      minLength: 3
    },
    {
      step: 3,
      key: 'reportingTo',
      label: 'Jerarquía / Superior',
      question: '3. ¿A quién reporta o cuál es su jerarquía en la empresa?',
      type: 'options',
      options: [
        'Propietario / Fundador (Sin superior)',
        'Dirección General / CEO',
        'Junta Directiva / Accionistas',
        'Gerencia de Área',
        'Cliente Independiente (No aplica)'
      ],
      placeholder: 'Selecciona una opción o escribe...',
      minLength: 3
    },
    {
      step: 4,
      key: 'age',
      label: 'Rango de edad',
      question: '4. ¿Cuál es su rango de edad?',
      type: 'options',
      options: ['Entre 18 y 24 años', 'Entre 25 y 34 años', 'Entre 35 y 44 años', 'Entre 45 y 54 años', 'Más de 55 años'],
      placeholder: 'Selecciona una opción...',
      minLength: 3
    },
    {
      step: 5,
      key: 'education',
      label: 'Nivel educativo',
      question: '5. ¿Cuál es su nivel de educación más alto?',
      type: 'options',
      options: ['Secundaria / Bachillerato', 'Título Técnico', 'Licenciatura Universitaria', 'Maestría / Posgrado', 'Doctorado'],
      placeholder: 'Selecciona una opción...',
      minLength: 3
    },
    {
      step: 6,
      key: 'industry',
      label: 'Industria / Rubro',
      question: '6. ¿En qué industria o sector de actividad trabaja?',
      type: 'options',
      options: [
        'Salud, Odontología & Clínicas',
        'Auditoría, Contabilidad & Legal',
        'Tecnología & Software',
        'Comercio, Retail & E-commerce',
        'Consultoría & Servicios B2B'
      ],
      placeholder: 'Selecciona un rubro o escribe el tuyo...',
      minLength: 3
    },
    {
      step: 7,
      key: 'companySize',
      label: 'Tamaño de la organización',
      question: '7. ¿Cuántas personas o empleados trabajan en su organización?',
      type: 'options',
      options: [
        'Independiente (1 persona)',
        'Entre 1 y 10 empleados',
        'Entre 11 y 50 empleados',
        'Entre 51 y 200 empleados',
        'Más de 200 empleados (Corporación)'
      ],
      placeholder: 'Selecciona el rango de tamaño...',
      minLength: 3
    },
    {
      step: 8,
      key: 'socialNetworks',
      label: 'Canales & Redes Digitales',
      question: '8. ¿Qué canales y redes sociales utiliza tu cliente? (Puedes marcar varios)',
      type: 'multiselect',
      options: [
        'WhatsApp Business',
        'Instagram',
        'LinkedIn',
        'Facebook',
        'TikTok',
        'Correo Electrónico'
      ],
      placeholder: 'Haz clic en las opciones para activar/desactivar o escribe...',
      minLength: 2
    },
    {
      step: 9,
      key: 'infoSources',
      label: 'Dónde busca información',
      question: '9. ¿Cómo y dónde se informa cuando busca soluciones para su trabajo?',
      type: 'options',
      options: [
        'Recomendaciones de colegas y boca a boca',
        'Búsqueda en Google y páginas web',
        'Redes sociales y contenido de expertos',
        'Eventos, webinars y congresos de su sector'
      ],
      placeholder: 'Selecciona una opción o escribe...',
      minLength: 4
    },
    {
      step: 10,
      key: 'challenge',
      label: 'Puntos de Dolor & Retos',
      question: '10. ¿Cuál es su mayor dolor, dificultad u obstáculo actual?',
      placeholder: 'Ej. No puede gestionar a su equipo de trabajo, desorden en la base de datos...',
      type: 'text',
      minLength: 4
    },
    {
      step: 11,
      key: 'howWeHelp',
      label: 'Cómo contribuimos a su éxito',
      question: '11. ¿Cómo tu producto o servicio resuelve este problema específico?',
      placeholder: 'Ej. Implementación ágil de software y automatización comercial con acompañamiento...',
      type: 'text',
      minLength: 4
    }
  ]

  const handleToggleWizardMultiOption = (opt) => {
    let currentArr = currentWizardInput ? currentWizardInput.split(',').map(s => s.trim()).filter(Boolean) : []
    if (currentArr.includes(opt)) {
      currentArr = currentArr.filter(item => item !== opt)
    } else {
      currentArr.push(opt)
    }
    setCurrentWizardInput(currentArr.join(', '))
  }

  const handleRegenerateBlock = (personaId, blockKey) => {
    setPersonas(prev => prev.map(p => {
      if (p.id !== personaId) return p
      const currentRegens = (p.aiRegens?.[blockKey] ?? 3)
      if (currentRegens <= 0) return p

      const newRegens = currentRegens - 1
      let updatedData = { ...p }

      if (blockKey === 'howWeHelp') {
        const angles = [
          `Implementación ágil de ${companyContext.name}: resolvemos ${p.pains?.[0] || 'sus dolores'} mediante ${companyContext.offer} con métricas claras desde el día 1.`,
          `Como socio estratégico, ${companyContext.name} optimiza sus procesos con ${companyContext.valueProp}, liberando tiempo operativo para su equipo.`,
          `Ecosistema integral a la medida: acompañamos a ${p.name} con soporte dedicado para transformar ${p.pains?.[0] || 'sus desafíos'} en crecimiento ordenado.`
        ]
        updatedData.howWeHelp = angles[(3 - newRegens) % angles.length]
      } else if (blockKey === 'dimensions') {
        const dimAngles = [
          {
            external: p.pains?.[0] || 'Desafíos operativos y falta de visibilidad en el día a día.',
            internal: 'Siente frustración y sobrecarga al no ver reflejado el esfuerzo de su equipo en los resultados.',
            philosophical: `Cree firmemente que cualquier profesional en ${p.industry || 'su rubro'} merece operar con tranquilidad y herramientas que funcionen.`
          },
          {
            external: `Pérdida de oportunidades comerciales y desorden en los flujos de ${p.industry || 'su negocio'}.`,
            internal: 'Le preocupa quedarse atrás frente a competidores más digitalizados y perder autoridad.',
            philosophical: `No es justo perder clientes valiosos por culpa de sistemas obsoletos o procesos manuales.`
          },
          {
            external: `Dificultad para coordinar a su equipo y medir el retorno real de cada acción.`,
            internal: 'Desea tener el control absoluto de sus números sin depender de tareas repetitivas.',
            philosophical: `La tecnología debe ser un facilitador de libertad empresarial, no una fuente adicional de estrés.`
          }
        ]
        updatedData.dimensions = dimAngles[(3 - newRegens) % dimAngles.length]
      } else if (blockKey === 'guidePlan') {
        const planAngles = [
          {
            search: `Busca una solución sólida y comprobada para ${p.industry || 'su sector'}.`,
            howWeHelp: `Acompañamiento integral de ${companyContext.name} enfocado en ${companyContext.valueProp}.`,
            actionSteps: ['1. Diagnóstico de procesos actuales', '2. Despliegue de herramientas en 14 días', '3. Capacitación y optimización continua']
          },
          {
            search: `Compara alternativas de software que no requieran meses de aprendizaje.`,
            howWeHelp: `Estrategia personalizada de ${companyContext.name} con ${companyContext.offer}.`,
            actionSteps: ['1. Auditoría de flujos críticos', '2. Configuración rápida y migración de datos', '3. Soporte prioritario y seguimiento mensual']
          }
        ]
        updatedData.guidePlan = planAngles[(3 - newRegens) % planAngles.length]
      } else if (blockKey === 'messages') {
        const msgAngles = [
          {
            marketing: `Descubre cómo ${companyContext.name} ayuda a profesionales en ${p.industry} a superar ${p.pains?.[0] || 'sus desafíos'}. Solicita una sesión estratégica.`,
            sales: `Con ${companyContext.name} eliminas la fricción operativa y garantizas resultados comprobados en tus primeros 60 días.`,
            formats: ['Casos de éxito reales en PDF', 'Demostraciones interactivas', 'Publicaciones educativas en LinkedIn']
          },
          {
            marketing: `Moderniza la gestión de tu empresa con ${companyContext.name}. Menos caos, más ventas y control total.`,
            sales: `Implementación guiada paso a paso: nuestro equipo se encarga de la configuración técnica para que tú solo veas los resultados.`,
            formats: ['Guías paso a paso', 'Webinars prácticos', 'Mensajes personalizados por WhatsApp']
          }
        ]
        updatedData.keyMessages = msgAngles[(3 - newRegens) % msgAngles.length]
      }

      updatedData.aiRegens = { ...(p.aiRegens || {}), [blockKey]: newRegens }
      updatedData.aiStatus = { ...(p.aiStatus || {}), [blockKey]: 'pending' }
      return updatedData
    }))
  }

  const handleApproveBlock = (personaId, blockKey) => {
    setPersonas(prev => prev.map(p => {
      if (p.id !== personaId) return p
      return {
        ...p,
        aiStatus: { ...(p.aiStatus || {}), [blockKey]: 'approved' }
      }
    }))
  }

  const finalizePersonaGeneration = (finalAnswers) => {
    setPersonaCanvasMode('generating')
    setTimeout(() => {
      const newId = `p-${Date.now()}`
      const userNetworks = finalAnswers.socialNetworks
        ? finalAnswers.socialNetworks.split(',').map(s => s.trim()).filter(Boolean)
        : ['WhatsApp Business']

      const createdPersona = {
        id: newId,
        name: finalAnswers.name || 'Nuevo Buyer Persona',
        title: finalAnswers.role || 'Responsable de Área',
        type: businessModel,
        avatarImg: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
        roleType: finalAnswers.role || 'Decisor Principal',
        age: finalAnswers.age || 'Entre 35 y 44 años',
        education: finalAnswers.education || 'Licenciatura Universitaria',
        industry: finalAnswers.industry || 'Servicios Profesionales',
        companySize: finalAnswers.companySize || 'Entre 11 y 50 empleados',
        socialNetworks: userNetworks,
        commChannels: userNetworks,
        reportingTo: finalAnswers.reportingTo || 'Propietario / Sin superior',
        tools: ['Software de gestión y CRM', 'WhatsApp Business', 'Hojas de cálculo'],
        kpis: ['Aumento de eficiencia operativa', 'Crecimiento de clientes', 'Satisfacción del equipo'],
        pains: [
          finalAnswers.challenge || 'Dificultad en el control y gestión del equipo'
        ],
        howWeHelp: finalAnswers.howWeHelp || `${companyContext.valueProp} A través de ${companyContext.offer}.`,
        infoSources: [finalAnswers.infoSources || 'Recomendaciones de colegas y búsquedas en línea'],
        salary: 'Acorde al mercado',
        location: 'Latinoamérica',
        jtbd: `Superar la barrera de ${finalAnswers.challenge || 'gestión'} con el respaldo de ${companyContext.name}.`,
        gains: [
          'Mayor orden y tranquilidad operativa',
          'Ahorro de tiempo en tareas repetitivas',
          'Decisiones basadas en datos claros'
        ],
        dimensions: {
          external: finalAnswers.challenge || 'Desafíos diarios en la organización y seguimiento del equipo.',
          internal: 'Siente frustración cuando el esfuerzo no se traduce en avances visibles y rápidos.',
          philosophical: `Cree que un negocio en ${finalAnswers.industry || 'su sector'} merece operar con procesos modernos y eficientes.`
        },
        guidePlan: {
          search: 'Busca soluciones comprobadas con acompañamiento cercano.',
          howWeHelp: finalAnswers.howWeHelp || `Implementación guiada de ${companyContext.name} adaptada a sus necesidades.`,
          actionSteps: ['1. Diagnóstico de procesos actuales', '2. Configuración y despliegue ágil', '3. Capacitación y soporte continuo']
        },
        habits: {
          channels: userNetworks,
          schedule: 'Receptivo en horario laboral matutino',
          quote: `“Buscamos soluciones que realmente nos den tranquilidad y orden.”`
        },
        keyMessages: {
          marketing: `Descubre cómo ${companyContext.name} ayuda a superar ${finalAnswers.challenge || 'tus desafíos'} con ${companyContext.offer}.`,
          sales: `En ${companyContext.name} te acompañamos paso a paso con resultados medibles y soporte dedicado.`,
          formats: ['Casos de éxito reales en PDF', 'Demostraciones en vivo', 'Contenido educativo en redes']
        },
        channels: userNetworks,
        trigger: `Decidió modernizar sus procesos para resolver ${finalAnswers.challenge || 'sus desafíos'}.`,
        aiStatus: {
          howWeHelp: 'pending',
          dimensions: 'pending',
          guidePlan: 'pending',
          messages: 'pending'
        },
        aiRegens: {
          howWeHelp: 3,
          dimensions: 3,
          guidePlan: 3,
          messages: 3
        }
      }

      setPersonas(prev => [...prev, createdPersona])
      setActivePersonaId(newId)
      setPersonaCanvasMode('modular-view')
      setWizardStep(1)
      setWizardAnswers({ name: '', role: '', reportingTo: '', age: '', education: '', industry: '', companySize: '', socialNetworks: '', infoSources: '', challenge: '', howWeHelp: '' })
      setCurrentWizardInput('')
    }, 1000)
  }

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
      finalizePersonaGeneration(updatedAnswers)
    }
  }

  const handleWizardOptionSelect = (option) => {
    const activeQ = wizardQuestions[wizardStep - 1]
    const updatedAnswers = {
      ...wizardAnswers,
      [activeQ.key]: option
    }
    setWizardAnswers(updatedAnswers)
    setCurrentWizardInput('')

    if (wizardStep < wizardQuestions.length) {
      setWizardStep(wizardStep + 1)
    } else {
      finalizePersonaGeneration(updatedAnswers)
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

  const handleUploadAvatar = (e, personaId) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, avatarImg: dataUrl } : p))
    }
    reader.readAsDataURL(file)
  }

  const handleUpdatePersonaField = (field, value) => {
    setPersonas(prev => prev.map(p => {
      if (p.id === activePersonaId) {
        return { ...p, [field]: value }
      }
      return p
    }))
  }

  const handleDirectExportPersona = async (persona) => {
    if (!persona) return
    const safeName = (persona.name || 'Buyer-Persona').replace(/[^a-zA-Z0-9_-]/g, '_')
    
    // Create high-res executive document for PDF capture
    const printEl = document.createElement('div')
    printEl.style.width = '920px'
    printEl.style.padding = '36px'
    printEl.style.background = '#ffffff'
    printEl.style.position = 'fixed'
    printEl.style.top = '-9999px'
    printEl.style.left = '-9999px'
    printEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    printEl.style.color = '#0f172a'
    printEl.style.boxSizing = 'border-box'
    
    printEl.innerHTML = `
      <!-- HEADER -->
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${persona.avatarImg}" style="width: 64px; height: 64px; border-radius: 16px; object-fit: cover; border: 2px solid #e2e8f0;" />
          <div>
            <h1 style="font-size: 26px; font-weight: 900; margin: 0; color: #0f172a; line-height: 1.1;">${persona.name}</h1>
            <div style="color: #64748b; font-size: 13px; font-weight: 600; margin-top: 4px;">
              ${persona.title} • <span style="color: #4f46e5; font-weight: 700;">Modelo ${persona.type}</span>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="background: #0f172a; color: white; padding: 6px 14px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
            Ficha Ejecutiva HubSpot
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-top: 4px; font-weight: 600;">Qaway Lab • Studio OS</div>
        </div>
      </div>

      <!-- CITAS / JOB TO BE DONE -->
      <div style="background: #f8fafc; border-left: 4px solid #ff4b0b; padding: 14px 18px; border-radius: 12px; font-style: italic; color: #1e293b; margin-bottom: 22px; font-size: 13px; line-height: 1.5;">
        "${persona.jtbd || 'Progreso estratégico del cliente'}"
      </div>

      <!-- SECCIÓN 1: DEMOGRAFÍA & DETALLES PROFESIONALES -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          1. Perfil Demográfico & Profesional
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Datos Personales</div>
            <div style="font-size: 11px; font-weight: 600; color: #1e293b; line-height: 1.6;">
              <div>• <strong>Edad:</strong> ${persona.age || '35-44 años'}</div>
              <div>• <strong>Educación:</strong> ${persona.education || 'Profesional'}</div>
              <div>• <strong>Personalidad:</strong> Decisor clave</div>
            </div>
          </div>

          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Organización</div>
            <div style="font-size: 11px; font-weight: 600; color: #1e293b; line-height: 1.6;">
              <div>• <strong>Industria:</strong> ${persona.industry || 'Servicios'}</div>
              <div>• <strong>Tamaño:</strong> ${persona.companySize || '1-10 empleados'}</div>
              <div>• <strong>Reporta a:</strong> ${persona.reportingTo || 'Dirección General'}</div>
            </div>
          </div>

          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Canales & Herramientas</div>
            <div style="font-size: 11px; font-weight: 600; color: #1e293b; line-height: 1.6;">
              <div>• <strong>Canales:</strong> ${Array.isArray(persona.commChannels) ? persona.commChannels.join(', ') : 'WhatsApp, Email'}</div>
              <div>• <strong>Herramientas:</strong> ${Array.isArray(persona.tools) ? persona.tools.join(', ') : 'CRM, Analytics'}</div>
              <div>• <strong>Métricas:</strong> ${Array.isArray(persona.kpis) ? persona.kpis.join(', ') : 'Crecimiento'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: 3 DIMENSIONES DEL DOLOR -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          2. Las 3 Dimensiones del Dolor (Metodología Oficial)
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #be123c; margin-bottom: 6px;">Dolor Interno (Emocional)</div>
            <div style="font-size: 11px; font-weight: 600; color: #881337; line-height: 1.5;">
              ${persona.dimensions?.internal || 'Frustración por sentir que la carga operativa frena la capacidad de liderazgo estratégico.'}
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 6px;">Dolor Externo (Visible)</div>
            <div style="font-size: 11px; font-weight: 600; color: #78350f; line-height: 1.5;">
              ${persona.dimensions?.external || 'Cuellos de botella en conversión y reportes inconsistentes que dificultan el seguimiento.'}
            </div>
          </div>

          <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 12px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #6d28d9; margin-bottom: 6px;">Dolor Filosófico (Valores)</div>
            <div style="font-size: 11px; font-weight: 600; color: #4c1d95; line-height: 1.5;">
              ${persona.dimensions?.philosophical || 'Cree que ninguna empresa debería perder ventas de calidad por carecer de sistemas ágiles.'}
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: MENSAJES CLAVE & PLAN DE ACCIÓN -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          3. Mensajes Clave & Propuesta de Valor
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0284c7; margin-bottom: 6px;">Mensaje de Marketing (Atracción)</div>
            <div style="font-size: 11px; font-weight: 600; color: #0f172a; line-height: 1.5;">
              "${persona.messages?.marketing || 'Descubre cómo superar las barreras operativas con soluciones a tu medida.'}"
            </div>
          </div>

          <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; margin-bottom: 6px;">Mensaje de Ventas (Conversión)</div>
            <div style="font-size: 11px; font-weight: 600; color: #0f172a; line-height: 1.5;">
              "${persona.messages?.sales || 'Acompañamiento especializado con resultados medibles en los primeros 90 días.'}"
            </div>
          </div>
        </div>
      </div>

      <!-- HIGHLIGHT: CÓMO CONTRIBUIMOS A SU ÉXITO -->
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #065f46; margin-bottom: 4px;">Cómo Contribuimos a su Éxito</div>
        <div style="font-size: 12px; font-weight: 600; color: #064e3b; line-height: 1.5;">
          ${persona.howWeHelp || persona.jtbd}
        </div>
      </div>

      <!-- FOOTER -->
      <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 600;">
        <span>Documento Generado por Qaway Lab Digital • Marketing Studio OS</span>
        <span>Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}</span>
      </div>
    `

    document.body.appendChild(printEl)

    try {
      const canvas = await html2canvas(printEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`Buyer-Persona-${safeName}.pdf`)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      if (document.body.contains(printEl)) {
        document.body.removeChild(printEl)
      }
    }
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
      case 'company':
        return {
          title: '0. ADN & Perfil de Mi Empresa',
          subtitle: 'Contexto de Negocio, Oferta Real y Propuesta de Valor Sincronizada con Supabase',
          icon: Building2,
          iconColor: 'bg-[#ff4b0b]',
          actionText: companySaveStatus === 'saving' ? 'Guardando...' : (companySaveStatus === 'saved' ? '¡Guardado con éxito! ✓' : 'Guardar en Supabase'),
          onAction: () => {
            const btn = document.getElementById('btn-submit-company-profile')
            if (btn) btn.click()
          }
        }
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
      case 'smart':
        return {
          title: '2. Objetivos SMART & Crecimiento MoM',
          subtitle: 'Framework de Metas, Calculadora Compuesta de Tráfico/Conversión y Mitigación de Obstáculos',
          icon: Target,
          iconColor: 'bg-cyan-500',
          actionText: 'Exportar Metas (PDF)',
          onAction: () => window.print()
        }
      case 'kanban':
        return {
          title: '3. Content Mapping (Página 6)',
          subtitle: 'Tablero Kanban por Nivel de Conciencia: TOFU, MOFU y BOFU',
          icon: Kanban,
          iconColor: 'bg-emerald-500',
          actionText: '+ Nueva Pieza',
          onAction: () => setShowContentModal(true)
        }
      case 'grid':
        return {
          title: '4. Base Relacional POEM',
          subtitle: 'Planilla estructurada de activos digitales y formatos certificados',
          icon: TableIcon,
          iconColor: 'bg-blue-500',
          actionText: '+ Agregar Fila',
          onAction: () => setShowContentModal(true)
        }
      case 'dashboard':
        return {
          title: '5. Dashboard & Unit Economics',
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
      <aside className={`w-full ${sidebarCollapsed ? 'lg:w-[76px] p-3' : 'lg:w-80 p-5'} h-auto lg:h-screen lg:overflow-y-auto bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-xs transition-all duration-300 ease-in-out`}>
        
        <div className="space-y-6">
          
          {/* Qaway Lab Brand Header & Return Link */}
          {!sidebarCollapsed ? (
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between gap-2">
              <Link to="/hub" className="group flex items-center gap-2 min-w-0" title="Volver al Hub">
                <span className="text-xl font-bold tracking-[-0.055em] text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                  Qaway <span className="text-[#fe6612]">Lab</span>
                </span>
              </Link>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Studio OS
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Colapsar barra lateral"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="pb-4 border-b border-slate-100 flex flex-col items-center gap-3">
              <Link to="/hub" className="group" title="Volver al Hub">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  Q
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Desplegar barra lateral"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Business Model Switcher */}
          {!sidebarCollapsed ? (
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
          ) : (
            <div className="p-1 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col gap-1 items-center">
              <button
                type="button"
                onClick={() => setBusinessModel('B2B')}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  businessModel === 'B2B'
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Modelo B2B"
              >
                <Building2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setBusinessModel('B2C')}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  businessModel === 'B2C'
                    ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Modelo B2C"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5 Big Navigation Blocks */}
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                Ecosistema de Trabajo
              </div>

              {/* Block 0: ADN & Perfil de Empresa */}
              <button
                type="button"
                onClick={() => setCurrentView('company')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  currentView === 'company'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#ff4b0b] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">0. ADN de Empresa</div>
                    <div className={`text-[11px] ${currentView === 'company' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {companyContext.name || 'Mi Negocio'}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'company' ? 'text-white' : 'text-slate-400'}`} />
              </button>

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

              {/* Block 2: Objetivos SMART & Crecimiento */}
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
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">2. Objetivos SMART</div>
                    <div className={`text-[11px] ${currentView === 'smart' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Calculadora MoM
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'smart' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* Block 3: Kanban */}
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
                    <div className="font-bold text-xs sm:text-sm">3. Content Mapping</div>
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

              {/* Block 4: Grid */}
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
                    <div className="font-bold text-xs sm:text-sm">4. Base Relacional</div>
                    <div className={`text-[11px] ${currentView === 'grid' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Matriz POEM
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'grid' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* Block 5: Dashboard */}
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
                    <div className="font-bold text-xs sm:text-sm">5. Dashboard & ROI</div>
                    <div className={`text-[11px] ${currentView === 'dashboard' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Unit Economics
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center pt-2">
              {/* Block 0 */}
              <button
                type="button"
                onClick={() => setCurrentView('company')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'company'
                    ? 'bg-[#ff4b0b] text-white shadow-md ring-2 ring-orange-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#ff4b0b]'
                }`}
                title="0. ADN & Perfil de Empresa"
              >
                <Building2 className="w-4.5 h-4.5" />
              </button>

              {/* Block 1 */}
              <button
                type="button"
                onClick={() => {
                  setCurrentView('personas')
                  setPersonaCanvasMode('modular-view')
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'personas'
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-purple-600'
                }`}
                title="1. Buyer Personas"
              >
                <Users className="w-4.5 h-4.5" />
              </button>

              {/* Block 2 */}
              <button
                type="button"
                onClick={() => setCurrentView('smart')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'smart'
                    ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-cyan-600'
                }`}
                title="2. Objetivos SMART & Crecimiento"
              >
                <Target className="w-4.5 h-4.5" />
              </button>

              {/* Block 3 */}
              <button
                type="button"
                onClick={() => setCurrentView('kanban')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'kanban'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-emerald-600'
                }`}
                title="3. Content Mapping"
              >
                <Kanban className="w-4.5 h-4.5" />
              </button>

              {/* Block 4 */}
              <button
                type="button"
                onClick={() => setCurrentView('grid')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'grid'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-blue-600'
                }`}
                title="4. Base Relacional (POEM)"
              >
                <TableIcon className="w-4.5 h-4.5" />
              </button>

              {/* Block 5 */}
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-amber-600'
                }`}
                title="5. Dashboard & ROI"
              >
                <PieChart className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer Status */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SaaS Engine Activo
              </span>
              <span className="font-mono text-slate-400">v4.3</span>
            </div>
          ) : (
            <div className="flex justify-center" title="SaaS Engine Activo v4.3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
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
                0. ADN & PERFIL DE EMPRESA: CONTEXTO DE NEGOCIO & SUPABASE
               ========================================================================= */}
            {currentView === 'company' && (
              <motion.div
                key="panel-company"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4b0b]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 relative z-10">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] text-xs font-bold uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Módulo Base • Contexto Estratégico</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        ADN & Perfil de Mi Empresa
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                        Configura aquí la información de tu negocio. El generador de Buyer Personas y los demás módulos utilizarán estos datos para no adivinar y generar análisis 100% certeros.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {companySaveStatus === 'saved' ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>¡Sincronizado con Supabase!</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Sincronizado con Supabase</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Container */}
                  <form onSubmit={handleSaveCompanyContext} className="pt-6 space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nombre de la Empresa */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 group hover:bg-white hover:border-[#ff4b0b]/40 transition-all">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Nombre de tu Empresa / Marca
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCompany.name}
                          onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                          placeholder="Ej. Qaway Lab"
                          className="w-full text-sm sm:text-base font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#ff4b0b] focus:outline-none py-1 transition-colors"
                        />
                        <p className="text-[11px] text-slate-400">Identificador oficial de tu marca.</p>
                      </div>

                      {/* Rubro o Industria */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 group hover:bg-white hover:border-[#ff4b0b]/40 transition-all">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Tu Rubro / Industria
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCompany.industry}
                          onChange={(e) => setEditingCompany({ ...editingCompany, industry: e.target.value })}
                          placeholder="Ej. Tecnología, IA y Desarrollo de Software"
                          className="w-full text-sm sm:text-base font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#ff4b0b] focus:outline-none py-1 transition-colors"
                        />
                        <p className="text-[11px] text-slate-400">Sector en el que compites en el mercado.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Qué vendes exactamente */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 group hover:bg-white hover:border-[#ff4b0b]/40 transition-all">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          ¿Qué servicios o productos vendes exactamente?
                        </label>
                        <textarea
                          rows="3"
                          required
                          value={editingCompany.offer}
                          onChange={(e) => setEditingCompany({ ...editingCompany, offer: e.target.value })}
                          placeholder="Ej. Páginas web de alta conversión, automatizaciones con IA y CRM de WhatsApp..."
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#ff4b0b] focus:outline-none py-1 transition-colors resize-none leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400">Tu catálogo de soluciones concretas para tus clientes.</p>
                      </div>

                      {/* Propuesta de Valor */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 group hover:bg-white hover:border-[#ff4b0b]/40 transition-all">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Tu Propuesta de Valor Principal
                        </label>
                        <textarea
                          rows="3"
                          required
                          value={editingCompany.valueProp}
                          onChange={(e) => setEditingCompany({ ...editingCompany, valueProp: e.target.value })}
                          placeholder="Ej. Digitalizamos y automatizamos tus procesos comerciales para escalar ventas con orden..."
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#ff4b0b] focus:outline-none py-1 transition-colors resize-none leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400">La promesa principal por la que los clientes te eligen.</p>
                      </div>
                    </div>

                    {/* Nicho / Clientes Objetivo */}
                    <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 group hover:bg-white hover:border-[#ff4b0b]/40 transition-all">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Nicho o Clientes Objetivo que buscas atraer
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCompany.targetNiche}
                        onChange={(e) => setEditingCompany({ ...editingCompany, targetNiche: e.target.value })}
                        placeholder="Ej. Clínicas Dentales, Veterinarias, Consultorías, Negocios B2B/B2C"
                        className="w-full text-sm sm:text-base font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-[#ff4b0b] focus:outline-none py-1 transition-colors"
                      />
                      <p className="text-[11px] text-slate-400">Los segmentos y tipos de negocio donde tu solución genera mayor impacto.</p>
                    </div>

                    {/* Botón de guardado oculto para disparar desde Cloud Bar */}
                    <button id="btn-submit-company-profile" type="submit" className="hidden" />

                    {/* Botón visible de Guardar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={companySaveStatus === 'saving'}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all cursor-pointer ${
                          companySaveStatus === 'saved'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : companySaveStatus === 'saving'
                              ? 'bg-slate-700 opacity-90 cursor-wait'
                              : 'bg-[#ff4b0b] hover:bg-[#e04008] hover:shadow-lg'
                        }`}
                      >
                        {companySaveStatus === 'saving' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Guardando en Supabase...</span>
                          </>
                        ) : companySaveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>¡ADN Guardado en Supabase!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Guardar en Supabase & Actualizar ADN</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

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

                      {/* Interactive Option Pills for 1-Click Fast Selection */}
                      {wizardQuestions[wizardStep - 1].options && (
                        <div className="space-y-2 pt-1 pb-1">
                          {wizardQuestions[wizardStep - 1].type === 'multiselect' && (
                            <p className="text-xs font-bold text-indigo-600">
                              Selección múltiple (puedes marcar varios canales):
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {wizardQuestions[wizardStep - 1].options.map((opt) => {
                              const isSelected = wizardQuestions[wizardStep - 1].type === 'multiselect'
                                ? currentWizardInput.split(',').map(s => s.trim()).includes(opt)
                                : currentWizardInput.trim() === opt

                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    if (wizardQuestions[wizardStep - 1].type === 'multiselect') {
                                      handleToggleWizardMultiOption(opt)
                                    } else {
                                      handleWizardOptionSelect(opt)
                                    }
                                  }}
                                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-500/40'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  <span>{opt}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleWizardSubmit} className="space-y-4">
                        <div className="relative">
                          <textarea
                            rows="2"
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
                            className="absolute right-3 bottom-4 w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-slate-900 shadow-md transition-all cursor-pointer"
                          >
                            <ArrowUp className="w-5 h-5 font-black" />
                          </button>
                        </div>
                        {wizardQuestions[wizardStep - 1].type === 'multiselect' && currentWizardInput.trim().length >= wizardQuestions[wizardStep - 1].minLength && (
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Continuar al siguiente paso</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

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
                            onClick={() => handleDirectExportPersona(currentPersona)}
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
                          <div className="flex items-center justify-center gap-3 pt-1">
                            <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer">
                              Subir foto
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadAvatar(e, currentPersona.id)}
                              />
                            </label>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleCycleAvatar(currentPersona.id)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline underline-offset-2"
                            >
                              Rotar avatar
                            </button>
                          </div>
                        </div>

                        {/* Card: Edad */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 group">
                          <div
                            onClick={() => document.getElementById('input-persona-age')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Rango de edad</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-age"
                            type="text"
                            value={currentPersona.age || ''}
                            onChange={(e) => handleUpdatePersonaField('age', e.target.value)}
                            placeholder="Ej. Entre 30 y 45 años"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                        {/* Card: Nivel de educación */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 group">
                          <div
                            onClick={() => document.getElementById('input-persona-education')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                              <span>Nivel de educación más alto</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-education"
                            type="text"
                            value={currentPersona.education || ''}
                            onChange={(e) => handleUpdatePersonaField('education', e.target.value)}
                            placeholder="Ej. Licenciatura universitaria"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                        {/* Card: Canales & Redes donde te descubre */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 group">
                          <div
                            onClick={() => document.getElementById('input-persona-networks')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span>Redes & Canales donde te descubre</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-networks"
                            type="text"
                            value={Array.isArray(currentPersona.socialNetworks) ? currentPersona.socialNetworks.join(', ') : (currentPersona.socialNetworks || '')}
                            onChange={(e) => handleUpdatePersonaField('socialNetworks', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. Instagram, WhatsApp, Facebook, LinkedIn"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                        {/* Card: Industria */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 group">
                          <div
                            onClick={() => document.getElementById('input-persona-industry')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Industria</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-industry"
                            type="text"
                            value={currentPersona.industry || ''}
                            onChange={(e) => handleUpdatePersonaField('industry', e.target.value)}
                            placeholder="Ej. Tecnología / Servicios"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                        {/* Card: Tamaño organización */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 group">
                          <div
                            onClick={() => document.getElementById('input-persona-companysize')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Tamaño de la organización</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-companysize"
                            type="text"
                            value={currentPersona.companySize || ''}
                            onChange={(e) => handleUpdatePersonaField('companySize', e.target.value)}
                            placeholder="Ej. Entre 11 y 50 empleados"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                      </div>

                      {/* COLUMN 2: DETALLES PROFESIONALES */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                          Detalles profesionales
                        </div>

                        {/* Card: Canal favorito de comunicación */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('textarea-persona-commchannels')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>Canal favorito de comunicación</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <textarea
                            id="textarea-persona-commchannels"
                            rows="2"
                            value={Array.isArray(currentPersona.commChannels) ? currentPersona.commChannels.join(', ') : (currentPersona.commChannels || '')}
                            onChange={(e) => handleUpdatePersonaField('commChannels', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. WhatsApp Business, Correo electrónico, LinkedIn"
                            className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors resize-none"
                          />
                        </div>

                        {/* Card: Su superior es */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('input-persona-reportingto')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>Su superior es</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <input
                            id="input-persona-reportingto"
                            type="text"
                            value={currentPersona.reportingTo || ''}
                            onChange={(e) => handleUpdatePersonaField('reportingTo', e.target.value)}
                            placeholder="Ej. Dirección General / CEO"
                            className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors"
                          />
                        </div>

                        {/* Card: Herramientas que necesita para trabajar */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('textarea-persona-tools')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-slate-400" />
                              <span>Herramientas que necesita para trabajar</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <textarea
                            id="textarea-persona-tools"
                            rows="2"
                            value={Array.isArray(currentPersona.tools) ? currentPersona.tools.join(', ') : (currentPersona.tools || '')}
                            onChange={(e) => handleUpdatePersonaField('tools', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. Software de CRM, WhatsApp Web, Gestión de proyectos"
                            className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors resize-none"
                          />
                        </div>

                      </div>

                      {/* COLUMN 3: OBJETIVOS, DOLORES & CÓMO AYUDAMOS */}
                      <div className="md:col-span-4 space-y-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                          Objetivos y Desafíos
                        </div>

                        {/* Card: Su trabajo se mide en función de */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('textarea-persona-kpis')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-slate-400" />
                              <span>Su trabajo se mide en función de</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <textarea
                            id="textarea-persona-kpis"
                            rows="2"
                            value={Array.isArray(currentPersona.kpis) ? currentPersona.kpis.join(', ') : (currentPersona.kpis || '')}
                            onChange={(e) => handleUpdatePersonaField('kpis', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. Crecimiento de clientes, Conversión de leads"
                            className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors resize-none"
                          />
                        </div>

                        {/* Card: Dificultades principales (Dolores) */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('textarea-persona-pains')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <span>Dificultades principales (Dolores)</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <textarea
                            id="textarea-persona-pains"
                            rows="3"
                            value={Array.isArray(currentPersona.pains) ? currentPersona.pains.join('\n') : (currentPersona.pains || '')}
                            onChange={(e) => handleUpdatePersonaField('pains', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Escribe cada dolor en una línea..."
                            className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors resize-none"
                          />
                        </div>

                        {/* Card: Obtiene información a través de */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 group">
                          <div
                            onClick={() => document.getElementById('textarea-persona-infosources')?.focus()}
                            className="flex justify-between items-center text-xs text-slate-400 font-bold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5 text-slate-400" />
                              <span>Obtiene información a través de</span>
                            </span>
                            <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <textarea
                            id="textarea-persona-infosources"
                            rows="2"
                            value={Array.isArray(currentPersona.infoSources) ? currentPersona.infoSources.join(', ') : (currentPersona.infoSources || '')}
                            onChange={(e) => handleUpdatePersonaField('infoSources', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. Investigación en línea, LinkedIn, Recomendaciones"
                            className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-0.5 transition-colors resize-none"
                          />
                        </div>

                        {/* Card: Cómo contribuimos a su éxito */}
                        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-100 shadow-sm space-y-3 group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div
                              onClick={() => document.getElementById('textarea-persona-howwehelp')?.focus()}
                              className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Cómo contribuimos a su éxito</span>
                            </div>

                            {/* AI Coproduction Actions */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                currentPersona.aiStatus?.howWeHelp === 'approved'
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {currentPersona.aiStatus?.howWeHelp === 'approved' ? '✓ Aprobado' : '✨ Propuesta IA'}
                              </span>

                              {(currentPersona.aiRegens?.howWeHelp ?? 3) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateBlock(currentPersona.id, 'howWeHelp')}
                                  className="px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-emerald-900 text-[10px] font-bold border border-emerald-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                  title="Replantear propuesta con IA"
                                >
                                  <RefreshCw className="w-3 h-3 text-emerald-600" />
                                  <span>Replantear ({currentPersona.aiRegens?.howWeHelp ?? 3})</span>
                                </button>
                              )}

                              {currentPersona.aiStatus?.howWeHelp !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveBlock(currentPersona.id, 'howWeHelp')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                  title="Aprobar esta versión"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Aprobar</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <textarea
                            id="textarea-persona-howwehelp"
                            rows="3"
                            value={currentPersona.howWeHelp || ''}
                            onChange={(e) => handleUpdatePersonaField('howWeHelp', e.target.value)}
                            placeholder="Describe cómo tu solución resuelve sus necesidades..."
                            className="w-full text-xs sm:text-sm font-bold text-emerald-950 bg-transparent border-b border-transparent hover:border-emerald-300 focus:border-emerald-700 focus:outline-none py-0.5 transition-colors resize-none leading-relaxed"
                          />
                        </div>

                      </div>

                    </div>

                    {/* Bottom Add Section Button (Opens Official 5 Slides Presentation) */}
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setViewingExecutivePersona(currentPersona)
                          setExecutiveSlideTab('demography')
                        }}
                        className="w-full max-w-md py-3.5 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Ver Presentación Oficial (5 Slides HubSpot)</span>
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* =========================================================================
                2. OBJETIVOS SMART & CALCULADORA DE CRECIMIENTO MoM (HUBSPOT SHEETS)
               ========================================================================= */}
            {currentView === 'smart' && (
              <motion.div
                key="panel-smart"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 relative z-10">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold uppercase tracking-wider">
                        <Target className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Módulo 2 • Metodología Oficial HubSpot</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Objetivos SMART & Crecimiento MoM
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                        Estructura metas comerciales claras y calcula tu proyección mensual compuesta de visitas, leads y clientes.
                      </p>
                    </div>

                    {/* Presets Rápidos */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSmartSpecific(`Aumentar prospectos calificados para ${companyContext.name} desde canales digitales.`)
                          setSmartMeasurable('+25% de MQLs y consultas directas por WhatsApp.')
                          setSmartAchievable('Escalar de 50 a 65 prospectos calificados al mes con optimización de campañas.')
                          setSmartRelevant(`Permite alimentar el pipeline comercial con clientes del sector ${companyContext.targetNiche}.`)
                          setSmartTimeBound('Meta proyectada a 6 meses con revisiones quincenales.')
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        🎯 Preset: Leads & Ventas
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSmartSpecific(`Escalar el tráfico calificado del sitio web mediante contenidos TOFU/MOFU.`)
                          setSmartMeasurable('+40% en visitantes únicos mensuales.')
                          setSmartAchievable('Publicar 4 artículos SEO y 8 piezas de contenido de valor al mes.')
                          setSmartRelevant('El tráfico orgánico reduce nuestro costo por adquisición en más de un 30%.')
                          setSmartTimeBound('Plazo límite de 90 días.')
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        🚀 Preset: Tráfico SEO
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: SMART Form & MoM Calculator */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 relative z-10 items-start">
                    
                    {/* LEFT COLUMN: 5 PASOS SMART */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between pb-2">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-600" />
                          <span>Desglose de Meta SMART</span>
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">Editable directamente</span>
                      </div>

                      {/* S: Específico */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 group hover:bg-white hover:border-indigo-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-indigo-700">S • Específico (Specific)</span>
                          <span className="text-[11px] text-slate-400">¿Qué quieres lograr exactamente?</span>
                        </div>
                        <input
                          type="text"
                          value={smartSpecific}
                          onChange={(e) => setSmartSpecific(e.target.value)}
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1 transition-colors"
                        />
                      </div>

                      {/* M: Medible */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 group hover:bg-white hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-blue-700">M • Medible (Measurable)</span>
                          <span className="text-[11px] text-slate-400">¿Qué métrica o KPI define el éxito?</span>
                        </div>
                        <input
                          type="text"
                          value={smartMeasurable}
                          onChange={(e) => setSmartMeasurable(e.target.value)}
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-1 transition-colors"
                        />
                      </div>

                      {/* A: Alcanzable */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 group hover:bg-white hover:border-purple-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-purple-700">A • Alcanzable (Attainable)</span>
                          <span className="text-[11px] text-slate-400">¿Cómo lo lograrás de forma realista?</span>
                        </div>
                        <input
                          type="text"
                          value={smartAchievable}
                          onChange={(e) => setSmartAchievable(e.target.value)}
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-purple-600 focus:outline-none py-1 transition-colors"
                        />
                      </div>

                      {/* R: Relevante */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 group hover:bg-white hover:border-amber-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-amber-700">R • Relevante (Relevant)</span>
                          <span className="text-[11px] text-slate-400">¿Por qué es crucial para tu negocio?</span>
                        </div>
                        <input
                          type="text"
                          value={smartRelevant}
                          onChange={(e) => setSmartRelevant(e.target.value)}
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-amber-600 focus:outline-none py-1 transition-colors"
                        />
                      </div>

                      {/* T: Límite de Tiempo */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 group hover:bg-white hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-emerald-700">T • Límite de Tiempo (Time-bound)</span>
                          <span className="text-[11px] text-slate-400">¿En qué plazo temporal se medirá?</span>
                        </div>
                        <input
                          type="text"
                          value={smartTimeBound}
                          onChange={(e) => setSmartTimeBound(e.target.value)}
                          className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-300 focus:border-emerald-600 focus:outline-none py-1 transition-colors"
                        />
                      </div>

                      {/* Declaración Oficial SMART */}
                      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Declaración Oficial de Objetivo SMART
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Formato HubSpot</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
                          "{smartSpecific} {smartMeasurable} {smartRelevant} {smartTimeBound}"
                        </p>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: CALCULADORA DE CRECIMIENTO MoM */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <span>Calculadora MoM (Compuesto)</span>
                          </h4>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {momMonths} Meses
                          </span>
                        </div>

                        {/* Slider Meses */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Horizonte de Tiempo:</span>
                            <span>{momMonths} Meses</span>
                          </div>
                          <input
                            type="range"
                            min="3"
                            max="24"
                            step="1"
                            value={momMonths}
                            onChange={(e) => setMomMonths(Number(e.target.value))}
                            className="w-full accent-cyan-600"
                          />
                        </div>

                        {/* Tráfico Inicial & Tasa MoM */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 block">Visitas / Mes Actual</label>
                            <input
                              type="number"
                              value={momVisitorsCurrent}
                              onChange={(e) => setMomVisitorsCurrent(Number(e.target.value))}
                              className="w-full font-mono font-bold text-xs sm:text-sm text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 block">Crecimiento MoM (%)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={momVisitorsRate}
                              onChange={(e) => setMomVisitorsRate(Number(e.target.value))}
                              className="w-full font-mono font-bold text-xs sm:text-sm text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Métricas Proyectadas */}
                        <div className="space-y-3 pt-2">
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-emerald-800 uppercase">Meta Tráfico Final</div>
                              <div className="text-xs text-emerald-600">Al finalizar mes {momMonths}</div>
                            </div>
                            <div className="text-base sm:text-lg font-mono font-black text-emerald-900">
                              {calculatedMomVisitorsGoal.toLocaleString()} <span className="text-xs font-normal">visitas/mes</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-blue-800 uppercase">Meta Leads Proyectados</div>
                              <div className="text-xs text-blue-600">Conversión estimada {momConvRateCurrent}%</div>
                            </div>
                            <div className="text-base sm:text-lg font-mono font-black text-blue-900">
                              {calculatedMomLeadsGoal.toLocaleString()} <span className="text-xs font-normal">leads/mes</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-purple-800 uppercase">Clientes Nuevos / Mes</div>
                              <div className="text-xs text-purple-600">Cierre estimado {momCloseRateCurrent}%</div>
                            </div>
                            <div className="text-base sm:text-lg font-mono font-black text-purple-900">
                              {calculatedMomCustomersGoal.toLocaleString()} <span className="text-xs font-normal">clientes/mes</span>
                            </div>
                          </div>
                        </div>

                        {/* Obstáculos & Mitigación */}
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-2 text-amber-900">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Mitigación de Obstáculos (Página 2)</span>
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Para alcanzar esta meta de <strong>{calculatedMomLeadsGoal} leads/mes</strong>, se requiere asegurar seguimiento de WhatsApp en menos de 15 minutos para evitar fugas de conversión.
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* =========================================================================
                3. KANBAN CONTENT MAPPING
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
                  onClick={() => handleDirectExportPersona(viewingExecutivePersona)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff4b0b] hover:bg-[#e04008] text-white font-bold text-xs transition-colors shadow-xs"
                  title="Descargar Ficha Ejecutiva a tu PC"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  title="Imprimir o Guardar como PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF</span>
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
              
              {/* 1. SLIDE: DEMOGRAFÍA (PÁGINA 6 & 12) */}
              {executiveSlideTab === 'demography' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Demografía
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Perfil general, entorno laboral y características sociodemográficas
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-200 max-w-sm">
                      <img
                        src={viewingExecutivePersona.avatarImg}
                        alt={viewingExecutivePersona.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-300 shrink-0"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-snug">
                          {viewingExecutivePersona.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {viewingExecutivePersona.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Perfil General */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Perfil general</div>
                          <div className="text-xs text-slate-300">Puesto, rol y entorno laboral.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Puesto de trabajo:</strong> {viewingExecutivePersona.title || viewingExecutivePersona.roleType}</div>
                        <div><strong>• Jerarquía / Superior:</strong> {viewingExecutivePersona.reportingTo || 'Propietario / Sin superior'}</div>
                        <div><strong>• Tamaño de la organización:</strong> {viewingExecutivePersona.companySize || 'Entre 11 y 50 empleados'}</div>
                      </div>
                    </div>

                    {/* 2. Características Sociodemográficas */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Características sociodemográficas</div>
                          <div className="text-xs text-slate-300">Edad, educación y ubicación.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Rango de edad:</strong> {viewingExecutivePersona.age || 'Entre 35 y 44 años'}</div>
                        <div><strong>• Nivel de educación:</strong> {viewingExecutivePersona.education || 'Licenciatura Universitaria'}</div>
                        <div><strong>• Industria / Sector:</strong> {viewingExecutivePersona.industry || 'Servicios Profesionales'}</div>
                      </div>
                    </div>

                    {/* 3. Descripción de la Personalidad */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Descripción de la personalidad</div>
                          <div className="text-xs text-slate-300">Rol en la toma de decisiones y trato.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Tipo de personalidad:</strong> Perfil Decisor & Estratégico</div>
                        <div><strong>• Canales de preferencia:</strong> {Array.isArray(viewingExecutivePersona.socialNetworks) ? viewingExecutivePersona.socialNetworks.join(', ') : viewingExecutivePersona.socialNetworks}</div>
                        <div><strong>• Fuentes de información:</strong> {Array.isArray(viewingExecutivePersona.infoSources) ? viewingExecutivePersona.infoSources.join(', ') : viewingExecutivePersona.infoSources}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SLIDE: NECESIDADES (PÁGINA 7 & 13) */}
              {executiveSlideTab === 'needs' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Necesidades
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Identifica la raíz de sus problemas y los factores que influyen en su toma de decisiones
                      </p>
                    </div>

                    {/* AI Coproduction controls */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        viewingExecutivePersona.aiStatus?.dimensions === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {viewingExecutivePersona.aiStatus?.dimensions === 'approved' ? '✓ Dimensiones Aprobadas' : '✨ Análisis IA'}
                      </span>

                      {(viewingExecutivePersona.aiRegens?.dimensions ?? 3) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRegenerateBlock(viewingExecutivePersona.id, 'dimensions')}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Replantear ({viewingExecutivePersona.aiRegens?.dimensions ?? 3})</span>
                        </button>
                      )}

                      {viewingExecutivePersona.aiStatus?.dimensions !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApproveBlock(viewingExecutivePersona.id, 'dimensions')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Puntos de dolor */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Puntos de dolor</div>
                          <div className="text-xs text-slate-300">Obstáculos que dificultan sus objetivos.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        {viewingExecutivePersona.pains?.map((p, i) => (
                          <div key={i}><strong>•</strong> {p}</div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Retos y Desafíos */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Retos y desafíos</div>
                          <div className="text-xs text-slate-300">Objetivos que representan un reto.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Reto a corto plazo:</strong> Ordenar flujos y eliminar tareas manuales.</div>
                        <div><strong>• Reto a mediano plazo:</strong> {viewingExecutivePersona.jtbd}</div>
                      </div>
                    </div>

                    {/* 3. Dimensión del problema */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Dimensión del problema</div>
                          <div className="text-xs text-slate-300">Interno, Externo y Filosófico (StoryBrand).</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-2 flex flex-col justify-center">
                        <div><strong>• Externo (Tangible):</strong> {viewingExecutivePersona.dimensions?.external || viewingExecutivePersona.pains?.[0]}</div>
                        <div><strong>• Interno (Emocional):</strong> {viewingExecutivePersona.dimensions?.internal}</div>
                        <div><strong>• Filosófico (Valores):</strong> {viewingExecutivePersona.dimensions?.philosophical}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SLIDE: SOLUCIÓN (PÁGINA 8 & 14) */}
              {executiveSlideTab === 'solution' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Solución
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Identifica cómo tu producto o servicio resuelve las necesidades del buyer persona
                      </p>
                    </div>

                    {/* AI Coproduction controls */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        viewingExecutivePersona.aiStatus?.guidePlan === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {viewingExecutivePersona.aiStatus?.guidePlan === 'approved' ? '✓ Plan Aprobado' : '✨ Propuesta IA'}
                      </span>

                      {(viewingExecutivePersona.aiRegens?.guidePlan ?? 3) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRegenerateBlock(viewingExecutivePersona.id, 'guidePlan')}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Replantear ({viewingExecutivePersona.aiRegens?.guidePlan ?? 3})</span>
                        </button>
                      )}

                      {viewingExecutivePersona.aiStatus?.guidePlan !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApproveBlock(viewingExecutivePersona.id, 'guidePlan')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Un Guía */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Un guía</div>
                          <div className="text-xs text-slate-300">Tu empresa como socio estratégico.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Posicionamiento:</strong> {companyContext.name} actúa como guía especializado en {companyContext.industry}.</div>
                        <div><strong>• Propuesta de valor:</strong> {companyContext.valueProp}</div>
                      </div>
                    </div>

                    {/* 2. Cómo lo podemos ayudar */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Cómo lo podemos ayudar</div>
                          <div className="text-xs text-slate-300">Atributos del servicio y diferenciadores.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div>{viewingExecutivePersona.howWeHelp}</div>
                      </div>
                    </div>

                    {/* 3. Planes de acción */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Planes de acción</div>
                          <div className="text-xs text-slate-300">Pasos para superar los retos y cumplir metas.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        {viewingExecutivePersona.guidePlan?.actionSteps?.map((step, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="font-bold text-indigo-600 shrink-0">Paso {i + 1}:</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SLIDE: DIFUSIÓN (PÁGINA 9 & 15) */}
              {executiveSlideTab === 'diffusion' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Difusión
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Identifica las mejores formas de comunicarte aprovechando sus preferencias de consumo
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                      <strong>Canales activos:</strong> {Array.isArray(viewingExecutivePersona.socialNetworks) ? viewingExecutivePersona.socialNetworks.join(', ') : viewingExecutivePersona.socialNetworks}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Citas del cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Citas del cliente</div>
                          <div className="text-xs text-slate-300">Citas reales sobre retos y objetivos.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs italic flex flex-col justify-center">
                        “{viewingExecutivePersona.habits?.quote || `Buscamos herramientas que nos permitan resolver ${viewingExecutivePersona.pains?.[0] || 'nuestros problemas'} con tranquilidad.`}”
                      </div>
                    </div>

                    {/* 2. Hábitos de consumo */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Hábitos de consumo</div>
                          <div className="text-xs text-slate-300">Dónde pasa más tiempo e interactúa.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Canales de comunicación:</strong> {Array.isArray(viewingExecutivePersona.socialNetworks) ? viewingExecutivePersona.socialNetworks.join(', ') : viewingExecutivePersona.socialNetworks}</div>
                        <div><strong>• Búsqueda de soluciones:</strong> {Array.isArray(viewingExecutivePersona.infoSources) ? viewingExecutivePersona.infoSources.join(', ') : viewingExecutivePersona.infoSources}</div>
                      </div>
                    </div>

                    {/* 3. Horarios */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Horarios</div>
                          <div className="text-xs text-slate-300">Momentos del día con mayor receptividad.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-xs space-y-1.5 flex flex-col justify-center">
                        <div><strong>• Ventana óptima:</strong> Horario laboral regular (Martes a Jueves entre 9:00 AM y 5:00 PM).</div>
                        <div><strong>• Formato de primer contacto:</strong> Mensaje directo / WhatsApp y llamada de diagnóstico breve.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SLIDE: MENSAJES CLAVE (PÁGINA 10 & 16) */}
              {executiveSlideTab === 'messages' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Mensajes clave
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Define los mensajes principales desde las perspectivas de marketing y ventas
                      </p>
                    </div>

                    {/* AI Coproduction controls */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        viewingExecutivePersona.aiStatus?.messages === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {viewingExecutivePersona.aiStatus?.messages === 'approved' ? '✓ Mensajes Aprobados' : '✨ Redacción IA'}
                      </span>

                      {(viewingExecutivePersona.aiRegens?.messages ?? 3) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRegenerateBlock(viewingExecutivePersona.id, 'messages')}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Replantear ({viewingExecutivePersona.aiRegens?.messages ?? 3})</span>
                        </button>
                      )}

                      {viewingExecutivePersona.aiStatus?.messages !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApproveBlock(viewingExecutivePersona.id, 'messages')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Mensaje de marketing */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Mensaje de marketing</div>
                          <div className="text-xs text-slate-300">Respuesta a la problemática del cliente.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm font-medium text-slate-800 shadow-xs italic leading-relaxed flex flex-col justify-center">
                        "{viewingExecutivePersona.keyMessages?.marketing || viewingExecutivePersona.jtbd}"
                      </div>
                    </div>

                    {/* 2. Mensaje de ventas */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Mensaje de ventas</div>
                          <div className="text-xs text-slate-300">Respuesta de ventas para llegar al cliente.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm font-medium text-slate-800 shadow-xs leading-relaxed flex flex-col justify-center">
                        "{viewingExecutivePersona.keyMessages?.sales || 'Prueba social y resultados comprobados con soporte dedicado.'}"
                      </div>
                    </div>

                    {/* 3. Formatos */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                      <div className="md:col-span-4 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                        <div>
                          <div className="text-xs sm:text-sm font-bold">Formatos</div>
                          <div className="text-xs text-slate-300">Contenido más adecuado para transmitir los mensajes.</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-8 p-4 rounded-2xl bg-white border-2 border-slate-700/80 text-xs sm:text-sm text-slate-700 shadow-xs space-y-1.5 flex flex-col justify-center">
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

            </div>
          </motion.div>
        </div>
      )}


    </div>
  )
}
}
