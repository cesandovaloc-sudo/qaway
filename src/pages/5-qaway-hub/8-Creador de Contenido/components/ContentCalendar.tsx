import React, { useState } from 'react'
import { ScriptItem, ContentFormat, ContentStatus } from '../types/content.types'
import { Calendar as CalendarIcon, Filter, Layers, CheckCircle2, Clock, PlayCircle, Eye, FileText, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface ContentCalendarProps {
  scripts: ScriptItem[]
  onUpdateStatus: (id: string, newStatus: ContentStatus) => void
  onSelectScript: (id: string) => void
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  scripts,
  onUpdateStatus,
  onSelectScript
}) => {
  const [viewMode, setViewMode] = useState<'mes' | 'kanban' | 'tabla'>('mes')
  const [filterChannel, setFilterChannel] = useState<string>('all')

  const filteredScripts = scripts.filter(s => {
    const matchesChannel = filterChannel === 'all' || s.format === filterChannel
    return matchesChannel
  })

  // Format badge colors (Muted Pastels per Minimalist UI Protocol)
  const getFormatBadge = (format: ContentFormat) => {
    switch (format) {
      case 'reel':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'carrusel':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'story':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'post':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'blog':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'idea':
        return { label: 'Idea', color: 'bg-slate-100 text-slate-600' }
      case 'guion_aprobado':
        return { label: 'Guión OK', color: 'bg-indigo-50 text-indigo-700' }
      case 'listo_grabar':
        return { label: 'Por Grabar', color: 'bg-amber-50 text-amber-700' }
      case 'en_edicion':
        return { label: 'En Edición', color: 'bg-purple-50 text-purple-700' }
      case 'programado':
        return { label: 'Programado', color: 'bg-orange-50 text-[#ff4b0b]' }
      case 'publicado':
        return { label: 'Publicado', color: 'bg-emerald-50 text-emerald-700' }
    }
  }

  // Summary counts
  const reelsCount = scripts.filter(s => s.format === 'reel').length
  const carruselesCount = scripts.filter(s => s.format === 'carrusel').length
  const postsCount = scripts.filter(s => s.format === 'post').length
  const blogsCount = scripts.filter(s => s.format === 'blog').length

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner (Clean Minimalist White) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              Skill 04 · Content Manager
            </span>
            <span className="text-xs text-slate-400 font-medium">Planificación 30 Días</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Calendario Editorial & Gestión de Producción
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Visualiza y equilibra tu parrilla mensual combinando Reels, Carruseles, Stories, Posts individuales y Artículos de Blog.
          </p>
        </div>

        {/* Quick format counts */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-center">
            <span className="text-xs text-rose-700 font-bold block">{reelsCount} Reels</span>
          </div>
          <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-center">
            <span className="text-xs text-purple-700 font-bold block">{carruselesCount} Carruseles</span>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <span className="text-xs text-blue-700 font-bold block">{postsCount} Posts</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <span className="text-xs text-emerald-700 font-bold block">{blogsCount} Blogs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setViewMode('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'mes' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vista Mes (30 Días)
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kanban de Producción
          </button>
          <button
            onClick={() => setViewMode('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'tabla' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tabla Detallada
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filtrar Canal:</span>
          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#ff4b0b] shadow-2xs"
          >
            <option value="all">Todos los Canales</option>
            <option value="reel">Reels / Shorts</option>
            <option value="carrusel">Carruseles</option>
            <option value="post">Posts</option>
            <option value="blog">Blog Qaway</option>
            <option value="story">Stories</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: 30 DAYS MONTHLY GRID (CLEAN WHITE CELLS) */}
      {viewMode === 'mes' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 overflow-x-auto shadow-xs">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map(day => {
                const dayScripts = filteredScripts.filter(s => {
                  const dayNum = s.scheduledDate ? parseInt(s.scheduledDate.split('-')[2]) : 0
                  return dayNum === day
                })

                return (
                  <div
                    key={day}
                    className="min-h-[115px] bg-slate-50/60 border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-400">{day}</span>
                      {dayScripts.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4b0b]" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayScripts.map(script => {
                        const status = getStatusBadge(script.status)
                        return (
                          <div
                            key={script.id}
                            onClick={() => onSelectScript(script.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#ff4b0b] text-left cursor-pointer transition shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span
                                className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded border ${getFormatBadge(
                                  script.format
                                )}`}
                              >
                                {script.format}
                              </span>
                              <span className="text-[9px] text-slate-400 truncate">
                                {status.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-800 font-semibold truncate">
                              {script.title}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN PRODUCTION PIPELINE (CLEAN SLATE COLUMNS) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              { key: 'idea', label: '1. Ideas' },
              { key: 'guion_aprobado', label: '2. Guión OK' },
              { key: 'listo_grabar', label: '3. Por Grabar' },
              { key: 'en_edicion', label: '4. En Edición' },
              { key: 'programado', label: '5. Programado' },
              { key: 'publicado', label: '6. Publicado' }
            ] as const
          ).map(column => {
            const colScripts = filteredScripts.filter(s => s.status === column.key)
            return (
              <div
                key={column.key}
                className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between min-h-[450px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {column.label}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-700 font-mono font-bold">
                      {colScripts.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colScripts.map(script => (
                      <div
                        key={script.id}
                        onClick={() => onSelectScript(script.id)}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#ff4b0b] text-left cursor-pointer transition space-y-2 shadow-2xs group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getFormatBadge(
                              script.format
                            )}`}
                          >
                            {script.format}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {script.scheduledDate ? script.scheduledDate.slice(5) : ''}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#ff4b0b] transition line-clamp-2">
                          {script.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 italic truncate">
                          "{script.hook.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VIEW 3: TABLE (CLEAN WHITE TABLE) */}
      {viewMode === 'tabla' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5">Título</th>
                <th className="p-3.5">Formato</th>
                <th className="p-3.5">Canal</th>
                <th className="p-3.5">Gancho Verbal (Hook)</th>
                <th className="p-3.5">Trigger ManyChat</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScripts.map(script => {
                const status = getStatusBadge(script.status)
                return (
                  <tr key={script.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-bold text-slate-900">{script.title}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getFormatBadge(
                          script.format
                        )}`}
                      >
                        {script.format}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 capitalize">{script.platform}</td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate italic">
                      "{script.hook.text}"
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      {script.cta.triggerKeyword}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectScript(script.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ff4b0b] hover:text-white text-slate-700 transition text-[11px] font-semibold cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
