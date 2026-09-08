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
  User,
  ChevronDown,
  ExternalLink,
  Home,
  LayoutGrid,
  FileText,
  Target,
  MousePointerClick,
  Link2,
  Type,
  Filter,
} from 'lucide-react'
import { useBlog } from '../context/BlogContext'
import BlogSidebar from '../components/workspace/BlogSidebar'
import BlogWorkItemsList from '../components/workspace/BlogWorkItemsList'
import BlogKanbanBoard from '../components/workspace/BlogKanbanBoard'
import BlogCategoriesManager from '../components/workspace/BlogCategoriesManager'
import HubSpotGuideSection, { GuideTab } from '../components/workspace/HubSpotGuideSection'
import UmamiAnalyticsSuite from '../components/workspace/UmamiAnalyticsSuite'
import BlogAnalyticsDashboard from '../components/workspace/BlogAnalyticsDashboard'

export default function DashboardPage() {
  const { posts, isCloudConnected } = useBlog()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'work-items' | 'kanban' | 'categories' | 'hubspot-guide' | 'analytics'>('work-items')
  const [analyticsSubView, setAnalyticsSubView] = useState<'umami' | 'editorial'>('umami')
  const [guideSubTab, setGuideSubTab] = useState<GuideTab>('keywords')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const authEmail = sessionStorage.getItem('qaway_auth_email') || 'admin@qawaylab.com'
  const userInitials = authEmail.substring(0, 2).toUpperCase()

  const handleLogout = () => {
    sessionStorage.removeItem('qaway_auth_token')
    sessionStorage.removeItem('qaway_auth_email')
    localStorage.removeItem('qaway_auth_token')
    navigate('/login')
  }

  return (
    <div className="min-h-[100dvh] bg-white text-primary flex flex-col font-sans">
      {/* 1. Header Global Superior del Workspace */}
      <header className="h-14 border-b border-line bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-display font-bold tracking-tight">
            <span className="text-primary">Qaway</span>
            <span className="text-accent">Lab</span>
          </Link>
          <span className="text-line select-none">/</span>
          <Link
            to="/hub"
            className="text-xs font-semibold text-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hub Central</span>
          </Link>
          <span className="text-line select-none">/</span>
          <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded bg-surface-muted border border-line">
            Studio Blog
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

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-line hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              title="Perfil de Usuario y Navegación"
            >
              <div className="w-7 h-7 rounded-lg bg-[#24262e] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {userInitials}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden md:inline max-w-[120px] truncate">
                {authEmail.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-line rounded-2xl shadow-xl z-50 p-2 text-xs font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-line bg-slate-50/70 rounded-xl mb-1.5">
                    <div className="font-bold text-slate-900 truncate">{authEmail}</div>
                    <div className="text-[11px] font-semibold text-accent mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Administrador Qaway
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/hub"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-500" />
                      <span>Panel Central Hub</span>
                    </Link>

                    <a
                      href="/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <span>Ver Blog Público</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    <Link
                      to="/"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"
                    >
                      <Home className="w-4 h-4 text-slate-500" />
                      <span>Inicio Web</span>
                    </Link>
                  </div>

                  <div className="border-t border-line my-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
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
          {/* Barra Superior de Herramientas Contextuales (Nivel 2 de Navegación) */}
          <div className="border-b border-line px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#fafafc] min-h-[52px]">
            {/* Controles Contextuales según la Vista Activa */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Contexto 1: Guía Editorial & SEO -> Módulos Temáticos de la Guía */}
              {activeTab === 'hubspot-guide' && (
                <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-line flex-wrap">
                  {[
                    { id: 'estructura' as GuideTab, label: '1. Estructura', icon: FileText },
                    { id: 'titulos' as GuideTab, label: '2. Títulos & CTR', icon: Target },
                    { id: 'keywords' as GuideTab, label: '3. Keywords & Saturación', icon: Search },
                    { id: 'ctas' as GuideTab, label: '4. Estrategia de CTAs', icon: MousePointerClick },
                    { id: 'seo' as GuideTab, label: '5. SEO On-Page', icon: Link2 },
                    { id: 'reglas' as GuideTab, label: '6. 11 Normas de Estilo', icon: Type },
                  ].map(tab => {
                    const Icon = tab.icon
                    const isSelected = guideSubTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGuideSubTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-accent shadow-xs font-bold'
                            : 'text-muted hover:text-primary'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Contexto 2: Métricas & Rendimiento -> Selector Módulo 1 (Embudo) vs Módulo 2 (Umami) */}
              {activeTab === 'analytics' && (
                <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-line text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAnalyticsSubView('umami')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      analyticsSubView === 'umami'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-accent" />
                    <span>Módulo 2: Umami (Telemetría & Atribución Real)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsSubView('editorial')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      analyticsSubView === 'editorial'
                        ? 'bg-white text-primary shadow-xs font-bold'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Módulo 1: Rendimiento & Embudo</span>
                  </button>
                </div>
              )}

              {/* Contexto 3: Lista de Posts o Kanban -> Indicador contextual de ámbito */}
              {(activeTab === 'work-items' || activeTab === 'kanban') && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-semibold text-primary">
                    {activeTab === 'work-items' ? 'Lista Editorial' : 'Tablero Kanban'}
                  </span>
                  {selectedCategoryFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold text-[11px] border border-accent/20">
                      <Filter className="w-3 h-3" />
                      {selectedCategoryFilter}
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter(null)}
                        className="ml-1 hover:text-red-700 cursor-pointer"
                        title="Quitar filtro de categoría"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Contexto 4: Categorías */}
              {activeTab === 'categories' && (
                <div className="text-xs font-semibold text-primary">
                  Taxonomías & Estructura del Blog
                </div>
              )}
            </div>

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
                <HubSpotGuideSection
                  activeSubTab={guideSubTab}
                  onSelectSubTab={setGuideSubTab}
                  hideInternalTabs={true}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
