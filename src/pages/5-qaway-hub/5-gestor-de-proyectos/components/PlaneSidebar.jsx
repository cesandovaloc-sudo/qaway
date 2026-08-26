import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Layers,
  Plus,
  Sparkles,
  ChevronDown,
  Globe,
  Palette,
  Cpu,
  TrendingUp,
  FileText,
  Eye,
  ArrowLeft,
} from "lucide-react";

export function PlaneSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  activeTab,
  onSelectTab,
  onOpenNewItemModal,
  onOpenNewProjectModal,
}) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);

  const serviceIconMap = {
    "desarrollo-web": Globe,
    "branding": Palette,
    "sistemas-crm": Cpu,
    "marketing-leads": TrendingUp,
  };

  return (
    <aside className="qw-plane-sidebar">
      
      {/* 1. Header Minimalista */}
      <div className="qw-plane-ws-header">
        <div className="qw-plane-ws-brand">
          <span className="qw-plane-ws-brand-title">Qaway Lab</span>
          <span className="qw-plane-ws-tag">Studio</span>
        </div>
        <Link to="/hub" className="qw-plane-ws-back" title="Volver a Qaway Hub">
          <ArrowLeft size={14} />
        </Link>
      </div>

      {/* 2. Botón de Acción Principal */}
      <div className="qw-plane-quick-actions">
        <button
          type="button"
          onClick={onOpenNewItemModal}
          className="qw-plane-btn-new-item"
        >
          <Plus size={14} />
          <span>Nuevo Work Item</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="qw-plane-btn-new-proj"
          title="Crear Proyecto"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 3. Vistas Principales (Navegación Vectorial SVG Pura) */}
      <div className="qw-plane-nav-group">
        <span className="qw-plane-nav-title">VISTAS</span>
        
        <button
          type="button"
          onClick={() => onSelectTab("work-items")}
          className={`qw-plane-nav-item ${activeTab === "work-items" ? "is-active" : ""}`}
        >
          <Layers size={15} />
          <span>Work Items</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("kanban")}
          className={`qw-plane-nav-item ${activeTab === "kanban" ? "is-active" : ""}`}
        >
          <FolderKanban size={15} />
          <span>Tablero Kanban</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("milestones")}
          className={`qw-plane-nav-item ${activeTab === "milestones" ? "is-active" : ""}`}
        >
          <Sparkles size={15} />
          <span>Hitos & Fases (1-6)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("contract")}
          className={`qw-plane-nav-item ${activeTab === "contract" ? "is-active" : ""}`}
        >
          <FileText size={15} />
          <span>Contrato SOW</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("client-portal")}
          className={`qw-plane-nav-item ${activeTab === "client-portal" ? "is-active" : ""}`}
        >
          <Eye size={15} />
          <span>Portal Cliente</span>
        </button>
      </div>

      {/* 4. Proyectos Activos (Selector Limpio con Iconos Vectoriales) */}
      <div className="qw-plane-projects-group">
        <div
          className="qw-plane-group-header"
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
        >
          <span className="qw-plane-nav-title">PROYECTOS ({projects.length})</span>
          <ChevronDown
            size={13}
            className={`qw-plane-toggle-arrow ${isProjectsOpen ? "is-open" : ""}`}
          />
        </div>

        {isProjectsOpen && (
          <div className="qw-plane-projects-list">
            {projects.map((proj) => {
              const Icon = serviceIconMap[proj.serviceId] || Globe;
              const isSelected = proj.id === selectedProjectId;

              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`qw-plane-project-item ${isSelected ? "is-selected" : ""}`}
                >
                  <div className="qw-plane-proj-icon">
                    <Icon size={13} />
                  </div>

                  <div className="qw-plane-proj-text">
                    <strong>{proj.name}</strong>
                    <small>{proj.key} • {proj.progress}%</small>
                  </div>

                  {proj.status === "completed" ? (
                    <div className="qw-plane-proj-status-dot dot-completed" />
                  ) : (
                    <div className="qw-plane-proj-status-dot dot-active" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
