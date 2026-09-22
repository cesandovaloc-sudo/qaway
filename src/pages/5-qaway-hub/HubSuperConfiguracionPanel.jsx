import React, { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Database,
  Download,
  FileText,
  Globe2,
  HardDrive,
  Info,
  Languages,
  Link2,
  Mail,
  Palette,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";

/**
 * ConfiguracionPanel
 * ------------------
 * Panel de Configuración para el Super Administrador de Qaway Lab.
 *
 * Integración:
 * 1. Importa este componente en tu router/panel.
 * 2. Renderiza <ConfiguracionPanel /> en la ruta de Configuración.
 * 3. Los callbacks onSave, onConfigureIntegration y onSystemAction
 *    permiten conectar la UI con Supabase/Edge Functions posteriormente.
 *
 * No crea tablas ni modifica la BD por sí mismo.
 */

const initialSettings = {
  ecosystemName: "Qaway Lab",
  description:
    "Plataforma de soluciones digitales para empresas.\nGestiona tus aplicaciones, usuarios y crecimiento desde un solo lugar.",
  timezone: "(GMT-05:00) Lima - Perú",
  language: "Español",
  publicRegistration: true,
  manualApproval: false,
  emailNotifications: true,
  maintenanceMode: false,
  activityLog: true,
  systemAnalytics: true,
  maxUsersBasic: 3,
  maxAppsBasic: 1,
  defaultStorage: "5 GB",
};

const integrations = [
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Procesamiento de pagos",
    connected: true,
    icon: "MP",
  },
  {
    id: "taypi",
    name: "Taypi",
    description: "Pagos locales (Yape, Plin)",
    connected: true,
    icon: "T",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Correo y productividad",
    connected: false,
    icon: "G",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Envío de emails",
    connected: true,
    icon: "S",
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Monitoreo de errores",
    connected: false,
    icon: "S",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Analítica web",
    connected: true,
    icon: "GA",
  },
];

const tabs = [
  { id: "general", label: "General" },
  { id: "integraciones", label: "Integraciones" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "seguridad", label: "Seguridad" },
  { id: "personalizacion", label: "Personalización" },
  { id: "facturacion", label: "Facturación" },
  { id: "avanzado", label: "Avanzado" },
];

