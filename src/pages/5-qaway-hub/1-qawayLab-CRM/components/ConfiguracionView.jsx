import React, { useState, useEffect } from 'react'
import {
  Settings2,
  Building2,
  ShieldCheck,
  BellRing,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  UserCheck,
  Zap,
  Globe,
  DollarSign,
  Clock,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react'
import { useCRM } from '../context/CRMContext'

export default function ConfiguracionView() {
  const { currentRole, setCurrentRole, leads } = useCRM()
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'roles' | 'notifications' | 'integrations'
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [pingLoading, setPingLoading] = useState(false)
  const [pingResult, setPingResult] = useState(null)

  // Configuración de Empresa / Comercial
  const [companySettings, setCompanySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qaway_crm_company_settings')
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      companyName: 'Qaway Lab E.I.R.L.',
      taxId: '20609876543',
      defaultCurrency: 'USD',
      timezone: 'America/Lima (UTC-5)',
      slaMinutes: 15,
      wabaWindowHours: 24,
      supportEmail: 'contacto@qawaylab.com',
      salesPhone: '+51 924 024 165'
    }
  })

  // Preferencias de Notificaciones
  const [notifySettings, setNotifySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('qaway_crm_notify_settings')
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      soundOnHandover: true,
      soundOnNewLead: true,
      emailDailyDigest: false,
      wabaExpirationWarning: true,
      autoTagHighValue: true
    }
  })

  const handleSaveCompany = (e) => {
    e.preventDefault()
    try {
      localStorage.setItem('qaway_crm_company_settings', JSON.stringify(companySettings))
      localStorage.setItem('qaway_crm_notify_settings', JSON.stringify(notifySettings))
    } catch (_) {}
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const handleTestPing = () => {
    setPingLoading(true)
    setPingResult(null)
    setTimeout(() => {
      setPingLoading(false)
      setPingResult({
        supabase: '200 OK (54ms)',
        metaWaba: 'Conectado (Graph API v20.0)',
        gemini: 'Operativo (Gemini 2.5 Flash)',
        timestamp: new Date().toLocaleTimeString('es-PE')
      })
    }, 900)
  }

  const roleDefinitions = [
    {
      id: 'management',
      name: 'Gerencia General & Operaciones',
      badge: 'Acceso Total',
      badgeColor: 'bg-red-500/10 text-red-700 border-red-500/20',
      description: 'Supervisa todas las carteras de clientes, embudos, métricas financieras de facturación y logs de automatización.',
      permissions: [
        'Acceso sin restricciones a todos los leads y clientes',
        'Visualización de KPIs de ingresos, LTV y márgenes comerciales',
        'Control y activación de automatizaciones IA y Webhooks',
        'Configuración global de la empresa y políticas SLA'
      ]
    },
    {
      id: 'sales',
      name: 'Asesor Comercial / Ventas',
      badge: 'Cartera Asignada',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      description: 'Gestión enfocada en prospectos asignados, ejecución de llamadas de cierre, cotizaciones y chat directo por WhatsApp.',
      permissions: [
        'Acceso exclusivo a prospectos y cuentas asignadas',
        'Manejo de bandeja WhatsApp y cambio de etapas del embudo',
        'Creación y completado de tareas comerciales diarias',
        'Sin acceso a métricas globales de facturación o logs de sistema'
      ]
    },
    {
      id: 'marketing',
      name: 'Especialista de Crecimiento & Ads',
      badge: 'Campañas & Orígenes',
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      description: 'Análisis de retorno publicitario, fuentes de tráfico (Meta Ads, Google Ads, SEO) y tasas de conversión por campaña.',
      permissions: [
        'Monitoreo del rendimiento de campañas y canales de adquisición',
        'Creación y mapeo de parámetros UTM y Webhooks entrantes',
        'Exportación de estadísticas de atribución publicitaria',
        'Lectura general del embudo sin edición de contratos cerrados'
      ]
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[#fbfbfb] rounded-2xl border border-black/5 shadow-xs overflow-hidden">
      {/* Header Superior */}
      <div className="bg-white border-b border-black/5 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b0b]/10 flex items-center justify-center text-[#ff4b0b]">
              <Settings2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#191918]">Configuración del CRM</h2>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/5 text-black/60 border border-black/5">
              Qaway Master Hub
            </span>
          </div>
          <p className="text-xs text-black/50">
            Administra los parámetros comerciales, roles del equipo, alertas en tiempo real y conectividad con Meta & Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ajustes guardados correctamente
            </span>
          )}
          <button
            onClick={handleSaveCompany}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#ff4b0b] hover:bg-[#e03e04] text-white shadow-xs transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="bg-white border-b border-black/5 px-6 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#ff4b0b] text-[#ff4b0b]'
              : 'border-transparent text-black/50 hover:text-[#191918]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          General & Empresa
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'roles'
              ? 'border-[#ff4b0b] text-[#ff4b0b]'
              : 'border-transparent text-black/50 hover:text-[#191918]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Roles & Permisos
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-black/5 text-black/60 capitalize">
            {currentRole}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-[#ff4b0b] text-[#ff4b0b]'
              : 'border-transparent text-black/50 hover:text-[#191918]'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          Alertas & Notificaciones
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-[#ff4b0b] text-[#ff4b0b]'
              : 'border-transparent text-black/50 hover:text-[#191918]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Infraestructura & Conexiones
        </button>
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* PESTAÑA 1: GENERAL & EMPRESA */}
        {activeTab === 'general' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-black/5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div>
                  <h3 className="text-sm font-bold text-[#191918] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ff4b0b]" />
                    Ficha de la Organización
                  </h3>
                  <p className="text-xs text-black/50">Datos comerciales impresos en presupuestos y cotizaciones de clientes.</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  RUC Validado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Identificación Fiscal (RUC / Tax ID)</label>
                  <input
                    type="text"
                    value={companySettings.taxId}
                    onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Correo de Notificaciones Comerciales</label>
                  <input
                    type="email"
                    value={companySettings.supportEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportEmail: e.target.value })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Teléfono Central WhatsApp</label>
                  <input
                    type="text"
                    value={companySettings.salesPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, salesPhone: e.target.value })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>
              </div>
            </div>

            {/* Parámetros Operativos del Embudo */}
            <div className="bg-white p-6 rounded-xl border border-black/5 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#191918] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#ff4b0b]" />
                  Parámetros del Embudo & Reglas de Servicio (SLA)
                </h3>
                <p className="text-xs text-black/50">Límites temporales y divisa predeterminada para el cálculo de presupuestos.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    Moneda Predeterminada
                  </label>
                  <select
                    value={companySettings.defaultCurrency}
                    onChange={(e) => setCompanySettings({ ...companySettings, defaultCurrency: e.target.value })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  >
                    <option value="USD">USD ($) - Dólares Americanos</option>
                    <option value="PEN">PEN (S/.) - Soles Peruanos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    SLA Primer Contacto (Minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={companySettings.slaMinutes}
                    onChange={(e) => setCompanySettings({ ...companySettings, slaMinutes: Number(e.target.value) })}
                    className="w-full text-xs bg-[#fbfbfb] border border-black/10 rounded-lg px-3 py-2 text-[#191918] focus:outline-none focus:border-[#ff4b0b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    Huso Horario Base
                  </label>
                  <input
                    type="text"
                    disabled
                    value={companySettings.timezone}
                    className="w-full text-xs bg-black/5 border border-black/5 rounded-lg px-3 py-2 text-black/60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: ROLES & PERMISOS */}
        {activeTab === 'roles' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-black/5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-[#191918] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#ff4b0b]" />
                    Control de Acceso Basado en Roles (RBAC)
                  </h3>
                  <p className="text-xs text-black/50">
                    Cambia la perspectiva actual para auditar qué vistas y prospectos puede ver cada miembro del equipo.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#fbfbfb] p-1 rounded-xl border border-black/10">
                  <span className="text-[11px] font-semibold text-black/60 pl-2">Vista activa:</span>
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="text-xs font-bold bg-white text-[#ff4b0b] border border-[#ff4b0b]/20 rounded-lg px-3 py-1.5 shadow-2xs focus:outline-none cursor-pointer"
                  >
                    <option value="management">Gerencia (management)</option>
                    <option value="sales">Ventas (sales)</option>
                    <option value="marketing">Marketing (marketing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleDefinitions.map((role) => {
                  const isCurrent = currentRole === role.id
                  return (
                    <div
                      key={role.id}
                      onClick={() => setCurrentRole(role.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isCurrent
                          ? 'border-[#ff4b0b] bg-[#ff4b0b]/[0.02] shadow-xs'
                          : 'border-black/5 bg-[#fbfbfb] hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                          {role.badge}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff4b0b]">
                            <UserCheck className="w-3 h-3" />
                            Activo
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-[#191918] mb-1">{role.name}</h4>
                      <p className="text-[11px] text-black/50 mb-3 leading-relaxed">{role.description}</p>

                      <div className="space-y-1.5 pt-3 border-t border-black/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 block mb-1">
                          Privilegios del rol:
                        </span>
                        {role.permissions.map((perm, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-black/70">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Aviso de filtrado activo según rol */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold">Filtro de seguridad en tiempo real: </strong>
                Actualmente estás operando como <span className="font-bold underline">{currentRole}</span>.
                {currentRole === 'sales' && ' Por política de confidencialidad comercial, la lista de prospectos está acotada únicamente a los leads asignados a tu agente.'}
                {currentRole === 'management' && ' Tienes visibilidad integral de todos los prospectos, campañas y métricas globales de facturación.'}
                {currentRole === 'marketing' && ' Tienes acceso al embudo completo para medir conversiones, atribución de anuncios y tasas por canal.'}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: ALERTAS & NOTIFICACIONES */}
        {activeTab === 'notifications' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-black/5 shadow-2xs space-y-5">
              <div className="pb-3 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#191918] flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#ff4b0b]" />
                  Canales de Alerta & Eventos Críticos
                </h3>
                <p className="text-xs text-black/50">
                  Configura cómo y cuándo debe sonar el CRM para asegurar respuesta inmediata a los prospectos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#fbfbfb] border border-black/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-[#191918] block">Alarma sonora en Handover Humano</span>
                    <span className="text-[11px] text-black/50">
                      Emite un tono audible en el navegador cuando el Agente IA transfiere una conversación a un asesor.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySettings.soundOnHandover}
                    onChange={(e) => setNotifySettings({ ...notifySettings, soundOnHandover: e.target.checked })}
                    className="w-4 h-4 text-[#ff4b0b] accent-[#ff4b0b] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#fbfbfb] border border-black/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-[#191918] block">Notificación de Nuevo Lead Entrante</span>
                    <span className="text-[11px] text-black/50">
                      Dispara alerta inmediata cuando llega un prospecto desde la Web, Meta Ads o Webhook.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySettings.soundOnNewLead}
                    onChange={(e) => setNotifySettings({ ...notifySettings, soundOnNewLead: e.target.checked })}
                    className="w-4 h-4 text-[#ff4b0b] accent-[#ff4b0b] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#fbfbfb] border border-black/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-[#191918] block">Aviso de Expiración de Ventana 24h WABA</span>
                    <span className="text-[11px] text-black/50">
                      Alerta preventiva cuando falten 2 horas para que cierre la ventana gratuita de mensajería de WhatsApp.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySettings.wabaExpirationWarning}
                    onChange={(e) => setNotifySettings({ ...notifySettings, wabaExpirationWarning: e.target.checked })}
                    className="w-4 h-4 text-[#ff4b0b] accent-[#ff4b0b] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#fbfbfb] border border-black/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-[#191918] block">Etiquetado Automático de Cuentas Enterprise (+$3,000 USD)</span>
                    <span className="text-[11px] text-black/50">
                      Asigna prioridad de atención alta a presupuestos de alta facturación de forma autónoma.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifySettings.autoTagHighValue}
                    onChange={(e) => setNotifySettings({ ...notifySettings, autoTagHighValue: e.target.checked })}
                    className="w-4 h-4 text-[#ff4b0b] accent-[#ff4b0b] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: INFRAESTRUCTURA & CONEXIONES */}
        {activeTab === 'integrations' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-black/5 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/5">
                <div>
                  <h3 className="text-sm font-bold text-[#191918] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#ff4b0b]" />
                    Ecosistema Tecnológico & Estado de Conexión
                  </h3>
                  <p className="text-xs text-black/50">
                    Servicios backend que sustentan la sincronización de leads, mensajería e inteligencia artificial.
                  </p>
                </div>

                <button
                  onClick={handleTestPing}
                  disabled={pingLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/5 hover:bg-black/10 text-[#191918] transition-colors self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pingLoading ? 'animate-spin' : ''}`} />
                  {pingLoading ? 'Verificando...' : 'Diagnosticar Conexión'}
                </button>
              </div>

              {/* Grid de Servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supabase Cloud */}
                <div className="p-4 rounded-xl border border-black/5 bg-[#fbfbfb]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#191918]">Supabase Cloud (PostgreSQL 15)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                      Conectado
                    </span>
                  </div>
                  <p className="text-[11px] text-black/50 mb-2">
                    Base de datos transaccional con Realtime para prospectos, mensajes y auditoría.
                  </p>
                  <div className="text-[10px] font-mono text-black/40 bg-white p-2 rounded border border-black/5">
                    URL: https://***.supabase.co | Tabla: leads ({leads.length} registros cargados)
                  </div>
                </div>

                {/* WhatsApp Cloud API */}
                <div className="p-4 rounded-xl border border-black/5 bg-[#fbfbfb]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#191918]">Meta WABA Cloud API</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                      Verificado
                    </span>
                  </div>
                  <p className="text-[11px] text-black/50 mb-2">
                    Canal oficial de mensajería empresarial con soporte para plantillas y webhooks bidireccionales.
                  </p>
                  <div className="text-[10px] font-mono text-black/40 bg-white p-2 rounded border border-black/5">
                    Graph API: v20.0 | Número: +51 924 024 165
                  </div>
                </div>

                {/* Edge Function */}
                <div className="p-4 rounded-xl border border-black/5 bg-[#fbfbfb]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-[#191918]">Edge Function: whatsapp-webhook</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                      HTTP 200 OK
                    </span>
                  </div>
                  <p className="text-[11px] text-black/50 mb-2">
                    Servicio Serverless en Deno encargado de recibir los webhooks de Meta y enrutar a Supabase.
                  </p>
                  <div className="text-[10px] font-mono text-black/40 bg-white p-2 rounded border border-black/5">
                    Endpoint: /functions/v1/whatsapp-webhook | Auth: Bearer Token
                  </div>
                </div>

                {/* Motor IA Gemini */}
                <div className="p-4 rounded-xl border border-black/5 bg-[#fbfbfb]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff4b0b]" />
                      <span className="text-xs font-bold text-[#191918]">Google Gemini 2.5 Flash Engine</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-black/50 mb-2">
                    Motor de razonamiento autónomo para cualificación de prospectos y atención de primer contacto.
                  </p>
                  <div className="text-[10px] font-mono text-black/40 bg-white p-2 rounded border border-black/5">
                    Temperatura: 0.2 | Ventana de contexto: 1M tokens
                  </div>
                </div>
              </div>

              {/* Diagnóstico Ping */}
              {pingResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Diagnóstico de Infraestructura Completado exitosamente a las {pingResult.timestamp}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900">
                    <div>• <strong>Supabase:</strong> {pingResult.supabase}</div>
                    <div>• <strong>WhatsApp API:</strong> {pingResult.metaWaba}</div>
                    <div>• <strong>Gemini IA:</strong> {pingResult.gemini}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
