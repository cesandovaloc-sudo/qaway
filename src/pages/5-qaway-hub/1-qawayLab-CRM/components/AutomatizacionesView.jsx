import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Bot, RefreshCw, CheckCircle2, AlertCircle, Clock, 
  ShieldCheck, Play, Pause, ExternalLink, Sparkles, MessageSquare, 
  Terminal, Copy, Check, Filter, Power, Smartphone, Bell,
  ChevronRight, ArrowRight
} from 'lucide-react'

const DEFAULT_FLOWS = [
  {
    id: 'flow-waba-ai',
    name: 'Auto-Respuesta Autónoma 24/7 (Gemini 2.5 Flash)',
    description: 'Genera respuestas contextuales inmediatas en WhatsApp a consultas sobre catálogo, precios y servicios.',
    category: 'ai',
    active: true,
    executionsToday: 142,
    successRate: '99.4%',
    lastTriggered: 'Hace 4 min'
  },
  {
    id: 'flow-human-handover',
    name: 'Protocolo de Handover Humano (Pase a Asesor)',
    description: 'Detecta solicitudes explícitas de asesor o cotizaciones avanzadas, reasigna a etapa "Negociación" y envía alerta.',
    category: 'sales',
    active: true,
    executionsToday: 18,
    successRate: '100%',
    lastTriggered: 'Hace 18 min'
  },
  {
    id: 'flow-webhook-hostinger',
    name: 'Ingesta Instantánea Webhook Web (Hostinger / Form)',
    description: 'Captura los prospectos enviados desde los formularios del sitio web y los guarda en Supabase en tiempo real.',
    category: 'sync',
    active: true,
    executionsToday: 56,
    successRate: '100%',
    lastTriggered: 'Hace 32 min'
  },
  {
    id: 'flow-message-echoes',
    name: 'Sincronización Celular Móvil (Message Echoes)',
    description: 'Captura las respuestas manuales que el asesor envía desde la app nativa de WhatsApp en su celular y actualiza el CRM.',
    category: 'sync',
    active: true,
    executionsToday: 89,
    successRate: '98.9%',
    lastTriggered: 'Hace 9 min'
  },
  {
    id: 'flow-window-24h',
    name: 'Candado & Control de Ventana de 24h WABA',
    description: 'Bloquea mensajes libres tras 24h del último contacto del cliente y sugiere plantillas Meta aprobadas.',
    category: 'compliance',
    active: true,
    executionsToday: 23,
    successRate: '100%',
    lastTriggered: 'Hace 1 hora'
  },
  {
    id: 'flow-smart-assignment',
    name: 'Enrutamiento por Especialidad de Campaña',
    description: 'Distribuye prospectos automáticamente a Andrés Valencia (Web/SaaS), Martín Rojas (Inmobiliaria) o Sofía Castillo (Branding).',
    category: 'sales',
    active: false,
    executionsToday: 0,
    successRate: 'N/A',
    lastTriggered: 'Pausado'
  }
]

const INITIAL_LOGS = [
  {
    id: 'log-1',
    flow: 'Auto-Respuesta Autónoma 24/7',
    recipient: '+51 984 112 233',
    status: 'success',
    code: '200 OK',
    duration: '640ms',
    time: '12:58:14',
    detail: 'Gemini 2.5 respondió sobre catálogo de servicios web con tono consultivo.'
  },
  {
    id: 'log-2',
    flow: 'Protocolo de Handover Humano',
    recipient: '+51 966 333 444',
    status: 'warning',
    code: 'HANDOVER_TRIGGERED',
    duration: '310ms',
    time: '12:54:02',
    detail: 'Prospecto solicitó llamada con asesor humano. Estado actualizado a negociación.'
  },
  {
    id: 'log-3',
    flow: 'Sincronización Celular Móvil (Message Echoes)',
    recipient: '+51 988 777 666',
    status: 'success',
    code: '200 OK',
    duration: '180ms',
    time: '12:49:33',
    detail: 'Eco de mensaje manual saliente recibido desde dispositivo móvil del asesor.'
  },
  {
    id: 'log-4',
    flow: 'Ingesta Instantánea Webhook Web',
    recipient: 'Formulario /contacto',
    status: 'success',
    code: '201 CREATED',
    duration: '420ms',
    time: '12:32:10',
    detail: 'Nuevo lead insertado en Supabase leads y notificado vía Realtime.'
  }
]

