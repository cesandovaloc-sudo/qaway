import React from 'react'
import { TenantAgentWorkspace, ToneArchetype } from '../types/agent.types'
import {
  Volume2,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Flame,
  ShieldAlert
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentVoiceStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const handleToneChange = (tone: ToneArchetype) => {
    onUpdateWorkspace(prev => ({ ...prev, tone }))
  }

  const handleTemperatureChange = (temperature: number) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        temperature
      }
    }))
  }

  const toneArchetypes: { key: ToneArchetype; title: string; desc: string; sample: string }[] = [
    {
      key: 'ejecutivo_formal',
      title: 'Formal & Ejecutivo',
      desc: 'Sobrio, estructurado, cortés y de alta confiabilidad corporativa.',
      sample: 'Estimado/a, con mucho gusto le presento las especificaciones técnicas de nuestro catálogo de desarrollo SaaS...'
    },
    {
      key: 'cercano_empatico',
      title: 'Cercano & Empático',
      desc: 'Cálido, accesible, humano, con vocabulario amable y atento a emociones.',
      sample: '¡Hola! Qué gusto saludarte. Comprendo perfectamente lo que necesitas para tu negocio, vamos a resolverlo juntos...'
    },
    {
      key: 'dinamico_innovador',
      title: 'Dinámico & Innovador',
      desc: 'Ágil, moderno, entusiasta, orientado al ecosistema startup y tecnología.',
      sample: '¡Genial que nos escribas! En Qaway Lab aceleramos tus flujos de trabajo con agentes IA y sistemas web a medida...'
    },
    {
      key: 'clinico_profesional',
      title: 'Clínico & Profesional',
      desc: 'Riguroso, tranquilizador, con terminología precisa para salud y bienestar.',
      sample: 'Buenas tardes. Nuestro equipo médico veterinario está a tu disposición para priorizar la salud y bienestar de tu mascota...'
    }
  ]

  const isTempSafe = workspace.aiSettings.temperature <= 0.35

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            Capa 1 & Estilo Conversacional
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Voz de Marca, Tono y Calibración Anti-Alucinación
          </h2>
          <p className="text-xs text-slate-500">
            Define la personalidad del agente y calibra la temperatura estocástica para evitar respuestas inventadas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Selectores de Tono y Temperatura */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Arquetipos de Tono */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              1. Arquetipo de Personalidad y Tono
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {toneArchetypes.map(t => {
                const isSelected = workspace.tone === t.key
                return (
                  <div
                    key={t.key}
                    onClick={() => handleToneChange(t.key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/70 border-[#4f46e5] ring-2 ring-[#4f46e5]/20 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-black text-slate-800">{t.title}</h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4f46e5]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">{t.desc}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 italic">
                      "{t.sample}"
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card: Calibración de Temperatura Anti-Alucinación (PAIR Framework) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#4f46e5]" />
                  2. Calibración de Temperatura (Anti-Alucinación)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recomendado por Google Responsible AI: entre 0.2 y 0.35 para agentes consultivos precisos.
                </p>
              </div>

              <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                isTempSafe
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                T° {workspace.aiSettings.temperature.toFixed(2)} {isTempSafe ? '(Zona Segura)' : '(Riesgo de Creatividad)'}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={workspace.aiSettings.temperature}
                onChange={e => handleTemperatureChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4f46e5]"
              />

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>0.1 (Determinista / Mínimo error)</span>
                <span className="text-emerald-600">0.25 - 0.30 (Estándar Qaway Lab)</span>
                <span>0.8 (Alta Alucinación / Ficción)</span>
              </div>
            </div>

            {!isTempSafe && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Una temperatura mayor a 0.35 aumenta el riesgo de que el modelo invente precios, servicios inexistentes o políticas no autorizadas.
                </span>
              </div>
            )}
          </div>

          {/* Card: Mensaje de Derivación Humana */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              3. Mensaje de Traspaso Humano (Human Handover)
            </h3>
            <p className="text-xs text-slate-500">
              Mensaje emitido automáticamente cuando el usuario solicita hablar con un asesor o formula una queja.
            </p>
            <textarea
              rows={2}
              value={workspace.handoverMessage}
              onChange={e => onUpdateWorkspace(prev => ({ ...prev, handoverMessage: e.target.value }))}
              placeholder="Comprendo. He registrado tu solicitud para que un asesor especializado tome contacto..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]"
            />
          </div>

        </div>

        {/* Columna Derecha: Reglas WhatsApp-First */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#4f46e5]">
              <Smartphone className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Reglas WhatsApp-First
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para optimizar la tasa de respuesta en canales móviles, el motor inyecta estas directrices ergonómicas:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">Párrafos Cortos</strong>
                Máximo 2 a 4 líneas por párrafo para evitar "muros de texto" que abrumen al cliente.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">Sin Cierres Robóticos</strong>
                Prohibido repetir siempre la misma muletilla de cierre ("¿Hay algo más...?"). Variación fluida.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">Uso Elegante de Emojis</strong>
                Máximo 1 a 2 emojis profesionales por interacción para preservar la credibilidad de marca.
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="block text-slate-900 mb-0.5">Calidez ante Saludos</strong>
                Respuestas directas y empáticas ante preguntas casuales ("¿cómo estás?"), sin arrojar el menú completo.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
