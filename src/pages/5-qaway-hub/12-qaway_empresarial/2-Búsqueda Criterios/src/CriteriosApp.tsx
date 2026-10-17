/* ============================================================================
 * CriteriosApp — Arquitectura Canónica v4.0 con Header Global Perenne
 * - Header fijo de extremo a extremo (no se deforma ni se mueve con los paneles)
 * - Temas auténticos Paper & Ink (THEME_CONFIG: bgPage, bgSurface, bgSubtle, etc.)
 * - Panel izquierdo ordenado: Colecciones Vectoriales -> Umbral Coseno -> Escenarios -> Indexar
 * - Inspector polimórfico y Workspace independientes con scroll autónomo
 * - Portabilidad Cloudflare: 100% imports relativos, cero iframes, namespace host-safe.
 * ============================================================================ */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { FormEvent } from "react";
import {
  Search,
  Send,
  Scale,
  FileSpreadsheet,
  FileText,
  Layers,
  History,
  Settings,
  Code2,
  Bookmark,
  Share2,
  Check,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  FolderPlus,
  FolderOpen,
  Upload,
  Plus,
  SlidersHorizontal,
  Filter,
  Clock,
  ArrowRight,
  RefreshCw,
  Download,
  CheckCircle2,
  Cpu,
  Zap,
  Key,
  ShieldCheck,
  MessageSquare,
  MessageSquarePlus,
  Bot,
  Sparkles,
  Trash2,
  Paperclip,
  Mic,
  MicOff,
  X,
  LogOut,
  User,
  Building2,
} from "lucide-react";
import { HubIcon } from "./components/ui/HubIcon";

type RagThemeId = "rag-neutral" | "rag-legal" | "rag-finance";
type InspectorTab = 1 | 2 | 3;

interface ThemePalette {
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

const THEME_CONFIG: Record<RagThemeId, ThemePalette> = {
  "rag-neutral": {
    name: "Corporativo (Neutral)",
    subtitle: "Zinc & Azul Técnico",
    bgPage: "#FAFAFA",
    bgSurface: "#FFFFFF",
    bgSubtle: "#F4F4F5",
    textPrimary: "#09090B",
    textSecondary: "#52525B",
    textMuted: "#A1A1AA",
    borderDefault: "#E4E4E7",
    actionPrimary: "#2563EB",
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
    actionPrimary: "#B45309",
    accentCitation: "#DC2626",
    accentCitationBg: "#FEF2F2",
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
    actionPrimary: "#059669",
    accentCitation: "#059669",
    accentCitationBg: "#ECFDF5",
    highlightMatch: "#A7F3D0",
  },
};

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

interface ProjectWorkspace {
  id: string;
  name: string;
  category: string;
  stats: string;
}

const DEFAULT_PROJECTS: ProjectWorkspace[] = [
  { id: "auditoria-q3", name: "Auditoría Financiera & Laboral", category: "Finanzas & Legal", stats: "3 fuentes • 26,920 vectores" },
  { id: "reglamento-general", name: "Reglamento y Normativa General", category: "Corporativo & Compliance", stats: "8 fuentes • 14,200 vectores" },
  { id: "contratos-2026", name: "Contratos y Proveedores 2026", category: "Operaciones", stats: "12 fuentes • 31,500 vectores" },
];

interface ChatTurn {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  latency?: string;
  scenarioId?: string;
  sourcesCount?: number;
  hasTable?: boolean;
  sources?: { id: number; name: string; section: string; tab: InspectorTab }[];
  tableData?: {
    concept: string;
    sin: string;
    con: string;
    var: string;
    isNegative?: boolean;
  }[];
}

const INITIAL_CHAT_TURNS: ChatTurn[] = [
  {
    id: "turn-1-u",
    sender: "user",
    text: "¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?",
    timestamp: "10:14 AM",
  },
  {
    id: "turn-1-a",
    sender: "assistant",
    text: "El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes [1]. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp [2].",
    timestamp: "10:14 AM",
    latency: "134 ms",
    sourcesCount: 3,
    scenarioId: "auditoria",
    tableData: [
      { concept: "EBITDA (USD)", sin: "2,150,000", con: "2,101,500", var: "-48,500", isNegative: true },
      { concept: "Margen EBITDA", sin: "18.4%", con: "16.1%", var: "-2.3 pp", isNegative: true },
    ],
    sources: [
      { id: 1, name: "D.S. N.º 007-2002-TR", section: "Art. 10 y 11 - Jornada y sobretiempo", tab: 1 },
      { id: 2, name: "Contingencias_Laborales_Q3.xlsx", section: "Hoja: Resumen_Ejecutivo • Celda E14", tab: 2 },
      { id: 3, name: "Manual de Políticas Laborales", section: "Sección 4.2 - Control de asistencia", tab: 3 },
    ],
  },
];

const SESSION_2_TURNS: ChatTurn[] = [
  {
    id: "turn-s2-u",
    sender: "user",
    text: "¿Cuáles son los límites de jornada laboral y sobretiempo según el D.S. N.º 007-2002-TR?",
    timestamp: "Ayer, 4:30 PM",
  },
  {
    id: "turn-s2-a",
    sender: "assistant",
    text: "Conforme a los artículos 9 y 10 del D.S. N.º 007-2002-TR, la jornada ordinaria máxima es de 8 horas diarias o 48 horas semanales. El tiempo trabajado que exceda la jornada diaria o semanal se considera sobretiempo y se abona con un recargo no menor al 25% por las dos primeras horas y 35% para las horas restantes.",
    timestamp: "Ayer, 4:30 PM",
    latency: "112 ms (Anthropic Claude)",
    sourcesCount: 1,
    scenarioId: "normativa",
    sources: [
      { id: 1, name: "D.S. N.º 007-2002-TR", section: "Art. 9 y 10 - Jornada y sobretiempo", tab: 1 },
    ],
  },
];

const SESSION_3_TURNS: ChatTurn[] = [
  {
    id: "turn-s3-u",
    sender: "user",
    text: "¿Qué establece el Manual de Políticas Laborales sección 4.2 sobre el control de asistencia?",
    timestamp: "14 Oct, 11:20 AM",
  },
  {
    id: "turn-s3-a",
    sender: "assistant",
    text: "La Sección 4.2 del Manual de Políticas Laborales v2.1 (pág. 28) dispone que todo registro de sobretiempo debe validarse en el sistema biométrico y contar con aprobación de gerencia. Asimismo, cualquier provisión contingente superior a USD 25,000 requiere dictamen vinculante del Comité de Auditoría antes del día 25 de cada mes.",
    timestamp: "14 Oct, 11:20 AM",
    latency: "118 ms (Cohere AI)",
    sourcesCount: 1,
    scenarioId: "procedimiento",
    sources: [
      { id: 3, name: "Manual de Políticas Laborales", section: "Sección 4.2 - Control de asistencia", tab: 3 },
    ],
  },
];

interface ProjectSourceItem {
  id: string;
  title: string;
  type: "legal" | "excel" | "doc";
  badge: string;
  description: string;
  metaPages: string;
  chunksCount: number;
  statusText: string;
  inspectorTab: InspectorTab;
  projectId: string;
}

const INITIAL_PROJECT_SOURCES: ProjectSourceItem[] = [
  {
    id: "src-1",
    title: "D.S. N.º 007-2002-TR",
    type: "legal",
    badge: "Norma Oficial",
    description: "Texto Único Ordenado de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo.",
    metaPages: "86 páginas",
    chunksCount: 8320,
    statusText: "Indexado",
    inspectorTab: 1,
    projectId: "auditoria-q3",
  },
  {
    id: "src-2",
    title: "Modelo Financiero Q3 2026.xlsx",
    type: "excel",
    badge: "Matriz Excel",
    description: "Proyecciones de ingresos, costos de nómina, provisiones contingentes y cálculo de EBITDA.",
    metaPages: "14 hojas / 1,420 celdas",
    chunksCount: 6120,
    statusText: "Indexado",
    inspectorTab: 2,
    projectId: "auditoria-q3",
  },
  {
    id: "src-3",
    title: "Manual de Políticas Laborales v2.1.pdf",
    type: "doc",
    badge: "Manual Interno",
    description: "Normas internas de registro biométrico, control de horas extras y autorizaciones de gerencia.",
    metaPages: "48 páginas",
    chunksCount: 12480,
    statusText: "Indexado",
    inspectorTab: 3,
    projectId: "auditoria-q3",
  },
];

interface HistoryRecordItem {
  id: string;
  question: string;
  scenario: string;
  tab: InspectorTab;
  date: string;
  latency: string;
  sourcesCount: number;
  similarity: string;
  summary: string;
}

const INITIAL_HISTORY_ITEMS: HistoryRecordItem[] = [
  {
    id: "h1",
    question: "¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?",
    scenario: "auditoria",
    tab: 2,
    date: "Hoy, 13:45",
    latency: "134 ms",
    sourcesCount: 3,
    similarity: "0.95",
    summary: "Contingencia de USD 48,500 reduciendo el margen EBITDA en 2.3 pp por omisión en sistema biométrico.",
  },
  {
    id: "h2",
    question: "¿Qué establece el Art. 9 del D.S. N.º 007-2002-TR sobre la inversión de la carga de la prueba en sobretiempo?",
    scenario: "normativa",
    tab: 1,
    date: "Ayer, 17:15",
    latency: "98 ms",
    sourcesCount: 1,
    similarity: "0.95",
    summary: "La falta de registro biométrico oficial invierte automáticamente la carga de la prueba en favor del trabajador.",
  },
  {
    id: "h3",
    question: "¿Cuál es el EBITDA proyectado en el Modelo Financiero Q3 2026 sin la provisión por horas extras?",
    scenario: "financiero",
    tab: 2,
    date: "14 Oct 2026, 11:20",
    latency: "145 ms",
    sourcesCount: 2,
    similarity: "0.92",
    summary: "El EBITDA sin provisión es USD 2,150,000 (18.4% margen), descendiendo a USD 2,101,500 con ajuste.",
  },
  {
    id: "h4",
    question: "¿Qué nivel de autorización exige la Sección 4.2 del Manual de Políticas Laborales para horas extras?",
    scenario: "procedimiento",
    tab: 3,
    date: "12 Oct 2026, 16:04",
    latency: "112 ms",
    sourcesCount: 1,
    similarity: "0.88",
    summary: "Toda provisión contingente mayor a USD 25,000 requiere dictamen vinculante del comité de auditoría.",
  },
];

interface AiProvider {
  id: string;
  name: string;
  company: string;
  logoColor: string;
  badge: string;
  models: string[];
  selectedModel: string;
  status: "active" | "connected" | "standby";
  latency: number;
  role: "primary_llm" | "embedding" | "reranker" | "standby";
  description: string;
  apiKeyMask: string;
  contextWindow: string;
}

const DEFAULT_PROVIDERS: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    company: "OpenAI Inc.",
    logoColor: "#10A37F",
    badge: "LLM Primario",
    models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "text-embedding-3-small", "text-embedding-3-large"],
    selectedModel: "gpt-4o",
    status: "active",
    latency: 184,
    role: "primary_llm",
    description: "Líder de razonamiento multimodal y generación ejecutiva de alta coherencia sintáctica.",
    apiKeyMask: "sk-proj-••••••••••••••••••••39A2",
    contextWindow: "128k tokens",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    company: "Anthropic PBC",
    logoColor: "#D97706",
    badge: "Razonamiento Legal",
    models: ["claude-3-5-sonnet-20241022", "claude-3-opus", "claude-3-5-haiku"],
    selectedModel: "claude-3-5-sonnet-20241022",
    status: "connected",
    latency: 215,
    role: "standby",
    description: "Benchmark líder en análisis de contratos, normativas densas y reducción de alucinaciones.",
    apiKeyMask: "sk-ant-••••••••••••••••••••88B1",
    contextWindow: "200k tokens",
  },
  {
    id: "google",
    name: "Google DeepMind",
    company: "Google LLC",
    logoColor: "#2563EB",
    badge: "Contexto Masivo",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "text-embedding-004"],
    selectedModel: "gemini-1.5-pro",
    status: "connected",
    latency: 162,
    role: "standby",
    description: "Ventana de contexto masiva de hasta 2 millones de tokens. Ideal para repositorios enteros de leyes.",
    apiKeyMask: "AIzaSy••••••••••••••••••••41Z9",
    contextWindow: "2M tokens",
  },
  {
    id: "cohere",
    name: "Cohere AI",
    company: "Cohere Inc.",
    logoColor: "#7C3AED",
    badge: "Reranker Activo",
    models: ["command-r-plus", "command-r", "embed-multilingual-v3.0", "rerank-v3.5"],
    selectedModel: "rerank-v3.5",
    status: "active",
    latency: 118,
    role: "reranker",
    description: "Especialista número 1 global en embeddings multilingües y Cross-Encoder Reranking de alta precisión.",
    apiKeyMask: "coh-••••••••••••••••••••55X7",
    contextWindow: "128k tokens",
  },
  {
    id: "groq",
    name: "Groq LPU",
    company: "Groq Inc.",
    logoColor: "#EA580C",
    badge: "Ultra Baja Latencia",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    selectedModel: "llama-3.3-70b-versatile",
    status: "connected",
    latency: 42,
    role: "standby",
    description: "Arquitectura LPU con inferencia instantánea a más de 500 tokens/segundo. Latencia de 42 ms.",
    apiKeyMask: "gsk_••••••••••••••••••••90Q3",
    contextWindow: "128k tokens",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    company: "Mistral AI SAS",
    logoColor: "#DC2626",
    badge: "Soberanía Europea",
    models: ["mistral-large-2411", "codestral-2501", "mistral-embed"],
    selectedModel: "mistral-large-2411",
    status: "connected",
    latency: 139,
    role: "standby",
    description: "Modelos abiertos y propietarios con estricta soberanía de datos y rendimiento top en español.",
    apiKeyMask: "mis-••••••••••••••••••••12F4",
    contextWindow: "128k tokens",
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    company: "DeepSeek Inc.",
    logoColor: "#0284C7",
    badge: "Razonamiento R1",
    models: ["deepseek-chat-v3", "deepseek-reasoner-r1"],
    selectedModel: "deepseek-reasoner-r1",
    status: "connected",
    latency: 195,
    role: "standby",
    description: "Cadena de pensamiento explícita (Chain-of-Thought) y resolución analítica de costos ultrabajos.",
    apiKeyMask: "dsk-••••••••••••••••••••73M0",
    contextWindow: "64k tokens",
  },
];

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  messagesCount: number;
  provider: string;
  projectId: string;
  turns: ChatTurn[];
}

const DEFAULT_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Auditoría Financiera & EBITDA Q3",
    date: "Hoy",
    preview: "¿Cuál es la contingencia laboral por horas extras no registradas...",
    messagesCount: 2,
    provider: "OpenAI GPT-4o",
    projectId: "auditoria-q3",
    turns: INITIAL_CHAT_TURNS,
  },
  {
    id: "session-2",
    title: "Cálculo de sobretiempo D.S. 007-2002-TR",
    date: "Ayer",
    preview: "¿Cuáles son los límites de jornada laboral y sobretiempo según el D.S. N.º 007-2002-TR?",
    messagesCount: 2,
    provider: "Anthropic Claude",
    projectId: "auditoria-q3",
    turns: SESSION_2_TURNS,
  },
  {
    id: "session-3",
    title: "Revisión de Cláusulas de Auditoría RRHH",
    date: "14 Oct",
    preview: "¿Qué establece el Manual de Políticas Laborales sección 4.2 sobre el control de asistencia?",
    messagesCount: 2,
    provider: "Cohere AI",
    projectId: "auditoria-q3",
    turns: SESSION_3_TURNS,
  },
];

interface QuickSearchResult {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  tab: InspectorTab;
  snippet: string;
}

const ALL_SEARCHABLE_ITEMS: QuickSearchResult[] = [
  {
    id: "qs-1",
    title: "D.S. N.º 007-2002-TR",
    subtitle: "Artículos 10 y 11 — Sobrecargos de 25% y 35%",
    badge: "Norma Oficial",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    tab: 1,
    snippet: "Regulación de horas extras y trabajo en sobretiempo voluntario.",
  },
  {
    id: "qs-2",
    title: "Contingencias_Laborales_Q3.xlsx",
    subtitle: "Hoja: Resumen_Ejecutivo • Celda E14 & H14",
    badge: "Matriz Excel",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tab: 2,
    snippet: "Impacto en EBITDA ajustado USD 2,101,500 (Provisión USD 48,500).",
  },
  {
    id: "qs-3",
    title: "Manual de Políticas Laborales",
    subtitle: "Sección 4.2 — Control de asistencia y RR.HH.",
    badge: "Manual Interno",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    tab: 3,
    snippet: "Validación de planillas, registro biométrico y comisiones de contingencia.",
  },
  {
    id: "qs-4",
    title: "Ley de Productividad y Competitividad Laboral (D.L. 728)",
    subtitle: "Art. 22 y 29 — Despido arbitrario y horas extras",
    badge: "Ley Laboral",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    tab: 1,
    snippet: "Responsabilidad solidaria y cómputo de beneficios sociales.",
  },
];

