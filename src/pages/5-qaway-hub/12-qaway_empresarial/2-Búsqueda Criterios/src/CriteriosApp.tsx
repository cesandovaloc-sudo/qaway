/* ============================================================================
 * CriteriosApp — Arquitectura Canónica v4.0 con Header Global Perenne
 * - Header fijo de extremo a extremo (no se deforma ni se mueve con los paneles)
 * - Temas auténticos Paper & Ink (THEME_CONFIG: bgPage, bgSurface, bgSubtle, etc.)
 * - Panel izquierdo ordenado: Colecciones Vectoriales -> Umbral Coseno -> Escenarios -> Indexar
 * - Inspector polimórfico y Workspace independientes con scroll autónomo
 * - Portabilidad Cloudflare: 100% imports relativos, cero iframes, namespace host-safe.
 * ============================================================================ */
import React, { useState, useRef, useEffect } from "react";
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
}

const DEFAULT_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Auditoría Financiera & EBITDA Q3",
    date: "Hoy, 10:14 AM",
    preview: "¿Cuál es la contingencia laboral por horas extras no registradas...",
    messagesCount: 2,
    provider: "OpenAI GPT-4o",
  },
  {
    id: "session-2",
    title: "Cálculo de sobretiempo D.S. 007-2002-TR",
    date: "Ayer, 4:30 PM",
    preview: "Análisis de sobretasas del 25% y 35% y carga de la prueba...",
    messagesCount: 4,
    provider: "Anthropic Claude 3.5",
  },
  {
    id: "session-3",
    title: "Revisión de Cláusulas de Auditoría RRHH",
    date: "14 Oct 2026",
    preview: "Procedimiento de la Sección 4.2 del Manual Interno...",
    messagesCount: 6,
    provider: "Cohere Command R+",
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
  const [activeProjectId, setActiveProjectId] = useState<string>("auditoria-q3");
  const [activeScenario, setActiveScenario] = useState<string>("auditoria");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>(2);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false); // Inicialmente colapsado
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>("nuevo");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sesiones de Chat
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

  // Chat multiturmo
  const [chatMessages, setChatMessages] = useState<ChatTurn[]>(INITIAL_CHAT_TURNS);

  // Módulo de 7 Proveedores de IA
  const [aiProviders, setAiProviders] = useState<AiProvider[]>(DEFAULT_PROVIDERS);
  const [activeLlmProviderId, setActiveLlmProviderId] = useState<string>("openai");
  const [activeRerankerProviderId, setActiveRerankerProviderId] = useState<string>("cohere");
  const [activeEmbeddingProviderId, setActiveEmbeddingProviderId] = useState<string>("openai");

  // Buscador y filtros del Header (Rojo)
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

  const palette = THEME_CONFIG[theme];

  // Escuchar clics fuera y tecla Escape para cerrar menús
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (quickSearchRef.current && !quickSearchRef.current.contains(event.target as Node)) {
        setShowQuickSearch(false);
        setShowModeDropdown(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setShowModeDropdown(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowFilterDropdown(false);
        setShowQuickSearch(false);
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

  function handleResetHome() {
    setQuery("¿Cuál es la contingencia laboral por horas extras no registradas y su impacto en el EBITDA del Q3?");
    setActiveScenario("auditoria");
    setInspectorTab(2);
    setInspectorOpen(true);
    setActiveNav("nuevo");
    showToastMessage("Vista de inicio restablecida");
  }

  const quickSearchResults = headerSearch.trim()
    ? ALL_SEARCHABLE_ITEMS.filter(
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
    showToastMessage(`Inspeccionando: ${result.title}`);
  }

  function handleSendMessage(textToSend?: string) {
    const q = (textToSend !== undefined ? textToSend : query).trim();
    if (!q) return;

    const userTurn: ChatTurn = {
      id: `turn-u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userTurn]);
    setQuery("");
    setIsSearching(true);

    setTimeout(() => {
      let ansText = `Analizando tu consulta sobre "${q}" bajo el corte de similitud ≥ ${similarityThreshold.toFixed(2)}. `;
      let sCount = 3;
      let hasTable = false;
      let tableData;

      const lowerQ = q.toLowerCase();
      if (lowerQ.includes("horas extras") || lowerQ.includes("ebitda") || lowerQ.includes("contingencia") || lowerQ.includes("laboral")) {
        ansText += "El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes [1]. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp [2].";
        hasTable = true;
        tableData = [
          { concept: "EBITDA (USD)", sin: "2,150,000", con: "2,101,500", var: "-48,500", isNegative: true },
          { concept: "Margen EBITDA", sin: "18.4%", con: "16.1%", var: "-2.3 pp", isNegative: true },
        ];
      } else if (lowerQ.includes("artículo") || lowerQ.includes("ley") || lowerQ.includes("007") || lowerQ.includes("norma")) {
        ansText += "Según el D.S. N.º 007-2002-TR (TUO de la Ley de Jornada de Trabajo), el artículo 9 y 10 estipulan que el sobretiempo antes de la hora de entrada o después de la salida debe ser remunerado con sobretasa [1]. La empresa debe resguardar registros de asistencia de al menos 5 años.";
        sCount = 1;
      } else if (lowerQ.includes("procedimiento") || lowerQ.includes("política") || lowerQ.includes("manual") || lowerQ.includes("rrhh")) {
        ansText += "La Sección 4.2 del Manual de Políticas Laborales establece que toda contingencia mayor a USD 25,000 requiere autorización del Comité de Auditoría y validación con RR.HH. [3]. Se recomienda emitir acta antes del cierre contable.";
        sCount = 1;
      } else {
        ansText += `Se recuperaron ${sCount} fragmentos vectorizados de alta concordancia. Los documentos corporativos y legales indican cumplimiento de plazos y validación previa de contingencias antes del cierre del ejercicio [1] [2] [3].`;
      }

      const activeProvider = aiProviders.find((p) => p.id === activeLlmProviderId) || aiProviders[0];

      const assistantTurn: ChatTurn = {
        id: `turn-a-${Date.now()}`,
        sender: "assistant",
        text: ansText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latency: `${activeProvider.latency} ms (${activeProvider.name})`,
        sourcesCount: sCount,
        scenarioId: activeScenario,
        hasTable,
        tableData,
        sources: [
          { id: 1, name: "D.S. N.º 007-2002-TR", section: "Art. 10 y 11 - Jornada y sobretiempo", tab: 1 },
          { id: 2, name: "Contingencias_Laborales_Q3.xlsx", section: "Hoja: Resumen_Ejecutivo • Celda E14", tab: 2 },
          { id: 3, name: "Manual de Políticas Laborales", section: "Sección 4.2 - Control de asistencia", tab: 3 },
        ],
      };

      setChatMessages((prev) => [...prev, assistantTurn]);
      setIsSearching(false);
      showToastMessage(`Respuesta generada con ${activeProvider.name} (${activeProvider.latency} ms)`);
    }, 400);
  }

  function handleResetChat() {
    setChatMessages(INITIAL_CHAT_TURNS);
    setQuery("");
    showToastMessage("Hilo de conversación reiniciado");
  }

  function handleScenario(id: string) {
    setActiveScenario(id);
    const found = SCENARIO_CARDS.find((s) => s.id === id);
    if (found) {
      if (id === "normativa") setInspectorTab(1);
      else if (id === "financiero") setInspectorTab(2);
      else if (id === "procedimiento") setInspectorTab(3);
      else setInspectorTab(2);
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
    const p = aiProviders.find((x) => x.id === providerId);
    showToastMessage(`${p?.name || providerId} establecido como LLM Primario`);
  }

  function handleSwitchReranker(providerId: string) {
    setActiveRerankerProviderId(providerId);
    setAiProviders((prev) =>
      prev.map((p) => ({
        ...p,
        role: p.id === providerId ? "reranker" : p.role === "reranker" ? "standby" : p.role,
      }))
    );
    const p = aiProviders.find((x) => x.id === providerId);
    showToastMessage(`${p?.name || providerId} establecido como Reranker`);
  }

  function handleSwitchEmbedding(providerId: string) {
    setActiveEmbeddingProviderId(providerId);
    const p = aiProviders.find((x) => x.id === providerId);
    showToastMessage(`${p?.name || providerId} asignado a Embeddings`);
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
    const p = aiProviders.find((x) => x.id === providerId);
    showToastMessage(`Ping a ${p?.name}: ${p?.latency || 120} ms • Estado: Óptimo`);
  }

  function handleModelChange(providerId: string, modelName: string) {
    setAiProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, selectedModel: modelName } : p))
    );
    showToastMessage(`Modelo cambiado a ${modelName}`);
  }

  function handleUploadFolder() {
    showToastMessage("Selecciona una carpeta o archivos para indexar en este proyecto");
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
      void navigator.clipboard.writeText(citation);
      showToastMessage("Cita formal copiada al portapapeles");
    } else {
      showToastMessage("Cita copiada");
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
    <div className="qaway-criterios-root" style={{ backgroundColor: palette.bgPage, color: palette.textPrimary }}>
      <div className="h-screen w-full overflow-hidden flex flex-col font-sans antialiased transition-colors duration-200">
        {/* Toast Notificación: abajo a la derecha no intrusivo */}
        {toast && (
          <div
            style={{ zIndex: 100 }}
            className="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-zinc-700 transition-all pointer-events-none"
          >
            <HubIcon icon={Check} size={16} className="text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* =========================================================================
         * HEADER GLOBAL FIJO Y PERENNE DE EXTREMO A EXTREMO (Top Bar Full Width)
         * ========================================================================= */}
        <header
          style={{
            backgroundColor: palette.bgSurface,
            borderColor: palette.borderDefault,
          }}
          className="w-full h-14 shrink-0 border-b flex items-center justify-between px-3 sm:px-4 z-30 sticky top-0 shadow-xs"
        >
          {/* Lado izquierdo: Bloque del Logo (delimitado al ancho del sidebar) + Toggle Sidebar */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-200/80 mr-1">
              {/* Logo Completo como Botón de Inicio */}
              <button
                type="button"
                onClick={handleResetHome}
                className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
                title="Reiniciar y volver al inicio"
              >
                <span
                  style={{ borderColor: palette.borderDefault, backgroundColor: palette.bgSurface }}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center shadow-xs shrink-0"
                >
                  <HubIcon icon={Layers} size={18} className="text-zinc-800" />
                </span>
                <span style={{ fontSize: 16.5 }} className="font-bold tracking-tight text-zinc-900 hidden sm:inline">
                  RAG Hub
                </span>
                <span
                  style={{
                    backgroundColor: palette.accentCitationBg,
                    color: palette.accentCitation,
                    fontSize: 11.5,
                  }}
                  className="px-1.5 py-0.5 rounded font-mono font-semibold"
                >
                  v4.0
                </span>
              </button>
            </div>
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

            {/* Avatar Carlos con Menú Desplegable */}
            <div ref={userMenuRef} className="relative flex items-center gap-1.5">
              <span
                style={{ backgroundColor: palette.actionPrimary }}
                className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm shadow-xs transition-colors"
              >
                C
              </span>
              <span style={{ fontSize: 13.5 }} className="font-medium text-zinc-800 hidden sm:inline">
                Carlos
              </span>
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="p-1 rounded hover:bg-zinc-100 cursor-pointer text-zinc-500"
                aria-label="Abrir menú de usuario"
              >
                <HubIcon icon={ChevronDown} size={15} />
              </button>

              {/* Menú Desplegable */}
              {showUserMenu && (
                <div
                  style={{
                    backgroundColor: palette.bgSurface,
                    borderColor: palette.borderDefault,
                    color: palette.textPrimary,
                  }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl py-1.5 z-40 text-xs"
                >
                  {/* Selector de Temas en UNA sola línea */}
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Tema visual
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[120px]">
                        {palette.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-lg">
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
                            className={`flex-1 py-1 px-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
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

                  {/* Opciones de perfil */}
                  <div className="py-1 px-1">
                    {[
                      { label: "Mi perfil", action: "Perfil" },
                      { label: "Mis análisis guardados", action: "Análisis" },
                      { label: "Cerrar sesión", action: "Sesión" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          showToastMessage(`${opt.label} seleccionado`);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 rounded-md cursor-pointer transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
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
          {/* ===== COLUMNA 1: SIDEBAR IZQUIERDO CON MÓDULOS UNIVERSALES ===== */}
                    {/* ===== COLUMNA 1: SIDEBAR IZQUIERDO CON MÓDULOS UNIVERSALES (COLAPSABLE A ICONOS) ===== */}
          <aside
            style={{
              backgroundColor: palette.bgPage,
              borderColor: palette.borderDefault,
            }}
            className={`shrink-0 border-r flex flex-col transition-all duration-200 overflow-y-auto ${
              sidebarOpen ? "w-[264px]" : "w-16 items-center"
            }`}
          >
            {sidebarOpen ? (
              // Modo Expandido
              <>
                {/* Cabecera del Panel con botón de colapso */}
                <div className="px-3 pt-3">
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

                  <div className="relative">
                    <select
                      value={activeProjectId}
                      onChange={(e) => {
                        setActiveProjectId(e.target.value);
                        const p = DEFAULT_PROJECTS.find((x) => x.id === e.target.value);
                        if (p) showToastMessage(`Cambiado a: ${p.name}`);
                      }}
                      style={{
                        backgroundColor: palette.bgSurface,
                        borderColor: palette.borderDefault,
                        fontSize: 13,
                      }}
                      className="w-full px-2.5 py-2 rounded-lg border font-medium text-zinc-900 shadow-xs cursor-pointer focus:outline-none appearance-none pr-7"
                    >
                      {DEFAULT_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <HubIcon
                      icon={ChevronDown}
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>

                  {/* Botón: Cargar documentos o carpeta */}
                  <button
                    type="button"
                    onClick={handleUploadFolder}
                    style={{
                      borderColor: palette.borderDefault,
                      backgroundColor: palette.bgSurface,
                    }}
                    className="w-full mt-2 px-2.5 py-1.5 rounded-lg border border-dashed text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                  >
                    <HubIcon icon={FolderPlus} size={15} className="text-zinc-500" />
                    <span>+ Cargar documentos / carpeta</span>
                  </button>
                </div>

                {/* Botón Prominente + Nueva Conversación (Estilo Antigravity 2.0) */}
                <div className="px-3 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `session-${Date.now()}`;
                      const newSession: ChatSession = {
                        id: newId,
                        title: `Conversación ${chatSessions.length + 1}`,
                        preview: "Conversación abierta, lista para recibir consultas al motor...",
                        date: "Ahora",
                        messagesCount: 1,
                        provider: activeLlmProvider.name,
                      };
                      setChatSessions((prev) => [newSession, ...prev]);
                      setActiveSessionId(newId);
                      handleResetChat();
                      setActiveNav("nuevo");
                      showToastMessage("Nueva conversación iniciada");
                    }}
                    style={{
                      backgroundColor: palette.actionPrimary,
                    }}
                    className="w-full px-3 py-2 rounded-lg text-white font-medium text-xs shadow-xs hover:opacity-90 cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <HubIcon icon={Plus} size={16} />
                    <span className="text-[13.5px] font-medium">Nueva Conversación</span>
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
                      { id: "fuentes", label: "Repositorio de Fuentes", icon: FileText },
                      { id: "historial", label: "Historial de Consultas", icon: History },
                      { id: "config", label: "Configuración & IA", icon: Settings },
                    ].map((item) => {
                      const isActive = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveNav(item.id);
                            showToastMessage(`Módulo: ${item.label}`);
                          }}
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
                      {chatSessions.length}
                    </span>
                  </div>

                  {isChatsListOpen && (
                    <div className="space-y-0.5 overflow-y-auto max-h-[220px] pr-0.5 scrollbar-thin">
                      {chatSessions.map((session) => {
                        const isCurrent = activeNav === "nuevo" && activeSessionId === session.id;
                        return (
                          <div
                            key={session.id}
                            className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                              isCurrent
                                ? "bg-zinc-200/70 text-zinc-900 font-semibold"
                                : "text-zinc-600 hover:bg-zinc-100"
                            }`}
                            onClick={() => {
                              setActiveSessionId(session.id);
                              setActiveNav("nuevo");
                              showToastMessage(`Cargada: ${session.title}`);
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
                              {chatSessions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChatSessions((prev) => prev.filter((s) => s.id !== session.id));
                                    if (activeSessionId === session.id) {
                                      const remaining = chatSessions.filter((s) => s.id !== session.id);
                                      setActiveSessionId(remaining[0]?.id || "");
                                    }
                                    showToastMessage(`Sesión eliminada`);
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
                      })}
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
                      <span style={{ fontSize: 10.5 }} className="text-zinc-400 font-mono">
                        3 activas
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <HubIcon icon={FileText} size={14} className="text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                          Documentos &amp; Manuales
                        </span>
                        <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                          124 docs • 12,480 fragmentos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <HubIcon icon={Scale} size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                          Leyes &amp; Normativa
                        </span>
                        <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                          86 docs • 8,320 fragmentos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <HubIcon icon={FileSpreadsheet} size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span style={{ fontSize: 12.5 }} className="block font-semibold leading-tight text-zinc-800">
                          Matrices Excel / CSV
                        </span>
                        <span style={{ color: palette.textSecondary, fontSize: 12 }} className="block leading-tight mt-0.5">
                          42 archivos • 6,120 fragmentos
                        </span>
                      </div>
                    </div>
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
                  onClick={() => {
                    const newId = `session-${Date.now()}`;
                    const newSession: ChatSession = {
                      id: newId,
                      title: `Conversación ${chatSessions.length + 1}`,
                      preview: "Conversación abierta, lista para recibir consultas al motor...",
                      date: "Ahora",
                      messagesCount: 1,
                      provider: activeLlmProvider.name,
                    };
                    setChatSessions((prev) => [newSession, ...prev]);
                    setActiveSessionId(newId);
                    handleResetChat();
                    setActiveNav("nuevo");
                    showToastMessage("Nueva conversación iniciada");
                  }}
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
                        onClick={() => {
                          setActiveNav(item.id);
                          if (item.id !== "nuevo") {
                            showToastMessage(`Módulo: ${item.label}`);
                          }
                        }}
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
                  title="Cargar documentos"
                  className="w-10 h-10 rounded-xl border border-dashed border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer transition-colors"
                >
                  <HubIcon icon={FolderPlus} size={17} />
                </button>
              </div>
            )}
          </aside>

          {/* ===== COLUMNA 2: PANEL CENTRAL - WORKSPACE CON SCROLL ===== */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
            {activeNav === "nuevo" && (
              <div className="px-4 sm:px-6 py-6 max-w-[920px] w-full mx-auto space-y-5 flex-1 flex flex-col min-h-0">
                {/* Header de la conversación */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                {/* 4 Tarjetas de escenarios sugeridos con Toggle para Minimizar y ganar espacio */}
                <div>
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
                      {SCENARIO_CARDS.map((c) => {
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

                {/* Hilo de Mensajes del Chat */}
                <div className="space-y-4 pt-2">
                  {chatMessages.map((msg) => {
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

                    // Mensaje del Asistente
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
                                  Con base en {msg.sourcesCount || 3} fuentes verificadas (Umbral &ge; {similarityThreshold.toFixed(2)})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSaved((v) => !v);
                                  showToastMessage(!saved ? "Guardado en análisis" : "Retirado de guardados");
                                }}
                                style={{
                                  borderColor: saved ? palette.accentCitation : palette.borderDefault,
                                  backgroundColor: saved ? palette.accentCitationBg : palette.bgSurface,
                                  color: saved ? palette.accentCitation : palette.textPrimary,
                                  fontSize: 12.5,
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium hover:opacity-90 cursor-pointer shadow-xs"
                              >
                                <HubIcon icon={Bookmark} size={14} />
                                <span>{saved ? "Guardado" : "Guardar"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleShare}
                                style={{ borderColor: palette.borderDefault, fontSize: 12.5, color: palette.textPrimary }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white font-medium hover:bg-zinc-50 cursor-pointer shadow-xs"
                              >
                                <HubIcon icon={Share2} size={14} />
                                <span>Compartir</span>
                              </button>
                            </div>
                          </div>

                          {/* Texto explicativo con citas interactivas */}
                          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: palette.textPrimary }}>
                            {msg.text.includes("[1]") || msg.text.includes("[2]") ? (
                              <>
                                El trabajo en sobretiempo es voluntario, pero la ausencia de registro en el sistema de asistencia invierte la carga de la prueba y genera recargos obligatorios del 25% para las dos primeras horas y 35% para las restantes{" "}
                                <button
                                  type="button"
                                  onClick={() => openInspector(1)}
                                  style={{
                                    backgroundColor: palette.accentCitationBg,
                                    color: palette.accentCitation,
                                    borderColor: `${palette.accentCitation}40`,
                                  }}
                                  className="inline-flex items-center justify-center px-1.5 py-0.2 rounded font-semibold text-xs border cursor-pointer hover:opacity-80 transition-colors"
                                >
                                  1
                                </button>
                                {" "}. Al cruzar esta obligación con la matriz financiera del tercer trimestre, la provisión contable por contingencias laborales asciende a USD 48,500, reduciendo el margen EBITDA proyectado en 2.3 pp{" "}
                                <button
                                  type="button"
                                  onClick={() => openInspector(2)}
                                  style={{
                                    backgroundColor: palette.accentCitationBg,
                                    color: palette.accentCitation,
                                    borderColor: `${palette.accentCitation}40`,
                                  }}
                                  className="inline-flex items-center justify-center px-1.5 py-0.2 rounded font-semibold text-xs border cursor-pointer hover:opacity-80 transition-colors"
                                >
                                  2
                                </button>
                                {" "}.
                              </>
                            ) : (
                              msg.text
                            )}
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

                          {/* Sección: Fuentes y referencias */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h2 style={{ fontSize: 14 }} className="font-bold text-zinc-900">
                                Fuentes y referencias vinculadas ({msg.sourcesCount || 3})
                              </h2>
                              <span style={{ fontSize: 12, color: palette.textMuted }}>
                                Clic para abrir en el Inspector lateral
                              </span>
                            </div>
                            <div className="space-y-2">
                              {/* Fuente 1: Ley */}
                              <button
                                type="button"
                                onClick={() => openInspector(1)}
                                style={{ borderColor: palette.borderDefault }}
                                className="w-full text-left rounded-xl border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="w-7 h-7 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    1
                                  </span>
                                  <div>
                                    <span style={{ color: palette.accentCitation, fontSize: 14 }} className="font-semibold block leading-tight">
                                      D.S. N.º 007-2002-TR
                                    </span>
                                    <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight mt-0.5">
                                      Artículos 10 y 11 - Jornada y sobretiempo
                                    </span>
                                  </div>
                                </div>
                                <div className="hidden md:block max-w-[340px] text-left">
                                  <p style={{ color: palette.textSecondary, fontSize: 12.5, lineHeight: 1.4 }}>
                                    Regulación del trabajo voluntario y recargo obligatorio: 25% las dos primeras horas y 35% las restantes.
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight">
                                    Pág. 14
                                  </span>
                                  <span style={{ color: palette.textMuted, fontSize: 11.5 }} className="block leading-tight">
                                    Similitud 0.95
                                  </span>
                                  <span style={{ color: palette.accentCitation, fontSize: 12.5 }} className="font-medium block mt-1 hover:underline">
                                    Ver ley →
                                  </span>
                                </div>
                              </button>

                              {/* Fuente 2: Excel */}
                              <button
                                type="button"
                                onClick={() => openInspector(2)}
                                style={{ borderColor: palette.borderDefault }}
                                className="w-full text-left rounded-xl border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    2
                                  </span>
                                  <div>
                                    <span style={{ color: palette.accentCitation, fontSize: 14 }} className="font-semibold block leading-tight">
                                      Contingencias_Laborales_Q3.xlsx
                                    </span>
                                    <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight mt-0.5">
                                      Hoja: Resumen_Ejecutivo • Celda E14
                                    </span>
                                  </div>
                                </div>
                                <div className="hidden md:block max-w-[340px] text-left">
                                  <p style={{ color: palette.textSecondary, fontSize: 12.5, lineHeight: 1.4 }}>
                                    Impacto de provisiones por horas extras en EBITDA proyectado y margen porcentual.
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight">
                                    Celda E14
                                  </span>
                                  <span style={{ color: palette.textMuted, fontSize: 11.5 }} className="block leading-tight">
                                    Similitud 0.92
                                  </span>
                                  <span style={{ color: palette.accentCitation, fontSize: 12.5 }} className="font-medium block mt-1 hover:underline">
                                    Ver celda →
                                  </span>
                                </div>
                              </button>

                              {/* Fuente 3: Documento */}
                              <button
                                type="button"
                                onClick={() => openInspector(3)}
                                style={{ borderColor: palette.borderDefault }}
                                className="w-full text-left rounded-xl border p-3 flex items-start justify-between gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="w-7 h-7 rounded-md bg-slate-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    3
                                  </span>
                                  <div>
                                    <span style={{ color: palette.accentCitation, fontSize: 14 }} className="font-semibold block leading-tight">
                                      Manual de Políticas Laborales
                                    </span>
                                    <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight mt-0.5">
                                      Sección 4.2 - Control de asistencia
                                    </span>
                                  </div>
                                </div>
                                <div className="hidden md:block max-w-[340px] text-left">
                                  <p style={{ color: palette.textSecondary, fontSize: 12.5, lineHeight: 1.4 }}>
                                    Procedimiento interno para el registro de horas extras y validación con el área de RR.HH.
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span style={{ color: palette.textSecondary, fontSize: 12.5 }} className="block leading-tight">
                                    p. 28
                                  </span>
                                  <span style={{ color: palette.textMuted, fontSize: 11.5 }} className="block leading-tight">
                                    v2.1 - 2026
                                  </span>
                                  <span style={{ color: palette.accentCitation, fontSize: 12.5 }} className="font-medium block mt-1 hover:underline">
                                    Ver sección →
                                  </span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Estado de generación interactivo */}
                  {isSearching && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/60 animate-pulse text-blue-800 text-sm">
                      <HubIcon icon={RefreshCw} size={16} className="animate-spin" />
                      <span>
                        Recuperando vectores y sintetizando con {aiProviders.find((p) => p.id === activeLlmProviderId)?.name}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Compositor / Barra de Chat fijada ergonómica con Capacidades Avanzadas */}
                <div className="sticky bottom-0 pt-3 pb-2 bg-gradient-to-t from-white via-white to-transparent">
                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        borderColor: isRecordingVoice ? "#EF4444" : palette.borderDefault,
                        backgroundColor: palette.bgSurface,
                      }}
                      className={`rounded-xl border shadow-md flex items-center gap-2 pl-3 pr-2 py-2 transition-all ${
                        isRecordingVoice ? "ring-2 ring-red-300" : ""
                      }`}
                    >
                      {/* Botón Adjuntar Archivo / Imagen */}
                      <button
                        type="button"
                        onClick={() => showToastMessage("Adjuntar documento, captura o planilla Excel para análisis")}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors"
                        title="Adjuntar archivo o imagen"
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
                            showToastMessage("Escuchando dictado por voz... (habla para consultar)");
                            setQuery("¿Cuál es la provisión estimada en la matriz Excel del Q3?");
                          } else {
                            showToastMessage("Dictado por voz finalizado");
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
                                    showToastMessage(`Modo cambiado a: ${modeItem.label}`);
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

                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ fontSize: 15 }}
                        className="flex-1 bg-transparent focus:outline-none min-w-0 text-zinc-900 placeholder:text-zinc-400"
                        placeholder={
                          isRecordingVoice
                            ? "Escuchando tu voz..."
                            : "Escribe tu consulta o repregunta en este hilo... (Enter para enviar)"
                        }
                        aria-label="Consulta en chat"
                      />
                      <button
                        type="submit"
                        disabled={isSearching}
                        style={{ backgroundColor: palette.actionPrimary }}
                        className="w-9 h-9 rounded-lg text-white flex items-center justify-center hover:opacity-90 cursor-pointer shrink-0 transition-all shadow-xs disabled:opacity-50"
                        aria-label="Enviar mensaje"
                      >
                        <HubIcon icon={isSearching ? RefreshCw : Send} size={16} className={isSearching ? "animate-spin" : ""} />
                      </button>
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
              <div className="px-4 sm:px-6 py-6 max-w-[920px] w-full mx-auto space-y-5 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                      Sesiones de Conversación &amp; Chats
                    </h1>
                    <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                      Historial de hilos interactivos con el motor RAG. Cada sesión mantiene su contexto documental.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = `session-${Date.now()}`;
                      const newSession: ChatSession = {
                        id: newId,
                        title: `Conversación ${chatSessions.length + 1}`,
                        preview: "Conversación abierta, lista para recibir consultas al motor...",
                        date: "Hoy",
                        messagesCount: 1,
                        provider: activeLlmProvider.name,
                      };
                      setChatSessions((prev) => [newSession, ...prev]);
                      setActiveSessionId(newId);
                      handleResetChat();
                      setActiveNav("nuevo");
                      showToastMessage("Nueva conversación creada");
                    }}
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
                            <span className="font-medium text-zinc-600">{session.messagesCount} mensajes</span>
                            <span>•</span>
                            <span className="font-mono text-blue-600 font-semibold">{session.provider}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (chatSessions.length <= 1) {
                                showToastMessage("Debe mantenerse al menos una sesión");
                                return;
                              }
                              setChatSessions((prev) => prev.filter((s) => s.id !== session.id));
                              if (activeSessionId === session.id) {
                                const remaining = chatSessions.filter((s) => s.id !== session.id);
                                setActiveSessionId(remaining[0]?.id || "");
                              }
                              showToastMessage(`Sesión eliminada: ${session.title}`);
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
                              showToastMessage(`Cargada: ${session.title}`);
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

            {/* ===== MÓDULO 2: REPOSITORIO DE FUENTES ===== */}
          {activeNav === "fuentes" && (
            <div className="px-6 py-6 max-w-[900px] w-full mx-auto space-y-5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                    Repositorio de Fuentes del Proyecto
                  </h1>
                  <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                    Archivos, leyes y matrices indexadas para la recuperación vectorial del motor RAG.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUploadFolder}
                  style={{ backgroundColor: palette.actionPrimary }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white font-medium text-xs shadow-xs hover:opacity-90 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <HubIcon icon={FolderPlus} size={15} />
                  <span>+ Cargar documentos</span>
                </button>
              </div>

              {/* Métricas del Repositorio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                  className="p-3.5 rounded-xl border shadow-xs"
                >
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Fuentes Activas
                  </span>
                  <span className="text-2xl font-bold text-zinc-900 block mt-1">3 archivos</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">100% vectorizadas y auditadas</span>
                </div>
                <div
                  style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                  className="p-3.5 rounded-xl border shadow-xs"
                >
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Total Fragmentos
                  </span>
                  <span className="text-2xl font-bold text-blue-600 block mt-1">26,920 chunks</span>
                  <span className="text-xs text-zinc-500 mt-0.5 block">text-embedding-3-small (1536d)</span>
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
                  <span className="text-xs text-zinc-500 mt-0.5 block">Último refresh hace 12 min</span>
                </div>
              </div>

              {/* Filtros rápidos de fuentes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: "all", label: "Todas las fuentes (3)" },
                    { id: "legal", label: "Normativa Legal (1)" },
                    { id: "excel", label: "Matrices Financieras (1)" },
                    { id: "doc", label: "Manuales y Políticas (1)" },
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

              {/* Lista detallada de fuentes */}
              <div className="space-y-3">
                {/* Fuente 1: Ley */}
                {(sourcesFilterType === "all" || sourcesFilterType === "legal") && (
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <HubIcon icon={Scale} size={20} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-sm">D.S. N.º 007-2002-TR</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-50 text-red-700 font-semibold border border-red-200">
                            Norma Oficial
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Texto Único Ordenado de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                          <span>86 páginas</span>
                          <span>•</span>
                          <span>8,320 fragmentos vectorizados</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">Indexado</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openInspector(1)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer shadow-xs transition-colors"
                      >
                        Inspeccionar en Visor
                      </button>
                      <button
                        type="button"
                        onClick={() => showToastMessage("Re-indexando D.S. N.º 007-2002-TR...")}
                        className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                        title="Re-indexar fragmentos"
                      >
                        <HubIcon icon={RefreshCw} size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Fuente 2: Excel */}
                {(sourcesFilterType === "all" || sourcesFilterType === "excel") && (
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <HubIcon icon={FileSpreadsheet} size={20} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-sm">Modelo Financiero Q3 2026.xlsx</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Matriz Excel
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Proyecciones de ingresos, costos de nómina, provisiones contingentes y cálculo de EBITDA.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                          <span>14 hojas / 1,420 celdas</span>
                          <span>•</span>
                          <span>6,120 fragmentos vectorizados</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">Indexado</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openInspector(2)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer shadow-xs transition-colors"
                      >
                        Inspeccionar en Visor
                      </button>
                      <button
                        type="button"
                        onClick={handleExcelExport}
                        className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                        title="Descargar matriz CSV"
                      >
                        <HubIcon icon={Download} size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Fuente 3: Documento RRHH */}
                {(sourcesFilterType === "all" || sourcesFilterType === "doc") && (
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-4 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <HubIcon icon={FileText} size={20} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-sm">Manual de Políticas Laborales v2.1.pdf</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            Manual Interno
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Normas internas de registro biométrico, control de horas extras y autorizaciones de gerencia.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                          <span>48 páginas</span>
                          <span>•</span>
                          <span>12,480 fragmentos vectorizados</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">Indexado</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openInspector(3)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer shadow-xs transition-colors"
                      >
                        Inspeccionar en Visor
                      </button>
                      <button
                        type="button"
                        onClick={() => showToastMessage("Re-indexando Manual de Políticas Laborales...")}
                        className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 cursor-pointer transition-colors"
                        title="Re-indexar fragmentos"
                      >
                        <HubIcon icon={RefreshCw} size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== MÓDULO 3: HISTORIAL DE CONSULTAS ===== */}
          {activeNav === "historial" && (
            <div className="px-6 py-6 max-w-[900px] w-full mx-auto space-y-5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 style={{ fontSize: 24 }} className="font-bold tracking-tight text-zinc-900">
                    Historial de Consultas y Dictámenes
                  </h1>
                  <p style={{ color: palette.textSecondary, fontSize: 14 }} className="mt-0.5">
                    Registro histórico de análisis cruzados, dictámenes generados y fuentes validadas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToastMessage("Historial de consultas exportado")}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  Exportar registro
                </button>
              </div>

              <div className="space-y-3">
                {[
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
                ].map((item) => (
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
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item.question);
                        setActiveScenario(item.scenario);
                        setInspectorTab(item.tab as InspectorTab);
                        setInspectorOpen(true);
                        setActiveNav("nuevo");
                        showToastMessage("Consulta cargada en el Asistente");
                      }}
                      style={{ backgroundColor: palette.bgSubtle, color: palette.accentCitation }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-all"
                    >
                      <span>Cargar en Asistente</span>
                      <HubIcon icon={ArrowRight} size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MÓDULO UNIFICADO: CONFIGURACIÓN & PROVEEDORES IA (7) ===== */}
          {activeNav === "config" && (
            <div className="px-4 sm:px-6 py-6 max-w-[960px] w-full mx-auto space-y-5 flex-1">
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
                        showToastMessage("Comprobando latencia de todos los proveedores...");
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
                              <select
                                value={prov.selectedModel}
                                onChange={(e) => handleModelChange(prov.id, e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              >
                                {prov.models.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                                Ventana: {prov.contextWindow}
                              </span>
                            </div>

                            <div>
                              <label className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                                Credenciales (API Key)
                              </label>
                              <div className="relative flex items-center">
                                <span className="absolute left-2.5 text-zinc-400">
                                  <HubIcon icon={Key} size={12} />
                                </span>
                                <input
                                  type="password"
                                  readOnly
                                  value={prov.apiKeyMask}
                                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-zinc-600 text-[11px]"
                                />
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
                  {/* 1. Modelo de Embedding */}
                  <div
                    style={{ backgroundColor: palette.bgSurface, borderColor: palette.borderDefault }}
                    className="p-4 rounded-xl border shadow-xs space-y-2"
                  >
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Modelo de Embeddings Vectoriales
                    </label>
                    <select
                      value={embeddingModel}
                      onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-zinc-200 bg-white font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                    >
                      <option value="text-embedding-3-small">OpenAI text-embedding-3-small (1536 dimensiones - Latencia reducida)</option>
                      <option value="text-embedding-3-large">OpenAI text-embedding-3-large (3072 dimensiones - Alta precisión)</option>
                      <option value="cohere-multilingual">Cohere embed-multilingual-v3.0 (1024 dimensiones - Multilingüe)</option>
                    </select>
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

                  {/* Botones de acción */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmbeddingModel("text-embedding-3-small");
                        setSimilarityThreshold(0.75);
                        setTopK(5);
                        setEnableReranker(true);
                        setHybridSearch(true);
                        showToastMessage("Valores de fábrica restablecidos");
                      }}
                      className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      Restablecer Valores
                    </button>
                    <button
                      type="button"
                      onClick={() => showToastMessage("Parámetros del motor guardados correctamente")}
                      style={{ backgroundColor: palette.actionPrimary }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs hover:opacity-90 cursor-pointer transition-colors"
                    >
                      Guardar Parámetros
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
                backgroundColor: palette.bgSurface,
                borderColor: palette.borderDefault,
              }}
              className="hidden xl:flex w-[380px] shrink-0 border-l flex-col h-full overflow-y-auto"
            >
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
                    style={{ borderColor: palette.borderDefault, fontSize: 12 }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50 cursor-pointer text-zinc-700 shadow-xs transition-colors"
                    title="Copiar cita formal"
                  >
                    <HubIcon icon={Copy} size={13} />
                    <span>Cita</span>
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