export default function AutomatizacionesView() {
  const [activeSubTab, setActiveSubTab] = useState('flows') // 'flows' | 'logs' | 'endpoints'
  
  // Estado de flujos con persistencia
  const [flows, setFlows] = useState(() => {
    const saved = localStorage.getItem('qaway_crm_flows')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { return DEFAULT_FLOWS }
    }
    return DEFAULT_FLOWS
  })

  useEffect(() => {
    localStorage.setItem('qaway_crm_flows', JSON.stringify(flows))
  }, [flows])

  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [copiedKey, setCopiedKey] = useState(null)

  // Métricas dinámicas
  const metrics = useMemo(() => {
    const totalFlows = flows.length
    const activeFlows = flows.filter(f => f.active).length
    const totalExecutions = flows.reduce((sum, f) => sum + f.executionsToday, 0)
    const successRate = '99.7%'
    const hoursSaved = (totalExecutions * 0.08).toFixed(1) // Estimación 5 min por interacción

    return { totalFlows, activeFlows, totalExecutions, successRate, hoursSaved }
  }, [flows])

  // Alternar estado activo de un flujo
  const toggleFlow = (id) => {
    setFlows(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.active
        return { 
          ...f, 
          active: nextState,
          lastTriggered: nextState ? 'Activado ahora' : 'Pausado'
        }
      }
      return f
    }))
  }

  // Simular prueba de disparo
  const handleTestTrigger = (flow) => {
    const newLog = {
      id: 'log-' + Date.now(),
      flow: flow.name,
      recipient: '+51 999 000 111 (Prueba Sandbox)',
      status: 'success',
      code: '200 OK (TEST)',
      duration: '415ms',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      detail: `Prueba manual ejecutada exitosamente para la regla "${flow.name}".`
    }
    setLogs(prev => [newLog, ...prev])
    setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, executionsToday: f.executionsToday + 1, lastTriggered: 'Reciente' } : f))
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="flex flex-col h-full space-y-5 bg-white text-zinc-900 rounded-2xl border border-zinc-200/70 p-6 shadow-xs relative overflow-hidden">
      
      {/* ── 1. CABECERA & TARJETAS DE MÉTRICAS ──────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b0b]/10 text-[#ff4b0b] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Centro de Automatizaciones & Agentes IA</h2>
              <p className="text-xs text-zinc-500">Gestión de disparadores autónomos, auto-respuestas 24/7 y reglas de embudo.</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas de Automatización */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl px-3.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Flujos Activos</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-black text-zinc-900">{metrics.activeFlows}</p>
              <span className="text-[10px] text-zinc-400 font-medium">de {metrics.totalFlows}</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Disparos Hoy</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-black text-emerald-800">{metrics.totalExecutions}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">eventos</span>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 rounded-xl px-3.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Tasa de Éxito</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-black text-purple-800">{metrics.successRate}</p>
              <span className="text-[10px] text-purple-600 font-semibold">uptime</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-3.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Ahorro de Tiempo</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-base font-black text-blue-800">~{metrics.hoursSaved}h</p>
              <span className="text-[10px] text-blue-600 font-semibold">estimadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SELECTOR DE SUB-PESTAÑAS ────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2">
        <button
          onClick={() => setActiveSubTab('flows')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'flows'
              ? 'bg-[#ff4b0b] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Reglas & Flujos ({metrics.activeFlows} activos)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'logs'
              ? 'bg-[#ff4b0b] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Registro en Vivo (Logs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('endpoints')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'endpoints'
              ? 'bg-[#ff4b0b] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Endpoints & Webhooks</span>
        </button>
      </div>

      {/* ── 3. CONTENIDO SEGÚN SUB-PESTAÑA ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* VISTA 1: FLUJOS Y REGLAS */}
        {activeSubTab === 'flows' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {flows.map((flow) => (
              <motion.div
                key={flow.id}
                layout
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  flow.active 
                    ? 'bg-white border-zinc-200 shadow-xs hover:border-zinc-300' 
                    : 'bg-zinc-50/70 border-zinc-200/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        flow.category === 'ai' ? 'bg-purple-100 text-purple-700' :
                        flow.category === 'sync' ? 'bg-blue-100 text-blue-700' :
                        flow.category === 'compliance' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {flow.category === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> :
                         flow.category === 'sync' ? <RefreshCw className="w-3.5 h-3.5" /> :
                         flow.category === 'compliance' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                         <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 leading-snug">{flow.name}</h4>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => toggleFlow(flow.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        flow.active ? 'bg-[#ff4b0b]' : 'bg-zinc-300'
                      }`}
                      title={flow.active ? 'Desactivar flujo' : 'Activar flujo'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          flow.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                    {flow.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-zinc-600">Ejecutado: <strong className="text-zinc-800">{flow.executionsToday}</strong> hoy</span>
                    <span>•</span>
                    <span className="text-zinc-500">{flow.lastTriggered}</span>
                  </div>

                  <button
                    onClick={() => handleTestTrigger(flow)}
                    className="flex items-center gap-1 text-[#ff4b0b] hover:text-[#e03f06] font-semibold transition-colors"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Probar</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* VISTA 2: LOGS EN TIEMPO REAL */}
        {activeSubTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Últimos eventos procesados por la infraestructura del CRM:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Escuchando Webhooks
              </span>
            </div>

            <div className="border border-zinc-200/80 rounded-xl bg-white divide-y divide-zinc-100 overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 text-xs hover:bg-zinc-50/70 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {log.code}
                      </span>
                      <strong className="text-zinc-900">{log.flow}</strong>
                      <span className="text-zinc-400 text-[11px]">→ {log.recipient}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px]">
                      <span>{log.duration}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>

                  <p className="text-zinc-500 text-[11px] leading-relaxed pl-1">
                    {log.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 3: ENDPOINTS Y CONFIGURACIÓN DE INTEGRACIÓN */}
        {activeSubTab === 'endpoints' && (
          <div className="space-y-4 max-w-3xl">
            {/* Webhook Meta WABA */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-zinc-900">Webhook de Meta WABA (Cloud API)</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Verificado</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Endpoint que recibe los mensajes entrantes de los clientes y los ecos desde la aplicación móvil.
              </p>
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 font-mono text-[11px] text-zinc-800">
                <span className="flex-1 truncate">https://hmnmcfaxeqxeqxrcsclb.supabase.co/functions/v1/whatsapp-webhook</span>
                <button
                  onClick={() => copyToClipboard('https://hmnmcfaxeqxeqxrcsclb.supabase.co/functions/v1/whatsapp-webhook', 'waba')}
                  className="p-1 rounded text-zinc-500 hover:text-[#ff4b0b] transition-colors"
                  title="Copiar URL"
                >
                  {copiedKey === 'waba' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Token WABA */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-zinc-900">WABA System User Access Token</h4>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">Permanente (Sin Expiración)</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Inyectado en Supabase Vault Secrets como <code>WHATSAPP_ACCESS_TOKEN</code> para autorización Bearer 24/7.
              </p>
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 font-mono text-[11px] text-zinc-500">
                <span className="flex-1 truncate">EAAOddRUcwn8BSsThOxTbeghxb8dofh9qFVw... [Protegido en Vault]</span>
                <span className="text-[10px] text-emerald-600 font-bold">Activo</span>
              </div>
            </div>

            {/* Ingesta Webhook Form Web */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-zinc-900">Endpoint para Formularios Web Externos</h4>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">REST API</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Endpoint público para enviar formularios de prospección desde landing pages externas hacia la tabla <code>leads</code>.
              </p>
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 font-mono text-[11px] text-zinc-800">
                <span className="flex-1 truncate">https://hmnmcfaxeqxeqxrcsclb.supabase.co/rest/v1/leads</span>
                <button
                  onClick={() => copyToClipboard('https://hmnmcfaxeqxeqxrcsclb.supabase.co/rest/v1/leads', 'rest')}
                  className="p-1 rounded text-zinc-500 hover:text-[#ff4b0b] transition-colors"
                  title="Copiar URL"
                >
                  {copiedKey === 'rest' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

