import React, { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Ellipsis,
  Filter,
  HelpCircle,
  Lightbulb,
  Search,
  XCircle,
  X,
  AlertCircle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from "lucide-react";

/**
 * Qaway Lab — Super Admin
 * Módulo: Suscripciones
 *
 * Componente independiente para acoplar al panel existente.
 * Requiere:
 *   npm i lucide-react
 *
 * No depende de una librería de gráficos:
 * el donut se construye con CSS/conic-gradient.
 *
 * Para producción:
 * reemplaza `demoSubscriptions` por datos de Supabase/API.
 */

const demoSubscriptions = [
  {
    id: "sub-001",
    company: "CoraVet",
    industry: "Veterinaria",
    initials: "CV",
    logoClass: "bg-blue-50 text-blue-600",
    plan: "Premium",
    apps: ["CRM", "Academia", "Analítica", "Agenda"],
    status: "Activa",
    start: "10 Ago 2026",
    renewal: "10 Sep 2026",
    amount: 199,
  },
  {
    id: "sub-002",
    company: "EPC Contable",
    industry: "Estudio contable",
    initials: "EPC",
    logoClass: "bg-stone-100 text-stone-600",
    plan: "Intermedio",
    apps: ["CRM", "Academia", "Analítica", "Agenda"],
    status: "Activa",
    start: "03 Jul 2026",
    renewal: "03 Ago 2026",
    amount: 99,
  },
  {
    id: "sub-003",
    company: "Vallet Inmobiliaria",
    industry: "Inmobiliaria",
    initials: "V",
    logoClass: "bg-black text-white",
    plan: "Premium",
    apps: ["CRM", "Academia", "Agenda", "Marketing"],
    status: "Activa",
    start: "28 Jun 2026",
    renewal: "28 Jul 2026",
    amount: 199,
  },
  {
    id: "sub-004",
    company: "Mesa Selecta",
    industry: "Alimentos y bebidas",
    initials: "MS",
    logoClass: "bg-stone-50 text-zinc-700",
    plan: "Básico",
    apps: ["Inventario", "Academia", "Analítica", "CRM"],
    status: "En prueba",
    start: "15 Sep 2026",
    renewal: "15 Oct 2026",
    amount: 49,
  },
  {
    id: "sub-005",
    company: "Auréa Skincare",
    industry: "Cuidado personal",
    initials: "A",
    logoClass: "bg-green-50 text-green-700",
    plan: "Intermedio",
    apps: ["CRM", "Agenda", "Marketing", "Analítica"],
    status: "Activa",
    start: "10 Sep 2026",
    renewal: "10 Oct 2026",
    amount: 99,
  },
  {
    id: "sub-006",
    company: "Josué Panadería",
    industry: "Panadería",
    initials: "JP",
    logoClass: "bg-orange-50 text-orange-700",
    plan: "Básico",
    apps: ["Inventario", "Academia", "CRM"],
    status: "Vencida",
    start: "22 Ago 2026",
    renewal: "22 Sep 2026",
    amount: 49,
  },
  {
    id: "sub-007",
    company: "Brenda y Ely",
    industry: "Café artesanal",
    initials: "BE",
    logoClass: "bg-amber-950 text-white",
    plan: "Intermedio",
    apps: ["CRM", "Academia", "Analítica", "Agenda"],
    status: "Activa",
    start: "18 Ago 2026",
    renewal: "18 Oct 2026",
    amount: 99,
  },
  {
    id: "sub-008",
    company: "VAR Sportswear",
    industry: "Ropa deportiva",
    initials: "V",
    logoClass: "bg-black text-white",
    plan: "Premium",
    apps: ["CRM", "Analítica", "Agenda", "Marketing"],
    status: "En prueba",
    start: "30 Ago 2026",
    renewal: "30 Sep 2026",
    amount: 199,
  },
];

const planMeta = {
  Premium: { color: "#ff4b0b", text: "text-orange-600", bg: "bg-orange-50" },
  Intermedio: { color: "#3b82f6", text: "text-blue-600", bg: "bg-blue-50" },
  Básico: { color: "#eab308", text: "text-yellow-600", bg: "bg-yellow-50" },
  Otro: { color: "#a8a29e", text: "text-stone-500", bg: "bg-stone-100" },
};

const statusMeta = {
  Activa: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  "En prueba": {
    dot: "bg-amber-400",
    text: "text-amber-600",
  },
  Vencida: {
    dot: "bg-red-500",
    text: "text-red-600",
  },
};

function Logo({ subscription }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${subscription.logoClass}`}
    >
      {subscription.initials}
    </div>
  );
}

function PlanBadge({ plan }) {
  const meta = planMeta[plan] || planMeta.Otro;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.text}`}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.Activa;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.text}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {status}
    </span>
  );
}

