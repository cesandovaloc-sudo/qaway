import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, MessageSquare, RefreshCw, Layers, ShieldCheck, Target, Briefcase, Search, Bell, Plus, Zap, ChevronRight, Users, Settings2, ChevronDown } from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import { CRMProvider, useCRM } from './context/CRMContext'
import DashboardView from './components/DashboardView'
import KanbanView from './components/KanbanView'
import WhatsAppInboxView from './components/WhatsAppInboxView'
import CampaignsView from './components/CampaignsView'
import LeadsView from './components/LeadsView'
import ClientesView from './components/ClientesView'
import AutomatizacionesView from './components/AutomatizacionesView'
import TareasView from './components/TareasView'
import ConfiguracionView from './components/ConfiguracionView'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary atrapó un error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 h-screen w-full flex flex-col items-start justify-center overflow-auto">
          <h1 className="text-2xl font-bold mb-4">🚨 Error de React (Crasheo)</h1>
          <p className="mb-4">Por favor envíame el siguiente código de error para solucionarlo de inmediato:</p>
          <pre className="bg-red-100 p-4 rounded text-xs overflow-auto max-w-full font-mono">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ALL_TABS = [
  { id: 'dashboard',       label: 'Resumen',           icon: BarChart3    },
  { id: 'leads',           label: 'Leads',             icon: Users        },
  { id: 'kanban',          label: 'Pipeline',          icon: Layers       },
  { id: 'clientes',        label: 'Clientes',          icon: Briefcase    },
  { id: 'automatizaciones',label: 'Automatizaciones',  icon: Zap          },
  { id: 'tareas',          label: 'Tareas',            icon: Target       },
  { id: 'whatsapp',        label: 'Mensajes',          icon: MessageSquare },
  { id: 'campaigns',       label: 'Reportes',          icon: BarChart3    },
  { id: 'configuracion',   label: 'Configuración',     icon: Settings2    },
]

const ROLE_TABS = {
  management: ['dashboard', 'leads', 'kanban', 'clientes', 'automatizaciones', 'tareas', 'whatsapp', 'campaigns', 'configuracion'],
  marketing:  ['dashboard', 'leads', 'campaigns', 'automatizaciones', 'reportes'],
  sales:      ['dashboard', 'leads', 'kanban', 'clientes', 'tareas', 'whatsapp'],
}

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

