import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Layers,
  FolderKanban,
  FileText,
  Eye,
  Plus,
  Sparkles,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";

import {
  getPlaneProjects,
  savePlaneProjects,
  getPlaneWorkItems,
  savePlaneWorkItems,
} from "./data/plane-gestor-data";
import { SERVICES_CONFIG } from "./data/services-milestones-data";

import { PlaneSidebar } from "./components/PlaneSidebar";
import { PlaneWorkItemsList } from "./components/PlaneWorkItemsList";
import { PlaneKanbanBoard } from "./components/PlaneKanbanBoard";
import { ContractDownloadView } from "./components/ContractDownloadView";
import { CreateWorkItemModal } from "./components/CreateWorkItemModal";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { MilestoneInteractiveStepper } from "./components/MilestoneInteractiveStepper";
import { MilestoneDetailPanel } from "./components/MilestoneDetailPanel";

import "./styles/gestor-proyectos.css";

export default function GestorProyectosHubPage() {
  const [projects, setProjects] = useState(() => getPlaneProjects());
  const [workItems, setWorkItems] = useState(() => getPlaneWorkItems());
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "proj-web-01");
  const [activeTab, setActiveTab] = useState("work-items"); // 'work-items' | 'kanban' | 'milestones' | 'contract' | 'client-portal'
  
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isNewProjModalOpen, setIsNewProjModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Proyecto seleccionado
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Work items del proyecto seleccionado
  const currentWorkItems = useMemo(() => {
    return workItems.filter((i) => i.projectId === currentProject.id);
  }, [workItems, currentProject]);

  // Configuración del servicio
  const serviceConfig = SERVICES_CONFIG[currentProject.serviceId] || SERVICES_CONFIG["desarrollo-web"];
  const milestones = serviceConfig.milestones;

  const [activeMilestoneStep, setActiveMilestoneStep] = useState(currentProject.activeMilestone || 1);

  const activeMilestoneObj = useMemo(() => {
    return milestones.find((m) => m.id === activeMilestoneStep) || milestones[0];
  }, [milestones, activeMilestoneStep]);

  // Alternar estado de tarea
  const handleToggleItemState = (itemId, newState) => {
    const updated = workItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          state: newState,
          stateLabel: newState === "done" ? "Completado" : newState === "in-progress" ? "En Progreso" : "Por Hacer"
        };
      }
      return item;
    });
    setWorkItems(updated);
    savePlaneWorkItems(updated);
  };

  // Añadir nuevo Work Item
  const handleAddWorkItem = (newItem) => {
    const updated = [newItem, ...workItems];
    setWorkItems(updated);
    savePlaneWorkItems(updated);
  };

  // Añadir nuevo Proyecto
  const handleProjectCreated = (newProj) => {
    const planeProj = {
      id: `proj-${Date.now()}`,
      key: `QW-${newProj.slug.substring(0, 3).toUpperCase()}`,
      name: newProj.clientName,
      slug: newProj.slug,
      serviceId: newProj.serviceId,
      serviceName: newProj.serviceId === "desarrollo-web" ? "Desarrollo Web & E-commerce" : "Servicio Digital",
      serviceColor: "#ff4b0b",
      client: newProj.clientName,
      plan: newProj.plan,
      budget: newProj.budget,
      paidAmount: newProj.paidAmount,
      status: "in-progress",
      statusText: "En Discovery",
      progress: 15,
      activeMilestone: 1,
      targetDate: newProj.targetDate,
      domain: newProj.officialDomain,
      previewUrl: newProj.previewUrl
    };

    const updatedProjects = [planeProj, ...projects];
    setProjects(updatedProjects);
    savePlaneProjects(updatedProjects);
    setSelectedProjectId(planeProj.id);
  };

  const handleCopyClientLink = () => {
    const url = `${window.location.origin}/portal/${currentProject.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="qw-plane-app-root">
      <Helmet>
        <title>{`Qaway Studio | ${currentProject.name} - Gestor de Proyectos`}</title>
        <meta
          name="description"
          content="Plataforma de gestión de proyectos y seguimiento ágil de entregas de Qaway Lab."
        />
      </Helmet>

      {/* Modales */}
      <CreateWorkItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        project={currentProject}
        onAddItem={handleAddWorkItem}
      />

      <CreateProjectModal
        isOpen={isNewProjModalOpen}
        onClose={() => setIsNewProjModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* CONTENEDOR PRINCIPAL CON RESPONSIVE DESIGN Y BORDES CONTENIDOS */}
      <div className="qw-plane-main-container">
        
        <div className="qw-plane-layout-grid">
          
          {/* 1. SIDEBAR LATERAL */}
          <PlaneSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              const proj = projects.find(p => p.id === id);
              if (proj) setActiveMilestoneStep(proj.activeMilestone || 1);
            }}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenNewItemModal={() => setIsNewItemModalOpen(true)}
            onOpenNewProjectModal={() => setIsNewProjModalOpen(true)}
          />

          {/* 2. ÁREA DE TRABAJO PRINCIPAL */}
          <main className="qw-plane-workspace">
            
            {/* Topbar del Proyecto */}
            <header className="qw-plane-topbar">
              <div className="qw-plane-topbar-left">
                <span className="qw-plane-proj-key-badge">{currentProject.key}</span>
                <h2 className="qw-plane-topbar-title">{currentProject.name}</h2>
                <span className="qw-plane-topbar-plan">{currentProject.plan}</span>
              </div>

              <div className="qw-plane-topbar-actions">
                <button
                  type="button"
                  onClick={handleCopyClientLink}
                  className="qw-plane-btn-share"
                  title="Copiar enlace para el cliente"
                >
                  {copiedLink ? (
                    <>
                      <Check size={13} color="#00b090" />
                      <span style={{ color: "#00b090" }}>Link Copiado</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} />
                      <span>Compartir Portal</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(true)}
                  className="qw-plane-btn-primary"
                >
                  <Plus size={13} />
                  <span>Crear Tarea</span>
                </button>
              </div>
            </header>

            {/* Barra de Pestañas de Vista */}
            <div className="qw-plane-tabs-bar">
              <button
                type="button"
                onClick={() => setActiveTab("work-items")}
                className={`qw-plane-tab-btn ${activeTab === "work-items" ? "is-active" : ""}`}
              >
                <Layers size={14} />
                <span>Work Items ({currentWorkItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("kanban")}
                className={`qw-plane-tab-btn ${activeTab === "kanban" ? "is-active" : ""}`}
              >
                <FolderKanban size={14} />
                <span>Tablero Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("milestones")}
                className={`qw-plane-tab-btn ${activeTab === "milestones" ? "is-active" : ""}`}
              >
                <Sparkles size={14} />
                <span>Hitos & Fases (1-6)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contract")}
                className={`qw-plane-tab-btn ${activeTab === "contract" ? "is-active" : ""}`}
              >
                <FileText size={14} />
                <span>Contrato SOW</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("client-portal")}
                className={`qw-plane-tab-btn ${activeTab === "client-portal" ? "is-active" : ""}`}
              >
                <Eye size={14} />
                <span>Portal del Cliente</span>
              </button>
            </div>

            {/* CONTENIDO DE LA VISTA SELECCIONADA */}
            <div className="qw-plane-content-body">
              
              {/* VISTA 1: WORK ITEMS */}
              {activeTab === "work-items" && (
                <PlaneWorkItemsList
                  workItems={currentWorkItems}
                  project={currentProject}
                  onToggleItemState={handleToggleItemState}
                  onOpenNewItemModal={() => setIsNewItemModalOpen(true)}
                />
              )}

              {/* VISTA 2: TABLERO KANBAN */}
              {activeTab === "kanban" && (
                <PlaneKanbanBoard
                  workItems={currentWorkItems}
                  project={currentProject}
                  onToggleItemState={handleToggleItemState}
                  onOpenNewItemModal={() => setIsNewItemModalOpen(true)}
                />
              )}

              {/* VISTA 3: HITOS & FASES */}
              {activeTab === "milestones" && (
                <div>
                  <MilestoneInteractiveStepper
                    milestones={milestones}
                    activeStep={activeMilestoneStep}
                    onSelectStep={setActiveMilestoneStep}
                    serviceColor={currentProject.serviceColor}
                  />

                  <MilestoneDetailPanel
                    project={currentProject}
                    activeMilestone={activeMilestoneObj}
                    onNextMilestone={() => {
                      if (activeMilestoneStep < milestones.length) setActiveMilestoneStep(prev => prev + 1);
                    }}
                    onPrevMilestone={() => {
                      if (activeMilestoneStep > 1) setActiveMilestoneStep(prev => prev - 1);
                    }}
                    totalMilestones={milestones.length}
                  />
                </div>
              )}

              {/* VISTA 4: CONTRATO SOW */}
              {activeTab === "contract" && (
                <ContractDownloadView project={currentProject} />
              )}

              {/* VISTA 5: PORTAL DEL CLIENTE */}
              {activeTab === "client-portal" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fbfbfc", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "20px" }}>
                    <div>
                      <strong style={{ fontSize: "13px", color: "#111111", display: "block" }}>Enlace Público del Portal de Cliente:</strong>
                      <span style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace" }}>
                        {window.location.origin}/portal/{currentProject.slug}
                      </span>
                    </div>
                    <a
                      href={`/portal/${currentProject.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="qw-plane-btn-share"
                    >
                      <span>Abrir Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <MilestoneInteractiveStepper
                    milestones={milestones}
                    activeStep={activeMilestoneStep}
                    onSelectStep={setActiveMilestoneStep}
                    serviceColor={currentProject.serviceColor}
                  />

                  <MilestoneDetailPanel
                    project={currentProject}
                    activeMilestone={activeMilestoneObj}
                    onNextMilestone={() => {
                      if (activeMilestoneStep < milestones.length) setActiveMilestoneStep(prev => prev + 1);
                    }}
                    onPrevMilestone={() => {
                      if (activeMilestoneStep > 1) setActiveMilestoneStep(prev => prev - 1);
                    }}
                    totalMilestones={milestones.length}
                  />
                </div>
              )}

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}
