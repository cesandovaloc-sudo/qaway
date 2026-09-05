import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Layers,
  FolderKanban,
  Tag,
  Plus,
  Search,
  BookOpen,
  BarChart3,
  Globe,
  LogOut,
} from 'lucide-react'
import { useBlog } from '../context/BlogContext'
import BlogSidebar from '../components/workspace/BlogSidebar'
import BlogWorkItemsList from '../components/workspace/BlogWorkItemsList'
import BlogKanbanBoard from '../components/workspace/BlogKanbanBoard'
import BlogCategoriesManager from '../components/workspace/BlogCategoriesManager'
import HubSpotGuideSection from '../components/workspace/HubSpotGuideSection'
import UmamiAnalyticsSuite from '../components/workspace/UmamiAnalyticsSuite'
import BlogAnalyticsDashboard from '../components/workspace/BlogAnalyticsDashboard'

export default function DashboardPage() {
  const { posts, isCloudConnected } = useBlog()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'work-items' | 'kanban' | 'categories' | 'hubspot-guide' | 'analytics'>('work-items')
  const [analyticsSubView, setAnalyticsSubView] = useState<'umami' | 'editorial'>('umami')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-[100dvh] bg-white text-primary flex flex-col font-sans">
      {/* 1. Header Global Superior del Workspace */}
      <header className="h-14 border-b border-line bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-display font-bold tracking-tight">
            <span className="text-primary">Qaway</span>
            <span className="text-accent">Lab</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted ml-1 px-1.5 py-0.5 rounded bg-surface-muted border border-line">
              Hub Editorial
            </span>
          </Link>
          <span className="text-line select-none">/</span>
          <span className="text-xs font-semibold text-muted truncate hidden sm:inline">
            Gestión de Publicaciones & Artículos
          </span>
        </div>

        {/* Acciones del Header */}
        <div className="flex items-center gap-3">
          <span
            className={`hidden md:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isCloudConnected
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-surface-muted text-muted border-line'
            }`}
          >
            {isCloudConnected ? 'Cloud Supabase' : 'Modo Local'}
          </span>

          <button
            type="button"
            onClick={() => navigate('/hub/blog-editor?mode=editor')}
            className="inline-flex items-center gap-1.5 bg-[#24262e] hover:bg-[#2f323c] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Artículo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('qaway_auth_token')
              sessionStorage.removeItem('qaway_auth_email')
              localStorage.removeItem('qaway_auth_token')
              navigate('/login')
            }}
            className="inline-flex items-center gap-1.5 border border-line hover:bg-surface-muted text-muted hover:text-danger px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* 2. Layout Grid Full-Bleed (Sidebar Fija + Workspace Principal) */}
      <div className="flex flex-1 min-h-[calc(100vh-56px)]">
        {/* Sidebar Izquierda */}
        <BlogSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          selectedCategoryFilter={selectedCategoryFilter}
          onSelectCategoryFilter={setSelectedCategoryFilter}
        />

        {/* Área de Trabajo Principal */}
        <main className="flex-1 flex flex-col bg-white overflow-x-hidden">
          {/* Barra Superior de Pestañas y Búsqueda */}
          <div className="border-b border-line px-6 py-3 flex flex-wrap items-center justify-between gap-4 bg-[#fafafc]">
            {/* Pestañas de Vista */}
            <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-line flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('work-items')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'work-items'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lista ({posts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Tablero Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Métricas & Rendimiento</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Categorías</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hubspot-guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'hubspot-guide'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Metodología HubSpot</span>
              </button>
            </div>

            {/* Selector de Comparación de Métricas: Módulo 1 (Editorial) vs Módulo 2 (Umami) */}
            {activeTab === 'analytics' && (
              <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAnalyticsSubView('umami')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    analyticsSubView === 'umami'
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Módulo 2: Umami (Tráfico & Atribución)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsSubView('editorial')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    analyticsSubView === 'editorial'
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Módulo 1: Rendimiento & Embudo</span>
                </button>
              </div>
            )}

            {/* Buscador Integrado (visible en vistas de lista/kanban) */}
            {activeTab !== 'hubspot-guide' && activeTab !== 'categories' && activeTab !== 'analytics' && (
              <div className="relative w-72">
                <Search className="w-4 h-4 text-muted-light absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o extracto..."
                  className="w-full bg-white border border-line rounded-lg pl-9 pr-3 py-1.5 text-xs text-primary focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>

          {/* Cuerpo del Contenido Según Vista Activa */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'work-items' && (
              <div className="p-6 flex-1">
                <BlogWorkItemsList
                  posts={posts}
                  selectedCategoryFilter={selectedCategoryFilter}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeTab === 'kanban' && (
              <div className="p-6 flex-1">
                <BlogKanbanBoard
                  posts={posts}
                  selectedCategoryFilter={selectedCategoryFilter}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              analyticsSubView === 'umami' ? <UmamiAnalyticsSuite /> : <BlogAnalyticsDashboard />
            )}

            {activeTab === 'categories' && (
              <div className="p-6 flex-1">
                <BlogCategoriesManager />
              </div>
            )}

            {activeTab === 'hubspot-guide' && (
              <div className="p-6 flex-1">
                <HubSpotGuideSection />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
