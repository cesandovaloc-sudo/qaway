import React, { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ExternalLink,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  X,
} from "lucide-react";

/**
 * SupportPanel
 * Panel de Soporte para acoplar al dashboard de Super Administrador.
 *
 * Requiere:
 *   npm install lucide-react
 *
 * El componente funciona con datos mock por defecto para permitir
 * integrar primero la UI y posteriormente conectar Supabase/API.
 */

const DEFAULT_TICKETS = [
  {
    id: "SUP-2026-0032",
    company: "CoraVet",
    subject: "Error al iniciar sesión",
    application: "CRM",
    priority: "Alta",
    status: "Abierto",
    assignedTo: "Soporte",
    date: "20 Sep 2026",
    avatar: "CV",
  },
  {
    id: "SUP-2026-0031",
    company: "EPC Contable",
    subject: "No se genera reporte",
    application: "Analítica",
    priority: "Media",
    status: "En proceso",
    assignedTo: "Luis R.",
    date: "20 Sep 2026",
    avatar: "EP",
  },
  {
    id: "SUP-2026-0030",
    company: "Vallet Inmobiliaria",
    subject: "Consulta sobre plan",
    application: "Planes",
    priority: "Baja",
    status: "Cerrado",
    assignedTo: "Ana M.",
    date: "19 Sep 2026",
    avatar: "V",
  },
  {
    id: "SUP-2026-0029",
    company: "Mesa Selecta",
    subject: "Problema con pagos",
    application: "Pagos",
    priority: "Alta",
    status: "En espera",
    assignedTo: "Soporte",
    date: "18 Sep 2026",
    avatar: "MS",
  },
  {
    id: "SUP-2026-0028",
    company: "Auréa Skincare",
    subject: "Cómo integrar mi web",
    application: "Integraciones",
    priority: "Media",
    status: "En proceso",
    assignedTo: "Carlos T.",
    date: "18 Sep 2026",
    avatar: "AS",
  },
  {
    id: "SUP-2026-0027",
    company: "Josué Panadería",
    subject: "Solicitud de capacitación",
    application: "Academia",
    priority: "Baja",
    status: "Cerrado",
    assignedTo: "Soporte",
    date: "17 Sep 2026",
    avatar: "JP",
  },
  {
    id: "SUP-2026-0026",
    company: "Brenda y Ely",
    subject: "No llegan las notificaciones",
    application: "Agenda",
    priority: "Alta",
    status: "Abierto",
    assignedTo: "María P.",
    date: "17 Sep 2026",
    avatar: "BE",
  },
  {
    id: "SUP-2026-0025",
    company: "VAR Sportswear",
    subject: "Duda sobre usuarios",
    application: "Usuarios",
    priority: "Media",
    status: "En proceso",
    assignedTo: "Soporte",
    date: "16 Sep 2026",
    avatar: "VS",
  },
];

const APPLICATIONS = [
  { name: "CRM", count: 8, pct: 25, className: "bg-[#ff4b0b]" },
  { name: "Agenda", count: 6, pct: 19, className: "bg-blue-500" },
  { name: "Pagos", count: 5, pct: 16, className: "bg-emerald-500" },
  { name: "Planes", count: 4, pct: 13, className: "bg-purple-500" },
  { name: "Academia", count: 4, pct: 13, className: "bg-amber-500" },
  { name: "Otros", count: 5, pct: 16, className: "bg-gray-400" },
];

const ACTIVITY = [
  ["Nuevo ticket creado", "CoraVet · Error al iniciar sesión", "hace 1 hora", "blue"],
  ["Estado actualizado", "EPC Contable · En proceso", "hace 3 horas", "red"],
  ["Respuesta enviada", "Mesa Selecta · Problema con pagos", "hace 5 horas", "orange"],
  ["Ticket cerrado", "Vallet Inmobiliaria · Consulta sobre plan", "hace 1 día", "green"],
  ["Nuevo comentario", "Auréa Skincare · Cómo integrar mi web", "hace 1 día", "purple"],
];

