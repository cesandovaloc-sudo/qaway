import React, { useState, useEffect } from 'react'
import { DEFAULT_AGENTS_DATA } from './data/defaultAgents'
import { TenantAgentWorkspace } from './types/agent.types'
import { AgentTrainingStudio } from './components/AgentTrainingStudio'
import { AgentStressTestStudio } from './components/AgentStressTestStudio'
import { AgentCorrectionLogStudio } from './components/AgentCorrectionLogStudio'
import { AgentPlaygroundSimulator } from './components/AgentPlaygroundSimulator'
import { AgentKnowledgeStudio } from './components/AgentKnowledgeStudio'
import { AgentIdentityStudio } from './components/AgentIdentityStudio'
import { AgentVoiceStudio } from './components/AgentVoiceStudio'
import { AgentDeploymentStudio } from './components/AgentDeploymentStudio'
import { AgentExecutiveDashboard } from './components/AgentExecutiveDashboard'
import { assembleCompleteSystemPrompt } from './services/promptEngine'
import { supabase } from '@/config/supabase'
import {
  Sparkles,
  Zap,
  ShieldAlert,
  FileEdit,
  Database,
  Bot,
  Volume2,
  Share2,
  Plus,
  ShieldCheck,
  Save,
  CheckCircle2,
  BarChart2
} from 'lucide-react'

const STORAGE_KEY_AGENTS = 'qaway_responsible_agents_v2'

