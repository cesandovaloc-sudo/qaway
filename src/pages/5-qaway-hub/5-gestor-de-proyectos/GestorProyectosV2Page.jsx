import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  FolderKanban,
  Kanban,
  Layers,
  FileText,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  SlidersHorizontal,
  Share2,
  Check
} from "lucide-react";

import {
  MANAGEMENT_FRAMEWORKS,
  NICHE_PRESETS,
  DESIGN_ARCHETYPES
} from "./data/frameworks-templates-data";
import { GestorHeaderV2 } from "./components/v2/GestorHeaderV2";
import { PlaneSidebarV2 } from "./components/v2/PlaneSidebarV2";
import { SlideOverTaskSheet } from "./components/v2/SlideOverTaskSheet";
import { CreateProjectWizardModal } from "./components/v2/CreateProjectWizardModal";
import { MilestoneInteractiveStepper } from "./components/MilestoneInteractiveStepper";
import { MilestoneDetailPanel } from "./components/MilestoneDetailPanel";
import { SERVICES_CONFIG } from "./data/services-milestones-data";
import { ContractDownloadView } from "./components/ContractDownloadView";

import "./styles/gestor-proyectos.css";

const INITIAL_PROJECTS = [
  {
    id: "proj-barberia",
    key: "QW-BAR",
    name: "Barbería Elite & Salón",
    slug: "barberia-elite",
    client: "Carlos Sandoval",
    frameworkId: "pmb-milestones",
    frameworkName: "PMB / 6 Hitos de Entrega",
    frameworkColor: "#ff4b0b",
    archetypeId: "executive-contrast",
    budget: "S/ 3,500",
    kpis: [
      { label: "Citas Hoy", value: "18", sub: "100% capacidad", change: "+12%" },
      { label: "Ingresos Día", value: "S/ 720", sub: "Ticket prom. S/ 40", change: "+8.5%" },
      { label: "Clientes VIP", value: "142", sub: "82% recurrencia", change: "+15%" },
      { label: "Barberos Activos", value: "4 / 4", sub: "Sillones al tope", change: "Óptimo" }
    ],
    workItems: [
      { id: "BAR-101", title: "Configurar catálogo de servicios y precios de corte/barba", priority: "URGENTE", assignee: "Leo S.", state: "done", stateLabel: "Completado" },
      { id: "BAR-102", title: "Módulo de reserva de citas online sincronizado con WhatsApp", priority: "ALTA", assignee: "Antigravity", state: "in-progress", stateLabel: "En Progreso" },
      { id: "BAR-103", title: "Panel de comisiones automáticas por barbero", priority: "MEDIA", assignee: "Valeria T.", state: "todo", stateLabel: "Por Hacer" },
      { id: "BAR-104", title: "Campañas automáticas de fidelización para clientes inactivos", priority: "BAJA", assignee: "Equipo Growth", state: "todo", stateLabel: "Por Hacer" },
    ]
  },
  {
    id: "proj-saas-dev",
    key: "QW-DEV",
    name: "Qaway Lab Digital Engine",
    slug: "qaway-digital-engine",
    client: "Interno Qaway Lab",
    frameworkId: "agile-scrum",
    frameworkName: "Agile / Scrum Sprints",
    frameworkColor: "#2563eb",
    archetypeId: "minimal-plane",
    budget: "Interno",
    kpis: [
      { label: "Sprint Activo", value: "Sprint 3", sub: "12 / 16 pts hechos", change: "75%" },
      { label: "Velocidad Equipo", value: "28 pts/sem", sub: "Ritmo constante", change: "+14%" },
      { label: "Bugs Críticos", value: "0", sub: "Zero regression", change: "Limpio" },
      { label: "Score Lighthouse", value: "98/100", sub: "Desktop & Móvil", change: "+4 pts" }
    ],
    workItems: [
      { id: "DEV-201", title: "Autenticación OAuth Google y Supabase Auth", priority: "URGENTE", points: "5 pts", assignee: "Antigravity", state: "done", stateLabel: "Sprint Done" },
      { id: "DEV-202", title: "Maquetación del chasis con Sidebar Dual-Rail", priority: "ALTA", points: "3 pts", assignee: "Leo S.", state: "in-progress", stateLabel: "En Desarrollo" },
      { id: "DEV-203", title: "Slide-over Sheet lateral para edición de tareas", priority: "ALTA", points: "5 pts", assignee: "Antigravity", state: "sprint-todo", stateLabel: "Sprint Backlog" },
      { id: "DEV-204", title: "Integración de Command Palette (Cmd+K)", priority: "MEDIA", points: "2 pts", assignee: "Carlos M.", state: "backlog", stateLabel: "Product Backlog" },
    ]
  }
];