function AppChips({ apps }) {
  const visible = apps.slice(0, 3);
  const remaining = Math.max(apps.length - visible.length, 0);

  return (
    <div className="flex items-center gap-1">
      {visible.map((app, index) => {
        const colors = [
          "bg-orange-50 text-orange-600 border-orange-100",
          "bg-violet-50 text-violet-600 border-violet-100",
          "bg-cyan-50 text-cyan-600 border-cyan-100",
        ];

        return (
          <span
            key={`${app}-${index}`}
            title={app}
            className={`flex h-6 w-6 items-center justify-center rounded-md border text-[9px] font-extrabold ${colors[index]}`}
          >
            {app.slice(0, 1)}
          </span>
        );
      })}

      {remaining > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-100 px-1.5 text-[10px] font-bold text-zinc-500">
          +{remaining}
        </span>
      )}
    </div>
  );
}

function KpiCard({ icon, iconBg, label, value, delta, deltaDirection = "up", note, trend }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>

        <div className="h-10 w-20 overflow-hidden">
          <svg viewBox="0 0 100 40" className="h-full w-full">
            <path
              d={trend}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-[#ff4b0b]"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-bold text-zinc-500">{label}</p>
        <div className="mt-1 flex items-end gap-3">
          <span className="text-2xl font-extrabold tracking-tight text-zinc-950">{value}</span>

          <span
            className={`mb-1 inline-flex items-center gap-0.5 text-xs font-bold ${
              deltaDirection === "down" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {deltaDirection === "down" ? (
              <ArrowDownRight size={13} />
            ) : (
              <ArrowUpRight size={13} />
            )}
            {delta}
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-zinc-400">{note}</p>
      </div>
    </div>
  );
}

function SubscriptionDistribution({ subscriptions }) {
  const counts = subscriptions.reduce(
    (acc, item) => {
      acc[item.plan] = (acc[item.plan] || 0) + 1;
      return acc;
    },
    {}
  );

  const total = subscriptions.length || 1;
  const entries = [
    ["Premium", counts.Premium || 0],
    ["Intermedio", counts.Intermedio || 0],
    ["Básico", counts.Básico || 0],
    ["Otro", counts.Otro || 0],
  ];

  let cursor = 0;
  const segments = entries.map(([plan, count]) => {
    const start = cursor;
    cursor += (count / total) * 360;
    return `${planMeta[plan].color} ${start}deg ${cursor}deg`;
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-950">Suscripciones por plan</h3>
      </div>

      <div className="flex items-center gap-5">
        <div
          className="relative h-32 w-32 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${segments.join(", ")})`,
          }}
        >
          <div className="absolute inset-[16px] flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[10px] text-zinc-400">Total</span>
            <span className="text-xl font-extrabold text-zinc-950">{subscriptions.length}</span>
            <span className="text-[10px] text-zinc-400">suscripciones</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {entries.map(([plan, count]) => {
            const percentage = Math.round((count / total) * 100);

            return (
              <div key={plan} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: planMeta[plan].color }}
                  />
                  <span className="text-xs font-semibold text-zinc-700">{plan}</span>
                </div>

                <span className="text-[11px] font-medium text-zinc-400">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UpcomingRenewals({ subscriptions }) {
  const upcoming = subscriptions
    .filter((item) => item.status !== "Vencida")
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-950">Próximas renovaciones</h3>
        <button className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950">
          Ver todas →
        </button>
      </div>

      <div className="space-y-4">
        {upcoming.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <Logo subscription={item} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-900">{item.company}</p>
              <p className="mt-0.5 text-[11px] text-zinc-400">Plan {item.plan}</p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold text-zinc-500">{item.renewal}</p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                {index === 0 ? "en 5 días" : index === 1 ? "en 5 días" : `en ${13 + index * 6} días`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="relative rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <button
        aria-label="Cerrar tip"
        className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700"
      >
        <X size={14} />
      </button>

      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
          <Lightbulb size={16} />
        </div>

        <div className="pr-5">
          <p className="text-xs font-bold text-zinc-800">Tip</p>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500">
            Puedes configurar recordatorios automáticos de renovación desde la
            configuración del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuscripcionesPanel({
  subscriptions = demoSubscriptions,
  onNewSubscription,
  onOpenSubscription,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 8;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.company.toLowerCase().includes(normalized) ||
        item.plan.toLowerCase().includes(normalized) ||
        item.id.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "Todos" || item.status === statusFilter;

      const matchesPlan =
        planFilter === "Todos" || item.plan === planFilter;

      return matchesQuery && matchesStatus && matchesPlan;
    });
  }, [subscriptions, query, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = subscriptions.filter((x) => x.status === "Activa").length;
  const trialCount = subscriptions.filter((x) => x.status === "En prueba").length;
  const expiredCount = subscriptions.filter((x) => x.status === "Vencida").length;

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("Todos");
    setPlanFilter("Todos");
    setPage(1);
  };

  return (
    <div className="min-h-full bg-transparent font-sans text-zinc-950">
      <main>
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span>Inicio</span>
              <span>›</span>
              <span className="text-zinc-600">Suscripciones</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
              Suscripciones
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Gestiona las suscripciones activas del ecosistema Qaway Lab.
              Visualiza su estado, planes, renovaciones y acciones.
            </p>
          </div>

          <button
            type="button"
            onClick={onNewSubscription}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e03f06]"
          >
            <span className="text-lg leading-none">+</span>
            Nueva suscripción
          </button>
        </div>

        {/* KPI row */}
        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Building2 size={16} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="Total de suscripciones"
            value="12"
            delta="20%"
            note="vs. mes anterior"
            trend="M3 32 C20 32, 28 31, 39 25 S57 22, 67 17 S82 11, 97 9"
          />

          <KpiCard
            icon={<CheckCircle2 size={16} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Activas"
            value="9"
            delta="29%"
            note="vs. mes anterior"
            trend="M3 33 C18 32, 28 29, 39 27 S57 16, 67 14 S83 9, 97 7"
          />

          <KpiCard
            icon={<Clock3 size={16} className="text-orange-500" />}
            iconBg="bg-orange-50"
            label="En prueba"
            value="2"
            delta="0%"
            deltaDirection="neutral"
            note="vs. mes anterior"
            trend="M3 29 C18 27, 28 25, 39 21 S57 19, 67 16 S83 17, 97 13"
          />

          <KpiCard
            icon={<XCircle size={16} className="text-red-500" />}
            iconBg="bg-red-50"
            label="Vencidas"
            value="1"
            delta="50%"
            deltaDirection="down"
            note="vs. mes anterior"
            trend="M3 12 C18 13, 28 14, 39 19 S57 22, 67 28 S83 27, 97 27"
          />
        </section>

        {/* Main content */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_390px]">
          <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-950">
                  Lista de suscripciones
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Todas las suscripciones activas, en prueba o finalizadas.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar empresa, plan o ID..."
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs outline-none placeholder:text-zinc-400 focus:border-zinc-400 sm:w-64"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
                    showFilters
                      ? "border-zinc-300 bg-zinc-50 text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Filter size={14} />
                  Filtros
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium outline-none"
                >
                  <option>Todos</option>
                  <option>Activa</option>
                  <option>En prueba</option>
                  <option>Vencida</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium outline-none"
                >
                  <option>Todos</option>
                  <option>Premium</option>
                  <option>Intermedio</option>
                  <option>Básico</option>
                  <option>Otro</option>
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-9 rounded-lg px-3 text-xs font-bold text-zinc-500 hover:bg-white hover:text-zinc-900"
                >
                  Limpiar
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-y border-zinc-100 bg-zinc-50/60 text-left">
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Empresa
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Plan ↕
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Aplicaciones ↕
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Estado ↕
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Inicio ↕
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Renovación ↕
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Monto
                    </th>
                    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onOpenSubscription?.(item)}
                      className="cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50/70"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Logo subscription={item} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-zinc-900">
                              {item.company}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-400">
                              {item.industry}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <PlanBadge plan={item.plan} />
                      </td>

                      <td className="px-3 py-3">
                        <AppChips apps={item.apps} />
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-3 py-3 text-xs font-medium text-zinc-600">
                        {item.start}
                      </td>

                      <td className="px-3 py-3 text-xs font-medium text-zinc-600">
                        {item.renewal}
                      </td>

                      <td className="px-3 py-3 text-xs font-extrabold text-zinc-800">
                        S/ {item.amount}
                      </td>

                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSubscription?.(item);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900"
                          aria-label={`Acciones de ${item.company}`}
                        >
                          <Ellipsis size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                          <Search size={17} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-zinc-700">
                          No se encontraron suscripciones
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          Prueba con otro término o limpia los filtros.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-500">
                Mostrando{" "}
                <span className="font-bold text-zinc-700">
                  {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-bold text-zinc-700">
                  {Math.min(safePage * pageSize, filtered.length)}
                </span>{" "}
                de{" "}
                <span className="font-bold text-zinc-700">{filtered.length}</span>{" "}
                suscripciones
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(0, 4)
                  .map((number) => (
                    <button
                      type="button"
                      key={number}
                      onClick={() => setPage(number)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold ${
                        number === safePage
                          ? "bg-[#ff4b0b] text-white"
                          : "border border-transparent text-zinc-500 hover:bg-zinc-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>

                <div className="ml-3 hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                  Filas por página:
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 font-medium text-zinc-600"
                  >
                    {pageSize}
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="space-y-4">
            <SubscriptionDistribution subscriptions={subscriptions} />
            <UpcomingRenewals subscriptions={subscriptions} />
            <TipCard />
          </aside>
        </section>
      </main>
    </div>
  );
}
