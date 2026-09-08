import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Home,
  Layers,
  ChevronDown,
  Sparkles,
  Lock,
  FileText,
  HelpCircle,
  Keyboard,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Check,
  Globe,
  Kanban
} from "lucide-react";
import { AppSwitcherDropdown } from "./AppSwitcherDropdown";

function formatShortName(name) {
  if (!name) return "Carlos S.";
  if (name.includes("@")) {
    const local = name.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function getInitial(name) {
  if (!name) return "C";
  return name.trim().charAt(0).toUpperCase();
}

export function GestorHeaderV2({
  onOpenCreateProject,
  searchQuery,
  onSearchChange,
  currentProject,
  activeArchetype,
  onArchetypeChange
}) {
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("system"); // 'light' | 'dark' | 'system'
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const userEmail = sessionStorage.getItem("qaway_auth_email") || localStorage.getItem("qaway_auth_email") || "carlos@qaway.pe";
  const userRole = sessionStorage.getItem("qaway_auth_role") || "admin";
  const displayName = formatShortName(userEmail);
  const initial = getInitial(displayName);

  // Click outside & Escape listeners para UserMenu
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsThemeSubmenuOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsThemeSubmenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.removeItem("qaway_auth_token");
    localStorage.removeItem("qaway_auth_email");
    localStorage.removeItem("qaway_auth_role");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md select-none">
      {/* ─── ZONA IZQUIERDA: TRÍADA DE NAVEGACIÓN ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* 1. Waffle App Switcher con animación de hover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWaffleOpen(!isWaffleOpen)}
            className="group flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700 transition-all duration-300 ease-out cursor-pointer"
            title="Ecosistema de Aplicaciones"
            aria-label="Abrir lanzador de aplicaciones"
          >
            {/* 9 Dots Grid Vector SVG */}
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4 place-items-center">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors"
                />
              ))}
            </div>
            {/* Texto que se expande suavemente */}
            <span className="text-xs font-bold text-zinc-800 max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">
              Apps
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700 transition-transform duration-200" />
          </button>

          <AppSwitcherDropdown
            isOpen={isWaffleOpen}
            onClose={() => setIsWaffleOpen(false)}
          />
        </div>

        {/* 2. Logo Qaway Lab (Retorno a Web Pública) */}
        <a
          href="https://qaway.pe"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-black text-zinc-900 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors group"
          title="Ir a la web principal (qaway.pe)"
        >
          <span className="w-5 h-5 rounded-md bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black group-hover:bg-orange-500 transition-colors">
            Q
          </span>
          <span className="tracking-tight">Qaway Lab</span>
        </a>

        <span className="hidden sm:inline text-zinc-300 text-xs font-bold">/</span>

        {/* 3. Icono Casa (Inicio de esta app) + Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/hub/gestor-proyectos-v2"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
            title="Inicio de Gestor de Proyectos"
          >
            <Home className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Gestor de Proyectos</span>
          </Link>
          {currentProject && (
            <>
              <span className="text-zinc-300 text-xs font-bold">/</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-md truncate max-w-40">
                {currentProject.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── ZONA DERECHA: BÚSQUEDA, CREAR & USER MENU ────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Omnibox Buscador */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar tarea o hito... (Cmd+K)"
            className="w-full h-8 pl-8 pr-3 text-xs bg-zinc-100 border border-transparent focus:border-zinc-300 focus:bg-white rounded-lg focus:outline-none transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Botón Primario + Crear Proyecto */}
        <button
          type="button"
          onClick={onOpenCreateProject}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nuevo Proyecto</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        {/* Separador de 24px */}
        <div className="h-6 w-px bg-zinc-200 mx-1 hidden sm:block" />

        {/* ── Dropdown de Usuario (UserMenu Estándar Academy & Atlassian) ── */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
          >
            {/* Avatar Monograma */}
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
              {initial}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-zinc-800">
              {displayName}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable con 6 Bloques */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50 text-left">
              {/* Bloque 1: Identidad */}
              <div className="border-b border-zinc-100 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {userEmail}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 bg-zinc-100 text-zinc-700 rounded">
                      {userRole === "admin" ? "Super Admin" : "Gestor"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Preferencias y Rol */}
              <div className="py-1 border-b border-zinc-100 text-xs">
                <Link
                  to="/hub"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Kanban className="w-4 h-4 text-zinc-500" />
                  <span>Mis Proyectos Activos</span>
                </Link>
                <Link
                  to="/hub/blog-editor"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <span>Editor de Artículos</span>
                </Link>
              </div>

              {/* Bloque 3: Conmutador de Tema con Submenú */}
              <div className="py-1 border-b border-zinc-100 text-xs relative">
                <button
                  type="button"
                  onClick={() => setIsThemeSubmenuOpen(!isThemeSubmenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-zinc-500" />
                    <span>Tema Visual</span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-600 uppercase">
                    {currentTheme} ▸
                  </span>
                </button>

                {/* Submenú de Tema con Mini-Previews */}
                {isThemeSubmenuOpen && (
                  <div className="absolute right-full top-0 mr-2 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl z-50 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTheme("light");
                        setIsThemeSubmenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentTheme === "light"
                          ? "bg-orange-50 text-orange-600"
                          : "hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        <span>Modo Claro</span>
                      </div>
                      {currentTheme === "light" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTheme("dark");
                        setIsThemeSubmenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentTheme === "dark"
                          ? "bg-orange-50 text-orange-600"
                          : "hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        <span>Modo Oscuro</span>
                      </div>
                      {currentTheme === "dark" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTheme("system");
                        setIsThemeSubmenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentTheme === "system"
                          ? "bg-orange-50 text-orange-600"
                          : "hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>Sistema</span>
                      </div>
                      {currentTheme === "system" && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Bloque 4: Ayuda y Atajos de Teclado */}
              <div className="py-1 border-b border-zinc-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    alert("Atajos de Teclado:\n• Cmd+K: Búsqueda global\n• N: Nuevo proyecto\n• Esc: Cerrar paneles");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-zinc-500" />
                  <span>Atajos de Teclado</span>
                </button>
              </div>

              {/* Bloque 5: Salida del Sistema */}
              <div className="pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
