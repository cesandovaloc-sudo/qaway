import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, MessageSquare, RefreshCw, Layers, ShieldCheck, Target, Briefcase, Search, Bell, Plus, Zap, ChevronRight, Users, Settings2, Settings, Sparkles, ChevronDown, AlertCircle, X, Menu, Home, LayoutGrid, Sun, Moon, Contrast } from 'lucide-react'
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
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { logoutUser } from '@/config/auth'

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
              <pre className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] text-zinc-400 font-mono overflow-auto max-h-36">
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
]

const ROLE_TABS = {
  management: ['dashboard', 'leads', 'kanban', 'clientes', 'automatizaciones', 'tareas', 'whatsapp', 'campaigns'],
  marketing:  ['dashboard', 'leads', 'campaigns', 'automatizaciones', 'reportes'],
  sales:      ['dashboard', 'leads', 'kanban', 'clientes', 'tareas', 'whatsapp'],
}

const displayFont = {
  fontFamily: "'Oswald', sans-serif",
  fontStretch: 'condensed',
}

function CRMContent() {
  const { 
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    activeTenant,
    leads,
    simulateIncomingWebhook, 
    currentRole, 
    setCurrentRole, 
    setSelectedLeadId,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useCRM()
  const searchInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [simulating, setSimulating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [isTenantOpen, setIsTenantOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const [themeMode, setThemeMode] = useState(() => {
    const raw = localStorage.getItem('qaway.hubTheme')
    if (raw === 'blanco' || raw === 'grises' || raw === 'contraste' || raw === 'oscuro') return raw
    return 'contraste'
  })

  useEffect(() => {
    localStorage.setItem('qaway.hubTheme', themeMode)
    document.documentElement.style.colorScheme = (themeMode === 'oscuro') ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', themeMode)
    document.documentElement.setAttribute('data-mode', themeMode)
    if (themeMode === 'oscuro') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    window.dispatchEvent(new CustomEvent('qaway-theme-change', { detail: themeMode }))
  }, [themeMode])

  const isChromeDark = themeMode === 'contraste' || themeMode === 'oscuro'
  const isCanvasDark = themeMode === 'oscuro'
  const isDark = isChromeDark

  const handleLogout = async () => {
    logoutUser()
    try {
      const sb = getSupabaseClient()
      if (sb) await sb.auth.signOut()
    } catch (_) {}
    navigate('/login', { replace: true })
  }

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
    <div data-mode={themeMode} className={`hub-shell flex h-screen w-full overflow-hidden font-sans transition-colors duration-200 selection:bg-[#ff4b0b] selection:text-white ${isChromeDark ? 'bg-[#111111] text-white' : 'bg-[#f8f9fa] text-zinc-900'}`}>
      
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isDark ? 'border-r border-white/10 bg-[#111111]' : 'border-r border-zinc-200 bg-white'}`}>
        
        {/* LOGO - Redirección a Inicio */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`h-[72px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} shrink-0 cursor-pointer transition-colors group w-full ${isDark ? 'border-b border-white/10 hover:bg-white/5' : 'border-b border-zinc-200 hover:bg-zinc-50'}`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-bold tracking-wide text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {isSidebarCollapsed ? (
                <span className="text-[#ff4b0b]">Q</span>
              ) : (
                <>{activeTenant?.name || currentProfile.company || "Qaway Lab"} <span className="text-[#ff4b0b]">CRM</span></>
              )}
            </span>
          </div>
        </button>

        {/* NAVIGATION */}
        <nav className={`flex-1 py-4 ${isSidebarCollapsed ? 'px-2' : 'px-3'} flex flex-col gap-1 overflow-y-auto custom-scrollbar`}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isSidebarCollapsed ? tab.label : ''}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-[13.5px] font-medium transition-all w-full text-left ${
                  isActive 
                    ? (isDark ? 'bg-white/10 text-white font-semibold' : 'bg-zinc-900 text-white shadow-xs font-semibold') 
                    : (isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100')
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b0b]' : (isDark ? 'text-white/40 group-hover:text-white/70' : 'text-zinc-400 group-hover:text-zinc-600')}`} />
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* ZONA INFERIOR DEL SIDEBAR (Configuración & Webhook) */}
        <div className={`p-3 flex flex-col gap-1 ${isDark ? 'border-t border-white/10' : 'border-t border-zinc-200'}`}>
          {/* Simular Webhook (Dev Tools) */}
          <button 
            onClick={handleSimulate}
            disabled={simulating}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium group ${
              isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            } ${isSidebarCollapsed ? "justify-center" : ""}`}
            title={isSidebarCollapsed ? "Simular Entrada (Webhook)" : undefined}
          >
            <RefreshCw className={`w-4 h-4 group-hover:text-[#ff4b0b] transition-colors ${
              simulating ? "animate-spin text-[#ff4b0b]" : ""
            }`} />
            {!isSidebarCollapsed && (
              <span className="truncate">Simular Webhook</span>
            )}
          </button>

          {/* Módulo de Configuración */}
          <button 
            onClick={() => setActiveTab('configuracion')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-medium ${
              activeTab === 'configuracion'
                ? (isDark ? 'bg-white/10 text-white font-semibold' : 'bg-zinc-900 text-white shadow-xs font-semibold')
                : (isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100')
            } ${isSidebarCollapsed ? "justify-center" : ""}`}
            title={isSidebarCollapsed ? "Configuración" : undefined}
          >
            <Settings className={`w-4 h-4 transition-colors ${
              activeTab === 'configuracion' ? "text-[#ff4b0b]" : (isDark ? 'text-white/40 group-hover:text-white/70' : 'text-zinc-400 group-hover:text-zinc-600')
            }`} />
            {!isSidebarCollapsed && (
              <span className="truncate">Configuración</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER TOPBAR */}
        <header className={`h-[72px] border-b flex items-center justify-between px-5 lg:px-6 shrink-0 relative z-50 transition-colors duration-200 ${
          isDark 
            ? 'border-white/10 bg-[#111111] text-white shadow-sm' 
            : 'border-zinc-200 bg-white/95 backdrop-blur-md text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
        }`}>
          
          {/* Lado Izquierdo: Toggle Sidebar, Waffle y App Home */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Botón Toggle Sidebar */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-xl transition-colors ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Waffle App Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWaffleOpen(!isWaffleOpen)}
                className={`group flex items-center gap-2 h-10 px-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
                  isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80' : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700'
                }`}
                title="Ecosistema de Aplicaciones"
              >
                <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
                  {[...Array(9)].map((_, i) => (
                     <span
                      key={i}
                      className={`w-[3px] h-[3px] rounded-full transition-colors ${isDark ? 'bg-white/70 group-hover:bg-[#ff4b0b]' : 'bg-zinc-600 group-hover:bg-[#ff4b0b]'}`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                  Apps
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-white/40 group-hover:text-white/80' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
              </button>

              <AppSwitcherDropdown
                isOpen={isWaffleOpen}
                onClose={() => setIsWaffleOpen(false)}
              />
            </div>

            {/* Home Animado */}
            <div className="hidden sm:block">
              <button 
                onClick={() => navigate('/hub/panel')}
                className={`group flex items-center gap-2 h-10 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isDark ? 'border-transparent hover:bg-white/5 text-white/70 hover:text-white' : 'border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
                }`}
                title="Volver al Panel del Hub (/hub/panel)"
              >
                <Home className={`w-4 h-4 shrink-0 transition-colors ${isDark ? 'text-white/60 group-hover:text-[#ff4b0b]' : 'text-zinc-500 group-hover:text-[#ff4b0b]'}`} />
                <span className={`text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-[48px] transition-all duration-350 ease-out whitespace-nowrap ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                  Inicio
                </span>
              </button>
            </div>

            {/* Selector Multi-Tenant de Marca / Empresa */}
            {tenants && tenants.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTenantOpen((o) => !o)}
                  className={`flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/20 cursor-pointer transition-all shadow-2xs ${
                    isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800'
                  }`}
                  title="Cambiar Marca / Tenant Activo"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-40 truncate">{selectedTenantId === 'all' ? 'Todas las Marcas' : (tenants.find((t) => t.id === selectedTenantId)?.name || 'Todas las Marcas')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-white/40' : 'text-zinc-400'} ${isTenantOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isTenantOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTenantOpen(false)} aria-label="Cerrar selector de marca" />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl border shadow-2xl z-[100] overflow-hidden ${
                          isDark ? 'bg-[#18181b] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                        }`}
                      >
                        <div className={`p-4 border-b ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-100 bg-zinc-50'}`}>
                          <p className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cambiar de marca</p>
                          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/50' : 'text-zinc-500'}`}>Las vistas se filtran por la marca activa.</p>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                          {tenants.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => { setSelectedTenantId(t.id); setIsTenantOpen(false) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors ${
                                selectedTenantId === t.id 
                                  ? (isDark ? 'bg-orange-500/15 text-orange-300' : 'bg-orange-50 text-orange-700') 
                                  : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900')
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedTenantId === t.id ? 'bg-orange-500' : (isDark ? 'bg-white/20' : 'bg-zinc-300')}`} />
                              <span className="truncate">{t.name}</span>
                              <span className={`ml-auto text-[10px] font-semibold shrink-0 ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>{t.client_code}</span>
                            </button>
                          ))}
                        </div>
                        <div className={`p-2 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-zinc-100 bg-zinc-50'}`}>
                          <button
                            type="button"
                            onClick={() => { setSelectedTenantId('all'); setIsTenantOpen(false) }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                              selectedTenantId === 'all' 
                                ? (isDark ? 'text-orange-300 font-extrabold' : 'text-orange-700 font-extrabold') 
                                : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900')
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedTenantId === 'all' ? 'bg-orange-500' : (isDark ? 'bg-white/20' : 'bg-zinc-300')}`} />
                            Todas las Marcas
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Search, CTA, Notifications & User */}
          <div className="flex items-center gap-3 lg:gap-4 relative">
            
            {/* 1. Buscador Omnibox con Command Palette */}
            <div className="relative block">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-zinc-400'}`} />
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
                className={`border rounded-xl pl-10 pr-16 h-10 text-sm focus:outline-none focus:border-[#ff4b0b] focus:ring-2 focus:ring-[#ff4b0b]/20 w-[220px] md:w-[280px] lg:w-[360px] transition-all ${
                  isDark 
                    ? 'bg-[#18181b] border-white/10 text-white placeholder:text-white/40 focus:bg-[#202024]' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                }`} 
              />
              {globalSearchQuery ? (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-zinc-400 hover:text-zinc-700'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${isDark ? 'bg-white/10 border-white/5 text-white/50' : 'bg-zinc-200/60 border-zinc-300/50 text-zinc-500'}`}>⌘</kbd>
                  <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${isDark ? 'bg-white/10 border-white/5 text-white/50' : 'bg-zinc-200/60 border-zinc-300/50 text-zinc-500'}`}>K</kbd>
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
                    className={`absolute top-[calc(100%+8px)] left-0 w-full border rounded-2xl shadow-2xl z-[100] overflow-hidden ${
                      isDark ? 'bg-[#1c1c1f] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
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
                            <p className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-zinc-500'}`}>No se encontraron resultados para "{globalSearchQuery}"</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col">
                          <div className={`px-4 py-2.5 border-b ${isDark ? 'border-white/5 bg-white/5 text-white/50' : 'border-zinc-100 bg-zinc-50 text-zinc-500'}`}>
                            <span className="text-[11px] font-bold uppercase tracking-wider">Resultados Rápidos</span>
                          </div>
                          <ul className="py-1">
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
                                    className={`w-full px-4 py-2.5 transition-colors flex items-center gap-3 text-left group ${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'}`}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[12px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20">
                                      {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-semibold truncate group-hover:text-[#ff4b0b] transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>{titleName}</p>
                                      <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/40' : 'text-zinc-500'}`}>
                                        <span className="truncate">{lead.whatsapp || lead.email}</span>
                                        <span className={`px-1.5 py-0.5 rounded-sm text-[10px] ${isDark ? 'bg-white/5 text-white/50' : 'bg-zinc-100 text-zinc-600'}`}>{lead.status || lead.stage}</span>
                                      </div>
                                    </div>
                                    <MessageSquare className={`w-4 h-4 group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0 ${isDark ? 'text-white/20' : 'text-zinc-400'}`} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                          <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] ${isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}>
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

            <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />

            {/* 2. Botón Primario de Creación (Equilibrado 40px) */}
            <button 
              onClick={() => alert("Registro Manual de Leads: Próximamente se abrirá aquí el panel lateral para ingresar nuevos clientes a mano.")}
              className="flex items-center gap-2 bg-[#ff4b0b] hover:bg-[#e03f06] text-white px-3.5 h-10 rounded-xl text-[13px] font-bold transition-all shadow-[0_2px_8px_rgba(255,75,11,0.25)] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:block">Nueva oportunidad</span>
            </button>
            
            {/* 3. Campana / Notificaciones */}
            <button 
              onClick={() => alert("Centro de Notificaciones:\nAquí recibirás alertas cuando un nuevo Lead entre por Webhook, o cuando tu equipo te asigne una Tarea.")}
              className={`relative p-2 rounded-xl transition-colors ml-1 cursor-pointer ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
              title="Notificaciones (0)"
            >
              <Bell className="w-5 h-5" />
              <span className={`absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ${isDark ? 'ring-[#111111]' : 'ring-white'}`} />
            </button>
            
            {/* 4. Perfil del Usuario Estándar con Selector de Tema */}
            <div className="relative z-[100] ml-1">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 cursor-pointer p-1 rounded-xl transition-colors text-left border border-transparent focus:outline-none ${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`}
              >
                <img src={currentProfile.avatar} alt={currentProfile.name} className={`w-8 h-8 rounded-full border object-cover ${isDark ? 'border-white/10' : 'border-zinc-200'}`} />
                <div className="hidden lg:flex flex-col justify-center">
                  <span className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>{currentProfile.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 hidden lg:block transition-transform duration-200 ${isDark ? 'text-white/50' : 'text-zinc-400'} ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de Perfil Estándar */}
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
                      className={`absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl shadow-2xl z-[100] overflow-hidden border ${
                        isDark ? 'bg-[#18181b] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-white/5 bg-white/5' : 'border-zinc-100 bg-zinc-50'}`}>
                        <img src={currentProfile.avatar} alt={currentProfile.name} className={`w-10 h-10 rounded-full border object-cover shrink-0 ${isDark ? 'border-white/10' : 'border-zinc-200'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{currentProfile.name}</p>
                          <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-white/50' : 'text-zinc-500'}`}>admin@qaway.pe</p>
                        </div>
                      </div>
                      
                      {/* Opciones CRM Reales */}
                      <div className="p-1.5 flex flex-col gap-0.5">
                        <button className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-lg transition-colors font-medium ${isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                          Preferencias de Cuenta
                        </button>
                        <button className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-lg transition-colors font-medium ${isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                          Usuarios y Roles
                        </button>
                        <button className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-lg transition-colors font-medium ${isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                          Integraciones (Meta/WA)
                        </button>
                        <button className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-lg transition-colors font-medium ${isDark ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                          Suscripción y Pagos
                        </button>
                      </div>

                      {/* Selector de Tema (Regla idéntica a Inventario / Hub) */}
                      <div className={`h-px my-1 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-zinc-500'}`}>Tema</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setThemeMode('blanco')}
                            title="Blanco Puro (Inventi Pro)"
                            aria-label="Tema blanco puro"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              themeMode === 'blanco' 
                                ? (isDark ? 'text-white bg-white/20' : 'text-zinc-900 bg-zinc-200') 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')
                            }`}
                          >
                            <Sun size={14} />
                          </button>
                          <button
                            onClick={() => setThemeMode('grises')}
                            title="Escala de Grises"
                            aria-label="Tema escala de grises"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              themeMode === 'grises' 
                                ? (isDark ? 'text-white bg-white/20' : 'text-zinc-900 bg-zinc-200') 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')
                            }`}
                          >
                            <Layers size={14} />
                          </button>
                          <button
                            onClick={() => setThemeMode('contraste')}
                            title="Claro-Oscuro (Contraste)"
                            aria-label="Tema contraste"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              themeMode === 'contraste' 
                                ? (isDark ? 'text-white bg-white/20' : 'text-zinc-900 bg-zinc-200') 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')
                            }`}
                          >
                            <Contrast size={14} />
                          </button>
                          <button
                            onClick={() => setThemeMode('oscuro')}
                            title="Modo Oscuro (Canónico)"
                            aria-label="Tema oscuro"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              themeMode === 'oscuro' 
                                ? (isDark ? 'text-white bg-white/20' : 'text-zinc-900 bg-zinc-200') 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100')
                            }`}
                          >
                            <Moon size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className={`p-1.5 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-zinc-100 bg-zinc-50'}`}>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center px-3.5 py-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-bold cursor-pointer"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ── MAIN CONTENT (Lienzo Maestro: 100% Fluido como Inventario) ─────────── */}
        <main className={`flex-1 overflow-y-auto relative transition-colors duration-200 ${isCanvasDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
          <div className="relative z-10 p-6 md:p-8 min-h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentRole}-${activeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ transform: 'none' }}
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

        {/* FLOATING ACTION BUTTONS (IA & Chatbot) en la Esquina Inferior Derecha */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          
          {/* Botón de Asistente IA (Insights Flotante) */}
          <button
            onClick={() => alert("Próximamente: Panel de Insights y Asistente Predictivo con Inteligencia Artificial.")}
            className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.6)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/10"
            title="Qaway IA Insights"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute right-full mr-4 bg-[#18181b] border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
              Insights con IA
            </span>
          </button>

          {/* Botón de Chatbot de Soporte */}
          <button
            onClick={() => alert("Próximamente: Chatbot de Soporte y Ayuda Integrado.")}
            className="group relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-[#ff4b0b] text-white shadow-[0_8px_30px_rgba(255,75,11,0.4)] hover:shadow-[0_8px_40px_rgba(255,75,11,0.6)] hover:-translate-y-1 transition-all duration-300 ease-out border border-white/20"
            title="Chatbot de Ayuda"
          >
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute right-full mr-4 bg-[#18181b] border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
              Soporte / Chatbot
            </span>
          </button>

        </div>

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
