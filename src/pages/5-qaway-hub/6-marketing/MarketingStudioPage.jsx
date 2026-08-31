import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Target,
  Layers,
  Radio,
  Calculator,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Share2,
  FileText,
  Video,
  Download,
  Search,
  ChevronRight,
  Zap,
  Globe,
  Mail,
  Award,
  RefreshCw,
  HelpCircle,
  Smartphone,
  Monitor,
  Building2,
  ShoppingBag,
  Info,
  Check
} from 'lucide-react'

// LocalStorage persistence key
const STORAGE_KEY = 'qaway_marketing_revolut_os_v2'

// HubSpot Page 6: Exact Format Mapping
const HUBSPOT_FORMATS_BY_STAGE = {
  TOFU: [
    { name: 'Infografía', purpose: 'Fácil de compartir y aumenta el descubrimiento en redes' },
    { name: 'Video Corto (Reels/TikTok/YT)', purpose: 'Ayuda a que nuevas personas descubran tu marca' }
  ],
  MOFU: [
    { name: 'Ebook / Guía', purpose: 'Captar datos de contacto (leads) a cambio de valor' },
    { name: 'Muestra Gratis / Demo', purpose: 'Permite probar el servicio antes de invertir' },
    { name: 'Webinar / Masterclass', purpose: 'Formato interactivo audiovisual de alta información' }
  ],
  BOFU: [
    { name: 'Caso de Éxito (Case Study)', purpose: 'Compara soluciones y demuestra resultados reales' },
    { name: 'Testimonio / Demostración Social', purpose: 'Fotos/reseñas con prueba social para el cierre' }
  ]
}

const INITIAL_PERSONAS = [
  {
    id: 'p-1',
    name: 'Carlos Mendoza',
    title: 'Director de Operaciones / CEO',
    type: 'B2B',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatarBg: 'bg-indigo-100 text-indigo-700',
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
    channels: ['LinkedIn', 'Google Search', 'Email Corporativo'],
    trigger: 'El equipo de ventas perdió una cuenta clave por falta de trazabilidad.'
  },
  {
    id: 'p-2',
    name: 'Valeria Ramos',
    title: 'Compradora Digital & Emprendedora',
    type: 'B2C',
    avatarImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    avatarBg: 'bg-violet-100 text-violet-700',
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
    channels: ['Instagram', 'TikTok', 'WhatsApp'],
    trigger: 'Vio un video testimonial en redes sociales que resolvió su duda principal.'
  }
]

const INITIAL_CONTENT = [
  {
    id: 'c-1',
    title: 'Infografía: Los 5 Errores Costosos en la Gestión de Clientes',
    stage: 'TOFU',
    format: 'Infografía',
    purpose: 'Fácil de compartir y aumenta el descubrimiento en redes',
    channel: 'Instagram & LinkedIn',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-2',
    title: 'Video Corto: Cómo Ahorrar 15 Horas Semanales con Automatizaciones',
    stage: 'TOFU',
    format: 'Video Corto (Reels/TikTok/YT)',
    purpose: 'Ayuda a que nuevas personas descubran tu marca',
    channel: 'TikTok & Reels',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-3',
    title: 'Ebook: Guía Definitiva de Arquitectura Comercial para Empresas',
    stage: 'MOFU',
    format: 'Ebook / Guía',
    purpose: 'Captar datos de contacto (leads) a cambio de valor',
    channel: 'Landing Page & Ads',
    personaId: 'p-1',
    status: 'En Progreso',
    modelType: 'B2B'
  },
  {
    id: 'c-4',
    title: 'Webinar: Cómo Escalar Operaciones Digitales en 90 Días',
    stage: 'MOFU',
    format: 'Webinar / Masterclass',
    purpose: 'Formato interactivo audiovisual de alta información',
    channel: 'Email Marketing & Zoom',
    personaId: 'p-1',
    status: 'Borrador',
    modelType: 'B2B'
  },
  {
    id: 'c-5',
    title: 'Caso de Éxito: Empresa B2B Multiplica x3 sus Ventas',
    stage: 'BOFU',
    format: 'Caso de Éxito (Case Study)',
    purpose: 'Compara soluciones y demuestra resultados reales',
    channel: 'Landing Page & Ventas',
    personaId: 'p-1',
    status: 'Publicado',
    modelType: 'B2B'
  },
  {
    id: 'c-6',
    title: 'Testimonio en Video de Cliente Satisfecho con Resultados Reales',
    stage: 'BOFU',
    format: 'Testimonio / Demostración Social',
    purpose: 'Fotos/reseñas con prueba social para el cierre',
    channel: 'Instagram Stories & Web',
    personaId: 'p-2',
    status: 'Publicado',
    modelType: 'B2C'
  }
]

