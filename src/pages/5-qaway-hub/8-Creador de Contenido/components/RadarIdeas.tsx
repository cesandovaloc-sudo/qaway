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
      tenantId: competitors[0]?.tenantId || 'tenant-qaway',
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
    <div className="space-y-6 text-slate-800">
      {/* Top Banner (Purple / Indigo Reference Theme) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Skill 01 · Benchmarking
            </span>
            <span className="text-xs text-slate-400 font-medium">Radar de Outliers Virales</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Radar de Referentes & Contenido Viral
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Analiza publicaciones de referentes que rompieron el algoritmo. Desglosa su gancho verbal, extrae la tesis nuclear y adáptala a la voz de tu marca.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs transition shadow-sm shadow-[#4f46e5]/20 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Añadir Referente / Post
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por creador, gancho o tema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#4f46e5] w-64 md:w-80 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setFilterFormat('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterFormat === 'all' ? 'bg-white text-[#4f46e5] font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({competitors.length})
          </button>
          <button
            onClick={() => setFilterFormat('reel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterFormat === 'reel' ? 'bg-white text-[#4f46e5] font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reels
          </button>
          <button
            onClick={() => setFilterFormat('carrusel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterFormat === 'carrusel' ? 'bg-white text-[#4f46e5] font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Carruseles
          </button>
          <button
            onClick={() => setFilterFormat('post')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterFormat === 'post' ? 'bg-white text-[#4f46e5] font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setFilterFormat('blog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterFormat === 'blog' ? 'bg-white text-[#4f46e5] font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
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
            className="group relative bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-100 transition duration-200"
          >
            <div>
              {/* Creator header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {comp.creatorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#4f46e5] transition">
                      {comp.creatorName}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">{comp.handle}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  {comp.format}
                </span>
              </div>

              {/* Title & Core Hook */}
              <h3 className="text-sm font-semibold text-slate-900 mb-2 leading-snug">
                {comp.title}
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#4f46e5] block mb-1">
                  Gancho Verbal / Hook:
                </span>
                <p className="text-xs text-slate-700 italic font-mono leading-relaxed">
                  "{comp.hookText}"
                </p>
              </div>

              {/* Core Thesis */}
              <div className="mb-4 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">Tesis Central: </strong>
                {comp.coreThesis}
              </div>
            </div>

            <div>
              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-center mb-4">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Eye className="w-3 h-3 text-slate-400" /> Views
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {(comp.views / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex flex-col items-center border-x border-slate-200">
                  <span className="flex items-center gap-1 text-[10px] text-[#4f46e5] mb-0.5 font-semibold">
                    <Bookmark className="w-3 h-3 text-[#4f46e5]" /> Saves
                  </span>
                  <span className="text-xs font-bold text-[#4f46e5] font-mono">
                    {(comp.saves / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Share2 className="w-3 h-3 text-slate-400" /> Shares
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
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
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-[#4f46e5] text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Añadir Referente / Post Viral</h3>
            <form onSubmit={handleSaveNew} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-medium">Creador / Cuenta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nate Herk"
                    value={newCreator}
                    onChange={e => setNewCreator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-medium">Handle (@usuario)</label>
                  <input
                    type="text"
                    placeholder="@nateherk"
                    value={newHandle}
                    onChange={e => setNewHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Título o Tema del Post</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 5 Trucos para clonar tu voz gratis"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Gancho Verbal (Hook Exacto)</label>
                <textarea
                  rows={2}
                  placeholder="Quédate porque hoy te enseño un truco superfácil..."
                  value={newHook}
                  onChange={e => setNewHook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-medium">Tesis o Solución Propuesta</label>
                <textarea
                  rows={2}
                  placeholder="La clave está en no usar el micrófono del celular, sino..."
                  value={newThesis}
                  onChange={e => setNewThesis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-medium">Visualizaciones Aprox.</label>
                  <input
                    type="number"
                    value={newViews}
                    onChange={e => setNewViews(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1 font-medium">Formato</label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value as ContentFormat)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="reel">Reel / TikTok</option>
                    <option value="carrusel">Carrusel</option>
                    <option value="post">Post Individual</option>
                    <option value="blog">Blog</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Guardar Referente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
