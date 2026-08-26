import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Check, Globe, Sparkles, LayoutDashboard } from "lucide-react";

export function GestorHeader({ project, service, isPortalMode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="qw-gestor-header">
      <div className="qw-gestor-header-inner">
        
        {/* Fila Superior: Breadcrumb & Acciones */}
        <div className="qw-gestor-header-top">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isPortalMode ? (
              <Link to="/hub/gestor-proyectos" className="qw-gestor-back-link">
                <ArrowLeft size={15} />
                <span>Gestor de Proyectos</span>
              </Link>
            ) : (
              <div className="qw-gestor-brand-badge">
                <span>QAWAY LAB</span>
                <small>CLIENT PORTAL</small>
              </div>
            )}

            <span className="qw-gestor-sep">/</span>
            <span className="qw-gestor-service-tag" style={{ borderColor: service?.color || "#fe6612" }}>
              {service?.name || "Servicio Digital"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleCopyLink}
              className="qw-gestor-share-btn"
              title="Copiar enlace para el cliente"
            >
              {copied ? (
                <>
                  <Check size={14} color="#00b090" />
                  <span style={{ color: "#00b090" }}>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Compartir con Cliente</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fila Principal: Título del Proyecto, Cliente y Barra de Progreso */}
        <div className="qw-gestor-header-main">
          <div>
            <span className="qw-gestor-client-label">PROYECTO ACTIVO</span>
            <h1 className="qw-gestor-project-title">{project.clientName}</h1>
            <p className="qw-gestor-project-plan">{project.plan}</p>
          </div>

          {/* Caja de Progreso y Fechas */}
          <div className="qw-gestor-progress-card">
            <div className="qw-gestor-progress-meta">
              <span className="qw-gestor-progress-label">Avance General del Proyecto</span>
              <strong className="qw-gestor-progress-pct">{project.progress}%</strong>
            </div>
            
            <div className="qw-gestor-progress-bar-bg">
              <div
                className="qw-gestor-progress-bar-fill"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: service?.color || "#fe6612"
                }}
              />
            </div>

            <div className="qw-gestor-dates-meta">
              <span>Inicio: {project.startDate}</span>
              <span>•</span>
              <span>Entrega: {project.targetDate}</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
