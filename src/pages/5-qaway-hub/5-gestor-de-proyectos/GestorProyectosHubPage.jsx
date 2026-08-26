import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Globe,
  Palette,
  Cpu,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { SERVICES_CONFIG, getStoredProjects } from "./data/services-milestones-data";
import { CreateProjectModal } from "./components/CreateProjectModal";
import "./styles/gestor-proyectos.css";

const serviceIcons = {
  "desarrollo-web": Globe,
  "branding": Palette,
  "sistemas-crm": Cpu,
  "marketing-leads": TrendingUp,
};

export default function GestorProyectosHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState(() => getStoredProjects());

  const handleProjectCreated = (newProject) => {
    setProjects(getStoredProjects());
  };

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((p) => p.serviceId === selectedCategory);

  return (
    <div className="qw-gestor-root">
      <Helmet>
        <title>Gestor de Proyectos & Metodología Ágil | Qaway Hub</title>
        <meta
          name="description"
          content="Consola central de gestión de proyectos y ciclo de vida ágil para Desarrollo Web, Branding, CRM y Marketing."
        />
      </Helmet>

      {/* Modal de Creación de Proyecto */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Header del Dashboard */}
      <header className="qw-gestor-header">
        <div className="qw-gestor-header-inner">
          <div className="qw-gestor-header-top">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/hub" className="qw-gestor-back-link">
                <span>← Volver a Qaway Hub</span>
              </Link>
            </div>
            <div className="qw-gestor-brand-badge">
              <span>QAWAY HUB</span>
              <small>GESTOR DE PROYECTOS</small>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="qw-gestor-client-label">ENGINEERING & PRODUCT MANAGEMENT</span>
              <h1 className="qw-gestor-project-title">Gestor de Proyectos</h1>
              <p className="qw-gestor-project-plan">
                Trazabilidad ágil de 6 hitos por servicio: desde el Briefing hasta la Certificación de Entrega.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="qw-gestor-btn-submit"
                style={{ padding: "10px 20px" }}
              >
                <Plus size={16} />
                <span>Nuevo Proyecto</span>
              </button>

              <div className="qw-gestor-sow-card" style={{ background: "#ffffff" }}>
                <FolderKanban size={18} color="#fe6612" />
                <div>
                  <strong>{projects.length} Proyectos Registrados</strong>
                  <span>4 Servicios Configurados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="qw-gestor-container">
        
        {/* Pestañas de Filtro por Servicio */}
        <div className="qw-gestor-dash-tabs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`qw-gestor-dash-tab ${selectedCategory === "all" ? "is-active" : ""}`}
          >
            <span>Todos los Servicios ({projects.length})</span>
          </button>

          {Object.values(SERVICES_CONFIG).map((srv) => {
            const Icon = serviceIcons[srv.id] || Globe;
            const count = SAMPLE_PROJECTS.filter((p) => p.serviceId === srv.id).length;
            const isActive = selectedCategory === srv.id;

            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setSelectedCategory(srv.id)}
                className={`qw-gestor-dash-tab ${isActive ? "is-active" : ""}`}
              >
                <Icon size={15} color={isActive ? "#ffffff" : srv.color} />
                <span>{srv.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Grid de Tarjetas de Proyecto */}
        <div className="qw-gestor-projects-grid">
          {filteredProjects.map((proj, idx) => {
            const srv = SERVICES_CONFIG[proj.serviceId];
            const Icon = serviceIcons[proj.serviceId] || Globe;

            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  to={`/hub/gestor-proyectos/${proj.serviceId}/${proj.slug}`}
                  className="qw-gestor-card"
                >
                  <div className="qw-gestor-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: `${srv.color}15`,
                          color: srv.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#71717a", textTransform: "uppercase" }}>
                          {srv.shortName}
                        </span>
                      </div>
                    </div>

                    <span className={`qw-gestor-status-pill status-${proj.status}`}>
                      {proj.statusText}
                    </span>
                  </div>

                  <h3 className="qw-gestor-card-title">{proj.clientName}</h3>
                  <p className="qw-gestor-card-plan">{proj.plan}</p>

                  <div className="qw-gestor-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ color: "#71717a" }}>Hito 0{proj.activeMilestone} de 06</span>
                      <strong style={{ color: "#111111" }}>{proj.progress}%</strong>
                    </div>

                    <div className="qw-gestor-progress-bar-bg" style={{ height: "6px" }}>
                      <div
                        className="qw-gestor-progress-bar-fill"
                        style={{ width: `${proj.progress}%`, backgroundColor: srv.color }}
                      />
                    </div>

                    <p style={{ fontSize: "12.5px", color: "#71717a", margin: "10px 0 0", lineHeight: "1.4" }}>
                      {proj.notes}
                    </p>
                  </div>

                  <div className="qw-gestor-card-footer">
                    <span style={{ fontWeight: "700", color: "#18181b" }}>{proj.budget}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fe6612", fontWeight: "700" }}>
                      <span>Ver Recorrido</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
