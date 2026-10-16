/* ============================================================================
 * CriteriosApp — Refactorización Nivelada 1:1 a Captura de Referencia v4.0
 * Arquitectura 3 columnas: Sidebar (248px) / Workspace / Inspector (380px)
 * Portabilidad Cloudflare: solo imports relativos ./ ../ + lucide-react. Cero iframes.
 * Namespace host-safe: .qaway-criterios-root (sin estilos globales)
 * Ergonomía: textos >= 14.5px, espaciados equilibrados y candado visual.
 * ============================================================================ */
import React, { useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  Send,
  Scale,
  FileSpreadsheet,
  FileText,
  Building2,
  History,
  Layers,
  Settings,
  Code2,
  X,
  Bookmark,
  Share2,
  MoreHorizontal,
  Check,
  BarChart3,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { HubIcon } from "./components/ui/HubIcon";

type MarcaId = "corporativo" | "legal" | "finanzas";
type InspectorTab = 1 | 2 | 3;

interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BarChart3;
  iconBg: string;
  iconColor: string;
  query: string;
}

const SCENARIO_CARDS: ScenarioDef[] = [
  {
    id: "auditoria",
    title: "Auditoría Legal + Excel EBITDA",
    subtitle: "Híbrido (Ley + XLSX)",
    icon: BarChart3,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    query: "¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?",
  },
  {
    id: "normativa",
    title: "Consulta normativa específica",
    subtitle: "Solo Leyes",
    icon: Scale,
    iconBg: "#FEF2F2",
    iconColor: "#DC2626",
    query: "¿Cuáles son los límites de jornada laboral y sobretiempo según el D.S. N.º 007-2002-TR?",
  },
  {
    id: "financiero",
    title: "Análisis financiero",
    subtitle: "Solo Excel",
    icon: FileSpreadsheet,
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    query: "¿Cuál es el cálculo de provisión y el margen EBITDA ajustado en el Modelo Financiero Q3 2026.xlsx?",
  },
  {
    id: "procedimiento",
    title: "Procedimiento interno",
    subtitle: "Solo Documentos",
    icon: FileText,
    iconBg: "#EFF6FF",
    iconColor: "#475569",
    query: "¿Qué establece el Manual de Políticas Laborales sección 4.2 sobre el control de asistencia?",
  },
];

const EXCEL_GRID_ROWS: Array<{ n: number; label: string; value: string }> = [
  { n: 10, label: "", value: "" },
  { n: 11, label: "Ingresos", value: "1,250,000" },
  { n: 11, label: "Costos operativos", value: "680,000" },
  { n: 12, label: "EBITDA", value: "2,150,000" },
  { n: 13, label: "Provisión laboral", value: "48,500" },
  { n: 14, label: "EBITDA ajustado", value: "2,101,500" },
  { n: 15, label: "Margen EBITDA", value: "16.1%" },
  { n: 17, label: "", value: "" },
];

