// Modelo de datos y Work Items estilo Plane.so / Linear para Qaway Lab

export const WORKSPACE_INFO = {
  name: "Qaway Lab Studio",
  slug: "qaway-studio",
  plan: "Enterprise Suite",
  version: "v3.2",
};

export const INITIAL_PROJECTS = [
  {
    id: "proj-web-01",
    key: "QW-WEB",
    name: "Gelato Gourmet SAC",
    slug: "gelato-gourmet",
    serviceId: "desarrollo-web",
    serviceName: "Desarrollo Web & E-commerce",
    serviceColor: "#ff4b0b",
    client: "Carlos Mendoza (Gerente)",
    plan: "Tienda Online con Carrito & WhatsApp",
    budget: "S/ 490.00",
    paidAmount: "S/ 245.00 (50%)",
    status: "in-progress",
    statusText: "En Desarrollo",
    progress: 75,
    activeMilestone: 4,
    targetDate: "29 Ago 2026",
    domain: "gelatogourmet.pe",
    previewUrl: "/landings/desarrollo-web-qaway",
    lighthouse: {
      performance: 98,
      accessibility: 100,
      bestPractices: 96,
      seo: 100,
      lcp: "0.8s",
      cls: "0.00",
      fid: "12ms"
    }
  },
  {
    id: "proj-brd-02",
    key: "QW-BRD",
    name: "NÖRA Moda & Estilo",
    slug: "nora-moda",
    serviceId: "branding",
    serviceName: "Branding & Identidad Visual",
    serviceColor: "#fe6612",
    client: "Valeria Thorne (Fundadora)",
    plan: "Identidad Visual & Brand Kit Master",
    budget: "S/ 650.00",
    paidAmount: "S/ 325.00 (50%)",
    status: "in-progress",
    statusText: "En Diseño UI",
    progress: 60,
    activeMilestone: 3,
    targetDate: "04 Sep 2026",
    domain: "noramoda.com",
    previewUrl: "/proyectos"
  },
  {
    id: "proj-crm-03",
    key: "QW-CRM",
    name: "Finix Soluciones TI",
    slug: "finix-crm",
    serviceId: "sistemas-crm",
    serviceName: "Sistemas & CRM WABA",
    serviceColor: "#00b090",
    client: "Rodrigo Alarcón (CTO)",
    plan: "Bandeja Multiagente WABA + Supabase",
    budget: "S/ 850.00",
    paidAmount: "S/ 850.00 (100%)",
    status: "completed",
    statusText: "Entregado",
    progress: 100,
    activeMilestone: 6,
    targetDate: "18 Ago 2026",
    domain: "app.finix-ti.com",
    previewUrl: "/hub/waba-crm"
  },
  {
    id: "proj-mkt-04",
    key: "QW-MKT",
    name: "Lumina Estética Dental",
    slug: "lumina-ads",
    serviceId: "marketing-leads",
    serviceName: "Marketing & Leads Ads",
    serviceColor: "#8c67ff",
    client: "Dra. Carmen Ríos",
    plan: "Campaña Meta Ads + Landing Citas",
    budget: "S/ 450.00",
    paidAmount: "S/ 450.00 (100%)",
    status: "in-progress",
    statusText: "Campaña Activa",
    progress: 85,
    activeMilestone: 5,
    targetDate: "30 Ago 2026",
    domain: "luminaestetica.pe",
    previewUrl: "/landings/desarrollo-web-qaway"
  }
];

