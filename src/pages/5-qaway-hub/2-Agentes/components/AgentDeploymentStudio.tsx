import React, { useState } from 'react'
import { TenantAgentWorkspace } from '../types/agent.types'
import {
  Share2,
  Copy,
  Check,
  Smartphone,
  Globe,
  ExternalLink,
  ShieldCheck,
  Key,
  Radio,
  Sparkles
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

export const AgentDeploymentStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const handlePhoneIdChange = (phoneId: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        waba_phone_number_id: phoneId.trim() || null
      }
    }))
  }

  const webhookUrl = 'https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/whatsapp-webhook'
  const webWidgetSnippet = `<script 
  src="https://qawaylab.com/widget/agent.js" 
  data-tenant="${workspace.slug}" 
  data-agent="${workspace.agentName}"
  async>
</script>`

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(webWidgetSnippet)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold mb-1">
            <Share2 className="w-3.5 h-3.5" />
            Despliegue Multi-Canal
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Canales de Despliegue: WhatsApp Cloud API & Widget Web
          </h2>
          <p className="text-xs text-slate-500">
            Conecta tu agente directamente al número oficial de WhatsApp Business (WABA) o incrusta el widget interactivo en tu sitio web.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: WhatsApp Cloud API (WABA) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Meta WhatsApp Cloud API (WABA)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Integración oficial con WhatsApp Business
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Webhook Activo
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Phone Number ID de Meta (Exclusivo por Empresa)
              </label>
              <input
                type="text"
                value={workspace.aiSettings.waba_phone_number_id || ''}
                onChange={e => handlePhoneIdChange(e.target.value)}
                placeholder="Ej. 104589234857211"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30"
              />
              <p className="text-[10px] text-slate-500">
                Permite al Webhook de Supabase identificar qué empresa debe responder cuando un cliente escribe a este número.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Endpoint URL del Webhook (Deno Edge Function)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-600 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Verify Token:</span>
              <code className="text-[11px] font-mono text-indigo-600 bg-white px-2 py-0.5 rounded-sm border border-slate-200">
                QAWAY_VERIFY_TOKEN_123
              </code>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Widget Web Flotante */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Widget Web Flotante
                </h3>
                <span className="text-[11px] text-slate-500">
                  Incrustación con 1 línea de código en tu web
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4f46e5] border border-indigo-200">
              Listo para Instalar
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Copia y pega este script justo antes del cierre de la etiqueta <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded-sm font-mono">&lt;/body&gt;</code> de tu sitio web:
            </p>

            <div className="relative">
              <pre className="bg-slate-950 text-indigo-300 p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {webWidgetSnippet}
              </pre>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="absolute top-2.5 right-2.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">Características del Widget:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-indigo-800">
                <li>Compatible con React, Next.js, WordPress y HTML puro.</li>
                <li>Diseño ergonómico flotante responsivo para móvil y desktop.</li>
                <li>Totalmente alineado con los guardrails de la Ley 31814.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
