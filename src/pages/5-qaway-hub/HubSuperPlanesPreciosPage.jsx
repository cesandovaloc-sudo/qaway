import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Ellipsis,
  ExternalLink,
  Gem,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Tag,
  Users,
  X,
} from "lucide-react";

/**
 * Qaway Lab — Super Admin / Planes y Precios
 *
 * Componente autocontenido para acoplar al panel existente.
 * - React + Tailwind CSS
 * - No depende de datos externos.
 * - Los datos iniciales reproducen la referencia visual entregada.
 * - Las acciones de edición/creación abren modales locales para poder
 *   conectar después con Supabase sin rehacer la UI.
 */

const plansSeed = [
  {
    id: "basico",
    name: "Básico",
    subtitle: "Ideal para negocios que inician",
    price: "49",
    billing: "/ mes",
    tone: "neutral",
    icon: Users,
    features: [
      "1 aplicación",
      "Hasta 3 usuarios",
      "5 GB de almacenamiento",
      "Soporte por email",
    ],
    companies: 2,
  },
  {
    id: "intermedio",
    name: "Intermedio",
    subtitle: "Para negocios en crecimiento",
    price: "99",
    billing: "/ mes",
    tone: "blue",
    icon: Building2,
    features: [
      "Hasta 3 aplicaciones",
      "Hasta 10 usuarios",
      "50 GB de almacenamiento",
      "Soporte prioritario",
      "Reportes básicos",
    ],
    companies: 3,
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Para negocios consolidados",
    price: "199",
    billing: "/ mes",
    tone: "orange",
    icon: Crown,
    popular: true,
    features: [
      "Aplicaciones ilimitadas",
      "Hasta 25 usuarios",
      "200 GB de almacenamiento",
      "Soporte prioritario",
      "Reportes avanzados",
      "Integraciones",
    ],
    companies: 5,
  },
  {
    id: "empresarial",
    name: "Empresarial",
    subtitle: "Solución a medida",
    price: "A medida",
    billing: "",
    tone: "purple",
    icon: Gem,
    features: [
      "Todo lo de Premium",
      "Usuarios ilimitados",
      "Almacenamiento ilimitado",
      "Soporte dedicado",
      "SLAs personalizados",
      "Desarrollos a medida",
    ],
    companies: 2,
  },
];

const activitySeed = [
  ["Nuevo plan creado", "Plan Empresarial", "hace 2 horas", "blue"],
  ["Precio actualizado", "Plan Premium", "hace 1 día", "orange"],
  ["Característica modificada", "Plan Intermedio", "hace 2 días", "purple"],
  ["Plan activado", "Plan Básico", "hace 3 días", "cyan"],
  ["Plan desactivado", "Plan antiguo", "hace 5 días", "red"],
];

const toneMap = {
  neutral: {
    icon: "bg-zinc-100 text-zinc-600",
    card: "bg-white",
    price: "text-zinc-950",
    check: "text-zinc-500",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    card: "bg-blue-50/45",
    price: "text-zinc-950",
    check: "text-zinc-600",
  },
  orange: {
    icon: "bg-orange-50 text-[#ff4b0b]",
    card: "bg-orange-50/65",
    price: "text-zinc-950",
    check: "text-zinc-700",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    card: "bg-purple-50/45",
    price: "text-zinc-950",
    check: "text-purple-700",
  },
};

