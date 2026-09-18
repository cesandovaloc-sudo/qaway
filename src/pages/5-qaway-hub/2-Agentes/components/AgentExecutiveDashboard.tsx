import React from 'react'
import { TenantAgentWorkspace } from '../types/agent.types'
import {
  ShieldCheck,
  Bot,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Activity,
  Award
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onNavigateTab: (tab: any) => void
  onRunSimulation: () => void
}

export const AgentExecutiveDashboard: React.FC<Props> = ({
  workspace,
  onNavigateTab,
  onRunSimulation
}) => {
  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Cumplimiento Normativo Ley 31814 */}
      <div className="bg-gradient-to-r from-[#4f46e5] to-[#4338ca] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Ley Peruana Nº 31814 & Google Responsible AI
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Agente IA: {workspace.agentName}
            </h2>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Configuración y gobernanza de tu consultor autónomo para {workspace.name}. Arquitectura en 3 capas con guardrails inviolables y derivación humana activa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRunSimulation}
              className="bg-white text-[#4f46e5] hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Simular en Playground
            </button>
            <button
              onClick={() => onNavigateTab('knowledge')}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              Entrenar Conocimiento
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Score Ético Legal
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">
              {workspace.metrics.complianceScore}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Óptimo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            D.S. 066-2024-PCM y PAIR al día
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Consultas Totales
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">
              {workspace.metrics.totalConversations}
            </span>
            <span className="text-xs font-bold text-indigo-600">Canal WABA / Web</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Atención 24/7 sin latencia humana
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Traspaso a Humanos
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">
              {workspace.metrics.handoffCount}
            </span>
            <span className="text-xs font-bold text-amber-600">Derivados</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {workspace.aiSettings.human_handoff_keywords.length} disparadores activos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modelo LLM Activo
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-800 truncate">
              {workspace.aiSettings.model}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 uppercase font-semibold">
            Modo {workspace.aiSettings.mode} • T° {workspace.aiSettings.temperature}
          </p>
        </div>
      </div>

      {/* Auditoría de Capas y Resumen del Agente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Auditoría de Capas de Gobernanza */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800">
                Arquitectura de Gobernanza en 3 Capas
              </h3>
              <p className="text-xs text-slate-500">
                Jerarquía de seguridad estricta para {workspace.name}
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              100% Blindado
            </span>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center text-xs font-black shrink-0">
                0
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Capa 0: Core Ético & Legal Inviolable
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Inmutable
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Transparencia de IA obligatoria, Human Handoff sin bucles, protección de datos (Ley 29733) y blindaje anti-prompt injection.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Capa 1: Personalidad & Voz de Marca
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                    {workspace.tone.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Nombre: <strong className="text-slate-700">{workspace.agentName}</strong>. Redacción ergonómica WhatsApp-First (máx 3-4 líneas), tono consultivo y empatía natural.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-400 text-white flex items-center justify-center text-xs font-black shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Capa 2: Conocimiento & Políticas de Negocio
                  </h4>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-sm">
                    {workspace.knowledgeBase.length} servicios • {workspace.faqs.length} FAQs
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Catálogo autorizado, rangos de inversión orientativos y directivas de degradación elegante ante dudas fuera de base.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3: Checklist Rápido de Calidad y Atajos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-800 mb-1">
              Checklist de Gobernanza
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Verificaciones del marco regulatorio
            </p>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Declaración de IA explícita al usuario</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Traspaso a humano con palabras clave</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Restricción de tarjetas y contraseñas</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Temperatura &le; 0.35 anti-alucinación</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Formato móvil de párrafos breves</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigateTab('identity')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-[#4f46e5] transition-all cursor-pointer"
            >
              <span>Editar Identidad & Capa 0</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('voice')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-[#4f46e5] transition-all cursor-pointer"
            >
              <span>Calibrar Tono & Capa 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('deploy')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-[#4f46e5] transition-all cursor-pointer"
            >
              <span>Conectar WABA WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
