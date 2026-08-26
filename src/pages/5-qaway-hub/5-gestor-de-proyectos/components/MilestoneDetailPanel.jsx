import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, ExternalLink, ShieldCheck, ArrowRight, ArrowLeft, FileCheck2, Sparkles } from "lucide-react";
import { LighthouseScoreCard } from "./LighthouseScoreCard";
import { BrandKitDeliveryCard } from "./BrandKitDeliveryCard";

export function MilestoneDetailPanel({ project, activeMilestone, onNextMilestone, onPrevMilestone, totalMilestones }) {
  const [signedOff, setSignedOff] = useState(false);

  if (!activeMilestone || !project) {
    return null;
  }

  const milestone = activeMilestone;
  const isWebAudit = project.serviceId === "desarrollo-web" && milestone.id === 6;
  const isBrandDelivery = project.serviceId === "branding" && milestone.id === 6;
  const isSignOffStep = milestone.id === 3;
  const isStagingStep = milestone.id === 4;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={milestone.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="qw-gestor-detail-panel"
      >
        {/* Encabezado del Hito Activo */}
        <div className="qw-gestor-detail-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="qw-gestor-phase-pill">
                FASE {milestone.id} DE {totalMilestones}
              </span>
              <span className={`qw-gestor-status-pill status-${milestone.status}`}>
                {milestone.badge}
              </span>
            </div>
            <h3 className="qw-gestor-detail-title">{milestone.title}</h3>
            <p className="qw-gestor-detail-sub">{milestone.subtitle}</p>
          </div>

          <div className="qw-gestor-detail-date-box">
            <Clock size={15} />
            <span>Estimación: {milestone.date}</span>
          </div>
        </div>

        {/* Separador */}
        <div className="qw-gestor-divider" />

        {/* Entregables y Checklist */}
        <div style={{ marginBottom: "28px" }}>
          <h4 className="qw-gestor-section-heading">
            Entregables y Criterios de Aceptación:
          </h4>
          <ul className="qw-gestor-checklist">
            {milestone.deliverables.map((item, idx) => (
              <li key={idx} className="qw-gestor-check-item">
                <CheckCircle size={18} className="qw-gestor-check-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* MÓDULOS ESPECÍFICOS SEGÚN SERVICIO */}
        {isWebAudit && (
          <div style={{ marginBottom: "28px" }}>
            <LighthouseScoreCard scores={project.lighthouseScores} />
          </div>
        )}

        {isBrandDelivery && (
          <div style={{ marginBottom: "28px" }}>
            <BrandKitDeliveryCard palette={project.brandPalette} />
          </div>
        )}

        {/* ACCIONES DEL HITO */}
        <div className="qw-gestor-actions-box">
          {isStagingStep && project.previewUrl && (
            <a
              href={project.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="qw-gestor-btn-primary"
            >
              <span>Ver Demo en Staging ({project.previewUrl})</span>
              <ExternalLink size={15} />
            </a>
          )}

          {isSignOffStep && (
            <button
              type="button"
              onClick={() => setSignedOff(!signedOff)}
              className={signedOff ? "qw-gestor-btn-success" : "qw-gestor-btn-primary"}
            >
              <FileCheck2 size={16} />
              <span>{signedOff ? "✓ Prototipo Aprobado por el Cliente" : "Aprobar Prototipo (Sign-Off)"}</span>
            </button>
          )}

          {milestone.id === 2 && (
            <div className="qw-gestor-sow-card">
              <ShieldCheck size={18} color="#00b090" />
              <div>
                <strong>Presupuesto: {project.budget}</strong>
                <span>Anticipo: {project.paidAmount} | SOW de alcance cerrado validado</span>
              </div>
            </div>
          )}
        </div>

        {/* Navegación entre Hitos (Anterior / Siguiente) */}
        <div className="qw-gestor-nav-footer">
          <button
            type="button"
            onClick={onPrevMilestone}
            disabled={milestone.id === 1}
            className="qw-gestor-nav-btn"
          >
            <ArrowLeft size={14} />
            <span>Hito Anterior</span>
          </button>

          <span style={{ fontSize: "13px", color: "#71717a", fontWeight: "600" }}>
            Hito {milestone.id} de {totalMilestones}
          </span>

          <button
            type="button"
            onClick={onNextMilestone}
            disabled={milestone.id === totalMilestones}
            className="qw-gestor-nav-btn"
          >
            <span>Siguiente Hito</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
