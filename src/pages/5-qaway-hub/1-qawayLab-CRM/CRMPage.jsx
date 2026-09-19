import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, MessageSquare, RefreshCw, Layers, ShieldCheck, Target, Briefcase, Search, Bell, Plus, Zap, ChevronRight, Users, Settings2, ChevronDown, AlertCircle, X, Menu, Home } from 'lucide-react'
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
import { AppSwitcherDropdown } from '../5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'

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
    console.error("ErrorBoundary atrapó un error en CRM:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#111111] text-zinc-200 flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-amber-400/90">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Ocurrió un inconveniente temporal en el CRM</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Tus datos y conversaciones están protegidos en la nube. Puedes recargar este módulo o regresar al Hub central.
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-xs"
              >
                Recargar módulo
              </button>
              <a
                href="/hub"
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700/50"
              >
                Volver al Hub
              </a>
            </div>
            <details className="text-left mt-5 pt-4 border-t border-zinc-800/60">
              <summary className="text-[11px] text-zinc-500 hover:text-zinc-400 cursor-pointer select-none">
                Ver reporte técnico del sistema
              </summary>
              <pre className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-mono overflow-auto max-h-36">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
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
  const { 
    leads,
    simulateIncomingWebhook, 
    currentRole, 
    setCurrentRole, 
    setSelectedLeadId,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useCRM()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [simulating, setSimulating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      {
        name: 'Alejandro Ruiz',
        whatsapp: '+51 966 333 444',
        email: 'alejandro@email.com',
        campaignId: 'camp-id-visual',
        campaignName: 'Curso Identidad Visual (Meta Ads)',
        lastMessage: 'Hola, vi su anuncio en Instagram sobre el curso de identidad visual. ¿Tienen cupos?',
        budget: 99,
        priority: 'high',
        referral: {
          ad_id: 'ad_meta_238510928374',
          source_url: 'https://instagram.com/p/C9x81...',
          headline: '🎨 Masterclass Identidad Visual & Branding',
          media_type: 'image'
        }
      },
      {
        name: 'Camila Torres',
        whatsapp: '+51 988 777 666',
        email: 'camila@email.com',
        campaignId: 'camp-notion',
        campaignName: 'Plantilla Notion Pro',
        lastMessage: 'Hola, vi su anuncio en Facebook sobre el sistema Notion. ¿Cómo lo adquiero?',
        budget: 49,
        priority: 'medium',
        referral: {
          ad_id: 'ad_meta_984719283471',
          source_url: 'https://facebook.com/ads/...',
          headline: '⚡ Sistema Operativo Notion Pro para Empresas',
          media_type: 'video'
        }
      },
      {
        name: 'Mateo Sandoval',
        whatsapp: '+51 955 444 333',
        email: 'mateo@estudiodigital.pe',
        campaignId: 'camp-meta-1',
        campaignName: 'Qaway Lab_Ventas_Individuales',
        lastMessage: 'Hola, quiero una cotización de desarrollo web a medida para mi empresa.',
        budget: 450,
        priority: 'high',
        referral: {
          ad_id: 'ad_meta_554819283120',
          source_url: 'https://instagram.com/stories/...',
          headline: '🚀 Sistemas Web y Apps de Alto Rendimiento',
          media_type: 'video'
        }
      },
      {
        name: 'Camila Navarro',
        whatsapp: '+51 988 777 666',
        email: 'camila@corporativo.com',
        campaignId: 'camp-meta-1',
        campaignName: 'Qaway Lab_Ventas_Individuales',
        lastMessage: 'Hola, necesito hablar con un asesor humano para coordinar una reunión de consultoría.',
        budget: 950,
        priority: 'high',
        isHumanRequested: true,
        channel: 'whatsapp',
        referral: {
          ad_id: 'ad_meta_887192304918',
          source_url: 'https://facebook.com/ads/...',
          headline: '💼 Consultoría y Transformación Digital para Negocios',
          media_type: 'image'
        }
      }
    ]
    setTimeout(() => {
      simulateIncomingWebhook(leads[Math.floor(Math.random() * leads.length)])
      setSimulating(false)
    }, 1000)
  }

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden font-sans text-white selection:bg-[#ff4b0b] selection:text-white">
      
      {/* ── LEFT SIDEBAR (Dark Shell) ───────────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-white/10 bg-[#111111] transition-all duration-300 ease-in-out`}>
        
        {/* LOGO DE LA APP (Limpio y directo) */}
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10 shrink-0`}>
          <span className="text-xl font-bold tracking-tight">
            {isSidebarCollapsed ? (
              <span className="text-[#ff4b0b]">Q</span>
            ) : (
              <>Qaway <span className="text-[#ff4b0b]">CRM</span><span className="text-[#ff4b0b] ml-0.5 text-xs align-top">⌝</span></>
            )}
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className={`flex-1 py-6 ${isSidebarCollapsed ? 'px-2' : 'px-4'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isSidebarCollapsed ? tab.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all w-full text-left
                  ${isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b0b]' : ''}`} />
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            )
          })}

          <div className="my-6 mx-3 border-t border-white/10" />

          {/* SIMULATOR BUTTON */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            title={isSidebarCollapsed ? "Simular Webhook" : ""}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-all w-full text-left text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${simulating ? 'animate-spin text-[#ff4b0b]' : ''}`} />
            {!isSidebarCollapsed && <span className="truncate">Simular Webhook</span>}
          </button>
        </nav>

        {/* INSIGHTS WIDGET COLLAPSIBLE */}
        <div className={`p-4 shrink-0 flex ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
          <div className={`relative rounded-lg border border-white/10 bg-[#18181b] overflow-hidden group hover:border-white/20 transition-all duration-300 ease-in-out cursor-pointer ${isSidebarCollapsed ? 'w-10 h-10 flex items-center justify-center p-0 hover:max-h-12' : 'max-h-12 hover:max-h-40 w-full'}`}>
            {/* Decorative Corner Brackets (Only visible on hover and expanded) */}
            {!isSidebarCollapsed && (
              <>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
            
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full h-full' : 'gap-2 px-4 py-3.5'}`}>
              <Zap className={`text-[#ff4b0b] shrink-0 ${isSidebarCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />
              {!isSidebarCollapsed && <span className="text-[11px] font-bold uppercase tracking-widest text-white truncate transition-colors group-hover:text-[#ff4b0b]">Insights con IA</span>}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <p className="text-xs text-white/50 leading-relaxed mb-3">
                  Activa recomendaciones inteligentes basadas en tus datos comerciales.
                </p>
                <span className="text-[#ff4b0b] text-xs font-semibold flex items-center gap-1">
                  Conocer más <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER TOPBAR (Escalado al estilo Google Workspace / Altura amplia) */}
        <header className="h-[68px] border-b border-white/5 flex items-center justify-between px-5 lg:px-6 shrink-0 bg-[#111111] relative z-50 shadow-sm">
          
          {/* Lado Izquierdo: Toggle Sidebar, Waffle y App Home */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Botón Toggle Sidebar */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Menu className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
            </button>

            {/* Waffle App Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWaffleOpen(!isWaffleOpen)}
                className="group flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 transition-all duration-300 ease-out cursor-pointer"
                title="Ecosistema de Aplicaciones"
              >
                <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
                  {[...Array(9)].map((_, i) => (
                     <span
                      key={i}
                      className="w-[3px] h-[3px] rounded-full bg-white/70 group-hover:bg-[#ff4b0b] transition-colors"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-white max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">
                  Apps
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-transform duration-200" />
              </button>

              <AppSwitcherDropdown
                isOpen={isWaffleOpen}
                onClose={() => setIsWaffleOpen(false)}
              />
            </div>

            {/* Home Animado */}
            <div className="hidden sm:block">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="group flex items-center gap-2 h-10 px-3 rounded-full border border-transparent hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 ease-out cursor-pointer"
                title="Ir al Inicio (Dashboard)"
              >
                <Home className="w-5 h-5 shrink-0 group-hover:text-[#ff4b0b] transition-colors" />
                <span className="text-sm font-bold text-white max-w-0 overflow-hidden group-hover:max-w-[48px] transition-all duration-350 ease-out whitespace-nowrap">
                  Inicio
                </span>
              </button>
            </div>
          </div>

          {/* Search, CTA, Notifications & User */}
          <div className="flex items-center gap-3 lg:gap-5 relative">
            
            {/* 1. Buscador Omnibox con Command Palette */}
            <div className="relative block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'dashboard' ? "Buscar en base de datos..." :
                  activeTab === 'configuracion' ? "Buscar contactos globalmente..." :
                  "Buscar clientes u oportunidades..."
                } 
                className="bg-[#18181b] border border-white/10 rounded-full pl-10 pr-16 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#ff4b0b]/50 focus:bg-[#202024] w-[240px] md:w-[320px] lg:w-[420px] transition-all shadow-inner" 
              />
              {globalSearchQuery ? (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">⌘</kbd>
                  <kbd className="px-2 py-0.5 text-[11px] font-mono bg-white/10 rounded-md text-white/50 border border-white/5">K</kbd>
                </div>
              )}

              {/* Menú Flotante Global (Command Palette Dropdown) */}
              <AnimatePresence>
                {globalSearchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#1c1c1f] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
                  >
                    {(() => {
                      const query = globalSearchQuery.toLowerCase();
                      const searchResults = leads.filter(lead => 
                        (lead.name && lead.name.toLowerCase().includes(query)) ||
                        (lead.client_name && lead.client_name.toLowerCase().includes(query)) ||
                        (lead.email && lead.email.toLowerCase().includes(query)) ||
                        (lead.whatsapp && lead.whatsapp.includes(query))
                      ).slice(0, 5);

                      if (searchResults.length === 0) {
                        return (
                          <div className="p-6 text-center">
                            <p className="text-sm text-white/50 font-medium">No se encontraron resultados para "{globalSearchQuery}"</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col">
                          <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Resultados Rápidos</span>
                          </div>
                          <ul className="py-2">
                            {searchResults.map(lead => {
                              const titleName = lead.client_name || lead.name || 'Empresa';
                              const initials = titleName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'Q';
                              return (
                                <li key={lead.id}>
                                  <button
                                    onClick={() => {
                                      setGlobalSearchQuery('');
                                      if (setSelectedLeadId) setSelectedLeadId(lead.id);
                                      setActiveTab('whatsapp');
                                    }}
                                    className="w-full px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-4 text-left group"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[13px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20">
                                      {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff4b0b] transition-colors">{titleName}</p>
                                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                        <span className="truncate">{lead.whatsapp || lead.email}</span>
                                        <span className="px-1.5 py-0.5 rounded-sm bg-white/5 text-white/50">{lead.status || lead.stage}</span>
                                      </div>
                                    </div>
                                    <MessageSquare className="w-5 h-5 text-white/20 group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                            <span>Saltar directo al chat</span>
                            <span>Esc para cerrar</span>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-white/10" />

            {/* 2. Botón Primario de Creación (Equilibrado) */}
            <button 
              onClick={() => alert("Registro Manual de Leads: Próximamente se abrirá aquí el panel lateral para ingresar nuevos clientes a mano.")}
              className="flex items-center gap-2 bg-[#ff4b0b] hover:bg-[#dc3d00] text-white px-3.5 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-[0_0_15px_rgba(255,75,11,0.2)] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:block">Nueva oportunidad</span>
            </button>
            
            {/* 3. Campana / Notificaciones */}
            <button 
              onClick={() => alert("Centro de Notificaciones:\nAquí recibirás alertas cuando un nuevo Lead entre por Webhook, o cuando tu equipo te asigne una Tarea.")}
              className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1 cursor-pointer"
              title="Notificaciones (0)"
            >
              <Bell className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-[#111111]" />
            </button>
            
            {/* 4. Perfil del Usuario Estándar (Estilo Google) */}
            <div className="relative z-[100] ml-1">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 cursor-pointer p-1 lg:p-1.5 rounded-full hover:bg-white/5 transition-colors text-left border border-transparent focus:outline-none"
              >
                <img src={currentProfile.avatar} alt={currentProfile.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/10 object-cover" />
                <div className="hidden lg:flex flex-col justify-center">
                  <span className="text-white text-sm font-bold leading-none">{currentProfile.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Dropdown de Perfil Estándar (Manejado por Clic) */}
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                      aria-label="Cerrar perfil"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, originY: 0, originX: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[#18181b] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
                    >
                      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-4">
                        <img src={currentProfile.avatar} alt={currentProfile.name} className="w-12 h-12 rounded-full border border-white/10 object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{currentProfile.name}</p>
                          <p className="text-xs text-white/50 truncate mt-0.5">admin@qaway.pe</p>
                        </div>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">Gestionar tu cuenta</button>
                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium">Preferencias de CRM</button>
                      </div>
                      <div className="p-2 border-t border-white/5 bg-black/20">
                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors font-bold">Cerrar Sesión</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

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
                {activeTab === 'leads'     && (
                  <LeadsView 
                    onNavigateToChat={(leadId) => {
                      if (setSelectedLeadId) setSelectedLeadId(leadId)
                      setActiveTab('whatsapp')
                    }} 
                  />
                )}
                {activeTab === 'clientes'  && (
                  <ClientesView 
                    onNavigateToChat={(leadId) => {
                      if (setSelectedLeadId) setSelectedLeadId(leadId)
                      setActiveTab('whatsapp')
                    }} 
                  />
                )}
                {activeTab === 'automatizaciones' && <AutomatizacionesView />}
                {activeTab === 'tareas'    && (
                  <TareasView 
                    onNavigateToChat={(leadId) => {
                      if (setSelectedLeadId) setSelectedLeadId(leadId)
                      setActiveTab('whatsapp')
                    }} 
                  />
                )}
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
  return (
    <ErrorBoundary>
      <CRMProvider>
        <CRMContent />
      </CRMProvider>
    </ErrorBoundary>
  )
}
