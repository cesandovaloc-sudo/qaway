import { Link } from "react-router-dom";
import {
  FolderKanban,
  Kanban,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  Layers
} from "lucide-react";

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
  return (
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
      {/* 1. Cabecera del Workspace (Estilo Linear / Raycast) */}
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

      {/* 2. Contenido con Scroll Local Independiente */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 custom-scrollbar">
        
        {/* Vistas de Navegación del Proyecto */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Vistas de Trabajo
            </p>
          )}

          {/* Botón: Lista de Tareas */}
          <button
            type="button"
            onClick={() => onTabChange("work-items")}
            className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "work-items"
                ? "bg-white/[0.08] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
            title="Lista de Tareas / Requerimientos"
          >
            {activeTab === "work-items" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <FolderKanban className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "work-items" ? "text-[#ff5722]" : "text-zinc-400"}`} />
              {!isCollapsed && <span className="truncate">Lista de Tareas</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                4
              </span>
            )}
          </button>

          {/* Botón: Tablero Kanban */}
          <button
            type="button"
            onClick={() => onTabChange("kanban")}
            className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "kanban"
                ? "bg-white/[0.08] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
            title="Tablero Kanban de Sprint"
          >
            {activeTab === "kanban" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Kanban className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "kanban" ? "text-[#ff5722]" : "text-zinc-400"}`} />
              {!isCollapsed && <span className="truncate">Tablero Kanban</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                Sprint
              </span>
            )}
          </button>

          {/* Botón: Hitos de Entrega */}
          <button
            type="button"
            onClick={() => onTabChange("milestones")}
            className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "milestones"
                ? "bg-white/[0.08] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
            title="Hitos de Entrega & SOW"
          >
            {activeTab === "milestones" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "milestones" ? "text-[#ff5722]" : "text-zinc-400"}`} />
              {!isCollapsed && <span className="truncate">Hitos de Entrega</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                1-6
              </span>
            )}
          </button>

          {/* Botón: Contrato SOW */}
          <button
            type="button"
            onClick={() => onTabChange("contract")}
            className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              activeTab === "contract"
                ? "bg-white/[0.08] text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
            }`}
            title="Contrato SOW & Ficha"
          >
            {activeTab === "contract" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#ff4b0b] rounded-r" />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className={`w-4 h-4 shrink-0 stroke-[1.75] ${activeTab === "contract" ? "text-[#ff5722]" : "text-zinc-400"}`} />
              {!isCollapsed && <span className="truncate">Contrato SOW</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded">
                PDF
              </span>
            )}
          </button>
        </div>

        {/* 3. Lista de Proyectos Activos */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2">
            {!isCollapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Proyectos ({projects.length})
              </p>
            )}
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Añadir Proyecto"
            >
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
                  onClick={() => onSelectProject(proj.id)}
                  className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white/[0.08] text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                  title={proj.name}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#ff4b0b] rounded-r" />
                  )}
                  <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: proj.frameworkColor || "#ff4b0b" }}
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <span className="text-[12.5px] truncate block leading-tight text-zinc-200">
                        {proj.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate mt-0.5">
                        {proj.frameworkName || "Agile Scrum"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Footer del Sidebar */}
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
        <Link
          to="/hub"
          className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 hover:text-zinc-200 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          {!isCollapsed && <span>Volver al Hub Central</span>}
        </Link>
      </div>
    </aside>
  );
}
