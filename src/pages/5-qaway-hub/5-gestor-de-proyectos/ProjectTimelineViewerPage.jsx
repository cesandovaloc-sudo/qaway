import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GestorHeader } from "./components/GestorHeader";
import { MilestoneInteractiveStepper } from "./components/MilestoneInteractiveStepper";
import { MilestoneDetailPanel } from "./components/MilestoneDetailPanel";
import { SERVICES_CONFIG, getStoredProjects } from "./data/services-milestones-data";
import "./styles/gestor-proyectos.css";

export default function ProjectTimelineViewerPage({ isPortalMode = false }) {
  const { serviceType, projectSlug, slug } = useParams();

  const currentSlug = projectSlug || slug || "gelato-gourmet";

  // Buscar el proyecto por slug o fallback
  const project = useMemo(() => {
    const allProjects = getStoredProjects();
    const found = allProjects.find((p) => p.slug === currentSlug);
    return found || allProjects[0];
  }, [currentSlug]);

  const service = SERVICES_CONFIG[project.serviceId] || SERVICES_CONFIG["desarrollo-web"];
  const milestones = service.milestones;

  const [selectedStep, setSelectedStep] = useState(project.activeMilestone || 1);

  const activeMilestone = useMemo(() => {
    return milestones.find((m) => m.id === selectedStep) || milestones[0];
  }, [milestones, selectedStep]);

  const handleNext = () => {
    if (selectedStep < milestones.length) {
      setSelectedStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedStep > 1) {
      setSelectedStep((prev) => prev - 1);
    }
  };

  return (
    <div className="qw-gestor-root">
      <Helmet>
        <title>{`${project.clientName} | Portal de Proyecto & Recorrido Ágil | Qaway Lab`}</title>
        <meta
          name="description"
          content={`Seguimiento en vivo y certificación de entrega del proyecto ${project.clientName} en Qaway Lab.`}
        />
      </Helmet>

      {/* Header del Proyecto */}
      <GestorHeader
        project={project}
        service={service}
        isPortalMode={isPortalMode}
      />

      {/* Cuerpo del Recorrido */}
      <main className="qw-gestor-container">
        
        {/* Stepper / Timeline de 6 Hitos */}
        <MilestoneInteractiveStepper
          milestones={milestones}
          activeStep={selectedStep}
          onSelectStep={setSelectedStep}
          serviceColor={service.color}
        />

        {/* Panel de Detalle del Hito Seleccionado */}
        <MilestoneDetailPanel
          project={project}
          activeMilestone={activeMilestone}
          onNextMilestone={handleNext}
          onPrevMilestone={handlePrev}
          totalMilestones={milestones.length}
        />

      </main>
    </div>
  );
}