const INITIAL_POEM = [
  { id: 'poem-1', category: 'Owned', channel: 'Sitio Web & Blog Principal', efficiency: 'Alta', health: 92, gapStatus: 'Óptimo' },
  { id: 'poem-2', category: 'Owned', channel: 'Lista de Suscriptores Email', efficiency: 'Media', health: 74, gapStatus: 'Requiere Nutrición' },
  { id: 'poem-3', category: 'Earned', channel: 'Reseñas & Testimonios', efficiency: 'Alta', health: 88, gapStatus: 'Activo' },
  { id: 'poem-4', category: 'Earned', channel: 'Menciones Orgánicas en Redes', efficiency: 'Baja', health: 45, gapStatus: 'Brecha Detectada' },
  { id: 'poem-5', category: 'Paid', channel: 'Google Search Ads', efficiency: 'Alta', health: 85, gapStatus: 'Escalando' },
  { id: 'poem-6', category: 'Paid', channel: 'Meta Ads Retargeting', efficiency: 'Alta', health: 90, gapStatus: 'Óptimo' }
]

const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    name: 'Q3 Growth Engine: Captación B2B',
    objective: 'Generación de MQLs & Demos',
    channel: 'Meta Ads + Google Search',
    budget: 1200,
    leadsExpected: 85,
    status: 'Activa',
    roas: '3.8x',
    period: 'Jul - Sep'
  },
  {
    id: 'camp-2',
    name: 'Retargeting de Alto Valor: Casos de Éxito',
    objective: 'Cierre de BOFU & Contratos',
    channel: 'LinkedIn Ads + Email',
    budget: 650,
    leadsExpected: 25,
    status: 'Activa',
    roas: '5.2x',
    period: 'Agosto'
  }
]

