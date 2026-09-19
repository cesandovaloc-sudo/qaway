import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  LayoutGrid,
  FileEdit,
  BarChart3,
  Kanban,
  Video,
  GraduationCap,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function AppSwitcherDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const APPS = [
    {
      name: "Gestor de Proyectos",
      desc: "Frameworks Agile, PMB 6 Hitos y SOW",
      path: "/hub/gestor-proyectos-v2",
      icon: Kanban,
      active: true,
      badge: "V2 Activa"
    },
    {
      name: "Editor de Blog & Artículos",
      desc: "Redactor visual Tiptap con SEO y anclas",
      path: "/hub/blog-editor",
      icon: FileEdit,
      badge: "Pro"
    },
    {
      name: "CRM Comercial & Leads",
      desc: "Gestión de oportunidades y pipeline",
      path: "/hub/crm",
      icon: BarChart3,
      badge: "Pro"
    },
    {
      name: "Creador de Contenido",
      desc: "Fábrica viral con IA y radar de retención",
      path: "/hub/creador-contenido",
      icon: Video,
      badge: "Nuevo"
    },
    {
      name: "Qaway Academy",
      desc: "LMS de cursos, lecciones y certificados",
      path: "/hub/academy",
      icon: GraduationCap,
      badge: "LMS"
    }
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-[calc(100%+8px)] mt-0 w-80 rounded-xl border border-white/10 bg-[#18181b] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-2 duration-200 z-[100] text-left"
    >
      {/* Portales Globales */}
      <div className="pb-3 border-b border-white/5">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Portales Globales
        </p>
        <a
          href="https://www.qawaylab.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff4b0b]/10 text-[#ff4b0b] flex items-center justify-center border border-[#ff4b0b]/20">
              <Globe className="w-4 h-4" />
            </div>
            <span>Web Pública (Qaway Lab)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50" />
        </a>

        <Link
          to="/hub"
          onClick={onClose}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 text-white/70 flex items-center justify-center border border-white/10">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span>Hub Central de Aplicaciones</span>
          </div>
        </Link>
      </div>

      {/* Aplicaciones Activas */}
      <div className="pt-3">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Aplicaciones del Ecosistema
        </p>
        <div className="space-y-1 mt-1">
          {APPS.map((app) => {
            const Icon = app.icon;
            // Para el CRM comprobamos la ruta o app.active
            const isActive = app.path.includes("crm") || app.active; 
            
            return (
              <Link
                key={app.name}
                to={app.path}
                onClick={onClose}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm border border-white/5"
                    : "hover:bg-white/5 text-white/70 hover:text-white border border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive
                      ? "bg-[#ff4b0b]/20 text-[#ff4b0b]"
                      : "bg-white/5 text-white/50 border border-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold truncate text-white">{app.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-[#ff4b0b] text-white"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {app.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? "text-white/70" : "text-white/40"
                    }`}
                  >
                    {app.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
