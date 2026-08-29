import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  FolderKanban,
  Tag,
  Plus,
  ChevronDown,
  Globe,
  ExternalLink,
  BookOpen,
  BarChart3,
} from 'lucide-react'
import { useBlog } from '../../context/BlogContext'

interface BlogSidebarProps {
  activeTab: 'work-items' | 'kanban' | 'categories' | 'hubspot-guide' | 'analytics'
  onSelectTab: (tab: 'work-items' | 'kanban' | 'categories' | 'hubspot-guide' | 'analytics') => void
  selectedCategoryFilter?: string | null
  onSelectCategoryFilter: (catName: string | null) => void
}

export default function BlogSidebar({
  activeTab,
  onSelectTab,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}: BlogSidebarProps) {
  const { posts, categories, isCloudConnected } = useBlog()
  const navigate = useNavigate()
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)

  const publishedCount = posts.filter(p => p.status === 'publicado').length
  const draftCount = posts.filter(p => p.status === 'borrador').length

  return (
    <aside className="w-64 shrink-0 bg-[#fafafc] border-r border-line flex flex-col justify-between p-4 min-h-[calc(100vh-60px)] font-sans select-none">
      <div className="space-y-4">
        {/* 1. Header del Workspace */}
        <div className="flex items-center justify-between pb-3 border-b border-line px-1">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-primary tracking-tight">
              Qaway Lab
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted px-2 py-0.5 rounded bg-surface-muted border border-line">
              Studio Blog
            </span>
          </Link>
        </div>

        {/* 2. Botón de Acción Rápida "+ Redactar Artículo" */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/editor')}
            className="w-full flex items-center justify-center gap-2 bg-[#24262e] hover:bg-[#2f323c] text-white py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Redactar Artículo</span>
          </button>
        </div>

        {/* 3. Vistas Principales de Trabajo */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider px-2 block mb-1">
            Vistas de Trabajo
          </span>

          <button
            type="button"
            onClick={() => {
              onSelectCategoryFilter(null)
              onSelectTab('work-items')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === 'work-items' && !selectedCategoryFilter
                ? 'bg-white text-primary border border-line shadow-xs font-semibold'
                : 'text-muted hover:bg-black/5 hover:text-primary font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-muted" />
              <span>Todos los Posts</span>
            </div>
            <span className="text-xs font-mono text-muted">{posts.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategoryFilter(null)
              onSelectTab('kanban')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-white text-primary border border-line shadow-xs font-semibold'
                : 'text-muted hover:bg-black/5 hover:text-primary font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-muted" />
              <span>Tablero Kanban</span>
            </div>
            <span className="text-xs font-mono text-muted">
              {draftCount} / {publishedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategoryFilter(null)
              onSelectTab('categories')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-primary border border-line shadow-xs font-semibold'
                : 'text-muted hover:bg-black/5 hover:text-primary font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-muted" />
              <span>Gestión de Categorías</span>
            </div>
            <span className="text-xs font-mono text-muted">{categories.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategoryFilter(null)
              onSelectTab('analytics')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-primary border border-line shadow-xs font-semibold'
                : 'text-muted hover:bg-black/5 hover:text-primary font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-muted" />
              <span>Métricas & Rendimiento</span>
            </div>
            <span className="text-xs font-mono text-muted">KPIs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectCategoryFilter(null)
              onSelectTab('hubspot-guide')
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeTab === 'hubspot-guide'
                ? 'bg-white text-primary border border-line shadow-xs font-semibold'
                : 'text-muted hover:bg-black/5 hover:text-primary font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-muted" />
              <span>Metodología HubSpot</span>
            </div>
            <span className="text-xs font-mono text-muted">Guía</span>
          </button>
        </div>

        {/* 4. Categorías del Blog */}
        <div className="pt-3 border-t border-line">
          <div
            className="flex items-center justify-between px-2 py-1.5 cursor-pointer select-none"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Categorías ({categories.length})
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-light transition-transform duration-200 ${
                isCategoriesOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {isCategoriesOpen && (
            <div className="space-y-0.5 mt-1">
              {categories.map(cat => {
                const count = posts.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length
                const isSelected = selectedCategoryFilter === cat.name

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategoryFilter(isSelected ? null : cat.name)
                      onSelectTab('work-items')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-primary font-semibold border border-line shadow-xs'
                        : 'text-muted hover:bg-black/5 hover:text-primary font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#ff4b0b' }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted ml-2">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Footer del Sidebar */}
      <div className="pt-3 border-t border-line space-y-1.5">
        <div className="flex items-center justify-between text-xs px-2 text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConnected ? 'bg-success' : 'bg-warning'
              }`}
            />
            {isCloudConnected ? 'Cloud Supabase' : 'Modo Local'}
          </span>
          <span className="font-mono text-xs text-muted-light">v0.2.0</span>
        </div>

        <a
          href="http://localhost:4100/blog"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-muted hover:text-accent hover:bg-accent/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Ver Blog Público
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  )
}
