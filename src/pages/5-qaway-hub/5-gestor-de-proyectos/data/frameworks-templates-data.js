// Catálogo maestro de Frameworks de Gestión y Plantillas por Nicho (Qaway SaaS Architecture)

export const MANAGEMENT_FRAMEWORKS = [
  {
    id: "agile-scrum",
    name: "Agile / Scrum",
    shortName: "Scrum Sprints",
    badge: "Desarrollo Ágil",
    color: "#2563eb",
    bgTone: "bg-blue-500/10 text-blue-600 border-blue-200",
    description: "Sprints de 2 semanas, gestión de backlog de historias de usuario, tablero sprint activo y ceremonias de retrospectiva.",
    columns: [
      { id: "backlog", label: "Product Backlog", color: "#64748b" },
      { id: "sprint-todo", label: "Sprint Backlog", color: "#f59e0b" },
      { id: "in-progress", label: "En Desarrollo", color: "#3b82f6" },
      { id: "review", label: "Code Review / QA", color: "#8b5cf6" },
      { id: "done", label: "Sprint Done", color: "#10b981" }
    ],
    defaultItems: [
      { id: "US-101", title: "Autenticación OAuth Google y Supabase Auth", priority: "URGENTE", points: "5 pts", assignee: "Antigravity", state: "done" },
      { id: "US-102", title: "Maquetación del chasis con Sidebar Dual-Rail", priority: "ALTA", points: "3 pts", assignee: "Leo S.", state: "in-progress" },
      { id: "US-103", title: "Slide-over Sheet lateral para edición de tareas", priority: "ALTA", points: "5 pts", assignee: "Antigravity", state: "sprint-todo" },
      { id: "US-104", title: "Integración de Command Palette (Cmd+K)", priority: "MEDIA", points: "2 pts", assignee: "Carlos M.", state: "backlog" },
    ]
  },
  {
    id: "pmb-milestones",
    name: "PMB / 6 Hitos de Entrega",
    shortName: "Cascada Formal",
    badge: "Entregables & SOW",
    color: "#ff4b0b",
    bgTone: "bg-orange-500/10 text-orange-600 border-orange-200",
    description: "Recorrido formal de 6 fases secuenciales con acta de conformidad, anticipo de 50%, contrato SOW y portal de cliente.",
    columns: [
      { id: "phase-1", label: "1. Brief & Discovery", color: "#ff4b0b" },
      { id: "phase-2", label: "2. SOW & Anticipo 50%", color: "#ea580c" },
      { id: "phase-3", label: "3. Wireframes UI", color: "#d97706" },
      { id: "phase-4", label: "4. Staging & Sprints", color: "#3b82f6" },
      { id: "phase-5", label: "5. Go-Live & DNS", color: "#8b5cf6" },
      { id: "phase-6", label: "6. Certificación Google", color: "#10b981" }
    ],
    defaultItems: [
      { id: "PM-01", title: "Ficha técnica comercial y discovery de requerimientos", priority: "URGENTE", date: "Día 1-2", state: "done", phase: 1 },
      { id: "PM-02", title: "Firma de contrato SOW y confirmación de anticipo", priority: "URGENTE", date: "Día 2", state: "done", phase: 2 },
      { id: "PM-03", title: "Sign-Off de diseño de interfaz responsive", priority: "ALTA", date: "Día 3-4", state: "in-progress", phase: 3 },
      { id: "PM-04", title: "Desarrollo frontend React 60 FPS en Staging", priority: "ALTA", date: "Día 5-8", state: "phase-4", phase: 4 },
    ]
  },
  {
    id: "product-management",
    name: "Product Management (Roadmap)",
    shortName: "Discovery & RICE",
    badge: "Product Discovery",
    color: "#8b5cf6",
    bgTone: "bg-purple-500/10 text-purple-600 border-purple-200",
    description: "Descubrimiento de oportunidades, priorización con Score RICE (Reach, Impact, Confidence, Effort) y Roadmap temporal (Now/Next/Later).",
    columns: [
      { id: "ideas", label: "Ideación & Insights", color: "#64748b" },
      { id: "validating", label: "Validación de Hipótesis", color: "#8b5cf6" },
      { id: "now", label: "Now (Este Trimestre)", color: "#3b82f6" },
      { id: "next", label: "Next (Próximo Q)", color: "#f59e0b" },
      { id: "later", label: "Later (Backlog Futuro)", color: "#94a3b8" }
    ],
    defaultItems: [
      { id: "PRD-01", title: "Módulo de exportación de reportes en PDF/Excel", riceScore: "85 pts", priority: "ALTA", state: "now" },
      { id: "PRD-02", title: "Sincronización bidireccional con Google Calendar", riceScore: "72 pts", priority: "MEDIA", state: "validating" },
      { id: "PRD-03", title: "Generación de contratos con IA en un clic", riceScore: "94 pts", priority: "URGENTE", state: "ideas" },
    ]
  },
  {
    id: "kanban-lean",
    name: "Kanban Continuo (Lean)",
    shortName: "Flujo Continuo",
    badge: "Operaciones Diarias",
    color: "#10b981",
    bgTone: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    description: "Flujo ágil sin fechas de sprint forzadas, ideal para mantenimiento, atención a clientes y soporte continuo con límites de trabajo en curso.",
    columns: [
      { id: "todo", label: "Por Hacer / En Cola", color: "#64748b" },
      { id: "in-progress", label: "En Ejecución (WIP: 3)", color: "#3b82f6" },
      { id: "testing", label: "Revisión / Validación", color: "#f59e0b" },
      { id: "completed", label: "Completado & Entregado", color: "#10b981" }
    ],
    defaultItems: [
      { id: "TSK-01", title: "Actualizar precios y tarifas en base de datos", priority: "ALTA", assignee: "Valeria T.", state: "completed" },
      { id: "TSK-02", title: "Configurar webhooks para alertas en WhatsApp", priority: "URGENTE", assignee: "Antigravity", state: "in-progress" },
      { id: "TSK-03", title: "Revisar logs de auditoría de seguridad", priority: "BAJA", assignee: "Leo S.", state: "todo" },
    ]
  }
];

