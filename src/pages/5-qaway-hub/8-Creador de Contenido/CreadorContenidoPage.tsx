import React, { useState, useEffect } from 'react'
import {
  INITIAL_COMPETITORS,
  INITIAL_SCRIPTS,
  INITIAL_CAROUSELS,
  INITIAL_LEAD_MAGNETS
} from './data/defaultContent'
import {
  CompetitorVideo,
  ScriptItem,
  CarouselDeck,
  LeadMagnetResource,
  ContentFormat,
  ContentStatus
} from './types/content.types'
import { RadarIdeas } from './components/RadarIdeas'
import { ScriptStudio } from './components/ScriptStudio'
import { MatrixDistribution } from './components/MatrixDistribution'
import { ContentCalendar } from './components/ContentCalendar'
import { AssetStudio } from './components/AssetStudio'
import {
  Sparkles,
  Layers,
  Calendar,
  Eye,
  PenTool,
  BookOpen,
  Plus,
  Zap,
  TrendingUp,
  Share2,
  FileText
} from 'lucide-react'

const STORAGE_KEY_SCRIPTS = 'qaway_creator_scripts_v1'
const STORAGE_KEY_COMPETITORS = 'qaway_creator_competitors_v1'

export default function CreadorContenidoPage() {
  // Load state with fallback to seed data
  const [competitors, setCompetitors] = useState<CompetitorVideo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPETITORS)
      return saved ? JSON.parse(saved) : INITIAL_COMPETITORS
    } catch {
      return INITIAL_COMPETITORS
    }
  })

  const [scripts, setScripts] = useState<ScriptItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCRIPTS)
      return saved ? JSON.parse(saved) : INITIAL_SCRIPTS
    } catch {
      return INITIAL_SCRIPTS
    }
  })

  const [carousels] = useState<CarouselDeck[]>(INITIAL_CAROUSELS)
  const [leadMagnets] = useState<LeadMagnetResource[]>(INITIAL_LEAD_MAGNETS)

  // Navigation tabs
  type ActiveTab = 'radar' | 'script' | 'matrix' | 'calendar' | 'assets'
  const [activeTab, setActiveTab] = useState<ActiveTab>('radar')
  const [activeScriptId, setActiveScriptId] = useState<string>(scripts[0]?.id || '')

  // Save to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCRIPTS, JSON.stringify(scripts))
    } catch (e) {
      console.error('Error saving scripts to localStorage', e)
    }
  }, [scripts])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPETITORS, JSON.stringify(competitors))
    } catch (e) {
      console.error('Error saving competitors to localStorage', e)
    }
  }, [competitors])

  // Handlers
  const handleAddCompetitor = (newComp: CompetitorVideo) => {
    setCompetitors(prev => [newComp, ...prev])
  }

  const handleSendToScript = (idea: { title: string; hook: string; thesis: string; format: ContentFormat }) => {
    const newScript: ScriptItem = {
      id: `script-${Date.now()}`,
      title: idea.title,
      format: idea.format,
      platform: 'instagram',
      hook: {
        text: idea.hook,
        variant: 'curiosidad',
        durationSec: 3.5,
        wordCount: idea.hook.split(' ').length
      },
      retentionBridge: 'El 90% de personas comete un error clave en este punto. Aquí te enseño cómo resolverlo.',
      coreBody: idea.thesis,
      cta: {
        text: 'Comenta la palabra SKILL y te paso el sistema completo por DM.',
        triggerKeyword: 'SKILL',
        leadMagnetName: 'Guía de Creación Modular'
      },
      descriptionCopy: `Nuevo video: ${idea.title}. Comenta SKILL para enviarte los recursos completos.`,
      status: 'guion_aprobado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setScripts(prev => [newScript, ...prev])
    setActiveScriptId(newScript.id)
    setActiveTab('script')
  }

  const handleSaveScript = (updatedScript: ScriptItem) => {
    setScripts(prev => prev.map(s => (s.id === updatedScript.id ? updatedScript : s)))
  }

  const handleSendToMatrix = (script: ScriptItem) => {
    setActiveScriptId(script.id)
    setActiveTab('matrix')
  }

  const handleAddToCalendar = (item: { title: string; hook: string; format: any }) => {
    const newScript: ScriptItem = {
      id: `script-var-${Date.now()}`,
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
    setScripts(prev => [newScript, ...prev])
    setActiveTab('calendar')
  }

  const handleUpdateStatus = (id: string, newStatus: ContentStatus) => {
    setScripts(prev => prev.map(s => (s.id === id ? { ...s, status: newStatus } : s)))
  }

  const handleSelectScriptFromCalendar = (id: string) => {
    setActiveScriptId(id)
    setActiveTab('script')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0e] text-white selection:bg-[#fe6612] selection:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hub Header Badge & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fe6612]/20 text-[#fe6612] border border-[#fe6612]/30">
                Qaway Hub · Creator Suite
              </span>
              <span className="text-xs text-white/40">v4.0 Impeccable Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Creador de Contenido Modular
            </h1>
            <p className="text-sm sm:text-base text-white/60 mt-1 max-w-2xl">
              Fábrica de contenidos de 5 fases: investiga referentes virales, redacta con retención medida, multiplica ganchos, calendariza y diseña carruseles y lead magnets.
            </p>
          </div>

          {/* Global Quick Stats */}
          <div className="flex items-center gap-2 sm:gap-4 bg-[#191918] border border-white/10 rounded-2xl p-3">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-white/40 uppercase block font-semibold">Piezas Activas</span>
              <span className="text-base font-bold text-white font-mono">{scripts.length}</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-white/40 uppercase block font-semibold">Referentes</span>
              <span className="text-base font-bold text-[#fe6612] font-mono">{competitors.length}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-white/40 uppercase block font-semibold">Lead Magnets</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{leadMagnets.length}</span>
            </div>
          </div>
        </div>

        {/* 5 Skills Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-[#fe6612] text-white shadow-lg shadow-[#fe6612]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>1. Radar & Virales</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'script'
                ? 'bg-[#fe6612] text-white shadow-lg shadow-[#fe6612]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>2. Script Studio & Blog</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-[#fe6612] text-white shadow-lg shadow-[#fe6612]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Matriz Combinatoria</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[#fe6612] text-white shadow-lg shadow-[#fe6612]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. Calendario 30 Días</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-[#fe6612] text-white shadow-lg shadow-[#fe6612]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>5. Carruseles & Lead Magnets</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {activeTab === 'radar' && (
            <RadarIdeas
              competitors={competitors}
              onAddCompetitor={handleAddCompetitor}
              onSendToScript={handleSendToScript}
            />
          )}

          {activeTab === 'script' && (
            <ScriptStudio
              scripts={scripts}
              activeScriptId={activeScriptId}
              onSaveScript={handleSaveScript}
              onSendToMatrix={handleSendToMatrix}
            />
          )}

          {activeTab === 'matrix' && (
            <MatrixDistribution
              scripts={scripts}
              selectedScriptId={activeScriptId}
              onAddToCalendar={handleAddToCalendar}
            />
          )}

          {activeTab === 'calendar' && (
            <ContentCalendar
              scripts={scripts}
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
    </div>
  )
}