function MiniSparkline({ points = "8,20 25,18 42,15 59,11 76,9 93,7" }) {
  return (
    <svg
      viewBox="0 0 100 28"
      className="h-7 w-24"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({ icon: Icon, iconClass, label, value, change, detail, sparkline }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-xl p-2 ${iconClass}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        {sparkline && (
          <div className="text-orange-500">
            <MiniSparkline points={sparkline} />
          </div>
        )}
      </div>

      <div className="mt-3 text-[12px] font-medium text-slate-500">{label}</div>

      <div className="mt-1 flex items-end gap-2">
        <span className="text-[25px] font-bold tracking-tight text-slate-900">{value}</span>
        {change && (
          <span className="mb-1 text-[12px] font-semibold text-emerald-500">{change}</span>
        )}
      </div>

      {detail && <div className="text-[11px] text-slate-400">{detail}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={[
        "relative h-6 w-10 shrink-0 rounded-full transition",
        checked ? "bg-orange-500" : "bg-slate-300",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
          checked ? "left-5" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}

function SettingToggleRow({ icon: Icon, iconClass, title, description, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`rounded-xl p-2 ${iconClass}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-slate-800">{title}</div>
        <div className="text-[11px] leading-4 text-slate-400">{description}</div>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </div>
  );
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.025)] ${className}`}
    >
      <div className="px-5 pt-4">
        <h2 className="text-[14px] font-bold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function IntegrationIcon({ type }) {
  const styles = {
    MP: "bg-blue-50 text-blue-600",
    T: "bg-rose-50 text-rose-500",
    G: "bg-slate-50 text-blue-600",
    S: "bg-violet-50 text-violet-600",
    GA: "bg-orange-50 text-orange-600",
  };

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
        styles[type] || "bg-slate-50 text-slate-500"
      }`}
    >
      {type}
    </div>
  );
}

function IntegrationRow({ integration, onConfigure }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <IntegrationIcon type={integration.icon} />

      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-semibold text-slate-800">{integration.name}</div>
        <div className="truncate text-[10px] text-slate-400">{integration.description}</div>
      </div>

      <span
        className={[
          "rounded-full px-2.5 py-1 text-[9px] font-semibold",
          integration.connected
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {integration.connected ? "Conectado" : "No conectado"}
      </span>

      <button
        type="button"
        onClick={() => onConfigure(integration)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Configurar
      </button>
    </div>
  );
}

export default function ConfiguracionPanel({
  onSave,
  onConfigureIntegration,
  onSystemAction,
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setNotice("");
  };

  const saveChanges = async () => {
    const payload = { ...settings };

    if (onSave) {
      await onSave(payload);
    }

    setDirty(false);
    setNotice("Cambios guardados correctamente.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const configureIntegration = (integration) => {
    if (onConfigureIntegration) {
      onConfigureIntegration(integration);
      return;
    }
    setNotice(`Configuración de ${integration.name} disponible para conectar.`);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const systemAction = (action) => {
    if (onSystemAction) {
      onSystemAction(action);
      return;
    }
    setNotice(`Acción seleccionada: ${action}.`);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const activeTabLabel = useMemo(
    () => tabs.find((tab) => tab.id === activeTab)?.label || "General",
    [activeTab]
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* Top header */}
      <div className="sticky top-0 z-20 h-16 border-b border-slate-800 bg-[#111314] text-white">
        <div className="flex h-full items-center">
          <div className="flex w-[214px] items-center border-r border-white/10 px-4">
            <div>
              <div className="text-[17px] font-bold leading-none">
                Qaway <span className="text-orange-500">Lab</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-300">Super Administrador</div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-between px-5">
            <div className="flex items-center gap-4">
              <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
                <Settings size={18} />
              </button>

              <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Qaway Lab (Global)
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
                <SlidersHorizontal size={17} />
              </button>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden h-9 w-[330px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 md:flex">
                <Search size={15} className="text-slate-500" />
                <span className="text-[11px] text-slate-500">Buscar empresas, usuarios, apps...</span>
                <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-slate-500">
                  Ctrl K
                </span>
              </div>
              <Bell size={18} className="text-slate-300" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold">
                  SA
                </div>
                <div className="hidden md:block">
                  <div className="text-[11px] font-semibold">S Admin</div>
                  <div className="text-[9px] text-slate-400">Super Administrador</div>
                </div>
                <ChevronDown size={13} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-16 z-10 hidden w-[214px] border-r border-slate-800 bg-[#111314] lg:block">
          <nav className="space-y-1 px-2 py-3">
            {[
              ["Inicio", BarChart3],
              ["Empresas", Globe2],
              ["Usuarios", Activity],
              ["Aplicaciones", SlidersHorizontal],
              ["Planes y Precios", Sparkles],
              ["Suscripciones", Clock3],
              ["Pagos", Zap],
              ["Reportes", FileText],
              ["Soporte", Info],
              ["Configuración", Settings],
            ].map(([label, Icon]) => {
              const selected = label === "Configuración";
              return (
                <button
                  key={label}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] transition",
                    selected
                      ? "bg-orange-500 font-semibold text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-2 right-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-orange-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10">
                ?
              </span>
              ¿Necesitas ayuda?
            </div>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              Accede a la documentación o contacta al equipo.
            </p>
            <button className="mt-2 w-full rounded-lg bg-white/10 px-2 py-1.5 text-[10px] font-medium text-slate-200">
              Centro de Ayuda →
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 lg:ml-[214px]">
          <div className="mx-auto max-w-[1510px] px-5 py-5">
            {/* Breadcrumb / heading */}
            <div className="mb-4">
              <div className="mb-2 text-[11px] font-medium text-slate-500">
                Inicio <span className="mx-2 text-slate-300">›</span> Configuración
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
                    Configuración
                  </h1>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    Gestiona la configuración general del ecosistema Qaway Lab. Personaliza parámetros,
                    integraciones y preferencias del sistema.
                  </p>
                </div>

                <div
                  className={[
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] transition",
                    dirty
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-transparent bg-transparent text-slate-400",
                  ].join(" ")}
                >
                  {dirty ? <Save size={14} /> : <Check size={14} />}
                  {dirty ? "Cambios pendientes" : "Todo guardado"}
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Globe2}
                iconClass="bg-blue-50 text-blue-500"
                label="Empresas configuradas"
                value="12"
                change="↑ 20%"
                detail="vs. mes anterior"
                sparkline="4,23 22,20 38,18 54,14 71,11 94,8"
              />
              <MetricCard
                icon={Link2}
                iconClass="bg-orange-50 text-orange-500"
                label="Integraciones activas"
                value="6"
                change="↑ 50%"
                detail="vs. mes anterior"
                sparkline="4,23 22,19 38,15 54,11 71,8 94,7"
              />
              <MetricCard
                icon={SlidersHorizontal}
                iconClass="bg-violet-50 text-violet-500"
                label="Parámetros del sistema"
                value="24"
                change="↑ 9%"
                detail="vs. mes anterior"
                sparkline="4,23 22,21 38,18 54,15 71,10 94,7"
              />
              <MetricCard
                icon={Check}
                iconClass="bg-emerald-50 text-emerald-500"
                label="Estado del sistema"
                value="Operativo"
                detail="Todos los servicios en línea"
                sparkline="4,22 22,18 38,15 54,10 71,9 94,10"
              />
            </div>

            {/* Tabs */}
            <div className="mt-4 overflow-x-auto border-b border-slate-200">
              <div className="flex min-w-max gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative px-1 pb-3 pt-2 text-[12px] font-medium transition",
                      activeTab === tab.id ? "font-semibold text-orange-500" : "text-slate-500 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* General */}
            {activeTab === "general" && (
              <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_1fr_.92fr]">
                <SectionCard
                  title="Información del sistema"
                  subtitle="Configura la información básica del ecosistema."
                  className="min-h-[430px]"
                >
                  <div className="space-y-4 px-5 pb-5 pt-4">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                        Nombre del ecosistema
                      </span>
                      <input
                        value={settings.ecosystemName}
                        onChange={(e) => update("ecosystemName", e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[12px] text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                        Descripción
                      </span>
                      <textarea
                        rows={3}
                        value={settings.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[12px] leading-5 text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </label>

                    <div>
                      <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">Logo</span>
                      <button
                        type="button"
                        onClick={() => systemAction("cambiar-logo")}
                        className="flex w-full items-center gap-4 rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-100 bg-white text-2xl font-black">
                          Q<span className="text-orange-500">.</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] font-medium text-slate-700">
                            Haz clic para cambiar el logo
                          </div>
                          <div className="text-[10px] text-slate-400">PNG, JPG o SVG (máx. 2MB)</div>
                        </div>
                        <Upload size={16} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                          Zona horaria
                        </span>
                        <div className="relative">
                          <select
                            value={settings.timezone}
                            onChange={(e) => update("timezone", e.target.value)}
                            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[11px] text-slate-600 outline-none focus:border-orange-400"
                          >
                            <option>(GMT-05:00) Lima - Perú</option>
                            <option>(GMT-05:00) Bogotá - Colombia</option>
                            <option>(GMT-05:00) Quito - Ecuador</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-2.5 text-slate-400" size={13} />
                        </div>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">
                          Idioma por defecto
                        </span>
                        <div className="relative">
                          <select
                            value={settings.language}
                            onChange={(e) => update("language", e.target.value)}
                            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[11px] text-slate-600 outline-none focus:border-orange-400"
                          >
                            <option>Español</option>
                            <option>English</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-2.5 text-slate-400" size={13} />
                        </div>
                      </label>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={saveChanges}
                        disabled={!dirty}
                        className={[
                          "flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-semibold transition",
                          dirty
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-orange-100 text-orange-300",
                        ].join(" ")}
                      >
                        <Save size={14} />
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-3">
                  <SectionCard title="Preferencias del sistema" subtitle="Define comportamientos y opciones generales.">
                    <div className="divide-y divide-slate-100 px-5 pb-3">
                      <SettingToggleRow
                        icon={Activity}
                        iconClass="bg-blue-50 text-blue-500"
                        title="Registro de nuevas empresas"
                        description="Permitir registro público de empresas"
                        value={settings.publicRegistration}
                        onChange={(v) => update("publicRegistration", v)}
                      />
                      <SettingToggleRow
                        icon={Shield}
                        iconClass="bg-orange-50 text-orange-500"
                        title="Aprobación manual"
                        description="Requerir aprobación para nuevas empresas"
                        value={settings.manualApproval}
                        onChange={(v) => update("manualApproval", v)}
                      />
                      <SettingToggleRow
                        icon={Mail}
                        iconClass="bg-rose-50 text-rose-500"
                        title="Notificaciones por email"
                        description="Enviar notificaciones del sistema"
                        value={settings.emailNotifications}
                        onChange={(v) => update("emailNotifications", v)}
                      />
                      <SettingToggleRow
                        icon={Wrench}
                        iconClass="bg-red-50 text-red-500"
                        title="Modo mantenimiento"
                        description="Desactivar acceso temporalmente"
                        value={settings.maintenanceMode}
                        onChange={(v) => update("maintenanceMode", v)}
                      />
                      <SettingToggleRow
                        icon={FileText}
                        iconClass="bg-blue-50 text-blue-500"
                        title="Registro de actividad"
                        description="Mantener log de acciones del sistema"
                        value={settings.activityLog}
                        onChange={(v) => update("activityLog", v)}
                      />
                      <SettingToggleRow
                        icon={BarChart3}
                        iconClass="bg-violet-50 text-violet-500"
                        title="Analytics del sistema"
                        description="Recolección de métricas de uso"
                        value={settings.systemAnalytics}
                        onChange={(v) => update("systemAnalytics", v)}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title="Límites y cuotas" subtitle="Define los límites por defecto para nuevas empresas.">
                    <div className="grid grid-cols-3 gap-3 px-5 pb-5 pt-4">
                      <label>
                        <span className="mb-1 block text-[9px] text-slate-500">
                          Usuarios máximos (plan básico)
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={settings.maxUsersBasic}
                          onChange={(e) => update("maxUsersBasic", Number(e.target.value))}
                          className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-orange-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-[9px] text-slate-500">
                          Aplicaciones máximas (plan básico)
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={settings.maxAppsBasic}
                          onChange={(e) => update("maxAppsBasic", Number(e.target.value))}
                          className="h-9 w-full rounded-lg border border-slate-200 px-3 text-[11px] outline-none focus:border-orange-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-[9px] text-slate-500">
                          Almacenamiento por defecto
                        </span>
                        <select
                          value={settings.defaultStorage}
                          onChange={(e) => update("defaultStorage", e.target.value)}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] outline-none focus:border-orange-400"
                        >
                          <option>5 GB</option>
                          <option>10 GB</option>
                          <option>25 GB</option>
                          <option>50 GB</option>
                        </select>
                      </label>
                    </div>
                  </SectionCard>
                </div>

                <div className="space-y-3">
                  <SectionCard title="Integraciones rápidas" subtitle="Configura las herramientas externas del ecosistema.">
                    <div className="px-5 pb-4 pt-2">
                      {integrations.map((integration) => (
                        <IntegrationRow
                          key={integration.id}
                          integration={integration}
                          onConfigure={configureIntegration}
                        />
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Herramientas del sistema" subtitle="Acciones administrativas y de mantenimiento.">
                    <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-4">
                      <button
                        type="button"
                        onClick={() => systemAction("limpiar-cache")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Database size={14} />
                        Limpiar caché
                      </button>
                      <button
                        type="button"
                        onClick={() => systemAction("respaldar-configuracion")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Download size={14} />
                        Respaldar configuración
                      </button>
                      <button
                        type="button"
                        onClick={() => systemAction("ver-logs")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <FileText size={14} />
                        Ver logs del sistema
                      </button>
                      <button
                        type="button"
                        onClick={() => systemAction("restablecer-defaults")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <RefreshCw size={14} />
                        Restablecer a valores por defecto
                      </button>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* Other tabs: functional placeholder panels, ready for backend wiring */}
            {activeTab !== "general" && (
              <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_.75fr]">
                <SectionCard
                  title={activeTabLabel}
                  subtitle={`Configuración de ${activeTabLabel.toLowerCase()} del ecosistema.`}
                  className="min-h-[360px]"
                >
                  <div className="flex h-[290px] flex-col items-center justify-center px-6 text-center">
                    <div className="rounded-2xl bg-orange-50 p-4 text-orange-500">
                      {activeTab === "integraciones" && <Link2 size={26} />}
                      {activeTab === "notificaciones" && <Bell size={26} />}
                      {activeTab === "seguridad" && <Shield size={26} />}
                      {activeTab === "personalizacion" && <Palette size={26} />}
                      {activeTab === "facturacion" && <FileText size={26} />}
                      {activeTab === "avanzado" && <Wrench size={26} />}
                    </div>
                    <h3 className="mt-4 text-[15px] font-bold text-slate-800">
                      {activeTabLabel}
                    </h3>
                    <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-400">
                      La estructura del módulo está preparada para conectar aquí los parámetros
                      correspondientes sin alterar la capa de datos existente.
                    </p>
                  </div>
                </SectionCard>

                <SectionCard title="Estado" subtitle="Resumen de configuración.">
                  <div className="space-y-3 px-5 pb-5 pt-4">
                    {[
                      ["Estado del sistema", "Operativo", "bg-emerald-50 text-emerald-600"],
                      ["Idioma", settings.language, "bg-blue-50 text-blue-600"],
                      ["Zona horaria", settings.timezone, "bg-slate-100 text-slate-600"],
                      ["Modo mantenimiento", settings.maintenanceMode ? "Activo" : "Inactivo", settings.maintenanceMode ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"],
                    ].map(([label, value, classes]) => (
                      <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[11px] text-slate-500">{label}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${classes}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}

            {notice && (
              <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[11px] font-medium text-white shadow-xl">
                <Check size={14} className="text-emerald-400" />
                {notice}
                <button onClick={() => setNotice("")} className="ml-2 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="mt-4 pb-4 text-[9px] text-slate-400">
              Configuración del ecosistema · Qaway Lab · {new Date().getFullYear()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
