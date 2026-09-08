import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Kanban,
  CheckCircle2,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  Layers,
  Sparkles,
  Shield,
  ExternalLink
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
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <aside
      className={`relative flex flex-col h-screen border-r transition-all duration-300 ease-out select-none shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      } ${
        activeArchetype === "minimal-plane"
          ? "bg-slate-50 border-slate-200 text-slate-900"
          : activeArchetype === "vibrant-creative"
          ? "bg-indigo-950 border-indigo-900 text-white"
          : "bg-zinc-950 border-zinc-800 text-white"
      }`}
    >
      {/* Cabecera del Sidebar */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0">
              PM
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black tracking-tight block truncate text-white">
                Workspace Hub
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                Proyectos & Entregas
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? "Expandir barra" : "Colapsar barra"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Contenido con Scroll Local Independiente */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        
        {/* Vistas de Navegación del Proyecto */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Vistas de Trabajo
            </p>
          )}

          <button
            type="button"
            onClick={() => onTabChange("work-items")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "work-items"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Lista de Tareas / Requerimientos"
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Lista de Tareas</span>}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("kanban")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "kanban"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Tablero Kanban de Sprint"
          >
            <Kanban className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Tablero Kanban</span>}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("milestones")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "milestones"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Hitos de Entrega & SOW"
          >
            <Layers className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Hitos de Entrega (1-6)</span>}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("contract")}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "contract"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Contrato SOW & Ficha"
          >
            <FileText className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Contrato SOW</span>}
          </button>
        </div>

        {/* Lista de Proyectos Activos */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Proyectos ({projects.length})
              </p>
            )}
            <button
              type="button"
              onClick={onOpenCreateProject}
              className="p-1 rounded-md text-zinc-400 hover:text-orange-400 hover:bg-white/10 transition-colors cursor-pointer"
              title="Añadir Proyecto"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onSelectProject(proj.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/10 text-white border border-white/10 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                  title={proj.name}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ backgroundColor: proj.frameworkColor || "#ff4b0b", color: "#fff" }}
                  >
                    {proj.key ? proj.key.substring(3, 5) : "QW"}
                  </div>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <span className="text-xs truncate block">{proj.name}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">
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

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-white/10">
        <Link
          to="/hub"
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Compass className="w-4 h-4" />
          {!isCollapsed && <span>Volver al Hub Central</span>}
        </Link>
      </div>
    </aside>
  );
}
