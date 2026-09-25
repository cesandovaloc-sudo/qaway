import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Link2,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  Speaker,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "@/config/supabase";

/**
 * AplicacionesModule
 *
 * Contrato de integración:
 *   <AplicacionesModule tenantId={tenantId} session={session} />
 *
 * No incluye Router, Layout, Auth ni BrowserRouter.
 * El componente está aislado para insertarse dentro del shell existente
 * del Super Administrador.
 *
 * IMPORTANTE:
 * Esta versión reproduce el módulo y su comportamiento de UI usando
 * el catálogo mostrado en el diseño. No crea tablas, migraciones ni
 * modifica RLS.
 *
 * Cuando se conecte a datos reales, el origen debe ser el cliente
 * Supabase central y la tabla/catalogo ya existente del proyecto.
 */

const INITIAL_APPS = [
  {
    id: "crm",
    name: "CRM",
    slug: "crm",
    description: "Gestión de clientes y ventas",
    status: "active",
    activeCompanies: 5,
    basePlan: "Premium",
    updatedAt: "12 Sep 2026",
    icon: Link2,
    tone: "orange",
  },
  {
    id: "agenda",
    name: "Agenda",
    slug: "agenda",
    description: "Calendarios y reservas",
    status: "active",
    activeCompanies: 4,
    basePlan: "Intermedio",
    updatedAt: "10 Sep 2026",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    id: "inventario",
    name: "Inventario",
    slug: "inventario",
    description: "Productos, stock y pedidos",
    status: "active",
    activeCompanies: 3,
    basePlan: "Intermedio",
    updatedAt: "08 Sep 2026",
    icon: ShoppingCart,
    tone: "green",
  },
  {
    id: "tienda",
    name: "Tienda Online",
    slug: "tienda",
    description: "E-commerce",
    status: "development",
    activeCompanies: 0,
    basePlan: "Premium",
    updatedAt: "05 Sep 2026",
    icon: ShoppingCart,
    tone: "pink",
  },
  {
    id: "academia",
    name: "Academia",
    slug: "academia",
    description: "Cursos y formación",
    status: "active",
    activeCompanies: 2,
    basePlan: "Básico",
    updatedAt: "01 Sep 2026",
    icon: BookOpen,
    tone: "purple",
  },
  {
    id: "marketing",
    name: "Marketing",
    slug: "marketing",
    description: "Campañas y automatizaciones",
    status: "active",
    activeCompanies: 3,
    basePlan: "Intermedio",
    updatedAt: "28 Ago 2026",
    icon: Speaker,
    tone: "violet",
  },
  {
    id: "analitica",
    name: "Analítica",
    slug: "analitica",
    description: "Reportes y métricas",
    status: "active",
    activeCompanies: 4,
    basePlan: "Intermedio",
    updatedAt: "20 Ago 2026",
    icon: BarChart3,
    tone: "cyan",
  },
  {
    id: "integraciones",
    name: "Integraciones",
    slug: "integraciones",
    description: "Conexiones externas (APIs)",
    status: "inactive",
    activeCompanies: 0,
    basePlan: "Básico",
    updatedAt: "15 Ago 2026",
    icon: Settings2,
    tone: "slate",
  },
];

const TONE = {
  orange: "bg-orange-50 text-orange-500",
  blue: "bg-blue-50 text-blue-500",
  green: "bg-emerald-50 text-emerald-500",
  pink: "bg-pink-50 text-pink-500",
  purple: "bg-purple-50 text-purple-500",
  violet: "bg-violet-50 text-violet-500",
  cyan: "bg-cyan-50 text-cyan-500",
  slate: "bg-slate-100 text-slate-500",
};

function StatusBadge({ status }) {
  if (status === "development") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        En desarrollo
      </span>
    );
  }

  if (status === "inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Inactiva
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Activa
    </span>
  );
}

