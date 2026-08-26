import { useState } from "react";
import { Plus, CheckCircle2, Circle, Clock, Tag } from "lucide-react";

export function PlaneKanbanBoard({ workItems, project, onToggleItemState, onOpenNewItemModal }) {
  const columns = [
    { id: "backlog", title: "Backlog / Brief", color: "#71717a" },
    { id: "todo", title: "Por Hacer", color: "#52525b" },
    { id: "in-progress", title: "En Progreso", color: "#ff4b0b" },
    { id: "done", title: "Completado & QA", color: "#00b090" },
  ];

  return (
    <div className="qw-plane-kanban-view">
      <div className="qw-plane-kanban-grid">
        {columns.map((col) => {
          const colItems = workItems.filter((i) => i.state === col.id);

          return (
            <div key={col.id} className="qw-plane-kanban-col">
              
              {/* Encabezado de Columna */}
              <div className="qw-plane-kanban-col-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: col.color,
                    }}
                  />
                  <strong>{col.title}</strong>
                  <span className="qw-plane-col-badge">{colItems.length}</span>
                </div>

                <button
                  type="button"
                  onClick={onOpenNewItemModal}
                  className="qw-plane-col-add-btn"
                  title="Añadir tarea en esta columna"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Tarjetas de la Columna */}
              <div className="qw-plane-kanban-cards-wrap">
                {colItems.map((item) => {
                  const isDone = item.state === "done";

                  return (
                    <div
                      key={item.id}
                      onClick={() => onToggleItemState(item.id, isDone ? "todo" : "done")}
                      className={`qw-plane-kanban-card ${isDone ? "is-done" : ""}`}
                      title="Clic para avanzar o alternar estado"
                    >
                      <div className="qw-plane-kcard-top">
                        <span className="qw-plane-item-key">{item.key}</span>
                        <span className={`qw-plane-priority-badge priority-${item.priority}`}>
                          {item.priority}
                        </span>
                      </div>

                      <h5 className="qw-plane-kcard-title">{item.title}</h5>

                      <div className="qw-plane-kcard-footer">
                        <div className="qw-plane-col-assignee">
                          <div className="qw-plane-avatar-mini">{item.assignee?.charAt(0)}</div>
                          <span>{item.assignee}</span>
                        </div>

                        <div className="qw-plane-col-date">
                          <Clock size={11} />
                          <span>{item.dueDate}</span>
                        </div>
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