export default function MarketingStudioPage() {
  // Global Business Model Context: 'B2B' | 'B2C'
  const [businessModel, setBusinessModel] = useState('B2B')

  // View mode: 'desktop' or 'mobile-preview'
  const [viewMode, setViewMode] = useState('desktop')
  const [activeTab, setActiveTab] = useState('content')

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
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`)
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS
  })

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
  const [newPersona, setNewPersona] = useState({
    name: '',
    title: '',
    type: 'B2B',
    jtbd: '',
    pains: '',
    gains: '',
    channels: '',
    trigger: ''
  })

  const [showContentModal, setShowContentModal] = useState(false)
  const [newContent, setNewContent] = useState({
    title: '',
    stage: 'TOFU',
    format: 'Infografía',
    purpose: 'Fácil de compartir y aumenta el descubrimiento en redes',
    channel: '',
    personaId: 'p-1',
    status: 'Borrador',
    modelType: 'B2B'
  })

  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: '',
    channel: '',
    budget: 500,
    leadsExpected: 30,
    status: 'Borrador',
    roas: '3.0x',
    period: 'Mes Actual'
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

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_personas`, JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contents`, JSON.stringify(contents))
  }, [contents])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_poem`, JSON.stringify(poemChannels))
  }, [poemChannels])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns))
  }, [campaigns])

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

    if (editingPersona) {
      setPersonas(prev => prev.map(p => (p.id === editingPersona.id ? {
        ...editingPersona,
        ...newPersona,
        pains: typeof newPersona.pains === 'string' ? newPersona.pains.split('\n').filter(Boolean) : newPersona.pains,
        gains: typeof newPersona.gains === 'string' ? newPersona.gains.split('\n').filter(Boolean) : newPersona.gains,
        channels: typeof newPersona.channels === 'string' ? newPersona.channels.split(',').map(s => s.trim()).filter(Boolean) : newPersona.channels
      } : p)))
    } else {
      const created = {
        id: `p-${Date.now()}`,
        name: newPersona.name,
        title: newPersona.title,
        type: newPersona.type,
        avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        avatarBg: newPersona.type === 'B2B' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700',
        jtbd: newPersona.jtbd,
        pains: newPersona.pains.split('\n').filter(Boolean),
        gains: newPersona.gains.split('\n').filter(Boolean),
        channels: newPersona.channels.split(',').map(s => s.trim()).filter(Boolean),
        trigger: newPersona.trigger
      }
      setPersonas(prev => [...prev, created])
    }
    setShowPersonaModal(false)
    setEditingPersona(null)
    setNewPersona({ name: '', title: '', type: businessModel, jtbd: '', pains: '', gains: '', channels: '', trigger: '' })
  }

  const handleDeletePersona = (id) => {
    setPersonas(prev => prev.filter(p => p.id !== id))
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
      channels: Array.isArray(persona.channels) ? persona.channels.join(', ') : persona.channels,
      trigger: persona.trigger || ''
    })
    setShowPersonaModal(true)
  }

  // Handlers for Content Mapping
  const handleSaveContent = (e) => {
    e.preventDefault()
    if (!newContent.title) return
    const created = {
      id: `c-${Date.now()}`,
      ...newContent,
      modelType: businessModel
    }
    setContents(prev => [...prev, created])
    setShowContentModal(false)
    setNewContent({
      title: '',
      stage: 'TOFU',
      format: 'Infografía',
      purpose: 'Fácil de compartir y aumenta el descubrimiento en redes',
      channel: '',
      personaId: personas[0]?.id || 'p-1',
      status: 'Borrador',
      modelType: businessModel
    })
  }

  const handleDeleteContent = (id) => {
    setContents(prev => prev.filter(c => c.id !== id))
  }

  // Handlers for Campaigns
  const handleSaveCampaign = (e) => {
    e.preventDefault()
    if (!newCampaign.name) return
    const created = {
      id: `camp-${Date.now()}`,
      ...newCampaign,
      budget: Number(newCampaign.budget),
      leadsExpected: Number(newCampaign.leadsExpected)
    }
    setCampaigns(prev => [...prev, created])
    setShowCampaignModal(false)
    setNewCampaign({ name: '', objective: '', channel: '', budget: 500, leadsExpected: 30, status: 'Borrador', roas: '3.0x', period: 'Mes Actual' })
  }

  const handleDeleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-600 selection:text-white font-sans pb-24">

      {/* TOP NOTCH / CAPSULE BAR (iOS Minimal Header) */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white pt-6 pb-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Marketing OS</h1>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  HubSpot Standards
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Bifurcación B2B/B2C, Content Mapping (Pág. 6), Matriz POEM y Unit Economics
              </p>
            </div>
          </div>

          {/* Quick Controls: Business Model (B2B vs B2C) + View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Global Business Model Switch */}
            <div className="bg-white/15 backdrop-blur-md rounded-full p-1 border border-white/25 flex items-center">
              <button
                onClick={() => setBusinessModel('B2B')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  businessModel === 'B2B' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Modelo B2B (Empresas)</span>
              </button>
              <button
                onClick={() => setBusinessModel('B2C')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  businessModel === 'B2C' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Modelo B2C (Consumo)</span>
              </button>
            </div>

            {/* View Mode Switch */}
            <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 flex items-center">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'desktop' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
                title="Vista de escritorio"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('mobile-preview')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'mobile-preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'
                }`}
                title="Vista móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* CONTEXT CALLOUT: B2B vs B2C Strategy Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${businessModel === 'B2B' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {businessModel === 'B2B' ? <Building2 className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Estrategia Activa: Modelo {businessModel === 'B2B' ? 'B2B (Ventas Consultivas / Leads)' : 'B2C (Conversión Directa)'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {businessModel === 'B2B' ? 'Enfoque MQL ➔ SQL' : 'Enfoque Checkout / Fricción Cero'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {businessModel === 'B2B'
                  ? 'Canales prioritarios: LinkedIn, Google Search y Email. Los contenidos buscan educar y calificar antes de la llamada comercial.'
                  : 'Canales prioritarios: Instagram, TikTok y WhatsApp. El recorrido busca llevar al usuario a la compra con mínima fricción.'}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION PILL SELECTOR */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto mb-6 scrollbar-none">
          {[
            { id: 'personas', label: '1. Buyer Personas & JTBD', icon: Users, count: personas.length },
            { id: 'content', label: '2. Content Mapping (Pág. 6)', icon: Layers, count: contents.length },
            { id: 'poem', label: '3. Auditoría POEM', icon: Radio, count: poemChannels.length },
            { id: 'simulator', label: '4. Simulador Funnel & ROI', icon: Calculator },
            { id: 'campaigns', label: '5. Plan de Campañas', icon: Zap, count: campaigns.length }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* CONTAINER FOR DESKTOP OR MOBILE FRAME */}
        <div className={viewMode === 'mobile-preview' ? 'flex justify-center' : ''}>
          <div className={viewMode === 'mobile-preview' ? 'w-full max-w-sm p-4 bg-slate-900 rounded-[48px] shadow-2xl border-8 border-slate-800' : 'w-full'}>
            
            <div className={viewMode === 'mobile-preview' ? 'bg-[#f8fafc] rounded-[36px] overflow-hidden p-4 space-y-4 max-h-[750px] overflow-y-auto' : ''}>

              <AnimatePresence mode="wait">

                {/* 1. CONTENT MAPPING VIEW (PÁGINA 6 HUBSPOT) */}
                {activeTab === 'content' && (
                  <motion.div
                    key="view-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>Mapeo de Contenidos por Etapa (Estándar Página 6)</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                            Reglas HubSpot
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Cada etapa del recorrido del comprador exige formatos con objetivos de comportamiento específicos.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowContentModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Mapear Nueva Pieza
                      </button>
                    </div>

                    {/* 3 Columns: TOFU, MOFU, BOFU with Format Rules according to Page 6 */}
                    <div className={viewMode === 'mobile-preview' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}>
                      
                      {/* TOFU: Reconocimiento */}
                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Etapa 1 • TOFU</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {contents.filter(c => c.stage === 'TOFU').length} piezas
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">Reconocimiento</h4>
                          <div className="mt-2 p-2 rounded-xl bg-indigo-50/60 text-[11px] text-indigo-900">
                            <strong className="block font-bold mb-0.5">Formatos Regla Pág. 6:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-indigo-700">
                              <li><strong>Infografías:</strong> Fáciles de compartir.</li>
                              <li><strong>Videos Cortos:</strong> Descubrimiento de marca.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {contents.filter(c => c.stage === 'TOFU').map((item) => (
                            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 hover:border-indigo-200 transition-all">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                  {item.format}
                                </span>
                                <button onClick={() => handleDeleteContent(item.id)} className="text-slate-400 hover:text-red-500">
                                  ✕
                                </button>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 leading-snug">{item.title}</h5>
                              <p className="text-[10.5px] text-slate-500 italic">{item.purpose}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                <span>Canal: {item.channel}</span>
                                <span className="font-semibold text-indigo-600">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MOFU: Consideración */}
                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Etapa 2 • MOFU</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {contents.filter(c => c.stage === 'MOFU').length} piezas
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">Consideración</h4>
                          <div className="mt-2 p-2 rounded-xl bg-blue-50/60 text-[11px] text-blue-900">
                            <strong className="block font-bold mb-0.5">Formatos Regla Pág. 6:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-blue-700">
                              <li><strong>Ebooks:</strong> Captan información/contacto.</li>
                              <li><strong>Muestras/Demos:</strong> Probar antes de invertir.</li>
                              <li><strong>Webinars:</strong> Información profunda e interactiva.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {contents.filter(c => c.stage === 'MOFU').map((item) => (
                            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 hover:border-blue-200 transition-all">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                  {item.format}
                                </span>
                                <button onClick={() => handleDeleteContent(item.id)} className="text-slate-400 hover:text-red-500">
                                  ✕
                                </button>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 leading-snug">{item.title}</h5>
                              <p className="text-[10.5px] text-slate-500 italic">{item.purpose}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                <span>Canal: {item.channel}</span>
                                <span className="font-semibold text-blue-600">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BOFU: Decisión */}
                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Etapa 3 • BOFU</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {contents.filter(c => c.stage === 'BOFU').length} piezas
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">Decisión & Cierre</h4>
                          <div className="mt-2 p-2 rounded-xl bg-emerald-50/60 text-[11px] text-emerald-900">
                            <strong className="block font-bold mb-0.5">Formatos Regla Pág. 6:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-emerald-700">
                              <li><strong>Casos de Éxito:</strong> Comparan y demuestran valor.</li>
                              <li><strong>Testimonios:</strong> Demostración social directa.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {contents.filter(c => c.stage === 'BOFU').map((item) => (
                            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5 hover:border-emerald-200 transition-all">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                  {item.format}
                                </span>
                                <button onClick={() => handleDeleteContent(item.id)} className="text-slate-400 hover:text-red-500">
                                  ✕
                                </button>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 leading-snug">{item.title}</h5>
                              <p className="text-[10.5px] text-slate-500 italic">{item.purpose}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                <span>Canal: {item.channel}</span>
                                <span className="font-semibold text-emerald-600">{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 2. BUYER PERSONAS (Clean iOS List) */}
                {activeTab === 'personas' && (
                  <motion.div
                    key="view-personas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Perfiles de Cliente Ideal (ICP & JTBD)</h3>
                        <p className="text-xs text-slate-500">Representación de las metas y dolores de tu audiencia</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPersona(null)
                          setNewPersona({ name: '', title: '', type: businessModel, jtbd: '', pains: '', gains: '', channels: '', trigger: '' })
                          setShowPersonaModal(true)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar Persona
                      </button>
                    </div>

                    <div className={viewMode === 'mobile-preview' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                      {personas.map((persona) => (
                        <div key={persona.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={persona.avatarImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                alt={persona.name}
                                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-50 shadow-sm"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{persona.name}</h4>
                                <p className="text-[11px] text-slate-500">{persona.title}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {persona.type}
                            </span>
                          </div>

                          {/* JTBD */}
                          <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-700 italic">
                            "{persona.jtbd}"
                          </div>

                          {/* Pains & Gains */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                              <div className="font-bold text-red-700 mb-1">Dolores (Pains)</div>
                              <ul className="space-y-0.5 text-slate-600">
                                {persona.pains.slice(0, 2).map((p, i) => (
                                  <li key={i} className="truncate">• {p}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                              <div className="font-bold text-emerald-700 mb-1">Ganancias (Gains)</div>
                              <ul className="space-y-0.5 text-slate-600">
                                {persona.gains.slice(0, 2).map((g, i) => (
                                  <li key={i} className="truncate">• {g}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-400">Canales: {persona.channels.join(', ')}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleOpenEditPersona(persona)} className="text-indigo-600 hover:text-indigo-800 font-bold">
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

                {/* 3. POEM AUDIT */}
                {activeTab === 'poem' && (
                  <motion.div
                    key="view-poem"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Auditoría de Canales POEM</h3>
                      <p className="text-xs text-slate-500">Clasificación estándar: Medios Propios (Owned), Obtenidos (Earned) y Pagados (Paid)</p>
                    </div>

                    <div className={viewMode === 'mobile-preview' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
                      {['Owned', 'Earned', 'Paid'].map((category) => {
                        const items = poemChannels.filter(c => c.category === category)
                        return (
                          <div key={category} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <span className="text-xs font-bold text-slate-900">
                                {category === 'Owned' ? 'Medios Propios' : category === 'Earned' ? 'Medios Obtenidos' : 'Medios Pagados'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                                {items.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {items.map((ch) => (
                                <div key={ch.id} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                                  <div className="flex justify-between text-xs font-bold text-slate-800">
                                    <span>{ch.channel}</span>
                                    <span className="text-[10px] text-slate-500">{ch.efficiency}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${ch.health}%` }} />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Salud: {ch.health}%</span>
                                    <span className="font-semibold text-indigo-600">{ch.gapStatus}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4. SIMULATOR VIEW */}
                {activeTab === 'simulator' && (
                  <motion.div
                    key="view-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={viewMode === 'mobile-preview' ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}
                  >
                    {/* Controls */}
                    <div className={viewMode === 'mobile-preview' ? 'space-y-4' : 'lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-5'}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-indigo-600" />
                            Parámetros del Embudo
                          </h3>
                          <p className="text-[11px] text-slate-400">Ajusta los deslizadores interactivos</p>
                        </div>
                        <button
                          onClick={() => {
                            setSimTraffic(8500)
                            setSimTofuToMofu(4.5)
                            setSimMofuToBofu(12.0)
                            setSimAov(480)
                            setSimAdSpend(1500)
                          }}
                          className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Slider 1 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Tráfico TOFU</span>
                          <span className="text-indigo-600 font-mono">{simTraffic.toLocaleString()} visitas</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="50000"
                          step="500"
                          value={simTraffic}
                          onChange={(e) => setSimTraffic(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Slider 2 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Conversión a Lead</span>
                          <span className="text-indigo-600 font-mono">{simTofuToMofu}% ({calculatedLeads} MQLs)</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="0.5"
                          value={simTofuToMofu}
                          onChange={(e) => setSimTofuToMofu(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Slider 3 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Cierre a Cliente</span>
                          <span className="text-emerald-600 font-mono">{simMofuToBofu}% ({calculatedCustomers} ventas)</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={simMofuToBofu}
                          onChange={(e) => setSimMofuToBofu(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      {/* Slider 4 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Ticket Promedio (AOV)</span>
                          <span className="text-slate-900 font-mono">${simAov} USD</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="5000"
                          step="50"
                          value={simAov}
                          onChange={(e) => setSimAov(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                        />
                      </div>

                      {/* Slider 5 */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Presupuesto Paid Ads</span>
                          <span className="text-indigo-600 font-mono">${simAdSpend} USD</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="10000"
                          step="100"
                          value={simAdSpend}
                          onChange={(e) => setSimAdSpend(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Funnel Visualization */}
                    <div className={viewMode === 'mobile-preview' ? 'space-y-3' : 'lg:col-span-7 space-y-4'}>
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">Embudo Estratégico ({businessModel})</h3>

                        {/* Step 1 TOFU */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              1
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">TOFU • Atracción</div>
                              <div className="text-xs font-semibold text-slate-900">Visitantes Únicos</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-sm font-bold text-indigo-900">
                            {simTraffic.toLocaleString()}
                          </div>
                        </div>

                        {/* Step 2 MOFU */}
                        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between ml-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              2
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">MOFU • Nutrición</div>
                              <div className="text-xs font-semibold text-slate-900">Leads Calificados (MQL)</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-sm font-bold text-blue-900">
                            {calculatedLeads.toLocaleString()}
                          </div>
                        </div>

                        {/* Step 3 BOFU */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between ml-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              3
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">BOFU • Cierre</div>
                              <div className="text-xs font-semibold text-slate-900">Clientes Adquiridos</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-sm font-bold text-emerald-900">
                            {calculatedCustomers.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* ROI Diagnosis Box */}
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white shadow-lg space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span>Diagnóstico de Viabilidad</span>
                        </div>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                          Con un CAC de <strong className="text-white">${calculatedCac}</strong> y un LTV de <strong className="text-white">${calculatedLtv}</strong>, tu negocio genera un retorno de <strong className="text-emerald-400">${calculatedRoas}</strong> por cada dólar en publicidad.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. CAMPAIGNS */}
                {activeTab === 'campaigns' && (
                  <motion.div
                    key="view-campaigns"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Campañas Planificadas</h3>
                      <button
                        onClick={() => setShowCampaignModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nueva
                      </button>
                    </div>

                    <div className={viewMode === 'mobile-preview' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                      {campaigns.map((camp) => (
                        <div key={camp.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-indigo-600">{camp.period}</span>
                              <h4 className="text-sm font-bold text-slate-900">{camp.name}</h4>
                              <p className="text-[11px] text-slate-400">{camp.objective}</p>
                            </div>
                            <button onClick={() => handleDeleteCampaign(camp.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 text-center text-xs">
                            <div>
                              <div className="text-[10px] text-slate-400">Presupuesto</div>
                              <div className="font-bold text-slate-900">${camp.budget}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">Leads</div>
                              <div className="font-bold text-indigo-600">{camp.leadsExpected}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">ROAS</div>
                              <div className="font-bold text-emerald-600">{camp.roas}</div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100">
                            <span className="text-slate-500">Canal: {camp.channel}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {camp.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* MODAL 1: PERSONA */}
        {showPersonaModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingPersona ? 'Editar Buyer Persona' : 'Crear Buyer Persona (JTBD)'}
                </h3>
                <button onClick={() => setShowPersonaModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleSavePersona} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cargo</label>
                    <input
                      type="text"
                      placeholder="Ej. CEO / Gerente"
                      value={newPersona.title}
                      onChange={(e) => setNewPersona(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tipo de Mercado</label>
                    <select
                      value={newPersona.type}
                      onChange={(e) => setNewPersona(p => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="B2B">B2B (Empresas)</option>
                      <option value="B2C">B2C (Consumidor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Job To Be Done (Trabajo Principal)</label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Qué progreso busca resolver el cliente..."
                    value={newPersona.jtbd}
                    onChange={(e) => setNewPersona(p => ({ ...p, jtbd: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Dolores (Pains - 1 por línea)</label>
                  <textarea
                    rows="2"
                    value={newPersona.pains}
                    onChange={(e) => setNewPersona(p => ({ ...p, pains: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ganancias (Gains - 1 por línea)</label>
                  <textarea
                    rows="2"
                    value={newPersona.gains}
                    onChange={(e) => setNewPersona(p => ({ ...p, gains: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Canales (separados por coma)</label>
                  <input
                    type="text"
                    placeholder="LinkedIn, Google, Email"
                    value={newPersona.channels}
                    onChange={(e) => setNewPersona(p => ({ ...p, channels: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPersonaModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: CONTENT (PÁGINA 6 ENFORCED) */}
        {showContentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mapear Pieza de Contenido</h3>
                  <p className="text-[11px] text-slate-400">Validado con reglas de formato de HubSpot (Pág. 6)</p>
                </div>
                <button onClick={() => setShowContentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleSaveContent} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Título de la Pieza</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Infografía de Errores Comunes"
                    value={newContent.title}
                    onChange={(e) => setNewContent(c => ({ ...c, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Etapa de Funnel</label>
                    <select
                      value={newContent.stage}
                      onChange={(e) => setNewContent(c => ({ ...c, stage: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none font-semibold"
                    >
                      <option value="TOFU">1. Reconocimiento (TOFU)</option>
                      <option value="MOFU">2. Consideración (MOFU)</option>
                      <option value="BOFU">3. Decisión (BOFU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Formato (Página 6)</label>
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none font-semibold"
                    >
                      {HUBSPOT_FORMATS_BY_STAGE[newContent.stage]?.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Purpose Alert based on Page 6 */}
                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-900">
                  <div className="font-bold mb-0.5">Propósito Metodológico (HubSpot):</div>
                  <div>{newContent.purpose}</div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Canal de Distribución</label>
                  <input
                    type="text"
                    placeholder={businessModel === 'B2B' ? 'LinkedIn, Blog, Email' : 'Instagram, TikTok, WhatsApp'}
                    value={newContent.channel}
                    onChange={(e) => setNewContent(c => ({ ...c, channel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowContentModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL 3: CAMPAIGN */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Nueva Campaña</h3>
                <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Campaña Captación Q4"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(c => ({ ...c, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Presupuesto ($ USD)</label>
                    <input
                      type="number"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign(c => ({ ...c, budget: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Leads Esperados</label>
                    <input
                      type="number"
                      value={newCampaign.leadsExpected}
                      onChange={(e) => setNewCampaign(c => ({ ...c, leadsExpected: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Canales</label>
                  <input
                    type="text"
                    placeholder="Meta Ads + Google Search"
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign(c => ({ ...c, channel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}