function CRMContent() {
  const { simulateIncomingWebhook, currentRole, setCurrentRole } = useCRM()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [simulating, setSimulating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ALL_TABS.filter(t => ROLE_TABS[currentRole]?.includes(t.id))

  const ROLE_PROFILES = {
    management: { name: 'Andrés Valencia', title: 'Director Comercial', avatar: 'https://i.pravatar.cc/150?img=11' },
    marketing: { name: 'Sofía Castillo', title: 'Líder Marketing', avatar: 'https://i.pravatar.cc/150?img=47' },
    sales: { name: 'Martín Rojas', title: 'Ejecutivo Ventas', avatar: 'https://i.pravatar.cc/150?img=60' }
  }
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.management;

  useEffect(() => {
    if (!tabs.some(t => t.id === activeTab)) setActiveTab(tabs[0]?.id)
  }, [currentRole])

  const handleSimulate = () => {
    setSimulating(true)
    const leads = [
      { name: 'Alejandro Ruiz', whatsapp: '+51 966 333 444', email: 'alejandro@email.com', campaignId: 'camp-id-visual', campaignName: 'Curso Identidad Visual', lastMessage: 'Hola, vi el anuncio en Instagram. Me interesa el curso.', budget: 99, priority: 'high' },
      { name: 'Camila Torres',  whatsapp: '+51 988 777 666', email: 'camila@email.com',    campaignId: 'camp-notion',    campaignName: 'Plantilla Notion',       lastMessage: '¿Cómo puedo pagar la plantilla Notion?',                  budget: 49, priority: 'medium' },
    ]
    setTimeout(() => {
      simulateIncomingWebhook(leads[Math.floor(Math.random() * leads.length)])
      setSimulating(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden font-sans text-white selection:bg-[#ff4b0b] selection:text-white pt-[80px]">
      
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#111111]">
        
        {/* LOGO */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="text-xl font-bold tracking-tight">
            Qaway <span className="text-[#ff4b0b]">Lab</span>
            <span className="text-[#ff4b0b] ml-0.5 text-xs align-top">⌝</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left
                  ${isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-[#ff4b0b]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}

          <div className="my-6 mx-3 border-t border-white/10" />

          {/* SIMULATOR BUTTON */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${simulating ? 'animate-spin text-[#ff4b0b]' : ''}`} />
            <span>Simular Webhook</span>
          </button>
        </nav>

        {/* INSIGHTS WIDGET (From the design reference) */}
        <div className="p-4 shrink-0">
          <div className="relative rounded-lg border border-white/10 p-4 bg-[#18181b] overflow-hidden group hover:border-white/20 transition-colors cursor-pointer">
            {/* Decorative Corner Brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff4b0b] transition-all group-hover:w-3 group-hover:h-3" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ff4b0b] transition-all group-hover:w-3 group-hover:h-3" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ff4b0b] transition-all group-hover:w-3 group-hover:h-3" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ff4b0b] transition-all group-hover:w-3 group-hover:h-3" />
            
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#ff4b0b]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Insights con IA</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              Activa recomendaciones inteligentes basadas en tus datos comerciales.
            </p>
            <span className="text-[#ff4b0b] text-xs font-semibold flex items-center gap-1">
              Conocer más <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#111111]">
          {/* Lado Izquierdo: Navegación Principal */}
          <div className="flex items-center gap-8">
            {/* Global Nav (Áreas del Hub) */}
            <nav className="flex items-center gap-4 lg:gap-6">
              <a href="/hub/crm" className="text-white text-[13px] font-medium relative h-16 flex items-center">
                CRM
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ff4b0b]"></span>
              </a>
              <a href="/hub/marketing" className="text-white/50 hover:text-white transition-colors text-[13px] font-medium h-16 flex items-center">Marketing App</a>
              <a href="/hub/calculadoras" className="text-white/50 hover:text-white transition-colors text-[13px] font-medium h-16 flex items-center">Calculadoras Financieras</a>
              <a href="/academy" className="text-white/50 hover:text-white transition-colors text-[13px] font-medium h-16 flex items-center">Academy</a>
              <a href="/recursos" className="text-white/50 hover:text-white transition-colors text-[13px] font-medium h-16 flex items-center">Recursos</a>
            </nav>
          </div>

          {/* Search, Notifications, User & CTA */}
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contactos, empresas, oportunidades..." 
                className="bg-[#18181b] border border-white/10 rounded-md pl-9 pr-12 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff4b0b]/50 w-[300px] transition-colors" 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded text-white/40">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded text-white/40">K</kbd>
              </div>
            </div>
            
            <button className="relative text-white/50 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-[#111111]" />
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-2" />
            
            {/* Perfil del Usuario Dinámico */}
            <div className="flex items-center gap-3 relative cursor-pointer group">
              <img src={currentProfile.avatar} alt={currentProfile.name} className="w-9 h-9 rounded-full border border-white/10 object-cover" />
              <div className="flex flex-col justify-center">
                <span className="text-white text-[13px] font-semibold leading-tight">{currentProfile.name}</span>
                <span className="text-white/50 text-[11px] font-medium leading-tight">{currentProfile.title}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/50 ml-1" />
              
              {/* Fake Dropdown Selector (Invisible overlay over user profile) */}
              <select
                value={currentRole}
                onChange={e => setCurrentRole(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="management" className="text-black bg-white font-sans">Director Comercial</option>
                <option value="marketing" className="text-black bg-white font-sans">Líder Marketing</option>
                <option value="sales" className="text-black bg-white font-sans">Ejecutivo Ventas</option>
              </select>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2" />

            <button className="flex items-center gap-2 bg-[#ff4b0b] hover:bg-[#dc3d00] text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(255,75,11,0.2)]">
              <span>Nueva oportunidad</span>
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT (Light Gray Canvas) ────────────────────────── */}
        <main className="flex-1 bg-[#f5f5f4] overflow-y-auto text-[#191918] relative">
          {/* Subtle grid pattern for the background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative z-10 p-6 md:p-8 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentRole}-${activeTab}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'campaigns' && <CampaignsView />}
                {activeTab === 'kanban'    && <KanbanView />}
                {activeTab === 'whatsapp'  && <WhatsAppInboxView />}
                {activeTab === 'leads'     && <LeadsView />}
                {activeTab === 'clientes'  && <ClientesView />}
                {activeTab === 'automatizaciones' && <AutomatizacionesView />}
                {activeTab === 'tareas'    && <TareasView />}
                {activeTab === 'configuracion' && <ConfiguracionView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  )
}

export default function CRMPage() {
  useSetNavbarVariant('dark')
  return (
    <ErrorBoundary>
      <CRMProvider>
        <CRMContent />
      </CRMProvider>
    </ErrorBoundary>
  )
}
