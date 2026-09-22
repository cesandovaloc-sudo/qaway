import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Lightbulb,
  MoreHorizontal,
  Search,
  WalletCards,
  CheckCircle2,
  Clock3,
  XCircle,
  CreditCard,
  Building2,
  Landmark,
  Smartphone,
  Receipt,
  UserRound,
  X,
} from "lucide-react";

/**
 * PagosPanel.jsx
 *
 * Panel independiente para la sección "Pagos" del Super Administrador.
 *
 * Integración:
 *   - Importar: import PagosPanel from "./PagosPanel";
 *   - Renderizar en la ruta/módulo de Pagos.
 *
 * Actualmente usa datos de demostración contenidos en este archivo.
 * La estructura está preparada para sustituirlos posteriormente por
 * datos reales de Supabase sin modificar la UI.
 */

const INITIAL_PAYMENTS = [
  {
    id: "PAY-2026-0008",
    company: "CoraVet",
    sector: "Veterinaria",
    plan: "Premium",
    amount: 199,
    method: "Yape",
    status: "Completado",
    date: "20 Sep 2026, 10:24",
    logo: "paw",
  },
  {
    id: "PAY-2026-0007",
    company: "EPC Contable",
    sector: "Estudio contable",
    plan: "Intermedio",
    amount: 99,
    method: "Tarjeta",
    status: "Completado",
    date: "18 Sep 2026, 16:30",
    logo: "epc",
  },
  {
    id: "PAY-2026-0006",
    company: "Vallet Inmobiliaria",
    sector: "Inmobiliaria",
    plan: "Premium",
    amount: 199,
    method: "Transferencia",
    status: "Completado",
    date: "15 Sep 2026, 09:12",
    logo: "v",
  },
  {
    id: "PAY-2026-0005",
    company: "Mesa Selecta",
    sector: "Alimentos y bebidas",
    plan: "Básico",
    amount: 49,
    method: "Yape",
    status: "Pendiente",
    date: "14 Sep 2026, 11:45",
    logo: "mesa",
  },
  {
    id: "PAY-2026-0004",
    company: "Auréa Skincare",
    sector: "Cuidado personal",
    plan: "Intermedio",
    amount: 99,
    method: "Plin",
    status: "Completado",
    date: "10 Sep 2026, 08:20",
    logo: "aurea",
  },
  {
    id: "PAY-2026-0003",
    company: "Josué Panadería",
    sector: "Panadería",
    plan: "Básico",
    amount: 49,
    method: "Tarjeta",
    status: "Fallido",
    date: "05 Sep 2026, 14:18",
    logo: "josue",
  },
  {
    id: "PAY-2026-0002",
    company: "Brenda y Ely",
    sector: "Café artesanal",
    plan: "Intermedio",
    amount: 99,
    method: "Transferencia",
    status: "Completado",
    date: "03 Sep 2026, 12:05",
    logo: "brenda",
  },
  {
    id: "PAY-2026-0001",
    company: "VAR Sportswear",
    sector: "Ropa deportiva",
    plan: "Premium",
    amount: 199,
    method: "Yape",
    status: "Completado",
    date: "01 Sep 2026, 09:10",
    logo: "var",
  },
];

const METHOD_DATA = [
  { label: "Yape", value: 40, color: "#7c3aed", icon: Smartphone },
  { label: "Tarjeta", value: 25, color: "#3b82f6", icon: CreditCard },
  { label: "Transferencia", value: 20, color: "#10b981", icon: Landmark },
  { label: "Plin", value: 10, color: "#06b6d4", icon: Smartphone },
  { label: "Otros", value: 5, color: "#a1a1aa", icon: WalletCards },
];

const MONTHLY_REVENUE = [
  { month: "Abr", value: 1500 },
  { month: "May", value: 2000 },
  { month: "Jun", value: 2500 },
  { month: "Jul", value: 3000 },
  { month: "Ago", value: 3300 },
  { month: "Sep", value: 3200 },
];

function HubIcon({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {children}
    </span>
  );
}

