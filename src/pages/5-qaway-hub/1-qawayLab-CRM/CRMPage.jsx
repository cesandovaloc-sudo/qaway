import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, MessageSquare, RefreshCw, Layers, ShieldCheck, Target, Briefcase, Search, Bell, Plus, Zap, ChevronRight, Users, Settings2, Settings, Sparkles, ChevronDown, AlertCircle, X, Menu, Home, LayoutGrid } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [simulating, setSimulating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [isTenantOpen, setIsTenantOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

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
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans text-zinc-900 selection:bg-[#ff4b0b] selection:text-white">
      
      {/* ── LEFT SIDEBAR (Clean Light Shell) ─────────────────────────── */}
      <aside className={`${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} shrink-0 flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out`}>
        
        {/* LOGO - Redirección a Inicio */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-zinc-200 shrink-0 cursor-pointer hover:bg-zinc-50 transition-colors group w-full`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 tracking-wide text-lg">
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
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-[13.5px] font-medium transition-all w-full text-left
                  ${isActive 
                    ? 'bg-zinc-900 text-white shadow-xs font-semibold' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ff4b0b]' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* ZONA INFERIOR DEL SIDEBAR (Configuración & Webhook) */}
        <div className="p-3 border-t border-zinc-200 flex flex-col gap-1">
          {/* Simular Webhook (Dev Tools) */}
          <button 
            onClick={handleSimulate}
            disabled={simulating}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-[13px] font-medium group ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
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
                ? "bg-zinc-900 text-white shadow-xs font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            } ${isSidebarCollapsed ? "justify-center" : ""}`}
            title={isSidebarCollapsed ? "Configuración" : undefined}
          >
            <Settings className={`w-4 h-4 transition-colors ${
              activeTab === 'configuracion' ? "text-[#ff4b0b]" : "text-zinc-400 group-hover:text-zinc-600"
            }`} />
            {!isSidebarCollapsed && (
              <span className="truncate">Configuración</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── RIGHT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER TOPBAR (Estandarizado a 64px, fondo blanco limpio) */}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-5 lg:px-6 shrink-0 bg-white/95 backdrop-blur-md relative z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          
          {/* Lado Izquierdo: Toggle Sidebar, Waffle y App Home */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Botón Toggle Sidebar */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Waffle App Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWaffleOpen(!isWaffleOpen)}
                className="group flex items-center gap-2 h-[38px] px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 transition-all duration-200 cursor-pointer shadow-2xs"
                title="Ecosistema de Aplicaciones"
              >
                <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
                  {[...Array(9)].map((_, i) => (
                     <span
                      key={i}
                      className="w-[3px] h-[3px] rounded-full bg-zinc-600 group-hover:bg-[#ff4b0b] transition-colors"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-800 max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">
                  Apps
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200" />
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
                className="group flex items-center gap-2 h-[38px] px-3 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-all duration-200 cursor-pointer"
                title="Volver al Panel del Hub (/hub/panel)"
              >
                <Home className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-[#ff4b0b] transition-colors" />
                <span className="text-sm font-bold text-zinc-800 max-w-0 overflow-hidden group-hover:max-w-[48px] transition-all duration-350 ease-out whitespace-nowrap">
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
                  className="flex items-center gap-2 h-[38px] px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/20 cursor-pointer transition-all shadow-2xs"
                  title="Cambiar Marca / Tenant Activo"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-40 truncate">{selectedTenantId === 'all' ? 'Todas las Marcas' : (tenants.find((t) => t.id === selectedTenantId)?.name || 'Todas las Marcas')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isTenantOpen ? 'rotate-180 text-zinc-700' : ''}`} />
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
                        className="absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-white border border-zinc-200 shadow-2xl z-[100] overflow-hidden"
                      >
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                          <p className="text-xs font-extrabold text-zinc-900">Cambiar de marca</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Las vistas se filtran por la marca activa.</p>
                        </div>
                        <div className="p-2 max-h-64 overflow-y-auto">
                          {tenants.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => { setSelectedTenantId(t.id); setIsTenantOpen(false) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors ${selectedTenantId === t.id ? 'bg-orange-50 text-orange-700' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedTenantId === t.id ? 'bg-orange-500' : 'bg-zinc-300'}`} />
                              <span className="truncate">{t.name}</span>
                              <span className="ml-auto text-[10px] font-semibold text-zinc-400 shrink-0">{t.client_code}</span>
                            </button>
                          ))}
                        </div>
                        <div className="p-2 border-t border-zinc-100 bg-zinc-50">
                          <button
                            type="button"
                            onClick={() => { setSelectedTenantId('all'); setIsTenantOpen(false) }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedTenantId === 'all' ? 'text-orange-700 font-extrabold' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedTenantId === 'all' ? 'bg-orange-500' : 'bg-zinc-300'}`} />
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
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
                className="bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-16 h-[38px] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#ff4b0b] focus:ring-2 focus:ring-[#ff4b0b]/20 focus:bg-white w-[220px] md:w-[280px] lg:w-[360px] transition-all" 
              />
              {globalSearchQuery ? (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200/60 rounded text-zinc-500 border border-zinc-300/50">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200/60 rounded text-zinc-500 border border-zinc-300/50">K</kbd>
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
                    className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
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
                            <p className="text-sm text-zinc-500 font-medium">No se encontraron resultados para "{globalSearchQuery}"</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col">
                          <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Resultados Rápidos</span>
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
                                    className="w-full px-4 py-2.5 hover:bg-zinc-50 transition-colors flex items-center gap-3 text-left group"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#ff4b0b]/10 text-[#ff4b0b] font-bold text-[12px] flex items-center justify-center shrink-0 border border-[#ff4b0b]/20">
                                      {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-zinc-900 truncate group-hover:text-[#ff4b0b] transition-colors">{titleName}</p>
                                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span className="truncate">{lead.whatsapp || lead.email}</span>
                                        <span className="px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 text-[10px]">{lead.status || lead.stage}</span>
                                      </div>
                                    </div>
                                    <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-[#ff4b0b] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
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

            <div className="h-6 w-px bg-zinc-200" />

            {/* 2. Botón Primario de Creación (Equilibrado 38px) */}
            <button 
              onClick={() => alert("Registro Manual de Leads: Próximamente se abrirá aquí el panel lateral para ingresar nuevos clientes a mano.")}
              className="flex items-center gap-2 bg-[#ff4b0b] hover:bg-[#e03f06] text-white px-3.5 h-[38px] rounded-xl text-[13px] font-bold transition-all shadow-[0_2px_8px_rgba(255,75,11,0.25)] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:block">Nueva oportunidad</span>
            </button>
            
            {/* 3. Campana / Notificaciones */}
            <button 
              onClick={() => alert("Centro de Notificaciones:\nAquí recibirás alertas cuando un nuevo Lead entre por Webhook, o cuando tu equipo te asigne una Tarea.")}
              className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors ml-1 cursor-pointer"
              title="Notificaciones (0)"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4b0b] rounded-full ring-2 ring-white" />
            </button>
            
            {/* 4. Perfil del Usuario Estándar */}
            <div className="relative z-[100] ml-1">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-zinc-100 transition-colors text-left border border-transparent focus:outline-none"
              >
                <img src={currentProfile.avatar} alt={currentProfile.name} className="w-8 h-8 rounded-full border border-zinc-200 object-cover" />
                <div className="hidden lg:flex flex-col justify-center">
                  <span className="text-zinc-900 text-sm font-bold leading-none">{currentProfile.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 hidden lg:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-zinc-700' : ''}`} />
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
                      className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                      <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                        <img src={currentProfile.avatar} alt={currentProfile.name} className="w-10 h-10 rounded-full border border-zinc-200 object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{currentProfile.name}</p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">admin@qaway.pe</p>
                        </div>
                      </div>
                      
                      {/* Opciones CRM Reales */}
                      <div className="p-1.5 flex flex-col gap-0.5">
                        <button className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                          Preferencias de Cuenta
                        </button>
                        <button className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                          Usuarios y Roles
                        </button>
                        <button className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                          Integraciones (Meta/WA)
                        </button>
                        <button className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium">
                          Suscripción y Pagos
                        </button>
                      </div>
                      
                      <div className="p-1.5 border-t border-zinc-100 bg-zinc-50">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center px-3.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-bold cursor-pointer"
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

        {/* ── MAIN CONTENT (Lienzo Maestro: Fondo neutro suave #f8f9fa) ─────────── */}
        <main className="flex-1 bg-[#f8f9fa] overflow-y-auto text-zinc-900 relative">
          <div className="relative z-10 p-6 md:p-8 min-h-full max-w-[1600px] mx-auto">
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
