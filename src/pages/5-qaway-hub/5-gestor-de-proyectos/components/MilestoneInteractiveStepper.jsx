import { motion } from "framer-motion";
import { Check, Clock, Sparkles } from "lucide-react";

export function MilestoneInteractiveStepper({ milestones, activeStep, onSelectStep, serviceColor }) {
  const accentColor = serviceColor || "#fe6612";

  return (
    <div className="qw-gestor-stepper-container">
      <div className="qw-gestor-stepper-track">
        {milestones.map((m, index) => {
          const isCompleted = m.id < activeStep || m.status === "completed";
          const isActive = m.id === activeStep;
          const isPending = m.id > activeStep && m.status !== "completed";

          return (
            <div
              key={m.id}
              onClick={() => onSelectStep(m.id)}
              className={`qw-gestor-step-node ${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
            >
              {/* Conector de línea entre pasos */}
              {index < milestones.length - 1 && (
                <div
                  className={`qw-gestor-step-line ${isCompleted ? "line-completed" : ""}`}
                  style={{
                    backgroundColor: isCompleted ? accentColor : "#e4e4e7"
                  }}
                />
              )}

              {/* Círculo de Hito con Icono o Número */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="qw-gestor-step-bubble"
                style={{
                  borderColor: isActive ? accentColor : isCompleted ? accentColor : "#e4e4e7",
                  backgroundColor: isCompleted ? accentColor : isActive ? "#ffffff" : "#ffffff",
                  color: isCompleted ? "#ffffff" : isActive ? accentColor : "#71717a",
                  boxShadow: isActive ? `0 0 0 4px ${accentColor}25, 0 4px 14px rgba(0,0,0,0.08)` : "none",
                }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : isActive ? (
                  <span style={{ fontWeight: "800", fontSize: "14px" }}>{m.id}</span>
                ) : (
                  <span style={{ fontWeight: "600", fontSize: "13px" }}>{m.id}</span>
                )}
              </motion.div>

              {/* Título y Estado del Hito */}
              <div className="qw-gestor-step-meta">
                <span className="qw-gestor-step-num">HITO 0{m.id}</span>
                <strong className="qw-gestor-step-title">{m.title}</strong>
                <span className="qw-gestor-step-date">{m.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
