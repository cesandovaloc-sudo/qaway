import { useState } from "react";
import { X, Plus, ArrowRight } from "lucide-react";

export function CreateWorkItemModal({ isOpen, onClose, project, onAddItem }) {
  const [title, setTitle] = useState("");
  const [state, setState] = useState("todo");
  const [priority, setPriority] = useState("high");
  const [assignee, setAssignee] = useState("Antigravity");
  const [dueDate, setDueDate] = useState("30 Ago");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      key: `${project.key || "QW"}-${Math.floor(100 + Math.random() * 900)}`,
      projectId: project.id,
      title: title.trim(),
      state,
      stateLabel: state === "done" ? "Completado" : state === "in-progress" ? "En Progreso" : "Por Hacer",
      priority,
      priorityLabel: priority.toUpperCase(),
      assignee: assignee.trim(),
      role: "Team",
      dueDate: dueDate.trim(),
      serviceId: project.serviceId,
      milestone: 4
    };

    onAddItem(newItem);
    setTitle("");
    onClose();
  };

  return (
    <div className="qw-gestor-modal-overlay" onClick={onClose}>
      <div className="qw-gestor-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="qw-gestor-modal-header">
          <div>
            <span className="qw-gestor-brand-badge">{project.name}</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "6px 0 0", color: "#111111" }}>
              Añadir Nuevo Work Item (Tarea)
            </h3>
          </div>
          <button type="button" onClick={onClose} className="qw-gestor-modal-close-btn">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="qw-gestor-modal-form">
          <div>
            <label className="qw-gestor-form-label">TÍTULO DEL WORK ITEM / ENTREGABLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Integrar API de pagos Culqi con webhooks"
              className="qw-gestor-form-input"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="qw-gestor-form-label">ESTADO INICIAL</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="qw-gestor-form-input"
              >
                <option value="backlog">Backlog / Discovery</option>
                <option value="todo">Por Hacer</option>
                <option value="in-progress">En Progreso</option>
                <option value="done">Completado</option>
              </select>
            </div>

            <div>
              <label className="qw-gestor-form-label">PRIORIDAD</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="qw-gestor-form-input"
              >
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="qw-gestor-form-label">ASIGNADO A</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nombre o Rol"
                className="qw-gestor-form-input"
              />
            </div>

            <div>
              <label className="qw-gestor-form-label">FECHA DE ENTREGA</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Ej: 30 Ago"
                className="qw-gestor-form-input"
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose} className="qw-gestor-btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="qw-gestor-btn-submit">
              <span>Guardar Work Item</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
