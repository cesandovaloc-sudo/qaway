import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  Globe,
  Palette,
  Cpu,
  TrendingUp,
  FileText,
  Eye,
  Shield,
  ArrowLeft,
  ChevronRight,
  Settings,
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
      
      {/* 1. Header del Workspace */}
      <div className="qw-plane-ws-header">
        <div className="qw-plane-ws-brand">
          <div className="qw-plane-ws-avatar">QW</div>
          <div className="qw-plane-ws-info">
            <strong>Qaway Lab Studio</strong>
            <small>Enterprise Delivery</small>
          </div>
        </div>
        <Link to="/hub" className="qw-plane-ws-back" title="Volver a Qaway Hub">
          <ArrowLeft size={15} />
        </Link>
      </div>

      {/* 2. Botones de Acción Rápida (Estilo Plane) */}
      <div className="qw-plane-quick-actions">
        <button
          type="button"
          onClick={onOpenNewItemModal}
          className="qw-plane-btn-new-item"
        >
          <Plus size={15} />
          <span>Nuevo Work Item</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="qw-plane-btn-new-proj"
          title="Crear Nuevo Proyecto"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* 3. Navegación Principal & Vistas */}
      <div className="qw-plane-nav-group">
        <span className="qw-plane-nav-title">VISTAS PRINCIPALES</span>
        
        <button
          type="button"
          onClick={() => onSelectTab("work-items")}
          className={`qw-plane-nav-item ${activeTab === "work-items" ? "is-active" : ""}`}
        >
          <Layers size={16} />
          <span>Work Items (Tareas)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("kanban")}
          className={`qw-plane-nav-item ${activeTab === "kanban" ? "is-active" : ""}`}
        >
          <FolderKanban size={16} />
          <span>Tablero Kanban</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("milestones")}
          className={`qw-plane-nav-item ${activeTab === "milestones" ? "is-active" : ""}`}
        >
          <Sparkles size={16} />
          <span>Hitos & Ciclos (1-6)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("contract")}
          className={`qw-plane-nav-item ${activeTab === "contract" ? "is-active" : ""}`}
        >
          <FileText size={16} />
          <span>Contrato SOW Oficial</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("client-portal")}
          className={`qw-plane-nav-item ${activeTab === "client-portal" ? "is-active" : ""}`}
        >
          <Eye size={16} />
          <span>Vista Portal Cliente</span>
        </button>
      </div>

      {/* 4. Lista de Proyectos Activos (Plane Tree) */}
      <div className="qw-plane-projects-group">
        <div
          className="qw-plane-group-header"
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
        >
          <span className="qw-plane-nav-title">PROYECTOS ACTIVOS ({projects.length})</span>
          <ChevronDown
            size={14}
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
                  <div
                    className="qw-plane-proj-icon"
                    style={{ backgroundColor: `${proj.serviceColor}15`, color: proj.serviceColor }}
                  >
                    <Icon size={13} />
                  </div>

                  <div className="qw-plane-proj-text">
                    <strong>{proj.name}</strong>
                    <small>{proj.key} • {proj.progress}%</small>
                  </div>

                  <div
                    className="qw-plane-proj-status-dot"
                    style={{
                      backgroundColor: proj.status === "completed" ? "#00b090" : "#ff4b0b"
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
