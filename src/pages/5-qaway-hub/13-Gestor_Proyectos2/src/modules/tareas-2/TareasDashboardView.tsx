import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { usePerfilGp } from "../../services/gpPermisosService";
import { esTenantMineduPrincipal } from "../../services/gestorTareasLocalService";
import {
  House,
  CalendarDays,
  FolderKanban,
  MapPin,
  UsersRound,
  ClipboardCheck,
  Presentation,
  ChartNoAxesColumn,
  Settings,
  CircleHelp,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  Plus,
  MoreHorizontal,
  Check,
  Info,
  Zap,
  CircleAlert,
  Flag,
  CircleCheck,
  CalendarRange,
  LayoutDashboard,
  Columns3,
  List,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  X,
} from "lucide-react";
import type { Item } from "./Tareas2View";

type Priority = "Urgente" | "Alta" | "Media" | "Baja";
type Status = "Pendiente" | "En proceso" | "En revisión" | "Completada";
type Task = {
  id: number;
  title: string;
  code: string;
  area: string;
  priority: Priority;
  status: Status;
  dueLabel: string;
  assignees: string[];
};

const priorities: Priority[] = ["Urgente", "Alta", "Media", "Baja"];
const priorityMeta: Record<
  Priority,
  {
    header: string;
    text: string;
    count: string;
    border: string;
    date: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  Urgente: {
    header: "bg-[#f04444]",
    text: "text-white",
    count: "bg-white/80 text-red-700",
    border: "border-l-red-500",
    date: "bg-red-100 text-red-700",
    icon: Zap,
  },
  Alta: {
    header: "bg-[#ffc52f]",
    text: "text-[#3b2b00]",
    count: "bg-white/80 text-amber-800",
    border: "border-l-amber-500",
    date: "bg-amber-100 text-amber-800",
    icon: CircleAlert,
  },
  Media: {
    header: "bg-[#8bb9ff]",
    text: "text-[#082e70]",
    count: "bg-white/80 text-blue-700",
    border: "border-l-blue-600",
    date: "bg-blue-100 text-blue-800",
    icon: Flag,
  },
  Baja: {
    header: "bg-[#8cdbb7]",
    text: "text-[#064b32]",
    count: "bg-white/80 text-emerald-800",
    border: "border-l-emerald-600",
    date: "bg-emerald-100 text-emerald-800",
    icon: CircleCheck,
  },
};

const defaultTasks: Task[] = [
  { id: 1, title: "Validar documentación recibida", code: "SP-04", area: "Consolidación", priority: "Urgente", status: "En revisión", dueLabel: "Hoy", assignees: ["CS", "AM"] },
  { id: 2, title: "Coordinar acciones de planificación", code: "SP-01", area: "Planificación", priority: "Urgente", status: "Pendiente", dueLabel: "Mañana", assignees: ["AM"] },
  { id: 3, title: "Elaborar y validar el plan de distribución", code: "SP-01", area: "Planificación", priority: "Alta", status: "En proceso", dueLabel: "14 nov.", assignees: ["AM"] },
  { id: 4, title: "Registro de recepción de materiales", code: "SP-02", area: "Almacenes", priority: "Alta", status: "En proceso", dueLabel: "18 nov.", assignees: ["CS", "JR"] },
  { id: 5, title: "Informe de avance regional", code: "SP-05", area: "Seguimiento", priority: "Media", status: "En revisión", dueLabel: "13 nov.", assignees: ["JR"] },
  { id: 6, title: "Conformación de comité regional", code: "SP-01", area: "Planificación", priority: "Media", status: "En proceso", dueLabel: "20 nov.", assignees: ["AM", "JR"] },
  { id: 7, title: "Validación de información", code: "SP-04", area: "Consolidación", priority: "Baja", status: "Completada", dueLabel: "28 oct.", assignees: ["AM"] },
  { id: 8, title: "Actualización de matriz de entregables", code: "SP-05", area: "Informe", priority: "Baja", status: "Completada", dueLabel: "30 oct.", assignees: ["CS"] },
];

const teams = [
  { name: "Coord. Macroregionales", people: 12, values: [8, 5, 6, 4, 3], total: 26, tone: "green" },
  { name: "Gestores", people: 28, values: [12, 14, 10, 9, 8], total: 53, tone: "amber" },
  { name: "Equipo Central", people: 6, values: [4, 3, 5, 2, 4], total: 18, tone: "purple" },
];

const areas = ["Planificación", "Almacenes", "II.EE.", "Consolidación", "Informe"];

const states = [
  { name: "Completadas", value: 46, color: "#45bd86" },
  { name: "En proceso", value: 18, color: "#1769f5" },
  { name: "En revisión", value: 12, color: "#ffc52f" },
  { name: "Por vencer", value: 6, color: "#ef4444" },
  { name: "Pendientes", value: 15, color: "#c5ccd8" },
];