function IconBox({ children, className = "" }) {
  return (
    <div
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${className}`}
    >
      {children}
    </div>
  );
}

function KpiCard({ icon: Icon, iconClass, label, value, delta, trend = "up", chart = "orange" }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <IconBox className={iconClass}>
            <Icon size={16} strokeWidth={2.2} />
          </IconBox>
          <span className="truncate text-xs font-bold text-zinc-600">{label}</span>
        </div>
        <MiniSparkline variant={chart} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-[27px] font-extrabold tracking-tight text-zinc-950">{value}</span>
        <span
          className={`mb-1 inline-flex items-center text-xs font-bold ${
            trend === "down" ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {trend === "down" ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
          {delta}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-zinc-500">vs. mes anterior</p>
    </div>
  );
}

function MiniSparkline({ variant = "orange" }) {
  const paths = {
    orange: "M2 18 C10 18, 16 17, 23 15 S36 10, 44 8 S55 7, 62 5",
    green: "M2 19 C10 18, 17 17, 24 13 S37 11, 44 8 S54 7, 62 7",
    blue: "M2 18 C11 18, 18 16, 25 14 S39 13, 47 8 S55 8, 62 5",
    purple: "M2 6 C12 5, 18 8, 26 11 S40 15, 47 17 S56 16, 62 16",
  };
  const stroke = {
    orange: "#ff4b0b",
    green: "#16b981",
    blue: "#3b82f6",
    purple: "#a855f7",
  }[variant];

  return (
    <svg width="66" height="26" viewBox="0 0 66 26" className="shrink-0 overflow-visible">
      <path
        d={paths[variant]}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlanCard({ plan, onEdit }) {
  const ToneIcon = plan.icon;
  const tone = toneMap[plan.tone];

  return (
    <div
      className={`relative flex min-h-[266px] flex-col rounded-2xl border border-zinc-200 p-4 ${tone.card}`}
    >
      {plan.popular && (
        <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl bg-[#ff4b0b] px-3 py-1.5 text-[10px] font-bold text-white">
          Más popular
        </div>
      )}

      <div className="flex items-start gap-3">
        <IconBox className={tone.icon}>
          <ToneIcon size={17} strokeWidth={2.1} />
        </IconBox>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-zinc-900">{plan.name}</h3>
          <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">{plan.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className={`text-[26px] font-extrabold tracking-tight ${tone.price}`}>
          {plan.price === "A medida" ? plan.price : `S/ ${plan.price}`}
        </span>
        {plan.billing && <span className="text-[11px] text-zinc-500">{plan.billing}</span>}
      </div>

      <ul className="mt-3 flex-1 space-y-1.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[11px] leading-4 text-zinc-600">
            <Check size={13} className={`mt-0.5 shrink-0 ${tone.check}`} strokeWidth={2.4} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className={`flex-1 rounded-lg border px-3 py-2 text-[11px] font-bold transition ${
            plan.popular
              ? "border-[#ff4b0b] bg-[#ff4b0b] text-white hover:bg-[#e03f06]"
              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
          }`}
        >
          Editar
        </button>
        <button
          type="button"
          className="grid w-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
          aria-label={`Más acciones para ${plan.name}`}
        >
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}

function DistributionCard({ plans }) {
  const total = plans.reduce((sum, plan) => sum + plan.companies, 0);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = plans.map((plan) => {
    const length = (plan.companies / total) * circumference;
    const segment = {
      ...plan,
      length,
      offset,
    };
    offset += length;
    return segment;
  });

  const colors = {
    premium: "#ff4b0b",
    intermedio: "#3b82f6",
    basico: "#eab308",
    empresarial: "#a855f7",
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <h2 className="text-lg font-extrabold text-zinc-950">Distribución de empresas por plan</h2>

      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-[130px] w-[130px] shrink-0">
          <svg viewBox="0 0 130 130" className="h-full w-full -rotate-90">
            <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
            {segments.map((segment) => (
              <circle
                key={segment.id}
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={colors[segment.id]}
                strokeWidth="16"
                strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                strokeDashoffset={-segment.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[9px] font-bold text-zinc-500">Total</div>
              <div className="text-xl font-extrabold text-zinc-900">{total}</div>
              <div className="text-[9px] text-zinc-500">empresas</div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[plan.id] }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold text-zinc-700">
                {plan.name}
              </span>
              <span className="text-zinc-500">
                {plan.companies} ({Math.round((plan.companies / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActivityCard() {
  const iconMap = {
    blue: { Icon: Users, cls: "bg-blue-50 text-blue-500" },
    orange: { Icon: CircleDollarSign, cls: "bg-orange-50 text-orange-500" },
    purple: { Icon: Tag, cls: "bg-purple-50 text-purple-500" },
    cyan: { Icon: Settings2, cls: "bg-cyan-50 text-cyan-500" },
    red: { Icon: X, cls: "bg-red-50 text-red-500" },
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-zinc-950">Actividad reciente</h2>
        <button className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900">
          Ver todas <ArrowUpRight className="ml-0.5 inline" size={12} />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {activitySeed.map(([title, detail, time, color]) => {
          const { Icon, cls } = iconMap[color];
          return (
            <div key={`${title}-${detail}`} className="flex items-start gap-2.5">
              <IconBox className={cls}>
                <Icon size={14} strokeWidth={2} />
              </IconBox>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-zinc-800">{title}</p>
                <p className="truncate text-[10px] text-zinc-500">{detail}</p>
              </div>
              <span className="shrink-0 text-[10px] text-zinc-400">{time}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TipCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex gap-3">
        <IconBox className="bg-amber-50 text-amber-500">
          <Lightbulb size={15} />
        </IconBox>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-zinc-800">Tip</p>
            <button className="text-zinc-400 hover:text-zinc-700" aria-label="Cerrar tip">
              <X size={13} />
            </button>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-zinc-500">
            Los planes pueden personalizarse por aplicación. Define qué apps incluye cada plan según tu estrategia comercial.
          </p>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ plans }) {
  const rows = [
    ["Aplicaciones incluidas", ["1", "3", "Ilimitadas", "Ilimitadas"]],
    ["Usuarios máximos", ["3", "10", "25", "Ilimitados"]],
    ["Almacenamiento", ["5 GB", "50 GB", "200 GB", "Ilimitado"]],
    ["Soporte", ["Email", "Prioritario", "Prioritario", "Dedicado"]],
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div>
        <h2 className="text-lg font-extrabold text-zinc-950">Comparativa de características</h2>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          Vista rápida de las principales características por plan.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[11px]">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500">
              <th className="px-2 py-2 text-left font-bold">Característica</th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-2 py-2 text-center font-bold">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, values]) => (
              <tr key={label} className="border-b border-zinc-100 last:border-0">
                <td className="px-2 py-2 font-bold text-zinc-700">{label}</td>
                {values.map((value, index) => (
                  <td key={`${label}-${index}`} className="px-2 py-2 text-center text-zinc-500">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlanModal({ plan, onClose, onSave }) {
  const isNew = !plan;
  const [form, setForm] = useState(
    plan
      ? { ...plan, features: [...plan.features] }
      : {
          id: `plan-${Date.now()}`,
          name: "",
          subtitle: "",
          price: "",
          billing: "/ mes",
          tone: "neutral",
          icon: Users,
          features: ["", "", ""],
          companies: 0,
        }
  );

  const updateFeature = (index, value) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const save = () => {
    const clean = {
      ...form,
      name: form.name.trim() || "Nuevo plan",
      subtitle: form.subtitle.trim(),
      price: form.price.trim() || "0",
      features: form.features.map((x) => x.trim()).filter(Boolean),
    };
    onSave(clean);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#ff4b0b]">
              Planes y precios
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-zinc-950">
              {isNew ? "Nuevo plan" : `Editar ${plan.name}`}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Ej. Premium"
              />
            </Field>
            <Field label="Precio mensual">
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
                placeholder="199"
              />
            </Field>
          </div>

          <Field label="Descripción">
            <input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="input"
              placeholder="Para negocios consolidados"
            />
          </Field>

          <Field label="Características">
            <div className="space-y-2">
              {form.features.map((feature, index) => (
                <input
                  key={index}
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="input"
                  placeholder={`Característica ${index + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-xs font-bold text-[#ff4b0b]"
              >
                + Añadir característica
              </button>
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function PlanesPreciosPage() {
  const [plans, setPlans] = useState(plansSeed);
  const [modalPlan, setModalPlan] = useState(null);
  const [showPublic, setShowPublic] = useState(false);
  // Paginación real (hallazgo P1 #4 de la auditoría: los controles se veían vivos pero no
  // tenían estado — de hecho el estado faltaba y reventaba en render). Corte por página
  // sobre la grilla; `page` acota para que borrar planes nunca deje la página fuera de rango.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(plans.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const paginatedPlans = useMemo(
    () => plans.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [plans, page]
  );

  const totalCompanies = useMemo(
    () => plans.reduce((sum, plan) => sum + plan.companies, 0),
    [plans]
  );

  const handleSave = (updatedPlan) => {
    setPlans((current) => {
      const exists = current.some((plan) => plan.id === updatedPlan.id);
      return exists
        ? current.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
        : [...current, updatedPlan];
    });
    setModalPlan(null);
  };

  return (
    <div className="min-h-full bg-transparent font-sans text-zinc-950">
      <style>{`
        .shadow-xs {
          box-shadow: 0 1px 2px rgba(0,0,0,.03), 0 2px 8px rgba(0,0,0,.025);
        }
        .input {
          width: 100%;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          background: #fff;
          padding: 10px 12px;
          font-size: 12px;
          outline: none;
        }
        .input:focus {
          border-color: #ff4b0b;
          box-shadow: 0 0 0 3px rgba(255,75,11,.08);
        }
      `}</style>

      {/* Contenido del módulo. El shell/sidebar existente de tu panel puede envolver este componente. */}
      <main>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-400">
              <span>Inicio</span>
              <ChevronRight size={12} />
              <span className="font-semibold text-zinc-600">Planes y Precios</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
              Planes y Precios
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Gestiona los planes, precios y características del ecosistema Qaway Lab. Configura qué aplicaciones incluye cada plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPublic(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50"
            >
              Ver página pública
              <ExternalLink size={13} />
            </button>
            <button
              type="button"
              onClick={() => setModalPlan(null)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e03f06]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Nuevo plan
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Users}
            iconClass="bg-blue-50 text-blue-500"
            label="Total de planes"
            value="4"
            delta="0%"
            chart="orange"
          />
          <KpiCard
            icon={Building2}
            iconClass="bg-emerald-50 text-emerald-500"
            label="Empresas en plan de pago"
            value="8"
            delta="33%"
            chart="green"
          />
          <KpiCard
            icon={CircleDollarSign}
            iconClass="bg-blue-50 text-blue-500"
            label="Ingresos MRR estimado"
            value="S/ 2,900"
            delta="15%"
            chart="blue"
          />
          <KpiCard
            icon={BarChart3}
            iconClass="bg-purple-50 text-purple-500"
            label="Tasa de conversión"
            value="67%"
            delta="12%"
            chart="purple"
          />
        </div>

        {/* Principal */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,0.72fr)]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-950">Planes disponibles</h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Administra los planes del ecosistema. Puedes activar, editar o desactivar planes.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {paginatedPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onEdit={setModalPlan} />
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <DistributionCard plans={plans} />
            <ActivityCard />
            <TipCard />
          </div>
        </div>

        <div className="mt-4">
          <ComparisonTable plans={plans} />
        </div>

        <div className="mt-4 flex items-center justify-between px-1 text-[11px] text-zinc-500">
          <span>Mostrando {plans.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, plans.length)} de {plans.length} planes</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-400 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-xs font-bold text-[#ff4b0b]">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setCurrentPage(page + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-400 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {modalPlan !== null && (
        <PlanModal
          plan={modalPlan}
          onClose={() => setModalPlan(null)}
          onSave={handleSave}
        />
      )}

      {showPublic && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#ff4b0b]">
                  Página pública
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-zinc-950">Planes y precios</h3>
              </div>
              <button onClick={() => setShowPublic(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100">
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Este botón queda preparado para enlazar con la página pública de precios de Qaway Lab.
            </p>
            <button
              onClick={() => setShowPublic(false)}
              className="mt-5 w-full rounded-xl bg-zinc-950 px-4 py-3 text-xs font-bold text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
