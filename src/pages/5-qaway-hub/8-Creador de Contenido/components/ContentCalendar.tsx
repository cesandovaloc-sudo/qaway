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
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredScripts = scripts.filter(s => {
    const matchesChannel = filterChannel === 'all' || s.format === filterChannel
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    return matchesChannel && matchesStatus
  })

  // Format badge colors
  const getFormatBadge = (format: ContentFormat) => {
    switch (format) {
      case 'reel':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      case 'carrusel':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'story':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'post':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'blog':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  }

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'idea':
        return { label: 'Idea', color: 'bg-white/10 text-white/70' }
      case 'guion_aprobado':
        return { label: 'Guión OK', color: 'bg-blue-500/20 text-blue-400' }
      case 'listo_grabar':
        return { label: 'Listo Grabar', color: 'bg-amber-500/20 text-amber-400' }
      case 'en_edicion':
        return { label: 'En Edición', color: 'bg-purple-500/20 text-purple-400' }
      case 'programado':
        return { label: 'Programado', color: 'bg-[#fe6612]/20 text-[#fe6612]' }
      case 'publicado':
        return { label: 'Publicado', color: 'bg-emerald-500/20 text-emerald-400' }
    }
  }

  // Summary counts
  const reelsCount = scripts.filter(s => s.format === 'reel').length
  const carruselesCount = scripts.filter(s => s.format === 'carrusel').length
  const postsCount = scripts.filter(s => s.format === 'post').length
  const blogsCount = scripts.filter(s => s.format === 'blog').length

  // Days of month mock grid (30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#191918]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Skill 04 · Content Manager
              </span>
              <span className="text-xs text-white/50">Planificación 30 Días</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Calendario Editorial & Gestión de Producción
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Visualiza y equilibra tu parrilla mensual combinando Reels, Carruseles, Stories, Posts individuales y Artículos de Blog.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-center">
              <span className="text-xs text-rose-400 font-semibold block">{reelsCount} Reels</span>
            </div>
            <div className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-center">
              <span className="text-xs text-purple-400 font-semibold block">{carruselesCount} Carruseles</span>
            </div>
            <div className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-center">
              <span className="text-xs text-blue-400 font-semibold block">{postsCount} Posts</span>
            </div>
            <div className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-center">
              <span className="text-xs text-emerald-400 font-semibold block">{blogsCount} Blogs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: View Switcher & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Switchers */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setViewMode('mes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'mes' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Vista Mes (30 Días)
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'kanban' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Kanban de Producción
          </button>
          <button
            onClick={() => setViewMode('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'tabla' ? 'bg-[#fe6612] text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Tabla Detallada
          </button>
        </div>

        {/* Filter by format */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Filtrar Canal:</span>
          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#fe6612]"
          >
            <option value="all" className="bg-[#1e1e1d]">Todos los Canales</option>
            <option value="reel" className="bg-[#1e1e1d]">Reels / Shorts</option>
            <option value="carrusel" className="bg-[#1e1e1d]">Carruseles</option>
            <option value="post" className="bg-[#1e1e1d]">Posts</option>
            <option value="blog" className="bg-[#1e1e1d]">Blog Qaway</option>
            <option value="story" className="bg-[#1e1e1d]">Stories</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: 30 DAYS MONTHLY GRID */}
      {viewMode === 'mes' && (
        <div className="bg-[#191918] border border-white/10 rounded-2xl p-6 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-white/40 uppercase tracking-wider">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* 30 Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map(day => {
                // Find scripts scheduled for this day
                const dayScripts = filteredScripts.filter(s => {
                  const dayNum = s.scheduledDate ? parseInt(s.scheduledDate.split('-')[2]) : 0
                  return dayNum === day
                })

                return (
                  <div
                    key={day}
                    className="min-h-[110px] bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between hover:border-white/20 transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-white/50">{day}</span>
                      {dayScripts.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fe6612]" />
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayScripts.map(script => {
                        const status = getStatusBadge(script.status)
                        return (
                          <div
                            key={script.id}
                            onClick={() => onSelectScript(script.id)}
                            className="p-1.5 rounded-lg bg-[#242423] border border-white/10 hover:border-[#fe6612] text-left cursor-pointer transition"
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span
                                className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded border ${getFormatBadge(
                                  script.format
                                )}`}
                              >
                                {script.format}
                              </span>
                              <span className="text-[9px] text-white/40 truncate">
                                {status.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-white font-medium truncate">
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
                className="bg-[#191918] border border-white/10 rounded-2xl p-3 flex flex-col justify-between min-h-[450px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {column.label}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/70 font-mono">
                      {colScripts.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colScripts.map(script => (
                      <div
                        key={script.id}
                        onClick={() => onSelectScript(script.id)}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#fe6612] text-left cursor-pointer transition space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getFormatBadge(
                              script.format
                            )}`}
                          >
                            {script.format}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {script.scheduledDate || 'Sin fecha'}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-white group-hover:text-[#fe6612] transition line-clamp-2">
                          {script.title}
                        </h5>
                        <p className="text-[11px] text-white/60 italic truncate">
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

      {/* VIEW 3: TABLE */}
      {viewMode === 'tabla' && (
        <div className="bg-[#191918] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 text-white/50 font-semibold uppercase tracking-wider border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {filteredScripts.map(script => {
                const status = getStatusBadge(script.status)
                return (
                  <tr key={script.id} className="hover:bg-white/[0.02] transition">
                    <td className="p-3.5 font-semibold text-white">{script.title}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getFormatBadge(
                          script.format
                        )}`}
                      >
                        {script.format}
                      </span>
                    </td>
                    <td className="p-3.5 text-white/70 capitalize">{script.platform}</td>
                    <td className="p-3.5 text-white/80 max-w-xs truncate italic">
                      "{script.hook.text}"
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {script.cta.triggerKeyword}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectScript(script.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#fe6612] text-white transition text-[11px] cursor-pointer"
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
