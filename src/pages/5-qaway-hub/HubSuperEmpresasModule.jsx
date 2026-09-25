import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  MoreHorizontal,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/config/supabase";

/**
 * Qaway Hub — EmpresasModule
 *
 * Módulo independiente del panel de Super Administrador.
 *
 * Contrato:
 *   <EmpresasModule tenantId={tenantId} session={session} />
 *
 * No incluye:
 *   - Router
 *   - Layout / Sidebar / Header
 *   - Auth propio
 *   - BrowserRouter
 *
 * El shell existente de HubPanelPage permanece intacto.
 *
 * Nota:
 * La UI reproduce la estructura de referencia entregada por diseño.
 * Los datos se consultan desde Supabase Central. No se incluyen datos
 * comerciales ficticios en producción.
 */

const PAGE_SIZE = 10;

const PLAN_META = {
  premium: {
    label: "Premium",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  intermedio: {
    label: "Intermedio",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  básico: {
    label: "Básico",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  basico: {
    label: "Básico",
    dot: "bg-amber-500",
    text: "text-amber-600",
  },
  "sin plan": {
    label: "Sin plan",
    dot: "bg-zinc-300",
    text: "text-zinc-500",
  },
};

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase().trim();

  if (["trialing", "trial", "en prueba", "prueba"].includes(status)) {
    return { key: "trialing", label: "En prueba" };
  }

  if (["inactive", "inactivo", "inactiva", "disabled", "cancelled", "cancelado"].includes(status)) {
    return { key: "inactive", label: "Inactiva" };
  }

  return { key: "active", label: "Activa" };
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}

function getCompanyName(row) {
  return (
    row?.name ||
    row?.company_name ||
    row?.business_name ||
    row?.legal_name ||
    row?.display_name ||
    row?.slug ||
    "Empresa"
  );
}

function getCompanySubtitle(row) {
  return (
    row?.industry ||
    row?.sector ||
    row?.category ||
    row?.description ||
    row?.slug ||
    ""
  );
}

function getInitials(name) {
  return String(name || "E")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPlanLabel(value) {
  if (!value) return "Sin plan";
  const key = String(value).toLowerCase();
  return PLAN_META[key]?.label || value;
}

function StatCard({ icon, tone, title, value, delta, deltaTone = "up", subtitle }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}>
          {icon}
        </div>
        <div className="h-8 w-20 opacity-0" aria-hidden="true" />
      </div>

      <p className="mt-3 text-xs font-bold text-zinc-500">{title}</p>

      <div className="mt-1 flex items-end gap-2">
        <strong className="text-2xl font-extrabold tracking-tight text-zinc-950">
          {value}
        </strong>

        {delta !== undefined && delta !== null && (
          <span
            className={`mb-1 inline-flex items-center gap-0.5 text-[11px] font-extrabold ${
              deltaTone === "down" ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {deltaTone === "down" ? (
              <TrendingDown size={12} />
            ) : (
              <TrendingUp size={12} />
            )}
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-0.5 text-[10px] font-medium text-zinc-400">{subtitle}</p>
      )}
    </article>
  );
}

function CompanyAvatar({ company }) {
  const color =
    company?.logo_url
      ? "bg-white"
      : company?.avatar_color || "bg-zinc-950";

  return (
    <div
      className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ${color} text-[11px] font-extrabold text-white`}
    >
      {company?.logo_url ? (
        <img
          src={company.logo_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(company?.name)
      )}
    </div>
  );
}

export default function EmpresasModule({
  tenantId,
  session,
  isPlatformAdmin = false,
  onCreateCompany,
  onOpenCompany,
  onCompanyAction,
}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [notice, setNotice] = useState("");

  // Estados para modales in-app (Ficha de Empresa, Edición Rápida y Confirmación de Eliminación)
  const [viewModal, setViewModal] = useState({ isOpen: false, company: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, company: null, loading: false });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    company: null,
    saving: false,
    form: { name: "", sector: "", plan: "Básico", status: "active" },
  });

  // Estado para flujo de importación estilo Inventario (ProductImport)
  const [importState, setImportState] = useState({
    fileName: null,
    rows: null,
    parsing: false,
    importing: false,
  });

  const handleExportExcel = () => {
    const list = companies.length ? companies : [];
    const dateStr = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });

    const headers = [
      "N°",
      "UUID Supabase",
      "Código",
      "Empresa",
      "Titular / Contacto",
      "Sector / Industria",
      "Plan",
      "Estado",
      "Usuarios Activos",
      "Fecha Registro",
    ];

    const rows = list.map((c, idx) => {
      const planLabel = typeof c.plan === "string" ? c.plan : (c.plan?.label || "Sin plan");
      const statusLabel = typeof c.status === "string" ? c.status : (c.status?.label || "Activa");
      const code = c.client_code || c.slug || `EMP-${String(idx + 1).padStart(3, "0")}`;
      const ownerLabel = c.subtitle?.startsWith("Titular: ") ? c.subtitle.replace("Titular: ", "") : "—";

      return [
        idx + 1,
        c.id || "—",
        code,
        c.name || "—",
        ownerLabel,
        c.sector || c.industry || "General",
        planLabel,
        statusLabel,
        c.userCount ?? c.users ?? 1,
        formatDate(c.createdAt),
      ];
    });

    const aoa = [
      ["QAWAY LAB — ECOSISTEMA DIGITAL"],
      ["REPORTE OFICIAL DE EMPRESAS Y ORGANIZACIONES"],
      [`Fecha de emisión: ${dateStr} | Generado por: Super Administrador`],
      [],
      headers,
      ...rows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 38 },
      { wch: 14 },
      { wch: 30 },
      { wch: 28 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
    XLSX.writeFile(workbook, `empresas_qaway_lab_${Date.now()}.xlsx`);
  };

  const downloadExcelTemplate = () => {
    const headers = ["Nombre de la Empresa", "Sector / Categoría", "Plan", "Código / RUC (Opcional)"];
    const sampleRows = [
      ["Empresa Ejemplo S.A.C.", "Tecnología", "Básico", "EMP-2026-0001"],
      ["Comercializadora Rímac", "Comercio", "Intermedio", "EMP-2026-0002"],
    ];
    const aoa = [
      ["PLANTILLA MODELO PARA IMPORTACIÓN DE EMPRESAS — QAWAY LAB"],
      ["Complete los datos comenzando en la fila 5. No modifique los nombres de las columnas en la fila 4."],
      [],
      headers,
      ...sampleRows,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 22 }, { wch: 16 }, { wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PlantillaEmpresas");
    XLSX.writeFile(workbook, "plantilla_modelo_empresas_qaway.xlsx");
  };

  const requestDeleteCompany = (company) => {
    if (company.slug === "qaway-lab" || company.name?.toLowerCase().includes("qaway lab")) {
      setNotice("No se puede eliminar la empresa principal (Master) Qaway Lab.");
      setTimeout(() => setNotice(""), 3500);
      return;
    }
    setDeleteModal({ isOpen: true, company, loading: false });
  };

  const executeDeleteCompany = async () => {
    const company = deleteModal.company;
    if (!company) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await supabase.from("users").update({ tenant_id: null }).eq("tenant_id", company.id);

      const { error: delErr } = await supabase.from("tenants").delete().eq("id", company.id);
      if (delErr) {
        console.warn("Delete directo en tenants falló, aplicando soft-delete:", delErr);
        const { error: upErr } = await supabase
          .from("tenants")
          .update({ status: "inactive", deleted_at: new Date().toISOString() })
          .eq("id", company.id);
        if (upErr) throw new Error(delErr.message || upErr.message);
      }

      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
      setNotice(`Empresa "${company.name}" eliminada correctamente de Supabase.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      console.error("Error al eliminar empresa:", err);
      setNotice("No se pudo eliminar la empresa: " + (err.message || "Error de BD"));
      setTimeout(() => setNotice(""), 4000);
    } finally {
      setDeleteModal({ isOpen: false, company: null, loading: false });
    }
  };

  const openEditModal = (company) => {
    setEditModal({
      isOpen: true,
      company,
      saving: false,
      form: {
        name: company.name || "",
        sector: company.industry || company.sector || "General",
        plan: typeof company.plan === "string" ? company.plan : (company.plan?.label || "Básico"),
        status: company.status?.key || company.status || "active",
      },
    });
  };

  const handleSaveEditCompany = async (e) => {
    e.preventDefault();
    if (!editModal.company) return;
    setEditModal((prev) => ({ ...prev, saving: true }));

    try {
      const companyId = editModal.company.id;
      const { form } = editModal;

      const { error: updateErr } = await supabase
        .from("tenants")
        .update({
          name: form.name,
          industry: form.sector,
          plan: form.plan,
          status: form.status,
        })
        .eq("id", companyId);

      if (updateErr) throw updateErr;

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                name: form.name,
                sector: form.sector,
                industry: form.sector,
                plan: form.plan,
                status: normalizeStatus(form.status),
              }
            : c
        )
      );

      setNotice(`Empresa "${form.name}" actualizada correctamente.`);
      setTimeout(() => setNotice(""), 3500);
      setEditModal({ isOpen: false, company: null, saving: false, form: { name: "", sector: "", plan: "Básico", status: "active" } });
    } catch (err) {
      console.error("Error actualizando empresa:", err);
      setNotice("Error al actualizar la empresa: " + err.message);
      setTimeout(() => setNotice(""), 4000);
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Flujo de Importación al estilo Inventario (ProductImport)
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportState({ fileName: file.name, rows: null, parsing: true, importing: false });
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let headerIndex = jsonData.findIndex(
        (row) => Array.isArray(row) && row.some((cell) => String(cell).toLowerCase().includes("nombre"))
      );
      if (headerIndex === -1) headerIndex = 0;

      const rawRows = jsonData.slice(headerIndex + 1);
      const parsedRows = [];

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || !row[0]) continue;
        const name = String(row[0] || "").trim();
        if (!name || name.toLowerCase().includes("plantilla")) continue;

        parsedRows.push({
          name,
          sector: String(row[1] || "General").trim(),
          plan: String(row[2] || "básico").trim(),
          clientCode: String(row[3] || `EMP-${Date.now().toString().slice(-4)}${i + 1}`).trim(),
        });
      }

      setImportState({ fileName: file.name, rows: parsedRows, parsing: false, importing: false });
    } catch (err) {
      console.error("Error al leer archivo Excel:", err);
      setNotice("No se pudo procesar el archivo Excel. Asegúrese de usar .xlsx o .csv.");
      setTimeout(() => setNotice(""), 4000);
      setImportState({ fileName: null, rows: null, parsing: false, importing: false });
    }
  };

  const confirmImportToSupabase = async () => {
    if (!importState.rows || importState.rows.length === 0) return;
    setImportState((prev) => ({ ...prev, importing: true }));

    try {
      const localUICompanies = [];
      for (let i = 0; i < importState.rows.length; i++) {
        const item = importState.rows[i];
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `empresa-${Date.now()}`;
        const newUuid = crypto.randomUUID();

        const payload = {
          id: newUuid,
          name: item.name,
          slug,
          client_code: item.clientCode,
          status: "active",
          industry: item.sector,
          plan: item.plan,
          created_at: new Date().toISOString(),
        };

        const { data: dbData } = await supabase.from("tenants").insert(payload).select().single();
        const createdItem = dbData || payload;

        localUICompanies.push({
          ...createdItem,
          id: createdItem.id,
          name: createdItem.name,
          subtitle: `Sector: ${item.sector}`,
          status: { key: "active", label: "Activa" },
          createdAt: createdItem.created_at,
          plan: item.plan,
          userCount: 1,
          applicationCount: 1,
        });
      }

      setCompanies((prev) => [...localUICompanies, ...prev]);
      setShowImportModal(false);
      setImportState({ fileName: null, rows: null, parsing: false, importing: false });
      setNotice(`${localUICompanies.length} empresas guardadas exitosamente en Supabase.`);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Error importando a Supabase:", err);
      setNotice("Error al guardar en Supabase: " + (err.message || "Falla de red"));
      setTimeout(() => setNotice(""), 4000);
      setImportState((prev) => ({ ...prev, importing: false }));
    }
  };

  /*
   * El listado global de empresas es exclusivo del Super Administrador
   * (panelAuth.isPlatformAdmin — BD users.role='admin' AND is_platform_admin).
   * El nav del tenant_admin ya excluye la sección; este gate es defensa en
   * profundidad: sin isPlatformAdmin no se emite la consulta global (que la
   * RLS de tenants, con la corrección aprobada, deja en is_admin() + tenant).
   */
  const canAccess = isPlatformAdmin === true;

  /*
   * Carga de empresas.
   *
   * Se usa select("*") deliberadamente para que el módulo no invente
   * columnas que no fueron definidas en el contrato actual. La
   * normalización inferior trabaja con los campos disponibles.
   */
  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      if (!canAccess) {
        setCompanies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data: tenantsData, error: queryError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (queryError) {
        setError(
          queryError.message ||
            "No se pudieron cargar las empresas."
        );
        setCompanies([]);
        setLoading(false);
        return;
      }

      let usersByTenant = {};
      try {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, tenant_id, full_name, email, role");
        (usersData || []).forEach((u) => {
          if (!u.tenant_id) return;
          if (!usersByTenant[u.tenant_id]) usersByTenant[u.tenant_id] = [];
          usersByTenant[u.tenant_id].push(u);
        });
      } catch (e) {
        console.warn("No se pudo mapear usuarios por tenant:", e);
      }

      const normalized = (tenantsData || []).map((row) => {
        const name = getCompanyName(row);
        const status = normalizeStatus(row.status || row.state);
        const tenantUsers = usersByTenant[row.id] || [];
        const owner = tenantUsers.find((u) => u.role === "admin") || tenantUsers[0];
        const ownerLabel = owner ? (owner.full_name || owner.email) : null;
        const subtitle = ownerLabel
          ? `Titular: ${ownerLabel}`
          : getCompanySubtitle(row);

        return {
          ...row,
          id: row.id,
          name,
          subtitle,
          status,
          createdAt: row.created_at || row.createdAt,
          plan:
            row.plan ||
            row.plan_name ||
            row.current_plan ||
            row.plan_tier ||
            null,
          userCount: tenantUsers.length || 1,
          applicationCount:
            row.application_count ??
            row.applications_count ??
            1,
        };
      });

      setCompanies(normalized);
      setLoading(false);
    }

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, [canAccess, tenantId, session?.user?.id]);

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesQuery =
        !normalizedQuery ||
        company.name.toLowerCase().includes(normalizedQuery) ||
        company.subtitle.toLowerCase().includes(normalizedQuery) ||
        String(company.slug || "").toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || company.status.key === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [companies, query, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCompanies.length / PAGE_SIZE)
  );

  const visibleCompanies = filteredCompanies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status.key === "active").length;
    const trial = companies.filter((c) => c.status.key === "trialing").length;
    const inactive = companies.filter((c) => c.status.key === "inactive").length;

    const planCounts = companies.reduce(
      (acc, company) => {
        const plan = getPlanLabel(company.plan);
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      },
      {}
    );

    return { total, active, trial, inactive, planCounts };
  }, [companies]);

  const pageStart = filteredCompanies.length
    ? (page - 1) * PAGE_SIZE + 1
    : 0;

  const pageEnd = Math.min(page * PAGE_SIZE, filteredCompanies.length);

  return (
    <div className="min-w-0 space-y-5 font-sans text-zinc-950">
      {/* Gate: el listado global es exclusivo del Super Administrador */}
      {!canAccess && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
            <ShieldAlert size={18} />
          </div>
          <p className="mt-3 text-sm font-extrabold text-zinc-900">
            Acceso restringido
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            El listado global de empresas es exclusivo del Super Administrador.
          </p>
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          {notice}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span>Inicio</span>
            <span>›</span>
            <span className="text-zinc-600">Empresas</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
            Empresas
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Gestiona todas las empresas del ecosistema Qaway Lab.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
            title="Descargar plantilla formato .xlsx"
          >
            <Download size={14} className="text-zinc-500" />
            Descargar plantilla
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Exportar Excel
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 transition"
          >
            <Upload size={14} className="text-[#ff4b0b]" />
            Subir Excel
          </button>

          <button
            type="button"
            onClick={onCreateCompany}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff4b0b] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#e03f06] focus:outline-none focus:ring-4 focus:ring-orange-100"
          >
            <span className="text-base leading-none">+</span>
            Nueva empresa
          </button>
        </div>
      </div>

      {/* Modal de Importación Excel (Flujo estilo Inventario / ProductImport) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-[#ff4b0b]">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">Importación Masiva de Empresas</h3>
                  <p className="text-xs text-zinc-500 font-medium">Sincronización en vivo con Supabase Organizations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportState({ fileName: null, rows: null, parsing: false, importing: false });
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Columnas reconocidas */}
            <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-200/80 p-3.5">
              <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Columnas reconocidas en Excel / CSV:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-zinc-600">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-zinc-200 font-bold text-zinc-800">1. Nombre (Req)</span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-zinc-200">2. Sector / Cat.</span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-zinc-200">3. Plan</span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-zinc-200">4. Código / RUC</span>
              </div>
            </div>

            {/* Paso 1: Dropzone o carga */}
            {!importState.rows ? (
              <div className="my-5">
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 p-6 text-center hover:border-orange-300 hover:bg-orange-50/20 cursor-pointer transition">
                  <Upload size={32} className="mb-2 text-[#ff4b0b]" />
                  <span className="text-xs font-extrabold text-zinc-800">
                    {importState.parsing ? "Analizando contenido del archivo..." : "Haz clic para seleccionar o arrastra tu archivo Excel"}
                  </span>
                  <span className="mt-1 text-[11px] text-zinc-400">
                    Soporta formatos .xlsx, .xls y .csv
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={importState.parsing}
                  />
                </label>

                <div className="mt-4 flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff4b0b] hover:underline"
                  >
                    <Download size={14} /> Descargar plantilla modelo (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Paso 2: Previsualización de filas procesadas estilo ProductImport */
              <div className="my-4 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 font-bold flex items-center justify-between">
                  <span>✓ Archivo leído: <strong>{importState.fileName}</strong> ({importState.rows.length} empresas listas)</span>
                  <button
                    type="button"
                    onClick={() => setImportState({ fileName: null, rows: null, parsing: false, importing: false })}
                    className="text-[11px] text-emerald-700 underline hover:text-emerald-950 font-bold"
                  >
                    Cambiar archivo
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-extrabold text-zinc-500 uppercase">
                      <tr>
                        <th className="px-3 py-2">Empresa</th>
                        <th className="px-3 py-2">Sector</th>
                        <th className="px-3 py-2">Plan</th>
                        <th className="px-3 py-2">Código</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {importState.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="px-3 py-2 font-bold text-zinc-800">{row.name}</td>
                          <td className="px-3 py-2 text-zinc-600">{row.sector}</td>
                          <td className="px-3 py-2 text-zinc-600">{row.plan}</td>
                          <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">{row.clientCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importState.rows.length > 5 && (
                    <div className="p-2 text-center text-[10px] text-zinc-400 font-bold border-t border-zinc-100 bg-zinc-50/30">
                      + {importState.rows.length - 5} empresas adicionales en cola
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
                  <button
                    type="button"
                    disabled={importState.importing}
                    onClick={() => setImportState({ fileName: null, rows: null, parsing: false, importing: false })}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    disabled={importState.importing}
                    onClick={confirmImportToSupabase}
                    className="rounded-xl bg-[#ff4b0b] hover:bg-[#e03f06] px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {importState.importing ? "Importando a Supabase..." : `Importar ${importState.rows.length} empresas a Supabase`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 size={16} className="text-blue-600" />}
          tone="bg-blue-50"
          title="Total de empresas"
          value={stats.total}
        />

        <StatCard
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          tone="bg-emerald-50"
          title="Empresas activas"
          value={stats.active}
        />

        <StatCard
          icon={<Clock3 size={16} className="text-orange-600" />}
          tone="bg-orange-50"
          title="En prueba"
          value={stats.trial}
        />

        <StatCard
          icon={<XCircle size={16} className="text-red-600" />}
          tone="bg-red-50"
          title="Inactivas"
          value={stats.inactive}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-xs font-extrabold text-red-800">
              No se pudieron cargar las empresas
            </p>
            <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-950">
                Listado de empresas
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Administra, visualiza y gestiona las empresas registradas.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar empresa..."
                  className="h-9 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs font-medium text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-[#ff4b0b] focus:ring-4 focus:ring-orange-50 sm:w-56"
                />
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((current) =>
                      current === "all"
                        ? "active"
                        : current === "active"
                          ? "trialing"
                          : current === "trialing"
                            ? "inactive"
                            : "all"
                    )
                  }
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 sm:w-auto"
                  title={`Filtro: ${
                    statusFilter === "all"
                      ? "Todos"
                      : statusFilter === "active"
                        ? "Activas"
                        : statusFilter === "trialing"
                          ? "En prueba"
                          : "Inactivas"
                  }`}
                >
                  <Filter size={14} />
                  Filtros
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-left">
                  {[
                    "Empresa",
                    "Estado",
                    "Plan actual",
                    "Usuarios",
                    "Aplicaciones",
                    "Fecha de registro",
                    "Acciones",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-2 pb-3 text-[10px] font-extrabold text-zinc-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-zinc-100">
                      {Array.from({ length: 7 }).map((__, cell) => (
                        <td key={cell} className="px-2 py-3">
                          <div className="h-8 animate-pulse rounded-lg bg-zinc-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : visibleCompanies.length ? (
                  visibleCompanies.map((company) => {
                    const plan = getPlanLabel(company.plan);
                    const planMeta =
                      PLAN_META[String(plan).toLowerCase()] || PLAN_META["sin plan"];

                    return (
                      <tr
                        key={company.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                      >
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => onOpenCompany?.(company)}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <CompanyAvatar company={company} />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-extrabold text-zinc-900">
                                {company.name}
                              </span>
                              <span className="mt-0.5 block max-w-[150px] truncate text-[10px] text-zinc-400">
                                {company.subtitle}
                              </span>
                            </span>
                          </button>
                        </td>

                        <td className="px-2 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                company.status.key === "active"
                                  ? "bg-emerald-500"
                                  : company.status.key === "trialing"
                                    ? "bg-amber-400"
                                    : "bg-red-500"
                              }`}
                            />
                            {company.status.label}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${planMeta.dot}`}
                            />
                            {plan}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          {company.userCount ?? "—"}
                        </td>

                        <td className="px-2 py-3 text-[11px] font-semibold text-zinc-700">
                          {company.applicationCount ?? "—"}
                        </td>

                        <td className="px-2 py-3 text-[11px] font-medium text-zinc-500">
                          {formatDate(company.createdAt)}
                        </td>

                        <td className="relative px-2 py-3 text-right">
                          <button
                            type="button"
                            aria-label={`Acciones para ${company.name}`}
                            onClick={() =>
                              setOpenMenu((current) =>
                                current === company.id ? null : company.id
                              )
                            }
                            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {openMenu === company.id && (
                            <div className="absolute right-2 top-12 z-20 w-40 rounded-xl border border-zinc-200 bg-white p-1.5 text-left shadow-xl">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setViewModal({ isOpen: true, company });
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                              >
                                <Eye size={14} className="text-zinc-500" />
                                Ver empresa
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  openEditModal(company);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                              >
                                Gestionar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenu(null);
                                  requestDeleteCompany(company);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                              >
                                Eliminar empresa
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                        <Building2 size={18} />
                      </div>
                      <p className="mt-3 text-sm font-extrabold text-zinc-900">
                        No hay empresas para mostrar
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Prueba con otro término de búsqueda o filtro.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-medium text-zinc-500">
              Mostrando {pageStart}–{pageEnd} de {filteredCompanies.length} empresas
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
                const number = index + 1;
                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[10px] font-extrabold ${
                      page === number
                        ? "bg-[#ff4b0b] text-white"
                        : "border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    {number}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="text-[10px] font-medium text-zinc-500">
              Filas por página:{" "}
              <span className="font-bold text-zinc-700">{PAGE_SIZE}</span>
            </div>
          </div>
        </section>

        {/* Columna lateral */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-950">
                Distribución por plan
              </h2>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative h-32 w-32 shrink-0">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(#ff4b0b_0_33%,#ff7140_33%_58%,#ffb08a_58%_83%,#d4d4d8_83%_100%)]" />
                <div className="absolute inset-5 grid place-items-center rounded-full bg-white">
                  <div className="text-center">
                    <div className="text-[9px] font-medium text-zinc-400">Total</div>
                    <div className="text-xl font-extrabold text-zinc-950">
                      {stats.total}
                    </div>
                    <div className="text-[9px] font-medium text-zinc-400">
                      empresas
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {["Premium", "Intermedio", "Básico", "Sin plan"].map((plan) => {
                  const count = stats.planCounts[plan] || 0;
                  const percentage = stats.total
                    ? Math.round((count / stats.total) * 100)
                    : 0;

                  const meta =
                    PLAN_META[String(plan).toLowerCase()] || PLAN_META["sin plan"];

                  return (
                    <div
                      key={plan}
                      className="flex items-center justify-between gap-2 text-[10px]"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-bold text-zinc-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                        {plan}
                      </span>
                      <span className="shrink-0 text-zinc-400">
                        <strong className="text-zinc-700">{count}</strong>{" "}
                        ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-950">
                Actividad reciente
              </h2>
              <button
                type="button"
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950"
                onClick={() => onCompanyAction?.("activity")}
              >
                Ver todas →
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {companies.slice(0, 5).map((company, index) => (
                <div key={company.id || index} className="flex gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                      index % 3 === 0
                        ? "bg-blue-50 text-blue-600"
                        : index % 3 === 1
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {index === 0 ? (
                      <Users size={13} />
                    ) : index === 1 ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Building2 size={13} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-extrabold text-zinc-800">
                      {index === 0
                        ? "Nueva empresa registrada"
                        : index === 1
                          ? "Empresa activa"
                          : "Actividad de empresa"}
                    </p>
                    <p className="truncate text-[10px] text-zinc-400">
                      {company.name}
                    </p>
                  </div>

                  <span className="shrink-0 text-[9px] font-medium text-zinc-400">
                    reciente
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-blue-500 shadow-xs">
                <HelpCircle size={15} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold text-zinc-800">Tip</p>
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Cerrar tip"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                  Puedes gestionar cada empresa desde el menú de acciones de su fila.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Modal de Edición Rápida de Empresa (Requisito PANEL-05) */}
      {editModal.isOpen && editModal.company && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <p className="text-[10px] font-bold text-[#ff4b0b] uppercase tracking-wider">Edición Rápida</p>
                <h3 className="text-base font-extrabold text-zinc-950">Gestionar Empresa: {editModal.company.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, company: null, saving: false, form: { name: "", sector: "", plan: "Básico", status: "active" } })}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCompany} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  required
                  value={editModal.form.name}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 font-semibold focus:border-[#ff4b0b] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Sector / Categoría Comercial</label>
                <input
                  type="text"
                  value={editModal.form.sector}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, form: { ...prev.form, sector: e.target.value } }))}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-900 font-semibold focus:border-[#ff4b0b] focus:outline-none focus:bg-white"
                  placeholder="Ej. Tecnología, Comercio, Servicios"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Plan Contratado</label>
                  <select
                    value={editModal.form.plan}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, form: { ...prev.form, plan: e.target.value } }))}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-[#ff4b0b] focus:outline-none"
                  >
                    <option value="Premium">Premium</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Básico">Básico</option>
                    <option value="Sin plan">Sin plan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Estado en la Plataforma</label>
                  <select
                    value={editModal.form.status}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, form: { ...prev.form, status: e.target.value } }))}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-[#ff4b0b] focus:outline-none"
                  >
                    <option value="active">Activa</option>
                    <option value="trialing">En prueba</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, company: null, saving: false, form: { name: "", sector: "", plan: "Básico", status: "active" } })}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="rounded-xl bg-[#ff4b0b] hover:bg-[#e03f06] px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {editModal.saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal In-App de Confirmación de Eliminación (Reemplaza window.confirm) */}
      {deleteModal.isOpen && deleteModal.company && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <ShieldAlert size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-zinc-950">¿Eliminar empresa?</h3>
                <p className="mt-1 text-xs text-zinc-600 font-medium leading-relaxed">
                  Estás a punto de eliminar <strong className="text-zinc-900">"{deleteModal.company.name}"</strong>. Esta acción eliminará el registro de Supabase y desvinculará a sus usuarios.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 mt-6">
              <button
                type="button"
                disabled={deleteModal.loading}
                onClick={() => setDeleteModal({ isOpen: false, company: null, loading: false })}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteModal.loading}
                onClick={executeDeleteCompany}
                className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {deleteModal.loading ? "Eliminando..." : "Eliminar Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ficha Completa de Empresa */}
      {viewModal.isOpen && viewModal.company && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <CompanyAvatar company={viewModal.company} />
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950">{viewModal.company.name}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{viewModal.company.subtitle || "Organización activa en Qaway Lab"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, company: null })}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Estado actual</p>
                <p className="mt-1 font-extrabold text-zinc-900 inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${viewModal.company.status?.key === "active" ? "bg-emerald-500" : viewModal.company.status?.key === "trialing" ? "bg-amber-400" : "bg-red-500"}`} />
                  {viewModal.company.status?.label || "Activa"}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Plan contratado</p>
                <p className="mt-1 font-extrabold text-zinc-900">{getPlanLabel(viewModal.company.plan)}</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Sector / Industria</p>
                <p className="mt-1 font-extrabold text-zinc-900">{viewModal.company.sector || viewModal.company.industry || "General"}</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Fecha de registro</p>
                <p className="mt-1 font-extrabold text-zinc-900">{formatDate(viewModal.company.createdAt)}</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Usuarios vinculados</p>
                <p className="mt-1 font-extrabold text-zinc-900">{viewModal.company.userCount ?? 1} usuarios</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Aplicaciones activas</p>
                <p className="mt-1 font-extrabold text-zinc-900">{viewModal.company.applicationCount ?? 1} módulos</p>
              </div>
            </div>

            <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-3 text-[11px] text-zinc-600 font-medium">
              <span className="font-bold text-zinc-800">UUID Supabase: </span>
              <code className="text-[10px] font-mono text-[#ff4b0b]">{viewModal.company.id}</code>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4 mt-5">
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, company: null })}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const comp = viewModal.company;
                  setViewModal({ isOpen: false, company: null });
                  openEditModal(comp);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-xs"
              >
                Editar datos
              </button>
              <button
                type="button"
                onClick={() => {
                  const comp = viewModal.company;
                  setViewModal({ isOpen: false, company: null });
                  onOpenCompany?.(comp);
                }}
                className="rounded-xl bg-[#ff4b0b] hover:bg-[#e03f06] px-5 py-2 text-xs font-bold text-white shadow-xs transition inline-flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                Ver como esta empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