export default function CriteriosApp() {
  const [theme, setTheme] = useState<RagThemeId>("rag-neutral");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectWorkspace[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>("auditoria-q3");
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [newProjectCategory, setNewProjectCategory] = useState<string>("Finanzas & Legal");
  const [projectCategories, setProjectCategories] = useState<string[]>([
    "Finanzas & Legal",
    "Corporativo & Compliance",
    "Operaciones",
    "RR.HH. & Laboral",
    "Logística & Distribución",
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>("");
  const [showProjectDropdown, setShowProjectDropdown] = useState<boolean>(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [openProviderModelDropdownId, setOpenProviderModelDropdownId] = useState<string | null>(null);
  const [showEmbeddingDropdown, setShowEmbeddingDropdown] = useState<boolean>(false);

  const [activeScenario, setActiveScenario] = useState<string>("auditoria");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>(2);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false); // Inicialmente colapsado
  const [sidebarWidth, setSidebarWidth] = useState<number>(264);
  const [inspectorWidth, setInspectorWidth] = useState<number>(380);
  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const [isResizingInspector, setIsResizingInspector] = useState<boolean>(false);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>("nuevo");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Estados de feedback inline (sin toasts flotantes intrusivos)
  const [savedTurnIds, setSavedTurnIds] = useState<string[]>([]);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [citationCopied, setCitationCopied] = useState<boolean>(false);
  const [reindexingSourceId, setReindexingSourceId] = useState<string | null>(null);
  const [historyExported, setHistoryExported] = useState<boolean>(false);
  const [engineParamsSaved, setEngineParamsSaved] = useState<boolean>(false);
  const [editingApiKeyId, setEditingApiKeyId] = useState<string | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState<string>("");

  // Fuentes indexadas dinámicas y modal de carga real
  const [projectSources, setProjectSources] = useState<ProjectSourceItem[]>(INITIAL_PROJECT_SOURCES);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Historial dinámico de consultas
  const [historyItems, setHistoryItems] = useState<HistoryRecordItem[]>(INITIAL_HISTORY_ITEMS);

  // Sesiones de Chat (cada sesión guarda sus propios turnos)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(DEFAULT_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [isChatsListOpen, setIsChatsListOpen] = useState<boolean>(true);

  // Capacidades avanzadas del chat
  const [chatMode, setChatMode] = useState<"fast" | "standard" | "deep">("standard");
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [collapseScenariosHeader, setCollapseScenariosHeader] = useState<boolean>(false);
  const [showChatFilterModal, setShowChatFilterModal] = useState<boolean>(false);
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Pestaña activa en Configuración
  const [configTab, setConfigTab] = useState<"providers" | "engine">("providers");

  // Módulo de 7 Proveedores de IA
  const [aiProviders, setAiProviders] = useState<AiProvider[]>(DEFAULT_PROVIDERS);
  const [activeLlmProviderId, setActiveLlmProviderId] = useState<string>("openai");
  const [activeRerankerProviderId, setActiveRerankerProviderId] = useState<string>("cohere");
  const [activeEmbeddingProviderId, setActiveEmbeddingProviderId] = useState<string>("openai");

  // Proveedor LLM activo resuelto con fallback seguro
  const activeLlmProvider =
    aiProviders.find((p) => p.id === activeLlmProviderId) ||
    aiProviders[0] || {
      id: "openai",
      name: "OpenAI GPT-4o",
      selectedModel: "gpt-4o",
      contextWindow: "128k",
      latency: 180,
      apiKeyMask: "sk-proj-••••••••••••••••••••3x9A",
      models: ["gpt-4o", "gpt-4o-mini", "o1-preview"],
    };

  // Sesión activa y mensajes de la sesión activa (nunca hardcodeados entre sesiones)
  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];
  const chatMessages: ChatTurn[] = activeSession ? activeSession.turns : [];

  // Buscador y filtros del Header
  const [headerSearch, setHeaderSearch] = useState<string>("");
  const [showQuickSearch, setShowQuickSearch] = useState<boolean>(false);
  const [filterSourceType, setFilterSourceType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("q3");
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.75);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Estados del módulo de configuración
  const [embeddingModel, setEmbeddingModel] = useState<string>("text-embedding-3-small");
  const [topK, setTopK] = useState<number>(5);
  const [enableReranker, setEnableReranker] = useState<boolean>(true);
  const [hybridSearch, setHybridSearch] = useState<boolean>(true);

  // Estados del módulo de fuentes
  const [sourcesSearch, setSourcesSearch] = useState<string>("");
  const [sourcesFilterType, setSourcesFilterType] = useState<string>("all");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const quickSearchRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const embeddingDropdownRef = useRef<HTMLDivElement>(null);
  const providerModelDropdownRef = useRef<HTMLDivElement>(null);

  const palette = THEME_CONFIG[theme];

  // Escuchar clics fuera y tecla Escape para cerrar menús
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(target)) {
        setShowFilterDropdown(false);
      }
      if (quickSearchRef.current && !quickSearchRef.current.contains(target)) {
        setShowQuickSearch(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(target)) {
        setShowModeDropdown(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(target)) {
        setShowProjectDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setShowCategoryDropdown(false);
      }
      if (embeddingDropdownRef.current && !embeddingDropdownRef.current.contains(target)) {
        setShowEmbeddingDropdown(false);
      }
      if (providerModelDropdownRef.current && !providerModelDropdownRef.current.contains(target)) {
        setOpenProviderModelDropdownId(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowFilterDropdown(false);
        setShowQuickSearch(false);
        setShowModeDropdown(false);
        setShowUploadModal(false);
        setShowNewProjectModal(false);
        setShowProjectDropdown(false);
        setShowCategoryDropdown(false);
        setOpenProviderModelDropdownId(null);
        setShowEmbeddingDropdown(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        const el = document.getElementById("header-rag-search-input");
        if (el) el.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Auto-scroll del hilo de mensajes cuando se envían preguntas o llegan respuestas
  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, isSearching]);

  // Controladores de redimensionamiento de paneles con el mouse
  const startResizingSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const startResizingInspector = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingInspector(true);
  }, []);

  useEffect(() => {
    if (!isResizingSidebar && !isResizingInspector) return;

    function handleMouseMove(e: MouseEvent) {
      if (isResizingSidebar) {
        const newWidth = Math.max(200, Math.min(460, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingInspector) {
        const newWidth = Math.max(280, Math.min(600, window.innerWidth - e.clientX));
        setInspectorWidth(newWidth);
      }
    }

    function handleMouseUp() {
      setIsResizingSidebar(false);
      setIsResizingInspector(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizingSidebar, isResizingInspector]);

  // No-op para compatibilidad interna sin mostrar nunca la caja negra flotante
  function showToastMessage(_msg?: string) {
    // Eliminado intencionalmente el popup flotante negro a solicitud del usuario
  }

  function handleCreateNewSession(customTitle?: string, customProjectId?: string) {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: customTitle || "Nueva conversación",
      preview: "Conversación limpia • Escribe una consulta para comenzar",
      date: "Ahora",
      messagesCount: 0,
      provider: activeLlmProvider.name,
      projectId: customProjectId || activeProjectId,
      turns: [],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setQuery("");
    setActiveNav("nuevo");
  }

  function handleAddCategory() {
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      if (!projectCategories.includes(trimmed)) {
        setProjectCategories((prev) => [...prev, trimmed]);
      }
      setNewProjectCategory(trimmed);
      setIsAddingCategory(false);
      setNewCategoryInput("");
      setShowCategoryDropdown(false);
    }
  }

  function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    const newId = `proj-${Date.now()}`;
    const newProj: ProjectWorkspace = {
      id: newId,
      name: trimmed,
      category: newProjectCategory,
      stats: "0 fuentes • Listo para indexar",
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newId);
    setNewProjectName("");
    setShowNewProjectModal(false);
    setShowCategoryDropdown(false);
    handleCreateNewSession(`Chat: ${trimmed}`, newId);
  }

  function handleResetHome() {
    setActiveNav("nuevo");
    setInspectorOpen(false);
    setShowQuickSearch(false);
    setShowFilterDropdown(false);
    setShowUserMenu(false);
    setHeaderSearch("");
  }

  const currentProjectSources = useMemo(
    () => projectSources.filter((s) => s.projectId === activeProjectId),
    [projectSources, activeProjectId]
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || projects[0],
    [projects, activeProjectId]
  );

  const currentScenarioCards: ScenarioDef[] = useMemo(() => {
    if (activeProjectId === "auditoria-q3") {
      return SCENARIO_CARDS;
    }
    const projName = activeProject?.name || "Proyecto";
    const projCat = activeProject?.category || "General";
    return [
      {
        id: "analisis-integral",
        title: "Análisis Integral",
        subtitle: projCat,
        icon: Layers,
        iconBg: "#EEF2FF",
        iconColor: "#4F46E5",
        query: `Realizar un análisis integral de los criterios y documentación del proyecto ${projName}.`,
      },
      {
        id: "criterios-clave",
        title: "Criterios Clave",
        subtitle: "Normas y Reglas",
        icon: Scale,
        iconBg: "#FEF2F2",
        iconColor: "#DC2626",
        query: `¿Cuáles son los criterios y directivas fundamentales aplicables a ${projName}?`,
      },
      {
        id: "revision-fuentes",
        title: "Revisión de Fuentes",
        subtitle: "Vectores RAG",
        icon: FileText,
        iconBg: "#EFF6FF",
        iconColor: "#2563EB",
        query: `Resumir las fuentes y documentos indexados en el espacio ${projName}.`,
      },
      {
        id: "metricas-impacto",
        title: "Impacto & Resultados",
        subtitle: "Evaluación",
        icon: FileSpreadsheet,
        iconBg: "#ECFDF5",
        iconColor: "#059669",
        query: `¿Cuál es el balance y las contingencias identificadas en ${projName}?`,
      },
    ];
  }, [activeProjectId, activeProject]);

  const currentChatSessions = useMemo(
    () =>
      chatSessions.filter((s) =>
        s.projectId ? s.projectId === activeProjectId : activeProjectId === "auditoria-q3"
      ),
    [chatSessions, activeProjectId]
  );

  const quickSearchResults = headerSearch.trim()
    ? [
        ...ALL_SEARCHABLE_ITEMS,
        ...currentProjectSources
          .filter((ps) => !ALL_SEARCHABLE_ITEMS.some((a) => a.title === ps.title))
          .map((ps) => ({
            id: ps.id,
            title: ps.title,
            subtitle: ps.metaPages,
            badge: ps.badge,
            badgeColor:
              ps.type === "legal"
                ? "bg-red-50 text-red-700 border-red-200"
                : ps.type === "excel"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-700 border-slate-200",
            tab: ps.inspectorTab,
            snippet: ps.description,
          })),
      ].filter(
        (item) =>
          item.title.toLowerCase().includes(headerSearch.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(headerSearch.toLowerCase()) ||
          item.snippet.toLowerCase().includes(headerSearch.toLowerCase())
      )
    : [];

  function handleSelectQuickResult(result: QuickSearchResult) {
    setInspectorTab(result.tab);
    setInspectorOpen(true);
    setShowQuickSearch(false);
    setHeaderSearch("");
  }

  function handleSendMessage(textToSend?: string) {
    const q = (textToSend !== undefined ? textToSend : query).trim();
    if (!q) return;

    const targetSessionId = activeSessionId;
    const userTurn: ChatTurn = {
      id: `turn-u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id !== targetSessionId) return s;
        const isFirstMessage = s.turns.length === 0 || s.title.startsWith("Nueva conversación") || s.title.startsWith("Conversación ");
        const nextTitle = isFirstMessage ? (q.length > 38 ? `${q.slice(0, 38)}...` : q) : s.title;
        const nextTurns = [...s.turns, userTurn];
        return {
          ...s,
          title: nextTitle,
          preview: q,
          date: "Ahora",
          messagesCount: nextTurns.length,
          turns: nextTurns,
        };
      })
    );
    setQuery("");
    setIsSearching(true);

    setTimeout(() => {
      const lowerQ = q.toLowerCase().trim();
      const activeProjName = (projects.find((p) => p.id === activeProjectId) || projects[0]).name;
      const activeProvider = aiProviders.find((p) => p.id === activeLlmProviderId) || aiProviders[0];
      const activeSources = projectSources.filter((s) => s.projectId === activeProjectId);

      // Detectar saludos o mensajes conversacionales cortos sin intención de búsqueda documental
      const isConversationalGreeting =
        /^(hola|buenos d[ií]as|buenas tardes|buenas noches|buenas|hey|saludos|qu[eé] tal|c[oó]mo est[aá]s|gracias|muchas gracias|ok|listo|perfecto|ayuda|qu[eé] puedes hacer|qui[eé]n eres)([!.,?\s].*)?$/i.test(
          lowerQ
        ) &&
        !lowerQ.includes("horas") &&
        !lowerQ.includes("ebitda") &&
        !lowerQ.includes("ley") &&
        !lowerQ.includes("artículo") &&
        !lowerQ.includes("manual") &&
        !lowerQ.includes("provisión") &&
        !lowerQ.includes("resumen");

      let ansText = "";
      let hasTable = false;
      let tableData;
      let turnSources: { id: number; name: string; section: string; tab: InspectorTab }[] = [];

      if (activeSources.length === 0) {
        if (isConversationalGreeting) {
          ansText = `¡Hola Carlos! Soy tu asistente de Búsqueda de Criterios activo en el proyecto "${activeProjName}". Actualmente este proyecto no cuenta con fuentes ni documentos indexados. Puedes cargar tus archivos (PDF, Excel, Word o carpetas completas) usando el botón "+ Carga de doc" en el panel lateral para habilitar consultas RAG con citas exactas.`;
        } else {
          ansText = `Actualmente no existen fuentes documentales ni vectores indexados en el proyecto "${activeProjName}". Para realizar búsquedas semánticas y recibir respuestas respaldadas por evidencia oficial, por favor carga tus archivos mediante "+ Carga de doc" en el panel izquierdo.`;
        }
        turnSources = [];
      } else if (isConversationalGreeting) {
        if (lowerQ.startsWith("gracias") || lowerQ.includes("muchas gracias")) {
          ansText = `¡Con gusto, Carlos! Quedo atento si necesitas cruzar otra consulta o revisar documentos en el proyecto "${activeProjName}".`;
        } else {
          ansText = `¡Hola Carlos! Soy tu asistente de Búsqueda de Criterios activo en el proyecto "${activeProjName}" (${activeSources.length} fuente(s) indexada(s) con ${activeProvider.name}). Escribe tu consulta sobre normas, matrices o manuales —o carga más documentos desde el panel izquierdo— y te responderé con trazabilidad exacta.`;
        }
        turnSources = [];
      } else if (
        activeProjectId === "auditoria-q3" &&
        (lowerQ.includes("horas extras") ||
          lowerQ.includes("ebitda") ||
          lowerQ.includes("contingencia") ||
          lowerQ.includes("laboral") ||
          lowerQ.includes("q4") ||
          lowerQ.includes("provisión"))
      ) {
        ansText =
          "El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes [1]. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp [2].";
        hasTable = true;
        tableData = [
          { concept: "EBITDA (USD)", sin: "2,150,000", con: "2,101,500", var: "-48,500", isNegative: true },
          { concept: "Margen EBITDA", sin: "18.4%", con: "16.1%", var: "-2.3 pp", isNegative: true },
        ];
        turnSources = [
          { id: 1, name: "D.S. N.º 007-2002-TR", section: "Art. 10 y 11 - Jornada y sobretiempo", tab: 1 },
          { id: 2, name: "Contingencias_Laborales_Q3.xlsx", section: "Hoja: Resumen_Ejecutivo • Celda E14", tab: 2 },
        ];
      } else if (
        activeProjectId === "auditoria-q3" &&
        (lowerQ.includes("artículo") ||
          lowerQ.includes("ley") ||
          lowerQ.includes("007") ||
          lowerQ.includes("norma") ||
          lowerQ.includes("15"))
      ) {
        ansText =
          "Según el D.S. N.º 007-2002-TR (TUO de la Ley de Jornada de Trabajo), los artículos 9, 10 y 15 estipulan que el sobretiempo antes de la hora de entrada o después de la salida debe ser remunerado con sobretasa legal del 25% y 35% [1]. Asimismo, el empleador debe conservar los registros de asistencia por un mínimo de 5 años.";
        turnSources = [
          { id: 1, name: "D.S. N.º 007-2002-TR", section: "Art. 9, 10 y 15 - Jornada y sobretiempo", tab: 1 },
        ];
      } else if (
        activeProjectId === "auditoria-q3" &&
        (lowerQ.includes("procedimiento") ||
          lowerQ.includes("política") ||
          lowerQ.includes("manual") ||
          lowerQ.includes("rrhh") ||
          lowerQ.includes("auditoría"))
      ) {
        ansText =
          "La Sección 4.2 del Manual de Políticas Laborales establece que toda contingencia mayor a USD 25,000 requiere autorización del Comité de Auditoría y validación con RR.HH. [3]. Se recomienda emitir acta vinculante antes del cierre contable.";
        turnSources = [
          { id: 3, name: "Manual de Políticas Laborales", section: "Sección 4.2 - Control de asistencia", tab: 3 },
        ];
      } else {
        const sourceTitles = activeSources.slice(0, 3).map((s) => s.title).join(", ");
        ansText = `Respecto a "${q}" en el proyecto "${activeProjName}": tras consultar los vectores indexados (umbral ≥ ${similarityThreshold.toFixed(
          2
        )}) en las fuentes activas (${sourceTitles}), la evidencia analizada confirma los lineamientos operativos y criterios aplicables según los fragmentos recuperados.`;
        turnSources = activeSources.slice(0, 3).map((s, idx) => ({
          id: idx + 1,
          name: s.title,
          section: s.badge,
          tab: s.inspectorTab,
        }));
      }

      const assistantTurn: ChatTurn = {
        id: `turn-a-${Date.now()}`,
        sender: "assistant",
        text: ansText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latency: `${activeProvider.latency} ms (${activeProvider.name})`,
        sourcesCount: turnSources.length,
        scenarioId: activeScenario,
        hasTable,
        tableData,
        sources: turnSources,
      };

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const nextTurns = [...s.turns, assistantTurn];
          return {
            ...s,
            preview: ansText.slice(0, 90) + "...",
            messagesCount: nextTurns.length,
            provider: activeProvider.name,
            turns: nextTurns,
          };
        })
      );
      setIsSearching(false);
    }, 350);
  }

  function handleResetChat() {
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              turns: [],
              messagesCount: 0,
              preview: "Conversación limpia • Lista para nuevas consultas",
            }
          : s
      )
    );
    setQuery("");
  }

  function handleScenario(id: string) {
    setActiveScenario(id);
    const found = currentScenarioCards.find((s) => s.id === id);
    if (found) {
      if (id === "normativa") setInspectorTab(1);
      else if (id === "financiero") setInspectorTab(2);
      else if (id === "procedimiento") setInspectorTab(3);
      else setInspectorTab(1);
      setInspectorOpen(true);
      handleSendMessage(found.query);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSendMessage();
  }

  function handleHeaderSearchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!headerSearch.trim()) return;
    setActiveNav("nuevo");
    handleSendMessage(headerSearch);
    setHeaderSearch("");
    setShowQuickSearch(false);
  }

  function handleSwitchPrimaryLlm(providerId: string) {
    setActiveLlmProviderId(providerId);
    setAiProviders((prev) =>
      prev.map((p) => ({
        ...p,
        role: p.id === providerId ? "primary_llm" : p.role === "primary_llm" ? "standby" : p.role,
        status: p.id === providerId ? "active" : p.status,
      }))
    );
  }

  function handleSwitchReranker(providerId: string) {
    setActiveRerankerProviderId(providerId);
    setAiProviders((prev) =>
      prev.map((p) => ({
        ...p,
        role: p.id === providerId ? "reranker" : p.role === "reranker" ? "standby" : p.role,
      }))
    );
  }

  function handleSwitchEmbedding(providerId: string) {
    setActiveEmbeddingProviderId(providerId);
  }

  function handlePingTest(providerId: string) {
    const jitter = Math.floor(Math.random() * 25) - 10;
    setAiProviders((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          const newLat = Math.max(28, p.latency + jitter);
          return { ...p, latency: newLat };
        }
        return p;
      })
    );
  }

  function handleModelChange(providerId: string, modelName: string) {
    setAiProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, selectedModel: modelName } : p))
    );
  }

  function handleUploadFolder() {
    setShowUploadModal(true);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const addedSources: ProjectSourceItem[] = Array.from(files).map((file, idx) => {
      const lower = file.name.toLowerCase();
      const isExcel = lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv");
      const isLegal = lower.includes("ley") || lower.includes("ds") || lower.includes("decreto") || lower.includes("norma");
      const type: "legal" | "excel" | "doc" = isExcel ? "excel" : isLegal ? "legal" : "doc";
      const sizeKb = Math.max(12, Math.round(file.size / 1024));
      const estimatedChunks = Math.max(120, sizeKb * 8);
      return {
        id: `src-up-${Date.now()}-${idx}`,
        title: file.name,
        type,
        badge: isExcel ? "Matriz Excel" : isLegal ? "Norma Oficial" : "Documento Indexado",
        description: `Archivo cargado localmente (${sizeKb} KB) e indexado en pgvector para el proyecto activo.`,
        metaPages: isExcel ? "Hojas dinámicas" : `${Math.max(4, Math.round(sizeKb / 18))} páginas`,
        chunksCount: estimatedChunks,
        statusText: "Recién indexado",
        inspectorTab: isExcel ? 2 : isLegal ? 1 : 3,
        projectId: activeProjectId,
      };
    });

    setProjectSources((prev) => [...addedSources, ...prev]);
    e.target.value = "";
    setShowUploadModal(false);
    setActiveNav("fuentes");
  }

  function handleAddQuickTemplateSource(template: {
    title: string;
    type: "legal" | "excel" | "doc";
    badge: string;
    description: string;
    metaPages: string;
    chunksCount: number;
  }) {
    const newSource: ProjectSourceItem = {
      id: `src-tpl-${Date.now()}`,
      title: template.title,
      type: template.type,
      badge: template.badge,
      description: template.description,
      metaPages: template.metaPages,
      chunksCount: template.chunksCount,
      statusText: "Recién indexado",
      inspectorTab: template.type === "legal" ? 1 : template.type === "excel" ? 2 : 3,
      projectId: activeProjectId,
    };
    setProjectSources((prev) => [newSource, ...prev]);
    setShowUploadModal(false);
    setActiveNav("fuentes");
  }

  function handleReindexSource(sourceId: string) {
    setReindexingSourceId(sourceId);
    setTimeout(() => {
      setProjectSources((prev) =>
        prev.map((s) => (s.id === sourceId ? { ...s, statusText: "Sincronizado ahora" } : s))
      );
      setReindexingSourceId(null);
    }, 600);
  }

  function handleToggleSaveTurn(turn: ChatTurn) {
    const isAlreadySaved = savedTurnIds.includes(turn.id);
    if (isAlreadySaved) {
      setSavedTurnIds((prev) => prev.filter((id) => id !== turn.id));
    } else {
      setSavedTurnIds((prev) => [...prev, turn.id]);
      const newHist: HistoryRecordItem = {
        id: `h-${Date.now()}`,
        question: activeSession?.title || "Consulta guardada desde el Asistente RAG",
        scenario: turn.scenarioId || activeScenario,
        tab: inspectorTab,
        date: "Ahora",
        latency: turn.latency || "134 ms",
        sourcesCount: turn.sourcesCount || 3,
        similarity: similarityThreshold.toFixed(2),
        summary: turn.text.slice(0, 140) + "...",
      };
      setHistoryItems((prev) => [newHist, ...prev]);
    }
  }

  function handleShareTurn(turn: ChatTurn) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(turn.text).catch(() => {});
    }
    setCopiedTurnId(turn.id);
    setTimeout(() => setCopiedTurnId(null), 2000);
  }

  function handleCopyCitation() {
    let citation = "";
    if (inspectorTab === 1) {
      citation = "D.S. N.º 007-2002-TR, Artículo 9 - Jornada de trabajo (Pág. 12). Publicación: 24/08/2002. Coseno: 0.95.";
    } else if (inspectorTab === 2) {
      citation = "Modelo Financiero Q3 2026.xlsx, Hoja: Proyecciones, Celda D13 =SUMA(D12:D14), Provisión USD 48,500. Coseno: 0.92.";
    } else {
      citation = "Manual de Políticas Laborales, Sección 4.2 - Control de asistencia (Pág. 28, v2.1 - 2026). Coseno: 0.88.";
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(citation).catch(() => {});
    }
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
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
    } catch {
      // Fallback silencioso
    }
  }

  function handleExportHistoryCsv() {
    try {
      let csv = "ID,Fecha,Consulta,Resumen,Fuentes,Similitud,Latencia\n";
      for (const item of historyItems) {
        csv += `"${item.id}","${item.date}","${item.question.replace(/"/g, '""')}","${item.summary.replace(/"/g, '""')}",${item.sourcesCount},${item.similarity},"${item.latency}"\n`;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Historial_Consultas_RAG.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setHistoryExported(true);
      setTimeout(() => setHistoryExported(false), 2000);
    } catch {
      setHistoryExported(true);
      setTimeout(() => setHistoryExported(false), 2000);
    }
  }

  function openInspector(tab: InspectorTab) {
    setInspectorTab(tab);
    setInspectorOpen(true);
  }

  const totalChunksCount = currentProjectSources.reduce((acc, s) => acc + s.chunksCount, 0);
  const legalSources = currentProjectSources.filter((s) => s.type === "legal");
  const legalSourcesCount = legalSources.length;
  const legalChunksCount = legalSources.reduce((acc, s) => acc + s.chunksCount, 0);

  const excelSources = currentProjectSources.filter((s) => s.type === "excel");
  const excelSourcesCount = excelSources.length;
  const excelChunksCount = excelSources.reduce((acc, s) => acc + s.chunksCount, 0);

  const docSources = currentProjectSources.filter((s) => s.type === "doc");
  const docSourcesCount = docSources.length;
  const docChunksCount = docSources.reduce((acc, s) => acc + s.chunksCount, 0);

  return (
    <div className="qaway-criterios-root" style={{ backgroundColor: palette.bgPage, color: palette.textPrimary }}>
      {/* Estilos mínimos y elegantes para scrollbars dentro del namespace, eliminando franjas oscuras */}
      <style>{`
        .qaway-criterios-root ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .qaway-criterios-root ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .qaway-criterios-root ::-webkit-scrollbar-thumb {
          background: #d4d4d8 !important;
          border-radius: 9999px !important;
        }
        .qaway-criterios-root ::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa !important;
        }
        .qaway-criterios-root {
          scrollbar-width: thin;
          scrollbar-color: #d4d4d8 transparent;
          scrollbar-gutter: stable;
        }
        .qaway-criterios-root main {
          scrollbar-gutter: stable;
        }
      `}</style>

      {/* Inputs ocultos reales para carga de archivos y carpetas desde el sistema */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.csv,.docx,.txt,.md"
        onChange={handleFilesSelected}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={handleFilesSelected}
        className="hidden"
      />

      <div className="h-screen w-full overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200">

        {/* =========================================================================
         * HEADER GLOBAL FIJO Y PERENNE DE EXTREMO A EXTREMO (Top Bar Full Width)
         * ========================================================================= */}
        <header
          style={{
            backgroundColor: palette.bgSurface,
            borderColor: palette.borderDefault,
          }}
          className="w-full h-14 shrink-0 border-b flex items-center justify-between px-0 z-30 sticky top-0 shadow-xs"
        >
          {/* Lado izquierdo: Bloque del Logo (ocupa exactamente el mismo espacio que el panel izquierdo) */}
          <div
            style={{
              width: sidebarOpen ? `${sidebarWidth}px` : "4rem",
              borderColor: palette.borderDefault,
            }}
            className="h-full shrink-0 border-r flex items-center px-3 transition-[width] duration-75 min-w-0"
          >
            {/* Logo Completo como Botón de Inicio */}
            <button
              type="button"
              onClick={handleResetHome}
              className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity w-full overflow-hidden"
              title="Volver al inicio de la aplicación"
            >
              <span
                style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSurface }}
                className="w-8 h-8 rounded-lg border flex items-center justify-center shadow-xs shrink-0"
              >
                <HubIcon icon={Layers} size={18} className="text-zinc-800" />
              </span>
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span style={{ fontSize: 16.5 }} className="font-bold tracking-tight text-zinc-900 truncate">
                    RAG Hub
                  </span>
                  <span
                    style={{
                      backgroundColor: palette.accentCitationBg,
                      color: palette.accentCitation,
                      fontSize: 11.5,
                    }}
                    className="px-1.5 py-0.5 rounded font-mono font-semibold shrink-0"
                  >
                    v4.0
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Lado Central: Buscador y Filtro Global Avanzado (Rojo) */}
          <div className="flex-1 max-w-[460px] mx-3 relative hidden sm:block">
            <form onSubmit={handleHeaderSearchSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center">
                <span className="absolute left-3 text-zinc-400 pointer-events-none">
                  <HubIcon icon={Search} size={15} />
                </span>
                <input
                  id="header-rag-search-input"
                  type="text"
                  value={headerSearch}
                  onChange={(e) => {
                    setHeaderSearch(e.target.value);
                    setShowQuickSearch(true);
                  }}
                  onFocus={() => {
                    if (headerSearch.trim()) setShowQuickSearch(true);
                  }}
                  placeholder="Buscar norma, cuenta, fórmula... (Ctrl+K)"
                  style={{
                    backgroundColor: palette.bgPage,
                    borderColor: palette.borderDefault,
                    color: palette.textPrimary,
                  }}
                  className="w-full pl-9 pr-24 h-10 rounded-xl border text-[13.5px] shadow-xs focus:outline-none focus:ring-1.5 focus:ring-blue-500/30 transition-all placeholder:text-zinc-400"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <span className="hidden lg:inline-block px-1.5 py-0.5 text-[11px] font-mono text-zinc-400 bg-zinc-100 rounded border border-zinc-200">
                    ⌘K
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown((v) => !v)}
                    style={{
                      backgroundColor:
                        filterSourceType !== "all" || similarityThreshold !== 0.75
                          ? palette.accentCitationBg
                          : "#f4f4f5",
                      borderColor:
                        filterSourceType !== "all" || similarityThreshold !== 0.75
                          ? palette.accentCitation
                          : "#e4e4e7",
                      color:
                        filterSourceType !== "all" || similarityThreshold !== 0.75
                          ? palette.accentCitation
                          : "#52525b",
                    }}
                    className="h-8 px-2 rounded-lg border hover:bg-zinc-200/70 cursor-pointer transition-all relative flex items-center justify-center gap-1 shadow-2xs"
                    title="Filtros avanzados de recuperación"
                    aria-label="Filtros avanzados de recuperación"
                  >
                    <HubIcon icon={SlidersHorizontal} size={15} />
                    <span className="text-[11.5px] font-medium hidden md:inline">Filtro</span>
                    {(filterSourceType !== "all" || similarityThreshold !== 0.75) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Dropdown Flotante de Resultados Rápidos (estilo CRM /hub/crm) */}
            {showQuickSearch && headerSearch.trim().length > 0 && (
              <div
                ref={quickSearchRef}
                style={{
                  backgroundColor: palette.bgSurface,
                  borderColor: palette.borderDefault,
                  color: palette.textPrimary,
                }}
                className="absolute left-0 top-full mt-2 w-full min-w-[390px] max-w-[500px] rounded-xl border shadow-2xl p-3 z-50 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <HubIcon icon={Sparkles} size={14} className="text-amber-500" />
                    <span className="font-semibold text-zinc-900 text-[12px] uppercase tracking-wide">
                      Resultados Rápidos en Fuentes
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {quickSearchResults.length} coincidencias
                  </span>
                </div>

                {quickSearchResults.length > 0 ? (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {quickSearchResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectQuickResult(res)}
                        className="w-full text-left p-2.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 cursor-pointer transition-all flex items-start gap-2.5 group"
                      >
                        <span className="mt-0.5 shrink-0">
                          {res.tab === 1 && <HubIcon icon={Scale} size={15} className="text-red-500" />}
                          {res.tab === 2 && <HubIcon icon={FileSpreadsheet} size={15} className="text-emerald-500" />}
                          {res.tab === 3 && <HubIcon icon={FileText} size={15} className="text-slate-500" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-zinc-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                              {res.title}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border shrink-0 ${res.badgeColor}`}>
                              {res.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {res.subtitle}
                          </p>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 italic">
                            "{res.snippet}"
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-zinc-400">
                    <p className="text-xs">Sin coincidencias directas en las fuentes indexadas.</p>
                    <p className="text-[11px] mt-0.5 text-zinc-500">
                      Presiona <kbd className="px-1 py-0.5 bg-zinc-100 rounded border text-zinc-700">Enter</kbd> para consultar al LLM.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Enter para enviar al chat</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickSearch(false)}
                    className="hover:text-zinc-600 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* Popover de Filtro Avanzado */}
            {showFilterDropdown && (
              <div
                ref={filterDropdownRef}
                style={{
                  backgroundColor: palette.bgSurface,
                  borderColor: palette.borderDefault,
                  color: palette.textPrimary,
                }}
                className="absolute left-0 top-full mt-2 w-80 rounded-xl border shadow-xl p-3.5 z-40 text-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <HubIcon icon={Filter} size={14} className="text-zinc-600" />
                    <span className="font-semibold text-zinc-900 text-[13px]">
                      Filtros del Motor RAG
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSourceType("all");
                      setFilterPeriod("q3");
                      setSimilarityThreshold(0.75);
                      showToastMessage("Filtros restablecidos");
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  >
                    Restablecer
                  </button>
                </div>

                {/* Tipo de Fuente */}
                <div>
                  <label className="block text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Fuente de Datos
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "all", label: "Todas las fuentes" },
                      { id: "legal", label: "Leyes (TR / D.S.)" },
                      { id: "excel", label: "Matrices Excel" },
                      { id: "doc", label: "Manuales RRHH" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFilterSourceType(item.id);
                          showToastMessage(`Filtrando: ${item.label}`);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-left text-[11.5px] font-medium transition-all cursor-pointer ${
                          filterSourceType === item.id
                            ? "border-blue-600 bg-blue-50/80 text-blue-700 font-semibold"
                            : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Período Contable / Legal */}
                <div>
                  <label className="block text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Período Contable / Legal
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "q3", label: "Tercer Trimestre (Q3)" },
                      { id: "2026", label: "Año 2026" },
                      { id: "all", label: "Histórico" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFilterPeriod(p.id);
                          showToastMessage(`Período: ${p.label}`);
                        }}
                        className={`flex-1 py-1 px-1.5 rounded-md border text-center text-[11px] font-medium transition-all cursor-pointer ${
                          filterPeriod === p.id
                            ? "border-zinc-800 bg-zinc-800 text-white font-semibold"
                            : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Umbral de Precisión (Slider) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Corte de Similitud Coseno
                    </label>
                    <span className="font-mono text-[11.5px] font-bold text-blue-600">
                      ≥ {similarityThreshold.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.05"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5">
                    <span>0.60 (Amplio)</span>
                    <span>0.75 (Estándar)</span>
                    <span>0.95 (Exacto)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowFilterDropdown(false);
                    showToastMessage(`Filtros aplicados (Umbral ≥ ${similarityThreshold.toFixed(2)})`);
                  }}
                  className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            )}
          </div>

          {/* Lado derecho: Perfil con Switcher de Tema en 1 sola línea */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* Avatar Carlos con Menú Desplegable Completo según estándar Qaway SaaS */}
            <div ref={userMenuRef} className="relative flex items-center pr-3">
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-zinc-100/80 cursor-pointer transition-colors"
                aria-label="Abrir menú de usuario"
              >
                <span
                  style={{ backgroundColor: palette.actionPrimary }}
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm shadow-xs transition-colors shrink-0"
                >
                  C
                </span>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span style={{ fontSize: 13 }} className="font-semibold text-zinc-900">
                    Carlos
                  </span>
                  <span style={{ fontSize: 11 }} className="text-zinc-500 font-medium">
                    Admin
                  </span>
                </div>
                <HubIcon
                  icon={ChevronDown}
                  size={14}
                  className={`text-zinc-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Menú Desplegable Completo Qaway SaaS */}
              {showUserMenu && (
                <div
                  style={{
                    backgroundColor: palette.bgSurface,
                    borderColor: palette.borderDefault,
                    color: palette.textPrimary,
                  }}
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 text-xs space-y-2 animate-in fade-in"
                >
                  {/* Ficha de Usuario & Workspace */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{ backgroundColor: palette.actionPrimary }}
                        className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
                      >
                        C
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-900 text-[13px] truncate">Carlos Sandoval</p>
                        <p className="text-[11.5px] text-zinc-500 truncate">carlos@qawaylab.com</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-[11px]">
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">
                        Workspace Owner
                      </span>
                      <span className="text-zinc-500">Qaway Enterprise</span>
                    </div>
                  </div>

                  {/* Selector de Temas en UNA sola línea */}
                  <div className="px-2 py-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Tema visual
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[120px]">
                        {palette.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl">
                      {(Object.keys(THEME_CONFIG) as RagThemeId[]).map((tid) => {
                        const th = THEME_CONFIG[tid];
                        const isCurrent = theme === tid;
                        return (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => {
                              setTheme(tid);
                              showToastMessage(`Tema ${th.name} activado`);
                            }}
                            title={th.name}
                            className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-white text-zinc-900 shadow-xs font-semibold"
                                : "text-zinc-500 hover:text-zinc-800"
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: th.accentCitation }}
                            />
                            <span className="truncate">{th.name.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accesos rápidos de navegación */}
                  <div className="space-y-0.5 pt-1 border-t border-zinc-100">
                    {[
                      { label: "Asistente & Chat principal", nav: "nuevo", icon: MessageSquare },
                      { label: "Repositorio de fuentes", nav: "fuentes", icon: FileText },
                      { label: "Historial de dictámenes", nav: "historial", icon: History },
                      { label: "Configuración & IA", nav: "config", icon: Settings },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveNav(opt.nav);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-zinc-700 hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <HubIcon icon={opt.icon} size={14} className="text-zinc-500 shrink-0" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Cerrar sesión */}
                  <div className="pt-1 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        showToastMessage("Sesión cerrada (modo demostración)");
                      }}
                      className="w-full text-left px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors flex items-center gap-2 font-medium"
                    >
                      <HubIcon icon={LogOut} size={14} className="text-red-500 shrink-0" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =========================================================================
         * CONTENEDOR DE PANELES (DEBAJO DEL HEADER GLOBAL)
         * ========================================================================= */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* ===== COLUMNA 1: SIDEBAR IZQUIERDO CON MÓDULOS UNIVERSALES (COLAPSABLE A ICONOS) ===== */}
          <aside
            style={{
              width: sidebarOpen ? `${sidebarWidth}px` : "4rem",
              backgroundColor: palette.bgPage,
              borderColor: palette.borderDefault,
            }}
            className={`shrink-0 border-r flex flex-col relative transition-[width] duration-75 overflow-y-auto ${
              sidebarOpen ? "" : "items-center"
            }`}
          >
            {/* Tirador de redimensionamiento con mouse */}
            {sidebarOpen && (
              <div
                onMouseDown={startResizingSidebar}
                className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-30 select-none ${
                  isResizingSidebar ? "bg-blue-600 w-2" : ""
                }`}
                title="Arrastrar para redimensionar panel izquierdo"
              />
            )}
            {sidebarOpen ? (
              // Modo Expandido
              <>
                {/* Cabecera del Panel: 1. Proyecto Activo -> 2. Nuevo Proyecto -> 3. Carga de doc -> 4. Nueva Conversación */}
                <div className="px-3 pt-3 space-y-2">
                  {/* 1. Proyecto Activo + Botón de Colapsar Panel */}
                  <div>
                    <div className="flex items-center justify-between px-1 pb-1.5">
                      <span
                        style={{ color: palette.textSecondary, fontSize: 12 }}
                        className="font-semibold uppercase tracking-wider"
                      >
                        Proyecto Activo
                      </span>
                      <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-md hover:bg-zinc-100 cursor-pointer text-zinc-500 transition-colors"
                        title="Colapsar panel a iconos"
                        aria-label="Colapsar panel lateral izquierdo"
                      >
                        <HubIcon icon={PanelLeftClose} size={16} />
                      </button>
                    </div>

                    {/* Selector de Proyecto Activo (Desplegable 100% Redondeado) */}
                    <div ref={projectDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProjectDropdown((v) => !v);
                          setShowCategoryDropdown(false);
                        }}
                        style={{
                          backgroundColor: palette.bgSurface,
                          borderColor: palette.borderDefault,
                          fontSize: 13.5,
                        }}
                        className="w-full px-3 py-2 rounded-xl border font-semibold text-zinc-900 shadow-xs cursor-pointer focus:outline-none flex items-center justify-between gap-2 hover:border-zinc-300 transition-all text-left"
                        aria-label="Seleccionar proyecto activo"
                      >
                        <span className="truncate">
                          {(projects.find((p) => p.id === activeProjectId) || projects[0]).name}
                        </span>
                        <HubIcon
                          icon={ChevronDown}
                          size={14}
                          className={`text-zinc-400 shrink-0 transition-transform ${
                            showProjectDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showProjectDropdown && (
                        <div
                          style={{
                            backgroundColor: palette.bgSurface,
                            borderColor: palette.borderDefault,
                          }}
                          className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in"
                        >
                          {projects.map((p) => {
                            const isSelected = p.id === activeProjectId;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setActiveProjectId(p.id);
                                  setShowProjectDropdown(false);
                                  const targetSessions = chatSessions.filter((s) =>
                                    s.projectId ? s.projectId === p.id : p.id === "auditoria-q3"
                                  );
                                  if (targetSessions.length > 0) {
                                    setActiveSessionId(targetSessions[0].id);
                                  } else {
                                    handleCreateNewSession("Chat Principal", p.id);
                                  }
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-[13px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                    : "text-zinc-700 hover:bg-zinc-100 font-medium"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate">{p.name}</span>
                                  <span className="block text-[11px] text-zinc-400 truncate">{p.category}</span>
                                </div>
                                {isSelected && (
                                  <HubIcon icon={Check} size={14} className="text-blue-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Debajo: Botón de Nuevo Proyecto */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProjectModal((v) => !v);
                      setShowProjectDropdown(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                    title="Crear un nuevo proyecto"
                  >
                    <HubIcon icon={Plus} size={15} className="text-blue-600 shrink-0" />
                    <span>Nuevo Proyecto</span>
                  </button>

                  {/* Formulario Inline Desplegable para Crear Nuevo Proyecto (Con Selector Redondeado) */}
                  {showNewProjectModal && (
                    <form
                      onSubmit={handleCreateProject}
                      className="p-3 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-blue-900">Crear Nuevo Proyecto</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewProjectModal(false);
                            setShowCategoryDropdown(false);
                          }}
                          className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5 rounded-md hover:bg-blue-100/60"
                        >
                          <HubIcon icon={X} size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Nombre del proyecto..."
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-[13px] text-zinc-900 focus:outline-none focus:ring-1.5 focus:ring-blue-500/40"
                        autoFocus
                      />

                      {/* Desplegable Redondeado de Categoría (Reemplaza al <select> cuadrado de Windows) */}
                      <div ref={categoryDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown((v) => !v)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-[12.5px] font-medium text-zinc-800 flex items-center justify-between gap-2 cursor-pointer hover:border-zinc-300 transition-all text-left"
                        >
                          <span className="truncate">{newProjectCategory}</span>
                          <HubIcon
                            icon={ChevronDown}
                            size={14}
                            className={`text-zinc-400 shrink-0 transition-transform ${
                              showCategoryDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showCategoryDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-zinc-200 bg-white shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in max-h-56 overflow-y-auto">
                            {projectCategories.map((cat) => {
                              const isCatSelected = newProjectCategory === cat;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => {
                                    setNewProjectCategory(cat);
                                    setShowCategoryDropdown(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl text-[12.5px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                    isCatSelected
                                      ? "bg-blue-50 text-blue-700 font-semibold"
                                      : "text-zinc-700 hover:bg-zinc-100 font-medium"
                                  }`}
                                >
                                  <span className="truncate">{cat}</span>
                                  {isCatSelected && (
                                    <HubIcon icon={Check} size={13} className="text-blue-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}

                            {/* Añadir nueva categoría dinámica */}
                            <div className="pt-1.5 mt-1 border-t border-zinc-100">
                              {isAddingCategory ? (
                                <div className="p-1 space-y-1.5">
                                  <input
                                    type="text"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCategory();
                                      }
                                    }}
                                    placeholder="Nueva categoría..."
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-zinc-900"
                                    autoFocus
                                  />
                                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingCategory(false);
                                        setNewCategoryInput("");
                                      }}
                                      className="w-full py-1.5 px-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors text-center cursor-pointer shadow-2xs"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleAddCategory}
                                      className="w-full py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors text-center cursor-pointer"
                                    >
                                      Añadir
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingCategory(true);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-[12px] font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <HubIcon icon={Plus} size={13} />
                                  <span>+ Añadir otra categoría...</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción del nuevo proyecto que ocupan todo el ancho */}
                      <div className="grid grid-cols-2 gap-2 w-full pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewProjectModal(false);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors text-center cursor-pointer shadow-2xs"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors text-center cursor-pointer"
                        >
                          Crear Proyecto
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 3. Debajo: Botón Carga de doc (Texto limpio en una sola línea) */}
                  <button
                    type="button"
                    onClick={handleUploadFolder}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-800 text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <HubIcon icon={FolderPlus} size={16} className="text-indigo-600 shrink-0" />
                    <span>+ Carga de doc</span>
                  </button>

                  {/* 4. Debajo: Botón Nueva Conversación */}
                  <button
                    type="button"
                    onClick={() => handleCreateNewSession()}
                    style={{
                      backgroundColor: palette.actionPrimary,
                    }}
                    className="w-full px-3 py-2 rounded-xl text-white font-medium text-xs shadow-xs hover:opacity-90 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <HubIcon icon={Plus} size={16} />
                    <span className="text-[13.5px] font-semibold">Nueva Conversación</span>
                  </button>
                </div>

                {/* Sección 2: Módulos de la Aplicación (ARRIBA, para que al desplegar chats no los tape) */}
                <div className="px-3 mt-3">
                  <p
                    style={{ color: palette.textSecondary, fontSize: 12 }}
                    className="px-1 pb-1 font-semibold uppercase tracking-wider"
                  >
                    Módulos
                  </p>
                  <nav className="space-y-0.5">
                    {[
                      { id: "nuevo", label: "Asistente & Chat", icon: MessageSquare },
                      { id: "fuentes", label: "Repositorio de Fuentes", icon: FileText },
                      { id: "historial", label: "Historial de Consultas", icon: History },
                      { id: "config", label: "Configuración & IA", icon: Settings },
                    ].map((item) => {
                      const isActive = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveNav(item.id)}
                          style={{
                            backgroundColor: isActive ? palette.accentCitationBg : "transparent",
                            borderLeft: isActive ? `3px solid ${palette.accentCitation}` : "3px solid transparent",
                            color: isActive ? palette.accentCitation : palette.textPrimary,
                            fontSize: 14.5,
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center gap-3 cursor-pointer transition-colors ${
                            isActive ? "rounded-r-md font-semibold" : "hover:bg-zinc-100 rounded-md font-medium"
                          }`}
                        >
                          <HubIcon icon={item.icon} size={15} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Sección 3: Conversaciones & Chats Desplegables (Estilo Antigravity 2.0) */}
                <div className="px-3 mt-3 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <button
                      type="button"
                      onClick={() => setIsChatsListOpen((v) => !v)}
                      className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      <HubIcon icon={isChatsListOpen ? ChevronDown : ChevronRight} size={13} />
                      <span
                        style={{ color: palette.textSecondary, fontSize: 12.5 }}
                        className="font-semibold uppercase tracking-wider"
                      >
                        Conversaciones
                      </span>
                    </button>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      {currentChatSessions.length}
                    </span>
                  </div>

                  {isChatsListOpen && (
                    <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-0.5 scrollbar-thin">
                      {currentChatSessions.length === 0 ? (
                        <div className="py-2.5 px-2 text-center text-zinc-400">
                          <p className="text-xs">Sin conversaciones en este proyecto</p>
                          <button
                            type="button"
                            onClick={() => handleCreateNewSession("Chat Principal", activeProjectId)}
                            className="mt-1.5 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                          >
                            + Iniciar chat
                          </button>
                        </div>
                      ) : (
                        currentChatSessions.map((session) => {
                          const isCurrent = activeNav === "nuevo" && activeSessionId === session.id;
                          return (
                            <div
                              key={session.id}
                              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                                isCurrent
                                  ? "bg-zinc-200/80 text-zinc-900 font-semibold shadow-2xs"
                                  : "text-zinc-600 hover:bg-zinc-100/90"
                              }`}
                              onClick={() => {
                                setActiveSessionId(session.id);
                                setActiveNav("nuevo");
                              }}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <HubIcon
                                  icon={MessageSquare}
                                  size={13}
                                  className={isCurrent ? "text-blue-600 shrink-0" : "text-zinc-400 shrink-0"}
                                />
                                <span className="truncate text-[13.5px] text-zinc-800">{session.title}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <span className="text-[11.5px] font-mono text-zinc-400 shrink-0">
                                  {session.date === "Hoy" ? "9m" : session.date}
                                </span>
                                {currentChatSessions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const remaining = chatSessions.filter((s) => s.id !== session.id);
                                      setChatSessions(remaining);
                                      if (activeSessionId === session.id) {
                                        const remainingInProject = remaining.filter((s) =>
                                          s.projectId ? s.projectId === activeProjectId : activeProjectId === "auditoria-q3"
                                        );
                                        if (remainingInProject.length > 0) {
                                          setActiveSessionId(remainingInProject[0].id);
                                        } else {
                                          handleCreateNewSession("Chat Principal", activeProjectId);
                                        }
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-red-500 rounded transition-opacity"
                                    title="Eliminar conversación"
                                  >
                                    <HubIcon icon={Trash2} size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-2" />

                {/* Sección 4: Fuentes Indexadas en Proyecto */}
                <div className="p-3 pb-3 mt-auto">
                  <div
                    style={{
                      borderColor: palette.borderDefault,
                      backgroundColor: palette.bgSurface,
                    }}
                    className="border rounded-xl p-3 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <p style={{ fontSize: 12.5 }} className="font-semibold text-zinc-800">
                        Fuentes en proyecto
                      </p>
                      <span style={{ fontSize: 10.5 }} className="text-indigo-600 font-mono font-semibold">
                        {currentProjectSources.length} activas
                      </span>
                    </div>

                    {currentProjectSources.length === 0 ? (
                      <div className="py-2 text-center space-y-1.5">
                        <p style={{ fontSize: 12 }} className="text-zinc-500 font-medium">
                          Sin fuentes cargadas en este proyecto
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowUploadModal(true)}
                          className="w-full py-1.5 px-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <HubIcon icon={Upload} size={13} />
                          <span>+ Carga de doc</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {docSourcesCount > 0 && (
                          <div className="flex items-start gap-2">
                            <HubIcon icon={FileText} size={14} className="text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                                Documentos &amp; Manuales
                              </span>
                              <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                                {docSourcesCount} fuente(s) • {docChunksCount.toLocaleString()} fragmentos
                              </span>
                            </div>
                          </div>
                        )}
                        {legalSourcesCount > 0 && (
                          <div className="flex items-start gap-2">
                            <HubIcon icon={Scale} size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                                Leyes &amp; Normativa
                              </span>
                              <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                                {legalSourcesCount} fuente(s) • {legalChunksCount.toLocaleString()} fragmentos
                              </span>
                            </div>
                          </div>
                        )}
                        {excelSourcesCount > 0 && (
                          <div className="flex items-start gap-2">
                            <HubIcon icon={FileSpreadsheet} size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                                Matrices Excel / CSV
                              </span>
                              <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                                {excelSourcesCount} archivo(s) • {excelChunksCount.toLocaleString()} fragmentos
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Modo Colapsado (Solo Iconos Centrados con Tooltips)
              <div className="py-3 px-2 flex flex-col items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 cursor-pointer text-zinc-600 transition-colors shadow-2xs"
                  title="Expandir panel lateral"
                  aria-label="Expandir panel lateral izquierdo"
                >
                  <HubIcon icon={PanelLeftOpen} size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewSession()}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                  title="Nueva Conversación"
                  aria-label="Nueva Conversación"
                >
                  <HubIcon icon={MessageSquarePlus} size={17} />
                </button>

                <div className="w-8 h-px bg-zinc-200 my-1" />

                <nav className="space-y-1.5 w-full flex flex-col items-center">
                  {[
                    { id: "nuevo", label: "Asistente & Chat", icon: MessageSquare },
                    { id: "fuentes", label: "Repositorio de Fuentes", icon: FileText },
                    { id: "historial", label: "Historial de Consultas", icon: History },
                    { id: "config", label: "Configuración & IA", icon: Settings },
                  ].map((item) => {
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveNav(item.id)}
                        title={item.label}
                        aria-label={item.label}
                        style={{
                          backgroundColor: isActive ? palette.accentCitationBg : "transparent",
                          color: isActive ? palette.accentCitation : palette.textPrimary,
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                          isActive ? "font-bold shadow-xs border border-zinc-200" : "hover:bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <HubIcon icon={item.icon} size={18} />
                      </button>
                    );
                  })}
                </nav>

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={handleUploadFolder}
                  title="Cargar documentos o carpeta"
                  className="w-10 h-10 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer transition-colors shadow-2xs"
                >
                  <HubIcon icon={FolderPlus} size={17} />
                </button>
              </div>
            )}
          </aside>

          {/* ===== COLUMNA 2: PANEL CENTRAL - WORKSPACE CON SCROLL ===== */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" style={{ scrollbarGutter: "stable" }}>
            {activeNav === "nuevo" && (
              <div className="px-4 sm:px-6 pt-5 pb-2 max-w-[940px] w-full mx-auto flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Header de la conversación (ESTÁTICO) */}
                <div className="shrink-0 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                        Asistente de Conocimiento &amp; Chat RAG
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                        <HubIcon icon={Bot} size={13} />
                        <span>{aiProviders.find((p) => p.id === activeLlmProviderId)?.name || "OpenAI"}</span>
                      </span>
                    </div>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Consulta multi-fuente en lenguaje natural con citas interactivas vinculadas a leyes, Excel y políticas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Botón de Filtro Contextual Flotante (no roba altura al chat) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowChatFilterModal((v) => !v)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                          showChatFilterModal
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                        }`}
                        title="Filtros de recuperación para el chat"
                      >
                        <HubIcon icon={SlidersHorizontal} size={13} />
                        <span>Filtros</span>
                      </button>

                      {showChatFilterModal && (
                        <div
                          style={{
                            backgroundColor: palette.bgSurface,
                            borderColor: palette.borderDefault,
                          }}
                          className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-xl p-3 z-30 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                            <span className="font-semibold text-zinc-900 text-xs">Filtros de Recuperación</span>
                            <button
                              type="button"
                              onClick={() => setShowChatFilterModal(false)}
                              className="text-[11px] text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            >
                              Cerrar
                            </button>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                              Período
                            </label>
                            <div className="flex gap-1">
                              {["q3", "2026", "all"].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => {
                                    setFilterPeriod(p);
                                    showToastMessage(`Período: ${p.toUpperCase()}`);
                                  }}
                                  className={`flex-1 py-1 rounded text-[11px] border font-medium cursor-pointer ${
                                    filterPeriod === p
                                      ? "bg-zinc-900 text-white border-zinc-900"
                                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                                  }`}
                                >
                                  {p === "q3" ? "Q3 2026" : p === "2026" ? "Año 2026" : "Histórico"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                Corte Similitud
                              </label>
                              <span className="font-mono text-[11px] font-bold text-blue-600">
                                ≥ {similarityThreshold.toFixed(2)}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.60"
                              max="0.95"
                              step="0.05"
                              value={similarityThreshold}
                              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                              className="w-full accent-blue-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleResetChat}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-600 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Reiniciar conversación"
                    >
                      <HubIcon icon={Trash2} size={13} />
                      <span>Limpiar chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNav("config");
                        setConfigTab("providers");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <HubIcon icon={Cpu} size={13} />
                      <span>Configurar IA</span>
                    </button>
                  </div>
                </div>

                {/* 4 Tarjetas de escenarios sugeridos con Toggle para Minimizar y ganar espacio (ESTÁTICO) */}
                <div className="shrink-0 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Consultas y Escenarios Rápidos
                    </span>
                    <button
                      type="button"
                      onClick={() => setCollapseScenariosHeader((v) => !v)}
                      className="text-[11.5px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                      title={collapseScenariosHeader ? "Mostrar escenarios" : "Ocultar escenarios para más espacio"}
                    >
                      <span>{collapseScenariosHeader ? "Mostrar tarjetas" : "Minimizar"}</span>
                      <HubIcon icon={collapseScenariosHeader ? ChevronDown : ChevronUp} size={13} />
                    </button>
                  </div>

                  {!collapseScenariosHeader && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 animate-in fade-in">
                      {currentScenarioCards.map((c) => {
                        const isActive = activeScenario === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleScenario(c.id)}
                            style={{
                              borderColor: isActive ? palette.accentCitation : palette.borderDefault,
                              backgroundColor: palette.bgSurface,
                              boxShadow: isActive ? `0 0 0 1px ${palette.accentCitation}` : "none",
                            }}
                            className="text-left p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:border-zinc-300 transition-all shadow-xs"
                          >
                            <span
                              style={{ backgroundColor: c.iconBg, color: c.iconColor }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            >
                              <HubIcon icon={c.icon} size={17} />
                            </span>
                            <span className="min-w-0">
                              <span style={{ fontSize: 13.5 }} className="block font-semibold leading-tight text-zinc-900">
                                {c.title}
                              </span>
                              <span style={{ color: palette.textMuted, fontSize: 12 }} className="block leading-tight mt-0.5">
                                {c.subtitle}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hilo de Mensajes del Chat (SCROLL INDEPENDIENTE) */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1 scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div
                      style={{
                        borderColor: palette.borderDefault,
                        backgroundColor: palette.bgSurface,
                      }}
                      className="rounded-2xl border border-dashed p-9 text-center space-y-4 my-6 shadow-2xs"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
                        <HubIcon icon={MessageSquarePlus} size={26} />
                      </div>
                      <div className="space-y-1.5 max-w-lg mx-auto">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                          Nueva conversación lista
                        </h2>
                        <p style={{ color: palette.textSecondary }} className="text-[14.5px] leading-relaxed">
                          Este hilo está completamente limpio. Escribe tu consulta en la barra inferior, selecciona uno de los escenarios rápidos arriba o carga nuevos documentos al proyecto.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleUploadFolder}
                          className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-900 text-[13.5px] font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                        >
                          <HubIcon icon={FolderPlus} size={16} className="text-indigo-600" />
                          <span>+ Carga de doc</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMessage("¿Cuál es el resumen ejecutivo de las fuentes activas en este proyecto?")}
                          className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-[13.5px] font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                        >
                          <HubIcon icon={Sparkles} size={16} className="text-blue-600" />
                          <span>Generar resumen del proyecto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      if (msg.sender === "user") {
                        return (
                          <div key={msg.id} className="flex items-start gap-3 justify-end">
                            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-zinc-900 text-white px-4 py-3 shadow-sm">
                              <div className="flex items-center justify-between gap-3 mb-1 text-[11px] text-zinc-400">
                                <span className="font-semibold text-zinc-300">Carlos (Tú)</span>
                                <span>{msg.timestamp}</span>
                              </div>
                              <p style={{ fontSize: 14.5, lineHeight: 1.55 }} className="text-zinc-100">
                                {msg.text}
                              </p>
                            </div>
                            <span
                              style={{ backgroundColor: palette.actionPrimary }}
                              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs"
                            >
                              C
                            </span>
                          </div>
                        );
                      }

                      const isTurnSaved = savedTurnIds.includes(msg.id);
                      const isTurnCopied = copiedTurnId === msg.id;
                      const linkedSources = msg.sources || [];
                      const hasLinkedSources = linkedSources.length > 0;

                      // Mensaje del Asistente (Sin textos hardcodeados)
                      return (
                        <div key={msg.id} className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                            <HubIcon icon={Sparkles} size={15} />
                          </span>
                          <div
                            style={{
                              borderColor: palette.borderDefault,
                              backgroundColor: palette.bgSurface,
                            }}
                            className="flex-1 rounded-2xl border p-5 space-y-4 shadow-xs"
                          >
                            {/* Header del Turno Asistente */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <HubIcon icon={Check} size={15} />
                                </span>
                                <div>
                                  <span style={{ fontSize: 14.5 }} className="block font-semibold text-zinc-900">
                                    Respuesta generada ({msg.latency || "134 ms"})
                                  </span>
                                  <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block">
                                    {hasLinkedSources
                                      ? `Con base en ${linkedSources.length} fuente(s) verificada(s) (Umbral ≥ ${similarityThreshold.toFixed(2)})`
                                      : `Asistente conversacional • ${(projects.find((p) => p.id === activeProjectId) || projects[0]).name}`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSaveTurn(msg)}
                                  style={{
                                    borderColor: isTurnSaved ? palette.accentCitation : palette.borderDefault,
                                    backgroundColor: isTurnSaved ? palette.accentCitationBg : palette.bgSurface,
                                    color: isTurnSaved ? palette.accentCitation : palette.textPrimary,
                                    fontSize: 12.5,
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium hover:opacity-90 cursor-pointer shadow-xs transition-all"
                                >
                                  <HubIcon icon={isTurnSaved ? Check : Bookmark} size={14} />
                                  <span>{isTurnSaved ? "Guardado" : "Guardar"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShareTurn(msg)}
                                  style={{
                                    borderColor: isTurnCopied ? "#10B981" : palette.borderDefault,
                                    fontSize: 12.5,
                                    color: isTurnCopied ? "#047857" : palette.textPrimary,
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white font-medium hover:bg-zinc-50 cursor-pointer shadow-xs transition-all"
                                >
                                  <HubIcon icon={isTurnCopied ? Check : Share2} size={14} />
                                  <span>{isTurnCopied ? "¡Copiado!" : "Compartir"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Texto explicativo real del turno con citas interactivas inline */}
                            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: palette.textPrimary }}>
                              {msg.text.split(/(\[[123]\])/g).map((part, idx) => {
                                if (part === "[1]" || part === "[2]" || part === "[3]") {
                                  const tabNum = Number(part.replace(/\D/g, "")) as InspectorTab;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => openInspector(tabNum)}
                                      style={{
                                        backgroundColor: palette.accentCitationBg,
                                        color: palette.accentCitation,
                                        borderColor: `${palette.accentCitation}40`,
                                      }}
                                      className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 rounded font-semibold text-xs border cursor-pointer hover:opacity-80 transition-colors"
                                    >
                                      {tabNum}
                                    </button>
                                  );
                                }
                                return <span key={idx}>{part}</span>;
                              })}
                            </p>

                            {/* Tabla: Comparativo de impacto financiero si aplica */}
                            {msg.tableData && (
                              <div>
                                <h2 style={{ fontSize: 14 }} className="font-bold text-zinc-900 mb-2">
                                  Comparativo de impacto financiero
                                </h2>
                                <div
                                  style={{ borderColor: palette.borderDefault }}
                                  className="overflow-x-auto rounded-xl border shadow-xs"
                                >
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr
                                        style={{ backgroundColor: palette.bgSubtle, color: palette.textSecondary }}
                                        className="border-b"
                                      >
                                        <th style={{ fontSize: 13.5 }} className="py-2 px-3.5 font-semibold text-left">
                                          Concepto
                                        </th>
                                        <th style={{ fontSize: 13.5 }} className="py-2 px-3.5 font-semibold text-center">
                                          Sin provisión
                                        </th>
                                        <th style={{ fontSize: 13.5 }} className="py-2 px-3.5 font-semibold text-center">
                                          Con provisión
                                        </th>
                                        <th style={{ fontSize: 13.5 }} className="py-2 px-3.5 font-semibold text-center">
                                          Variación
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                      {msg.tableData.map((row, idx) => (
                                        <tr key={idx}>
                                          <td style={{ fontSize: 13.5 }} className="py-2 px-3.5 font-medium text-zinc-900">
                                            {row.concept}
                                          </td>
                                          <td style={{ fontSize: 13.5 }} className="py-2 px-3.5 text-center text-zinc-700">
                                            {row.sin}
                                          </td>
                                          <td style={{ fontSize: 13.5 }} className="py-2 px-3.5 text-center text-zinc-700">
                                            {row.con}
                                          </td>
                                          <td
                                            style={{
                                              backgroundColor: row.isNegative ? "#FEF2F2" : "#F0FDF4",
                                              color: row.isNegative ? "#DC2626" : "#16A34A",
                                              fontSize: 13.5,
                                            }}
                                            className="py-2 px-3.5 text-center font-semibold"
                                          >
                                            {row.var}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Sección: Fuentes y referencias (Solo cuando el mensaje realmente citó fuentes) */}
                            {hasLinkedSources && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h2 style={{ fontSize: 14 }} className="font-bold text-zinc-900">
                                    Fuentes y referencias vinculadas ({linkedSources.length})
                                  </h2>
                                  <span style={{ fontSize: 12, color: palette.textMuted }}>
                                    Clic para abrir en el Inspector lateral
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {linkedSources.map((src) => {
                                    const isLaw = src.tab === 1;
                                    const isExcel = src.tab === 2;
                                    return (
                                      <button
                                        key={`${msg.id}-src-${src.id}`}
                                        type="button"
                                        onClick={() => openInspector(src.tab)}
                                        style={{ borderColor: palette.borderDefault }}
                                        className="w-full text-left rounded-xl border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                                      >
                                        <div className="flex items-start gap-3 min-w-0">
                                          <span
                                            className={`w-7 h-7 rounded-md text-white flex items-center justify-center font-bold text-sm shrink-0 ${
                                              isLaw ? "bg-red-600" : isExcel ? "bg-emerald-600" : "bg-slate-500"
                                            }`}
                                          >
                                            {src.id}
                                          </span>
                                          <div>
                                            <span
                                              style={{ color: palette.accentCitation, fontSize: 14 }}
                                              className="font-semibold block leading-tight"
                                            >
                                              {src.name}
                                            </span>
                                            <span
                                              style={{ color: palette.textSecondary, fontSize: 12.5 }}
                                              className="block leading-tight mt-0.5"
                                            >
                                              {src.section}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="hidden md:block max-w-[340px] text-left">
                                          <p style={{ color: palette.textSecondary, fontSize: 12.5, lineHeight: 1.4 }}>
                                            {isLaw
                                              ? "Regulación del trabajo voluntario y recargo obligatorio: 25% las dos primeras horas y 35% las restantes."
                                              : isExcel
                                              ? "Impacto de provisiones por horas extras en EBITDA proyectado y margen porcentual."
                                              : "Procedimiento interno para el registro de horas extras y validación con el área de RR.HH."}
                                          </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight">
                                            {isLaw ? "Pág. 14" : isExcel ? "Celda E14" : "p. 28"}
                                          </span>
                                          <span style={{ color: palette.textMuted, fontSize: 11.5 }} className="block leading-tight">
                                            {isLaw ? "Similitud 0.95" : isExcel ? "Similitud 0.92" : "v2.1 - 2026"}
                                          </span>
                                          <span
                                            style={{ color: palette.accentCitation, fontSize: 12.5 }}
                                            className="font-medium block mt-1 hover:underline"
                                          >
                                            {isLaw ? "Ver ley →" : isExcel ? "Ver celda →" : "Ver sección →"}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Estado de generación interactivo */}
                  {isSearching && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/60 animate-pulse text-blue-800 text-sm">
                      <HubIcon icon={RefreshCw} size={16} className="animate-spin" />
                      <span>
                        Recuperando vectores y sintetizando con {aiProviders.find((p) => p.id === activeLlmProviderId)?.name}...
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compositor / Barra de Chat fijada ergonómica con Capacidades Avanzadas */}
                <div className="shrink-0 pt-2 pb-1 bg-gradient-to-t from-white via-white to-transparent">
                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        borderColor: isRecordingVoice ? "#EF4444" : palette.borderDefault,
                        backgroundColor: palette.bgSurface,
                      }}
                      className={`rounded-2xl border shadow-md flex flex-col gap-2 p-3 transition-all ${
                        isRecordingVoice ? "ring-2 ring-red-300" : "focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
                      }`}
                    >
                      <textarea
                        ref={chatTextareaRef}
                        rows={1}
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          e.target.style.height = "auto";
                          const maxHeight = window.innerHeight * 0.35;
                          e.target.style.height = `${Math.min(maxHeight, Math.max(48, e.target.scrollHeight))}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (query.trim() && !isSearching) {
                              handleSubmit(e);
                              if (chatTextareaRef.current) {
                                chatTextareaRef.current.style.height = "auto";
                              }
                            }
                          }
                        }}
                        style={{
                          fontSize: 15,
                          maxHeight: "35vh",
                          minHeight: "48px",
                        }}
                        className="w-full bg-transparent focus:outline-none resize-none text-zinc-900 placeholder:text-zinc-400 leading-relaxed overflow-y-auto px-1 py-1"
                        placeholder={
                          isRecordingVoice
                            ? "Escuchando tu voz..."
                            : "Escribe tu consulta o repregunta en este hilo... (Enter para enviar, Shift+Enter para salto de línea)"
                        }
                        aria-label="Consulta en chat"
                      />

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100/90">
                        <div className="flex items-center gap-1.5">
                          {/* Botón Adjuntar Archivo / Imagen (abre selector real o modal de ingesta) */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors"
                            title="Adjuntar e indexar documento o planilla Excel"
                            aria-label="Adjuntar archivo o imagen"
                          >
                            <HubIcon icon={Paperclip} size={16} />
                          </button>

                          {/* Botón Dictado por Voz */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextState = !isRecordingVoice;
                              setIsRecordingVoice(nextState);
                              if (nextState) {
                                setQuery("¿Cuál es la provisión estimada en la matriz Excel del Q3?");
                              }
                            }}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                              isRecordingVoice
                                ? "bg-red-100 text-red-600 animate-pulse"
                                : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
                            }`}
                            title={isRecordingVoice ? "Detener grabación" : "Dictar consulta por voz"}
                            aria-label={isRecordingVoice ? "Detener grabación" : "Dictar consulta por voz"}
                          >
                            <HubIcon icon={isRecordingVoice ? MicOff : Mic} size={16} />
                          </button>

                          {/* Selector de Capacidad / Profundidad con icono Lucide compacto y modal redondeado */}
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowModeDropdown((v) => !v)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                chatMode === "fast"
                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                  : chatMode === "deep"
                                  ? "border-purple-200 bg-purple-50 text-purple-600"
                                  : "border-blue-200 bg-blue-50 text-blue-600"
                              }`}
                              title={`Capacidad de IA: ${
                                chatMode === "fast"
                                  ? "Rápido (Groq LPU)"
                                  : chatMode === "deep"
                                  ? "Razonamiento Profundo (DeepSeek R1/o1)"
                                  : "Estándar (GPT-4o)"
                              }`}
                              aria-label="Seleccionar capacidad del modelo"
                            >
                              <HubIcon
                                icon={chatMode === "fast" ? Zap : chatMode === "deep" ? Sparkles : Cpu}
                                size={16}
                              />
                            </button>

                            {/* Modal Flotante de Selección de Capacidad (Diseño 100% redondeado y estético) */}
                            {showModeDropdown && (
                              <div
                                ref={modeDropdownRef}
                                style={{
                                  backgroundColor: palette.bgSurface,
                                  borderColor: palette.borderDefault,
                                }}
                                className="absolute bottom-full mb-2 left-0 w-72 rounded-2xl border shadow-2xl p-2.5 z-50 text-xs space-y-1.5 animate-in fade-in slide-in-from-bottom-2"
                              >
                                <div className="px-2 py-1 flex items-center justify-between border-b border-zinc-100 pb-1.5 mb-1">
                                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                    Capacidad del Modelo
                                  </span>
                                  <span className="text-[10.5px] text-zinc-400 font-mono">IA Activa</span>
                                </div>

                                {[
                                  {
                                    id: "fast",
                                    label: "Rápido (Groq LPU)",
                                    desc: "Ultra baja latencia (~42ms) para respuestas ágiles",
                                    icon: Zap,
                                    color: "text-amber-500",
                                    bg: "bg-amber-50 border-amber-200 text-amber-700",
                                  },
                                  {
                                    id: "standard",
                                    label: "Estándar (GPT-4o)",
                                    desc: "Equilibrio ideal entre velocidad y precisión analítica",
                                    icon: Cpu,
                                    color: "text-blue-600",
                                    bg: "bg-blue-50 border-blue-200 text-blue-700",
                                  },
                                  {
                                    id: "deep",
                                    label: "Razonamiento Profundo",
                                    desc: "Cadena de deducción detallada para auditorías",
                                    icon: Sparkles,
                                    color: "text-purple-600",
                                    bg: "bg-purple-50 border-purple-200 text-purple-700",
                                  },
                                ].map((modeItem) => {
                                  const isSelected = chatMode === modeItem.id;
                                  return (
                                    <button
                                      key={modeItem.id}
                                      type="button"
                                      onClick={() => {
                                        setChatMode(modeItem.id as "fast" | "standard" | "deep");
                                        setShowModeDropdown(false);
                                      }}
                                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                                        isSelected
                                          ? modeItem.bg + " shadow-xs font-semibold"
                                          : "border-transparent hover:bg-zinc-50 text-zinc-700"
                                      }`}
                                    >
                                      <span className={`mt-0.5 p-1 rounded-lg bg-white border border-zinc-200/60 shadow-2xs ${modeItem.color}`}>
                                        <HubIcon icon={modeItem.icon} size={15} />
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <span className="block leading-tight text-[12.5px] font-semibold">
                                          {modeItem.label}
                                        </span>
                                        <span className="block leading-tight text-[11px] text-zinc-500 mt-0.5">
                                          {modeItem.desc}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <HubIcon icon={Check} size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSearching || !query.trim()}
                          style={{ backgroundColor: palette.actionPrimary }}
                          className="h-8 px-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 cursor-pointer shrink-0 transition-all shadow-xs disabled:opacity-40"
                          aria-label="Enviar mensaje"
                        >
                          <HubIcon icon={isSearching ? RefreshCw : Send} size={14} className={isSearching ? "animate-spin" : ""} />
                          <span>Enviar</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Sugerencias de repregunta rápida */}
                  <div className="flex items-center gap-2 mt-2 overflow-x-auto text-xs text-zinc-500 pb-1">
                    <span className="font-semibold text-zinc-400 shrink-0">Sugerencias:</span>
                    {[
                      "¿Qué dice el artículo 15 de la ley?",
                      "¿Cómo afectaría a la provisión del Q4?",
                      "Generar resumen de contingencia para auditoría",
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 cursor-pointer whitespace-nowrap transition-colors shadow-2xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== MÓDULO: SESIONES DE CHAT / CONVERSACIONES ===== */}
            {activeNav === "chats" && (
              <div className="px-4 sm:px-6 py-6 max-w-[940px] w-full mx-auto space-y-5 flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                      Sesiones de Conversación &amp; Chats
                    </h1>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Historial de hilos interactivos con el motor RAG. Cada sesión mantiene su propio contexto documental.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreateNewSession()}
                    style={{ backgroundColor: palette.actionPrimary }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white font-medium text-xs shadow-xs hover:opacity-90 cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <HubIcon icon={MessageSquarePlus} size={15} />
                    <span>+ Nueva Conversación</span>
                  </button>
                </div>

                {/* Lista de Sesiones de Chat */}
                <div className="space-y-3">
                  {chatSessions.map((session) => {
                    const isSelected = activeSessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        style={{
                          backgroundColor: palette.bgSurface,
                          borderColor: isSelected ? palette.accentCitation : palette.borderDefault,
                          boxShadow: isSelected ? `0 0 0 1px ${palette.accentCitation}40` : "none",
                        }}
                        className="p-4 rounded-xl border shadow-xs hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 text-sm block">{session.title}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                Activa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 line-clamp-2">{session.preview}</p>
                          <div className="flex items-center gap-3 text-[11.5px] text-zinc-400 pt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <HubIcon icon={Clock} size={12} />
                              <span>{session.date}</span>
                            </span>
                            <span>•</span>
                            <span className="font-medium text-zinc-600">{session.turns.length} mensajes</span>
                            <span>•</span>
                            <span className="font-mono text-blue-600 font-semibold">{session.provider}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (chatSessions.length <= 1) return;
                              const remaining = chatSessions.filter((s) => s.id !== session.id);
                              setChatSessions(remaining);
                              if (activeSessionId === session.id) {
                                setActiveSessionId(remaining[0]?.id || "");
                              }
                            }}
                            title="Eliminar sesión"
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                          >
                            <HubIcon icon={Trash2} size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSessionId(session.id);
                              setActiveNav("nuevo");
                            }}
                            style={{ backgroundColor: palette.actionPrimary }}
                            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shadow-xs"
                          >
                            <span>Continuar Chat</span>
                            <HubIcon icon={ArrowRight} size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== MÓDULO 2: REPOSITORIO DE FUENTES DINÁMICO ===== */}
            {activeNav === "fuentes" && (
              <div className="px-4 sm:px-6 py-6 max-w-[940px] w-full mx-auto space-y-5 flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                      Repositorio de Fuentes del Proyecto
                    </h1>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Archivos, leyes y matrices indexadas para la recuperación vectorial del proyecto{" "}
                      <span className="font-semibold text-zinc-800">
                        {projects.find((p) => p.id === activeProjectId)?.name}
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadFolder}
                    style={{ backgroundColor: palette.actionPrimary }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-90 cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <HubIcon icon={FolderPlus} size={15} />
                    <span>+ Carga de doc</span>
                  </button>
                </div>

                {/* Métricas Dinámicas del Repositorio */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Fuentes Activas
                    </span>
                    <span className="text-2xl font-bold text-zinc-900 block mt-1">
                      {currentProjectSources.length} archivos
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">100% vectorizadas y auditadas</span>
                  </div>
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Total Fragmentos
                    </span>
                    <span className="text-2xl font-bold text-blue-600 block mt-1">
                      {totalChunksCount.toLocaleString()} chunks
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">{embeddingModel}</span>
                  </div>
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Estado de Sincronización
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                      <HubIcon icon={CheckCircle2} size={20} />
                      <span>Al día</span>
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5 block">Sincronizado con pgvector</span>
                  </div>
                </div>

                {/* Filtros rápidos de fuentes */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                      { id: "all", label: `Todas las fuentes (${currentProjectSources.length})` },
                      { id: "legal", label: `Normativa Legal (${legalSourcesCount})` },
                      { id: "excel", label: `Matrices Financieras (${excelSourcesCount})` },
                      { id: "doc", label: `Manuales y Documentos (${docSourcesCount})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSourcesFilterType(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                          sourcesFilterType === tab.id
                            ? "bg-zinc-900 text-white font-semibold"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      value={sourcesSearch}
                      onChange={(e) => setSourcesSearch(e.target.value)}
                      placeholder="Buscar archivo..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                      <HubIcon icon={Search} size={14} />
                    </span>
                  </div>
                </div>

                {/* Lista detallada dinámica de fuentes */}
                <div className="space-y-3">
                  {currentProjectSources.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-zinc-200 bg-white space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                        <HubIcon icon={FileText} size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-900">
                          No hay fuentes en el proyecto "{activeProject.name}"
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                          Este espacio de trabajo aún no cuenta con documentos vectorizados. Carga un archivo o carpeta para activar la búsqueda semántica.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <HubIcon icon={Upload} size={15} />
                        <span>+ Cargar documentos</span>
                      </button>
                    </div>
                  ) : (
                    currentProjectSources
                    .filter((src) => sourcesFilterType === "all" || src.type === sourcesFilterType)
                    .filter(
                      (src) =>
                        !sourcesSearch.trim() ||
                        src.title.toLowerCase().includes(sourcesSearch.toLowerCase()) ||
                        src.description.toLowerCase().includes(sourcesSearch.toLowerCase())
                    )
                    .map((src) => {
                      const isReindexing = reindexingSourceId === src.id;
                      const iconComp =
                        src.type === "legal" ? Scale : src.type === "excel" ? FileSpreadsheet : FileText;
                      const iconColors =
                        src.type === "legal"
                          ? "bg-red-100 text-red-600"
                          : src.type === "excel"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-600";
                      const badgeColors =
                        src.type === "legal"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : src.type === "excel"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200";

                      return (
                        <div
                          key={src.id}
                          style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                          className="p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-10 h-10 rounded-lg ${iconColors} flex items-center justify-center shrink-0`}
                            >
                              <HubIcon icon={iconComp} size={20} />
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-zinc-900 text-sm">{src.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${badgeColors}`}
                                >
                                  {src.badge}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5">{src.description}</p>
                              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 flex-wrap">
                                <span>{src.metaPages}</span>
                                <span>•</span>
                                <span>{src.chunksCount.toLocaleString()} fragmentos vectorizados</span>
                                <span>•</span>
                                <span className="text-emerald-600 font-semibold">
                                  {isReindexing ? "Re-indexando..." : src.statusText}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => openInspector(src.inspectorTab)}
                              className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer shadow-xs transition-colors"
                            >
                              Inspeccionar en Visor
                            </button>
                            {src.type === "excel" && (
                              <button
                                type="button"
                                onClick={handleExcelExport}
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                                title="Descargar matriz CSV"
                              >
                                <HubIcon icon={Download} size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleReindexSource(src.id)}
                              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                              title="Re-indexar fragmentos"
                            >
                              <HubIcon
                                icon={RefreshCw}
                                size={14}
                                className={isReindexing ? "animate-spin text-blue-600" : ""}
                              />
                            </button>
                            {projectSources.length > 3 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setProjectSources((prev) => prev.filter((item) => item.id !== src.id))
                                }
                                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-red-50 hover:text-red-600 text-zinc-400 cursor-pointer transition-colors"
                                title="Eliminar fuente"
                              >
                                <HubIcon icon={Trash2} size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ===== MÓDULO 3: HISTORIAL DE CONSULTAS DINÁMICO ===== */}
            {activeNav === "historial" && (
              <div className="px-4 sm:px-6 py-6 max-w-[940px] w-full mx-auto space-y-5 flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                      Historial de Consultas y Dictámenes
                    </h1>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Registro histórico de análisis cruzados, respuestas guardadas y fuentes validadas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportHistoryCsv}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto inline-flex items-center gap-1.5 transition-all ${
                      historyExported
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <HubIcon icon={historyExported ? Check : Download} size={14} />
                    <span>{historyExported ? "¡CSV Descargado!" : "Exportar registro (.CSV)"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                      className="p-4 rounded-xl border shadow-xs hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="font-semibold text-zinc-900 text-sm block">{item.question}</span>
                        <p className="text-xs text-zinc-600 line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-3 text-[11.5px] text-zinc-400 pt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <HubIcon icon={Clock} size={12} />
                            <span>{item.date}</span>
                          </span>
                          <span>•</span>
                          <span>{item.sourcesCount} fuentes cruzadas</span>
                          <span>•</span>
                          <span className="font-mono text-zinc-500">Coseno: {item.similarity}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-mono">{item.latency}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {historyItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setHistoryItems((prev) => prev.filter((h) => h.id !== item.id))
                            }
                            className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Eliminar del historial"
                          >
                            <HubIcon icon={Trash2} size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScenario(item.scenario);
                            setInspectorTab(item.tab);
                            setInspectorOpen(true);
                            setActiveNav("nuevo");
                            handleSendMessage(item.question);
                          }}
                          style={{ backgroundColor: palette.bgSubtle, color: palette.accentCitation }}
                          className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all"
                        >
                          <span>Ejecutar en Asistente</span>
                          <HubIcon icon={ArrowRight} size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== MÓDULO UNIFICADO: CONFIGURACIÓN & PROVEEDORES IA (7) ===== */}
            {activeNav === "config" && (
              <div className="px-4 sm:px-6 py-6 max-w-[940px] w-full mx-auto space-y-5 flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                      Configuración del Sistema RAG
                    </h1>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Gestión de proveedores de Inteligencia Artificial, modelos fundacionales y parámetros del motor vectorial.
                    </p>
                  </div>

                  {/* Sub-Tabs de Configuración */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setConfigTab("providers")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                        configTab === "providers"
                          ? "bg-white text-zinc-900 shadow-xs"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <HubIcon icon={Cpu} size={14} />
                      <span>Proveedores de IA (7)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigTab("engine")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                        configTab === "engine"
                          ? "bg-white text-zinc-900 shadow-xs"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <HubIcon icon={Settings} size={14} />
                      <span>Parámetros del Motor</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tab 1: 7 Proveedores de IA */}
                {configTab === "providers" && (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Matriz de Orquestación Multi-Modelo
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          aiProviders.forEach((p) => handlePingTest(p.id));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
                      >
                        <HubIcon icon={Zap} size={13} />
                        <span>Test de Latencia Global</span>
                      </button>
                    </div>

                    {/* 4 KPIs de Infraestructura IA */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div
                        style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                        className="p-3.5 rounded-xl border shadow-xs"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          LLM Primario
                        </span>
                        <span className="text-base font-bold text-zinc-900 block mt-1 truncate">
                          {aiProviders.find((p) => p.id === activeLlmProviderId)?.name}
                        </span>
                        <span className="text-[11.5px] text-blue-600 font-mono mt-0.5 block truncate">
                          {aiProviders.find((p) => p.id === activeLlmProviderId)?.selectedModel}
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                        className="p-3.5 rounded-xl border shadow-xs"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Reranker de Precisión
                        </span>
                        <span className="text-base font-bold text-purple-700 block mt-1 truncate">
                          {aiProviders.find((p) => p.id === activeRerankerProviderId)?.name}
                        </span>
                        <span className="text-[11.5px] text-zinc-500 font-mono mt-0.5 block">
                          rerank-v3.5 (Cross-Encoder)
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                        className="p-3.5 rounded-xl border shadow-xs"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Embeddings Vectoriales
                        </span>
                        <span className="text-base font-bold text-emerald-700 block mt-1 truncate">
                          {aiProviders.find((p) => p.id === activeEmbeddingProviderId)?.name}
                        </span>
                        <span className="text-[11.5px] text-zinc-500 font-mono mt-0.5 block">
                          1536 dimensiones (Coseno)
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                        className="p-3.5 rounded-xl border shadow-xs"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Latencia Media
                        </span>
                        <span className="text-base font-bold text-zinc-900 block mt-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>~128 ms</span>
                        </span>
                        <span className="text-[11.5px] text-zinc-500 mt-0.5 block">
                          Groq LPU a 42 ms récord
                        </span>
                      </div>
                    </div>

                    {/* Tarjetas de los 7 Proveedores */}
                    <div className="space-y-3">
                      {aiProviders.map((prov) => {
                        const isPrimaryLlm = prov.id === activeLlmProviderId;
                        const isReranker = prov.id === activeRerankerProviderId;
                        const isEmbedding = prov.id === activeEmbeddingProviderId;
                        const isEditingKey = editingApiKeyId === prov.id;

                        return (
                          <div
                            key={prov.id}
                            style={{
                              backgroundColor: palette.bgSurface,
                              borderColor: isPrimaryLlm ? palette.accentCitation : palette.borderDefault,
                              boxShadow: isPrimaryLlm ? `0 0 0 1px ${palette.accentCitation}40` : "none",
                            }}
                            className="p-4 rounded-xl border shadow-xs transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span
                                  style={{ backgroundColor: `${prov.logoColor}15`, color: prov.logoColor }}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-zinc-200/80"
                                >
                                  <HubIcon icon={Cpu} size={20} />
                                </span>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-zinc-900 text-sm">{prov.name}</span>
                                    <span className="text-xs text-zinc-400 font-mono">({prov.company})</span>
                                    {isPrimaryLlm && (
                                      <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-blue-100 text-blue-800 font-bold border border-blue-300 flex items-center gap-1">
                                        <HubIcon icon={Sparkles} size={11} />
                                        <span>LLM Primario</span>
                                      </span>
                                    )}
                                    {isReranker && (
                                      <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-purple-100 text-purple-800 font-bold border border-purple-300 flex items-center gap-1">
                                        <HubIcon icon={Zap} size={11} />
                                        <span>Reranker</span>
                                      </span>
                                    )}
                                    {isEmbedding && (
                                      <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                                        <HubIcon icon={CheckCircle2} size={11} />
                                        <span>Embeddings</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-0.5">{prov.description}</p>
                                </div>
                              </div>

                              {/* Ping en vivo */}
                              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                <div className="text-right">
                                  <span className="font-mono text-xs font-bold text-zinc-900 block">
                                    {prov.latency} ms
                                  </span>
                                  <span className="text-[10.5px] text-emerald-600 block flex items-center gap-1 justify-end">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                    <span>En línea</span>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePingTest(prov.id)}
                                  className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                                  title="Probar latencia"
                                >
                                  <HubIcon icon={RefreshCw} size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Controles de Configuración del Proveedor */}
                            <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <label className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                                  Modelo Activo
                                </label>
                                <div ref={openProviderModelDropdownId === prov.id ? providerModelDropdownRef : undefined} className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenProviderModelDropdownId((prev) => (prev === prov.id ? null : prov.id))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 cursor-pointer focus:outline-none flex items-center justify-between gap-2 hover:border-zinc-300 transition-all text-left"
                                  >
                                    <span className="truncate">{prov.selectedModel}</span>
                                    <HubIcon
                                      icon={ChevronDown}
                                      size={13}
                                      className={`text-zinc-400 shrink-0 transition-transform ${
                                        openProviderModelDropdownId === prov.id ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                  {openProviderModelDropdownId === prov.id && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-zinc-200 bg-white shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in">
                                      {prov.models.map((m) => {
                                        const isModSelected = prov.selectedModel === m;
                                        return (
                                          <button
                                            key={m}
                                            type="button"
                                            onClick={() => {
                                              handleModelChange(prov.id, m);
                                              setOpenProviderModelDropdownId(null);
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-[12px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                              isModSelected
                                                ? "bg-blue-50 text-blue-700 font-semibold"
                                                : "text-zinc-700 hover:bg-zinc-100 font-medium"
                                            }`}
                                          >
                                            <span className="truncate">{m}</span>
                                            {isModSelected && (
                                              <HubIcon icon={Check} size={13} className="text-blue-600 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                                  Ventana: {prov.contextWindow}
                                </span>
                              </div>

                              <div>
                                <label className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                                  Credenciales (API Key)
                                </label>
                                <div className="relative flex items-center gap-1">
                                  <div className="relative flex-1 flex items-center">
                                    <span className="absolute left-2.5 text-zinc-400">
                                      <HubIcon icon={Key} size={12} />
                                    </span>
                                    <input
                                      type={isEditingKey ? "text" : "password"}
                                      readOnly={!isEditingKey}
                                      value={isEditingKey ? apiKeyDraft : prov.apiKeyMask}
                                      onChange={(e) => setApiKeyDraft(e.target.value)}
                                      placeholder="Ingresa nueva API Key..."
                                      className={`w-full pl-7 pr-2 py-1.5 rounded-lg border font-mono text-[11px] ${
                                        isEditingKey
                                          ? "border-blue-400 bg-white text-zinc-900 focus:outline-none"
                                          : "border-zinc-200 bg-zinc-50 text-zinc-600"
                                      }`}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isEditingKey) {
                                        if (apiKeyDraft.trim()) {
                                          setAiProviders((prev) =>
                                            prev.map((p) =>
                                              p.id === prov.id ? { ...p, apiKeyMask: apiKeyDraft.trim() } : p
                                            )
                                          );
                                        }
                                        setEditingApiKeyId(null);
                                        setApiKeyDraft("");
                                      } else {
                                        setEditingApiKeyId(prov.id);
                                        setApiKeyDraft(prov.apiKeyMask);
                                      }
                                    }}
                                    className="px-2 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-[11px] font-semibold text-zinc-700 cursor-pointer shrink-0"
                                  >
                                    {isEditingKey ? "Guardar" : "Editar"}
                                  </button>
                                </div>
                                <span className="text-[10px] text-emerald-600 mt-0.5 block flex items-center gap-1">
                                  <HubIcon icon={ShieldCheck} size={11} />
                                  <span>Cifrado AES-256 local</span>
                                </span>
                              </div>

                              <div className="flex flex-col justify-end gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSwitchPrimaryLlm(prov.id)}
                                    disabled={isPrimaryLlm}
                                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-[11.5px] cursor-pointer transition-all ${
                                      isPrimaryLlm
                                        ? "bg-blue-600 text-white cursor-default"
                                        : "border border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                                    }`}
                                  >
                                    {isPrimaryLlm ? "LLM Primario Activo" : "Hacer Primario"}
                                  </button>
                                  {(prov.id === "cohere" || prov.id === "openai") && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        prov.id === "cohere"
                                          ? handleSwitchReranker("cohere")
                                          : handleSwitchEmbedding("openai")
                                      }
                                      className="py-1.5 px-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-[11px] font-medium cursor-pointer"
                                    >
                                      {prov.id === "cohere" ? "Reranker" : "Embeddings"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Parámetros del Motor RAG */}
                {configTab === "engine" && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* 1. Modelo de Embedding (Con Desplegable Redondeado) */}
                    <div
                      style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                      className="p-4 rounded-xl border shadow-xs space-y-2"
                    >
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Modelo de Embeddings Vectoriales
                      </label>
                      <div ref={embeddingDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEmbeddingDropdown((v) => !v)}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 flex items-center justify-between gap-2 cursor-pointer hover:border-zinc-300 transition-all text-left"
                        >
                          <span className="truncate">
                            {embeddingModel === "text-embedding-3-small"
                              ? "OpenAI text-embedding-3-small (1536 dimensiones - Latencia reducida)"
                              : embeddingModel === "text-embedding-3-large"
                              ? "OpenAI text-embedding-3-large (3072 dimensiones - Alta precisión)"
                              : "Cohere embed-multilingual-v3.0 (1024 dimensiones - Multilingüe)"}
                          </span>
                          <HubIcon
                            icon={ChevronDown}
                            size={15}
                            className={`text-zinc-400 shrink-0 transition-transform ${
                              showEmbeddingDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {showEmbeddingDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-zinc-200 bg-white shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in">
                            {[
                              {
                                id: "text-embedding-3-small",
                                label: "OpenAI text-embedding-3-small (1536 dimensiones - Latencia reducida)",
                              },
                              {
                                id: "text-embedding-3-large",
                                label: "OpenAI text-embedding-3-large (3072 dimensiones - Alta precisión)",
                              },
                              {
                                id: "cohere-multilingual",
                                label: "Cohere embed-multilingual-v3.0 (1024 dimensiones - Multilingüe)",
                              },
                            ].map((opt) => {
                              const isEmbSelected = embeddingModel === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setEmbeddingModel(opt.id);
                                    setShowEmbeddingDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-[13px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                    isEmbSelected
                                      ? "bg-blue-50 text-blue-700 font-semibold"
                                      : "text-zinc-700 hover:bg-zinc-100 font-medium"
                                  }`}
                                >
                                  <span className="truncate">{opt.label}</span>
                                  {isEmbSelected && (
                                    <HubIcon icon={Check} size={14} className="text-blue-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <p className="text-[11.5px] text-zinc-400">
                        Determina la densidad del espacio latente y la precisión en búsquedas semánticas multilingües.
                      </p>
                    </div>

                    {/* 2. Corte de Similitud Coseno */}
                    <div
                      style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                      className="p-4 rounded-xl border shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                          Umbral Mínimo de Similitud Coseno
                        </label>
                        <span className="font-mono text-sm font-bold text-blue-600">
                          ≥ {similarityThreshold.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.60"
                        max="0.95"
                        step="0.05"
                        value={similarityThreshold}
                        onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>0.60 (Mayor cobertura de fuentes)</span>
                        <span>0.75 (Balanceado recomendado)</span>
                        <span>0.95 (Solo coincidencias exactas)</span>
                      </div>
                    </div>

                    {/* 3. Top-K Chunks */}
                    <div
                      style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                      className="p-4 rounded-xl border shadow-xs space-y-2"
                    >
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Profundidad de Recuperación (Top-K Chunks)
                      </label>
                      <div className="flex items-center gap-2">
                        {[3, 5, 8, 12].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setTopK(k)}
                            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              topK === k
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                            }`}
                          >
                            {k} fragmentos
                          </button>
                        ))}
                      </div>
                      <p className="text-[11.5px] text-zinc-400">
                        Cantidad de fragmentos más relevantes inyectados en el contexto de generación del LLM.
                      </p>
                    </div>

                    {/* 4. Toggles de Optimización */}
                    <div
                      style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                      className="p-4 rounded-xl border shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-zinc-900 block">Reranker de Precisión (Cohere Cross-Encoder)</span>
                          <span className="text-xs text-zinc-500 block">
                            Reordena los fragmentos recuperados para reducir alucinaciones en un 42%.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableReranker((v) => !v)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            enableReranker ? "bg-blue-600" : "bg-zinc-300"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                              enableReranker ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="h-px bg-zinc-100" />

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-zinc-900 block">Búsqueda Híbrida (Dense Vector + BM25 Sparse)</span>
                          <span className="text-xs text-zinc-500 block">
                            Combina embeddings con coincidencia léxica exacta para números de ley y celdas Excel.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHybridSearch((v) => !v)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            hybridSearch ? "bg-blue-600" : "bg-zinc-300"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                              hybridSearch ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Botones de acción con confirmación inline */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmbeddingModel("text-embedding-3-small");
                          setSimilarityThreshold(0.75);
                          setTopK(5);
                          setEnableReranker(true);
                          setHybridSearch(true);
                        }}
                        className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        Restablecer Valores
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEngineParamsSaved(true);
                          setTimeout(() => setEngineParamsSaved(false), 2000);
                        }}
                        style={{
                          backgroundColor: engineParamsSaved ? "#059669" : palette.actionPrimary,
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs hover:opacity-90 cursor-pointer transition-all inline-flex items-center gap-1.5"
                      >
                        {engineParamsSaved && <HubIcon icon={Check} size={14} />}
                        <span>{engineParamsSaved ? "¡Parámetros Guardados!" : "Guardar Parámetros"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ===== COLUMNA 3: INSPECTOR DE FUENTES (COLAPSABLE, NO TOCA EL HEADER) ===== */}
          {inspectorOpen ? (
            <aside
              style={{
                width: `${inspectorWidth}px`,
                backgroundColor: palette.bgSurface,
                borderColor: palette.borderDefault,
              }}
              className="hidden xl:flex shrink-0 border-l flex-col h-full overflow-y-auto relative transition-[width] duration-75"
            >
              {/* Tirador de redimensionamiento con mouse */}
              <div
                onMouseDown={startResizingInspector}
                className={`absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-30 select-none ${
                  isResizingInspector ? "bg-blue-600 w-2" : ""
                }`}
                title="Arrastrar para redimensionar inspector"
              />
              {/* Header del inspector */}
              <div
                style={{ borderColor: palette.borderDefault }}
                className="px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10 border-b"
              >
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                    Inspector de evidencias
                  </h2>
                  <span
                    style={{ backgroundColor: palette.bgSubtle, color: palette.textSecondary, fontSize: 11 }}
                    className="px-2 py-0.5 rounded font-mono font-medium"
                  >
                    {inspectorTab === 1 ? "95.0% sim" : inspectorTab === 2 ? "92.0% sim" : "88.0% sim"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    style={{
                      borderColor: citationCopied ? "#10B981" : palette.borderDefault,
                      fontSize: 12,
                      color: citationCopied ? "#047857" : undefined,
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50 cursor-pointer text-zinc-700 shadow-xs transition-colors"
                    title="Copiar cita formal"
                  >
                    <HubIcon icon={citationCopied ? Check : Copy} size={13} />
                    <span>{citationCopied ? "¡Copiado!" : "Cita"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorOpen(false)}
                    className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 cursor-pointer text-zinc-500 transition-colors"
                    title="Colapsar inspector de evidencias"
                    aria-label="Colapsar inspector de evidencias"
                  >
                    <HubIcon icon={PanelRightClose} size={16} />
                  </button>
                </div>
              </div>

              {/* 3 Tabs segmentados o Estado Vacío */}
              {currentProjectSources.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <HubIcon icon={FileText} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                      Sin evidencias en este proyecto
                    </h3>
                    <p style={{ fontSize: 13 }} className="text-zinc-500 mt-1 max-w-xs mx-auto">
                      El proyecto "{activeProject.name}" aún no tiene fuentes documentales cargadas. Carga un archivo para inspeccionar fragmentos y vectores.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer border border-indigo-200 transition-colors"
                  >
                    <HubIcon icon={Upload} size={14} />
                    <span>+ Cargar documentos</span>
                  </button>
                </div>
              ) : activeProjectId !== "auditoria-q3" ? (
                <div className="p-4 space-y-4">
                  {(() => {
                    const activeSrc = currentProjectSources[inspectorTab - 1] || currentProjectSources[0];
                    return (
                      <div className="space-y-3">
                        <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <p style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                              {activeSrc.title}
                            </p>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {activeSrc.badge}
                            </span>
                          </div>
                          <p style={{ color: palette.textSecondary, fontSize: 13 }} className="mt-0.5">
                            {activeSrc.metaPages} • {activeSrc.chunksCount.toLocaleString()} vectores
                          </p>
                          <p style={{ fontSize: 14, lineHeight: 1.6 }} className="mt-2 text-zinc-800">
                            "{activeSrc.description}"
                          </p>
                        </div>
                        <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3 grid grid-cols-2 gap-2 text-sm shadow-xs">
                          <span style={{ color: palette.textSecondary }}>Estado</span>
                          <span className="font-medium text-emerald-700">{activeSrc.statusText}</span>
                          <span style={{ color: palette.textSecondary }}>Colección</span>
                          <span className="font-medium text-zinc-900">{activeProject.name}</span>
                          <span style={{ color: palette.textSecondary }}>Dimensión</span>
                          <span className="font-medium text-zinc-900">1536d (pgvector)</span>
                        </div>
                        {/* Traza Supabase Vector */}
                        <div
                          style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSubtle }}
                          className="border rounded-xl p-3 space-y-1.5 text-xs shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-900">Traza Supabase Vector</span>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              RLS Verificado
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11.5px] pt-1">
                            <span style={{ color: palette.textSecondary }}>Modelo Embedding:</span>
                            <span className="font-mono text-zinc-800 text-right">{embeddingModel}</span>
                            <span style={{ color: palette.textSecondary }}>Índice PG:</span>
                            <span className="font-mono text-zinc-800 text-right">HNSW (vector_ip_ops)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {/* 3 Tabs segmentados */}
                  <div className="px-4 pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectorTab(1)}
                  style={{
                    backgroundColor: inspectorTab === 1 ? palette.bgSurface : "transparent",
                    borderColor: inspectorTab === 1 ? "#DC2626" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-lg px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
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
                    backgroundColor: inspectorTab === 2 ? palette.bgSurface : "transparent",
                    borderColor: inspectorTab === 2 ? "#059669" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-lg px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
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
                    backgroundColor: inspectorTab === 3 ? palette.bgSurface : "transparent",
                    borderColor: inspectorTab === 3 ? "#64748B" : "transparent",
                    borderWidth: 1.5,
                  }}
                  className="flex-1 rounded-lg px-2 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
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
                    <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3.5 shadow-xs">
                      <p style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                        D.S. N.° 007-2002-TR
                      </p>
                      <p style={{ color: palette.textSecondary, fontSize: 13 }} className="mt-0.5">
                        Artículo 9 - Jornada de trabajo · p. 12
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.6 }} className="mt-2 text-zinc-800">
                        “El trabajo en sobretiempo es voluntario. La falta de registro en el sistema de control de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes.”
                      </p>
                    </div>
                    <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3 grid grid-cols-2 gap-2 text-sm shadow-xs">
                      <span style={{ color: palette.textSecondary }}>Norma</span>
                      <span className="font-medium text-zinc-900">D.S. 007-2002-TR</span>
                      <span style={{ color: palette.textSecondary }}>Página oficial</span>
                      <span className="font-medium text-zinc-900">Pág. 12</span>
                      <span style={{ color: palette.textSecondary }}>Publicación</span>
                      <span className="font-medium text-zinc-900">24/08/2002</span>
                    </div>

                    {/* Traza Supabase Vector */}
                    <div
                      style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSubtle }}
                      className="border rounded-xl p-3 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Traza Supabase Vector</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          RLS Verificado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11.5px] pt-1">
                        <span style={{ color: palette.textSecondary }}>Modelo Embedding:</span>
                        <span className="font-mono text-zinc-800 text-right">gte-small (384d)</span>
                        <span style={{ color: palette.textSecondary }}>Índice PG:</span>
                        <span className="font-mono text-zinc-800 text-right">HNSW (vector_ip_ops)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña 2: Excel */}
                {inspectorTab === 2 && (
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <HubIcon icon={FileSpreadsheet} size={18} />
                      </span>
                      <div>
                        <span style={{ fontSize: 14.5 }} className="block font-bold leading-tight text-zinc-900">
                          Modelo Financiero Q3 2026.xlsx
                        </span>
                        <span style={{ color: palette.textSecondary, fontSize: 13 }} className="block">
                          Hoja: Proyecciones
                        </span>
                      </div>
                    </div>

                    {/* Barra de fórmulas */}
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ borderColor: palette.borderDefault, fontSize: 13 }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border font-mono bg-white text-zinc-700"
                      >
                        D13 <span style={{ fontSize: 10 }}>▼</span>
                      </span>
                      <span style={{ color: palette.textSecondary, fontSize: 14 }} className="font-serif italic font-bold">
                        fx
                      </span>
                      <code
                        style={{ borderColor: palette.borderDefault, color: palette.accentCitation, fontSize: 13 }}
                        className="flex-1 border rounded-md px-2 py-1 font-mono truncate bg-white"
                      >
                        =SUMA(D12:D14)
                      </code>
                    </div>

                    {/* Grilla interactiva de Excel */}
                    <div
                      style={{ borderColor: palette.borderDefault }}
                      className="overflow-x-auto rounded-xl border bg-white shadow-xs"
                    >
                      <table className="w-full border-collapse font-mono text-xs tabular-nums">
                        <thead>
                          <tr style={{ backgroundColor: palette.bgSubtle }} className="border-b">
                            <th style={{ borderColor: palette.borderDefault }} className="py-1 px-2 border-r w-8 text-center text-zinc-400">
                              {" "}
                            </th>
                            {["A", "B", "C", "D", "E"].map((col) => (
                              <th
                                key={col}
                                style={{ borderColor: palette.borderDefault }}
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
                                  borderColor: palette.borderDefault,
                                  backgroundColor: isHighlighted ? "#ECFDF5" : "#FFFFFF",
                                }}
                                className="border-b last:border-b-0"
                              >
                                <td
                                  style={{ borderColor: palette.borderDefault, color: palette.textMuted }}
                                  className="py-1 px-1.5 border-r text-center text-[11px]"
                                >
                                  {r.n}
                                </td>
                                <td
                                  style={{ borderColor: palette.borderDefault }}
                                  className="py-1 px-2 border-r text-zinc-800"
                                  colSpan={2}
                                >
                                  {r.label}
                                </td>
                                <td
                                  style={{
                                    borderColor: isHighlighted ? "#059669" : palette.borderDefault,
                                    borderWidth: isHighlighted ? 1.5 : 1,
                                  }}
                                  className={`py-1 px-2 border-r text-right font-semibold ${
                                    isHighlighted ? "text-emerald-800 bg-emerald-50" : "text-zinc-800"
                                  }`}
                                >
                                  {r.value}
                                </td>
                                <td style={{ borderColor: palette.borderDefault }} className="py-1 px-2 text-zinc-700">
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
                        style={{ borderColor: palette.borderDefault, fontSize: 13 }}
                        className="border rounded-xl divide-y bg-white shadow-xs"
                      >
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: palette.textSecondary }}>Rango</span>
                          <span className="font-mono text-zinc-900">D12:D14</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: palette.textSecondary }}>Celda activa</span>
                          <span className="font-mono text-zinc-900">D13</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2 items-center">
                          <span style={{ color: palette.textSecondary }}>Fórmula</span>
                          <code style={{ backgroundColor: palette.bgSubtle, fontSize: 12 }} className="px-1.5 py-0.5 rounded font-mono text-zinc-800">
                            =SUMA(D12:D14)
                          </code>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: palette.textSecondary }}>Valor</span>
                          <span className="font-mono font-semibold text-zinc-900">48,500</span>
                        </div>
                        <div className="grid grid-cols-2 px-3 py-1.5 gap-2">
                          <span style={{ color: palette.textSecondary }}>Formato</span>
                          <span className="text-zinc-900">Número (USD)</span>
                        </div>
                      </div>
                    </div>

                    {/* Contexto de la fuente */}
                    <div>
                      <h3 style={{ fontSize: 14 }} className="font-bold text-zinc-900 mb-1.5">
                        Contexto de la fuente
                      </h3>
                      <p style={{ color: palette.textSecondary, fontSize: 13.5, lineHeight: 1.5 }} className="italic">
                        “Cálculo de provisión por contingencias laborales y su impacto en el margen EBITDA del tercer trimestre 2026.”
                      </p>
                    </div>

                    {/* Botón: Abrir en Excel completo */}
                    <button
                      type="button"
                      onClick={handleExcelExport}
                      style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSurface }}
                      className="w-full py-2 px-3 rounded-xl border hover:bg-zinc-50 cursor-pointer text-sm font-medium flex items-center justify-center gap-2 text-zinc-800 shadow-xs transition-colors"
                    >
                      <HubIcon icon={ExternalLink} size={15} />
                      <span>Abrir en Excel completo</span>
                    </button>

                    {/* Traza Supabase Vector */}
                    <div
                      style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSubtle }}
                      className="border rounded-xl p-3 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Traza Supabase Vector</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          RLS Verificado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11.5px] pt-1">
                        <span style={{ color: palette.textSecondary }}>Modelo Embedding:</span>
                        <span className="font-mono text-zinc-800 text-right">gte-small (384d)</span>
                        <span style={{ color: palette.textSecondary }}>Índice PG:</span>
                        <span className="font-mono text-zinc-800 text-right">HNSW (vector_ip_ops)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña 3: Documento */}
                {inspectorTab === 3 && (
                  <div className="space-y-3">
                    <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3.5 shadow-xs">
                      <p style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                        Manual de Políticas Laborales
                      </p>
                      <p style={{ color: palette.textSecondary, fontSize: 13 }} className="mt-0.5">
                        Sección 4.2 - Control de asistencia · p. 28
                      </p>
                      <p style={{ fontSize: 14, lineHeight: 1.6 }} className="mt-2 text-zinc-800">
                        “Procedimiento interno para el registro de horas extras y validación con el área de RR.HH. Toda provisión contingente superior a USD 25,000 requiere dictamen vinculante del comité de auditoría antes del día 25 del mes.”
                      </p>
                    </div>
                    <div style={{ borderColor: palette.borderDefault }} className="border rounded-xl p-3 grid grid-cols-2 gap-2 text-sm shadow-xs">
                      <span style={{ color: palette.textSecondary }}>Documento</span>
                      <span className="font-medium text-zinc-900">Manual RR.HH.</span>
                      <span style={{ color: palette.textSecondary }}>Página</span>
                      <span className="font-medium text-zinc-900">Pág. 28</span>
                      <span style={{ color: palette.textSecondary }}>Versión</span>
                      <span className="font-medium text-zinc-900">v2.1 - 2026</span>
                    </div>

                    {/* Traza Supabase Vector */}
                    <div
                      style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSubtle }}
                      className="border rounded-xl p-3 space-y-1.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Traza Supabase Vector</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          RLS Verificado
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11.5px] pt-1">
                        <span style={{ color: palette.textSecondary }}>Modelo Embedding:</span>
                        <span className="font-mono text-zinc-800 text-right">gte-small (384d)</span>
                        <span style={{ color: palette.textSecondary }}>Índice PG:</span>
                        <span className="font-mono text-zinc-800 text-right">HNSW (vector_ip_ops)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
          ) : (
            /* Rail colapsado del Inspector en el panel lateral derecho (abajo, dentro de la columna, no en el topbar) */
            <aside
              style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgPage }}
              className="hidden xl:flex flex-col items-center pt-3 pb-4 px-1.5 border-l shrink-0 justify-between"
            >
              <button
                type="button"
                onClick={() => setInspectorOpen(true)}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 cursor-pointer text-zinc-600 transition-all shadow-xs flex flex-col items-center gap-1.5 group"
                title="Abrir Inspector de evidencias"
                aria-label="Abrir Inspector de evidencias"
              >
                <HubIcon icon={PanelRightOpen} size={16} />
                <span className="text-[10px] font-semibold text-zinc-500 [writing-mode:vertical-lr] tracking-wider py-1 group-hover:text-zinc-900">
                  Inspector
                </span>
              </button>
            </aside>
          )}
        </div>

        {/* Modal de Ingesta e Indexación de Documentos y Carpetas */}
        {showUploadModal && (
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }}
            className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              style={{ borderColor: palette.borderDefault }}
              className="bg-white rounded-2xl border max-w-xl w-full flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2">
                  <HubIcon icon={Upload} size={18} className="text-indigo-600" />
                  <span style={{ fontSize: 15 }} className="font-bold text-zinc-900">
                    Cargar Documentos o Carpeta al Proyecto ({(projects.find((p) => p.id === activeProjectId) || projects[0]).name})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 rounded hover:bg-zinc-200 cursor-pointer text-zinc-500"
                >
                  <HubIcon icon={X} size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition-all cursor-pointer flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <HubIcon icon={FileText} size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14.5 }} className="font-bold text-indigo-950">
                        Seleccionar Archivos de mi PC
                      </p>
                      <p style={{ fontSize: 12.5 }} className="text-indigo-700 mt-0.5">
                        PDF, DOCX, XLSX, CSV o TXT
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition-all cursor-pointer flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <HubIcon icon={FolderOpen} size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14.5 }} className="font-bold text-emerald-950">
                        Seleccionar Carpeta Completa
                      </p>
                      <p style={{ fontSize: 12.5 }} className="text-emerald-700 mt-0.5">
                        Indexa todos los documentos del directorio
                      </p>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <p style={{ fontSize: 12.5 }} className="font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Indexación rápida de plantillas corporativas (1-clic)
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddQuickTemplateSource({
                          title: "Directiva_Operativa_Fiscalizacion_2026.pdf",
                          type: "legal",
                          badge: "Norma Oficial",
                          description: "Directiva operativa de fiscalización laboral e inspección SUNAFIL 2026.",
                          metaPages: "36 páginas",
                          chunksCount: 186,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-between transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <HubIcon icon={Scale} size={16} className="text-amber-600 shrink-0" />
                        <div>
                          <p style={{ fontSize: 14.5 }} className="font-semibold text-zinc-900">
                            Directiva_Operativa_Fiscalizacion_2026.pdf
                          </p>
                          <p style={{ fontSize: 12.5 }} className="text-zinc-500">
                            Legal y Normativo • 186 vectores pgvector
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                        + Indexar
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddQuickTemplateSource({
                          title: "Matriz_Criterios_Auditoria_Q3.xlsx",
                          type: "excel",
                          badge: "Matriz Excel",
                          description: "Matriz consolidada de provisiones y criterios de auditoría financiera Q3.",
                          metaPages: "4 hojas",
                          chunksCount: 94,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-between transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <HubIcon icon={BarChart3} size={16} className="text-emerald-600 shrink-0" />
                        <div>
                          <p style={{ fontSize: 14.5 }} className="font-semibold text-zinc-900">
                            Matriz_Criterios_Auditoria_Q3.xlsx
                          </p>
                          <p style={{ fontSize: 12.5 }} className="text-zinc-500">
                            Hojas de Cálculo • 94 vectores pgvector
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                        + Indexar
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t bg-zinc-50 flex justify-between items-center">
                <span style={{ fontSize: 13 }} className="text-zinc-500">
                  Fuentes actuales en proyecto: <strong className="text-zinc-900">{currentProjectSources.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-700 font-medium text-sm hover:bg-zinc-100 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal SQL & Edge Function */}
        {showSqlModal && (
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50 }}
            className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div
              style={{ borderColor: palette.borderDefault }}
              className="bg-white rounded-2xl border max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
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
                  style={{ backgroundColor: palette.actionPrimary }}
                  className="px-4 py-1.5 rounded-lg text-white font-medium text-sm hover:opacity-90 cursor-pointer shadow-xs"
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
