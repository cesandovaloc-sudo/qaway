import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  User,
  Tag,
  Plus,
  Sparkles,
  Check,
} from "lucide-react";

export function PlaneWorkItemsList({ workItems, project, onToggleItemState, onOpenNewItemModal }) {
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  const groups = [
    { id: "in-progress", label: "En Progreso", color: "#ff4b0b", count: workItems.filter(i => i.state === "in-progress").length },
    { id: "todo", label: "Por Hacer / En Cola", color: "#52525b", count: workItems.filter(i => i.state === "todo").length },
    { id: "backlog", label: "Backlog / Requerimientos", color: "#71717a", count: workItems.filter(i => i.state === "backlog").length },
    { id: "done", label: "Completado & Verificado", color: "#00b090", count: workItems.filter(i => i.state === "done").length },
  ];

  const handleSelectOne = (id) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItemIds(next);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <span className="qw-plane-priority-badge priority-urgent">Urgente</span>;
      case "high":
        return <span className="qw-plane-priority-badge priority-high">Alta</span>;
      case "medium":
        return <span className="qw-plane-priority-badge priority-medium">Media</span>;
      default:
        return <span className="qw-plane-priority-badge priority-low">Baja</span>;
    }
  };

  return (
    <div className="qw-plane-work-items-view">
      
      {/* Barra Superior de Herramientas (Estilo Dub.co / Plane) */}
      <div className="qw-plane-table-toolbar">
        <div className="qw-plane-toolbar-left">
          <span className="qw-plane-items-count">
            <strong>{workItems.length}</strong> Work Items en <strong>{project.name}</strong>
          </span>

          {selectedItemIds.size > 0 && (
            <div className="qw-plane-bulk-actions">
              <span>{selectedItemIds.size} seleccionados</span>
              <button
                type="button"
                onClick={() => {
                  selectedItemIds.forEach(id => onToggleItemState(id, "done"));
                  setSelectedItemIds(new Set());
                }}
                className="qw-plane-btn-bulk"
              >
                <Check size={12} /> Marcar Completados
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenNewItemModal}
          className="qw-plane-btn-add-item"
        >
          <Plus size={14} />
          <span>Añadir Tarea</span>
        </button>
      </div>

      {/* Lista Agrupada por Estado */}
      <div className="qw-plane-groups-container">
        {groups.map((grp) => {
          const itemsInGroup = workItems.filter((i) => i.state === grp.id);
          if (itemsInGroup.length === 0 && grp.id === "backlog") return null;

          return (
            <div key={grp.id} className="qw-plane-group-block">
              
              {/* Encabezado del Grupo */}
              <div className="qw-plane-group-title-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: grp.color,
                    }}
                  />
                  <h4 className="qw-plane-group-title">{grp.label}</h4>
                  <span className="qw-plane-group-count">{itemsInGroup.length}</span>
                </div>
              </div>

              {/* Filas de Work Items (Estilo Plane Table) */}
              <div className="qw-plane-items-table">
                {itemsInGroup.map((item) => {
                  const isChecked = selectedItemIds.has(item.id);
                  const isDone = item.state === "done";

                  return (
                    <div
                      key={item.id}
                      className={`qw-plane-item-row ${isDone ? "is-done" : ""}`}
                    >
                      {/* Checkbox de selección múltiple */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectOne(item.id)}
                        className="qw-plane-row-check"
                      />

                      {/* Botón de cambio de estado rápido */}
                      <button
                        type="button"
                        onClick={() => onToggleItemState(item.id, isDone ? "todo" : "done")}
                        className="qw-plane-state-toggle"
                        title={isDone ? "Reabrir tarea" : "Marcar como completada"}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color="#00b090" />
                        ) : (
                          <Circle size={16} color="#a1a1aa" />
                        )}
                      </button>

                      {/* Clave de Issue (QW-101) */}
                      <span className="qw-plane-item-key">{item.key}</span>

                      {/* Título de la Tarea */}
                      <span className="qw-plane-item-title">{item.title}</span>

                      {/* Prioridad */}
                      <div className="qw-plane-col-priority">
                        {getPriorityBadge(item.priority)}
                      </div>

                      {/* Asignado / Rol */}
                      <div className="qw-plane-col-assignee">
                        <div className="qw-plane-avatar-mini">{item.assignee?.charAt(0)}</div>
                        <span>{item.assignee}</span>
                      </div>

                      {/* Fecha de Entrega */}
                      <div className="qw-plane-col-date">
                        <Clock size={12} />
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
