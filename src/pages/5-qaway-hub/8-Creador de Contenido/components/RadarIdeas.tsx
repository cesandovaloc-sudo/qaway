import React, { useState } from 'react'
import { CompetitorVideo, ContentFormat } from '../types/content.types'
import { Search, Sparkles, TrendingUp, Bookmark, Share2, Eye, Plus, ArrowRight, ExternalLink, Filter } from 'lucide-react'

interface RadarIdeasProps {
  competitors: CompetitorVideo[]
  onAddCompetitor: (comp: CompetitorVideo) => void
  onSendToScript: (idea: { title: string; hook: string; thesis: string; format: ContentFormat }) => void
}

export const RadarIdeas: React.FC<RadarIdeasProps> = ({
  competitors,
  onAddCompetitor,
  onSendToScript
}) => {
  const [filterFormat, setFilterFormat] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  
  // New competitor state
  const [newCreator, setNewCreator] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newHook, setNewHook] = useState('')
  const [newThesis, setNewThesis] = useState('')
  const [newViews, setNewViews] = useState('150000')
  const [newFormat, setNewFormat] = useState<ContentFormat>('reel')

  const filtered = competitors.filter(c => {
    const matchesFormat = filterFormat === 'all' || c.format === filterFormat
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.hookText.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFormat && matchesSearch
  })

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newCreator) return
    const comp: CompetitorVideo = {
      id: `comp-${Date.now()}`,
      creatorName: newCreator,
      handle: newHandle.startsWith('@') ? newHandle : `@${newHandle}`,
      videoUrl: 'https://instagram.com',
      title: newTitle,
      views: parseInt(newViews) || 100000,
      saves: Math.round((parseInt(newViews) || 100000) * 0.08),
      shares: Math.round((parseInt(newViews) || 100000) * 0.03),
      hookText: newHook || newTitle,
      coreThesis: newThesis || 'Enfoque de alto valor sin fricción técnica.',
      format: newFormat
    }
    onAddCompetitor(comp)
    setShowAddModal(false)
    setNewCreator('')
    setNewHandle('')
    setNewTitle('')
    setNewHook('')
    setNewThesis('')
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#191918]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fe6612]/20 text-[#fe6612] border border-[#fe6612]/30">
              Skill 01 · Intelligence
            </span>
            <span className="text-xs text-white/50">Radar & Benchmarking</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Radar de Referentes & Virales Outliers
          </h2>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Monitorea publicaciones de tus competidores que superaron su promedio habitual. Descompone por qué funcionaron y transfórmalas en conceptos propios.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#fe6612] to-[#ff4b0b] text-white font-medium text-sm hover:brightness-110 transition shadow-lg shadow-[#fe6612]/20 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir Referente / Post
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por creador, gancho o tema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fe6612] w-64 md:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-white/40 ml-2" />
          <button
            onClick={() => setFilterFormat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFormat === 'all' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Todos ({competitors.length})
          </button>
          <button
            onClick={() => setFilterFormat('reel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFormat === 'reel' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Reels
          </button>
          <button
            onClick={() => setFilterFormat('carrusel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFormat === 'carrusel' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Carruseles
          </button>
          <button
            onClick={() => setFilterFormat('post')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFormat === 'post' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setFilterFormat('blog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterFormat === 'blog' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Blog
          </button>
        </div>
      </div>

      {/* Grid of Viral Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(comp => (
          <div
            key={comp.id}
            className="group relative bg-[#191918] border border-white/10 hover:border-[#fe6612]/50 rounded-2xl p-5 flex flex-col justify-between transition duration-200 hover:shadow-xl hover:shadow-[#fe6612]/5"
          >
            <div>
              {/* Creator header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fe6612] to-[#ff4b0b] flex items-center justify-center text-white font-bold text-xs">
                    {comp.creatorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#fe6612] transition">
                      {comp.creatorName}
                    </h4>
                    <span className="text-xs text-white/40">{comp.handle}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-white/5 text-white/70 border border-white/10">
                  {comp.format}
                </span>
              </div>

              {/* Title & Core Hook */}
              <h3 className="text-base font-medium text-white mb-2 leading-snug">
                {comp.title}
              </h3>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#fe6612] block mb-1">
                  Gancho Verbal / Hook:
                </span>
                <p className="text-xs text-white/80 italic font-mono leading-relaxed">
                  "{comp.hookText}"
                </p>
              </div>

              {/* Core Thesis */}
              <div className="mb-4 text-xs text-white/60">
                <strong className="text-white/80 font-medium">Tesis Central: </strong>
                {comp.coreThesis}
              </div>
            </div>

            <div>
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/40 border border-white/5 mb-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-[11px] text-white/50 mb-0.5">
                    <Eye className="w-3 h-3 text-white/40" /> Views
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {(comp.views / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex flex-col items-center border-x border-white/5">
                  <span className="flex items-center gap-1 text-[11px] text-[#fe6612] mb-0.5">
                    <Bookmark className="w-3 h-3 text-[#fe6612]" /> Saves
                  </span>
                  <span className="text-xs font-semibold text-[#fe6612] font-mono">
                    {(comp.saves / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-[11px] text-white/50 mb-0.5">
                    <Share2 className="w-3 h-3 text-white/40" /> Shares
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {(comp.shares / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Action Button: Transform into Script */}
              <button
                onClick={() =>
                  onSendToScript({
                    title: `Concepto basado en: ${comp.title}`,
                    hook: comp.hookText,
                    thesis: comp.coreThesis,
                    format: comp.format
                  })
                }
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-[#fe6612] text-white text-xs font-medium transition cursor-pointer group-hover:bg-[#fe6612]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Adaptar & Escribir Guión</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e1d] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Añadir Referente Viral</h3>
            <form onSubmit={handleSaveNew} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Creador / Cuenta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nate Herk"
                    value={newCreator}
                    onChange={e => setNewCreator(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Handle (@usuario)</label>
                  <input
                    type="text"
                    placeholder="@nateherk"
                    value={newHandle}
                    onChange={e => setNewHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">Título o Tema del Post</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 5 Trucos para clonar tu voz gratis"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">Gancho Verbal (Hook Exacto)</label>
                <textarea
                  rows={2}
                  placeholder="Quédate porque hoy te enseño un truco superfácil..."
                  value={newHook}
                  onChange={e => setNewHook(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">Tesis o Lección Principal</label>
                <input
                  type="text"
                  placeholder="Ej. Usar herramientas gratuitas de menos de 3 min vs ElevenLabs"
                  value={newThesis}
                  onChange={e => setNewThesis(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Formato</label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value as ContentFormat)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  >
                    <option value="reel" className="bg-[#1e1e1d]">Reel / Short</option>
                    <option value="carrusel" className="bg-[#1e1e1d]">Carrusel</option>
                    <option value="post" className="bg-[#1e1e1d]">Post Individual</option>
                    <option value="blog" className="bg-[#1e1e1d]">Artículo Blog</option>
                    <option value="story" className="bg-[#1e1e1d]">Historia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Visualizaciones Aprox.</label>
                  <input
                    type="number"
                    value={newViews}
                    onChange={e => setNewViews(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#fe6612]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#fe6612] hover:bg-[#ff4b0b] text-white rounded-xl text-sm font-medium transition"
                >
                  Guardar en Radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
