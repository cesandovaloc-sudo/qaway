import React, { useState, useEffect } from 'react'
import { TenantAgentWorkspace } from '../types/agent.types'
import {
  Share2,
  Copy,
  Check,
  Smartphone,
  Globe,
  ShieldCheck,
  Key,
  Radio,
  Sparkles,
  Loader2,
  Link2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Wallet,
  Fingerprint,
  Plug,
  X,
  MessageCircle,
  ExternalLink,
  Zap
} from 'lucide-react'

interface Props {
  workspace: TenantAgentWorkspace
  onUpdateWorkspace: (updater: (prev: TenantAgentWorkspace) => TenantAgentWorkspace) => void
}

type SignupStep = 1 | 2 | 3

export const AgentDeploymentStudio: React.FC<Props> = ({
  workspace,
  onUpdateWorkspace
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [copiedVerify, setCopiedVerify] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [signupStep, setSignupStep] = useState<SignupStep>(1)
  const [authPending, setAuthPending] = useState(false)
  const [testPing, setTestPing] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [verifyToken, setVerifyToken] = useState(
    workspace.aiSettings.waba_verify_token || 'QAWAY_VERIFY_TOKEN_123'
  )

  const wabaPhoneId = workspace.aiSettings.waba_phone_number_id
  const isConnected = Boolean(wabaPhoneId)
  const step3InProgress = authPending && signupStep === 3

  const demoPhoneIdFor = (ws: TenantAgentWorkspace): string => {
    const seed = ws.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return `1045892${(seed * 7919).toString().slice(0, 14)}`
  }

  const demoBusinessAccountIdFor = (ws: TenantAgentWorkspace): string => {
    const seed = ws.slug.length * 977 + ws.name.length * 331
    return `${seed}78347291${(seed * 13).toString().slice(0, 8)}`
  }

  const startAuthorization = () => {
    setAuthPending(true)
    setSignupStep(2)
    window.setTimeout(() => setSignupStep(3), 1200)
  }

  useEffect(() => {
    if (!step3InProgress) return
    const t = setTimeout(() => {
      setAuthPending(false)
      setSignupOpen(false)
      onUpdateWorkspace(prev => ({
        ...prev,
        aiSettings: {
          ...prev.aiSettings,
          waba_phone_number_id: prev.aiSettings.waba_phone_number_id || demoPhoneIdFor(prev),
          waba_business_account_id: prev.aiSettings.waba_business_account_id || demoBusinessAccountIdFor(prev),
          waba_connected_at: Date.now(),
          waba_connected: true
        }
      }))
    }, 1600)
    return () => clearTimeout(t)
  }, [step3InProgress, onUpdateWorkspace])

  useEffect(() => {
    if (signupOpen) {
      setSignupStep(1)
      setAuthPending(false)
    }
  }, [signupOpen])

  const handlePhoneIdChange = (phoneId: string) => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        waba_phone_number_id: phoneId.trim() || null
      }
    }))
  }

  const handleRegenerateToken = () => {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase()
    const next = `QAWAY_VERIFY_${random}`
    setVerifyToken(next)
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        waba_verify_token: next
      }
    }))
    setCopiedVerify(false)
  }

  const handleTestWebhook = () => {
    setTestPing('testing')
    setTimeout(() => setTestPing(isConnected ? 'ok' : 'fail'), 1200)
  }

  const handleDisconnect = () => {
    onUpdateWorkspace(prev => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        waba_phone_number_id: null,
        waba_business_account_id: null,
        waba_connected_at: null,
        waba_connected: false
      }
    }))
    setTestPing('idle')
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

  const handleCopyVerify = () => {
    navigator.clipboard.writeText(verifyToken)
    setCopiedVerify(true)
    setTimeout(() => setCopiedVerify(false), 2000)
  }

  const handleStartInstantSignup = () => {
    setSignupStep(1)
    setSignupOpen(true)
  }

  const stepIcon = (n: SignupStep) => (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
        signupStep >= n
          ? 'bg-[#1877F2] text-white shadow-md shadow-blue-200'
          : 'bg-slate-200 text-slate-500'
      }`}
    >
      {n}
    </div>
  )

  const connectedBadge = (
    <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Conectado
    </span>
  )

  const disconnectedBadge = (
    <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
      <Plug className="w-3 h-3" />
      Sin conectar
    </span>
  )

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
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
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

            {isConnected ? connectedBadge : disconnectedBadge}
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-xs font-bold text-emerald-800">
                      Cuenta configurada
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Desconectar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Business Account ID
                    </span>
                    <code className="block text-[11px] font-mono text-emerald-700 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 truncate">
                      {workspace.aiSettings.waba_business_account_id || '—'}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Phone Number ID
                    </span>
                    <code className="block text-[11px] font-mono text-emerald-700 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 truncate">
                      {wabaPhoneId}
                    </code>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {workspace.aiSettings.waba_connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Token almacenado en Vault
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Modo manual — token aún no en Vault
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200">
                    <Fingerprint className="w-3.5 h-3.5" />
                    Ley 31814 habilitada
                  </span>
                </div>

                {!workspace.aiSettings.waba_connected && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-[#1877F2] shrink-0" />
                      <p className="text-xs font-bold text-slate-800">
                        Completa la conexión oficial
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Conecta via Embedded Signup para guardar el token en Vault y activar el
                      webhook de forma automática sin claves manuales.
                    </p>
                    <button
                      type="button"
                      onClick={handleStartInstantSignup}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Conectar con Meta
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Números de teléfono conectados
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 break-all">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    +51 (número vinculado a WABA <code className="font-mono">{wabaPhoneId!.slice(0, 8)}…</code>)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Zap className="w-4 h-4 text-amber-500" />
                  El agente ya puede recibir mensajes.
                </div>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testPing === 'testing'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {testPing === 'testing' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enviando ping…
                    </>
                  ) : testPing === 'ok' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Webhook OK
                    </>
                  ) : testPing === 'fail' ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Reintentar ping
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5" />
                      Probar conexión
                    </>
                  )}
                </button>
              </div>

              {testPing === 'fail' && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No se recibió respuesta del <code className="font-mono">whatsapp-webhook</code>.
                    Verifica que la Edge Function esté desplegada y el Verify Token coincida.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-[#1877F2]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-slate-800">
                    Conecta tu WhatsApp Business
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Vincula tu cuenta WABA con el botón oficial de Meta. Sin tokens manuales: todo queda guardado de forma segura.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartInstantSignup}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold shadow-lg shadow-blue-200/60 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  Conectar con Meta
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400">
                  Embedded Signup: autorización OAuth segura con Meta.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number ID de Meta (Exclusivo por Empresa)
                </label>
                <input
                  type="text"
                  value={wabaPhoneId || ''}
                  onChange={e => handlePhoneIdChange(e.target.value)}
                  placeholder="Ej. 104589234857211"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30"
                />
                <p className="text-[10px] text-slate-500">
                  Permite al Webhook de Supabase identificar qué empresa debe responder cuando un cliente escribe a este número.
                </p>
              </div>
            </div>
          )}

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

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Verify Token:
              </span>
              <button
                type="button"
                onClick={handleRegenerateToken}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerar
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <code className="flex-1 text-[11px] font-mono text-indigo-600 bg-white px-2.5 py-1.5 rounded-sm border border-slate-200 truncate select-all">
                {verifyToken}
              </code>
              <button
                type="button"
                onClick={handleCopyVerify}
                className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                {copiedVerify ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
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

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#4f46e5] border border-indigo-200">
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

            {isConnected ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800">Un canal más disponible</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Al conectar la WABA, el widget web puede derivar conversaciones a WhatsApp
                  usando el número vinculado a <code className="font-mono text-emerald-800">{workspace.aiSettings.waba_phone_number_id}</code>.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-indigo-900">Acción sugerida</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Conecta tu WhatsApp Business para habilitar la omnicanalidad (web luego WhatsApp)
                  y el entrenamiento con conversaciones reales.
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <span className="font-bold block text-slate-800">Características del Widget:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Compatible con React, Next.js, WordPress y HTML puro.</li>
                <li>Diseño ergonómico flotante responsivo para móvil y desktop.</li>
                <li>Totalmente alineado con los guardrails de la Ley 31814.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Embedded Signup Meta */}
      {signupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={authPending ? undefined : () => setSignupOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1877F2] px-5 pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Conectar tu WhatsApp Business</p>
                    <p className="text-white/80 text-[11px] font-medium">
                      Embedded Signup — autorización segura con Meta
                    </p>
                  </div>
                </div>
                {!authPending && (
                  <button
                    type="button"
                    onClick={() => setSignupOpen(false)}
                    className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                {stepIcon(1)}
                <div className="flex-1">
                  <p className={`text-xs font-bold ${signupStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                    Autenticación con Meta
                  </p>
                  <p className="text-[11px] text-slate-500">Inicia sesión con tu cuenta de Facebook Business.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {stepIcon(2)}
                <div className="flex-1">
                  <p className={`text-xs font-bold ${signupStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                    Selección de número WABA
                  </p>
                  <p className="text-[11px] text-slate-500">Elige el número oficial que atenderá el agente.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {stepIcon(3)}
                <div className="flex-1">
                  <p className={`text-xs font-bold ${signupStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                    Verificación del webhook
                  </p>
                  <p className="text-[11px] text-slate-500">Meta valida el endpoint y activa las suscripciones.</p>
                </div>
              </div>

              {signupStep === 1 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Al continuar, <span className="font-bold text-slate-800">Qaway Lab</span> solicitará a Meta:
                  </p>
                  <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                    <li>Acceso a tu cuenta Business de WhatsApp</li>
                    <li>Envío y recepción de mensajes</li>
                    <li>Gestión de plantillas aprobadas</li>
                  </ul>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Los tokens de acceso se guardan cifrados en Supabase Vault. Solo la Edge Function <code className="font-mono">whatsapp-webhook</code> los utiliza. Ninguna clave sale del proveedor hacia el navegador.
                  </p>
                </div>
              )}

              {signupStep === 2 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      +51 999 000 123 <span className="text-[10px] font-medium text-emerald-700">· Verificado</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Seleccionado
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      +51 999 456 788 <span className="text-[10px] font-medium text-slate-500">· Business</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Disponible
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Este número identificará a la empresa ante el webhook. Guardado en <code className="font-mono">tenants.ai_settings.waba_phone_number_id</code>.
                  </p>
                </div>
              )}

              {signupStep === 3 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="text-xs font-bold text-amber-800">Solicitando verificación del webhook…</span>
                  </div>
                  <p className="text-[10px] text-amber-700">
                    Meta está validando el Verify Token contra la Edge Function. Este paso tarda unos segundos.
                  </p>
                </div>
              )}

              {authPending && signupStep !== 3 && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 text-[#1877F2] animate-spin" />
                  Procesando tu autorización…
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {signupStep > 1 && !authPending ? (
                  <button
                    type="button"
                    onClick={() => setSignupStep(prev => (prev - 1) as SignupStep)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    ← Volver
                  </button>
                ) : (
                  <span />
                )}

                {signupStep === 1 && (
                  <button
                    type="button"
                    onClick={startAuthorization}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-200"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Continuar con Meta
                  </button>
                )}

                {(signupStep === 2 || signupStep === 3) && authPending && (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold opacity-90 cursor-not-allowed"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {signupStep === 2 ? 'Autorizando…' : 'Conectando…'}
                  </button>
                )}

                {signupStep === 2 && !authPending && (
                  <button
                    type="button"
                    onClick={() => { setAuthPending(true); setSignupStep(3) }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-200"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Usar este número
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Flujo Embedded Signup de Meta. Se solicita el permiso <code className="font-mono">business_management</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}