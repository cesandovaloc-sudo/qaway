import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserRound,
  CheckCircle2,
  Clock3,
  CircleX,
  Plus,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Save,
  ShieldCheck,
} from "lucide-react";

/**
 * Qaway Lab — Panel / Usuarios (rol + tenant)
 *
 * Acoplamiento:
 * - Este módulo NO contiene router, layout ni autenticación.
 * - El shell del Hub sigue siendo responsabilidad del panel padre.
 * - Recibe el rol resuelto por el panel (isPlatformAdmin) como fuente de
 *   verdad (BD: users.role='admin' AND is_platform_admin), NO se re-deriva
 *   aquí a partir del JWT.
 *
 * Props:
 *   tenantId: string
 *   session: object
 *   supabase: cliente Supabase central
 *   isPlatformAdmin: boolean (panelAuth.isPlatformAdmin — BD, no emails)
 *   tenantName: string (marca del tenant_admin, para la columna Empresa)
 *   onInviteUser?: () => void (dirige a /hub/invitar)
 *   onOpenUser?: (user) => void (navega a /hub/panel/usuarios?usuario=id)
 *
 * Soporte de detalle:
 *   - El deep-link /hub/panel/usuarios?usuario=id resalta y centra la fila
 *     del usuario en el listado (siempre dentro del alcance permitido: el
 *     tenant_admin solo puede llegar a usuarios de SU marca vía RLS/filtro).
 */

const PAGE_SIZE = 10;

const MOCK_USERS = [
  { id: "1", name: "Carlos Sandoval", email: "carlos@qawaylab.com", company: "Qaway Lab", role: "Super Admin", status: "Activo", lastAccess: "Hoy, 09:12" },
  { id: "2", name: "Lucía Ramírez", email: "lucia@coravet.com", company: "CoraVet", role: "Admin", status: "Activo", lastAccess: "Hoy, 08:45" },
  { id: "3", name: "Juan Pérez", email: "juan@epc.com", company: "EPC Contable", role: "Admin", status: "Activo", lastAccess: "Ayer, 18:30" },
  { id: "4", name: "Maria Gómez", email: "maria@vallet.com", company: "Vallet Inmobiliaria", role: "Usuario", status: "Activo", lastAccess: "Ayer, 16:20" },
  { id: "5", name: "Diego Castro", email: "diego@mesaselecta.com", company: "Mesa Selecta", role: "Admin", status: "Activo", lastAccess: "20 Sep 2026" },
  { id: "6", name: "Ana Torres", email: "ana@aurea.com", company: "Auréa Skincare", role: "Usuario", status: "Activo", lastAccess: "19 Sep 2026" },
  { id: "7", name: "Rebeca Luján", email: "rebeca@panaderiajosue.com", company: "Josué Panadería", role: "Editor", status: "Inactivo", lastAccess: "15 Sep 2026" },
  { id: "8", name: "Luis Mendoza", email: "luis@var.com", company: "VAR Sportswear", role: "Usuario", status: "Activo", lastAccess: "14 Sep 2026" },
  { id: "9", name: "Sofía Díaz", email: "sofia@brendayely.com", company: "Brenda y Ely", role: "Usuario", status: "Inactivo", lastAccess: "10 Sep 2026" },
  { id: "10", name: "Ricardo Palomino", email: "ricardo@qawaylab.com", company: "Qaway Lab", role: "Soporte", status: "Activo", lastAccess: "09 Sep 2026" },
];

const ROLE_META = {
  "Super Admin": { dot: "#ff4b0b", bg: "bg-orange-50", text: "text-[#ff4b0b]" },
  Admin: { dot: "#ff7a45", bg: "bg-orange-50/70", text: "text-[#e2641f]" },
  Editor: { dot: "#ff9b73", bg: "bg-orange-50/40", text: "text-[#e26d3a]" },
  Visor: { dot: "#71717a", bg: "bg-zinc-100", text: "text-zinc-600" },
  Invitado: { dot: "#a1a1aa", bg: "bg-zinc-100", text: "text-zinc-500" },
  Usuario: { dot: "#d4d4d8", bg: "bg-zinc-100", text: "text-zinc-500" },
};