export const INITIAL_WORK_ITEMS = [
  {
    id: "item-101",
    key: "QW-101",
    projectId: "proj-web-01",
    title: "Discovery & Briefing: Levantamiento de catálogo de sabores y precios",
    state: "done",
    stateLabel: "Completado",
    priority: "urgent",
    priorityLabel: "Urgente",
    assignee: "Leo S.",
    role: "Product Manager",
    dueDate: "19 Ago",
    serviceId: "desarrollo-web",
    milestone: 1
  },
  {
    id: "item-102",
    key: "QW-102",
    projectId: "proj-web-01",
    title: "Firma de Contrato SOW & Confirmación de Anticipo 50%",
    state: "done",
    stateLabel: "Completado",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Carlos M.",
    role: "Cliente",
    dueDate: "20 Ago",
    serviceId: "desarrollo-web",
    milestone: 2
  },
  {
    id: "item-103",
    key: "QW-103",
    projectId: "proj-web-01",
    title: "Diseño UI: Wireframes y Mockup interactivo en alta fidelidad",
    state: "done",
    stateLabel: "Completado",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Valeria T.",
    role: "UI/UX Designer",
    dueDate: "22 Ago",
    serviceId: "desarrollo-web",
    milestone: 3
  },
  {
    id: "item-104",
    key: "QW-104",
    projectId: "proj-web-01",
    title: "Frontend React: Maquetación Hero + Catálogo con animaciones GPU a 60 FPS",
    state: "in-progress",
    stateLabel: "En Progreso",
    priority: "urgent",
    priorityLabel: "Urgente",
    assignee: "Antigravity",
    role: "Lead Frontend",
    dueDate: "27 Ago",
    serviceId: "desarrollo-web",
    milestone: 4
  },
  {
    id: "item-105",
    key: "QW-105",
    projectId: "proj-web-01",
    title: "Integración de Checkout directo al WhatsApp de ventas",
    state: "in-progress",
    stateLabel: "En Progreso",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Antigravity",
    role: "Lead Frontend",
    dueDate: "28 Ago",
    serviceId: "desarrollo-web",
    milestone: 4
  },
  {
    id: "item-106",
    key: "QW-106",
    projectId: "proj-web-01",
    title: "Go-Live: Apuntamiento de DNS en gelatogourmet.pe y activación de SSL",
    state: "todo",
    stateLabel: "Por Hacer",
    priority: "medium",
    priorityLabel: "Media",
    assignee: "Leo S.",
    role: "DevOps",
    dueDate: "29 Ago",
    serviceId: "desarrollo-web",
    milestone: 5
  },
  {
    id: "item-107",
    key: "QW-107",
    projectId: "proj-web-01",
    title: "Auditoría Oficial Google Lighthouse: Certificación de velocidad 98+ y Schema JSON-LD",
    state: "todo",
    stateLabel: "Por Hacer",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Antigravity",
    role: "QA / Performance",
    dueDate: "30 Ago",
    serviceId: "desarrollo-web",
    milestone: 6
  },
  // NÖRA Moda
  {
    id: "item-201",
    key: "QW-201",
    projectId: "proj-brd-02",
    title: "Moodboard y exploración de dirección de arte editorial minimalista",
    state: "done",
    stateLabel: "Completado",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Valeria T.",
    role: "Directora de Arte",
    dueDate: "24 Ago",
    serviceId: "branding",
    milestone: 3
  },
  {
    id: "item-202",
    key: "QW-202",
    projectId: "proj-brd-02",
    title: "Presentación de 3 rutas creativas de logotipo con mockups de empaques",
    state: "in-progress",
    stateLabel: "En Progreso",
    priority: "urgent",
    priorityLabel: "Urgente",
    assignee: "Valeria T.",
    role: "Brand Designer",
    dueDate: "02 Sep",
    serviceId: "branding",
    milestone: 4
  },
  {
    id: "item-203",
    key: "QW-203",
    projectId: "proj-brd-02",
    title: "Exportación de Brand Kit Master: Vectores AI, SVG, PNG y tipografías",
    state: "backlog",
    stateLabel: "Backlog",
    priority: "low",
    priorityLabel: "Baja",
    assignee: "Valeria T.",
    role: "Brand Designer",
    dueDate: "05 Sep",
    serviceId: "branding",
    milestone: 6
  },
  // Finix CRM
  {
    id: "item-301",
    key: "QW-301",
    projectId: "proj-crm-03",
    title: "Verificación de Meta Business Manager y aprobación de línea WABA Cloud",
    state: "done",
    stateLabel: "Completado",
    priority: "urgent",
    priorityLabel: "Urgente",
    assignee: "Rodrigo A.",
    role: "Tech Lead",
    dueDate: "10 Ago",
    serviceId: "sistemas-crm",
    milestone: 3
  },
  {
    id: "item-302",
    key: "QW-302",
    projectId: "proj-crm-03",
    title: "Conexión de Webhooks en tiempo real con base de datos Supabase",
    state: "done",
    stateLabel: "Completado",
    priority: "high",
    priorityLabel: "Alta",
    assignee: "Antigravity",
    role: "Backend Lead",
    dueDate: "15 Ago",
    serviceId: "sistemas-crm",
    milestone: 4
  }
];

// Persistencia en LocalStorage
export function getPlaneProjects() {
  try {
    const local = localStorage.getItem("qaway_plane_projects");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_PROJECTS;
}

export function savePlaneProjects(projects) {
  try {
    localStorage.setItem("qaway_plane_projects", JSON.stringify(projects));
  } catch (e) {}
}

export function getPlaneWorkItems() {
  try {
    const local = localStorage.getItem("qaway_plane_work_items");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_WORK_ITEMS;
}

export function savePlaneWorkItems(items) {
  try {
    localStorage.setItem("qaway_plane_work_items", JSON.stringify(items));
  } catch (e) {}
}
