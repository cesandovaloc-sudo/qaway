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
  const totalRecordingMinutes = Math.max(15, Math.round((totalWords / 150) * 1.5)) // factoring 1.5x for takes

  // Donut SVG parameters
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference

  return (
    <div className="space-y-6 text-slate-800">
      {/* SaaS Workspace & Tier Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#fe6612] to-[#ff4b0b] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#fe6612]/20">
            {currentTenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentTenant.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Plan {currentTenant.tier.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Multi-Tenant Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nicho: <strong className="text-slate-700">{currentTenant.niche}</strong> · {currentTenant.brandVoice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigateToTab('script')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#fe6612] to-[#ff4b0b] text-white text-xs font-semibold rounded-xl shadow-sm hover:brightness-105 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Nuevo Guión</span>
          </button>
          <button
            onClick={() => onNavigateToTab('matrix')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Matriz 5x1x3</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: 4 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Plan Mes ({currentTenant.currentMonthProgress.targetMonth})</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{scripts.length}</span>
            <span className="text-xs font-medium text-slate-400">/ {totalPlanned} objetivo</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avance de Producción</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600 font-mono">{completionPercent}%</span>
            <span className="text-xs font-medium text-slate-400">completado</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
            <span>{recorded} piezas listas para publicar</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo en Cámara Requerido</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalRecordingMinutes}</span>
            <span className="text-xs font-medium text-slate-400">minutos totales</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-700 font-medium">
            <Video className="w-3 h-3" />
            <span>1 sola sesión semanal de grabación</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Embudo ManyChat</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 font-mono">100%</span>
            <span className="text-xs font-medium text-slate-400">automatizado</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
            <span>Triggers activos: SKILL, AUDITORIA, HOOKS</span>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: 70% PROGRESS DONUT + PRODUCTION ACTIVITY CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Progress Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Cumplimiento del Mes</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-600">
                Meta: {totalPlanned}
              </span>
            </div>

            {/* Circular Donut Visual */}
            <div className="flex flex-col items-center justify-center my-3 relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fe6612" />
                    <stop offset="100%" stopColor="#5643ff" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Centered label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 font-mono">{completionPercent}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Listo</span>
              </div>
            </div>

            {/* Sub breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">Grabados</span>
                <span className="font-bold text-slate-800 font-mono">{recorded}</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-[10px] text-slate-400 block">Publicados</span>
                <span className="font-bold text-emerald-600 font-mono">{published}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Restantes</span>
                <span className="font-bold text-amber-600 font-mono">{Math.max(0, totalPlanned - recorded)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-center cursor-pointer"
          >
            Ver Calendario 30 Días →
          </button>
        </div>

        {/* Activity & Action Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Checklist de Producción Diaria</h3>
                <p className="text-xs text-slate-400">Prioridades activas para mantener la consistencia del mes</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                {tasks.filter(t => t.completed).length} de {tasks.length} tareas
              </span>
            </div>

            {/* Task list */}
            <div className="space-y-2.5">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-[#fe6612]/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-[#fe6612] transition">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>Vence: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'alta'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>¿Listo para la sesión de grabación?</span>
            <button
              onClick={() => onNavigateToTab('script')}
              className="text-[#fe6612] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Abrir Teleprompter de Guiones <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: TOP SELLING / SCHEDULED PROJECTS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Parrilla Activa de Publicación</h3>
            <p className="text-xs text-slate-400">Piezas registradas para este tenant ordenadas por fecha</p>
          </div>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Ver Todo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3">Título / Concepto</th>
                <th className="p-3">Formato</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Trigger ManyChat</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scripts.slice(0, 5).map(script => (
                <tr key={script.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-800">{script.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {script.format}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 capitalize">{script.platform}</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">
                    {script.cta.triggerKeyword}
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{script.scheduledDate || 'Pendiente'}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                      {script.status.replace('_', ' ')}
                    </span>
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