export default function CriteriosApp() {
  const [marca, setMarca] = useState<MarcaId>("corporativo");
  const [activeScenario, setActiveScenario] = useState<string>("auditoria");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>(2);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(
    "¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?"
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>("nuevo");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleMarca(id: MarcaId) {
    setMarca(id);
  }

  function handleScenario(id: string) {
    setActiveScenario(id);
    const found = SCENARIO_CARDS.find((s) => s.id === id);
    if (found) {
      setQuery(found.query);
      if (id === "normativa") setInspectorTab(1);
      else if (id === "financiero") setInspectorTab(2);
      else if (id === "procedimiento") setInspectorTab(3);
      else setInspectorTab(2);
      setInspectorOpen(true);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      showToastMessage("Búsqueda completada en 134 ms");
    }, 250);
  }

  function showToastMessage(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleShare() {
    const textToCopy = `${query}\n\nEl trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes [1]. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp [2].`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(textToCopy);
      showToastMessage("Respuesta copiada al portapapeles");
    } else {
      showToastMessage("Enlace generado y copiado");
    }
  }

  function handleExcelExport() {
    try {
      let csv = "Fila,Concepto,Valor\n";
      for (const r of EXCEL_GRID_ROWS) {
        if (r.label || r.value) {
          csv += `${r.n},"${r.label}","${r.value}"\n`;
        }
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Modelo_Financiero_Q3_2026.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToastMessage("Matriz Excel descargada (CSV)");
    } catch {
      showToastMessage("No se pudo exportar la matriz");
    }
  }

  function openInspector(tab: InspectorTab) {
    setInspectorTab(tab);
    setInspectorOpen(true);
  }

  return (
    <div className="qaway-criterios-root">
      <div
        style={{ backgroundColor: "#FFFFFF", color: "#111827" }}
        className="h-screen w-full overflow-hidden flex flex-col font-sans antialiased"
      >
        {/* Toast Notificación */}
        {toast && (
          <div
            style={{ zIndex: 100 }}
            className="fixed top-4 right-4 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-zinc-700 transition-all"
          >
            <HubIcon icon={Check} size={16} className="text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* ===== COLUMNA 1: SIDEBAR IZQUIERDO ===== */}
          <aside
            style={{ backgroundColor: "#FAFAFA", borderColor: "#E5E7EB" }}
            className="hidden lg:flex w-[248px] shrink-0 border-r flex-col overflow-y-auto"
          >
            {/* Logo */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
              <span
                style={{ borderColor: "#E5E7EB" }}
                className="w-7 h-7 rounded-md border bg-white flex items-center justify-center shadow-xs"
              >
                <HubIcon icon={Layers} size={18} className="text-slate-800" />
              </span>
              <span style={{ fontSize: 17 }} className="font-bold tracking-tight text-zinc-900">
                RAG Hub
              </span>
              <span
                style={{
                  backgroundColor: "#EFF6FF",
                  color: "#2563EB",
                  fontSize: 12,
                }}
                className="px-1.5 py-0.5 rounded font-mono font-semibold"
              >
                v4.0
              </span>
            </div>

            {/* Sección: Proyecto / Marca */}
            <div className="px-3 mt-2">
              <p
                style={{ color: "#4B5563", fontSize: 13 }}
                className="px-1 pb-2 font-semibold uppercase tracking-wider"
              >
                Proyecto / Marca
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleMarca("corporativo")}
                  style={{
                    backgroundColor: marca === "corporativo" ? "#EFF6FF" : "transparent",
                    borderLeft: marca === "corporativo" ? "3px solid #2563EB" : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <HubIcon icon={Building2} size={18} className="text-sky-600" />
                  <span>
                    <span style={{ fontSize: 14.5 }} className="block font-semibold leading-tight text-zinc-900">
                      Corporativo
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      Documentos internos
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarca("legal")}
                  style={{
                    backgroundColor: marca === "legal" ? "#FEF2F2" : "transparent",
                    borderLeft: marca === "legal" ? "3px solid #DC2626" : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <HubIcon icon={Scale} size={18} className="text-red-600" />
                  <span>
                    <span style={{ fontSize: 14.5 }} className="block font-semibold leading-tight text-zinc-900">
                      Legal / Leyes
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      Normativa y artículos
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarca("finanzas")}
                  style={{
                    backgroundColor: marca === "finanzas" ? "#ECFDF5" : "transparent",
                    borderLeft: marca === "finanzas" ? "3px solid #059669" : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <HubIcon icon={FileSpreadsheet} size={18} className="text-emerald-600" />
                  <span>
                    <span style={{ fontSize: 14.5 }} className="block font-semibold leading-tight text-zinc-900">
                      Finanzas / Excel
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      Reportes y modelos
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Sección: Navegación */}
            <div className="px-3 mt-5">
              <p
                style={{ color: "#4B5563", fontSize: 13 }}
                className="px-1 pb-2 font-semibold uppercase tracking-wider"
              >
                Navegación
              </p>
              <nav className="space-y-0.5">
                {[
                  { id: "nuevo", label: "Nuevo análisis", icon: Search },
                  { id: "historial", label: "Historial", icon: History },
                  { id: "colecciones", label: "Colecciones", icon: Layers },
                  { id: "config", label: "Configuración", icon: Settings },
                ].map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      style={{
                        backgroundColor: isActive ? "#EFF6FF" : "transparent",
                        borderLeft: isActive ? "3px solid #2563EB" : "3px solid transparent",
                        color: isActive ? "#1D4ED8" : "#374151",
                        fontSize: 14.5,
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isActive ? "rounded-r-md font-semibold" : "hover:bg-zinc-100 rounded-md"
                      }`}
                    >
                      <HubIcon icon={item.icon} size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex-1" />

            {/* Sección: Colecciones activas */}
            <div className="p-3">
              <div
                style={{ borderColor: "#E5E7EB" }}
                className="bg-white border rounded-lg p-3 space-y-2.5 shadow-xs"
              >
                <p style={{ fontSize: 14 }} className="font-semibold text-zinc-900">
                  Colecciones activas
                </p>
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                  <div>
                    <span style={{ fontSize: 14 }} className="block font-semibold leading-tight text-zinc-900">
                      Documentos
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      124 docs • 12,480 vectores
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <div>
                    <span style={{ fontSize: 14 }} className="block font-semibold leading-tight text-zinc-900">
                      Leyes
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      86 docs • 8,320 vectores
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span style={{ fontSize: 14 }} className="block font-semibold leading-tight text-zinc-900">
                      Excel
                    </span>
                    <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                      42 archivos • 6,120 vectores
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ===== COLUMNA 2: PANEL CENTRAL - WORKSPACE ===== */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
            {/* Header superior */}
            <div
              style={{ borderColor: "#E5E7EB" }}
              className="px-6 py-3 flex items-center justify-between gap-3 border-b bg-white sticky top-0 z-10"
            >
              <span
                style={{
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  fontSize: 13.5,
                }}
                className="inline-flex items-center px-3 py-1 rounded-full border bg-white"
              >
                Asistente multi-fuente (Ley + Excel + Documentos)
              </span>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  style={{ borderColor: "#E5E7EB", fontSize: 14 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-white font-medium hover:bg-zinc-50 cursor-pointer shadow-xs"
                >
                  <HubIcon icon={Code2} size={15} />
                  <span>&lt;/&gt; Ver SQL &amp; Edge Function</span>
                </button>
                <div className="relative flex items-center gap-1.5">
                  <span className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold text-sm">
                    C
                  </span>
                  <span style={{ fontSize: 14.5 }} className="font-medium text-zinc-800">
                    Carlos
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="p-1 rounded hover:bg-zinc-100 cursor-pointer text-zinc-500"
                    aria-label="Menú usuario"
                  >
                    <HubIcon icon={ChevronDown} size={15} />
                  </button>
                  {showUserMenu && (
                    <div
                      style={{ borderColor: "#E5E7EB", fontSize: 14 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-white shadow-lg py-1 z-20"
                    >
                      {["Mi perfil", "Mis análisis", "Cerrar sesión"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            showToastMessage(`${opt} seleccionado`);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-100 cursor-pointer text-zinc-800"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 max-w-[880px] w-full mx-auto space-y-4 flex-1">
              {/* Título y subtítulo */}
              <div>
                <h1 style={{ fontSize: 25 }} className="font-bold tracking-tight text-zinc-900">
                  Asistente de conocimiento
                </h1>
                <p style={{ color: "#4B5563", fontSize: 14.5 }} className="mt-1">
                  Consulta información de leyes, archivos Excel y documentos corporativos en una sola búsqueda.
                </p>
              </div>

              {/* 4 Tarjetas de escenarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {SCENARIO_CARDS.map((c) => {
                  const isActive = activeScenario === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleScenario(c.id)}
                      style={{
                        borderColor: isActive ? "#2563EB" : "#E5E7EB",
                        borderWidth: isActive ? 1.5 : 1,
                        backgroundColor: isActive ? "#FFFFFF" : "#FFFFFF",
                        boxShadow: isActive ? "0 0 0 1px #2563EB" : "none",
                      }}
                      className="text-left p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer hover:border-zinc-300 transition-all"
                    >
                      <span
                        style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      >
                        <HubIcon icon={c.icon} size={17} />
                      </span>
                      <span className="min-w-0">
                        <span style={{ fontSize: 14.5 }} className="block font-semibold leading-tight text-zinc-900">
                          {c.title}
                        </span>
                        <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight mt-0.5">
                          {c.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Barra de búsqueda */}
              <form onSubmit={handleSubmit}>
                <div
                  style={{ borderColor: "#CBD5E1" }}
                  className="rounded-xl border bg-white shadow-xs flex items-center gap-2 pl-4 pr-2 py-2"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ fontSize: 15 }}
                    className="flex-1 bg-transparent focus:outline-none min-w-0 text-zinc-800"
                    placeholder="Escribe tu consulta..."
                    aria-label="Consulta"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: "#2563EB" }}
                    className="w-9 h-9 rounded-lg text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer shrink-0 transition-colors"
                    aria-label="Enviar"
                  >
                    <HubIcon icon={isSearching ? Search : Send} size={16} />
                  </button>
                </div>
              </form>

              {/* Card de Respuesta generada */}
              <article
                style={{ borderColor: "#E5E7EB" }}
                className="rounded-xl border bg-white p-5 space-y-4 shadow-xs"
              >
                {/* Header de la respuesta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <HubIcon icon={Check} size={15} />
                    </span>
                    <div>
                      <span style={{ fontSize: 15 }} className="block font-semibold text-zinc-900">
                        Respuesta generada (134 ms)
                      </span>
                      <span style={{ color: "#6B7280", fontSize: 13 }} className="block">
                        Con base en 3 fuentes relevantes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSaved((v) => !v);
                        showToastMessage(!saved ? "Guardado en análisis" : "Retirado de guardados");
                      }}
                      style={{
                        borderColor: saved ? "#2563EB" : "#E5E7EB",
                        backgroundColor: saved ? "#EFF6FF" : "#FFFFFF",
                        color: saved ? "#1D4ED8" : "#374151",
                        fontSize: 13.5,
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium hover:bg-zinc-50 cursor-pointer shadow-xs"
                    >
                      <HubIcon icon={Bookmark} size={15} />
                      <span>{saved ? "Guardado" : "Guardar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      style={{ borderColor: "#E5E7EB", fontSize: 13.5, color: "#374151" }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-white font-medium hover:bg-zinc-50 cursor-pointer shadow-xs"
                    >
                      <HubIcon icon={Share2} size={15} />
                      <span>Compartir</span>
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMoreMenu((v) => !v)}
                        style={{ borderColor: "#E5E7EB" }}
                        className="p-1.5 rounded-md border bg-white text-zinc-600 hover:bg-zinc-50 cursor-pointer shadow-xs"
                        aria-label="Más opciones"
                      >
                        <HubIcon icon={MoreHorizontal} size={16} />
                      </button>
                      {showMoreMenu && (
                        <div
                          style={{ borderColor: "#E5E7EB", fontSize: 13.5 }}
                          className="absolute right-0 top-full mt-2 w-44 rounded-md border bg-white shadow-lg py-1 z-20"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              handleShare();
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-100 cursor-pointer text-zinc-800"
                          >
                            Copiar texto
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              handleExcelExport();
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-100 cursor-pointer text-zinc-800"
                          >
                            Exportar CSV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Texto explicativo con citas interactivas */}
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#1F2937" }}>
                  El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes{" "}
                  <button
                    type="button"
                    onClick={() => openInspector(1)}
                    style={{ backgroundColor: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                    className="inline-flex items-center justify-center px-1.5 py-0.2 rounded font-semibold text-xs border cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    1
                  </button>
                  {" "}. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp{" "}
                  <button
                    type="button"
                    onClick={() => openInspector(2)}
                    style={{ backgroundColor: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}
                    className="inline-flex items-center justify-center px-1.5 py-0.2 rounded font-semibold text-xs border cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    2
                  </button>
                  {" "}.
                </p>

                {/* Tabla: Comparativo de impacto financiero */}
                <div>
                  <h2 style={{ fontSize: 14.5 }} className="font-bold text-zinc-900 mb-2">
                    Comparativo de impacto financiero
                  </h2>
                  <div
                    style={{ borderColor: "#E5E7EB" }}
                    className="overflow-x-auto rounded-lg border shadow-xs"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          style={{ backgroundColor: "#F8FAFC", color: "#374151" }}
                          className="border-b"
                        >
                          <th style={{ fontSize: 14 }} className="py-2 px-3.5 font-semibold text-left">
                            Concepto
                          </th>
                          <th style={{ fontSize: 14 }} className="py-2 px-3.5 font-semibold text-center">
                            Sin provisión
                          </th>
                          <th style={{ fontSize: 14 }} className="py-2 px-3.5 font-semibold text-center">
                            Con provisión
                          </th>
                          <th style={{ fontSize: 14 }} className="py-2 px-3.5 font-semibold text-center">
                            Variación
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        <tr>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 font-medium text-zinc-900">
                            EBITDA (USD)
                          </td>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 text-center text-zinc-700">
                            2,150,000
                          </td>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 text-center text-zinc-700">
                            2,101,500
                          </td>
                          <td
                            style={{ backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: 14 }}
                            className="py-2 px-3.5 text-center font-semibold"
                          >
                            -48,500
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 font-medium text-zinc-900">
                            Margen EBITDA
                          </td>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 text-center text-zinc-700">
                            18.4%
                          </td>
                          <td style={{ fontSize: 14 }} className="py-2 px-3.5 text-center text-zinc-700">
                            16.1%
                          </td>
                          <td
                            style={{ backgroundColor: "#FEF2F2", color: "#DC2626", fontSize: 14 }}
                            className="py-2 px-3.5 text-center font-semibold"
                          >
                            -2.3 pp
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sección: Fuentes y referencias */}
                <div>
                  <h2 style={{ fontSize: 14.5 }} className="font-bold text-zinc-900 mb-2">
                    Fuentes y referencias
                  </h2>
                  <div className="space-y-2">
                    {/* Fuente 1: Ley */}
                    <button
                      type="button"
                      onClick={() => openInspector(1)}
                      style={{ borderColor: "#E5E7EB" }}
                      className="w-full text-left rounded-lg border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          1
                        </span>
                        <div>
                          <span style={{ color: "#2563EB", fontSize: 14.5 }} className="font-semibold block leading-tight">
                            D.S. N.º 007-2002-TR
                          </span>
                          <span style={{ color: "#4B5563", fontSize: 13 }} className="block leading-tight mt-0.5">
                            Artículo 9 - Jornada de trabajo
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block max-w-[340px] text-left">
                        <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.4 }} className="italic">
                          “El trabajo en sobretiempo es voluntario. La falta de registro en el sistema de control de asistencia invierte la carga de la prueba...”
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                          p. 12
                        </span>
                        <span style={{ color: "#9CA3AF", fontSize: 12 }} className="block leading-tight">
                          24/08/2002
                        </span>
                        <span style={{ color: "#2563EB", fontSize: 13 }} className="font-medium block mt-1 hover:underline">
                          Ver artículo →
                        </span>
                      </div>
                    </button>

                    {/* Fuente 2: Excel */}
                    <button
                      type="button"
                      onClick={() => openInspector(2)}
                      style={{ borderColor: "#E5E7EB" }}
                      className="w-full text-left rounded-lg border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          2
                        </span>
                        <div>
                          <span style={{ color: "#2563EB", fontSize: 14.5 }} className="font-semibold block leading-tight">
                            Modelo Financiero Q3 2026.xlsx
                          </span>
                          <span style={{ color: "#4B5563", fontSize: 13 }} className="block leading-tight mt-0.5">
                            Hoja: Proyecciones | Rango: D12:D18
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block max-w-[340px] text-left">
                        <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.4 }}>
                          Cálculo de provisión por contingencias laborales y su impacto en margen EBITDA del tercer trimestre.
                        </p>
                        <span
                          style={{ backgroundColor: "#F3F4F6", fontSize: 12.5 }}
                          className="inline-block font-mono px-2 py-0.5 rounded mt-1 text-zinc-700"
                        >
                          Fórmula D13 &nbsp;&nbsp;=SUMA(D12:D14)
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                          Celda D15
                        </span>
                        <span style={{ color: "#9CA3AF", fontSize: 12 }} className="block leading-tight">
                          Fórmula
                        </span>
                        <span style={{ color: "#2563EB", fontSize: 13 }} className="font-medium block mt-1 hover:underline">
                          Ver en Excel →
                        </span>
                      </div>
                    </button>

                    {/* Fuente 3: Documento */}
                    <button
                      type="button"
                      onClick={() => openInspector(3)}
                      style={{ borderColor: "#E5E7EB" }}
                      className="w-full text-left rounded-lg border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-slate-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          3
                        </span>
                        <div>
                          <span style={{ color: "#2563EB", fontSize: 14.5 }} className="font-semibold block leading-tight">
                            Manual de Políticas Laborales
                          </span>
                          <span style={{ color: "#4B5563", fontSize: 13 }} className="block leading-tight mt-0.5">
                            Sección 4.2 - Control de asistencia
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block max-w-[340px] text-left">
                        <p style={{ color: "#6B7280", fontSize: 13, lineHeight: 1.4 }}>
                          Procedimiento interno para el registro de horas extras y validación con el área de RR.HH.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span style={{ color: "#6B7280", fontSize: 13 }} className="block leading-tight">
                          p. 28
                        </span>
                        <span style={{ color: "#9CA3AF", fontSize: 12 }} className="block leading-tight">
                          v2.1 - 2026
                        </span>
                        <span style={{ color: "#2563EB", fontSize: 13 }} className="font-medium block mt-1 hover:underline">
                          Ver sección →
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </main>

          {/* ===== COLUMNA 3: INSPECTOR DE FUENTES ===== */}
          {inspectorOpen && (
            <aside
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
              className="hidden xl:flex w-[380px] shrink-0 border-l flex-col h-full overflow-y-auto"
            >
              {/* Header del inspector */}
              <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-zinc-100">
                <h2 style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                  Inspector de fuentes
                </h2>
                <button
                  type="button"
                  onClick={() => setInspectorOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 cursor-pointer text-zinc-500"
                  aria-label="Cerrar inspector"
                >
                  <HubIcon icon={X} size={17} />
                </button>
              </div>

              {/* 3 Tabs segmentados */}
              <div className="px-4 pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectorTab(1)}
                  style={{
                    backgroundColor: inspectorTab === 1 ? "#FFFFFF" : "transparent",
                    borderColor: inspectorTab === 1 ? "#DC2626" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-md px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
                >
                  <span className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span style={{ fontSize: 13.5 }} className="font-semibold text-zinc-900">
                    Ley
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab(2)}
                  style={{
                    backgroundColor: inspectorTab === 2 ? "#FFFFFF" : "transparent",
                    borderColor: inspectorTab === 2 ? "#059669" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-md px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
                >
                  <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span style={{ fontSize: 13.5 }} className="font-semibold text-zinc-900">
                    Excel
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab(3)}
                  style={{
                    backgroundColor: inspectorTab === 3 ? "#FFFFFF" : "transparent",
                    borderColor: inspectorTab === 3 ? "#64748B" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-md px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
                >
                  <span className="w-5 h-5 rounded bg-slate-500 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span style={{ fontSize: 13.5 }} className="font-semibold text-zinc-900">
                    Documento
                  </span>
                </button>
              </div>

              {/* Contenido de la pestaña activa */}
              <div className="p-4 space-y-4">
                {/* Pestaña 1: Ley */}
                {inspectorTab === 1 && (
                  <div className="space-y-3">
                    <div style={{ borderColor: "#E5E7EB" }} className="border rounded-lg p-3.5 shadow-xs">
                      <p style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                        D.S. N.° 007-2002-TR
                      </p>
                      <p style={{ color: "#6B7280", fontSize: 13 }} className="mt-0.5">
                        Artículo 9 - Jornada de trabajo · p. 12
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.6 }} className="mt-2 text-zinc-800">
                        “El trabajo en sobretiempo es voluntario. La falta de registro en el sistema de control de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes.”
                      </p>
                    </div>
                    <div style={{ borderColor: "#E5E7EB" }} className="border rounded-lg p-3 grid grid-cols-2 gap-2 text-sm shadow-xs">
                      <span style={{ color: "#6B7280" }}>Norma</span>
                      <span className="font-medium text-zinc-900">D.S. 007-2002-TR</span>
                      <span style={{ color: "#6B7280" }}>Página oficial</span>
                      <span className="font-medium text-zinc-900">Pág. 12</span>
                      <span style={{ color: "#6B7280" }}>Publicación</span>
                      <span className="font-medium text-zinc-900">24/08/2002</span>
                    </div>
                  </div>
                )}

                {/* Pestaña 2: Excel (Fiel a la captura) */}
                {inspectorTab === 2 && (
                  <div className="space-y-3.5">
                    {/* Header del archivo */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <HubIcon icon={FileSpreadsheet} size={18} />
                      </span>
                      <div>
                        <span style={{ fontSize: 14.5 }} className="block font-bold leading-tight text-zinc-900">
                          Modelo Financiero Q3 2026.xlsx
                        </span>
                        <span style={{ color: "#6B7280", fontSize: 13 }} className="block">
                          Hoja: Proyecciones
                        </span>
                      </div>
                    </div>

                    {/* Barra de fórmulas */}
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ borderColor: "#E5E7EB", fontSize: 13 }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border font-mono bg-white text-zinc-700"
                      >
                        D13 <span style={{ fontSize: 10 }}>▼</span>
                      </span>
                      <span style={{ color: "#6B7280", fontSize: 14 }} className="font-serif italic font-bold">
                        fx
                      </span>
                      <code
                        style={{ borderColor: "#E5E7EB", color: "#2563EB", fontSize: 13 }}
                        className="flex-1 border rounded px-2 py-1 font-mono truncate bg-white"
                      >
                        =SUMA(D12:D14)
                      </code>
                    </div>

                    {/* Grilla interactiva de Excel */}
                    <div
                      style={{ borderColor: "#E5E7EB" }}
                      className="overflow-x-auto rounded-lg border bg-white shadow-xs"
                    >
                      <table className="w-full border-collapse font-mono text-xs tabular-nums">
                        <thead>
                          <tr style={{ backgroundColor: "#F9FAFB" }} className="border-b">
                            <th style={{ borderColor: "#E5E7EB" }} className="py-1 px-2 border-r w-8 text-center text-zinc-400">
                              {" "}
                            </th>
                            {["A", "B", "C", "D", "E"].map((col) => (
                              <th
                                key={col}
                                style={{ borderColor: "#E5E7EB" }}
                                className="py-1 px-2 border-r last:border-r-0 font-semibold text-zinc-500 text-center"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {EXCEL_GRID_ROWS.map((r, idx) => {
                            const isHighlighted = r.n === 13 && r.label === "Provisión laboral";
                            return (
                              <tr
                                key={`${r.n}-${idx}`}
                                style={{
                                  borderColor: "#E5E7EB",
                                  backgroundColor: isHighlighted ? "#ECFDF5" : "#FFFFFF",
                                }}
                                className="border-b last:border-b-0"
                              >
                                <td
                                  style={{ borderColor: "#E5E7EB", color: "#9CA3AF" }}
                                  className="py-1 px-1.5 border-r text-center text-[11px]"
                                >
                                  {r.n}
                                </td>
                                <td
                                  style={{ borderColor: "#E5E7EB" }}
                                  className="py-1 px-2 border-r text-zinc-800"
                                  colSpan={2}
                                >
                                  {r.label}
                                </td>
                                <td
                                  style={{
                                    borderColor: isHighlighted ? "#059669" : "#E5E7EB",
                                    borderWidth: isHighlighted ? 1.5 : 1,
                                  }}
                                  className={`py-1 px-2 border-r text-right font-semibold ${
                                    isHighlighted ? "text-emerald-800 bg-emerald-50" : "text-zinc-800"
                                  }`}
                                >
                                  {r.value}
                                </td>
                                <td style={{ borderColor: "#E5E7EB" }} className="py-1 px-2 text-zinc-700">
                                  {" "}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Detalles de la celda */}
                    <div>
                      <h3 style={{ fontSize: 14 }} className="font-bold text-zinc-900 mb-1.5">
                        Detalles de la celda
                      </h3>
                      <div
                        style={{ borderColor: "#E5E7EB", fontSize: 13 }}
                        className="border rounded-lg divide-y bg-white shadow-xs"
                      >
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: "#6B7280" }}>Rango</span>
                          <span className="font-mono text-zinc-900">D12:D14</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: "#6B7280" }}>Celda activa</span>
                          <span className="font-mono text-zinc-900">D13</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2 items-center">
                          <span style={{ color: "#6B7280" }}>Fórmula</span>
                          <code style={{ backgroundColor: "#F3F4F6", fontSize: 12 }} className="px-1.5 py-0.5 rounded font-mono text-zinc-800">
                            =SUMA(D12:D14)
                          </code>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: "#6B7280" }}>Valor</span>
                          <span className="font-mono font-semibold text-zinc-900">48,500</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: "#6B7280" }}>Formato</span>
                          <span className="text-zinc-900">Número (USD)</span>
                        </div>
                      </div>
                    </div>

                    {/* Contexto de la fuente */}
                    <div>
                      <h3 style={{ fontSize: 14 }} className="font-bold text-zinc-900 mb-1.5">
                        Contexto de la fuente
                      </h3>
                      <p style={{ color: "#4B5563", fontSize: 13.5, lineHeight: 1.5 }} className="italic">
                        “Cálculo de provisión por contingencias laborales y su impacto en el margen EBITDA del tercer trimestre 2026.”
                      </p>
                    </div>

                    {/* Botón: Abrir en Excel completo */}
                    <button
                      type="button"
                      onClick={handleExcelExport}
                      style={{ borderColor: "#CBD5E1" }}
                      className="w-full py-2 px-3 rounded-lg border bg-white hover:bg-zinc-50 cursor-pointer text-sm font-medium flex items-center justify-center gap-2 text-zinc-800 shadow-xs transition-colors"
                    >
                      <HubIcon icon={ExternalLink} size={15} />
                      <span>Abrir en Excel completo</span>
                    </button>
                  </div>
                )}

                {/* Pestaña 3: Documento */}
                {inspectorTab === 3 && (
                  <div className="space-y-3">
                    <div style={{ borderColor: "#E5E7EB" }} className="border rounded-lg p-3.5 shadow-xs">
                      <p style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                        Manual de Políticas Laborales
                      </p>
                      <p style={{ color: "#6B7280", fontSize: 13 }} className="mt-0.5">
                        Sección 4.2 - Control de asistencia · p. 28
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.6 }} className="mt-2 text-zinc-800">
                        “Procedimiento interno para el registro de horas extras y validación con el área de RR.HH. Toda provisión contingente superior a USD 25,000 requiere dictamen vinculante del comité de auditoría antes del día 25 del mes.”
                      </p>
                    </div>
                    <div style={{ borderColor: "#E5E7EB" }} className="border rounded-lg p-3 grid grid-cols-2 gap-2 text-sm shadow-xs">
                      <span style={{ color: "#6B7280" }}>Documento</span>
                      <span className="font-medium text-zinc-900">Manual RR.HH.</span>
                      <span style={{ color: "#6B7280" }}>Página</span>
                      <span className="font-medium text-zinc-900">Pág. 28</span>
                      <span style={{ color: "#6B7280" }}>Versión</span>
                      <span className="font-medium text-zinc-900">v2.1 - 2026</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Modal SQL & Edge Function */}
        {showSqlModal && (
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }}
            className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              style={{ borderColor: "#E5E7EB" }}
              className="bg-white rounded-xl border max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2">
                  <HubIcon icon={Code2} size={18} className="text-blue-600" />
                  <span style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                    Arquitectura pgvector &amp; Supabase Edge Function
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1 rounded hover:bg-zinc-200 cursor-pointer text-zinc-500"
                >
                  <HubIcon icon={X} size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto font-mono text-xs space-y-3 bg-zinc-950 text-zinc-200">
                <p className="text-zinc-400 font-sans text-sm">-- 1. Función RPC de coincidencia semántica en Postgres:</p>
                <pre className="text-emerald-400 bg-zinc-900 p-3 rounded-lg overflow-x-auto">
{`CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_collection text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_title text,
  collection_id text,
  content text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    document_title,
    collection_id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM rag_chunks
  WHERE (filter_collection IS NULL OR collection_id = filter_collection)
    AND 1 - (embedding <=> query_embedding) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;`}
                </pre>
              </div>
              <div className="px-5 py-3 border-t bg-zinc-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  style={{ backgroundColor: "#2563EB" }}
                  className="px-4 py-1.5 rounded-lg text-white font-medium text-sm hover:bg-blue-700 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
