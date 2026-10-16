import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Search,
  Sparkles,
  Scale,
  FileSpreadsheet,
  FileText,
  Database,
  SlidersHorizontal,
  CornerDownLeft,
  CheckCircle2,
  PanelRightClose,
  Copy,
  Check,
  UploadCloud,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Code2,
  X,
  Menu,
  ArrowUpRight,
  BookOpen,
  Table2,
  Filter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================================
 * 1. SISTEMA DE ICONOS CANÓNICO (§13.3 - Wrapper Tipado HubIcon)
 * ============================================================================ */
type AllowedIconSize = 14 | 16 | 18 | 20 | 24;

interface HubIconProps {
  icon: LucideIcon | undefined;
  size?: AllowedIconSize;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

function HubIcon({
  icon: IconComponent,
  size = 18,
  strokeWidth = 1.75,
  className = "",
  ariaLabel,
}: HubIconProps) {
  if (!IconComponent) {
    return (
      <span
        className={`inline-block rounded-xs bg-zinc-200 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}

/* ============================================================================
 * 2. CONTRATOS Y TIPOS ESTRICTOS (§11 y §48)
 * ============================================================================ */
type RagThemeId = "rag-neutral" | "rag-legal" | "rag-finance";
type SourceCategory = "all" | "legal" | "spreadsheet" | "document";

interface LegalLocator {
  kind: "legal";
  lawNumber: string;
  article: string;
  hierarchy: string[];
  page: number;
  officialGazetteDate: string;
  jurisdiction: string;
}

interface SpreadsheetCellRow {
  rowNumber: number;
  cells: Record<string, string | number>;
  isHighlighted?: boolean;
}

interface SpreadsheetLocator {
  kind: "spreadsheet";
  workbookName: string;
  sheetName: string;
  cellRange: string;
  activeCell: string;
  formula?: string;
  columns: string[];
  rows: SpreadsheetCellRow[];
}

interface DocumentLocator {
  kind: "document";
  sectionTitle: string;
  page: number;
  paragraph: number;
  version: string;
}

type SourceLocator = LegalLocator | SpreadsheetLocator | DocumentLocator;

interface RagChunkMatch {
  citationIndex: number;
  chunkId: string;
  documentId: string;
  documentTitle: string;
  collectionId: SourceCategory;
  content: string;
  highlightedExcerpt: string;
  similarity: number;
  embeddingDimensions: 384 | 1536;
  locator: SourceLocator;
}

interface RagAnswerSegment {
  text: string;
  citations?: number[];
}

interface RagScenario {
  id: string;
  label: string;
  badge: string;
  query: string;
  latencyMs: number;
  summarySegments: RagAnswerSegment[];
  structuredComparison: {
    headers: string[];
    rows: Array<string[]>;
  };
  matches: RagChunkMatch[];
}

interface KnowledgeCollection {
  id: SourceCategory;
  name: string;
  documentCount: number;
  vectorCount: number;
}

/* ============================================================================
 * 3. ESCENARIOS MULTI-PROYECTO REALISTAS (Semilla Controlada §46)
 * ============================================================================ */
const SCENARIOS: RagScenario[] = [
  {
    id: "laboral-ebitda",
    label: "Auditoría Legal + Excel EBITDA",
    badge: "Híbrido (Ley + XLSX)",
    query:
      "¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?",
    latencyMs: 134,
    summarySegments: [
      {
        text: "El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes ",
        citations: [1],
      },
      {
        text: ". Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado de la operación al 18.4% ",
        citations: [2],
      },
      {
        text: ". Conforme al manual corporativo de control interno, toda provisión contingente que supere el umbral de USD 25,000 exige un dictamen vinculante del comité de auditoría antes del día 25 del mes ",
        citations: [3],
      },
    ],
    structuredComparison: {
      headers: [
        "Fuente Vectorizada",
        "Localizador Exacto",
        "Criterio / Impacto Cuantificado",
        "Score Coseno",
      ],
      rows: [
        [
          "D.S. N° 007-2002-TR (Ley Jornada)",
          "Art. 10° y Art. 10-A°",
          "Sobretiempo +25% (2 hrs) / +35% adicional",
          "0.95 (HNSW + FTS)",
        ],
        [
          "Matriz_Financiera_2026.xlsx",
          "EBITDA_Q3!B14:E17",
          "Provisión USD 48,500 (Impacto -2.1% margen)",
          "0.92 (Vector 384d)",
        ],
        [
          "Manual_Compliance_Corporativo.pdf",
          "Sección 4.2 · Pág. 19",
          "Umbral de alerta: > USD 25,000 exige comité",
          "0.88 (Vector 384d)",
        ],
      ],
    },
    matches: [
      {
        citationIndex: 1,
        chunkId: "vec_law_007_10a",
        documentId: "doc_ley_jornada",
        documentTitle: "TUO Ley de Jornada de Trabajo y Sobretiempo (D.S. 007-2002-TR)",
        collectionId: "legal",
        similarity: 0.95,
        embeddingDimensions: 384,
        content:
          "Artículo 10°.- El tiempo trabajado que exceda a la jornada diaria o semanal se considera sobretiempo y se abona con un recargo a convenir, que para las dos primeras horas no podrá ser inferior al veinticinco por ciento (25%) por hora calculado sobre la remuneración percibida por el trabajador en función del valor hora correspondiente y treinta y cinco por ciento (35%) para las horas restantes. Artículo 10-A°.- El empleador está obligado a registrar el trabajo prestado en sobretiempo mediante la utilización de medios técnicos o manuales seguros y confiables.",
        highlightedExcerpt:
          "no podrá ser inferior al veinticinco por ciento (25%) por hora... El empleador está obligado a registrar el trabajo prestado en sobretiempo",
        locator: {
          kind: "legal",
          lawNumber: "Decreto Supremo N° 007-2002-TR",
          article: "Artículo 10° y 10-A°",
          hierarchy: ["Título II: Del Trabajo en Sobretiempo", "Capítulo Único"],
          page: 7,
          officialGazetteDate: "04 Jul 2002",
          jurisdiction: "Legislación Laboral Vigente",
        },
      },
      {
        citationIndex: 2,
        chunkId: "vec_xls_ebitda_q3",
        documentId: "doc_excel_ebitda",
        documentTitle: "Matriz_Financiera_2026.xlsx",
        collectionId: "spreadsheet",
        similarity: 0.92,
        embeddingDimensions: 384,
        content:
          "Hoja: EBITDA_Q3 | Rango B14:E17 | Cuenta 6291: Provisión Contingencias Laborales = $48,500.00 | EBITDA Operativo Ajustado Q3 = $312,800.00 (18.4%)",
        highlightedExcerpt: "Provisión Contingencia Auditoría = $48,500.00 (2.8%)",
        locator: {
          kind: "spreadsheet",
          workbookName: "Matriz_Financiera_2026.xlsx",
          sheetName: "EBITDA_Q3",
          cellRange: "B14:E17",
          activeCell: "D16",
          formula: "=SUM(D14:D15) * (1 + $C$4) + CONTINGENCIA_LEGAL",
          columns: ["B (Cuenta)", "C (Partida Contable)", "D (Monto USD)", "E (% Ingresos)"],
          rows: [
            {
              rowNumber: 14,
              cells: {
                "B (Cuenta)": "6211",
                "C (Partida Contable)": "Sueldos y Salarios Base",
                "D (Monto USD)": "$210,000.00",
                "E (% Ingresos)": "12.3%",
              },
            },
            {
              rowNumber: 15,
              cells: {
                "B (Cuenta)": "6214",
                "C (Partida Contable)": "Recargo Sobretiempo (25%/35%)",
                "D (Monto USD)": "$19,200.00",
                "E (% Ingresos)": "1.1%",
              },
            },
            {
              rowNumber: 16,
              isHighlighted: true,
              cells: {
                "B (Cuenta)": "6291",
                "C (Partida Contable)": "Provisión Contingencia Auditoría",
                "D (Monto USD)": "$48,500.00",
                "E (% Ingresos)": "2.8%",
              },
            },
            {
              rowNumber: 17,
              cells: {
                "B (Cuenta)": "EBITDA",
                "C (Partida Contable)": "EBITDA Operativo Ajustado Q3",
                "D (Monto USD)": "$312,800.00",
                "E (% Ingresos)": "18.4%",
              },
            },
          ],
        },
      },
      {
        citationIndex: 3,
        chunkId: "vec_doc_comp_42",
        documentId: "doc_compliance_manual",
        documentTitle: "Manual_Compliance_Corporativo_v4.pdf",
        collectionId: "document",
        similarity: 0.88,
        embeddingDimensions: 384,
        content:
          "Sección 4.2 Control de Provisiones y Contingencias: Cualquier provisión contable derivada de fiscalizaciones laborales, regulatorias o tributarias que supere el umbral de USD 25,000 debe contar con un informe técnico vinculante del área legal y ser reportada en el comité de auditoría antes del día 25 de cada mes para su bloqueo presupuestal.",
        highlightedExcerpt:
          "supere el umbral de USD 25,000 debe contar con un informe técnico vinculante del área legal",
        locator: {
          kind: "document",
          sectionTitle: "4.2 Control de Provisiones y Contingencias",
          page: 19,
          paragraph: 3,
          version: "v4.2 Aprobado por Directorio",
        },
      },
    ],
  },
  {
    id: "proteccion-datos-cloud",
    label: "Ley Protección de Datos + Costos Cloud Excel",
    badge: "Legal + FinOps",
    query:
      "¿Qué exige la Ley N° 29733 sobre flujo transfronterizo de datos y cuál es el presupuesto en AWS/Supabase en la hoja FinOps_2026?",
    latencyMs: 118,
    summarySegments: [
      {
        text: "El flujo transfronterizo de datos personales solo puede realizarse cuando el país receptor garantice niveles adecuados de protección equivalentes a la normativa nacional o medie consentimiento expreso e inequívoco del titular ",
        citations: [1],
      },
      {
        text: ". En el presupuesto de infraestructura cloud 2026, la partida de nodos dedicados con aislamiento RLS y réplicas cifradas representa un costo mensual de USD 3,420 en la región us-east-1 ",
        citations: [2],
      },
      {
        text: ". El protocolo de seguridad informática establece que ninguna credencial privada ni clave de servicio puede compilarse en el bundle público del navegador ",
        citations: [3],
      },
    ],
    structuredComparison: {
      headers: [
        "Fuente Vectorizada",
        "Localizador Exacto",
        "Requisito / Partida Presupuestal",
        "Score Coseno",
      ],
      rows: [
        [
          "Ley N° 29733 (Datos Personales)",
          "Título II · Art. 15°",
          "Garantía de nivel adecuado en país destino",
          "0.96 (HNSW + FTS)",
        ],
        [
          "Presupuesto_FinOps_2026.xlsx",
          "Cloud_Infra!A8:D11",
          "Cluster PostgreSQL + pgvector: USD 3,420/mes",
          "0.91 (Vector 384d)",
        ],
        [
          "Politica_DevSecOps_V4.pdf",
          "Sección 45.1 · Pág. 12",
          "Aislamiento estricto de SERVICE_ROLE_KEY",
          "0.89 (Vector 384d)",
        ],
      ],
    },
    matches: [
      {
        citationIndex: 1,
        chunkId: "vec_law_29733_15",
        documentId: "doc_ley_datos",
        documentTitle: "Ley N° 29733 — Ley de Protección de Datos Personales",
        collectionId: "legal",
        similarity: 0.96,
        embeddingDimensions: 384,
        content:
          "Artículo 15°.- Flujo transfronterizo de datos personales. El titular y el encargado de tratamiento de datos personales deben realizar el flujo transfronterizo de datos personales solo si el país destinatario mantiene niveles de protección adecuados conforme a la presente Ley. En caso contrario, el emisor del flujo transfronterizo debe garantizar que el tratamiento se efectúe conforme a los estándares exigidos.",
        highlightedExcerpt:
          "solo si el país destinatario mantiene niveles de protección adecuados conforme a la presente Ley",
        locator: {
          kind: "legal",
          lawNumber: "Ley N° 29733",
          article: "Artículo 15°",
          hierarchy: ["Título II: Tratamiento de Datos", "Disposiciones Especiales"],
          page: 11,
          officialGazetteDate: "03 Jul 2011",
          jurisdiction: "Autoridad Nacional de Protección de Datos",
        },
      },
      {
        citationIndex: 2,
        chunkId: "vec_xls_finops_08",
        documentId: "doc_excel_finops",
        documentTitle: "Presupuesto_FinOps_2026.xlsx",
        collectionId: "spreadsheet",
        similarity: 0.91,
        embeddingDimensions: 384,
        content:
          "Hoja: Cloud_Infra | Rango A8:D11 | Nodo dedicado PostgreSQL + pgvector HNSW = $3,420.00/mes",
        highlightedExcerpt: "Cluster Supabase Pro + pgvector HNSW = $3,420.00",
        locator: {
          kind: "spreadsheet",
          workbookName: "Presupuesto_FinOps_2026.xlsx",
          sheetName: "Cloud_Infra",
          cellRange: "A8:D11",
          activeCell: "C10",
          formula: "=SUM(C8:C9) * 1.18",
          columns: ["A (ID)", "B (Servicio Cloud)", "C (Costo Mensual)", "D (Región / SLA)"],
          rows: [
            {
              rowNumber: 8,
              cells: {
                "A (ID)": "INF-01",
                "B (Servicio Cloud)": "Edge Functions & AI Runtime",
                "C (Costo Mensual)": "$680.00",
                "D (Región / SLA)": "Global · 99.9%",
              },
            },
            {
              rowNumber: 9,
              cells: {
                "A (ID)": "INF-02",
                "B (Servicio Cloud)": "Storage Buckets Privados (RLS)",
                "C (Costo Mensual)": "$410.00",
                "D (Región / SLA)": "us-east-1 · AES256",
              },
            },
            {
              rowNumber: 10,
              isHighlighted: true,
              cells: {
                "A (ID)": "INF-03",
                "B (Servicio Cloud)": "Cluster Supabase Pro + pgvector HNSW",
                "C (Costo Mensual)": "$3,420.00",
                "D (Región / SLA)": "us-east-1 · Multi-AZ",
              },
            },
            {
              rowNumber: 11,
              cells: {
                "A (ID)": "TOTAL",
                "B (Servicio Cloud)": "Total Infraestructura Mensual",
                "C (Costo Mensual)": "$4,510.00",
                "D (Región / SLA)": "Auditado SOC2",
              },
            },
          ],
        },
      },
      {
        citationIndex: 3,
        chunkId: "vec_doc_sec_45",
        documentId: "doc_devsecops",
        documentTitle: "Politica_DevSecOps_Aislamiento_V4.pdf",
        collectionId: "document",
        similarity: 0.89,
        embeddingDimensions: 384,
        content:
          "45.1 Mecánica de Compilación: Las variables con prefijo público se incrustan como texto plano en el bundle. Queda estrictamente prohibido incluir SUPABASE_SERVICE_ROLE_KEY o llaves de pasarelas en el cliente web. Toda generación de embeddings y cálculo transaccional se ejecuta en Edge Functions bajo entorno seguro Deno.",
        highlightedExcerpt:
          "Queda estrictamente prohibido incluir SUPABASE_SERVICE_ROLE_KEY o llaves de pasarelas en el cliente web",
        locator: {
          kind: "document",
          sectionTitle: "45.1 Matriz de Credenciales y Compilación",
          page: 12,
          paragraph: 1,
          version: "Estándar v4.0",
        },
      },
    ],
  },
];

const INITIAL_COLLECTIONS: KnowledgeCollection[] = [
  { id: "all", name: "Todas las fuentes", documentCount: 148, vectorCount: 4820 },
  { id: "legal", name: "Normativa y Leyes", documentCount: 64, vectorCount: 2310 },
  { id: "spreadsheet", name: "Matrices Excel / CSV", documentCount: 32, vectorCount: 1490 },
  { id: "document", name: "Manuales y Contratos", documentCount: 52, vectorCount: 1020 },
];

/* ============================================================================
 * 4. PALETAS DE TEMAS WHITE-LABEL (§13.2 y §40)
 * ============================================================================ */
const THEME_CONFIG: Record<
  RagThemeId,
  {
    name: string;
    subtitle: string;
    bgPage: string;
    bgSurface: string;
    bgSubtle: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderDefault: string;
    actionPrimary: string;
    accentCitation: string;
    accentCitationBg: string;
    highlightMatch: string;
  }
> = {
  "rag-neutral": {
    name: "Corporativo Minimal",
    subtitle: "Zinc & Azul Técnico",
    bgPage: "#FAFAFA",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F4F4F5",
    textPrimary: "#09090B",
    textSecondary: "#52525B",
    textMuted: "#A1A1AA",
    borderDefault: "#E4E4E7",
    actionPrimary: "#18181B",
    accentCitation: "#2563EB",
    accentCitationBg: "#EFF6FF",
    highlightMatch: "#FEF08A",
  },
  "rag-legal": {
    name: "Legal / Normativo",
    subtitle: "Papel Cálido & Bronce",
    bgPage: "#FBFBF7",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F3F2EC",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    borderDefault: "#E2E0D8",
    actionPrimary: "#1E293B",
    accentCitation: "#B45309",
    accentCitationBg: "#FEF3C7",
    highlightMatch: "#FDE68A",
  },
  "rag-finance": {
    name: "Finanzas / Excel",
    subtitle: "Pizarra & Esmeralda",
    bgPage: "#F8FAFC",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F1F5F9",
    textPrimary: "#09090B",
    textSecondary: "#334155",
    textMuted: "#94A3B8",
    borderDefault: "#E2E8F0",
    actionPrimary: "#0F172A",
    accentCitation: "#059669",
    accentCitationBg: "#ECFDF5",
    highlightMatch: "#A7F3D0",
  },
};

/* ============================================================================
 * 5. COMPONENTE: INSPECTOR POLIMÓRFICO DE EVIDENCIA (Leyes / Excel / PDF)
 * ============================================================================ */
function SourceInspectorPanel({
  activeMatch,
  onClose,
  palette,
}: {
  activeMatch: RagChunkMatch | null;
  onClose: () => void;
  palette: (typeof THEME_CONFIG)["rag-neutral"];
}) {
  const [copied, setCopied] = useState(false);

  if (!activeMatch) {
    return (
      <aside
        style={{
          backgroundColor: palette.bgSurface,
          borderColor: palette.borderDefault,
        }}
        className="hidden xl:flex w-[400px] shrink-0 flex-col justify-center items-center border-l p-8 text-center"
      >
        <div
          style={{ backgroundColor: palette.bgSubtle, color: palette.textMuted }}
          className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
        >
          <HubIcon icon={Cpu} size={18} />
        </div>
        <p style={{ color: palette.textPrimary }} className="text-sm font-medium">
          Inspector Polimórfico de Fuentes
        </p>
        <p
          style={{ color: palette.textSecondary }}
          className="text-xs mt-1 max-w-xs leading-relaxed"
        >
          Haz clic en cualquier cita{" "}
          <span
            style={{ color: palette.accentCitation }}
            className="font-mono font-semibold"
          >
            [1]
          </span>{" "}
          para inspeccionar el artículo de ley o la grilla de Excel original.
        </p>
      </aside>
    );
  }

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(
      `[${activeMatch.citationIndex}] ${activeMatch.documentTitle}: "${activeMatch.highlightedExcerpt}"`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const { locator } = activeMatch;

  return (
    <aside
      aria-label="Inspector de documento fuente"
      style={{
        backgroundColor: palette.bgSurface,
        borderColor: palette.borderDefault,
      }}
      className="w-full xl:w-[430px] shrink-0 border-l flex flex-col h-full overflow-hidden"
    >
      {/* Cabecera del Inspector */}
      <div
        style={{ borderColor: palette.borderDefault }}
        className="h-12 px-4 border-b flex items-center justify-between gap-2 shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            style={{
              backgroundColor: palette.accentCitationBg,
              color: palette.accentCitation,
            }}
            className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded"
          >
            [{activeMatch.citationIndex}]
          </span>
          <span
            style={{ color: palette.textPrimary }}
            className="text-xs font-semibold truncate"
          >
            {activeMatch.documentTitle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyCitation}
            style={{ color: palette.textSecondary }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <HubIcon icon={copied ? Check : Copy} size={14} />
            <span>{copied ? "Copiado" : "Cita"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ color: palette.textSecondary }}
            className="p-1 rounded hover:bg-zinc-100 cursor-pointer"
            aria-label="Cerrar inspector"
          >
            <HubIcon icon={PanelRightClose} size={16} />
          </button>
        </div>
      </div>

      {/* Telemetría Vectorial en Supabase pgvector */}
      <div
        style={{
          backgroundColor: palette.bgSubtle,
          borderColor: palette.borderDefault,
          color: palette.textSecondary,
        }}
        className="px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono tabular-nums shrink-0"
      >
        <span className="flex items-center gap-1.5 truncate">
          <HubIcon icon={Cpu} size={14} />
          <span>
            {activeMatch.chunkId} · {activeMatch.embeddingDimensions}d
          </span>
        </span>
        <span
          style={{
            backgroundColor: palette.bgSurface,
            borderColor: palette.borderDefault,
            color: palette.textPrimary,
          }}
          className="px-1.5 py-0.5 rounded border font-semibold shrink-0"
        >
          Similitud: {(activeMatch.similarity * 100).toFixed(1)}%
        </span>
      </div>

      {/* Contenido Dinámico según Tipo de Fuente */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {/* 1. VISOR DE LEYES Y NORMATIVA */}
        {locator.kind === "legal" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                style={{
                  backgroundColor: palette.accentCitationBg,
                  color: palette.accentCitation,
                }}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium"
              >
                <HubIcon icon={Scale} size={14} />
                {locator.jurisdiction}
              </span>
              <span
                style={{ color: palette.textMuted }}
                className="font-mono text-[11px]"
              >
                Pág. {locator.page}
              </span>
            </div>

            {/* Jerarquía de la norma */}
            <div
              style={{ color: palette.textSecondary }}
              className="flex flex-wrap items-center gap-1 text-[11px] font-mono"
            >
              <span className="font-semibold">{locator.lawNumber}</span>
              {locator.hierarchy.map((level) => (
                <span key={level} className="inline-flex items-center gap-1">
                  <HubIcon icon={ChevronRight} size={14} />
                  <span>{level}</span>
                </span>
              ))}
            </div>

            {/* Extracto Editorial con Serif */}
            <div
              style={{
                backgroundColor: palette.bgPage,
                borderColor: palette.borderDefault,
              }}
              className="p-4 rounded-md border space-y-3"
            >
              <div
                style={{ borderColor: palette.borderDefault }}
                className="flex items-center justify-between border-b pb-2"
              >
                <span
                  style={{ color: palette.textPrimary }}
                  className="font-mono text-xs font-bold"
                >
                  {locator.article}
                </span>
                <span
                  style={{ color: palette.textMuted }}
                  className="font-mono text-[11px]"
                >
                  Publ. {locator.officialGazetteDate}
                </span>
              </div>

              <p
                style={{
                  color: palette.textPrimary,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
                className="text-[14px] leading-relaxed"
              >
                {activeMatch.content
                  .split(activeMatch.highlightedExcerpt)
                  .map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark
                          style={{
                            backgroundColor: palette.highlightMatch,
                            color: palette.textPrimary,
                          }}
                          className="px-1 rounded font-medium"
                        >
                          {activeMatch.highlightedExcerpt}
                        </mark>
                      )}
                    </React.Fragment>
                  ))}
              </p>
            </div>
          </div>
        )}

        {/* 2. VISOR NATIVO DE EXCEL / HOJA DE CÁLCULO */}
        {locator.kind === "spreadsheet" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span
                style={{ color: palette.textPrimary }}
                className="inline-flex items-center gap-1.5 font-medium"
              >
                <HubIcon
                  icon={FileSpreadsheet}
                  size={16}
                  className="text-emerald-600"
                />
                Hoja:{" "}
                <code
                  style={{ backgroundColor: palette.bgSubtle }}
                  className="font-mono px-1.5 py-0.5 rounded"
                >
                  {locator.sheetName}
                </code>
              </span>
              <span
                style={{ color: palette.textSecondary }}
                className="font-mono text-[11px]"
              >
                Rango: {locator.cellRange}
              </span>
            </div>

            {/* Barra de Fórmulas fx */}
            {locator.formula && (
              <div
                style={{
                  backgroundColor: palette.bgSubtle,
                  borderColor: palette.borderDefault,
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-xs"
              >
                <span
                  style={{ color: palette.accentCitation }}
                  className="font-bold"
                >
                  {locator.activeCell}
                </span>
                <span style={{ color: palette.textMuted }}>|</span>
                <span
                  style={{ color: palette.textSecondary }}
                  className="italic font-serif font-semibold"
                >
                  fx
                </span>
                <code
                  style={{ color: palette.textPrimary }}
                  className="truncate text-[11px]"
                >
                  {locator.formula}
                </code>
              </div>
            )}

            {/* Grilla de Celdas Excel */}
            <div
              style={{ borderColor: palette.borderDefault }}
              className="overflow-x-auto rounded-md border"
            >
              <table className="w-full text-left border-collapse font-mono text-[11px] tabular-nums">
                <thead>
                  <tr
                    style={{
                      backgroundColor: palette.bgSubtle,
                      borderColor: palette.borderDefault,
                      color: palette.textSecondary,
                    }}
                    className="border-b"
                  >
                    <th
                      style={{ borderColor: palette.borderDefault }}
                      className="py-1.5 px-2 border-r w-8 text-center"
                    >
                      #
                    </th>
                    {locator.columns.map((col) => (
                      <th
                        key={col}
                        style={{ borderColor: palette.borderDefault }}
                        className="py-1.5 px-2.5 border-r last:border-r-0 font-semibold whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {locator.rows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      style={{
                        backgroundColor: row.isHighlighted
                          ? palette.highlightMatch
                          : palette.bgSurface,
                        color: row.isHighlighted
                          ? palette.textPrimary
                          : palette.textSecondary,
                        borderColor: palette.borderDefault,
                      }}
                      className={`border-b last:border-b-0 ${
                        row.isHighlighted ? "font-bold" : ""
                      }`}
                    >
                      <td
                        style={{
                          borderColor: palette.borderDefault,
                          color: palette.textMuted,
                        }}
                        className="py-1.5 px-2 border-r text-center"
                      >
                        {row.rowNumber}
                      </td>
                      {locator.columns.map((col) => (
                        <td
                          key={col}
                          style={{ borderColor: palette.borderDefault }}
                          className="py-1.5 px-2.5 border-r last:border-r-0 whitespace-nowrap"
                        >
                          {row.cells[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. VISOR DE DOCUMENTOS / MANUALES PDF */}
        {locator.kind === "document" && (
          <div className="space-y-3">
            <div
              style={{ color: palette.textSecondary }}
              className="flex items-center justify-between text-xs font-mono"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <HubIcon icon={FileText} size={14} />
                {locator.sectionTitle}
              </span>
              <span>
                Pág. {locator.page} · ¶ {locator.paragraph}
              </span>
            </div>

            <div
              style={{
                backgroundColor: palette.bgPage,
                borderColor: palette.borderDefault,
                color: palette.textPrimary,
              }}
              className="p-4 rounded-md border text-sm leading-relaxed space-y-2"
            >
              <div
                style={{ color: palette.textMuted }}
                className="text-[11px] font-mono uppercase"
              >
                {locator.version}
              </div>
              <p>
                {activeMatch.content
                  .split(activeMatch.highlightedExcerpt)
                  .map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark
                          style={{
                            backgroundColor: palette.highlightMatch,
                            color: palette.textPrimary,
                          }}
                          className="px-1 rounded font-medium"
                        >
                          {activeMatch.highlightedExcerpt}
                        </mark>
                      )}
                    </React.Fragment>
                  ))}
              </p>
            </div>
          </div>
        )}

        {/* Metadatos del Vector */}
        <div
          style={{
            backgroundColor: palette.bgSubtle,
            borderColor: palette.borderDefault,
          }}
          className="p-3 rounded border space-y-1.5 font-mono text-[11px]"
        >
          <div
            style={{ color: palette.textPrimary }}
            className="font-semibold flex items-center justify-between"
          >
            <span>Traza Supabase Vector</span>
            <span className="text-emerald-600">RLS Verificado</span>
          </div>
          <div
            style={{ color: palette.textSecondary }}
            className="flex justify-between"
          >
            <span>Modelo Embedding:</span>
            <span>Supabase.ai / gte-small</span>
          </div>
          <div
            style={{ color: palette.textSecondary }}
            className="flex justify-between"
          >
            <span>Índice PG:</span>
            <span>HNSW (vector_ip_ops)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================================
 * 6. APLICACIÓN PRINCIPAL (RAG WORKSPACE)
 * ============================================================================ */
export default function App() {
  const [theme, setTheme] = useState<RagThemeId>("rag-neutral");
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    SCENARIOS[0].id
  );
  const [selectedCollection, setSelectedCollection] =
    useState<SourceCategory>("all");
  const [minSimilarity, setMinSimilarity] = useState<number>(0.75);
  const [query, setQuery] = useState<string>(SCENARIOS[0].query);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [showVectorTrace, setShowVectorTrace] = useState<boolean>(true);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);

  const currentScenario =
    SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0];

  // Filtrado real por colección y umbral de similitud de coseno
  const filteredMatches = currentScenario.matches.filter((m) => {
    const byCol =
      selectedCollection === "all" || m.collectionId === selectedCollection;
    const bySim = m.similarity >= minSimilarity;
    return byCol && bySim;
  });

  const [activeMatch, setActiveMatch] = useState<RagChunkMatch | null>(
    currentScenario.matches[0] ?? null
  );

  const palette = THEME_CONFIG[theme];

  useEffect(() => {
    setActiveMatch(filteredMatches[0] ?? null);
  }, [activeScenarioId, selectedCollection, minSimilarity]);

  function handleSelectScenario(scenario: RagScenario) {
    setIsSearching(true);
    setActiveScenarioId(scenario.id);
    setQuery(scenario.query);
    setTimeout(() => {
      setIsSearching(false);
    }, 180);
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 200);
  }

  function handleSimulatedUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadNotice(null);
    setTimeout(() => {
      const chunks = file.name.endsWith(".xlsx") ? 42 : 19;
      setUploadNotice(
        `✓ "${file.name}" fragmentado y vectorizado en pgvector (${chunks} chunks · 384d)`
      );
      setIsUploading(false);
      e.target.value = "";
    }, 550);
  }

  return (
    <div
      style={{
        backgroundColor: palette.bgPage,
        color: palette.textPrimary,
      }}
      className="h-screen w-full overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200"
    >
      {/* HEADER SUPERIOR MINIMALISTA (48px) */}
      <header
        style={{
          backgroundColor: palette.bgSurface,
          borderColor: palette.borderDefault,
        }}
        className="h-12 shrink-0 border-b px-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ backgroundColor: palette.actionPrimary }}
            className="w-6 h-6 rounded flex items-center justify-center text-white font-mono text-xs font-bold shrink-0"
          >
            V
          </div>
          <span className="text-sm font-semibold tracking-tight truncate">
            Vectoria RAG
          </span>
          <span
            style={{
              backgroundColor: palette.bgSubtle,
              borderColor: palette.borderDefault,
              color: palette.textSecondary,
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Supabase pgvector · gte-small (384d)
          </span>
        </div>

        {/* Controles Derecha: Conmutador White-Label + Botón Arquitectura SQL */}
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: palette.bgSubtle,
              borderColor: palette.borderDefault,
            }}
            className="inline-flex rounded border p-0.5 text-xs"
          >
            {(
              [
                { id: "rag-neutral", label: "Corporativo" },
                { id: "rag-legal", label: "Legal / Leyes" },
                { id: "rag-finance", label: "Finanzas / Excel" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                style={{
                  backgroundColor:
                    theme === item.id ? palette.bgSurface : "transparent",
                  color:
                    theme === item.id
                      ? palette.textPrimary
                      : palette.textSecondary,
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  theme === item.id ? "shadow-xs font-semibold" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            style={{
              borderColor: palette.borderDefault,
              backgroundColor: palette.bgSurface,
              color: palette.textPrimary,
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono hover:opacity-80 transition-opacity cursor-pointer"
          >
            <HubIcon icon={Code2} size={14} />
            <span className="hidden md:inline">SQL & Edge Function</span>
          </button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL DE 3 PANELES */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: SIDEBAR DE COLECCIONES Y UMBRAL VECTORIAL */}
        <aside
          style={{
            backgroundColor: palette.bgSurface,
            borderColor: palette.borderDefault,
          }}
          className="hidden md:flex w-64 shrink-0 border-r flex-col justify-between p-3 overflow-y-auto"
        >
          <div className="space-y-5">
            {/* Colecciones Documentales */}
            <div>
              <div className="px-2 pb-2 flex items-center justify-between">
                <span
                  style={{ color: palette.textMuted }}
                  className="text-[11px] font-mono uppercase tracking-wider"
                >
                  Colecciones Vectoriales
                </span>
                <HubIcon
                  icon={Database}
                  size={14}
                  className="text-zinc-400"
                />
              </div>

              <nav className="space-y-0.5" aria-label="Colecciones">
                {INITIAL_COLLECTIONS.map((col) => {
                  const isActive = selectedCollection === col.id;
                  const icon =
                    col.id === "legal"
                      ? Scale
                      : col.id === "spreadsheet"
                      ? FileSpreadsheet
                      : col.id === "document"
                      ? FileText
                      : Layers;

                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedCollection(col.id)}
                      style={{
                        backgroundColor: isActive
                          ? palette.bgSubtle
                          : "transparent",
                        color: isActive
                          ? palette.textPrimary
                          : palette.textSecondary,
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors cursor-pointer ${
                        isActive ? "font-semibold" : "hover:opacity-80"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <HubIcon icon={icon} size={16} />
                        <span className="truncate">{col.name}</span>
                      </span>
                      <span
                        style={{ color: palette.textMuted }}
                        className="font-mono text-[10px] tabular-nums"
                      >
                        {col.vectorCount}v
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Control de Similitud de Coseno (pgvector threshold) */}
            <div
              style={{
                backgroundColor: palette.bgPage,
                borderColor: palette.borderDefault,
              }}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <HubIcon icon={SlidersHorizontal} size={14} />
                  <span>Umbral Coseno</span>
                </span>
                <span
                  style={{ color: palette.accentCitation }}
                  className="font-mono text-[11px] font-bold tabular-nums"
                >
                  &ge; {minSimilarity.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min={0.7}
                max={0.94}
                step={0.01}
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                className="w-full accent-zinc-900 cursor-pointer"
                aria-label="Umbral mínimo de similitud"
              />

              <p
                style={{ color: palette.textSecondary }}
                className="text-[11px] leading-tight"
              >
                {minSimilarity >= 0.9
                  ? "Estricto (>0.90): Solo coincidencias literales de alta precisión."
                  : "Híbrido: Combina similitud vectorial + búsqueda exacta de celdas/artículos."}
              </p>
            </div>

            {/* Casos de Uso Pre-cargados */}
            <div>
              <div className="px-2 pb-1.5">
                <span
                  style={{ color: palette.textMuted }}
                  className="text-[11px] font-mono uppercase tracking-wider"
                >
                  Escenarios Multi-Proyecto
                </span>
              </div>
              <div className="space-y-1.5">
                {SCENARIOS.map((sc) => {
                  const active = sc.id === activeScenarioId;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(sc)}
                      style={{
                        borderColor: active
                          ? palette.textPrimary
                          : palette.borderDefault,
                        backgroundColor: active
                          ? palette.bgSubtle
                          : palette.bgSurface,
                      }}
                      className="w-full text-left p-2.5 rounded border transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700 font-semibold">
                          {sc.badge}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-snug">
                        {sc.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ingesta Directa hacia Supabase Storage + Embeddings */}
          <div
            style={{ borderColor: palette.borderDefault }}
            className="space-y-2 pt-3 border-t"
          >
            <label
              style={{
                backgroundColor: palette.bgPage,
                borderColor: palette.borderDefault,
              }}
              className="flex flex-col items-center justify-center p-3 rounded-md border border-dashed hover:border-zinc-500 cursor-pointer transition-colors text-center"
            >
              <HubIcon
                icon={UploadCloud}
                size={18}
                className="mb-1 opacity-70"
              />
              <span className="text-xs font-medium">
                {isUploading
                  ? "Generando vectores (384d)..."
                  : "Indexar Ley / Excel / PDF"}
              </span>
              <span
                style={{ color: palette.textMuted }}
                className="text-[10px] font-mono mt-0.5"
              >
                Edge Function &rarr; Supabase.ai
              </span>
              <input
                type="file"
                accept=".pdf,.xlsx,.csv,.docx"
                onChange={handleSimulatedUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>

            {uploadNotice && (
              <p className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded leading-snug">
                {uploadNotice}
              </p>
            )}

            <div
              style={{ color: palette.textMuted }}
              className="flex items-center justify-between px-1 text-[10px] font-mono"
            >
              <span className="flex items-center gap-1">
                <HubIcon icon={ShieldCheck} size={14} />
                RLS por Tenant
              </span>
              <span>HNSW Cosine</span>
            </div>
          </div>
        </aside>

        {/* PANEL 2: LIENZO CENTRAL DE CONSULTA Y SÍNTESIS */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-3xl w-full mx-auto space-y-5 flex-1">
            {/* OMNIBAR MINIMALISTA */}
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <div
                style={{
                  backgroundColor: palette.bgSurface,
                  borderColor: palette.borderDefault,
                }}
                className="rounded-lg border shadow-2xs focus-within:ring-1 focus-within:ring-zinc-900 transition-all"
              >
                <div className="flex items-center px-3.5 py-2.5 gap-3">
                  <HubIcon
                    icon={Search}
                    size={18}
                    className="opacity-50"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca artículos de ley, celdas de Excel o cláusulas..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    style={{ backgroundColor: palette.actionPrimary }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0 cursor-pointer"
                  >
                    <span>{isSearching ? "Buscando..." : "Consultar"}</span>
                    <HubIcon icon={CornerDownLeft} size={14} />
                  </button>
                </div>

                {/* Barra de Metadatos de Consulta */}
                <div
                  style={{
                    backgroundColor: palette.bgSubtle,
                    borderColor: palette.borderDefault,
                    color: palette.textSecondary,
                  }}
                  className="px-3.5 py-1.5 border-t rounded-b-lg flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span>Filtro activo:</span>
                    <span
                      style={{
                        backgroundColor: palette.bgSurface,
                        borderColor: palette.borderDefault,
                        color: palette.textPrimary,
                      }}
                      className="px-1.5 py-0.5 rounded border font-semibold"
                    >
                      @{selectedCollection}
                    </span>
                    <span className="hidden sm:inline opacity-75">
                      · Hybrid RPC (Vector + Full-Text)
                    </span>
                  </div>
                  <span>
                    Similitud mín: &ge;{minSimilarity.toFixed(2)}
                  </span>
                </div>
              </div>
            </form>

            {/* TRAZA DE RECUPERACIÓN VECTORIAL */}
            <div
              style={{
                backgroundColor: palette.bgSurface,
                borderColor: palette.borderDefault,
              }}
              className="rounded-md border overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setShowVectorTrace((prev) => !prev)}
                style={{ color: palette.textSecondary }}
                className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-mono hover:opacity-80 transition-opacity cursor-pointer tabular-nums"
              >
                <span className="flex items-center gap-2">
                  <HubIcon
                    icon={CheckCircle2}
                    size={14}
                    className="text-emerald-600"
                  />
                  <span>
                    {filteredMatches.length} vectores recuperados ·{" "}
                    {currentScenario.latencyMs}ms · Supabase.ai/gte-small (384d)
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <span>{showVectorTrace ? "Ocultar traza" : "Ver traza"}</span>
                  <HubIcon icon={ChevronDown} size={14} />
                </span>
              </button>

              {showVectorTrace && (
                <div
                  style={{
                    backgroundColor: palette.bgPage,
                    borderColor: palette.borderDefault,
                  }}
                  className="px-3.5 py-2.5 border-t space-y-1.5 font-mono text-[11px] tabular-nums"
                >
                  {filteredMatches.map((m) => (
                    <div
                      key={m.chunkId}
                      onClick={() => setActiveMatch(m)}
                      className="flex items-center justify-between gap-2 py-0.5 cursor-pointer hover:underline"
                    >
                      <span className="truncate">
                        [{m.citationIndex}] {m.documentTitle} ({m.chunkId})
                      </span>
                      <span
                        style={{ color: palette.accentCitation }}
                        className="font-bold shrink-0"
                      >
                        cosine: {m.similarity.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RESPUESTA SINTETIZADA CON CITAS CLICABLES */}
            <article
              style={{
                backgroundColor: palette.bgSurface,
                borderColor: palette.borderDefault,
              }}
              className="p-6 rounded-md border space-y-5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div
                  style={{ color: palette.textMuted }}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider"
                >
                  <HubIcon
                    icon={Sparkles}
                    size={14}
                    className="text-amber-600"
                  />
                  <span>Síntesis con trazabilidad documental</span>
                </div>
                <span
                  style={{ color: palette.textMuted }}
                  className="text-[11px] font-mono"
                >
                  Haz clic en [1], [2], [3] para cambiar el visor &rarr;
                </span>
              </div>

              <p className="text-[15px] leading-7">
                {currentScenario.summarySegments.map((segment, idx) => (
                  <React.Fragment key={idx}>
                    {segment.text}
                    {segment.citations?.map((citNum) => {
                      const matchObj = currentScenario.matches.find(
                        (m) => m.citationIndex === citNum
                      );
                      const isSelected =
                        activeMatch?.citationIndex === citNum;
                      return (
                        <button
                          key={citNum}
                          type="button"
                          onClick={() => matchObj && setActiveMatch(matchObj)}
                          style={{
                            backgroundColor: isSelected
                              ? palette.accentCitation
                              : palette.accentCitationBg,
                            color: isSelected
                              ? "#FFFFFF"
                              : palette.accentCitation,
                          }}
                          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded font-mono text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                          title={
                            matchObj
                              ? `Inspeccionar fuente: ${matchObj.documentTitle}`
                              : undefined
                          }
                        >
                          [{citNum}]
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </p>

              {/* TABLA DE CRUCE MULTIDOCUMENTO */}
              <div className="pt-2">
                <div
                  style={{ borderColor: palette.borderDefault }}
                  className="overflow-x-auto rounded border"
                >
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: palette.bgSubtle,
                          borderColor: palette.borderDefault,
                          color: palette.textSecondary,
                        }}
                        className="border-b font-mono"
                      >
                        {currentScenario.structuredComparison.headers.map(
                          (h) => (
                            <th key={h} className="py-2 px-3 font-semibold">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentScenario.structuredComparison.rows.map(
                        (row, rIdx) => {
                          const rowMatch = currentScenario.matches[rIdx];
                          const isRowSelected =
                            activeMatch?.chunkId === rowMatch?.chunkId;
                          return (
                            <tr
                              key={rIdx}
                              onClick={() =>
                                rowMatch && setActiveMatch(rowMatch)
                              }
                              style={{
                                borderColor: palette.borderDefault,
                                backgroundColor: isRowSelected
                                  ? palette.bgSubtle
                                  : "transparent",
                              }}
                              className="border-b last:border-b-0 cursor-pointer hover:opacity-80 transition-colors"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-3 ${
                                    cIdx === 1 || cIdx === 3
                                      ? "font-mono tabular-nums"
                                      : ""
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* TARJETAS DE FRAGMENTOS RECUPERADOS */}
            <section className="space-y-2.5 pb-8">
              <h2
                style={{ color: palette.textMuted }}
                className="text-xs font-mono uppercase tracking-wider"
              >
                Fragmentos Primarios Indexados ({filteredMatches.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filteredMatches.map((match) => {
                  const isSelected = activeMatch?.chunkId === match.chunkId;
                  const icon =
                    match.locator.kind === "legal"
                      ? Scale
                      : match.locator.kind === "spreadsheet"
                      ? FileSpreadsheet
                      : FileText;

                  return (
                    <button
                      key={match.chunkId}
                      type="button"
                      onClick={() => setActiveMatch(match)}
                      style={{
                        backgroundColor: palette.bgSurface,
                        borderColor: isSelected
                          ? palette.textPrimary
                          : palette.borderDefault,
                      }}
                      className={`text-left p-3.5 rounded-md border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        isSelected ? "ring-1 ring-zinc-900/20 shadow-xs" : ""
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            style={{
                              backgroundColor: palette.accentCitationBg,
                              color: palette.accentCitation,
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold"
                          >
                            [{match.citationIndex}]
                          </span>
                          <span
                            style={{ color: palette.textMuted }}
                            className="font-mono text-[11px] tabular-nums"
                          >
                            {(match.similarity * 100).toFixed(0)}% match
                          </span>
                        </div>

                        <p className="text-xs font-semibold line-clamp-1">
                          {match.documentTitle}
                        </p>
                        <p
                          style={{ color: palette.textSecondary }}
                          className="text-xs line-clamp-2 leading-relaxed"
                        >
                          {match.highlightedExcerpt}
                        </p>
                      </div>

                      <div
                        style={{
                          borderColor: palette.borderDefault,
                          color: palette.textMuted,
                        }}
                        className="pt-2 border-t flex items-center gap-1.5 text-[11px] font-mono truncate"
                      >
                        <HubIcon icon={icon} size={14} />
                        <span className="truncate">
                          {match.locator.kind === "legal"
                            ? match.locator.article
                            : match.locator.kind === "spreadsheet"
                            ? `${match.locator.sheetName}!${match.locator.cellRange}`
                            : `Pág. ${match.locator.page}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </main>

        {/* PANEL 3: INSPECTOR POLIMÓRFICO DE DOCUMENTOS */}
        <SourceInspectorPanel
          activeMatch={activeMatch}
          onClose={() => setActiveMatch(null)}
          palette={palette}
        />
      </div>

      {/* MODAL DE ARQUITECTURA SUPABASE PGVECTOR + EDGE FUNCTION (§21 y §45) */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            style={{
              backgroundColor: palette.bgSurface,
              borderColor: palette.borderDefault,
            }}
            className="max-w-3xl w-full max-h-[85vh] rounded-lg border shadow-xl flex flex-col overflow-hidden"
          >
            <div
              style={{ borderColor: palette.borderDefault }}
              className="px-5 py-3.5 border-b flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <HubIcon icon={Database} size={18} />
                <h3 className="text-sm font-semibold">
                  Arquitectura Supabase pgvector + Edge Function (Estándar v4.0)
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

            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <p className="font-sans text-xs font-semibold text-zinc-700">
                  1. Migración SQL (`pgvector` + HNSW + RLS por Tenant §45.2)
                </p>
                <pre className="p-3 rounded bg-zinc-950 text-zinc-100 overflow-x-auto leading-relaxed">
{`create extension if not exists vector with schema extensions;

create table public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  document_id uuid references public.rag_documents(id) on delete cascade,
  content text not null,
  locator_metadata jsonb not null default '{}'::jsonb, -- Artículos o Celdas Excel
  embedding extensions.vector(384) not null
);

alter table public.rag_chunks enable row level security;

create policy "Aislamiento estricto por tenant"
  on public.rag_chunks for select to authenticated
  using (tenant_id = (select auth.jwt() ->> 'tenant_id')::uuid);`}
                </pre>
              </div>

              <div className="space-y-1.5">
                <p className="font-sans text-xs font-semibold text-zinc-700">
                  2. Supabase Edge Function (`supabase/functions/rag-search/index.ts`)
                </p>
                <pre className="p-3 rounded bg-zinc-950 text-zinc-100 overflow-x-auto leading-relaxed">
{`const session = new Supabase.ai.Session('gte-small');

Deno.serve(async (req) => {
  const { query, collection, matchThreshold = 0.75 } = await req.json();

  // Genera embedding 384d nativo en Supabase sin exponer API keys en frontend
  const queryEmbedding = await session.run(query, {
    mean_pool: true,
    normalize: true,
  });

  const { data } = await supabase.rpc('match_rag_chunks', {
    query_embedding: queryEmbedding,
    query_text: query,
    match_threshold: matchThreshold,
    filter_collection: collection,
  });

  return new Response(JSON.stringify({ matches: data }));
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

