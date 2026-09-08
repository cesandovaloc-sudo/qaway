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

  // Donut SVG parameters (Generous scale for clarity)
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference

  return (
    <div className="space-y-8 text-slate-800">
      {/* SaaS Workspace & Tier Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fe6612] to-[#ff4b0b] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#fe6612]/20 shrink-0">
            {currentTenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{currentTenant.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Plan {currentTenant.tier.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Multi-Marca Activo
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Nicho: <strong className="text-slate-800">{currentTenant.niche}</strong> · {currentTenant.brandVoice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigateToTab('script')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#fe6612] to-[#ff4b0b] text-white text-sm font-semibold rounded-xl shadow-sm hover:brightness-105 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Nuevo Guión</span>
          </button>
          <button
            onClick={() => onNavigateToTab('matrix')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Matriz 5x1x3</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: 4 EXECUTIVE KPI CARDS (GENEROUS PADDING & LEGIBLE TYPOGRAPHY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan Mensual ({currentTenant.currentMonthProgress.targetMonth})</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{scripts.length}</span>
            <span className="text-sm font-medium text-slate-500">/ {totalPlanned} meta</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs. mes anterior</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avance de Producción</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-purple-700 font-mono tracking-tight">{completionPercent}%</span>
            <span className="text-sm font-medium text-slate-500">completado</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600 font-medium">
            <span>{recorded} piezas listas para publicar</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiempo en Cámara</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{totalRecordingMinutes}</span>
            <span className="text-sm font-medium text-slate-500">minutos totales</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-800 font-semibold">
            <Video className="w-3.5 h-3.5" />
            <span>1 sola sesión semanal de grabación</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Embudo ManyChat</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">100%</span>
            <span className="text-sm font-medium text-slate-500">activo</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600 font-medium">
            <span>Triggers: SKILL, AUDITORIA, HOOKS</span>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: PROGRESS DONUT + PRODUCTION ACTIVITY CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Progress Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cumplimiento del Mes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Progreso global de piezas grabadas</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Meta: {totalPlanned}
              </span>
            </div>

            {/* Circular Donut Visual (Enlarged and Clear) */}
            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="14"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="14"
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
                <span className="text-3xl font-black text-slate-900 font-mono">{completionPercent}%</span>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-0.5">Listo</span>
              </div>
            </div>

            {/* Sub breakdown (Legible numbers and labels) */}
            <div className="grid grid-cols-3 gap-3 text-center mt-5 pt-4 border-t border-slate-100">
              <div className="p-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Grabados</span>
                <span className="text-lg font-black text-slate-900 font-mono">{recorded}</span>
              </div>
              <div className="p-2 border-x border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Publicados</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{published}</span>
              </div>
              <div className="p-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Restantes</span>
                <span className="text-lg font-black text-amber-600 font-mono">{Math.max(0, totalPlanned - recorded)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('calendar')}
            className="w-full mt-6 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition text-center cursor-pointer"
          >
            Ver Calendario 30 Días →
          </button>
        </div>

        {/* Activity & Action Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Checklist de Producción Diaria</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prioridades activas para mantener la consistencia del mes</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {tasks.filter(t => t.completed).length} de {tasks.length} tareas completadas
              </span>
            </div>

            {/* Task list with generous vertical rhythm and structure */}
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-[#fe6612]/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button className="text-slate-400 hover:text-[#fe6612] transition">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-semibold leading-snug ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500">
                        <span className="capitalize font-medium">{task.type.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>Vence: <strong className="text-slate-700">{task.dueDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      task.priority === 'alta'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>¿Listo para la sesión de grabación?</span>
            <button
              onClick={() => onNavigateToTab('script')}
              className="text-[#fe6612] font-bold hover:underline inline-flex items-center gap-1.5 cursor-pointer text-xs"
            >
              Abrir Teleprompter de Guiones <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: TOP SCHEDULED PROJECTS TABLE (GENEROUS PADDING & FORMATTING) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Parrilla Activa de Publicación</h3>
            <p className="text-xs text-slate-500 mt-0.5">Piezas registradas para este tenant ordenadas por fecha</p>
          </div>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Ver Calendario Completo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Título / Concepto</th>
                <th className="py-3.5 px-4">Formato</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4">Trigger ManyChat</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scripts.slice(0, 5).map(script => (
                <tr key={script.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">{script.title}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {script.format}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 capitalize text-sm">{script.platform}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700 text-sm">
                    {script.cta.triggerKeyword}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono text-xs">{script.scheduledDate || 'Pendiente'}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
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
