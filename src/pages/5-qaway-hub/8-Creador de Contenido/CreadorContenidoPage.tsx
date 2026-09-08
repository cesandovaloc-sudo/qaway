import React, { useState, useEffect } from 'react'
import {
  DEFAULT_TENANTS,
  INITIAL_COMPETITORS,
  INITIAL_SCRIPTS,
  INITIAL_CAROUSELS,
  INITIAL_LEAD_MAGNETS,
  INITIAL_TASKS
} from './data/defaultContent'
import {
  TenantWorkspace,
  CompetitorVideo,
  ScriptItem,
  CarouselDeck,
  LeadMagnetResource,
  CreatorTask,
  ContentFormat,
  ContentStatus
} from './types/content.types'
import { ExecutiveDashboard } from './components/ExecutiveDashboard'
import { RadarIdeas } from './components/RadarIdeas'
import { ScriptStudio } from './components/ScriptStudio'
import { MatrixDistribution } from './components/MatrixDistribution'
import { ContentCalendar } from './components/ContentCalendar'
import { AssetStudio } from './components/AssetStudio'
import { useSetNavbarVariant } from '@/components/layout/Navbar'
import {
  LayoutDashboard,
  Eye,
  PenTool,
  Layers,
  Calendar,
  BookOpen,
  Plus,
  Building2,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  ChevronDown,
  Workflow,
  Sparkles
} from 'lucide-react'

const STORAGE_KEY_TENANTS = 'qaway_creator_tenants_v4'
const STORAGE_KEY_SCRIPTS = 'qaway_creator_scripts_v4'
const STORAGE_KEY_COMPETITORS = 'qaway_creator_competitors_v4'
const STORAGE_KEY_TASKS = 'qaway_creator_tasks_v4'