export default function GestorProyectosV2Page() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState("proj-barberia");
  const [activeTab, setActiveTab] = useState("kanban"); // 'work-items' | 'kanban' | 'milestones' | 'contract'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Proyecto activo
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Framework y Arquetipo del proyecto activo
  const framework = useMemo(() => {
    return MANAGEMENT_FRAMEWORKS.find(f => f.id === currentProject.frameworkId) || MANAGEMENT_FRAMEWORKS[0];
  }, [currentProject]);

  const activeArchetype = currentProject.archetypeId || "executive-contrast";

  // Tareas filtradas por búsqueda
  const filteredWorkItems = useMemo(() => {
    if (!searchQuery) return currentProject.workItems || [];
    return (currentProject.workItems || []).filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentProject, searchQuery]);

  // Hitos para proyectos en modo PMB
  const serviceConfig = SERVICES_CONFIG["desarrollo-web"];
  const milestones = serviceConfig.milestones;
  const [activeMilestoneStep, setActiveMilestoneStep] = useState(3);
  const activeMilestoneObj = useMemo(() => {
    return milestones.find((m) => m.id === activeMilestoneStep) || milestones[0];
  }, [milestones, activeMilestoneStep]);

  // Manejar creación de nuevo proyecto
  const handleProjectCreated = (newProj) => {
    setProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.id);
  };

  // Manejar cambio de estado de tarea
  const handleMoveTaskState = (taskId, newState) => {
    const updated = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          workItems: p.workItems.map(item => {
            if (item.id === taskId) {
              return { ...item, state: newState, stateLabel: newState };
            }
            return item;
          })
        };
      }
      return p;
    });
    setProjects(updated);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Gestor de Proyectos V2 | Qaway Lab Master Suite</title>
      </Helmet>

      {/* Viewport Locking Layout */}
      <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 select-none">
        
        {/* Sidebar V2 con scroll independiente */}
        <PlaneSidebarV2
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onOpenCreateProject={() => setIsWizardOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeArchetype={activeArchetype}
        />

        {/* Contenedor Principal */}
        <div className="flex flex-1 flex-col h-screen overflow-hidden">
          
          {/* Header V2 con Tríada de Navegación y UserMenu */}
          <GestorHeaderV2
            onOpenCreateProject={() => setIsWizardOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentProject={currentProject}
            activeArchetype={activeArchetype}
          />

          {/* Lienzo de Trabajo Central con Scroll Independiente */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 custom-scrollbar">
            
            {/* ── 1. Hero del Proyecto & KPIs de Portada ──────────────────────── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white shadow-xs"
                    style={{ backgroundColor: currentProject.frameworkColor || "#ff4b0b" }}
                  >
                    {currentProject.frameworkName || "Framework Ágil"}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    {currentProject.key}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs font-medium text-zinc-500">
                    Cliente: <strong className="text-zinc-800">{currentProject.client}</strong>
                  </span>
                </div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                  {currentProject.name}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Enlace Copiado" : "Compartir Portal"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear con Wizard</span>
                </button>
              </div>
            </div>

            {/* ── 2. Grid de KPIs en Tiempo Real ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {currentProject.kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {kpi.label}
                  </span>
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <span className="text-2xl font-black text-zinc-900">{kpi.value}</span>
                    <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600">
                      {kpi.change}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-2 block font-medium">
                    {kpi.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* ── 3. Contenedor de Vistas según Tab Activo ─────────────────────── */}
            
            {/* VISTA A: Tablero Kanban */}
            {activeTab === "kanban" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-orange-500" />
                    Tablero de Trabajo ({framework.columns.length} Columnas)
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Haz clic en cualquier tarjeta para abrir el <strong>Slide-Over</strong> de detalles
                  </span>
                </div>

                {/* Columnas Kanban */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
                  {framework.columns.map((col) => {
                    const colItems = filteredWorkItems.filter(
                      item => item.state === col.id || (col.id === "in-progress" && item.state === "in-progress")
                    );

                    return (
                      <div
                        key={col.id}
                        className="bg-zinc-100/70 border border-zinc-200/70 rounded-2xl p-3.5 flex flex-col min-h-[420px]"
                      >
                        {/* Cabecera de Columna */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: col.color }}
                            />
                            <span className="text-xs font-bold text-zinc-800">{col.label}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-zinc-400 bg-white px-2 py-0.5 rounded-md shadow-2xs">
                            {colItems.length}
                          </span>
                        </div>

                        {/* Lista de Tarjetas */}
                        <div className="space-y-2.5 flex-1">
                          {colItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedTaskForSheet(item)}
                              className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-xs hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                  {item.id}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                    item.priority === "URGENTE"
                                      ? "bg-red-50 text-red-600"
                                      : "bg-orange-50 text-orange-600"
                                  }`}
                                >
                                  {item.priority || "ALTA"}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug">
                                {item.title}
                              </h4>

                              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-zinc-400" />
                                  <span className="truncate max-w-24">{item.assignee || "Equipo"}</span>
                                </div>
                                {item.points && (
                                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                                    {item.points}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Quick Create Card Integrada en el Grid */}
                          <button
                            type="button"
                            onClick={() => {
                              const newTask = {
                                id: `${currentProject.key}-${Math.floor(100 + Math.random() * 900)}`,
                                title: "Nuevo requerimiento de sprint",
                                state: col.id,
                                priority: "ALTA",
                                assignee: "Equipo Qaway"
                              };
                              setSelectedTaskForSheet(newTask);
                            }}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-200 hover:border-orange-400 hover:bg-orange-50/20 text-zinc-400 hover:text-orange-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir tarjeta</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VISTA B: Lista de Tareas / Work Items */}
            {activeTab === "work-items" && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Work Items ({filteredWorkItems.length} Elementos)
                  </h3>
                </div>

                <div className="divide-y divide-zinc-100 text-xs">
                  {filteredWorkItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTaskForSheet(item)}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono font-bold text-zinc-400 w-16 shrink-0">
                          {item.id}
                        </span>
                        <span className="font-bold text-zinc-900 truncate">
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold text-[11px]">
                          {item.stateLabel || item.state}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          {item.assignee || "Equipo"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA C: Hitos de Entrega (1 al 6) */}
            {activeTab === "milestones" && (
              <div className="space-y-6">
                <MilestoneInteractiveStepper
                  milestones={milestones}
                  activeStep={activeMilestoneStep}
                  onSelectStep={setActiveMilestoneStep}
                  serviceColor="#ff4b0b"
                />
                <MilestoneDetailPanel
                  milestone={activeMilestoneObj}
                  serviceConfig={serviceConfig}
                  project={currentProject}
                />
              </div>
            )}

            {/* VISTA D: Contrato SOW */}
            {activeTab === "contract" && (
              <ContractDownloadView project={currentProject} serviceConfig={serviceConfig} />
            )}

          </main>
        </div>

        {/* ── Slide-Over Lateral para Edición de Tareas ─────────────────────── */}
        <SlideOverTaskSheet
          item={selectedTaskForSheet}
          isOpen={Boolean(selectedTaskForSheet)}
          onClose={() => setSelectedTaskForSheet(null)}
          onSave={(updatedItem) => {
            const updated = projects.map(p => {
              if (p.id === currentProject.id) {
                const exists = p.workItems.some(i => i.id === updatedItem.id);
                const newItems = exists
                  ? p.workItems.map(i => i.id === updatedItem.id ? updatedItem : i)
                  : [updatedItem, ...p.workItems];
                return { ...p, workItems: newItems };
              }
              return p;
            });
            setProjects(updated);
          }}
          onDelete={(itemId) => {
            const updated = projects.map(p => {
              if (p.id === currentProject.id) {
                return { ...p, workItems: p.workItems.filter(i => i.id !== itemId) };
              }
              return p;
            });
            setProjects(updated);
          }}
        />

        {/* ── Modal Wizard Generador de Proyectos ───────────────────────────── */}
        <CreateProjectWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onProjectCreated={handleProjectCreated}
        />

      </div>
    </>
  );
}
