import React from 'react'
import { TenantAgentWorkspace, ModelProvider, BillingMode, AgentRole } from '../types/agent.types'
import {
  Bot,
  ShieldCheck,
  Cpu,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Info,
  Lock
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentIdentityStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const handleRoleChange = (role: AgentRole) => {
    onUpdateWorkspace(prev => ({ ...prev, role }))
  }

  const handleProviderChange = (provider: ModelProvider) => {
    let defaultModel = 'gemini-2.5-flash'
    if (provider === 'openai') defaultModel = 'gpt-4o-mini'
    if (provider === 'anthropic') defaultModel = 'claude-3-5-sonnet-20241022'

    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        provider,
        model: defaultModel
      }
    }))
  }

  const handleModelChange = (model: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        model
      }
    }))
  }

  const handleModeChange = (mode: BillingMode) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        mode
      }
    }))
  }

  const handleApiKeyChange = (api_key: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        api_key: api_key.trim() || null
      }
    }))
  }

  const roleOptions: { key: AgentRole; label: string; desc: string }[] = [
    {
      key: 'consultoria_ventas',
      label: 'Consultoría & Ventas B2B/B2C',
      desc: 'Resuelve objeciones, presenta el catálogo y califica la intención de compra.'
    },
    {
      key: 'agendamiento_citas',
      label: 'Agendamiento & Citas',
      desc: 'Coordina horarios, recopila datos de reserva y deriva al link de agenda.'
    },
    {
      key: 'calificacion_leads',
      label: 'Calificación de Prospectos',
      desc: 'Filtra presupuesto, urgencia y necesidad antes de derivar con un ejecutivo.'
    },
    {
      key: 'soporte_tecnico',
      label: 'Soporte y Orientación',
      desc: 'Guía paso a paso sobre el servicio, resuelve FAQs y eleva incidencias.'
    }
  ]

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold mb-1">
              <Bot className="w-3.5 h-3.5" />
              Capa 0 & Identidad Central
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Identidad, Misión y Motor LLM
            </h2>
            <p className="text-xs text-slate-500">
              Define el nombre oficial, propósito consultivo y proveedor de inteligencia artificial para {workspace.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Identidad y Rol */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Datos Básicos del Agente */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              1. Identidad de Marca y Nombre
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nombre del Agente
                </label>
                <input
                  type="text"
                  value={workspace.agentName}
                  onChange={e => onUpdateWorkspace(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="Ej. QawayBot Consultor, Luna, Sofía..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Sector o Industria
                </label>
                <input
                  type="text"
                  value={workspace.industry}
                  onChange={e => onUpdateWorkspace(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Ej. Salud, Inmobiliaria, E-commerce..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
                />
              </div>
            </div>

            {/* Saludo de Entrada con Transparencia Ley 31814 */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  Mensaje de Saludo Inicial (Transparencia Ley 31814)
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Debe identificarse como IA
                </span>
              </div>
              <textarea
                rows={2}
                value={workspace.welcomeGreeting}
                onChange={e => onUpdateWorkspace(prev => ({ ...prev, welcomeGreeting: e.target.value }))}
                placeholder="¡Hola! Soy el Asistente Virtual Oficial de la empresa (IA)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
              />
              <p className="text-[11px] text-slate-500 italic">
                * Conforme al Art. 5 del D.S. 066-2024-PCM, el usuario debe saber en su primer contacto que interactúa con un sistema de inteligencia artificial.
              </p>
            </div>
          </div>

          {/* Card: Misión y Rol de Negocio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              2. Misión y Rol Operativo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map(r => {
                const isSelected = workspace.role === r.key
                return (
                  <div
                    key={r.key}
                    onClick={() => handleRoleChange(r.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-[#4f46e5] ring-2 ring-[#4f46e5]/20'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">{r.label}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4f46e5]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card: Proveedor de LLM y Facturación */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#4f46e5]" />
              3. Motor de Inteligencia Artificial (Multi-Modelo)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  workspace.aiSettings.provider === 'gemini'
                    ? 'bg-indigo-50 border-[#4f46e5] ring-2 ring-[#4f46e5]/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold text-[#4f46e5] uppercase block">Google</span>
                <span className="text-xs font-bold text-slate-800">Gemini 2.5 Flash</span>
                <span className="text-[10px] text-slate-500 block mt-1">Recomendado • Baja latencia</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('openai')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  workspace.aiSettings.provider === 'openai'
                    ? 'bg-indigo-50 border-[#4f46e5] ring-2 ring-[#4f46e5]/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">OpenAI</span>
                <span className="text-xs font-bold text-slate-800">GPT-4o / 4o-mini</span>
                <span className="text-[10px] text-slate-500 block mt-1">Alta precisión semántica</span>
              </button>

              <button
                type="button"
                onClick={() => handleProviderChange('anthropic')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  workspace.aiSettings.provider === 'anthropic'
                    ? 'bg-indigo-50 border-[#4f46e5] ring-2 ring-[#4f46e5]/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold text-purple-600 uppercase block">Anthropic</span>
                <span className="text-xs font-bold text-slate-800">Claude 3.5 Sonnet</span>
                <span className="text-[10px] text-slate-500 block mt-1">Razonamiento profundo</span>
              </button>
            </div>

            {/* Modalidad de Cuenta: Managed vs BYOK */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleModeChange('managed')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  workspace.aiSettings.mode === 'managed'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-xs font-bold block mb-1">
                  Plan Gestionado (Qaway Managed)
                </span>
                <p className={`text-[11px] leading-relaxed ${workspace.aiSettings.mode === 'managed' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Usa la infraestructura y Master Keys de Qaway Lab sin preocuparte por cuentas externas ni saldos.
                </p>
              </div>

              <div
                onClick={() => handleModeChange('byok')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  workspace.aiSettings.mode === 'byok'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-xs font-bold block mb-1">
                  Bring Your Own Key (BYOK)
                </span>
                <p className={`text-[11px] leading-relaxed ${workspace.aiSettings.mode === 'byok' ? 'text-slate-300' : 'text-slate-500'}`}>
                  El cliente ingresa su propia clave API para facturar el consumo de tokens en su propia cuenta de desarrollador.
                </p>
              </div>
            </div>

            {workspace.aiSettings.mode === 'byok' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  Ingresa tu API Key de {workspace.aiSettings.provider.toUpperCase()}
                </label>
                <input
                  type="password"
                  value={workspace.aiSettings.api_key || ''}
                  onChange={e => handleApiKeyChange(e.target.value)}
                  placeholder={`Ej. ${workspace.aiSettings.provider === 'openai' ? 'sk-proj-...' : 'AIzaSy...'}`}
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-800">
                  * La clave se guarda de manera segura en tu tenant y solo se invoca en llamadas autenticadas.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha: Bloque de Inmutabilidad de Capa 0 */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Lock className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Capa 0: Inviolable & Permanente
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Las directivas de la <strong>Capa 0</strong> son inyectadas de forma inmutable por el backend de Supabase antes de cualquier prompt de la empresa.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white block mb-0.5">1. Ley Nº 31814 (Perú)</span>
                Transparencia activa obligatoria. Prohibición expresa de simular ser un humano real.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white block mb-0.5">2. Human Handoff</span>
                Traspaso inmediato a operadores humanos ante solicitudes o quejas.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white block mb-0.5">3. Privacidad Ley Nº 29733</span>
                Blindaje total contra captura de datos financieros o contraseñas.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white block mb-0.5">4. Anti-Prompt Injection</span>
                Resistencia ante ataques que intenten forzar la revelación del prompt.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>Garantía de cumplimiento legal activa en todos los canales.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
