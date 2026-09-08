import { useEffect } from "react";
import {
  X,
  Clock,
  User,
  CheckSquare,
  AlertCircle,
  Tag,
  Save,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function SlideOverTaskSheet({ item, isOpen, onClose, onSave, onDelete }) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop con desenfoque suave */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-zinc-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Cabecera del Slide-Over */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded">
                {item.id || "ITEM"}
              </span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded">
                {item.stateLabel || item.state || "En Progreso"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Eliminar este elemento?")) {
                      onDelete(item.id);
                      onClose();
                    }
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar elemento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo del Slide-Over */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Título de la tarea */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Título del Requerimiento / Tarea
              </label>
              <h2 className="text-lg font-bold text-zinc-900 leading-snug">
                {item.title}
              </h2>
            </div>

            {/* Metadatos en Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
              <div>
                <span className="text-zinc-400 font-medium block mb-1">Responsable</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>{item.assignee || "Equipo Qaway"}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 font-medium block mb-1">Prioridad</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{item.priority || "ALTA"}</span>
                </div>
              </div>

              {item.points && (
                <div>
                  <span className="text-zinc-400 font-medium block mb-1">Story Points</span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {item.points}
                  </span>
                </div>
              )}

              {item.date && (
                <div>
                  <span className="text-zinc-400 font-medium block mb-1">Cronograma</span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Entregables o Criterios de Aceptación */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                  Criterios de Aceptación & Entregables
                </label>
              </div>

              <div className="space-y-2">
                {(item.deliverables || [
                  "Validación técnica y compatibilidad responsive probada",
                  "Revisión de estándares de accesibilidad WCAG y calidad de código",
                  "Aprobación formal del cliente o líder de sprint"
                ]).map((d, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50 transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index === 0}
                      className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-zinc-700 leading-relaxed font-medium">
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notas / Observaciones */}
            <div>
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">
                Notas de Ejecución
              </label>
              <textarea
                rows={3}
                defaultValue={item.description || "Implementación ejecutada siguiendo el estándar de arquitectura modular de Qaway Lab."}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-400 focus:outline-none transition-all placeholder:text-zinc-400 resize-none font-medium"
                placeholder="Añade notas o comentarios para el equipo..."
              />
            </div>
          </div>

          {/* Footer con Botones de Acción */}
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSave) onSave(item);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