function Icon({ children, size = 16, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {React.cloneElement(children, { size, strokeWidth: 1.8 })}
    </span>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function normalizeUser(row, { tenantName = "", isPlatformAdmin = false } = {}) {
  const fullName =
    row.full_name ||
    row.name ||
    [row.first_name, row.last_name].filter(Boolean).join(" ") ||
    row.email ||
    "Usuario";

  // Rol real del modelo BD: admin+is_platform_admin = Super Admin (plataforma);
  // admin con tenant = Admin de marca; editor/viewer/guest = roles de la marca.
  const role =
    row.role === "admin"
      ? row.is_platform_admin
        ? "Super Admin"
        : "Admin"
      : row.role === "editor"
        ? "Editor"
        : row.role === "viewer"
          ? "Visor"
          : row.role === "guest"
            ? "Invitado"
            : row.role || "Usuario";

  const company =
    row.company_name ||
    row.tenant_name ||
    row.company ||
    row.tenant?.name ||
    (!isPlatformAdmin && tenantName) ||
    "—";

  return {
    id: row.id,
    name: fullName,
    email: row.email || "—",
    company,
    role,
    status:
      row.status ||
      (row.is_active === false ? "Inactivo" : "Activo"),
    lastAccess:
      row.last_active_at ||
      row.last_access ||
      row.updated_at ||
      "—",
    createdAt: row.created_at || null,
    avatar_url: row.avatar_url || null,
    isSuperAdmin: row.role === "admin" && row.is_platform_admin === true,
  };
}

// Secciones administrativas OTORGABLES a un trabajador. Usuarios y Configuración
// quedan fuera a propósito (exclusivas del administrador de la marca).
const GRANTABLE_PANEL = [
  { id: "Reportes", label: "Reportes" },
  { id: "Pagos", label: "Pagos" },
  { id: "Suscripciones", label: "Suscripciones" },
  { id: "Planes", label: "Planes" },
  { id: "Soporte", label: "Soporte" },
];

const APP_ROLES = ["admin", "editor", "viewer", "guest"];

/*
 * Editor de accesos por usuario (roles de app + secciones del panel).
 * RLS de Supabase ya permite escritura directa para ambos administradores:
 *  - platform_admin: user_app_roles (uar_admin_all) y users.permissions (is_admin()).
 *  - tenant_admin    : user_app_roles (uar_tenant_admin_manage) y users.permissions
 *    (users_tenant_admin_update). prevent_role_escalation v3 solo bloquea cambios
 *    de tenant/is_platform_admin/role, no permissions.
 */
function UserAccessEditor({ userId, userName, tenantId, isPlatformAdmin, supabase }) {
  const [apps, setApps] = useState([]);
  const [appState, setAppState] = useState({});
  const [roleByApp, setRoleByApp] = useState({});
  const [sections, setSections] = useState([]);
  const [basePermissions, setBasePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [backendNote, setBackendNote] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setSaveMsg("");
    (async () => {
      try {
        const [{ data: catalog }, { data: meRow }, { data: rows, error: rolesErr }] = await Promise.all([
          supabase.from("app_catalog").select("id, name, slug").order("name"),
          supabase.from("users").select("permissions").eq("id", userId).single(),
          supabase.from("user_app_roles").select("app_id, role").eq("user_id", userId),
        ]);
        if (!alive) return;
        const catalogList = catalog || [];
        setApps(catalogList);
        setBasePermissions(meRow?.permissions || {});
        setSections((meRow?.permissions?.panel || []).filter((s) => GRANTABLE_PANEL.some((g) => g.id === s)));

        let active = {};
        let roles = {};
        let note = "";
        if (rolesErr) note = "No se pudieron leer las apps asignadas: " + rolesErr.message;
        else rows.forEach((r) => { active[r.app_id] = true; roles[r.app_id] = r.role || "viewer"; });
        catalogList.forEach((a) => { if (!roles[a.id]) roles[a.id] = "viewer"; });
        if (alive) {
          setAppState(active);
          setRoleByApp(roles);
          setBackendNote(note);
        }
      } catch (err) {
        if (alive) setBackendNote(err?.message || "No se pudieron cargar los accesos.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  async function saveAll() {
    setSaveMsg("");
    let msg = "";
    const selected = Object.entries(appState)
      .filter(([, on]) => on)
      .map(([appId]) => ({ user_id: userId, tenant_id: tenantId, app_id: appId, role: roleByApp[appId] || "viewer" }));
    if (selected.length) {
      const { error } = await supabase.from("user_app_roles").upsert(selected, { onConflict: "user_id,tenant_id,app_id" });
      if (error) msg = "Apps: " + error.message;
    }
    const off = Object.entries(appState).filter(([, on]) => !on).map(([appId]) => appId);
    if (!msg && off.length) {
      const { error } = await supabase.from("user_app_roles").delete().eq("user_id", userId).in("app_id", off);
      if (error) msg = "Apps: " + error.message;
    }
    if (!msg) {
      const { error: permErr } = await supabase
        .from("users")
        .update({ permissions: { ...basePermissions, panel: sections } })
        .eq("id", userId);
      if (permErr) msg = "Secciones: " + permErr.message;
    }
    setSaveMsg(msg || "Accesos guardados correctamente.");
  }

  return (
    <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 md:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-zinc-900">
          <Icon size={15}><ShieldCheck /></Icon>
          Accesos · {userName}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {isPlatformAdmin ? "Vista global (plataforma)" : "Solo tu empresa (RLS)"}
        </span>
      </div>

      {backendNote && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {backendNote}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold text-zinc-700">Aplicaciones</p>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : apps.length ? (
            <div className="space-y-2">
              {apps.map((app) => (
                <label key={app.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!appState[app.id]}
                    onChange={() => setAppState((s) => ({ ...s, [app.id]: !s[app.id] }))}
                    className="h-4 w-4 rounded accent-[#ff4b0b]"
                  />
                  <span className="flex-1 text-xs font-bold text-zinc-800">{app.name}</span>
                  <select
                    value={roleByApp[app.id] || "viewer"}
                    disabled={!appState[app.id]}
                    onChange={(e) => setRoleByApp((r) => ({ ...r, [app.id]: e.target.value }))}
                    className="h-7 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-medium outline-none disabled:opacity-50"
                  >
                    {APP_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Sin aplicaciones en el catálogo.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-zinc-700">Secciones del panel (otorgables)</p>
          <div className="space-y-2">
            {GRANTABLE_PANEL.map((g) => (
              <label key={g.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2">
                <input
                  type="checkbox"
                  checked={sections.includes(g.id)}
                  onChange={() => setSections((s) => (s.includes(g.id) ? s.filter((x) => x !== g.id) : [...s, g.id]))}
                  className="h-4 w-4 rounded accent-[#ff4b0b]"
                />
                <span className="text-xs font-bold text-zinc-800">{g.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-zinc-400">
            Usuarios y Configuración son exclusivos del administrador y nunca se otorgan.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={saveAll}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e94408]"
        >
          <Save size={14} />
          Guardar accesos
        </button>
        {saveMsg && (
          <span className={`text-xs font-bold ${saveMsg.includes("Error") ? "text-red-500" : "text-emerald-600"}`}>
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}

export default function UsersModule({
  tenantId,
  session,
  supabase,
  isPlatformAdmin = false,
  tenantName,
  onInviteUser,
  onOpenUser,
}) {
  // Los usuarios se consultan siempre en vivo desde Supabase; no se usan datos mock.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [permUserId, setPermUserId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleDeleteUser = async (user) => {
    if (user.isSuperAdmin) {
      alert("No se puede eliminar a un Super Administrador de la plataforma.");
      return;
    }
    const confirm = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${user.name}" (${user.email})?`
    );
    if (!confirm) return;

    try {
      // 1. Eliminar asignaciones de roles de app asociadas al usuario
      await supabase.from("user_app_roles").delete().eq("user_id", user.id);

      // 2. Intentar eliminación directa en public.users
      const { error: delErr } = await supabase.from("users").delete().eq("id", user.id);
      if (delErr) {
        console.warn("Delete en users falló por RLS/FK, desvinculando de la empresa:", delErr);
        // Fallback: desvincular de la empresa y marcar inactivo
        const { error: upErr } = await supabase
          .from("users")
          .update({ status: "Inactivo", tenant_id: null })
          .eq("id", user.id);
        if (upErr) throw new Error(delErr.message || upErr.message);
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("No se pudo eliminar el usuario: " + err.message);
    }
  };

  // Soporte del detalle: deep-link /hub/panel/usuarios?usuario=id
  const location = useLocation();
  const [selectedId, setSelectedId] = useState(
    () => new URLSearchParams(location.search).get("usuario") || ""
  );

  useEffect(() => {
    const next = new URLSearchParams(location.search).get("usuario") || "";
    setSelectedId((prev) => (prev === next ? prev : next));
  }, [location.search]);

  // Resalta/centra la fila del usuario abierto por el deep-link.
  useEffect(() => {
    if (!selectedId || loading) return;
    if (!users.some((user) => user.id === selectedId)) return;
    const row = document.getElementById(`user-row-${selectedId}`);
    row?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId, users, loading]);

  // Roles disponibles según el contexto: plataforma ve el universo completo;
  // el tenant_admin ve los roles de SU marca (nunca "Super Admin").
  const availableRoles = useMemo(
    () =>
      isPlatformAdmin
        ? Object.keys(ROLE_META)
        : Object.keys(ROLE_META).filter((r) => r !== "Super Admin"),
    [isPlatformAdmin]
  );

  useEffect(() => {
    if (roleFilter !== "Todos" && !availableRoles.includes(roleFilter)) {
      setRoleFilter("Todos");
    }
  }, [roleFilter, availableRoles]);

  /*
   * El rol revelado por el panel (panelAuth.isPlatformAdmin) es la fuente
   * de verdad (BD: users.role='admin' AND is_platform_admin).
   *   - platform_admin: universo de usuarios (is_admin() en BD).
   *   - tenant_admin/viewer de marca: SOLO su tenant_id.
   *   - sin rol ni tenant: no se consulta el universo global.
   * RLS (users_select_own_or_admin + users_tenant_read) es la autoridad final.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      if (!supabase?.from) return;

      const platform = isPlatformAdmin === true;
      const canQuery = platform || Boolean(tenantId);

      if (!canQuery) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let request = supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (!platform) {
          request = request.eq("tenant_id", tenantId);
        }

        const { data, error: queryError } = await request;

        if (queryError) throw queryError;

        let rows = Array.isArray(data) ? data : [];

        // Plataforma: enriquece la columna Empresa con el nombre real del tenant.
        if (platform && rows.length) {
          const tenantIds = [...new Set(rows.map((r) => r.tenant_id).filter(Boolean))];
          if (tenantIds.length) {
            const { data: tenants } = await supabase
              .from("tenants")
              .select("id, name")
              .in("id", tenantIds);
            const nameById = Object.fromEntries(
              (tenants || []).map((t) => [t.id, t.name])
            );
            rows = rows.map((r) =>
              r.tenant_id ? { ...r, tenant_name: nameById[r.tenant_id] } : r
            );
          }
        }

        if (!cancelled) {
          setUsers(rows.map((row) => normalizeUser(row, { tenantName, isPlatformAdmin: platform })));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "No se pudo cargar el listado de usuarios.");
          // Mantiene el último estado visual disponible; no rompe el panel.
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [supabase, tenantId, isPlatformAdmin, session, tenantName]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.company.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "Todos" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "Todos" || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visibleUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Activo").length;
    const inactive = users.filter((u) => u.status === "Inactivo").length;

    // "Nuevos" representa los usuarios mostrados como recientes en esta capa.
    // Si existe created_at, usa los últimos 30 días.
    const newer = users.filter((u) => {
      const d = new Date(u.created_at);
      return !Number.isNaN(d.getTime())
        ? Date.now() - d.getTime() <= 30 * 24 * 60 * 60 * 1000
        : false;
    }).length;

    return { total, active, inactive, newer };
  }, [users]);

  const roleCounts = useMemo(() => {
    const counts = {};
    Object.keys(ROLE_META).forEach((role) => {
      counts[role] = users.filter((u) => u.role === role).length;
    });
    return counts;
  }, [users]);

  const donut = useMemo(() => {
    const total = Math.max(users.length, 1);
    let current = 0;

    const segments = Object.entries(ROLE_META)
      .map(([role, meta]) => {
        const count = roleCounts[role] || 0;
        const start = (current / total) * 360;
        current += count;
        const end = (current / total) * 360;

        return count
          ? `${meta.dot} ${start}deg ${end}deg`
          : null;
      })
      .filter(Boolean);

    return segments.length
      ? `conic-gradient(${segments.join(", ")})`
      : "conic-gradient(#e4e4e7 0deg 360deg)";
  }, [roleCounts, users.length]);

  const statCards = [
    {
      label: "Usuarios totales",
      value: stats.total,
      delta: "27%",
      trend: "up",
      icon: <UserRound />,
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      line: "bg-orange-500",
    },
    {
      label: "Usuarios activos",
      value: stats.active,
      delta: "33%",
      trend: "up",
      icon: <CheckCircle2 />,
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      line: "bg-emerald-500",
    },
    {
      label: "Usuarios nuevos",
      value: stats.newer || Math.min(stats.total, 6),
      delta: "100%",
      trend: "up",
      icon: <Clock3 />,
      iconBg: "bg-orange-50",
      iconText: "text-orange-500",
      line: "bg-orange-500",
    },
    {
      label: "Usuarios inactivos",
      value: stats.inactive,
      delta: "20%",
      trend: "down",
      icon: <CircleX />,
      iconBg: "bg-red-50",
      iconText: "text-red-500",
      line: "bg-red-500",
    },
  ];

  const recentActivity = [
    ["Nuevo usuario registrado", users[1]?.email || "—", "hace 2 horas", "blue"],
    ["Rol actualizado", users[2]?.email || "—", "hace 4 horas", "green"],
    ["Usuario desactivado", users[8]?.email || "—", "hace 1 día", "red"],
    ["Nuevo usuario registrado", users[9]?.email || "—", "hace 1 día", "blue"],
    ["Permisos actualizados", users[3]?.email || "—", "hace 2 días", "purple"],
  ];

  const clearFilters = () => {
    setQuery("");
    setRoleFilter("Todos");
    setStatusFilter("Todos");
    setPage(1);
  };

  return (
    <section className="min-h-full bg-transparent text-zinc-950 font-sans">
      <div className="space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
              <span>Inicio</span>
              <span>›</span>
              <span className="text-zinc-600">Usuarios</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
              Usuarios
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {isPlatformAdmin
                ? "Gestiona los usuarios del ecosistema Qaway Lab. Asigna roles, controla accesos y supervisa su actividad."
                : "Gestiona los usuarios de tu empresa. Asigna roles a tu equipo y controla su actividad."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-xs transition hover:border-zinc-300 hover:text-zinc-950 sm:inline-flex"
              aria-label="Más acciones"
            >
              <Icon size={18}><MoreHorizontal /></Icon>
            </button>

            <button
              type="button"
              onClick={onInviteUser}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e94408] active:scale-[0.99]"
            >
              <Icon size={17}><Plus /></Icon>
              Invitar usuario
            </button>
          </div>
        </header>

        {/* KPI grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${card.iconBg} ${card.iconText}`}
                  >
                    <Icon size={15}>{card.icon}</Icon>
                  </span>
                  <span className="text-sm font-bold text-zinc-500">
                    {card.label}
                  </span>
                </div>

                <div className="mt-4 h-6 w-20 overflow-hidden">
                  <div
                    className={`mt-2 h-[2px] w-full rounded-full ${card.line} origin-left rotate-[-8deg]`}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">
                    {card.value}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs font-bold ${
                      card.trend === "down"
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}
                  >
                    <Icon size={12}>
                      {card.trend === "down" ? <ArrowDownRight /> : <ArrowUpRight />}
                    </Icon>
                    {card.delta}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    vs. mes anterior
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
              <div className="border-b border-zinc-100 px-5 py-5 md:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-zinc-950">
                      Listado de usuarios
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {isPlatformAdmin
                        ? "Administra los usuarios registrados en todas las empresas."
                        : "Administra los usuarios registrados de tu empresa."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="relative block">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Buscar usuario, correo o empresa..."
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 sm:w-[270px]"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowFilters((v) => !v)}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
                        showFilters
                          ? "border-zinc-300 bg-zinc-100 text-zinc-950"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <Icon size={15}><SlidersHorizontal /></Icon>
                      Filtros
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-zinc-50 p-3">
                    <label className="text-xs font-bold text-zinc-500">
                      Rol
                      <select
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(e.target.value);
                          setPage(1);
                        }}
                        className="mt-1 block h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                      >
                        <option>Todos</option>
                        {availableRoles.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-bold text-zinc-500">
                      Estado
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="mt-1 block h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
                      >
                        <option>Todos</option>
                        <option>Activo</option>
                        <option>Inactivo</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold text-zinc-500 hover:bg-white hover:text-zinc-950"
                    >
                      <X size={13} />
                      Limpiar
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 md:mx-6">
                  No se pudo actualizar el listado desde Supabase. Se mantiene
                  el estado visual disponible. Detalle: {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/70">
                      <th className="w-10 px-5 py-3 md:px-6">
                        <input
                          type="checkbox"
                          aria-label="Seleccionar todos"
                          checked={visibleUsers.length > 0 && visibleUsers.every((u) => selectedUsers.includes(u.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const pageIds = visibleUsers.map((u) => u.id);
                              setSelectedUsers((prev) => Array.from(new Set([...prev, ...pageIds])));
                            } else {
                              const pageIds = new Set(visibleUsers.map((u) => u.id));
                              setSelectedUsers((prev) => prev.filter((id) => !pageIds.has(id)));
                            }
                          }}
                          className="h-4 w-4 rounded border-zinc-300 accent-[#ff4b0b]"
                        />
                      </th>
                      {[
                        "Usuario",
                        "Correo electrónico",
                        "Empresa",
                        "Rol",
                        "Estado",
                        "Último acceso",
                        "Acciones",
                      ].map((head) => (
                        <th
                          key={head}
                          className="whitespace-nowrap px-3 py-3 text-[11px] font-bold text-zinc-500"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={8} className="px-6 py-4">
                            <div className="h-8 animate-pulse rounded-lg bg-zinc-100" />
                          </td>
                        </tr>
                      ))
                    ) : visibleUsers.length ? (
                      visibleUsers.map((user) => {
                        const role = ROLE_META[user.role] || ROLE_META.Usuario;

                        return (
                        <React.Fragment key={user.id}>
                          <tr
                            id={user.id ? `user-row-${user.id}` : undefined}
                            className={`group transition hover:bg-zinc-50/70 ${
                              selectedId === user.id ? "bg-amber-50/60" : ""
                            } ${permUserId === user.id ? "bg-zinc-50/80" : ""}`}
                          >
                            <td className="px-5 py-3 md:px-6">
                              <input
                                type="checkbox"
                                aria-label={`Seleccionar ${user.name}`}
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers((prev) => [...prev, user.id]);
                                  } else {
                                    setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
                                  }
                                }}
                                className="h-4 w-4 rounded border-zinc-300 accent-[#ff4b0b]"
                              />
                            </td>

                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => onOpenUser?.(user)}
                                className="flex items-center gap-3 text-left"
                              >
                                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-extrabold text-zinc-600 overflow-hidden">
                                  {initials(user.name)}
                                  {user.avatar_url && (
                                    <img
                                      src={user.avatar_url}
                                      alt=""
                                      loading="lazy"
                                      onError={(e) => e.currentTarget.remove()}
                                      className="absolute inset-0 h-full w-full object-cover"
                                    />
                                  )}
                                </span>
                                <span className="font-bold text-zinc-900">
                                  {user.name}
                                </span>
                              </button>
                            </td>

                            <td className="px-3 py-3 text-sm text-zinc-500">
                              {user.email}
                            </td>

                            <td className="px-3 py-3 text-sm text-zinc-600">
                              {user.company}
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${role.bg} ${role.text}`}
                              >
                                {user.role}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  user.status === "Activo"
                                    ? "text-zinc-600"
                                    : "text-zinc-500"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    user.status === "Activo"
                                      ? "bg-emerald-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                {user.status}
                              </span>
                            </td>

                            <td className="px-3 py-3 text-xs text-zinc-500">
                              {user.lastAccess}
                            </td>

                            <td className="px-3 py-3">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === user.id ? null : user.id
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-950"
                                  aria-label={`Acciones para ${user.name}`}
                                >
                                  <MoreHorizontal size={15} />
                                </button>

                                {openMenu === user.id && (
                                  <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenUser?.(user);
                                        setOpenMenu(null);
                                      }}
                                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                                    >
                                      Ver usuario
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPermUserId((p) => (p === user.id ? null : user.id));
                                        setOpenMenu(null);
                                      }}
                                      className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                                    >
                                      Gestionar permisos
                                    </button>
                                    {!user.isSuperAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenu(null);
                                          handleDeleteUser(user);
                                        }}
                                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                                      >
                                        Eliminar usuario
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          {user.id && permUserId === user.id && (
                            <tr>
                              <td colSpan={8} className="p-0">
                                <UserAccessEditor
                                  key={user.id}
                                  userId={user.id}
                                  userName={user.name}
                                  tenantId={tenantId}
                                  isPlatformAdmin={isPlatformAdmin === true}
                                  supabase={supabase}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="text-sm font-bold text-zinc-700">
                            No se encontraron usuarios
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            Ajusta la búsqueda o los filtros.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <span>
                  Mostrando{" "}
                  {filteredUsers.length
                    ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                        page * PAGE_SIZE,
                        filteredUsers.length
                      )}`
                    : "0"}{" "}
                  de {filteredUsers.length} usuarios
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                          page === p
                            ? "bg-[#ff4b0b] text-white"
                            : "border border-transparent text-zinc-500 hover:border-zinc-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>

                  <select
                    className="ml-2 h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium outline-none"
                    defaultValue="10"
                    aria-label="Filas por página"
                  >
                    <option value="10">10 filas</option>
                    <option value="25">25 filas</option>
                    <option value="50">50 filas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-zinc-950">Usuarios por rol</h2>

              <div className="mt-5 flex items-center gap-5">
                <div
                  className="relative h-32 w-32 shrink-0 rounded-full"
                  style={{ background: donut }}
                >
                  <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-[10px] text-zinc-400">Total</span>
                    <span className="text-xl font-extrabold">{users.length}</span>
                    <span className="text-[10px] text-zinc-400">usuarios</span>
                  </div>
                </div>

                <div className="min-w-0 space-y-2.5">
                  {availableRoles.map((role) => {
                    const meta = ROLE_META[role];
                    const count = roleCounts[role] || 0;
                    const percentage = users.length
                      ? Math.round((count / users.length) * 100)
                      : 0;

                    return (
                      <div
                        key={role}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: meta.dot }}
                        />
                        <span className="font-semibold text-zinc-600">
                          {role}
                        </span>
                        <span className="ml-auto text-zinc-400">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-950">Actividad reciente</h2>
                <button
                  type="button"
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-950"
                >
                  Ver todas →
                </button>
              </div>

              <div className="mt-4 divide-y divide-zinc-100">
                {recentActivity.map(([title, detail, time, tone], index) => (
                  <div key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        tone === "green"
                          ? "bg-emerald-50 text-emerald-600"
                          : tone === "red"
                            ? "bg-red-50 text-red-500"
                            : tone === "purple"
                              ? "bg-violet-50 text-violet-600"
                              : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <UserRound size={13} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-800">
                        {title}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {detail}
                      </div>
                    </div>

                    <span className="whitespace-nowrap text-[10px] text-zinc-400">
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-amber-500 shadow-xs">
                  <Lightbulb size={16} />
                </span>

                <div>
                  <div className="text-xs font-bold text-zinc-800">Tip</div>
                  <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                    Puedes asignar múltiples permisos por aplicación desde el
                    menú de acciones.
                  </p>
                </div>

                <button
                  type="button"
                  className="ml-auto self-start text-zinc-400 hover:text-zinc-700"
                  aria-label="Cerrar tip"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
