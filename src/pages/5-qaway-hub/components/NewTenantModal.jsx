import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/config/supabase";

export const HUB_APP_OPTIONS = [
  { slug: "gestor-proyectos", label: "Gestor de Proyectos", route: "/hub/gestor_proyectos" },
  { slug: "inventario", label: "Inventario", route: "/hub/inventario" },
  { slug: "crm", label: "CRM", route: "/hub/crm" },
  { slug: "agenda", label: "Agenda", route: "/hub/agenda" },
  { slug: "blog", label: "Blog", route: "/hub/blog-editor" },
];

export function resolvePrimaryAppRoute(appsOrSlugs) {
  const list = Array.isArray(appsOrSlugs) ? appsOrSlugs : [];
  for (const item of list) {
    const raw = String(item || "").trim().toLowerCase();
    if (!raw) continue;
    const match = HUB_APP_OPTIONS.find((o) => o.slug === raw || o.label.toLowerCase() === raw);
    if (match) return match.route;
    if (raw.includes("gestor")) return "/hub/gestor_proyectos";
    if (raw.includes("inventario")) return "/hub/inventario";
    if (raw.includes("crm")) return "/hub/crm";
    if (raw.includes("agenda")) return "/hub/agenda";
    if (raw.includes("blog")) return "/hub/blog-editor";
  }
  return "/hub/gestor_proyectos";
}