export default function CreadorContenidoPage() {
  // Conectar con el Navbar oficial de Qaway Lab
  useSetNavbarVariant('brand')

  // 1. Marcas / Espacios de trabajo (Tenants)
  const [tenants, setTenants] = useState<TenantWorkspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TENANTS)
      return saved ? JSON.parse(saved) : DEFAULT_TENANTS
    } catch {
      return DEFAULT_TENANTS
    }
  })
  const [activeTenantId, setActiveTenantId] = useState<string>(tenants[0]?.id || 'tenant-qaway')

  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0]

  // 2. Estado de Usuario & Sesión
  const [userProfile] = useState({
    name: 'Leo Sandoval',
    email: 'leo@qawaylab.com',
    role: 'Director Creativo',
    avatarInitials: 'LS'
  })
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true)

  // 3. Datos del creador
  const [allCompetitors, setAllCompetitors] = useState<CompetitorVideo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPETITORS)
      return saved ? JSON.parse(saved) : INITIAL_COMPETITORS
    } catch {
      return INITIAL_COMPETITORS
    }
  })

  const [allScripts, setAllScripts] = useState<ScriptItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCRIPTS)
      return saved ? JSON.parse(saved) : INITIAL_SCRIPTS
    } catch {
      return INITIAL_SCRIPTS
    }
  })

  const [allTasks, setAllTasks] = useState<CreatorTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS)
      return saved ? JSON.parse(saved) : INITIAL_TASKS
    } catch {
      return INITIAL_TASKS
    }
  })

  const [carousels] = useState<CarouselDeck[]>(INITIAL_CAROUSELS)
  const [leadMagnets] = useState<LeadMagnetResource[]>(INITIAL_LEAD_MAGNETS)

  // 4. Navegación
  type ActiveTab = 'dashboard' | 'radar' | 'script' | 'matrix' | 'calendar' | 'assets'
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [activeScriptId, setActiveScriptId] = useState<string>('')

  // Modal para agregar otra marca/cliente
  const [showNewBrandModal, setShowNewBrandModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandNiche, setNewBrandNiche] = useState('')

  // Filtrar según marca activa
  const tenantCompetitors = allCompetitors.filter(c => c.tenantId === activeTenantId)
  const tenantScripts = allScripts.filter(s => s.tenantId === activeTenantId)
  const tenantTasks = allTasks.filter(t => t.tenantId === activeTenantId)

  useEffect(() => {
    if (tenantScripts.length > 0 && !tenantScripts.some(s => s.id === activeScriptId)) {
      setActiveScriptId(tenantScripts[0].id)
    }
  }, [activeTenantId, tenantScripts, activeScriptId])

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TENANTS, JSON.stringify(tenants))
      localStorage.setItem(STORAGE_KEY_SCRIPTS, JSON.stringify(allScripts))
      localStorage.setItem(STORAGE_KEY_COMPETITORS, JSON.stringify(allCompetitors))
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(allTasks))
    } catch (e) {
      console.error('Error saving data', e)
    }
  }, [tenants, allScripts, allCompetitors, allTasks])

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setAllTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    )
  }

  const handleAddCompetitor = (newComp: CompetitorVideo) => {
    setAllCompetitors(prev => [{ ...newComp, tenantId: activeTenantId }, ...prev])
  }

  const handleSendToScript = (idea: { title: string; hook: string; thesis: string; format: ContentFormat }) => {
    const newScript: ScriptItem = {
      id: `script-${Date.now()}`,
      tenantId: activeTenantId,
      title: idea.title,
      format: idea.format,
      platform: 'instagram',
      hook: {
        text: idea.hook,
        variant: 'curiosidad',
        durationSec: 3.5,
        wordCount: idea.hook.split(' ').length
      },
      retentionBridge: 'El 90% comete un error clave en este punto. Aquí te enseño cómo resolverlo.',
      coreBody: idea.thesis,
      cta: {
        text: 'Comenta la palabra SKILL y te paso el sistema completo por DM.',
        triggerKeyword: 'SKILL',
        leadMagnetName: 'Guía de Creación Modular'
      },
      descriptionCopy: `Nuevo video: ${idea.title}. Comenta SKILL para enviarte los recursos.`,
      status: 'guion_aprobado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setAllScripts(prev => [newScript, ...prev])
    setActiveScriptId(newScript.id)
    setActiveTab('script')
  }

  const handleSaveScript = (updatedScript: ScriptItem) => {
    setAllScripts(prev =>
      prev.map(s => (s.id === updatedScript.id ? { ...updatedScript, tenantId: activeTenantId } : s))
    )
  }

  const handleSendToMatrix = (script: ScriptItem) => {
    setActiveScriptId(script.id)
    setActiveTab('matrix')
  }

  const handleAddToCalendar = (item: { title: string; hook: string; format: any }) => {
    const newScript: ScriptItem = {
      id: `script-var-${Date.now()}`,
      tenantId: activeTenantId,
      title: item.title,
      format: item.format || 'reel',
      platform: 'instagram',
      hook: {
        text: item.hook,
        variant: 'resultado_especifico',
        durationSec: 3.2,
        wordCount: item.hook.split(' ').length
      },
      retentionBridge: 'Puente modular reutilizado.',
      coreBody: 'Cuerpo modular reutilizado.',
      cta: {
        text: 'Comenta SKILL y te lo envío por DM.',
        triggerKeyword: 'SKILL',
        leadMagnetName: 'Recurso Qaway'
      },
      descriptionCopy: `Variante: ${item.title}`,
      status: 'listo_grabar',
      scheduledDate: '2026-09-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setAllScripts(prev => [newScript, ...prev])
    setActiveTab('calendar')
  }

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName) return
    const newBrand: TenantWorkspace = {
      id: `tenant-${Date.now()}`,
      name: newBrandName,
      slug: newBrandName.toLowerCase().replace(/\s+/g, '-'),
      niche: newBrandNiche || 'General',
      brandVoice: 'Profesional, directo y educativo.',
      tier: 'creator_pro',
      limits: {
        maxMonthlyPieces: 30,
        maxCompetitors: 10,
        maxLeadMagnets: 5,
        manyChatEnabled: true
      },
      currentMonthProgress: {
        planned: 30,
        recorded: 0,
        published: 0,
        targetMonth: 'Septiembre 2026'
      }
    }
    setTenants(prev => [...prev, newBrand])
    setActiveTenantId(newBrand.id)
    setShowNewBrandModal(false)
    setNewBrandName('')
    setNewBrandNiche('')
  }

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión de Qaway Content Studio?')) {
      sessionStorage.removeItem('qaway_auth_token')
      localStorage.removeItem('qaway_auth_token')
      window.location.href = '/hub'
    }
  }

  // Elementos de navegación del Panel Izquierdo
  const navItems = [
    {
      key: 'dashboard' as ActiveTab,
      label: 'Dashboard Ejecutivo',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      key: 'radar' as ActiveTab,
      label: 'Radar de Virales',
      icon: Eye,
      badge: tenantCompetitors.length
    },
    {
      key: 'script' as ActiveTab,
      label: 'Script Studio & Blog',
      icon: PenTool,
      badge: undefined
    },
    {
      key: 'matrix' as ActiveTab,
      label: 'Matriz de Nodos',
      icon: Workflow,
      badge: '5x1x3'
    },
    {
      key: 'calendar' as ActiveTab,
      label: 'Calendario 30 Días',
      icon: Calendar,
      badge: tenantScripts.length
    },
    {
      key: 'assets' as ActiveTab,
      label: 'Carruseles & Assets',
      icon: BookOpen,
      badge: undefined
    }
  ]

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 selection:bg-[#4f46e5] selection:text-white pt-20 font-sans flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        
        {/* PANEL IZQUIERDO PURPURA/INDIGO (ESTRUCTURA EXACTA DE LA REFERENCIA media_1788864698245.jpg) */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 bg-[#4f46e5] text-white lg:min-h-[calc(100vh-5rem)] lg:sticky lg:top-20 self-start flex flex-col justify-between p-4 sm:p-5 z-20 shadow-xl">
          <div className="space-y-6">
            
            {/* Cabecera del Sidebar con Logo Blanco */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white font-black text-lg shadow-sm border border-white/20 shrink-0">
                Q
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block">
                  QAWAY LAB
                </span>
                <h1 className="text-base font-black text-white leading-tight tracking-tight">
                  Content Studio
                </h1>
              </div>
            </div>

            {/* Selector de Marca / Cliente (Tenant Workspace) */}
            <div className="space-y-2 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-200 uppercase tracking-wider text-[10px]">
                  Marca Activa
                </span>
                <button
                  onClick={() => setShowNewBrandModal(true)}
                  className="text-[11px] font-bold text-white hover:text-indigo-100 flex items-center gap-0.5 cursor-pointer"
                  title="Añadir una marca o cliente adicional"
                >
                  <Plus className="w-3 h-3" />
                  Nueva
                </button>
              </div>

              <select
                value={activeTenantId}
                onChange={e => setActiveTenantId(e.target.value)}
                className="w-full bg-[#4338ca] text-white border border-white/20 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer shadow-2xs"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menú de Navegación Vertical */}
            <nav className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/80 px-3 block mb-2">
                Menú de Navegación
              </span>

              {navItems.map(item => {
                const isActive = activeTab === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#4f46e5] shadow-lg shadow-black/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-[#4f46e5]' : 'text-indigo-200'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          isActive
                            ? 'bg-indigo-50 text-[#4f46e5]'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Pie del Sidebar: Plan + Usuario */}
          <div className="pt-4 border-t border-white/15 space-y-3 mt-6">
            {/* Tarjeta de Plan */}
            <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-white">Plan Agency Scale</span>
                <span className="px-1.5 py-0.5 rounded bg-white text-[#4f46e5] font-mono text-[9px] font-extrabold">
                  ACTIVO
                </span>
              </div>
              <p className="text-[10px] text-indigo-200">
                {currentTenant.limits.maxMonthlyPieces} piezas/mes · Multi-Tenant
              </p>
            </div>

            {/* Perfil de Usuario con Menú */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition cursor-pointer text-white"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#4f46e5] font-black text-xs flex items-center justify-center shadow-xs">
                    {userProfile.avatarInitials}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block leading-tight">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] text-indigo-200 font-medium block">
                      {userProfile.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
              </button>

              {/* Menú desplegable */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white text-slate-800 border border-slate-200 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="p-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{userProfile.name}</p>
                    <p className="text-[11px] text-slate-400">{userProfile.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      alert('Ajustes de perfil: Conexión con Qaway Lab activa.')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-[#4f46e5] rounded-xl transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('LLMs: Modelos Gemini & Claude configurados.')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-[#4f46e5] rounded-xl transition cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ajustes & IA</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO PRINCIPAL (Fondo suave #f4f6fa como en la referencia) */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#f4f6fa]">
          {/* BARRA SUPERIOR DE UTILIDADES */}
          <header className="h-16 px-6 lg:px-8 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm flex items-center justify-between gap-4 sticky top-20 z-10">
            {/* Buscador Rápido idéntico a la referencia */}
            <div className="relative w-72 max-w-sm hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search here..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
              />
            </div>

            {/* Acciones Rápidas con Botón Índigo */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setActiveTab('script')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold shadow-sm shadow-[#4f46e5]/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Guión</span>
              </button>

              <button
                onClick={() => setHasUnreadAlerts(false)}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {hasUnreadAlerts && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4f46e5]" />
                )}
              </button>
            </div>
          </header>

          {/* LIENZO DEL MÓDULO ACTIVO */}
          <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <ExecutiveDashboard
                currentTenant={currentTenant}
                scripts={tenantScripts}
                tasks={tenantTasks}
                onToggleTask={handleToggleTask}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'radar' && (
              <RadarIdeas
                competitors={tenantCompetitors}
                onAddCompetitor={handleAddCompetitor}
                onSendToScript={handleSendToScript}
              />
            )}

            {activeTab === 'script' && (
              <ScriptStudio
                scripts={tenantScripts}
                activeScriptId={activeScriptId}
                onSaveScript={handleSaveScript}
                onSendToMatrix={handleSendToMatrix}
              />
            )}

            {activeTab === 'matrix' && (
              <MatrixDistribution
                scripts={tenantScripts}
                selectedScriptId={activeScriptId}
                onAddToCalendar={handleAddToCalendar}
              />
            )}

            {activeTab === 'calendar' && (
              <ContentCalendar
                scripts={tenantScripts}
                onUpdateStatus={(id, st) =>
                  setAllScripts(prev => prev.map(s => (s.id === id ? { ...s, status: st } : s)))
                }
                onSelectScript={id => {
                  setActiveScriptId(id)
                  setActiveTab('script')
                }}
              />
            )}

            {activeTab === 'assets' && (
              <AssetStudio
                carousels={carousels}
                leadMagnets={leadMagnets}
              />
            )}
          </div>
        </main>

      </div>

      {/* MODAL PARA CREAR NUEVA MARCA / CLIENTE */}
      {showNewBrandModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4f46e5]" />
                <h3 className="text-base font-bold text-slate-900">Añadir Nueva Marca / Cliente</h3>
              </div>
              <button
                onClick={() => setShowNewBrandModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre de la Marca o Empresa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Clínica Dental Arequipa"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nicho de Mercado
                </label>
                <input
                  type="text"
                  placeholder="Ej: Odontología Estética, Software B2B..."
                  value={newBrandNiche}
                  onChange={e => setNewBrandNiche(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBrandModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Guardar Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