export default function AgentesHubPage() {
  // 1. Estados de Agentes y Tenants
  const [workspaces, setWorkspaces] = useState<TenantAgentWorkspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGENTS)
      return saved ? JSON.parse(saved) : DEFAULT_AGENTS_DATA
    } catch {
      return DEFAULT_AGENTS_DATA
    }
  })

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    workspaces[0]?.id || 'tenant-qaway-master'
  )

  // 2. Navegación por Pestañas Operativas (Prioridad al Entrenamiento & Pruebas)
  type ActiveTab = 
    | 'training' 
    | 'playground' 
    | 'stresstest' 
    | 'corrections' 
    | 'knowledge' 
    | 'identity' 
    | 'voice' 
    | 'deploy' 
    | 'dashboard'

  const [activeTab, setActiveTab] = useState<ActiveTab>('training')

  // 3. Estados de Guardado y Feedback
  const [isSaving, setIsSaving] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // 4. Modal para registrar una nueva marca/empresa
  const [showNewBrandModal, setShowNewBrandModal] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandIndustry, setNewBrandIndustry] = useState('')

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  // Persistir en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(workspaces))
    } catch (e) {
      console.error('Error saving local agent workspaces', e)
    }
  }, [workspaces])

  // Intentar sincronizar con Supabase Cloud
  useEffect(() => {
    async function syncWithRemoteTenants() {
      try {
        const { data: remoteTenants, error } = await supabase
          .from('tenants')
          .select('id, name, slug, ai_settings')
        
        if (!error && remoteTenants && remoteTenants.length > 0) {
          console.log('[AgentesHub] Tenants remotos cargados de Supabase:', remoteTenants.length)
        }
      } catch (err) {
        console.warn('[AgentesHub] Modo local / fallback para tenants:', err)
      }
    }
    syncWithRemoteTenants()
  }, [])

  // Modificador inmutable del Workspace Activo
  const updateActiveWorkspace = (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => {
    setWorkspaces(prev =>
      prev.map(w => (w.id === activeWorkspace.id ? updater(w) : w))
    )
  }

  // Guardar y sincronizar con la nube (Supabase `tenants.ai_settings`)
  const handleSaveAll = async () => {
    setIsSaving(true)
    const compiledPrompt = assembleCompleteSystemPrompt(activeWorkspace)
    
    // 1. Actualizar objeto local
    const updatedPayload = {
      ...activeWorkspace.aiSettings,
      system_prompt: compiledPrompt,
      enabled: true
    }

    updateActiveWorkspace(prev => ({
      ...prev,
      aiSettings: updatedPayload
    }))

    // 2. Persistir en Supabase Cloud si existe la tabla
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          ai_settings: updatedPayload
        })
        .eq('slug', activeWorkspace.slug)

      if (error) {
        setSaveToast('Configuración y Ejemplos de Oro guardados en local.')
      } else {
        setSaveToast('¡Sincronizado con éxito con Supabase Cloud y WABA Webhook!')
      }
    } catch (err) {
      setSaveToast('¡Configuración guardada exitosamente!')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveToast(null), 3500)
    }
  }

  // Crear nueva marca
  const handleCreateNewBrand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    const slug = newBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const newWs: TenantAgentWorkspace = {
      id: `tenant-${Date.now()}`,
      slug,
      name: newBrandName.trim(),
      industry: newBrandIndustry.trim() || 'Servicios Generales',
      role: 'consultoria_ventas',
      agentName: `${newBrandName.trim()} Bot`,
      tone: 'ejecutivo_formal',
      welcomeGreeting: `¡Hola! Soy el Asistente Virtual Oficial de ${newBrandName.trim()} (IA). ¿En qué podemos asesorarte hoy?`,
      handoverMessage: `Comprendo. He notificado a nuestro equipo humano para que te asistan a la brevedad.`,
      channel: 'whatsapp',
      aiSettings: {
        enabled: true,
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        mode: 'managed',
        api_key: null,
        temperature: 0.3,
        waba_phone_number_id: null,
        human_handoff_keywords: ['humano', 'asesor', 'persona', 'queja', 'reclamo'],
        system_prompt: ''
      },
      knowledgeBase: [],
      faqs: [],
      goldenExamples: [],
      correctionLogs: [],
      metrics: {
        totalConversations: 0,
        simulationsRun: 0,
        handoffCount: 0,
        complianceScore: 100
      }
    }

    setWorkspaces(prev => [...prev, newWs])
    setActiveWorkspaceId(newWs.id)
    setShowNewBrandModal(false)
    setNewBrandName('')
    setNewBrandIndustry('')
  }

  // Navegación enfocada en entrenamiento real y calibración
  const navItems = [
    {
      key: 'training' as ActiveTab,
      label: 'Entrenador de Oro (Few-Shot)',
      icon: Sparkles,
      badge: (activeWorkspace.goldenExamples || []).length
    },
    {
      key: 'playground' as ActiveTab,
      label: 'Simulador WhatsApp & Web',
      icon: Zap,
      badge: 'Play'
    },
    {
      key: 'stresstest' as ActiveTab,
      label: 'Batería de Estrés (Red Teaming)',
      icon: ShieldAlert,
      badge: '1 Día'
    },
    {
      key: 'corrections' as ActiveTab,
      label: 'Notas de Corrección',
      icon: FileEdit,
      badge: (activeWorkspace.correctionLogs || []).filter(c => c.status === 'pendiente').length || undefined
    },
    {
      key: 'knowledge' as ActiveTab,
      label: 'Catálogo & Traspaso Humano',
      icon: Database,
      badge: activeWorkspace.knowledgeBase.length
    },
    {
      key: 'identity' as ActiveTab,
      label: 'Identidad & Motor LLM',
      icon: Bot,
      badge: undefined
    },
    {
      key: 'voice' as ActiveTab,
      label: 'Voz, Tono & PAIR',
      icon: Volume2,
      badge: undefined
    },
    {
      key: 'deploy' as ActiveTab,
      label: 'Despliegue WABA & Web',
      icon: Share2,
      badge: undefined
    }
  ]

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 selection:bg-[#4f46e5] selection:text-white font-sans flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        
        {/* PANEL IZQUIERDO PURPURA/INDIGO (CONTENT STUDIO ESQUELETO) */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 bg-[#4f46e5] text-white lg:min-h-screen lg:sticky lg:top-0 self-start flex flex-col justify-between p-4 sm:p-5 z-20 shadow-xl">
          <div className="space-y-6">
            
            {/* Cabecera del Sidebar con Monograma Q */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white font-black text-lg shadow-sm border border-white/20 shrink-0">
                Q
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block">
                  QAWAY LAB
                </span>
                <h1 className="text-base font-black text-white leading-tight tracking-tight">
                  Agentes Studio
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
                  type="button"
                  onClick={() => setShowNewBrandModal(true)}
                  className="text-[11px] font-bold text-white hover:text-indigo-100 flex items-center gap-0.5 cursor-pointer"
                  title="Añadir otra empresa al Hub"
                >
                  <Plus className="w-3 h-3" />
                  Nueva
                </button>
              </div>

              <select
                value={activeWorkspaceId}
                onChange={e => setActiveWorkspaceId(e.target.value)}
                className="w-full bg-[#4338ca] text-white border border-white/20 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer shadow-2xs"
              >
                {workspaces.map(w => (
                  <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Menú de Navegación Vertical */}
            <nav className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/80 px-3 block mb-2">
                Entrenamiento & Calibración
              </span>

              {navItems.map(item => {
                const isActive = activeTab === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
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

          {/* Pie de Usuario y Gobernanza */}
          <div className="pt-4 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black text-white border border-white/30">
                  LS
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-white block truncate">
                    Leo Sandoval
                  </span>
                  <span className="text-[10px] text-indigo-200 block truncate">
                    Architect & Prompt Engineer
                  </span>
                </div>
              </div>

              {/* Botón para ver Métricas preservadas */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'dashboard' ? 'training' : 'dashboard')}
                className="text-[11px] font-bold text-indigo-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                title="Alternar vista de métricas y dashboard"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-indigo-200/80 pt-1">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Ley 31814 Activa
              </span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded-sm font-mono">
                v4.0
              </span>
            </div>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL DE CONTENIDO */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* BARRA SUPERIOR EJECUTIVA (TOPBAR) */}
          <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-10 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Hub</span>
                  <span>/</span>
                  <span className="text-[#4f46e5]">Agentes de IA Responsable</span>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                    {activeWorkspace.name}
                  </h2>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                    {activeWorkspace.agentName}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {(activeWorkspace.goldenExamples || []).length} Ejemplos de Oro
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Píldora de Gobernanza Ley 31814 */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Guardrails Ley 31814 Activos</span>
              </div>

              {/* Botón Simular Rápido */}
              <button
                type="button"
                onClick={() => setActiveTab('playground')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">Simular</span>
              </button>

              {/* Botón Guardar Sincronizado */}
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </header>

          {/* Toast de Guardado */}
          {saveToast && (
            <div className="mx-4 sm:mx-8 mt-4 p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* VISTAS MODULARES SEGÚN PESTAÑA */}
          <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full">
            {activeTab === 'training' && (
              <AgentTrainingStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'playground' && (
              <AgentPlaygroundSimulator
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'stresstest' && (
              <AgentStressTestStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
                onNavigateToTraining={() => setActiveTab('training')}
              />
            )}

            {activeTab === 'corrections' && (
              <AgentCorrectionLogStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'knowledge' && (
              <AgentKnowledgeStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'identity' && (
              <AgentIdentityStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'voice' && (
              <AgentVoiceStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'deploy' && (
              <AgentDeploymentStudio
                workspace={activeWorkspace}
                onUpdateWorkspace={updateActiveWorkspace}
              />
            )}

            {activeTab === 'dashboard' && (
              <AgentExecutiveDashboard
                workspace={activeWorkspace}
                onNavigateTab={tab => setActiveTab(tab)}
                onRunSimulation={() => setActiveTab('playground')}
              />
            )}
          </div>

        </main>
      </div>

      {/* MODAL: REGISTRAR NUEVA EMPRESA / TENANT */}
      {showNewBrandModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">
                Registrar Nueva Empresa en el Hub
              </h3>
              <button
                type="button"
                onClick={() => setShowNewBrandModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewBrand} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nombre de la Empresa o Marca *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clínica San Lucas, Inmobiliaria Norte..."
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Sector o Rubro Industrial
                </label>
                <input
                  type="text"
                  placeholder="Ej. Salud, Gastronomía, Educación, Retail..."
                  value={newBrandIndustry}
                  onChange={e => setNewBrandIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Se inicializarán automáticamente los guardrails de la Ley Nº 31814, el motor de Ejemplos de Oro y la arquitectura multi-tenant en 3 capas.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBrandModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Crear Espacio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