function PlanBadge({ plan }) {
  const classes = {
    Premium: "bg-purple-50 text-purple-600",
    Intermedio: "bg-blue-50 text-blue-600",
    Básico: "bg-amber-50 text-amber-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
        classes[plan] || "bg-zinc-100 text-zinc-600"
      }`}
    >
      {plan}
    </span>
  );
}

function KpiCard({ icon: Icon, iconClass, label, value, delta, deltaClass = "text-emerald-600", note = "vs. mes anterior" }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}>
            <Icon size={16} strokeWidth={2.2} />
          </div>
          <span className="text-xs font-bold text-zinc-600">{label}</span>
        </div>

        <Activity size={42} className="text-zinc-300" strokeWidth={1.8} />
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-2xl font-extrabold tracking-tight text-zinc-950">{value}</span>
        <div className="pb-1">
          <div className={`text-xs font-bold ${deltaClass}`}>{delta}</div>
          <div className="text-[10px] text-zinc-400">{note}</div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ apps }) {
  const total = apps.length;
  const active = apps.filter((a) => a.status === "active").length;
  const development = apps.filter((a) => a.status === "development").length;
  const inactive = apps.filter((a) => a.status === "inactive").length;

  const segments = [
    { label: "Activas", value: active, color: "#ff4b0b" },
    { label: "En desarrollo", value: development, color: "#f59e0b" },
    { label: "Inactivas", value: inactive, color: "#d4d4d8" },
  ];

  let start = 0;
  const gradient = segments
    .map((segment) => {
      const end = start + (segment.value / Math.max(total, 1)) * 100;
      const item = `${segment.color} ${start}% ${end}%`;
      start = end;
      return item;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-7">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-[10px] text-zinc-400">Total</span>
          <span className="text-2xl font-extrabold text-zinc-950">{total}</span>
          <span className="text-[10px] text-zinc-400">apps</span>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
            <span className="font-semibold text-zinc-700">{segment.label}</span>
            <span className="text-zinc-400">
              {segment.value} ({total ? Math.round((segment.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLAN_LABEL = { basico: "Básico", intermedio: "Intermedio", premium: "Premium" };

const EXTRA_META = {
  blog: { description: "Contenido y publicaciones digitales.", icon: BookOpen, tone: "slate" },
};

export default function AplicacionesModule({ tenantId, session }) {
  const [apps, setApps] = useState(INITIAL_APPS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewApp, setShowNewApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: catalog, error: catalogError } = await supabase
        .from("app_catalog")
        .select("id, slug, name")
        .order("name");
      const { data: subs, error: subsError } = await supabase
        .from("tenant_app_subscriptions")
        .select("app_id, plan, status, updated_at");

      if (!mounted || catalogError || subsError) return;

      const activeByApp = {};
      const planByApp = {};
      const latestByApp = {};
      (subs || []).forEach((s) => {
        activeByApp[s.app_id] = (activeByApp[s.app_id] || 0) + 1;
        if (!planByApp[s.app_id]) planByApp[s.app_id] = s.plan;
        const t = s.updated_at;
        if (t && (!latestByApp[s.app_id] || new Date(t) > new Date(latestByApp[s.app_id])))
          latestByApp[s.app_id] = t;
      });

      const merged = INITIAL_APPS.map((app) => {
        const row = (catalog || []).find((c) => c.slug === app.slug);
        const id = row?.id || app.id;
        return {
          ...app,
          id,
          activeCompanies: activeByApp[id] ?? app.activeCompanies,
          basePlan: planByApp[id] ? PLAN_LABEL[planByApp[id]] || planByApp[id] : app.basePlan,
          updatedAt: latestByApp[id]
            ? new Date(latestByApp[id]).toLocaleDateString("es-PE", { day: "numeric", month: "short" })
            : app.updatedAt,
        };
      });

      const extra = (catalog || [])
        .filter((c) => !INITIAL_APPS.some((a) => a.slug === c.slug))
        .map((c) => {
          const meta = EXTRA_META[c.slug];
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: meta?.description || "Aplicación del ecosistema Qaway Lab.",
            status: activeByApp[c.id] ? "active" : "development",
            activeCompanies: activeByApp[c.id] || 0,
            basePlan: planByApp[c.id] ? PLAN_LABEL[planByApp[c.id]] || planByApp[c.id] : "Intermedio",
            updatedAt: latestByApp[c.id]
              ? new Date(latestByApp[c.id]).toLocaleDateString("es-PE", { day: "numeric", month: "short" })
              : "—",
            icon: meta?.icon || Link2,
            tone: meta?.tone || "slate",
          };
        });

      if (!mounted) return;
      if (extra.length) setApps(extra.concat(merged));
      else setApps(merged);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const pageSize = 8;

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return apps.filter((app) => {
      const matchesQuery =
        !normalized ||
        app.name.toLowerCase().includes(normalized) ||
        app.slug.toLowerCase().includes(normalized) ||
        app.description.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [apps, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleApps = filteredApps.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = apps.filter((app) => app.status === "active").length;
  const developmentCount = apps.filter((app) => app.status === "development").length;
  const inactiveCount = apps.filter((app) => app.status === "inactive").length;

  function changeStatus(id, nextStatus) {
    setApps((current) =>
      current.map((app) =>
        app.id === id ? { ...app, status: nextStatus } : app
      )
    );
    setMenuId(null);
  }

  return (
    <section className="min-h-full bg-transparent font-sans text-zinc-950">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span>Inicio</span>
            <ChevronRight size={13} />
            <span className="text-zinc-600">Aplicaciones</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
            Aplicaciones
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Gestiona las aplicaciones del ecosistema Qaway Lab. Activa,
            configura y asigna planes a las empresas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewApp(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e03f06] active:scale-[0.99]"
        >
          <Plus size={17} />
          Nueva aplicación
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <KpiCard
          icon={Zap}
          iconClass="bg-purple-50 text-purple-600"
          label="Total de aplicaciones"
          value={apps.length}
          delta="↑ 33%"
        />

        <KpiCard
          icon={Check}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Aplicaciones activas"
          value={activeCount}
          delta="↑ 50%"
        />

        <KpiCard
          icon={Clock3}
          iconClass="bg-orange-50 text-orange-500"
          label="En desarrollo"
          value={developmentCount}
          delta="— 0%"
          deltaClass="text-zinc-400"
        />

        <KpiCard
          icon={X}
          iconClass="bg-red-50 text-red-500"
          label="Inactivas"
          value={inactiveCount}
          delta="↓ 0%"
          deltaClass="text-red-500"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">
        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-bold">Listado de aplicaciones</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Administra las aplicaciones disponibles en el ecosistema.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative w-full xl:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar aplicación..."
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
                    showFilters || statusFilter !== "all"
                      ? "border-[#ff4b0b] bg-orange-50 text-[#ff4b0b]"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Filter size={15} />
                  Filtros
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2 rounded-xl bg-zinc-50 p-3">
                {[
                  ["all", "Todas"],
                  ["active", "Activas"],
                  ["development", "En desarrollo"],
                  ["inactive", "Inactivas"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                      statusFilter === value
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left">
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Aplicación
                  </th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Empresas activas
                  </th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Plan base
                  </th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">
                    Última actualización
                  </th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {visibleApps.map((app) => {
                  const Icon = app.icon;

                  return (
                    <tr
                      key={app.id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              TONE[app.tone] || TONE.slate
                            }`}
                          >
                            <Icon size={17} strokeWidth={2} />
                          </div>

                          <div>
                            <div className="text-xs font-extrabold text-zinc-900">
                              {app.name}
                            </div>
                            <div className="mt-0.5 text-[10px] text-zinc-400">
                              {app.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-zinc-500">
                        {app.description}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="px-4 py-3.5 text-xs font-semibold text-zinc-700">
                        {app.activeCompanies}
                      </td>

                      <td className="px-4 py-3.5">
                        <PlanBadge plan={app.basePlan} />
                      </td>

                      <td className="px-4 py-3.5 text-xs text-zinc-500">
                        {app.updatedAt}
                      </td>

                      <td className="relative px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuId((current) =>
                              current === app.id ? null : app.id
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                          aria-label={`Acciones de ${app.name}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === app.id && (
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setMenuId(null);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                              Ver aplicación
                            </button>

                            {app.status !== "active" && (
                              <button
                                type="button"
                                onClick={() => changeStatus(app.id, "active")}
                                className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                              >
                                Activar
                              </button>
                            )}

                            {app.status === "active" && (
                              <button
                                type="button"
                                onClick={() => changeStatus(app.id, "inactive")}
                                className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!visibleApps.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="text-sm font-bold text-zinc-700">
                        No se encontraron aplicaciones
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        Prueba con otro término o cambia los filtros.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4">
            <span className="text-xs text-zinc-400">
              Mostrando {visibleApps.length} de {filteredApps.length} aplicaciones
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold ${
                      item === safePage
                        ? "bg-[#ff4b0b] text-white"
                        : "border border-transparent text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Estado del ecosistema</h2>
              <span className="text-xs font-semibold text-zinc-400">
                {apps.length} apps
              </span>
            </div>

            <DonutChart apps={apps} />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold">Actividad reciente</h2>
              <button
                type="button"
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900"
              >
                Ver todas →
              </button>
            </div>

            <div className="space-y-4">
              {[
                ["Nueva aplicación registrada", "Academia", "hace 1 día", "blue"],
                ["Aplicación actualizada", "CRM v2.1.0", "hace 2 días", "red"],
                ["Estado cambiado", "Integraciones → Inactiva", "hace 3 días", "pink"],
                ["Empresa asignada", "CoraVet → Agenda", "hace 4 días", "blue"],
                ["Nueva versión disponible", "Analítica v1.3.0", "hace 5 días", "green"],
              ].map(([title, detail, time, tone], index) => (
                <div key={`${title}-${index}`} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      tone === "red"
                        ? "bg-red-50 text-red-500"
                        : tone === "pink"
                        ? "bg-pink-50 text-pink-500"
                        : tone === "green"
                        ? "bg-emerald-50 text-emerald-500"
                        : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    <Activity size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-zinc-800">
                      {title}
                    </div>
                    <div className="truncate text-[10px] text-zinc-500">
                      {detail}
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] text-zinc-400">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm">
                <Zap size={15} />
              </div>

              <div>
                <div className="text-xs font-extrabold text-zinc-800">Tip</div>
                <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                  Las aplicaciones se pueden activar o desactivar según los
                  planes disponibles.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-100 p-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff4b0b]">
                  Aplicación
                </span>
                <h3 className="mt-1 text-xl font-extrabold">
                  {selectedApp.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-zinc-50 p-4">
                <div className="text-xs font-bold text-zinc-500">Descripción</div>
                <div className="mt-1 text-sm text-zinc-800">
                  {selectedApp.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-[10px] font-bold text-zinc-400">
                    Estado
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={selectedApp.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-[10px] font-bold text-zinc-400">
                    Plan base
                  </div>
                  <div className="mt-2">
                    <PlanBadge plan={selectedApp.basePlan} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="text-[10px] font-bold text-zinc-400">
                  Empresas activas
                </div>
                <div className="mt-1 text-2xl font-extrabold">
                  {selectedApp.activeCompanies}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-zinc-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New app modal */}
      {showNewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-100 p-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff4b0b]">
                  Aplicaciones
                </span>
                <h3 className="mt-1 text-xl font-extrabold">
                  Nueva aplicación
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowNewApp(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-zinc-800">
                El botón y el flujo visual están preparados para acoplar la
                creación real al catálogo existente. Esta versión no crea
                registros ni modifica la base de datos.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 p-5">
              <button
                type="button"
                onClick={() => setShowNewApp(false)}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowNewApp(false)}
                className="rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