const tabs = [
  ["Todos", null],
  ["Abiertos", "Abierto"],
  ["En espera", "En espera"],
  ["En proceso", "En proceso"],
  ["Cerrados", "Cerrado"],
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({ icon, title, value, change, positive = true, lineClass = "text-[#ff4b0b]" }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,.02)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-blue-500">
            {icon}
          </div>
          <span className="text-[12px] font-semibold text-gray-600">{title}</span>
        </div>
        <div className={cn("mt-1 h-5 w-20 opacity-80", lineClass)}>
          <svg viewBox="0 0 80 22" className="h-full w-full" fill="none">
            <path
              d="M2 17 C15 17 17 15 26 14 C36 13 38 8 48 9 C59 10 62 3 78 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-2 flex items-end gap-3">
        <span className="text-[28px] font-bold leading-none tracking-tight text-gray-950">{value}</span>
        <span className={cn("mb-0.5 text-[12px] font-semibold", positive ? "text-emerald-500" : "text-red-500")}>
          {change}
        </span>
      </div>
      <div className="mt-1 pl-11 text-[11px] text-gray-500">vs. mes anterior</div>
    </div>
  );
}

function Badge({ children, type }) {
  const styles = {
    Alta: "bg-red-50 text-red-500",
    Media: "bg-amber-50 text-amber-600",
    Baja: "bg-emerald-50 text-emerald-600",
    Abierto: "bg-red-50 text-red-500",
    "En proceso": "bg-blue-50 text-blue-600",
    "En espera": "bg-amber-50 text-amber-600",
    Cerrado: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold", styles[type] || "bg-gray-100 text-gray-600")}>
      {children}
    </span>
  );
}

function DonutChart() {
  const segments = [
    { pct: 25, color: "#ff4b0b" },
    { pct: 19, color: "#3b82f6" },
    { pct: 16, color: "#10b981" },
    { pct: 13, color: "#8b5cf6" },
    { pct: 13, color: "#f59e0b" },
    { pct: 14, color: "#d1d5db" },
  ];

  let start = 0;
  const gradient = segments
    .map((segment) => {
      const end = start + segment.pct;
      const result = `${segment.color} ${start}% ${end}%`;
      start = end;
      return result;
    })
    .join(", ");

  return (
    <div
      className="relative h-[128px] w-[128px] shrink-0 rounded-full"
      style={{ background: `conic-gradient(${gradient})` }}
    >
      <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[20px] font-bold text-gray-900">32</span>
        <span className="text-[10px] text-gray-500">tickets</span>
      </div>
    </div>
  );
}

