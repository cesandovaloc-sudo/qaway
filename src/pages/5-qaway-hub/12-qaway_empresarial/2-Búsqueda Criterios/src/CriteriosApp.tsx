/* ============================================================================
 * CriteriosApp — Nivelación total a captura de referencia v4.0
 * Arquitectura 3 columnas: Sidebar / Workspace / Inspector
 * Portabilidad Cloudflare: solo imports relativos ./ ../ + lucide-react. Cero iframes.
 * Namespace host-safe: .qaway-criterios-root (sin estilos globales)
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
  Database,
  ChevronDown,
} from "lucide-react";
import { HubIcon } from "./components/ui/HubIcon";
import type { RagThemeId } from "./types/criterios";
import { SCENARIOS, THEME_CONFIG } from "./data/scenarios";

type MarcaId = "corporativo" | "legal" | "finanzas";
type InspectorTab = 1 | 2 | 3;

const MARCA_THEME: Record<MarcaId, RagThemeId> = {
  corporativo: "rag-neutral",
  legal: "rag-legal",
  finanzas: "rag-finance",
};

const SCENARIO_CARDS = [
  {
    id: "auditoria",
    title: "Auditoría Legal + Excel EBITDA",
    subtitle: "Híbrido (Ley + XLSX)",
    icon: BarChart3,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
  },
  {
    id: "normativa",
    title: "Consulta normativa específica",
    subtitle: "Solo Leyes",
    icon: Scale,
    iconBg: "#FEF2F2",
    iconColor: "#DC2626",
  },
  {
    id: "financiero",
    title: "Análisis financiero",
    subtitle: "Solo Excel",
    icon: FileSpreadsheet,
    iconBg: "#ECFDF5",
    iconColor: "#059669",
  },
  {
    id: "procedimiento",
    title: "Procedimiento interno",
    subtitle: "Solo Documentos",
    icon: FileText,
    iconBg: "#EFF6FF",
    iconColor: "#475569",
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
  const [theme, setTheme] = useState<RagThemeId>("rag-neutral");
  const [activeScenario, setActiveScenario] = useState<string>("auditoria");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>(2);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [query, setQuery] = useState<string>(SCENARIOS[0].query);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>("nuevo");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const palette = THEME_CONFIG[theme];
  const SCENARIO_ALIAS: Record<string, number> = {
    auditoria: 0,
    normativa: 1,
    financiero: 0,
    procedimiento: 1,
  };
  const baseScenario =
    SCENARIOS[SCENARIO_ALIAS[activeScenario] ?? 0] ?? SCENARIOS[0];
  const scenario = baseScenario;
  const visibleMatches =
    activeScenario === "auditoria"
      ? baseScenario.matches
      : activeScenario === "normativa"
        ? baseScenario.matches.filter((m) => m.collectionId === "legal")
        : activeScenario === "financiero"
          ? baseScenario.matches.filter(
              (m) => m.collectionId === "spreadsheet"
            )
          : baseScenario.matches.filter((m) => m.collectionId === "document");
  const effectiveMatches =
    visibleMatches.length > 0 ? visibleMatches : baseScenario.matches;
  const visibleCitationIndexes = new Set(
    effectiveMatches.map((m) => m.citationIndex)
  );
  const visibleSegments = baseScenario.summarySegments.filter((s) =>
    (s.citations ?? []).some((c) => visibleCitationIndexes.has(c))
  );
  const effectiveSegments =
    visibleSegments.length > 0 ? visibleSegments : baseScenario.summarySegments;
  const comparisonRowIndexForTab: Record<string, number> = {
    normativa: 0,
    financiero: 1,
    procedimiento: 2,
  };
  const effectiveComparisonRows =
    activeScenario === "auditoria"
      ? baseScenario.structuredComparison.rows
      : baseScenario.structuredComparison.rows.filter(
          (_, i) => i === comparisonRowIndexForTab[activeScenario]
        ).length > 0
        ? baseScenario.structuredComparison.rows.filter(
            (_, i) => i === comparisonRowIndexForTab[activeScenario]
          )
        : baseScenario.structuredComparison.rows;
  const responsePlainText = effectiveSegments
    .map((s) => s.text + (s.citations ?? []).map((c) => ` [${c}]`).join(""))
    .join(" ");

  function showToastMessage(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function openInspector(tab: InspectorTab) {
    setInspectorTab(tab);
    setInspectorOpen(true);
  }

  function citationToTab(citation: number): InspectorTab {
    if (citation === 1) return 1;
    if (citation === 2) return 2;
    return 3;
  }

  function handleScenario(id: string) {
    setActiveScenario(id);
    const base = SCENARIOS[SCENARIO_ALIAS[id] ?? 0] ?? SCENARIOS[0];
    setQuery(base.query);
    if (id === "normativa") setInspectorTab(1);
    else if (id === "financiero") setInspectorTab(2);
    else if (id === "procedimiento") setInspectorTab(3);
    else setInspectorTab(2);
    setInspectorOpen(true);
  }

  function handleMarca(id: MarcaId) {
    setMarca(id);
    setTheme(MARCA_THEME[id]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 250);
  }

  function handleShare() {
    const textToCopy = `${query}\n\n${responsePlainText}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        void navigator.clipboard.writeText(textToCopy).then(
          () => showToastMessage("Respuesta copiada al portapapeles"),
          () => showToastMessage("No se pudo copiar. Inténtalo de nuevo")
        );
      } else {
        showToastMessage("Portapapeles no disponible en este navegador");
      }
    } catch {
      showToastMessage("No se pudo copiar. Inténtalo de nuevo");
    }
  }

  function handleExcelFull() {
    try {
      const excelMatch =
        baseScenario.matches.find((m) => m.collectionId === "spreadsheet") ??
        effectiveMatches[0];
      const loc = excelMatch?.locator;
      let csv = "Concepto,Detalle,Valor\n";
      if (loc && loc.kind === "spreadsheet") {
        csv += `Archivo,${loc.workbookName} | Hoja ${loc.sheetName} | Rango ${loc.cellRange}\n`;
        if (loc.formula) csv += `Fórmula,${loc.formula}\n`;
        for (const r of loc.rows) {
          const vals = Object.values(r.cells).join(" | ");
          csv += `Fila ${r.rowNumber},${JSON.stringify(vals)}\n`;
        }
      } else {
        csv += `Fuente,${excelMatch?.documentTitle ?? "Matriz"}\n`;
        csv += `Extracto,${JSON.stringify(excelMatch?.highlightedExcerpt ?? "")}\n`;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "matriz_excel_completa.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToastMessage("Matriz Excel exportada (CSV)");
    } catch {
      showToastMessage("No se pudo exportar la matriz");
    }
  }

  const tabStyle = (tab: InspectorTab, color: string, activeBg: string) => {
    const isActive = inspectorTab === tab;
    return {
      backgroundColor: isActive ? activeBg : "transparent",
      borderColor: isActive ? color : "transparent",
      color: "#111827",
      borderWidth: 1,
      borderStyle: "solid" as const,
    };
  };

  return (
    <div className="qaway-criterios-root">
      <div
        style={{ backgroundColor: "#FFFFFF", color: "#111827" }}
        className="h-screen w-full overflow-hidden flex flex-col font-sans antialiased"
      >
        {/* ===== TOP BAR liviana integrada al workspace (píldora + SQL + avatar) ===== */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* ===== COLUMNA 1: SIDEBAR IZQUIERDO ===== */}
          <aside
            style={{ backgroundColor: "#FAFAFA", borderColor: "#E5E7EB" }}
            className="hidden lg:flex w-[248px] shrink-0 border-r flex-col overflow-y-auto"
          >
            {/* Logo */}
            <div className="px-4 pt-4 pb-3 flex items-center gap-2">
              <span
                style={{ borderColor: "#E5E7EB" }}
                className="w-7 h-7 rounded-md border bg-white flex items-center justify-center"
              >
                <HubIcon icon={Layers} size={18} />
              </span>
              <span style={{ fontSize: 17 }} className="font-bold tracking-tight">
                RAG Hub
              </span>
              <span
                style={{
                  backgroundColor: "#EFF6FF",
                  color: "#2563EB",
                  fontSize: 12.5,
                }}
                className="px-1.5 py-0.5 rounded font-mono font-semibold"
              >
                v4.0
              </span>
            </div>

            {/* Proyecto / Marca */}
            <div className="px-3 mt-1">
              <p
                style={{ color: "#374151", fontSize: 14.5 }}
                className="px-1 pb-2 font-semibold"
              >
                Proyecto / Marca
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleMarca("corporativo")}
                  style={{
                    backgroundColor:
                      marca === "corporativo" ? "#EFF6FF" : "transparent",
                    borderLeft:
                      marca === "corporativo"
                        ? "3px solid #2563EB"
                        : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer"
                >
                  <HubIcon
                    icon={Building2}
                    size={18}
                    className="text-sky-600"
                  />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Corporativo
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      Documentos internos
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarca("legal")}
                  style={{
                    backgroundColor:
                      marca === "legal" ? "#FEF2F2" : "transparent",
                    borderLeft:
                      marca === "legal"
                        ? "3px solid #DC2626"
                        : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer"
                >
                  <HubIcon icon={Scale} size={18} className="text-red-600" />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Legal / Leyes
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      Normativa y artículos
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarca("finanzas")}
                  style={{
                    backgroundColor:
                      marca === "finanzas" ? "#ECFDF5" : "transparent",
                    borderLeft:
                      marca === "finanzas"
                        ? "3px solid #059669"
                        : "3px solid transparent",
                  }}
                  className="w-full text-left px-3 py-2 rounded-r-md flex items-center gap-2.5 cursor-pointer"
                >
                  <HubIcon
                    icon={FileSpreadsheet}
                    size={18}
                    className="text-emerald-600"
                  />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Finanzas / Excel
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      Reportes y modelos
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Navegación */}
            <div className="px-3 mt-6">
              <p
                style={{ color: "#374151", fontSize: 14.5 }}
                className="px-1 pb-2 font-semibold"
              >
                Navegación
              </p>
              <nav className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveNav("nuevo")}
                  style={
                    activeNav === "nuevo"
                      ? {
                          backgroundColor: "#EFF6FF",
                          borderLeft: "3px solid #2563EB",
                          fontSize: 14.5,
                        }
                      : { fontSize: 14.5, color: "#374151" }
                  }
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 font-semibold cursor-pointer ${
                    activeNav === "nuevo"
                      ? "rounded-r-md"
                      : "hover:bg-zinc-100 rounded-md"
                  }`}
                >
                  <HubIcon icon={Search} size={16} />
                  Nuevo análisis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("historial")}
                  style={
                    activeNav === "historial"
                      ? {
                          backgroundColor: "#EFF6FF",
                          borderLeft: "3px solid #2563EB",
                          fontSize: 14.5,
                        }
                      : { fontSize: 14.5, color: "#374151" }
                  }
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-100 cursor-pointer ${
                    activeNav === "historial"
                      ? "rounded-r-md font-semibold"
                      : "rounded-md"
                  }`}
                >
                  <HubIcon icon={History} size={16} />
                  Historial
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("colecciones")}
                  style={
                    activeNav === "colecciones"
                      ? {
                          backgroundColor: "#EFF6FF",
                          borderLeft: "3px solid #2563EB",
                          fontSize: 14.5,
                        }
                      : { fontSize: 14.5, color: "#374151" }
                  }
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-100 cursor-pointer ${
                    activeNav === "colecciones"
                      ? "rounded-r-md font-semibold"
                      : "rounded-md"
                  }`}
                >
                  <HubIcon icon={Layers} size={16} />
                  Colecciones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("config")}
                  style={
                    activeNav === "config"
                      ? {
                          backgroundColor: "#EFF6FF",
                          borderLeft: "3px solid #2563EB",
                          fontSize: 14.5,
                        }
                      : { fontSize: 14.5, color: "#374151" }
                  }
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-zinc-100 cursor-pointer ${
                    activeNav === "config"
                      ? "rounded-r-md font-semibold"
                      : "rounded-md"
                  }`}
                >
                  <HubIcon icon={Settings} size={16} />
                  Configuración
                </button>
              </nav>
            </div>

            <div className="flex-1" />

            {/* Colecciones activas */}
            <div className="p-3">
              <div
                style={{ borderColor: "#E5E7EB" }}
                className="bg-white border rounded-lg p-3 space-y-3"
              >
                <p style={{ fontSize: 14.5 }} className="font-semibold">
                  Colecciones activas
                </p>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Documentos
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      124 docs • 12,480 vectores
                    </span>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 w-3 h-3 rounded-full bg-red-500 shrink-0" />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Leyes
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      86 docs • 8,320 vectores
                    </span>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <span
                      style={{ fontSize: 14.5 }}
                      className="block font-semibold leading-tight"
                    >
                      Excel
                    </span>
                    <span
                      style={{ color: "#6B7280", fontSize: 14.5 }}
                      className="block leading-tight"
                    >
                      42 archivos • 6,120 vectores
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ===== COLUMNA 2: PANEL CENTRAL - WORKSPACE ===== */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
            {/* Header superior */}
            <div
              style={{ borderColor: "#E5E7EB" }}
              className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-3 border-b bg-white sticky top-0 z-10"
            >
              <span
                style={{
                  borderColor: "#E5E7EB",
                  color: "#374151",
                  fontSize: 14.5,
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-full border bg-white truncate"
              >
                Asistente multi-fuente (Ley + Excel + Documentos)
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(true)}
                  style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-white font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  <HubIcon icon={Code2} size={16} />
                  <span className="hidden md:inline">
                    &lt;/&gt; Ver SQL &amp; Edge Function
                  </span>
                  <span className="md:hidden">SQL</span>
                </button>
                <div className="relative flex items-center gap-1.5">
                  <span className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold">
                    C
                  </span>
                  <span style={{ fontSize: 14.5 }} className="font-medium hidden sm:inline">
                    Carlos
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="p-1 rounded hover:bg-zinc-100 cursor-pointer"
                    aria-label="Abrir menú de usuario"
                  >
                    <HubIcon icon={ChevronDown} size={16} />
                  </button>
                  {showUserMenu && (
                    <div
                      style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-md border bg-white shadow-lg py-1 z-20"
                    >
                      {["Mi perfil", "Mis análisis", "Cerrar sesión"].map(
                        (opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              showToastMessage(`${opt} seleccionado`);
                            }}
                            style={{ fontSize: 14.5 }}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-100 cursor-pointer"
                          >
                            {opt}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-5 max-w-[860px] w-full mx-auto space-y-4 flex-1">
              <div>
                <h1
                  style={{ fontSize: 26 }}
                  className="font-bold tracking-tight"
                >
                  Asistente de conocimiento
                </h1>
                <p style={{ color: "#4B5563", fontSize: 15 }} className="mt-1">
                  Consulta información de leyes, archivos Excel y documentos
                  corporativos en una sola búsqueda.
                </p>
              </div>

              {/* 4 tarjetas de escenarios */}
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
                        backgroundColor: isActive ? "#EFF6FF" : "#FFFFFF",
                      }}
                      className="text-left p-3 rounded-lg border flex items-start gap-2 cursor-pointer"
                    >
                      <span
                        style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      >
                        <HubIcon icon={c.icon} size={16} />
                      </span>
                      <span className="min-w-0">
                        <span
                          style={{ fontSize: 14.5 }}
                          className="block font-semibold leading-tight"
                        >
                          {c.title}
                        </span>
                        <span
                          style={{ color: "#6B7280", fontSize: 14.5 }}
                          className="block leading-tight mt-0.5"
                        >
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
                  style={{ borderColor: "#E5E7EB" }}
                  className="rounded-lg border bg-white shadow-sm flex items-center gap-2 pl-4 pr-2 py-2"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ fontSize: 15 }}
                    className="flex-1 bg-transparent focus:outline-none min-w-0"
                    aria-label="Consulta de conocimiento"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: "#2563EB" }}
                    className="w-10 h-10 rounded-md text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer shrink-0"
                    aria-label="Enviar consulta"
                  >
                    <HubIcon icon={isSearching ? Search : Send} size={16} />
                  </button>
                </div>
              </form>

              {/* Card de respuesta */}
              <article
                style={{ borderColor: "#E5E7EB" }}
                className="rounded-lg border bg-white p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <HubIcon icon={Check} size={16} />
                    </span>
                    <span>
                      <span
                        style={{ fontSize: 15 }}
                        className="block font-semibold"
                      >
                        Respuesta generada ({scenario.latencyMs} ms)
                      </span>
                      <span
                        style={{ color: "#6B7280", fontSize: 14.5 }}
                        className="block"
                      >
                        Con base en {effectiveMatches.length} fuentes relevantes
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSaved((v) => !v);
                        showToastMessage(
                          !saved
                            ? "Análisis guardado en Colecciones"
                            : "Análisis retirado de guardados"
                        );
                      }}
                      style={{
                        borderColor: saved ? "#2563EB" : "#E5E7EB",
                        backgroundColor: saved ? "#EFF6FF" : "#FFFFFF",
                        color: saved ? "#1D4ED8" : "#111827",
                        fontSize: 14.5,
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border hover:bg-zinc-50 cursor-pointer"
                    >
                      <HubIcon icon={Bookmark} size={16} />
                      {saved ? "Guardado" : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-white hover:bg-zinc-50 cursor-pointer"
                    >
                      <HubIcon icon={Share2} size={16} />
                      Compartir
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMoreMenu((v) => !v)}
                        style={{ borderColor: "#E5E7EB" }}
                        className="p-1.5 rounded-md border bg-white hover:bg-zinc-50 cursor-pointer"
                        aria-label="Más opciones"
                      >
                        <HubIcon icon={MoreHorizontal} size={16} />
                      </button>
                      {showMoreMenu && (
                        <div
                          style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-white shadow-lg py-1 z-20"
                        >
                          {[
                            "Ver detalle técnico",
                            "Exportar citas (.txt)",
                            "Reportar respuesta",
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setShowMoreMenu(false);
                                if (opt.startsWith("Exportar")) handleShare();
                                else showToastMessage(`${opt} seleccionado`);
                              }}
                              style={{ fontSize: 14.5 }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-100 cursor-pointer"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p
                  style={{ fontSize: 15, lineHeight: 1.7, color: "#1F2937" }}
                >
                  {effectiveSegments.map((seg, si) => (
                    <span key={si}>
                      {seg.text}
                      {(seg.citations ?? []).map((c) => (
                        <span key={c}>
                          {" "}
                          <button
                            type="button"
                            onClick={() => openInspector(citationToTab(c))}
                            style={{ color: "#2563EB", fontSize: 14.5 }}
                            className="font-mono font-semibold cursor-pointer"
                          >
                            [{c}]
                          </button>
                        </span>
                      ))}
                      {si < effectiveSegments.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>

                {/* Tabla Comparativo */}
                <div>
                  <h2 style={{ fontSize: 15.5 }} className="font-semibold mb-2">
                    Comparativo de impacto financiero
                  </h2>
                  <div
                    style={{ borderColor: "#E5E7EB" }}
                    className="overflow-x-auto rounded-md border"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#F3F4F6",
                            color: "#111827",
                          }}
                          className="border-b"
                        >
                          {baseScenario.structuredComparison.headers.map((h) => (
                            <th
                              key={h}
                              style={{ fontSize: 14.5 }}
                              className="py-2 px-3 font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {effectiveComparisonRows.map((row, ri) => (
                          <tr
                            key={ri}
                            style={{ borderColor: "#E5E7EB" }}
                            className={
                              ri < effectiveComparisonRows.length - 1
                                ? "border-b"
                                : ""
                            }
                          >
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                style={
                                  ci === row.length - 1
                                    ? {
                                        fontSize: 14.5,
                                        color: "#DC2626",
                                        backgroundColor: "#FEF2F2",
                                      }
                                    : { fontSize: 14.5 }
                                }
                                className="py-2 px-3 font-mono tabular-nums"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fuentes y referencias */}
                <div>
                  <h2 style={{ fontSize: 15.5 }} className="font-semibold mb-2">
                    Fuentes y referencias
                  </h2>
                  <div className="space-y-2.5">
                    {effectiveMatches.map((m) => {
                      const tab = citationToTab(m.citationIndex);
                      const badgeBg =
                        m.citationIndex === 1
                          ? "bg-red-500"
                          : m.citationIndex === 2
                            ? "bg-emerald-500"
                            : "bg-slate-400";
                      const subtitle =
                        m.locator.kind === "legal"
                          ? `${m.locator.lawNumber} · ${m.locator.article}`
                          : m.locator.kind === "spreadsheet"
                            ? `Hoja: ${m.locator.sheetName} | Rango: ${m.locator.cellRange}`
                            : `${m.locator.sectionTitle}`;
                      const meta =
                        m.locator.kind === "legal"
                          ? `p. ${m.locator.page} · ${m.locator.officialGazetteDate}`
                          : m.locator.kind === "document"
                            ? `p. ${m.locator.page} · ${m.locator.version}`
                            : null;
                      const linkLabel =
                        m.collectionId === "legal"
                          ? "Ver artículo →"
                          : m.collectionId === "spreadsheet"
                            ? "Ver en Excel →"
                            : "Ver sección →";
                      return (
                        <button
                          key={m.chunkId}
                          type="button"
                          onClick={() => openInspector(tab)}
                          style={{ borderColor: "#E5E7EB" }}
                          className="w-full text-left rounded-md border p-3 flex items-start gap-3 hover:bg-zinc-50 cursor-pointer"
                        >
                          <span
                            className={`w-7 h-7 rounded-md ${badgeBg} text-white flex items-center justify-center font-bold shrink-0`}
                          >
                            {m.citationIndex}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span
                              style={{ color: "#2563EB", fontSize: 14.5 }}
                              className="block font-semibold"
                            >
                              {m.documentTitle}
                            </span>
                            <span
                              style={{ color: "#4B5563", fontSize: 14.5 }}
                              className="block"
                            >
                              {subtitle}
                            </span>
                          </span>
                          <span className="hidden sm:block max-w-[280px] text-right shrink-0">
                            <span
                              style={{ color: "#6B7280", fontSize: 14.5 }}
                              className="block leading-snug"
                            >
                              “{m.highlightedExcerpt}”
                            </span>
                            {m.locator.kind === "spreadsheet" &&
                            m.locator.formula ? (
                              <span
                                style={{
                                  backgroundColor: "#F3F4F6",
                                  fontSize: 14.5,
                                }}
                                className="inline-block font-mono px-2 py-0.5 rounded mt-1"
                              >
                                Fórmula&nbsp;&nbsp;&nbsp;&nbsp;
                                {m.locator.formula}
                              </span>
                            ) : (
                              meta && (
                                <span
                                  style={{ color: "#6B7280", fontSize: 14.5 }}
                                  className="block font-mono mt-1"
                                >
                                  {meta}
                                </span>
                              )
                            )}
                            <span
                              style={{ color: "#2563EB", fontSize: 14.5 }}
                              className="block font-medium"
                            >
                              {linkLabel}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
              <p
                style={{ color: palette.textMuted, fontSize: 14.5 }}
                className="font-mono pb-6"
              >
                Latencia RAG: {scenario.latencyMs} ms · Tema activo:{" "}
                {palette.name} · Marca: {marca}
              </p>
            </div>
          </main>

          {/* ===== COLUMNA 3: INSPECTOR DE FUENTES ===== */}
          {inspectorOpen && (
            <aside
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
              className="hidden xl:flex w-[380px] shrink-0 border-l flex-col h-full overflow-y-auto"
            >
              <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 style={{ fontSize: 16 }} className="font-bold">
                  Inspector de fuentes
                </h2>
                <button
                  type="button"
                  onClick={() => setInspectorOpen(false)}
                  className="p-1 rounded hover:bg-zinc-100 cursor-pointer"
                  aria-label="Cerrar inspector"
                >
                  <HubIcon icon={X} size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectorTab(1)}
                  style={tabStyle(1, "#DC2626", "#FEF2F2")}
                  className="flex-1 rounded-md px-2 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span style={{ fontSize: 14.5 }} className="font-semibold">
                    Ley
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab(2)}
                  style={tabStyle(2, "#059669", "#ECFDF5")}
                  className="flex-1 rounded-md px-2 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span style={{ fontSize: 14.5 }} className="font-semibold">
                    Excel
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab(3)}
                  style={tabStyle(3, "#64748B", "#F1F5F9")}
                  className="flex-1 rounded-md px-2 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-slate-400 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span style={{ fontSize: 14.5 }} className="font-semibold">
                    Documento
                  </span>
                </button>
              </div>

              <div className="p-4 space-y-4">
                {(() => {
                  const legalMatch =
                    baseScenario.matches.find(
                      (m) => m.collectionId === "legal"
                    ) ?? baseScenario.matches[0];
                  const excelMatch =
                    baseScenario.matches.find(
                      (m) => m.collectionId === "spreadsheet"
                    ) ?? baseScenario.matches[1] ??
                    baseScenario.matches[0];
                  const docMatch =
                    baseScenario.matches.find(
                      (m) => m.collectionId === "document"
                    ) ?? baseScenario.matches[2] ??
                    baseScenario.matches[0];
                  const excelLoc =
                    excelMatch.locator.kind === "spreadsheet"
                      ? excelMatch.locator
                      : null;
                  return (
                    <>
                      {inspectorTab === 1 && legalMatch && (
                        <div className="space-y-3">
                          <div
                            style={{ borderColor: "#E5E7EB" }}
                            className="border rounded-md p-3"
                          >
                            <p style={{ fontSize: 14.5 }} className="font-semibold">
                              {legalMatch.documentTitle}
                            </p>
                            <p style={{ color: "#6B7280", fontSize: 14.5 }}>
                              {legalMatch.locator.kind === "legal"
                                ? `${legalMatch.locator.article} · p. ${legalMatch.locator.page}`
                                : legalMatch.locator.kind === "document"
                                  ? `${legalMatch.locator.sectionTitle} · p. ${legalMatch.locator.page}`
                                  : legalMatch.locator.sheetName}
                            </p>
                            <p
                              style={{ fontSize: 14.5, lineHeight: 1.6 }}
                              className="mt-2"
                            >
                              “{legalMatch.highlightedExcerpt}”
                            </p>
                          </div>
                          <div
                            style={{ borderColor: "#E5E7EB" }}
                            className="border rounded-md p-3 grid grid-cols-2 gap-2"
                          >
                            <span style={{ fontSize: 14.5, color: "#6B7280" }}>
                              Norma
                            </span>
                            <span style={{ fontSize: 14.5 }}>
                              {legalMatch.locator.kind === "legal"
                                ? legalMatch.locator.lawNumber
                                : legalMatch.documentTitle}
                            </span>
                            <span style={{ fontSize: 14.5, color: "#6B7280" }}>
                              Página
                            </span>
                            <span style={{ fontSize: 14.5 }}>
                              {"page" in legalMatch.locator
                                ? legalMatch.locator.page
                                : "—"}
                            </span>
                          </div>
                        </div>
                      )}

                      {inspectorTab === 2 && excelMatch && (
                        <>
                          <div className="flex items-start gap-2.5">
                            <span className="w-9 h-9 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <HubIcon icon={FileSpreadsheet} size={18} />
                            </span>
                            <span>
                              <span
                                style={{ fontSize: 15 }}
                                className="block font-semibold leading-tight"
                              >
                                {excelMatch.documentTitle}
                              </span>
                              <span
                                style={{ color: "#6B7280", fontSize: 14.5 }}
                                className="block"
                              >
                                {excelLoc
                                  ? `Hoja: ${excelLoc.sheetName}`
                                  : "Hoja: Proyecciones"}
                              </span>
                            </span>
                          </div>

                          {/* Barra de fórmulas */}
                          <div className="flex items-center gap-2">
                            <span
                              style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded border font-mono"
                            >
                              {excelLoc ? excelLoc.activeCell : "D13"}{" "}
                              <span style={{ fontSize: 12 }}>v</span>
                            </span>
                            <span
                              style={{ color: "#6B7280", fontSize: 14.5 }}
                              className="font-serif italic font-bold"
                            >
                              fx
                            </span>
                            <code
                              style={{
                                borderColor: "#E5E7EB",
                                color: "#2563EB",
                                fontSize: 14.5,
                              }}
                              className="flex-1 border rounded px-2 py-1.5 font-mono truncate"
                            >
                              {excelLoc?.formula ?? "=SUMA(D12:D14)"}
                            </code>
                          </div>

                    {/* Grilla */}
                    <div
                      style={{ borderColor: "#E5E7EB" }}
                      className="overflow-x-auto rounded-md border"
                    >
                      {excelLoc ? (
                        <table className="w-full border-collapse font-mono tabular-nums">
                          <thead>
                            <tr
                              style={{ backgroundColor: "#F9FAFB" }}
                              className="border-b"
                            >
                              <th
                                style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                                className="py-1.5 px-2 border-r w-10 text-center font-semibold text-zinc-500"
                              >
                                {" "}
                              </th>
                              {excelLoc.columns.map((c) => (
                                <th
                                  key={c}
                                  style={{
                                    borderColor: "#E5E7EB",
                                    fontSize: 14.5,
                                  }}
                                  className="py-1.5 px-2.5 border-r last:border-r-0 font-semibold text-zinc-500 text-center"
                                >
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {excelLoc.rows.map((r) => (
                              <tr
                                key={r.rowNumber}
                                style={{
                                  borderColor: "#E5E7EB",
                                  backgroundColor: r.isHighlighted
                                    ? "#ECFDF5"
                                    : "#FFFFFF",
                                }}
                                className="border-b last:border-b-0"
                              >
                                <td
                                  style={{
                                    borderColor: "#E5E7EB",
                                    color: "#9CA3AF",
                                    fontSize: 14.5,
                                  }}
                                  className="py-1.5 px-2 border-r text-center"
                                >
                                  {r.rowNumber}
                                </td>
                                {excelLoc.columns.map((c) => (
                                  <td
                                    key={c}
                                    style={{
                                      borderColor: "#E5E7EB",
                                      fontSize: 14.5,
                                    }}
                                    className="py-1.5 px-2.5 border-r last:border-r-0 text-right"
                                  >
                                    {String(r.cells[c] ?? "")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full border-collapse font-mono tabular-nums">
                          <thead>
                            <tr
                              style={{ backgroundColor: "#F9FAFB" }}
                              className="border-b"
                            >
                              <th
                                style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                                className="py-1.5 px-2 border-r w-10 text-center font-semibold text-zinc-500"
                              >
                                {" "}
                              </th>
                              {["A", "B", "C", "D", "E"].map((c) => (
                                <th
                                  key={c}
                                  style={{
                                    borderColor: "#E5E7EB",
                                    fontSize: 14.5,
                                  }}
                                  className="py-1.5 px-2.5 border-r last:border-r-0 font-semibold text-zinc-500 text-center"
                                >
                                  {c}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {EXCEL_GRID_ROWS.map((r, idx) => {
                              const isActiveRow =
                                r.n === 13 && r.label === "Provisión laboral";
                              return (
                                <tr
                                  key={`${r.n}-${idx}`}
                                  style={{
                                    borderColor: "#E5E7EB",
                                    backgroundColor: isActiveRow
                                      ? "#ECFDF5"
                                      : "#FFFFFF",
                                  }}
                                  className="border-b last:border-b-0"
                                >
                                  <td
                                    style={{
                                      borderColor: "#E5E7EB",
                                      color: "#9CA3AF",
                                      fontSize: 14.5,
                                    }}
                                    className="py-1.5 px-2 border-r text-center"
                                  >
                                    {r.n}
                                  </td>
                                  <td
                                    style={{
                                      borderColor: "#E5E7EB",
                                      fontSize: 14.5,
                                    }}
                                    className="py-1.5 px-2.5 border-r"
                                    colSpan={2}
                                  >
                                    {r.label}
                                  </td>
                                  <td
                                    style={{
                                      borderColor: isActiveRow
                                        ? "#059669"
                                        : "#E5E7EB",
                                      fontSize: 14.5,
                                      borderWidth: isActiveRow ? 2 : 1,
                                    }}
                                    className={`py-1.5 px-2.5 border-r text-right font-semibold ${
                                      isActiveRow ? "text-emerald-800" : ""
                                    }`}
                                  >
                                    {r.value}
                                  </td>
                                  <td
                                    style={{
                                      borderColor: "#E5E7EB",
                                      fontSize: 14.5,
                                    }}
                                    className="py-1.5 px-2.5"
                                  >
                                    {" "}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Detalles de la celda */}
                    <div>
                      <h3
                        style={{ fontSize: 15 }}
                        className="font-semibold mb-1.5"
                      >
                        Detalles de la celda
                      </h3>
                      <div
                        style={{ borderColor: "#E5E7EB" }}
                        className="border rounded-md divide-y"
                      >
                        <div className="grid grid-cols-2 px-3 py-2 gap-2">
                          <span
                            style={{ color: "#4B5563", fontSize: 14.5 }}
                          >
                            Rango
                          </span>
                          <span
                            style={{ fontSize: 14.5 }}
                            className="font-mono"
                          >
                            {excelLoc?.cellRange ?? "D12:D14"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-2 gap-2">
                          <span
                            style={{ color: "#4B5563", fontSize: 14.5 }}
                          >
                            Celda activa
                          </span>
                          <span
                            style={{ fontSize: 14.5 }}
                            className="font-mono"
                          >
                            {excelLoc?.activeCell ?? "D13"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-2 gap-2 items-center">
                          <span
                            style={{ color: "#4B5563", fontSize: 14.5 }}
                          >
                            Fórmula
                          </span>
                          <code
                            style={{
                              backgroundColor: "#F3F4F6",
                              fontSize: 14.5,
                            }}
                            className="font-mono px-2 py-1 rounded"
                          >
                            {excelLoc?.formula ?? "=SUMA(D12:D14)"}
                          </code>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-2 gap-2">
                          <span
                            style={{ color: "#4B5563", fontSize: 14.5 }}
                          >
                            Valor
                          </span>
                          <span style={{ fontSize: 14.5 }}>
                            {excelMatch.highlightedExcerpt}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-2 gap-2">
                          <span
                            style={{ color: "#4B5563", fontSize: 14.5 }}
                          >
                            Formato
                          </span>
                          <span style={{ fontSize: 14.5 }}>Número (USD)</span>
                        </div>
                      </div>
                    </div>

                    {/* Contexto */}
                    <div>
                      <h3
                        style={{ fontSize: 15 }}
                        className="font-semibold mb-1.5"
                      >
                        Contexto de la fuente
                      </h3>
                      <div
                        style={{ borderColor: "#E5E7EB" }}
                        className="border rounded-md p-3"
                      >
                        <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>
                          “{excelMatch.content}”
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExcelFull}
                      style={{ borderColor: "#E5E7EB", fontSize: 14.5 }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white font-medium hover:bg-zinc-50 cursor-pointer"
                    >
                      <HubIcon icon={ExternalLink} size={16} />
                      Abrir en Excel completo
                    </button>
                  </>
                      )}

                      {inspectorTab === 3 && docMatch && (
                        <div className="space-y-3">
                          <div
                            style={{ borderColor: "#E5E7EB" }}
                            className="border rounded-md p-3"
                          >
                            <p style={{ fontSize: 14.5 }} className="font-semibold">
                              {docMatch.documentTitle}
                            </p>
                            <p style={{ color: "#6B7280", fontSize: 14.5 }}>
                              {docMatch.locator.kind === "document"
                                ? `${docMatch.locator.sectionTitle} · p. ${docMatch.locator.page}`
                                : docMatch.locator.kind === "legal"
                                  ? `${docMatch.locator.article} · p. ${docMatch.locator.page}`
                                  : docMatch.locator.sheetName}
                            </p>
                            <p
                              style={{ fontSize: 14.5, lineHeight: 1.6 }}
                              className="mt-2"
                            >
                              {docMatch.content}{" "}
                              {docMatch.locator.kind === "document"
                                ? docMatch.locator.version
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </aside>
          )}
        </div>

        {/* Toast temporal (Compartir / Guardar / menús / Excel) */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#111827",
              color: "#FFFFFF",
              fontSize: 14.5,
              borderRadius: 8,
              padding: "10px 16px",
              zIndex: 60,
            }}
            role="status"
          >
            {toast}
          </div>
        )}

        {/* MODAL SQL */}
        {showSqlModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full max-h-[85vh] rounded-lg border bg-white shadow-xl flex flex-col overflow-hidden">
              <div className="px-5 py-3.5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HubIcon icon={Database} size={18} />
                  <h3 style={{ fontSize: 15 }} className="font-semibold">
                    Arquitectura Supabase pgvector + Edge Function
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1 rounded hover:bg-zinc-100 cursor-pointer"
                >
                  <HubIcon icon={X} size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 font-mono">
                <pre
                  style={{ fontSize: 14.5 }}
                  className="p-3 rounded bg-zinc-950 text-zinc-100 overflow-x-auto leading-relaxed"
                >
                  {`create extension if not exists vector with schema extensions;

create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  content text not null,
  embedding extensions.vector(384) not null
);`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const App = CriteriosApp;
