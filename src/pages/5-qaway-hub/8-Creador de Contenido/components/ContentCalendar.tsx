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

  // Format Badges with Indigo Accents
  const getFormatBadge = (format: ContentFormat) => {
    switch (format) {
      case 'reel':
        return 'bg-indigo-50 text-[#4f46e5] border-indigo-100'
      case 'carrusel':
        return 'bg-indigo-50 text-[#4f46e5] border-indigo-100'
      case 'story':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'post':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'blog':
        return 'bg-indigo-50 text-[#4f46e5] border-indigo-100 font-bold'
    }
  }

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'idea':
        return { label: 'Idea', color: 'bg-slate-100 text-slate-600 border-slate-200' }
      case 'guion_aprobado':
        return { label: 'Guión OK', color: 'bg-indigo-50 text-[#4f46e5] border-indigo-100 font-semibold' }
      case 'listo_grabar':
        return { label: 'Por Grabar', color: 'bg-indigo-50 text-[#4f46e5] border-indigo-200 font-bold' }
      case 'en_edicion':
        return { label: 'En Edición', color: 'bg-slate-100 text-slate-700 border-slate-200' }
      case 'programado':
        return { label: 'Programado', color: 'bg-[#4f46e5] text-white border-[#4f46e5]' }
      case 'publicado':
        return { label: 'Publicado', color: 'bg-[#4f46e5] text-white border-[#4f46e5]' }
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
      {/* Top Banner (Purple/Indigo Theme) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
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

        {/* Format counts in clean monochromatic pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
            <span className="text-xs text-[#4f46e5] font-bold block">{reelsCount} Reels</span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
            <span className="text-xs text-[#4f46e5] font-bold block">{carruselesCount} Carruseles</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-xs text-slate-800 font-bold block">{postsCount} Posts</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-xs text-slate-800 font-bold block">{blogsCount} Blogs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setViewMode('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'mes' ? 'bg-[#4f46e5] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vista Mes (30 Días)
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'kanban' ? 'bg-[#4f46e5] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kanban de Producción
          </button>
          <button
            onClick={() => setViewMode('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'tabla' ? 'bg-[#4f46e5] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
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
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5] shadow-2xs"
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

      {/* VIEW 1: 30 DAYS MONTHLY GRID */}
      {viewMode === 'mes' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 overflow-x-auto shadow-sm">
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
                    className="min-h-[115px] bg-slate-50/60 border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between hover:border-indigo-200 transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-400">{day}</span>
                      {dayScripts.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayScripts.map(script => {
                        const status = getStatusBadge(script.status)
                        return (
                          <div
                            key={script.id}
                            onClick={() => onSelectScript(script.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#4f46e5] text-left cursor-pointer transition shadow-2xs"
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

      {/* VIEW 2: KANBAN PRODUCTION PIPELINE */}
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

                  <div className="space-y-2">
                    {colScripts.map(script => (
                      <div
                        key={script.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs hover:border-indigo-200 transition space-y-2 cursor-pointer"
                        onClick={() => onSelectScript(script.id)}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getFormatBadge(
                              script.format
                            )}`}
                          >
                            {script.format}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {script.scheduledDate ? script.scheduledDate.slice(5) : 'Sin fecha'}
                          </span>
                        </div>

                        <h5 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {script.title}
                        </h5>

                        <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                          "{script.hook.text}"
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">
                            {script.hook.wordCount || 12} palabras
                          </span>

                          <select
                            value={script.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => onUpdateStatus(script.id, e.target.value as ContentStatus)}
                            className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-semibold focus:outline-none"
                          >
                            <option value="idea">Idea</option>
                            <option value="guion_aprobado">Guión OK</option>
                            <option value="listo_grabar">Por Grabar</option>
                            <option value="en_edicion">En Edición</option>
                            <option value="programado">Programado</option>
                            <option value="publicado">Publicado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert('Para agregar un contenido, redacta un nuevo guión en Script Studio.')}
                  className="w-full mt-3 py-1.5 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-400 text-xs font-semibold transition cursor-pointer text-center"
                >
                  + Nuevo
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* VIEW 3: DETAILED TABLE */}
      {viewMode === 'tabla' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Título del Contenido</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Gancho Verbal</th>
                  <th className="py-3 px-4">ManyChat Trigger</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScripts.map(script => {
                  const status = getStatusBadge(script.status)
                  return (
                    <tr key={script.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {script.scheduledDate || '2026-09-18'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        {script.title}
                      </td>
                      <td className="py-3 px-4 uppercase font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded border ${getFormatBadge(script.format)}`}>
                          {script.format}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                        "{script.hook.text}"
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        {script.cta.triggerKeyword ? `Palabra: ${script.cta.triggerKeyword}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={script.status}
                          onChange={e => onUpdateStatus(script.id, e.target.value as ContentStatus)}
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border cursor-pointer ${status.color}`}
                        >
                          <option value="idea">Idea</option>
                          <option value="guion_aprobado">Guión OK</option>
                          <option value="listo_grabar">Por Grabar</option>
                          <option value="en_edicion">En Edición</option>
                          <option value="programado">Programado</option>
                          <option value="publicado">Publicado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectScript(script.id)}
                          className="text-[#4f46e5] font-bold hover:underline cursor-pointer"
                        >
                          Abrir →
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