export const NICHE_PRESETS = [
  {
    id: "barberia",
    name: "Barbería / Salón de Estilo",
    frameworkId: "pmb-milestones",
    designArchetype: "executive-contrast",
    kpis: [
      { label: "Citas Hoy", value: "18", sub: "100% capacidad", change: "+12%" },
      { label: "Ingresos Día", value: "S/ 720", sub: "Ticket prom. S/ 40", change: "+8.5%" },
      { label: "Clientes VIP", value: "142", sub: "82% recurrencia", change: "+15%" },
      { label: "Barberos Activos", value: "4 / 4", sub: "Sillones al tope", change: "Óptimo" }
    ]
  },
  {
    id: "clinica-dental",
    name: "Clínica Odontológica",
    frameworkId: "pmb-milestones",
    designArchetype: "minimal-plane",
    kpis: [
      { label: "Pacientes Día", value: "24", sub: "6 gabinetes", change: "+5%" },
      { label: "Presupuestos", value: "S/ 14,500", sub: "7 en negociación", change: "+22%" },
      { label: "Tratamientos", value: "38 activos", sub: "Ortodoncia/Implantes", change: "+14%" },
      { label: "Satisfacción", value: "99.2%", sub: "NPS Google Reviews", change: "Excelente" }
    ]
  },
  {
    id: "agencia-media",
    name: "Agencia de Contenido & Media",
    frameworkId: "agile-scrum",
    designArchetype: "vibrant-creative",
    kpis: [
      { label: "Guiones Listos", value: "30 / 30", sub: "Meta mensual", change: "+100%" },
      { label: "En Rodaje", value: "4 piezas", sub: "Semana 2", change: "A tiempo" },
      { label: "Retención Prom.", value: "68.4%", sub: "Reels / TikTok", change: "+18.2%" },
      { label: "Leads ManyChat", value: "340", sub: "Conversión 14%", change: "+32%" }
    ]
  }
];

export const DESIGN_ARCHETYPES = [
  {
    id: "executive-contrast",
    name: "Arquetipo 3: Executive High-Contrast",
    description: "Sidebar oscura grafito + Lienzo de trabajo claro con acentos vivos de alta energía (Estilo CRM Qaway).",
    badge: "Recomendado CRM / Negocios",
    sidebarBg: "bg-zinc-950 text-white",
    headerBg: "bg-white border-zinc-200",
    accentColor: "bg-orange-500 text-white hover:bg-orange-600"
  },
  {
    id: "minimal-plane",
    name: "Arquetipo 1: Minimal Utilitarian (Plane.so / Linear)",
    description: "Fondo blanco puro, bordes finos de 1px, tipografía compacta de alta densidad y foco en productividad.",
    badge: "Técnico & Devs",
    sidebarBg: "bg-slate-50 text-slate-900 border-r border-slate-200",
    headerBg: "bg-white border-slate-200",
    accentColor: "bg-slate-900 text-white hover:bg-slate-800"
  },
  {
    id: "vibrant-creative",
    name: "Arquetipo 2: Vibrant Creative SaaS",
    description: "Sidebar con color de marca sólido saturado (índigo/violeta), tarjetas muy redondeadas y badges pastel.",
    badge: "Media & Creadores",
    sidebarBg: "bg-indigo-600 text-white",
    headerBg: "bg-white border-indigo-100",
    accentColor: "bg-indigo-600 text-white hover:bg-indigo-700"
  },
  {
    id: "structured-dossier",
    name: "Arquetipo 4: Structured Dossier & Stepper",
    description: "Sidebar por etapas numeradas con badges de color, hero oscuro y tarjetas tipo ficha con edición in-line.",
    badge: "Consultoría & Diagnósticos",
    sidebarBg: "bg-white border-r border-slate-200",
    headerBg: "bg-zinc-900 text-white",
    accentColor: "bg-orange-500 text-white hover:bg-orange-600"
  }
];