export default function SupportPanel({
  tickets = DEFAULT_TICKETS,
  onNewTicket,
  onOpenTicket,
  onOpenHelp,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showTip, setShowTip] = useState(true);

  const filteredTickets = useMemo(() => {
    const status = tabs[activeTab][1];
    const normalized = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = !status || ticket.status === status;
      const matchesQuery =
        !normalized ||
        [
          ticket.id,
          ticket.company,
          ticket.subject,
          ticket.application,
          ticket.assignedTo,
        ].some((value) => value.toLowerCase().includes(normalized));

      return matchesStatus && matchesQuery;
    });
  }, [tickets, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, page, itemsPerPage]);

  const counts = useMemo(() => {
    const countByStatus = (status) => tickets.filter((t) => t.status === status).length;
    return {
      all: tickets.length,
      open: countByStatus("Abierto"),
      waiting: countByStatus("En espera"),
      process: countByStatus("En proceso"),
      closed: countByStatus("Cerrado"),
    };
  }, [tickets]);

  const tabCounts = [counts.all, counts.open, counts.waiting, counts.process, counts.closed];

  return (
    <div className="min-h-full bg-transparent text-zinc-950">
      <main>
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] text-gray-500">
              <span>Inicio</span>
              <span>›</span>
              <span>Soporte</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">Soporte</h1>
            <p className="mt-1 text-[14px] text-gray-500">
              Gestiona y da seguimiento a las solicitudes de soporte del ecosistema Qaway Lab.
              Resuelve incidencias y mejora la experiencia de tus clientes.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onOpenHelp}
              className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              <CircleHelp size={15} />
              Centro de ayuda
              <ExternalLink size={13} />
            </button>
            <button
              type="button"
              onClick={onNewTicket}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e94408]"
            >
              <Plus size={16} />
              Nuevo ticket
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          <StatCard icon={<Ticket size={16} />} title="Total de tickets" value="32" change="↑ 23%" positive lineClass="text-blue-500" />
          <StatCard icon={<AlertCircle size={16} />} title="Tickets abiertos" value="8" change="↓ 38%" positive lineClass="text-[#ff4b0b]" />
          <StatCard icon={<Clock3 size={16} />} title="En espera" value="5" change="↓ 17%" positive lineClass="text-purple-500" />
          <StatCard icon={<CheckCircle2 size={16} />} title="Cerrados este mes" value="19" change="↑ 41%" positive lineClass="text-emerald-500" />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-3">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Tabs + search */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 pt-3">
              <div className="flex gap-6">
                {tabs.map(([label], index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setActiveTab(index);
                      setPage(1);
                    }}
                    className={cn(
                      "relative pb-3 pt-1 text-[12px] font-medium",
                      activeTab === index ? "font-semibold text-[#ff4b0b]" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {label} ({tabCounts[index]})
                    {activeTab === index && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#ff4b0b]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-[220px] items-center gap-2 rounded-lg border border-gray-200 px-3">
                  <Search size={14} className="text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar tickets..."
                    className="w-full bg-transparent text-[11px] outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-lg border px-4 text-[11px] font-semibold",
                    showFilters ? "border-[#ff4b0b] bg-orange-50 text-[#ff4b0b]" : "border-gray-200 text-gray-700"
                  )}
                >
                  <SlidersHorizontal size={13} />
                  Filtros
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3 text-[11px] text-gray-500">
                <span>Filtros avanzados de tickets</span>
                <button type="button" onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#fcfcfd]">
                    {["# Ticket", "Empresa", "Asunto", "Aplicación", "Prioridad", "Estado", "Asignado a", "Fecha", "Acciones"].map((head) => (
                      <th
                        key={head}
                        className="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 first:pl-5 last:pr-5"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => onOpenTicket?.(ticket)}
                      className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-3 py-3 pl-5 text-[11px] font-semibold text-gray-700">
                        {ticket.id}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-600">
                            {ticket.avatar}
                          </div>
                          <span className="whitespace-nowrap text-[11px] font-semibold text-gray-900">{ticket.company}</span>
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3 text-[11px] text-gray-500">{ticket.subject}</td>
                      <td className="px-3 py-3 text-[11px] text-gray-600">{ticket.application}</td>
                      <td className="px-3 py-3"><Badge type={ticket.priority}>{ticket.priority}</Badge></td>
                      <td className="px-3 py-3"><Badge type={ticket.status}>{ticket.status}</Badge></td>
                      <td className="whitespace-nowrap px-3 py-3 text-[11px] text-gray-600">{ticket.assignedTo}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-[11px] text-gray-500">{ticket.date}</td>
                      <td className="px-3 py-3 pr-5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenTicket?.(ticket);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-[12px] text-gray-500">
                        No se encontraron tickets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-[11px] text-gray-500">
                Mostrando {filteredTickets.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, filteredTickets.length)} de {filteredTickets.length} tickets
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold",
                      page === number ? "bg-[#ff4b0b] text-white" : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                Filas por página:
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1.5 outline-none"
                >
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-3">
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-bold text-zinc-950">Tickets por aplicación</h2>
              <div className="mt-4 flex items-center gap-5">
                <DonutChart />
                <div className="flex-1 space-y-3">
                  {APPLICATIONS.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", item.className)} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="whitespace-nowrap text-gray-500">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-950">Actividad reciente</h2>
                <button type="button" className="text-[11px] font-medium text-gray-500 hover:text-gray-900">
                  Ver todas →
                </button>
              </div>

              <div className="space-y-4">
                {ACTIVITY.map(([title, detail, time, color]) => (
                  <div key={title} className="flex gap-3">
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      color === "blue" && "bg-blue-50 text-blue-500",
                      color === "red" && "bg-red-50 text-red-500",
                      color === "orange" && "bg-orange-50 text-orange-500",
                      color === "green" && "bg-emerald-50 text-emerald-500",
                      color === "purple" && "bg-purple-50 text-purple-500"
                    )}>
                      <MessageCircle size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-800">{title}</p>
                      <p className="truncate text-[10px] text-gray-500">{detail}</p>
                    </div>
                    <span className="whitespace-nowrap text-[9px] text-gray-400">{time}</span>
                  </div>
                ))}
              </div>
            </section>

            {showTip && (
              <section className="relative rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                <button
                  type="button"
                  onClick={() => setShowTip(false)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                >
                  <X size={13} />
                </button>
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                    <span className="text-sm">💡</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">Tip</h3>
                    <p className="mt-1 pr-2 text-[10px] leading-4 text-gray-500">
                      Puedes crear respuestas rápidas para agilizar la atención de tickets frecuentes.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
