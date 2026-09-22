import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Ellipsis,
  Filter,
  HelpCircle,
  MoreHorizontal,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { supabase } from "@/config/supabase";

/**
 * Qaway Hub — EmpresasModule
 *
 * Módulo independiente del panel de Super Administrador.
 *
 * Contrato:
 *   <EmpresasModule tenantId={tenantId} session={session} />
 *
 * No incluye:
 *   - Router
 *   - Layout / Sidebar / Header
 *   - Auth propio
 *   - BrowserRouter
 *
 * El shell existente de HubPanelPage permanece intacto.
 *
 * Nota:
 * La UI reproduce la estructura de referencia entregada por diseño.
 * Los datos se consultan desde Supabase Central. No se incluyen datos
 * comerciales ficticios en producción.
 */

const PAGE_SIZE = 10;

const PLAN_META = {
  premium: {
    label: "Premium",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  intermedio: {
    label: "Intermedio",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  básico: {
    label: "Básico",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  basico: {
    label: "Básico",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  "sin plan": {
    label: "Sin plan",
    dot: "bg-zinc-300",
    text: "text-zinc-500",
  },
};

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase().trim();

  if (["trialing", "trial", "en prueba", "prueba"].includes(status)) {
    return { key: "trialing", label: "En prueba" };
  }

  if (["inactive", "inactivo", "inactiva", "disabled", "cancelled", "cancelado"].includes(status)) {
    return { key: "inactive", label: "Inactiva" };
  }

  return { key: "active", label: "Activa" };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}

function getCompanyName(row) {
  return (
    row?.name ||
    row?.company_name ||
    row?.business_name ||
    row?.legal_name ||
    row?.display_name ||
    row?.slug ||
    "Empresa"
  );
}

function getCompanySubtitle(row) {
  return (
    row?.industry ||
    row?.sector ||
    row?.category ||
    row?.description ||
    row?.slug ||
    ""
  );
}

function getInitials(name) {
  return String(name || "E")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPlanLabel(value) {
  if (!value) return "Sin plan";
  const key = String(value).toLowerCase();
  return PLAN_META[key]?.label || value;
}

function StatCard({ icon, tone, title, value, delta, deltaTone = "up", subtitle }) {
  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}>
          {icon}
        </div>
        <div className="h-8 w-20 opacity-0" aria-hidden="true" />
      </div>

      <p className="mt-3 text-xs font-bold text-zinc-500">{title}</p>

      <div className="mt-1 flex items-end gap-2">
        <strong className="text-2xl font-extrabold tracking-tight text-zinc-950">
          {value}
        </strong>

        {delta !== undefined && delta !== null && (
          <span
            className={`mb-1 inline-flex items-center gap-0.5 text-[11px] font-extrabold ${
              deltaTone === "down" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {deltaTone === "down" ? (
              <TrendingDown size={12} />
            ) : (
              <TrendingUp size={12} />
            )}
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-0.5 text-[10px] font-medium text-zinc-400">{subtitle}</p>
      )}
    </article>
  );
}

function CompanyAvatar({ company }) {
  const color =
    company?.logo_url
      ? "bg-white"
      : company?.avatar_color || "bg-zinc-950";

  return (
    <div
      className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ${color} text-[11px] font-extrabold text-white`}
    >
      {company?.logo_url ? (
        <img
          src={company.logo_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(company?.name)
      )}
    </div>
  );
}

export default function EmpresasModule({
  tenantId,
  session,
  onCreateCompany,
  onOpenCompany,
  onCompanyAction,
}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  /*
   * Carga de empresas.
   *
   * Se usa select("*") deliberadamente para que el módulo no invente
   * columnas que no fueron definidas en el contrato actual. La
   * normalización inferior trabaja con los campos disponibles.
   */
  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (queryError) {
        setError(
          queryError.message ||
            "No se pudieron cargar las empresas."
        );
        setCompanies([]);
        setLoading(false);
        return;
      }

      const normalized = (data || []).map((row) => {
        const name = getCompanyName(row);
        const status = normalizeStatus(row.status || row.state);

        return {
          ...row,
          id: row.id,
          name,
          subtitle: getCompanySubtitle(row),
          status,
          createdAt: row.created_at || row.createdAt,
          plan:
            row.plan ||
            row.plan_name ||
            row.current_plan ||
            row.plan_tier ||
            null,
          userCount:
            row.user_count ??
            row.users_count ??
            null,
          applicationCount:
            row.application_count ??
            row.applications_count ??
            null,
        };
      });

      setCompanies(normalized);
      setLoading(false);
    }

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, [tenantId, session?.user?.id]);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesQuery =
        !normalizedQuery ||
        company.name.toLowerCase().includes(normalizedQuery) ||
        company.subtitle.toLowerCase().includes(normalizedQuery) ||
        String(company.slug || "").toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || company.status.key === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [companies, query, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / PAGE_SIZE)
  );

  const visibleCompanies = filteredCompanies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status.key === "active").length;
    const trial = companies.filter((c) => c.status.key === "trialing").length;
    const inactive = companies.filter((c) => c.status.key === "inactive").length;

    const planCounts = companies.reduce(
      (acc, company) => {
        const plan = getPlanLabel(company.plan);
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      },
      {}
    );

    return { total, active, trial, inactive, planCounts };
  }, [companies]);

  const pageStart = filteredCompanies.length
    ? (page - 1) * PAGE_SIZE + 1
    : 0;

  const pageEnd = Math.min(page * PAGE_SIZE, filteredCompanies.length);

  return (
    <div className="min-w-0 space-y-5 font-sans text-zinc-950">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span>Inicio</span>
            <span>›</span>
            <span className="text-zinc-600">Empresas</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
            Empresas
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Gestiona todas las empresas del ecosistema Qaway Lab.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateCompany}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#e94408] focus:outline-none focus:ring-4 focus:ring-orange-100"
        >
          <span className="text-base leading-none">+</span>
          Nueva empresa
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 size={16} className="text-blue-600" />}
          tone="bg-blue-50"
          title="Total de empresas"
          value={stats.total}
        />

        <StatCard
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          tone="bg-emerald-50"
          title="Empresas activas"
          value={stats.active}
        />

        <StatCard
          icon={<Clock3 size={16} className="text-orange-600" />}
          tone="bg-orange-50"
          title="En prueba"
          value={stats.trial}
        />

        <StatCard
          icon={<XCircle size={16} className="text-red-600" />}
          tone="bg-red-50"
          title="Inactivas"
          value={stats.inactive}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-xs font-extrabold text-red-800">
              No se pudieron cargar las empresas
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-zinc-950">
                Listado de empresas
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Administra, visualiza y gestiona las empresas registradas.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar empresa..."
                  className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs font-medium text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-[#ff4b0b] focus:ring-4 focus:ring-orange-50 sm:w-56"
                />
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((current) =>
                      current === "all"
                        ? "active"
                        : current === "active"
                          ? "trialing"
                          : current === "trialing"
                            ? "inactive"
                            : "all"
                    )
                  }
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 sm:w-auto"
                  title={`Filtro: ${
                    statusFilter === "all"
                      ? "Todos"
                      : statusFilter === "active"
                        ? "Activas"
                        : statusFilter === "trialing"
                          ? "En prueba"
                          : "Inactivas"
                  }`}
                >
                  <Filter size={14} />
                  Filtros
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  {[
                    "Empresa",
                    "Estado",
                    "Plan actual",
                    "Usuarios",
                    "Aplicaciones",
                    "Fecha de registro",
                    "Acciones",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-2 pb-3 text-[10px] font-extrabold text-zinc-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-zinc-100">
                      {Array.from({ length: 7 }).map((__, cell) => (
                        <td key={cell} className="px-2 py-3">
                          <div className="h-8 animate-pulse rounded-lg bg-zinc-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : visibleCompanies.length ? (
                  visibleCompanies.map((company) => {
                    const plan = getPlanLabel(company.plan);
                    const planMeta =
                      PLAN_META[String(plan).toLowerCase()] || PLAN_META["sin plan"];

                    return (
                      <tr
                        key={company.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                      >
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => onOpenCompany?.(company)}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <CompanyAvatar company={company} />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-extrabold text-zinc-900">
                                {company.name}
                              </span>
                              <span className="mt-0.5 block max-w-[150px] truncate text-[10px] text-zinc-400">
                                {company.subtitle}
                              </span>
                            </span>
                          </button>
                        </td>

                        <td className="px-2 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                company.status.key === "active"
                                  ? "bg-emerald-500"
                                  : company.status.key === "trialing"
                                    ? "bg-amber-400"
                                    : "bg-red-500"
                              }`}
                            />
                            {company.status.label}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${planMeta.dot}`}
                            />
                            {plan}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          {company.userCount ?? "—"}
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          {company.applicationCount ?? "—"}
                        </td>

                        <td className="px-2 py-3 text-[11px] font-medium text-zinc-500">
                          {formatDate(company.createdAt)}
                        </td>

                        <td className="relative px-2 py-3 text-right">
                          <button
                            type="button"
                            aria-label={`Acciones para ${company.name}`}
                            onClick={() =>
                              setOpenMenu((current) =>
                                current === company.id ? null : company.id
                              )
                            }
                            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {openMenu === company.id && (
                            <div className="absolute right-2 top-12 z-20 w-40 rounded-xl border border-zinc-200 bg-white p-1.5 text-left shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  onOpenCompany?.(company);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                              >
                                Ver empresa
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  onCompanyAction?.("manage", company);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                              >
                                Gestionar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                        <Building2 size={18} />
                      </div>
                      <p className="mt-3 text-sm font-extrabold text-zinc-900">
                        No hay empresas para mostrar
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Prueba con otro término de búsqueda o filtro.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium text-zinc-500">
              Mostrando {pageStart}–{pageEnd} de {filteredCompanies.length} empresas
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
                const number = index + 1;
                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[10px] font-extrabold ${
                      page === number
                        ? "bg-[#ff4b0b] text-white"
                        : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    {number}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="text-[10px] font-medium text-zinc-500">
              Filas por página:{" "}
              <span className="font-bold text-zinc-700">{PAGE_SIZE}</span>
            </div>
          </div>
        </section>

        {/* Columna lateral */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-zinc-950">
                Distribución por plan
              </h2>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative h-32 w-32 shrink-0">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(#f97316_0_33%,#3b82f6_33%_58%,#eab308_58%_83%,#d4d4d8_83%_100%)]" />
                <div className="absolute inset-5 grid place-items-center rounded-full bg-white">
                  <div className="text-center">
                    <div className="text-[9px] font-medium text-zinc-400">Total</div>
                    <div className="text-xl font-extrabold text-zinc-950">
                      {stats.total}
                    </div>
                    <div className="text-[9px] font-medium text-zinc-400">
                      empresas
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {["Premium", "Intermedio", "Básico", "Sin plan"].map((plan) => {
                  const count = stats.planCounts[plan] || 0;
                  const percentage = stats.total
                    ? Math.round((count / stats.total) * 100)
                    : 0;

                  const meta =
                    PLAN_META[String(plan).toLowerCase()] || PLAN_META["sin plan"];

                  return (
                    <div
                      key={plan}
                      className="flex items-center justify-between gap-2 text-[10px]"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-bold text-zinc-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                        {plan}
                      </span>
                      <span className="shrink-0 text-zinc-400">
                        <strong className="text-zinc-700">{count}</strong>{" "}
                        ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-zinc-950">
                Actividad reciente
              </h2>
              <button
                type="button"
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950"
                onClick={() => onCompanyAction?.("activity")}
              >
                Ver todas →
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {companies.slice(0, 5).map((company, index) => (
                <div key={company.id || index} className="flex gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      index % 3 === 0
                        ? "bg-blue-50 text-blue-600"
                        : index % 3 === 1
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {index === 0 ? (
                      <Users size={13} />
                    ) : index === 1 ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Building2 size={13} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-extrabold text-zinc-800">
                      {index === 0
                        ? "Nueva empresa registrada"
                        : index === 1
                          ? "Empresa activa"
                          : "Actividad de empresa"}
                    </p>
                    <p className="truncate text-[10px] text-zinc-400">
                      {company.name}
                    </p>
                  </div>

                  <span className="shrink-0 text-[9px] font-medium text-zinc-400">
                    reciente
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-blue-500 shadow-xs">
                <HelpCircle size={15} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold text-zinc-800">Tip</p>
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Cerrar tip"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                  Puedes gestionar cada empresa desde el menú de acciones de su fila.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
