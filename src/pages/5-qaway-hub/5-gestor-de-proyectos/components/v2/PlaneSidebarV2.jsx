import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Kanban,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  FolderOpen
} from "lucide-react";

// Qué pestañas despliegan panel secundario
const SECONDARY_MAP = {
  "work-items": "tasks",
};

export function PlaneSidebarV2({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenCreateProject,
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onTabChange,
  activeArchetype
}) {
  const [activeRail, setActiveRail] = useState("tasks");
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);

  const taskFilters = [
    { id: "upcoming", label: "Próximas",    count: 3, badgeColor: "bg-white/[0.08] text-zinc-300" },
    { id: "overdue",  label: "Con retraso", count: 1, badgeColor: "bg-red-500/20 text-red-400 font-bold" },
    { id: "completed",label: "Finalizadas", count: 8, badgeColor: "bg-emerald-500/20 text-emerald-400" }
  ];

  const quickTasks = [
    { key: "BAR-101", title: "Configurar catálogo y precios", status: "done" },
    { key: "BAR-102", title: "Módulo citas con WhatsApp",     status: "progress" },
    { key: "BAR-103", title: "Comisiones por barbero",        status: "todo" }
  ];

  // Si el tab tiene panel secundario: abre; si no: cierra suavemente
  function handleNavClick(tab, railOverride) {
    onTabChange(tab);
    if (railOverride) {
      setActiveRail(railOverride);
      setIsSecondaryOpen(true);
    } else if (SECONDARY_MAP[tab]) {
      setActiveRail(SECONDARY_MAP[tab]);
      setIsSecondaryOpen(true);
    } else {
      setIsSecondaryOpen(false);
    }
  }

  const hasSecondaryContent = activeTab === "work-items" || activeRail === "projects";

  return (
    <div className="relative flex h-screen select-none shrink-0 z-30">

      {/* ── 1. PANEL PRINCIPAL ── */}
      <aside
        className={`relative flex flex-col h-screen border-r select-none shrink-0 transition-all duration-200 ease-out ${
          isCollapsed ? "w-16" : "w-64"
        } ${
          activeArchetype === "minimal-plane"
            ? "bg-[#fafafc] border-slate-200 text-slate-800"
            : activeArchetype === "vibrant-creative"
            ? "bg-[#181a2e] border-indigo-900/50 text-white"
            : "bg-[#141517] border-white/[0.08] text-zinc-200"
        }`}
      >
        {/* Cabecera */}
        <div className="flex h-13 items-center justify-between px-3.5 border-b border-white/[0.08]">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-white/[0.08] border border-white/10 text-white flex items-center justify-center font-bold text-[11px] shrink-0 tracking-tight">
                QW
              </div>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold tracking-tight block truncate text-zinc-100">
                  Workspace Hub
                </span>
                <span className="text-[10px] text-zinc-500 block truncate font-medium">
                  Proyectos & Entregas
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors ml-auto cursor-pointer"
            title={isCollapsed ? "Expandir barra" : "Colapsar barra"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 custom-scrollbar">
          <div className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Vistas de Trabajo
              </p>
            )}

            {/* Lista de Tareas — CON panel secundario */}
            <button
              type="button"
              onClick={() => handleNavClick("work-items")}
              className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === "work-items" ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
              title="Lista de Tareas / Requerimientos"
            >
              {activeTab === "work-items" && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />}
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderKanban className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "work-items" ? "text-[#ff5722]" : "text-zinc-400"}`} />
                {!isCollapsed && <span className="truncate">Lista de Tareas</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">4</span>}
            </button>

            {/* Tablero Kanban — SIN panel secundario */}
            <button
              type="button"
              onClick={() => handleNavClick("kanban")}
              className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === "kanban" ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
              title="Tablero Kanban de Sprint"
            >
              {activeTab === "kanban" && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />}
              <div className="flex items-center gap-2.5 min-w-0">
                <Kanban className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "kanban" ? "text-[#ff5722]" : "text-zinc-400"}`} />
                {!isCollapsed && <span className="truncate">Tablero Kanban</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">Sprint</span>}
            </button>

            {/* Hitos de Entrega — SIN panel secundario */}
            <button
              type="button"
              onClick={() => handleNavClick("milestones")}
              className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === "milestones" ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
              title="Hitos de Entrega & SOW"
            >
              {activeTab === "milestones" && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />}
              <div className="flex items-center gap-2.5 min-w-0">
                <Layers className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "milestones" ? "text-[#ff5722]" : "text-zinc-400"}`} />
                {!isCollapsed && <span className="truncate">Hitos de Entrega</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">1-6</span>}
            </button>

            {/* Contrato SOW — SIN panel secundario */}
            <button
              type="button"
              onClick={() => handleNavClick("contract")}
              className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === "contract" ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
              title="Contrato SOW & Ficha"
            >
              {activeTab === "contract" && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />}
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "contract" ? "text-[#ff5722]" : "text-zinc-400"}`} />
                {!isCollapsed && <span className="truncate">Contrato SOW</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">PDF</span>}
            </button>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Proyectos — al seleccionar abre secundario en modo proyectos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2.5">
              {!isCollapsed && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Proyectos ({projects.length})
                </p>
              )}
              <button type="button" onClick={onOpenCreateProject} className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer" title="Añadir Proyecto">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => { onSelectProject(proj.id); setActiveRail("projects"); setIsSecondaryOpen(true); }}
                    className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                    }`}
                    title={proj.name}
                  >
                    {isSelected && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#ff4b0b] rounded-r" />}
                    <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: proj.frameworkColor || "#ff4b0b" }} />
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <span className="text-[12.5px] truncate block leading-tight text-zinc-200">{proj.name}</span>
                        <span className="text-[10px] text-zinc-500 block truncate mt-0.5">{proj.frameworkName || "Agile Scrum"}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.08] space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 text-[10.5px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>En línea</span>
              </span>
              <span>v2.1</span>
            </div>
          )}
          <Link to="/hub" className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 hover:text-zinc-200 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
            <Compass className="w-4 h-4 stroke-[1.75]" />
            {!isCollapsed && <span>Volver al Hub Central</span>}
          </Link>
        </div>

        {/* Pestaña de reapertura — anclada al borde derecho del panel principal.
            Solo aparece cuando: el secundario está cerrado Y el tab activo tiene sub-módulo.
            Patrón Asana / Linear: lengüeta fija, nunca flotante perdida. */}
        {!isSecondaryOpen && hasSecondaryContent && (
          <button
            type="button"
            onClick={() => setIsSecondaryOpen(true)}
            className="absolute -right-[13px] top-[52px] z-50 flex items-center justify-center w-[13px] h-8 bg-[#1a1c20] border-y border-r border-white/[0.10] rounded-r-md text-zinc-400 hover:text-white hover:bg-[#222428] transition-colors cursor-pointer shadow-sm"
            title="Expandir panel secundario"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </aside>

      {/* ── 2. PANEL SECUNDARIO CONTEXTUAL ── */}
      {isSecondaryOpen && (
        <aside className="w-56 shrink-0 h-screen bg-[#1a1c20] border-r border-white/[0.08] flex flex-col justify-between animate-in fade-in slide-in-from-left-2 duration-150">
          <div>
            <div className="h-13 px-4 flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                {activeRail === "tasks" ? (
                  <>
                    <ListTodo className="w-4 h-4 text-[#ff4b0b]" />
                    <span className="text-xs font-bold text-zinc-100 tracking-tight">Mis Tareas</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-4 h-4 text-[#ff4b0b]" />
                    <span className="text-xs font-bold text-zinc-100 tracking-tight">Proyectos</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSecondaryOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Plegar panel secundario"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-110px)] custom-scrollbar">
              {activeRail === "tasks" && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block mb-1.5">Filtros de Tareas</span>
                    {taskFilters.map((filter) => (
                      <button key={filter.id} type="button" onClick={() => onTabChange("work-items")}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="font-medium">{filter.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filter.badgeColor}`}>{filter.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block mb-1.5">En Curso (Barbería)</span>
                    {quickTasks.map((t) => (
                      <button key={t.key} type="button" onClick={() => onTabChange("work-items")}
                        className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {t.status === "done" ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            : t.status === "progress" ? <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            : <AlertCircle className="w-3 h-3 text-zinc-500 shrink-0" />}
                          <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200">{t.key}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-tight truncate">{t.title}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeRail === "projects" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Workspaces ({projects.length})</span>
                    <button type="button" onClick={onOpenCreateProject} className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] cursor-pointer" title="Nuevo Proyecto">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {projects.map((proj) => {
                    const isSelected = proj.id === selectedProjectId;
                    return (
                      <button key={proj.id} type="button" onClick={() => onSelectProject(proj.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-white/[0.08] text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.frameworkColor || "#ff4b0b" }} />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs truncate block leading-tight text-zinc-200">{proj.name}</span>
                          <span className="text-[10px] text-zinc-500 block truncate mt-0.5">{proj.frameworkName}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-white/[0.08]">
            <button type="button" onClick={onOpenCreateProject}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
            >
              <Plus className="w-3.5 h-3.5 text-[#ff4b0b]" />
              <span>Crear Tarea</span>
            </button>
          </div>
        </aside>
      )}

    </div>
  );
}