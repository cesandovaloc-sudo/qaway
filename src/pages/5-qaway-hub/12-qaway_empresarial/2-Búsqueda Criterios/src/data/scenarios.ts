/* ============================================================================
 * Escenarios y colecciones mock exactos — Búsqueda de Criterios
 * Extraído verbatim de 'Propuesta de codigo.txt' (Semilla Controlada §46)
 * + Paletas White-Label §13.2 y §40 (sin alteración de valores)
 * ============================================================================ */
import type {
  KnowledgeCollection,
  RagScenario,
  RagThemeConfig,
} from "../types/criterios";

export const SCENARIOS: RagScenario[] = [
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

export const INITIAL_COLLECTIONS: KnowledgeCollection[] = [
  { id: "all", name: "Todas las fuentes", documentCount: 148, vectorCount: 4820 },
  { id: "legal", name: "Normativa y Leyes", documentCount: 64, vectorCount: 2310 },
  { id: "spreadsheet", name: "Matrices Excel / CSV", documentCount: 32, vectorCount: 1490 },
  { id: "document", name: "Manuales y Contratos", documentCount: 52, vectorCount: 1020 },
];

export const THEME_CONFIG: RagThemeConfig = {
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