function CompanyAvatar({ type }) {
  const base =
    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-100 overflow-hidden";

  const map = {
    paw: "bg-blue-500 text-white",
    epc: "bg-[#f4efe8] text-zinc-600",
    v: "bg-black text-white",
    mesa: "bg-zinc-50 text-zinc-700",
    aurea: "bg-[#edf4e9] text-zinc-700",
    josue: "bg-[#f1e1d2] text-zinc-700",
    brenda: "bg-[#3d1f14] text-white",
    var: "bg-black text-white",
  };

  const labels = {
    paw: "✦",
    epc: "EPC",
    v: "V",
    mesa: "◒",
    aurea: "♧",
    josue: "♟",
    brenda: "◉",
    var: "V",
  };

  return (
    <span className={`${base} ${map[type] || "bg-zinc-100 text-zinc-600"}`}>
      <span className="text-[10px] font-extrabold">{labels[type] || "•"}</span>
    </span>
  );
}

function MethodIcon({ method }) {
  const config = {
    Yape: {
      icon: Smartphone,
      cls: "bg-violet-50 text-violet-600",
    },
    Tarjeta: {
      icon: CreditCard,
      cls: "bg-blue-50 text-blue-600",
    },
    Transferencia: {
      icon: Landmark,
      cls: "bg-blue-50 text-blue-600",
    },
    Plin: {
      icon: Smartphone,
      cls: "bg-cyan-50 text-cyan-600",
    },
  };

  const item = config[method] || {
    icon: WalletCards,
    cls: "bg-zinc-100 text-zinc-600",
  };

  const Icon = item.icon;

  return (
    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.cls}`}>
      <Icon size={14} strokeWidth={2.2} />
    </span>
  );
}

function StatusBadge({ status }) {
  const config = {
    Completado: "bg-emerald-50 text-emerald-600",
    Pendiente: "bg-amber-50 text-amber-600",
    Fallido: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
        config[status] || "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}

function KpiCard({ icon, iconClass, label, value, delta, deltaClass, note, line }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
      <div className="flex items-start justify-between">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
        {line}
      </div>

      <div className="mt-2 text-xs font-bold text-zinc-500">{label}</div>

      <div className="mt-1 flex items-end gap-2">
        <div className="text-2xl font-extrabold tracking-tight text-zinc-950">
          {value}
        </div>
        <div className={`text-xs font-bold mb-1 ${deltaClass}`}>{delta}</div>
      </div>

      <div className="text-[10px] font-medium text-zinc-400">{note}</div>
    </div>
  );
}

function MiniLine({ points, stroke = "#ff4b0b" }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 70;
      const y = 22 - ((value - min) / range) * 17;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="78" height="28" viewBox="0 0 78 28" className="shrink-0">
      <polyline
        points={coords}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(3 2)"
      />
    </svg>
  );
}

function DonutChart({ data, total }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-[150px] h-[150px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="14"
        />

        {data.map((item) => {
          const dash = (item.value / 100) * circumference;
          const currentOffset = offset;
          offset += dash;

          return (
            <circle
              key={item.label}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-extrabold text-zinc-950">
          S/ {total.toLocaleString("es-PE")}
        </div>
        <div className="text-[10px] text-zinc-400 font-medium">Total</div>
      </div>
    </div>
  );
}

function RevenueBars({ data }) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div className="mt-3 h-[108px] flex items-end gap-3 px-1">
      {data.map((item) => {
        const height = Math.max(10, (item.value / max) * 78);

        return (
          <div key={item.month} className="flex-1 h-full flex flex-col justify-end">
            <div
              className="w-full rounded-t-md bg-[#ff4b0b]"
              style={{ height }}
              title={`S/ ${item.value.toLocaleString("es-PE")}`}
            />
            <div className="mt-2 text-[10px] text-center text-zinc-400 font-medium">
              {item.month}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PagosPanel() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 30 Sep 2026");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredPayments = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesQuery =
        !normalized ||
        payment.id.toLowerCase().includes(normalized) ||
        payment.company.toLowerCase().includes(normalized) ||
        payment.method.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "Todos" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "Todos" || payment.method === methodFilter;

      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [payments, query, statusFilter, methodFilter]);

  const totalRevenue = payments
    .filter((p) => p.status === "Completado")
    .reduce((sum, p) => sum + p.amount, 0);

  const completed = payments.filter((p) => p.status === "Completado").length;
  const pending = payments.filter((p) => p.status === "Pendiente").length;
  const failed = payments.filter((p) => p.status === "Fallido").length;

  const handleExport = () => {
    const headers = [
      "ID / Referencia",
      "Empresa",
      "Plan",
      "Monto",
      "Método de pago",
      "Estado",
      "Fecha",
    ];

    const rows = payments.map((p) => [
      p.id,
      p.company,
      p.plan,
      `S/ ${p.amount}`,
      p.method,
      p.status,
      p.date,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pagos-qaway-lab.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter("Todos");
    setMethodFilter("Todos");
    setQuery("");
  };

  return (
    <div className="min-h-full bg-zinc-50 font-sans text-zinc-950">
      <main className="p-5 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span>Inicio</span>
              <ChevronRight size={13} />
              <span className="text-zinc-500">Pagos</span>
            </div>

            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950">
              Pagos
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Gestiona y monitorea todos los pagos del ecosistema Qaway Lab.
              Visualiza transacciones, estados y métodos de pago.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-700 shadow-xs inline-flex items-center gap-2 hover:bg-zinc-50"
            >
              <CalendarDays size={15} />
              {dateRange}
              <ChevronDown size={14} />
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="h-11 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white inline-flex items-center gap-2 shadow-sm hover:bg-[#f04406]"
            >
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Ingresos totales (MRR)"
            value={`S/ ${totalRevenue.toLocaleString("es-PE")}`}
            delta="↑ 15%"
            deltaClass="text-emerald-600"
            note="vs. mes anterior"
            icon={<WalletCards size={15} className="text-emerald-600" />}
            iconClass="bg-emerald-50"
            line={<MiniLine points={[10, 13, 18, 23, 28, 31]} stroke="#10b981" />}
          />

          <KpiCard
            label="Pagos completados"
            value={completed}
            delta="↑ 27%"
            deltaClass="text-emerald-600"
            note="vs. mes anterior"
            icon={<CheckCircle2 size={15} className="text-emerald-600" />}
            iconClass="bg-emerald-50"
            line={<MiniLine points={[9, 12, 14, 19, 22, 23]} stroke="#3b82f6" />}
          />

          <KpiCard
            label="Pagos pendientes"
            value={pending}
            delta="↓ 25%"
            deltaClass="text-red-600"
            note="vs. mes anterior"
            icon={<Clock3 size={15} className="text-orange-600" />}
            iconClass="bg-orange-50"
            line={<MiniLine points={[20, 22, 21, 18, 16, 13]} stroke="#ff4b0b" />}
          />

          <KpiCard
            label="Pagos fallidos"
            value={failed}
            delta="↓ 50%"
            deltaClass="text-emerald-600"
            note="vs. mes anterior"
            icon={<XCircle size={15} className="text-red-600" />}
            iconClass="bg-red-50"
            line={<MiniLine points={[23, 21, 18, 13, 12, 7]} stroke="#ef4444" />}
          />
        </div>

        {/* Main content */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Payment history */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-bold">Historial de pagos</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Todas las transacciones del ecosistema Qaway Lab.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full xl:w-[280px]">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar por empresa, usuario, ID o referencia..."
                      className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-[#ff4b0b] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters((value) => !value)}
                    className={`h-9 rounded-xl border px-3 text-xs font-bold inline-flex items-center gap-2 ${
                      showFilters || statusFilter !== "Todos" || methodFilter !== "Todos"
                        ? "border-orange-200 bg-orange-50 text-[#ff4b0b]"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    <Filter size={14} />
                    Filtros
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium"
                  >
                    <option>Todos</option>
                    <option>Completado</option>
                    <option>Pendiente</option>
                    <option>Fallido</option>
                  </select>

                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium"
                  >
                    <option>Todos</option>
                    <option>Yape</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                    <option>Plin</option>
                  </select>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-9 rounded-lg px-3 text-xs font-bold text-zinc-500 hover:bg-white"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-zinc-50/70">
                    {[
                      "ID / Referencia",
                      "Empresa",
                      "Plan",
                      "Monto",
                      "Método de pago",
                      "Estado",
                      "Fecha",
                      "Acciones",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 whitespace-nowrap"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-bold text-zinc-700 whitespace-nowrap">
                        {payment.id}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CompanyAvatar type={payment.logo} />
                          <div>
                            <div className="text-xs font-bold text-zinc-800">
                              {payment.company}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {payment.sector}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">
                        {payment.plan}
                      </td>

                      <td className="px-4 py-3 text-xs font-bold text-zinc-700 whitespace-nowrap">
                        S/ {payment.amount}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 whitespace-nowrap">
                          <MethodIcon method={payment.method} />
                          {payment.method}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">
                        {payment.date}
                      </td>

                      <td className="px-4 py-3 relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === payment.id ? null : payment.id
                            )
                          }
                          className="w-7 h-7 rounded-lg border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {openMenu === payment.id && (
                          <div className="absolute right-4 top-11 z-20 w-36 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                            <button
                              type="button"
                              onClick={() => setOpenMenu(null)}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-zinc-50"
                            >
                              Ver detalle
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenMenu(null)}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-zinc-50"
                            >
                              Ver empresa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="text-sm font-bold text-zinc-700">
                          No se encontraron pagos
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Ajusta la búsqueda o los filtros.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
              <div className="text-xs text-zinc-400">
                Mostrando {filteredPayments.length} de {payments.length} pagos
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-400"
                >
                  <ChevronLeft size={15} />
                </button>

                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-[#ff4b0b] text-white text-xs font-bold"
                >
                  1
                </button>

                <button
                  type="button"
                  className="w-8 h-8 rounded-lg border border-zinc-200 bg-white inline-flex items-center justify-center text-zinc-500"
                >
                  <ChevronRight size={15} />
                </button>

                <select className="ml-2 h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-500">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-4">
            <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
              <h2 className="text-sm font-bold">Métodos de pago</h2>

              <div className="mt-4 flex items-center gap-4">
                <DonutChart data={METHOD_DATA} total={2900} />

                <div className="flex-1 space-y-3">
                  {METHOD_DATA.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-medium text-zinc-600">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-zinc-500">
                          {item.value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Ingresos por mes</h2>

                <button
                  type="button"
                  className="h-7 rounded-lg border border-zinc-200 bg-white px-2.5 text-[10px] font-bold text-zinc-500 inline-flex items-center gap-1"
                >
                  Últimos 6 meses
                  <ChevronDown size={12} />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[10px] text-zinc-400">
                <span>S/ 4,000</span>
              </div>

              <RevenueBars data={MONTHLY_REVENUE} />

              <div className="mt-1 border-t border-zinc-100 pt-2 text-[10px] text-zinc-400">
                Evolución de ingresos registrados
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Actividad reciente</h2>
                <button
                  type="button"
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Ver todas →
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {[
                  {
                    icon: <CheckCircle2 size={14} />,
                    bg: "bg-blue-50 text-blue-600",
                    title: "Pago completado",
                    text: "CoraVet - S/ 199 (Yape)",
                    time: "hace 2 horas",
                  },
                  {
                    icon: <Clock3 size={14} />,
                    bg: "bg-orange-50 text-orange-600",
                    title: "Pago pendiente",
                    text: "Mesa Selecta - S/ 49",
                    time: "hace 6 horas",
                  },
                  {
                    icon: <XCircle size={14} />,
                    bg: "bg-red-50 text-red-600",
                    title: "Pago fallido",
                    text: "Josué Panadería - S/ 49",
                    time: "hace 1 día",
                  },
                  {
                    icon: <Receipt size={14} />,
                    bg: "bg-blue-50 text-blue-600",
                    title: "Nuevo pago",
                    text: "EPC Contable - S/ 99",
                    time: "hace 1 día",
                  },
                ].map((item) => (
                  <div key={item.title + item.text} className="flex gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}
                    >
                      {item.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-zinc-800">
                          {item.title}
                        </div>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-zinc-500">
                        {item.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb size={15} />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-800">Tip</h3>
                    <button
                      type="button"
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                    Exporta el historial para conciliar pagos, revisar estados
                    y mantener un respaldo operativo.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
