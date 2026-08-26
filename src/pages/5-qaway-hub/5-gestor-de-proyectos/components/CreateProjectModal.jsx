import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Palette, Cpu, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { SERVICES_CONFIG, saveStoredProject } from "../data/services-milestones-data";

const serviceList = [
  {
    id: "desarrollo-web",
    name: "Desarrollo Web & E-commerce",
    icon: Globe,
    color: "#fe6612",
    defaultPlan: "Web Comercial (Hasta 5 Secciones)",
    defaultBudget: "S/ 290.00",
  },
  {
    id: "branding",
    name: "Branding & Identidad Visual",
    icon: Palette,
    color: "#ff4b0b",
    defaultPlan: "Identidad Visual & Brand Kit Master",
    defaultBudget: "S/ 650.00",
  },
  {
    id: "sistemas-crm",
    name: "Sistemas & Automatización CRM",
    icon: Cpu,
    color: "#00b090",
    defaultPlan: "Bandeja Multiagente WABA + Supabase",
    defaultBudget: "S/ 850.00",
  },
  {
    id: "marketing-leads",
    name: "Marketing & Campañas de Leads",
    icon: TrendingUp,
    color: "#8c67ff",
    defaultPlan: "Campaña Meta Ads + Landing Page",
    defaultBudget: "S/ 450.00",
  },
];

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState("desarrollo-web");
  const [clientName, setClientName] = useState("");
  const [plan, setPlan] = useState("Web Comercial");
  const [budget, setBudget] = useState("S/ 290.00");
  const [targetDate, setTargetDate] = useState("05 Sep 2026");
  const [officialDomain, setOfficialDomain] = useState("");
  const [notes, setNotes] = useState("");

  const handleServiceChange = (srvId) => {
    setSelectedService(srvId);
    const srv = serviceList.find((s) => s.id === srvId);
    if (srv) {
      setPlan(srv.defaultPlan);
      setBudget(srv.defaultBudget);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    // Generar slug limpio
    const slug = clientName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newProject = {
      id: `${slug}-${Date.now()}`,
      slug: slug || `proyecto-${Date.now()}`,
      clientName: clientName.trim(),
      serviceId: selectedService,
      plan: plan.trim(),
      startDate: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      targetDate: targetDate.trim(),
      progress: 15,
      activeMilestone: 1,
      status: "in-progress",
      statusText: "Fase 1: Briefing & Discovery",
      previewUrl: "/landings/desarrollo-web-qaway",
      officialDomain: officialDomain.trim() || `${slug}.com`,
      budget: budget.trim(),
      paidAmount: "S/ 0.00 (Pendiente anticipo 50%)",
      notes: notes.trim() || "Fase inicial de levantamiento de requerimientos y objetivos comerciales.",
    };

    saveStoredProject(newProject);
    if (onProjectCreated) onProjectCreated(newProject);
    onClose();

    // Redirigir al recorrido del proyecto creado
    navigate(`/hub/gestor-proyectos/${selectedService}/${newProject.slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="qw-gestor-modal-overlay" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="qw-gestor-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="qw-gestor-modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="qw-gestor-badge-brand">QAWAY LAB</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#fe6612", textTransform: "uppercase" }}>
                    NUEVO PROYECTO
                  </span>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111111", margin: 0 }}>
                  Crear Proyecto & Iniciar Recorrido
                </h2>
              </div>
              <button type="button" onClick={onClose} className="qw-gestor-modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="qw-gestor-modal-form">
              
              {/* Selector de Servicio */}
              <div>
                <label className="qw-gestor-form-label">TIPO DE SERVICIO</label>
                <div className="qw-gestor-service-grid">
                  {serviceList.map((s) => {
                    const Icon = s.icon;
                    const isSelected = selectedService === s.id;

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleServiceChange(s.id)}
                        className={`qw-gestor-service-option ${isSelected ? "is-selected" : ""}`}
                        style={{
                          borderColor: isSelected ? s.color : "#e4e4e7",
                          backgroundColor: isSelected ? `${s.color}08` : "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: `${s.color}15`,
                            color: s.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <Icon size={15} />
                        </div>
                        <strong style={{ fontSize: "12px", color: isSelected ? "#111111" : "#52525b", display: "block" }}>
                          {s.name}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nombre del Cliente / Marca */}
              <div>
                <label className="qw-gestor-form-label">NOMBRE DEL CLIENTE O MARCA</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Cevichería El Puerto, Estudio Silva, etc."
                  className="qw-gestor-form-input"
                />
              </div>

              {/* Fila Doble: Plan y Presupuesto */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
                <div>
                  <label className="qw-gestor-form-label">PLAN / MODALIDAD</label>
                  <input
                    type="text"
                    required
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Ej: One Web, Web Comercial, Tienda"
                    className="qw-gestor-form-input"
                  />
                </div>
                <div>
                  <label className="qw-gestor-form-label">PRESUPUESTO (S/)</label>
                  <input
                    type="text"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ej: S/ 490.00"
                    className="qw-gestor-form-input"
                  />
                </div>
              </div>

              {/* Fila Doble: Fecha de Entrega y Dominio */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px" }}>
                <div>
                  <label className="qw-gestor-form-label">FECHA DE ENTREGA</label>
                  <input
                    type="text"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="Ej: 05 Sep 2026"
                    className="qw-gestor-form-input"
                  />
                </div>
                <div>
                  <label className="qw-gestor-form-label">DOMINIO OBJETIVO</label>
                  <input
                    type="text"
                    value={officialDomain}
                    onChange={(e) => setOfficialDomain(e.target.value)}
                    placeholder="Ej: miempresa.pe"
                    className="qw-gestor-form-input"
                  />
                </div>
              </div>

              {/* Notas de Discovery Inicial */}
              <div>
                <label className="qw-gestor-form-label">NOTAS DE DISCOVERY / BRIEFING INICIAL</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Objetivos de negocio, dolores del cliente, requerimientos especiales..."
                  className="qw-gestor-form-textarea"
                />
              </div>

              {/* Botón de Creación */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={onClose} className="qw-gestor-btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="qw-gestor-btn-submit">
                  <span>Crear Proyecto & Iniciar Hito 01</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
