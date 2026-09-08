import React, { useState } from 'react'
import { TenantWorkspace, ScriptItem, CreatorTask } from '../types/content.types'
import {
  TrendingUp,
  Video,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Shield,
  Layers,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
  Play
} from 'lucide-react'

interface ExecutiveDashboardProps {
  currentTenant: TenantWorkspace
  scripts: ScriptItem[]
  tasks: CreatorTask[]
  onToggleTask: (taskId: string) => void
  onNavigateToTab: (tabKey: any) => void
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  currentTenant,
  scripts,
  tasks,
  onToggleTask,
  onNavigateToTab
}) => {
  // Calculations
  const totalPlanned = currentTenant.currentMonthProgress.planned
  const recorded = scripts.filter(s => s.status === 'listo_grabar' || s.status === 'en_edicion' || s.status === 'programado' || s.status === 'publicado').length
  const published = scripts.filter(s => s.status === 'publicado').length

  const completionPercent = Math.min(100, Math.round((recorded / (totalPlanned || 1)) * 100))

  // Estimate total camera recording time needed
  const totalWords = scripts.reduce((acc, s) => acc + (s.hook.wordCount || 15) + (s.coreBody.split(' ').length || 50), 0)
  const totalRecordingMinutes = Math.max(15, Math.round((totalWords / 150) * 1.5))

  // Donut SVG parameters (matching reference circular graph)
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference

  return (
    <div className="space-y-6 text-slate-800">
      {/* TOP GREETING & CONTEXT HEADER */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Panel Ejecutivo · {currentTenant.currentMonthProgress.targetMonth}
            </span>
            <span className="text-xs text-slate-400 font-medium">Espacio: {currentTenant.name}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Resumen de Producción de Contenidos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real del progreso editorial, tiempo de cámara estimado y ejecución de ganchos virales para <strong className="text-slate-700">{currentTenant.niche}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateToTab('script')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#4f46e5]/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nuevo Guión</span>
          </button>
          <button
            onClick={() => onNavigateToTab('matrix')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Árbol de Nodos</span>
          </button>
        </div>
      </div>

      {/* 4 EXECUTIVE KPI CARDS (Crisp Minimal White with Indigo Icon Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan Mensual</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{scripts.length}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalPlanned} meta</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-indigo-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-[#4f46e5]" />
            <span>Ritmo: +14.2% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avance de Producción</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#4f46e5] font-mono tracking-tight">{completionPercent}%</span>
            <span className="text-xs font-medium text-slate-500">completado</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium">
            <span>{recorded} piezas listas para rodar</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiempo en Cámara</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{totalRecordingMinutes}</span>
            <span className="text-xs font-medium text-slate-500">minutos totales</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium">
            <Video className="w-3.5 h-3.5 text-[#4f46e5]" />
            <span>1 sola sesión semanal de grabación</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Embudo ManyChat</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">100%</span>
            <span className="text-xs font-medium text-slate-500">activo</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium">
            <span>Triggers: SKILL, AUDITORIA</span>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: 3 CARDS MATCHING EXACTLY THE REFERENCE media_1788864698245.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: OVERVIEW WITH PURPLE HIGHLIGHTED ROW (3 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Resumen de Canales</h3>
              <span className="text-xs text-[#4f46e5] font-semibold">Septiembre</span>
            </div>

            {/* List with top item highlighted in solid purple as in the reference image */}
            <div className="space-y-2">
              <div className="p-3 bg-[#4f46e5] text-white rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold">Reels de Instagram</p>
                  <span className="text-[10px] text-indigo-100">Alto impacto algorítmico</span>
                </div>
                <span className="text-sm font-black font-mono">18 piezas</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Carruseles Educativos</p>
                  <span className="text-[10px] text-slate-400">Retención & Guardados</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-700">6 piezas</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Blog Qaway & SEO</p>
                  <span className="text-[10px] text-slate-400">Tráfico orgánico B2B</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-700">4 artículos</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-center cursor-pointer"
          >
            Ver Canales Editoriales →
          </button>
        </div>

        {/* CARD 2: TOTAL TASKS CIRCULAR DONUT (4 cols - EXACTLY AS IN media_1788864698245.jpg) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Total Tasks</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#4f46e5]">
                Meta: {totalPlanned}
              </span>
            </div>

            {/* Circular Donut in Purple Stroke */}
            <div className="flex flex-col items-center justify-center my-3 relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e0e7ff"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#4f46e5"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Centered label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 font-mono">{completionPercent}%</span>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Tasks Done</span>
              </div>
            </div>

            {/* Sub breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Grabados</span>
                <span className="text-base font-black text-slate-900 font-mono">{recorded}</span>
              </div>
              <div className="p-1 border-x border-slate-100">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Publicados</span>
                <span className="text-base font-black text-[#4f46e5] font-mono">{published}</span>
              </div>
              <div className="p-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Restantes</span>
                <span className="text-base font-black text-slate-600 font-mono">{Math.max(0, totalPlanned - recorded)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-center cursor-pointer"
          >
            Ver Calendario Editorial →
          </button>
        </div>

        {/* CARD 3: TASK LIST / CHECKLIST (4 cols - EXACTLY AS IN media_1788864698245.jpg) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Task List</h3>
              <span className="text-xs font-bold text-[#4f46e5]">
                {tasks.filter(t => t.completed).length} de {tasks.length} listas
              </span>
            </div>

            {/* Tasks with indigo checks */}
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`group p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50 border-slate-100 text-slate-400'
                      : 'bg-white border-slate-100 text-slate-800 hover:border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        task.completed
                          ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                          : 'border-slate-300 group-hover:border-[#4f46e5] bg-white'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium leading-tight ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Vence: {task.dueDate}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      task.priority === 'alta'
                        ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sincronización activa</span>
            <button
              onClick={() => onNavigateToTab('script')}
              className="text-[#4f46e5] font-bold hover:underline cursor-pointer"
            >
              Comenzar a escribir →
            </button>
          </div>
        </div>
      </div>

      {/* TOP SELLING / SCHEDULED PIECES TABLE (Idéntica a la tabla inferior de la referencia) */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Top Selling & Línea de Producción
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado de aprobación de guiones y tomas modulares preparadas
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            See All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Pieza / Título</th>
                <th className="py-3 px-4">Formato</th>
                <th className="py-3 px-4">Gancho (Hook)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scripts.slice(0, 5).map(script => (
                <tr key={script.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {script.title}
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono text-[10px] text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {script.format}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                    "{script.hook.text}"
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#4f46e5] border border-indigo-100">
                      {script.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigateToTab('script')}
                      className="text-[#4f46e5] font-bold hover:underline cursor-pointer"
                    >
                      Editar →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