const priorityTotals: Record<Priority, number> = { Urgente: 6, Alta: 18, Media: 58, Baja: 15 };

function Avatar({ initials }: { initials: string }) {
  const colors: Record<string, string> = { CS: "bg-[#183d55]", AM: "bg-[#a96d4c]", JR: "bg-[#637b9c]" };
  return (
    <span
      title={initials}
      className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm ${
        colors[initials] ?? "bg-slate-500"
      }`}
    >
      {initials}
    </span>
  );
}

function Donut() {
  return (
    <div role="img" aria-label="97 tareas por estado" className="relative h-[142px] w-[142px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={states}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={68}
            paddingAngle={1}
            stroke="none"
            isAnimationActive={false}
          >
            {states.map((state) => (
              <Cell key={state.name} fill={state.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[32px] font-extrabold leading-none text-[#0f172a]">97</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">tareas</div>
        </div>
      </div>
    </div>
  );
}

function HeatCell({ value, tone }: { value: number; tone: string }) {
  const color =
    tone === "green"
      ? value >= 8
        ? "bg-[#50bd8b] text-white"
        : "bg-[#d8f3e7] text-[#176b4b]"
      : tone === "amber"
      ? value >= 10
        ? "bg-[#f7a51a] text-white"
        : "bg-[#ffe6a8] text-[#855000]"
      : value >= 5
      ? "bg-[#bd8ce8] text-white"
      : "bg-[#ead8f8] text-[#7440a3]";
  return (
    <div className={`grid h-9 place-items-center rounded-md text-sm font-bold ${color}`}>
      {value}
    </div>
  );
}

function TaskCard({ task, onSelect }: { task: Task; onSelect?: () => void }) {
  const meta = priorityMeta[task.priority];
  const Icon = meta.icon;
  const done = task.status === "Completada";
  return (
    <article
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border border-slate-100 border-l-[3px] ${meta.border} bg-white p-3 shadow-[0_2px_8px_rgba(25,54,99,0.07)] transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start gap-2">
        <h4 className="min-w-0 flex-1 text-[12px] font-bold leading-[1.35] text-[#15213d]">{task.title}</h4>
        <button
          type="button"
          aria-label={`Opciones de ${task.title}`}
          className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      <div className="mt-1.5 text-[11px] font-medium text-[#52688f]">
        {task.code} · {task.area}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {task.assignees.map((person) => (
            <Avatar key={person} initials={person} />
          ))}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
            done ? "bg-emerald-100 text-emerald-800" : meta.date
          }`}
        >
          {done ? <Check size={12} /> : <CalendarDays size={12} />}
          {task.dueLabel}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-[10px] text-slate-500">{task.status}</span>
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            done
              ? "bg-emerald-500"
              : task.status === "En revisión"
              ? "bg-amber-400"
              : task.status === "En proceso"
              ? "bg-blue-500"
              : "bg-slate-300"
          }`}
        />
      </div>
    </article>
  );
}

interface Props {
  items?: Item[];
  allItems?: Item[];
  onSelectItem?: (item: Item) => void;
  onOpenAsignar?: (opts?: { role?: string; item?: Item | null; gestorName?: string }) => void;
  onViewGantt?: () => void;
  onViewLista?: () => void;
}

export default function TareasDashboardView({
  items,
  allItems,
  onSelectItem,
  onOpenAsignar,
  onViewGantt,
  onViewLista,
}: Props) {
  const [view, setView] = useState<"general" | "kanban" | "lista" | "equipo">("general");
  const [priority, setPriority] = useState<"Todas" | Priority>("Todas");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(
    () =>
      defaultTasks.filter(
        (task) =>
          (priority === "Todas" || task.priority === priority) &&
          `${task.title} ${task.area} ${task.code}`.toLowerCase().includes(search.toLowerCase())
      ),
    [priority, search]
  );

  const grouped = useMemo(
    () =>
      priorities.reduce((acc, p) => {
        acc[p] = visible.filter((task) => task.priority === p);
        return acc;
      }, {} as Record<Priority, Task[]>),
    [visible]
  );

  const { perfil, cargando: cargandoPerfilGp } = usePerfilGp();
  const esDigerePrincipal = esTenantMineduPrincipal(perfil?.tenantId);

  const tabs = [
    { id: "general", label: "Vista general", icon: LayoutDashboard },
    { id: "kanban", label: "Kanban", icon: Columns3 },
    { id: "lista", label: "Lista", icon: List },
    { id: "equipo", label: "Por equipo", icon: UsersRound },
  ] as const;

  if (cargandoPerfilGp) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Cargando tareas...
      </div>
    );
  }

  if (!esDigerePrincipal && (!items || items.length === 0)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-900">Sin tareas registradas</h3>
        <p className="mt-1 text-sm text-slate-500">
          Este espacio inicia limpio. Crea un proyecto o asigna tu primera tarea para comenzar.
        </p>
        {onOpenAsignar && (
          <button
            type="button"
            onClick={onOpenAsignar}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={15} />
            <span>Asignar tarea</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto bg-[#f2f6fc] text-[#14213d]">
      <div className="mx-auto max-w-[1700px] p-4 md:p-6">
        {/* Cabecera Principal de Tareas del Proyecto */}
        <section className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-[#1769f5] shadow-sm">
              <ClipboardCheck size={30} />
            </div>
            <div>
              <h1 className="text-[23px] font-extrabold tracking-tight text-[#111d39] md:text-[27px]">
                Tareas del Proyecto
              </h1>
              <p className="text-xs text-[#52688f] md:text-sm">
                Asignación, seguimiento y control del trabajo del equipo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Más opciones"
            >
              <MoreHorizontal size={19} />
            </button>
            <button
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:bg-slate-50 sm:flex"
              onClick={onViewLista}
            >
              <Download size={16} />
              Exportar
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-[#0866f5] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-600"
              onClick={() => onOpenAsignar?.()}
            >
              <Plus size={17} />
              Asignar tarea
            </button>
          </div>
        </section>

        {/* Selector de sub-vistas internas */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-white/60 p-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition md:px-4 ${
                    view === tab.id ? "bg-[#0866f5] text-white shadow-md" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm">
            <CalendarRange size={16} />
            Sep. 2026 – Abr. 2027
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search size={15} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarea, código o subproceso..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
              filtersOpen ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
          {filtersOpen && (
            <>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "Todas" | Priority)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
              >
                <option>Todas</option>
                {priorities.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setPriority("Todas");
                  setSearch("");
                }}
                className="inline-flex items-center gap-1 px-2 text-xs font-semibold text-blue-700"
              >
                <X size={13} />
                Limpiar
              </button>
            </>
          )}
        </div>

        {/* Vista 1: General */}
        {view === "general" && (
          <>
            <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
              {/* Mapa de calor por equipo */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_rgba(30,64,120,0.06)]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold text-[#111d39]">
                    Carga de trabajo por equipo{" "}
                    <span className="font-medium text-slate-500">(Mapa de calor)</span>{" "}
                    <span className="inline-flex align-middle text-slate-400">
                      <Info size={14} />
                    </span>
                  </h2>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                    Por subproceso <ChevronDown size={13} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[620px]">
                    <div className="grid grid-cols-[220px_repeat(5,minmax(0,1fr))_54px] items-center gap-2 rounded-lg bg-[#f2f6fc] px-3 py-2 text-[11px] font-bold text-[#273b61]">
                      <span>Equipo</span>
                      {areas.map((a) => (
                        <span key={a} className="text-center">
                          {a}
                        </span>
                      ))}
                      <span className="text-center">Total</span>
                    </div>
                    {teams.map((team) => (
                      <div
                        key={team.name}
                        className="grid grid-cols-[220px_repeat(5,minmax(0,1fr))_54px] items-center gap-2 px-3 py-1"
                      >
                        <div className="flex items-center gap-2 text-[12px] font-bold">
                          <UsersRound size={18} className="text-slate-600" />
                          {team.name} <span className="font-medium text-slate-500">({team.people})</span>
                        </div>
                        {team.values.map((v, i) => (
                          <HeatCell key={i} value={v} tone={team.tone} />
                        ))}
                        <span className="text-center text-sm font-extrabold text-[#111d39]">{team.total}</span>
                      </div>
                    ))}
                    <div className="mt-1 grid grid-cols-[220px_repeat(5,minmax(0,1fr))_54px] items-center gap-2 rounded-lg bg-[#edf3fc] px-3 py-2 text-[11px] font-extrabold text-[#273b61]">
                      <span className="pl-8">Total por subproceso</span>
                      {[24, 22, 21, 15, 15].map((v, i) => (
                        <span key={i} className="text-center">
                          {v}
                        </span>
                      ))}
                      <span className="text-center">97</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado general de tareas */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_rgba(30,64,120,0.06)]">
                <h2 className="mb-4 text-sm font-extrabold text-[#111d39]">Estado general de tareas</h2>
                <div className="flex flex-wrap items-center justify-center gap-5 xl:justify-around">
                  <Donut />
                  <div className="min-w-[170px] flex-1 space-y-3">
                    {states.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                          <i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </span>
                        <b className="tabular-nums text-[#111d39]">
                          {s.value} <span className="ml-1 font-medium text-slate-500">({Math.round((s.value / 97) * 100)}%)</span>
                        </b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,2.25fr)_minmax(280px,0.85fr)]">
              {/* Tablero Kanban Mini */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_4px_16px_rgba(30,64,120,0.06)] md:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-[#111d39]">
                    Tablero Kanban <span className="text-sm font-medium text-slate-500">(Ejecución del trabajo)</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-500">Columnas por prioridad</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  {priorities.map((p) => {
                    const meta = priorityMeta[p];
                    const Icon = meta.icon;
                    return (
                      <div key={p} className="min-w-0 overflow-hidden rounded-xl bg-slate-50/80">
                        <div className={`flex items-center justify-between rounded-t-xl px-3 py-3 ${meta.header} ${meta.text}`}>
                          <div className="flex items-center gap-2 text-sm font-extrabold">
                            <Icon size={18} />
                            {p}
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${meta.count}`}>
                            {priorityTotals[p]}
                          </span>
                        </div>
                        <div className="space-y-2 p-2">
                          {grouped[p].map((task) => (
                            <TaskCard key={task.id} task={task} onSelect={() => onSelectItem?.(items?.[0] as any)} />
                          ))}
                          {grouped[p].length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-[11px] text-slate-400">
                              No hay tareas visibles
                            </div>
                          )}
                          <button
                            onClick={() => onOpenAsignar?.({ role: p })}
                            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 bg-white/70 py-2.5 text-[11px] font-bold text-blue-600 transition hover:bg-blue-50"
                          >
                            <Plus size={14} />
                            Agregar tarea
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Próximos vencimientos */}
              <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_rgba(30,64,120,0.06)]">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#111d39]">
                    <CalendarDays size={17} />
                    Próximos vencimientos
                  </h2>
                  <button
                    onClick={onViewLista}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Ver todos <ArrowUpRight size={13} />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { day: "13", title: "Validar documentación recibida", owner: "A Macroregional", priority: "Urgente" },
                    { day: "14", title: "Elaborar y validar el plan", owner: "A Gestor", priority: "Alta" },
                    { day: "18", title: "Registro de recepción de materiales", owner: "A Gestor", priority: "Alta" },
                  ].map((item) => (
                    <div key={item.day} className="flex gap-3 py-3 first:pt-1">
                      <div className="grid h-[54px] w-[48px] shrink-0 place-items-center rounded-xl bg-[#edf3ff]">
                        <b className="text-xl leading-none text-[#1769f5]">{item.day}</b>
                        <span className="text-[9px] font-bold text-slate-500">NOV</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              item.priority === "Urgente" ? "bg-red-500" : "bg-amber-400"
                            }`}
                          />
                          <b className="text-[11px] leading-snug text-[#111d39]">{item.title}</b>
                        </div>
                        <div className="mt-1 pl-4 text-[10px] text-slate-500">{item.owner}</div>
                        <div className="mt-1.5 flex justify-end">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.priority === "Urgente" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </section>
          </>
        )}

        {/* Vista 2: Kanban Completo */}
        {view === "kanban" && (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {priorities.map((p) => (
              <div key={p} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className={`flex items-center justify-between px-4 py-3 ${priorityMeta[p].header} ${priorityMeta[p].text}`}>
                  <b>{p}</b>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">{grouped[p].length}</span>
                </div>
                <div className="space-y-2 bg-slate-50 p-3">
                  {grouped[p].map((task) => (
                    <TaskCard key={task.id} task={task} onSelect={() => onSelectItem?.(items?.[0] as any)} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Vista 3: Lista */}
        {view === "lista" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-[#f2f6fc] text-[11px] font-bold text-slate-600">
                  <tr>
                    {["Tarea", "Subproceso", "Prioridad", "Estado", "Responsables", "Vencimiento"].map((h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((t) => (
                    <tr key={t.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-[#111d39]">{t.title}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {t.code} · {t.area}
                      </td>
                      <td className="px-4 py-3">{t.priority}</td>
                      <td className="px-4 py-3 text-slate-600">{t.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-2">
                          {t.assignees.map((a) => (
                            <Avatar key={a} initials={a} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#111d39]">{t.dueLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Vista 4: Por equipo */}
        {view === "equipo" && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {teams.map((team) => (
              <article key={team.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <UsersRound size={21} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111d39]">{team.name}</h3>
                    <p className="text-xs text-slate-500">{team.people} integrantes</p>
                  </div>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <span className="text-xs text-slate-500">Tareas asignadas</span>
                  <b className="text-3xl text-[#111d39]">{team.total}</b>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(team.total / 97) * 100}%` }} />
                </div>
                <div className="mt-4 space-y-2">
                  {areas.map((a, i) => (
                    <div key={a} className="flex justify-between text-xs">
                      <span className="text-slate-500">{a}</span>
                      <b className="text-[#111d39]">{team.values[i]}</b>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
          <span>Vista de demostración · Datos ilustrativos</span>
          <span>Qaway Gestor de Proyectos</span>
        </footer>
      </div>
    </div>
  );
}