export default function NewTenantModal({
  isOpen,
  onClose,
  title = "Nueva suscripción",
  subtitle = "Alta directa activa, sin pago ni onboarding",
  submitLabel = "Crear suscripción",
  onCreated,
}) {
  const [ntName, setNtName] = useState("");
  const [ntSlug, setNtSlug] = useState("");
  const [ntSlugEdited, setNtSlugEdited] = useState(false);
  const [ntPlan, setNtPlan] = useState("basico");
  const [ntApps, setNtApps] = useState(["gestor-proyectos"]);
  const [ntWithPassword, setNtWithPassword] = useState(true);
  const [ntDni, setNtDni] = useState("");
  const [ntEmail, setNtEmail] = useState("");
  const [ntFullName, setNtFullName] = useState("");
  const [ntCreating, setNtCreating] = useState(false);
  const [ntError, setNtError] = useState("");
  const [ntSuccess, setNtSuccess] = useState(null);
  const [ntCopied, setNtCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNtName("");
    setNtSlug("");
    setNtSlugEdited(false);
    setNtPlan("basico");
    setNtApps(["gestor-proyectos"]);
    setNtWithPassword(true);
    setNtDni("");
    setNtEmail("");
    setNtFullName("");
    setNtError("");
    setNtSuccess(null);
    setNtCopied(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNtNameChange = (val) => {
    setNtName(val);
    if (!ntSlugEdited) {
      const autoSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setNtSlug(autoSlug);
    }
  };

  const toggleNtApp = (slug) => {
    setNtApps((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setNtError("");
    const cleanName = ntName.trim();
    const cleanSlug = ntSlug.trim().toLowerCase();
    if (cleanName.length < 2) {
      setNtError("Ingresa el nombre de la empresa (mín. 2 caracteres).");
      return;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cleanSlug)) {
      setNtError("El slug solo puede tener minúsculas, números y guiones.");
      return;
    }
    if (ntApps.length === 0) {
      setNtError("Selecciona al menos una aplicación.");
      return;
    }
    if (ntWithPassword) {
      if (!/^\d{8}$/.test(ntDni.trim())) {
        setNtError("Ingresa un DNI válido de 8 dígitos.");
        return;
      }
      if (ntEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ntEmail.trim())) {
        setNtError("El correo ingresado no es válido.");
        return;
      }
    }

    setNtCreating(true);
    try {
      let finalSlug = cleanSlug;
      let { data: tenantData, error: tErr } = await supabase
        .from("tenants")
        .insert({
          name: cleanName.slice(0, 120),
          slug: finalSlug,
          status: "active",
          features: { onboarding_completed: true },
        })
        .select("id, name, slug, status, created_at")
        .single();

      if (tErr && (tErr.code === "23505" || String(tErr.message || "").includes("tenants_slug_key"))) {
        finalSlug = `${cleanSlug}-${Math.random().toString(36).slice(2, 6)}`;
        const retry = await supabase
          .from("tenants")
          .insert({
            name: cleanName.slice(0, 120),
            slug: finalSlug,
            status: "active",
            features: { onboarding_completed: true },
          })
          .select("id, name, slug, status, created_at")
          .single();
        tenantData = retry.data;
        tErr = retry.error;
      }

      if (tErr || !tenantData) {
        throw new Error(tErr?.message || "No se pudo crear el tenant.");
      }

      const { data: catalogApps } = await supabase
        .from("app_catalog")
        .select("id, slug")
        .in("slug", ntApps);

      if (catalogApps && catalogApps.length > 0) {
        const subRows = catalogApps.map((app) => ({
          tenant_id: tenantData.id,
          app_id: app.id,
          plan: ntPlan,
          status: "active",
          billing_type: "one_time",
          auto_renew: false,
          contracted_price: 0,
        }));
        const { error: subErr } = await supabase
          .from("tenant_app_subscriptions")
          .upsert(subRows, { onConflict: "tenant_id,app_id" });
        if (subErr) throw new Error(subErr.message);
      }

      let provisionedPassword = null;
      const cleanDni = ntDni.trim();
      const effectiveEmail = ntEmail.trim()
        ? ntEmail.trim().toLowerCase()
        : `${cleanDni}@${finalSlug}.qaway.local`;

      if (ntWithPassword) {
        const { data: provData, error: provErr } = await supabase.functions.invoke("admin-provision-user", {
          body: {
            action: "create",
            email: effectiveEmail,
            tenant_id: tenantData.id,
            role: "admin",
            app_slugs: ntApps,
            full_name: ntFullName.trim() || `Admin ${cleanDni}`,
            password: cleanDni,
            must_change_password: true,
          },
        });
        if (provErr || provData?.error) {
          throw new Error(provData?.error || provErr?.message || "Tenant creado, pero falló el alta del usuario.");
        }
        provisionedPassword = cleanDni;
      }

      const appRoute = resolvePrimaryAppRoute(ntApps);
      setNtSuccess({
        tenantName: tenantData.name,
        slug: tenantData.slug,
        dni: ntWithPassword ? cleanDni : null,
        email: ntWithPassword ? effectiveEmail : null,
        password: provisionedPassword,
        appRoute,
        accessUrl: `${window.location.origin}/login`,
      });

      onCreated?.({
        tenant: tenantData,
        plan: ntPlan,
        appSlugs: ntApps,
        appLabels: ntApps.map((s) => HUB_APP_OPTIONS.find((o) => o.slug === s)?.label || s),
        ownerEmail: ntWithPassword ? effectiveEmail : null,
        ownerName: ntWithPassword ? (ntFullName.trim() || `Admin ${cleanDni}`) : null,
      });
    } catch (err) {
      setNtError(err?.message || "Error inesperado al crear el tenant.");
    } finally {
      setNtCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4">
      <div data-dismissable className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#ff4b0b]">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-950">{title}</h2>
              <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              <KeyRound size={14} className={ntWithPassword ? "text-[#ff4b0b]" : "text-zinc-400"} />
              <span>Alta con contraseña</span>
              <input
                type="checkbox"
                checked={ntWithPassword}
                onChange={(e) => setNtWithPassword(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#ff4b0b] cursor-pointer"
              />
            </label>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {ntSuccess ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
              <div className="text-sm text-emerald-900">
                <p className="font-bold">Tenant "{ntSuccess.tenantName}" creado y activado</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Slug: <span className="font-mono font-semibold">{ntSuccess.slug}</span> · Estado: Activo
                </p>
              </div>
            </div>

            {ntSuccess.email && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Credenciales de acceso (Admin)
                </p>
                <div className="text-sm text-zinc-800 space-y-1">
                  <p>Correo: <span className="font-mono font-semibold">{ntSuccess.email}</span></p>
                  <div className="flex items-center justify-between gap-2">
                    <p>Contraseña inicial: <span className="font-mono font-bold text-zinc-950">{ntSuccess.password}</span></p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(ntSuccess.password);
                        setNtCopied(true);
                        setTimeout(() => setNtCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      {ntCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      {ntCopied ? "Copiada" : "Copiar"}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Al ingresar por primera vez, el sistema le pedirá cambiar su contraseña.
                  </p>
                </div>
              </div>
            )}

            {ntSuccess.accessUrl && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#ff4b0b]">
                  Links de acceso directo
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const appRoute = ntSuccess.appRoute || "/hub/gestor_proyectos";
                      const appUrl = `${window.location.origin}/login?redirect=${appRoute}`;
                      const msg = ntSuccess.email
                        ? `Acceso directo a tu App (${ntSuccess.tenantName}):\nLink: ${appUrl}\nUsuario: ${ntSuccess.email}\nContraseña inicial: ${ntSuccess.password} (te pedirá cambiarla al entrar)`
                        : `Acceso directo a tu App (${ntSuccess.tenantName}):\n${appUrl}`;
                      navigator.clipboard?.writeText(msg);
                      setNtCopied("app");
                      setTimeout(() => setNtCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff4b0b] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e03f06] transition cursor-pointer"
                  >
                    <Copy size={13} />
                    {ntCopied === "app" ? "¡Link App copiado!" : "Copiar link App"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const hubUrl = `${window.location.origin}/login?redirect=/hub/panel`;
                      const msg = ntSuccess.email
                        ? `Acceso a Hub Panel (${ntSuccess.tenantName}):\nLink: ${hubUrl}\nUsuario: ${ntSuccess.email}\nContraseña inicial: ${ntSuccess.password} (te pedirá cambiarla al entrar)`
                        : `Acceso a Hub Panel (${ntSuccess.tenantName}):\n${hubUrl}`;
                      navigator.clipboard?.writeText(msg);
                      setNtCopied("hub");
                      setTimeout(() => setNtCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    <Copy size={13} />
                    {ntCopied === "hub" ? "¡Link Hub copiado!" : "Copiar link Hub Panel"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#ff4b0b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e03f06] transition cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ntName}
                  onChange={(e) => handleNtNameChange(e.target.value)}
                  placeholder="Ej. Mi Empresa S.A.C."
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#ff4b0b]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ntSlug}
                  onChange={(e) => {
                    setNtSlugEdited(true);
                    setNtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="mi-empresa"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-mono text-zinc-900 outline-none focus:border-[#ff4b0b]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Aplicaciones a activar <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {HUB_APP_OPTIONS.map((app) => {
                  const active = ntApps.includes(app.slug);
                  return (
                    <button
                      key={app.slug}
                      type="button"
                      onClick={() => toggleNtApp(app.slug)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        active
                          ? "border-[#ff4b0b] bg-orange-50 text-[#ff4b0b]"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {app.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Plan</label>
              <select
                value={ntPlan}
                onChange={(e) => setNtPlan(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#ff4b0b]"
              >
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            {ntWithPassword && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-700">Usuario administrador inicial</p>
                  <span className="text-[11px] font-semibold text-[#ff4b0b]">
                    Contraseña inicial = DNI (cambio obligatorio al entrar)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">
                      DNI (8 dígitos) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      value={ntDni}
                      onChange={(e) => setNtDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="Ej. 45678912"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-mono text-zinc-900 outline-none focus:border-[#ff4b0b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={ntFullName}
                      onChange={(e) => setNtFullName(e.target.value)}
                      placeholder="Opcional"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#ff4b0b]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">
                    Correo de contacto (opcional)
                  </label>
                  <input
                    type="email"
                    value={ntEmail}
                    onChange={(e) => setNtEmail(e.target.value)}
                    placeholder="Si queda vacío, se genera automático con el DNI"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#ff4b0b]"
                  />
                </div>
              </div>
            )}

            {ntError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{ntError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={ntCreating}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e03f06] disabled:opacity-60 transition cursor-pointer"
              >
                {ntCreating && <Loader2 size={14} className="animate-spin" />}
                {ntCreating ? "Creando..." : submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
