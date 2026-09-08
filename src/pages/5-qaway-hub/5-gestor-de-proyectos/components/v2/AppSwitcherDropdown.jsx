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
      className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-left"
    >
      {/* Portales Globales */}
      <div className="pb-2 border-b border-zinc-100">
        <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Portales Globales
        </p>
        <a
          href="https://qaway.pe"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <span>Web Pública (qaway.pe)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </a>

        <Link
          to="/hub"
          onClick={onClose}
          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span>Hub Central de Aplicaciones</span>
          </div>
        </Link>
      </div>

      {/* Aplicaciones Activas */}
      <div className="pt-2">
        <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Aplicaciones del Ecosistema
        </p>
        <div className="space-y-1 mt-1">
          {APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.name}
                to={app.path}
                onClick={onClose}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                  app.active
                    ? "bg-zinc-900 text-white font-medium shadow-sm"
                    : "hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    app.active
                      ? "bg-white/10 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">{app.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        app.active
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {app.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      app.active ? "text-zinc-300" : "text-zinc-500"
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
