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
  Sparkles,
  Layers,
  Calendar,
  Eye,
  PenTool,
  BookOpen,
  Plus,
  LayoutDashboard,
  Building2,
  ChevronDown,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  ShieldCheck
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

  const handleUpdateStatus = (id: string, newStatus: ContentStatus) => {
    setAllScripts(prev => prev.map(s => (s.id === id ? { ...s, status: newStatus } : s)))
  }

  const handleSelectScriptFromCalendar = (id: string) => {
    setActiveScriptId(id)
    setActiveTab('script')
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

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-slate-800 selection:bg-[#ff4b0b] selection:text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-7">
        
        {/* TOP BAR: IDENTIDAD DE MARCA + SESIÓN DE USUARIO + SELECTOR DE MARCA */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Logo & Título */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff4b0b] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#ff4b0b]/20 shrink-0">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Qaway Hub
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-[#ff4b0b] uppercase tracking-wider">
                  Suite de Contenidos
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Creador de Contenido Modular
              </h1>
            </div>
          </div>

          {/* Selector de Marca/Cliente + Controles de Usuario */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Selector de Marca (Cliente activo) */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <Building2 className="w-4 h-4 text-[#ff4b0b]" />
              <span className="text-slate-500 font-semibold">Marca:</span>
              <select
                value={activeTenantId}
                onChange={e => setActiveTenantId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Nueva Marca (Sin símbolo duplicado ++) */}
            <button
              onClick={() => setShowNewBrandModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Añadir una marca o cliente adicional"
            >
              <Plus className="w-3.5 h-3.5 text-[#ff4b0b]" />
              <span>Nueva Marca</span>
            </button>

            {/* Separador vertical */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Notificaciones */}
            <button
              onClick={() => setHasUnreadAlerts(false)}
              className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
              title="Notificaciones de producción"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff4b0b]" />
              )}
            </button>

            {/* Perfil de Usuario con Menú */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userProfile.avatarInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {userProfile.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {userProfile.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Menú desplegable de usuario */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{userProfile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{userProfile.email}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#ff4b0b] border border-orange-200">
                      Cuenta Master Pro
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      alert('Ajustes de perfil: Cuenta sincronizada con Qaway Lab.')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Ajustes de IA: Conectores OpenAI/Claude configurados.')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Preferencias & LLMs</span>
                  </button>

                  <div className="border-t border-slate-100 pt-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PESTAÑAS HORIZONTALES (DISEÑO EDITORIAL MINIMALISTA, ESPACIOSO Y CONFORTABLE) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>0. Dashboard Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>1. Radar Virales ({tenantCompetitors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'script'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>2. Script Studio & Blog</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Matriz 5x1x3</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. Calendario ({tenantScripts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>5. Carruseles & Lead Magnets</span>
          </button>
        </div>

        {/* VISTA ACTIVA */}
        <div className="transition-all duration-300">
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
              onUpdateStatus={handleUpdateStatus}
              onSelectScript={handleSelectScriptFromCalendar}
            />
          )}

          {activeTab === 'assets' && (
            <AssetStudio
              carousels={carousels}
              leadMagnets={leadMagnets}
            />
          )}
        </div>
      </div>

      {/* MODAL PARA AGREGAR NUEVA MARCA / CLIENTE */}
      {showNewBrandModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Añadir Nueva Marca / Cliente</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crea un espacio independiente para gestionar el contenido de otra empresa o cliente sin mezclar guiones ni calendarios.
            </p>

            <form onSubmit={handleCreateBrand} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre de la Marca o Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Restaurante Mesa Selecta"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ff4b0b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nicho o Sector</label>
                <input
                  type="text"
                  placeholder="Ej. Gastronomía & Eventos"
                  value={newBrandNiche}
                  onChange={e => setNewBrandNiche(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ff4b0b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBrandModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff4b0b] hover:bg-[#ff7a45] text-white rounded-xl text-xs font-semibold transition shadow-2xs"
                >
                  Crear Espacio de Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
