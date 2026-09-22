import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/config/supabase";
import {
  ArrowLeft, ArrowRight, Check, CircleHelp, Mail,
  ShieldCheck, UserRound, Users, X
} from "lucide-react";

/**
 * Qaway Hub — InviteUserModule
 *
 * Props:
 *   tenantId: UUID del tenant activo.
 *   session: sesión actual de Supabase.
 *   onClose: cierra el recorrido.
 *   onSuccess: callback opcional tras enviar.
 *
 * No incluye Router, Layout ni Auth propio.
 * Reutiliza la Edge Function existente: invite-user.
 */
export default function InviteUserModule({
  tenantId,
  tenantName,
  tenantOptions,
  session,
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [selectedApps, setSelectedApps] = useState([]);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  // Super Admin elige la empresa destino; Tenant Admin queda atado a la suya.
  const [inviteTenantId, setInviteTenantId] = useState(tenantId || null);
  const [inviteTenantName, setInviteTenantName] = useState(tenantName || null);
  const canPickTenant = Array.isArray(tenantOptions) && tenantOptions.length > 0;

  const roles = useMemo(() => [
    {
      id: "editor",
      title: "Editor",
      description: "Puede trabajar y actualizar información en las aplicaciones asignadas.",
      icon: ShieldCheck,
    },
    {
      id: "viewer",
      title: "Visualizador",
      description: "Puede consultar la información disponible sin modificar la operación.",
      icon: UserRound,
    },
    {
      id: "guest",
      title: "Invitado",
      description: "Acceso limitado para consultar las aplicaciones seleccionadas.",
      icon: Users,
    },
  ], []);

  const appMeta = {
    crm: ["CRM Comercial", "Clientes, oportunidades y seguimiento.", "bg-blue-50 text-blue-600"],
    inventario: ["Inventario", "Productos, stock y operaciones.", "bg-purple-50 text-purple-600"],
    agenda: ["Qaway Agenda", "Reservas, disponibilidad y citas.", "bg-orange-50 text-orange-600"],
    blog: ["Blog", "Contenido y publicaciones digitales.", "bg-indigo-50 text-indigo-600"],
  };

  useEffect(() => {
    let mounted = true;

    async function loadApps() {
      setLoadingApps(true);
      const { data, error: queryError } = await supabase
        .from("app_catalog")
        .select("id, slug")
        .order("slug");

      if (!mounted) return;

      if (queryError) {
        setError("No se pudieron cargar las aplicaciones disponibles.");
        setLoadingApps(false);
        return;
      }

      setApps((data || [])
        .filter((app) => appMeta[app.slug])
        .map((app) => ({
          ...app,
          name: appMeta[app.slug][0],
          description: appMeta[app.slug][1],
          tone: appMeta[app.slug][2],
        })));

      setLoadingApps(false);
    }

    loadApps();
    return () => { mounted = false; };
  }, []);

  const validEmail = email.trim().length > 3 && email.includes("@");
  const selectedObjects = apps.filter((app) => selectedApps.includes(app.slug));
  const roleLabel = roles.find((item) => item.id === role)?.title || role;

  const toggleApp = (slug) => {
    setError("");
    setSelectedApps((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  };

  const next = () => {
    setError("");
    setStep((current) => Math.min(4, current + 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  async function sendInvite() {
    setError("");

    if (!inviteTenantId) return setError("Selecciona la empresa destino de la invitación.");
    if (!session?.user) return setError("Tu sesión no está disponible.");
    if (!validEmail) return setError("Introduce un correo válido.");
    if (!selectedApps.length) return setError("Selecciona al menos una aplicación.");

    setSending(true);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "invite-user",
      {
        body: {
          email: email.trim(),
          tenant_id: inviteTenantId,
          role,
          app_slugs: selectedApps,
        },
      }
    );

    if (invokeError || data?.error) {
      setError(
        data?.error ||
        invokeError?.message ||
        "No se pudo enviar la invitación."
      );
      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);
    setStep(4);
    onSuccess?.({ email: email.trim(), role, appSlugs: selectedApps });
  }

  const steps = [
    ["01", "Datos"],
    ["02", "Rol"],
    ["03", "Aplicaciones"],
    ["04", "Confirmar"],
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[3px]">
      <div className="flex max-h-[calc(100vh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-2xl">

        <header className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4 md:px-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ff4b0b]">
              Usuarios
            </span>
            <h2 className="mt-1 text-base font-extrabold tracking-tight text-zinc-950">
              Invitar usuario
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <X size={18} />
          </button>
        </header>

        <div className="border-b border-zinc-200/80 px-5 py-4 md:px-8">
          <div className="flex items-center gap-2">
            {steps.map(([number, label], index) => {
              const current = index + 1;
              const active = step >= current;
              return (
                <React.Fragment key={number}>
                  <div className={`flex items-center gap-2 ${active ? "text-zinc-950" : "text-zinc-400"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                      active ? "bg-zinc-950 text-white" : "border border-zinc-200"
                    }`}>
                      {sent && current === 4 ? <Check size={14} /> : number}
                    </span>
                    <span className="hidden text-[11px] font-bold sm:block">{label}</span>
                  </div>
                  {current < 4 && (
                    <div className={`h-px min-w-3 flex-1 ${step > current ? "bg-zinc-950" : "bg-zinc-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <main className="overflow-y-auto px-5 py-6 md:px-8 md:py-8">
          {step === 1 && (
            <section>
              <div className="mb-7">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#ff4b0b]">
                  <Mail size={20} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
                  Invita a alguien a tu equipo.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                  Añade el correo de la persona que quieres incorporar a esta empresa.
                  Después definiremos su rol y las aplicaciones que podrá utilizar.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-extrabold text-zinc-600">
                  Correo electrónico
                </span>
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => { setError(""); setEmail(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && validEmail && next()}
                  placeholder="nombre@empresa.com"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-[#ff4b0b] focus:ring-4 focus:ring-orange-50"
                />
              </label>

              {canPickTenant && (
                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-extrabold text-zinc-600">
                    Empresa destino
                  </span>
                  <select
                    value={inviteTenantId || ""}
                    onChange={(e) => {
                      setError("");
                      const chosen = tenantOptions.find((t) => t.id === e.target.value);
                      setInviteTenantId(chosen?.id || null);
                      setInviteTenantName(chosen?.name || null);
                    }}
                    className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none focus:border-[#ff4b0b] focus:ring-4 focus:ring-orange-50"
                  >
                    {tenantOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
              )}

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <CircleHelp size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-zinc-800">La invitación llegará por correo.</p>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                    La persona podrá completar su acceso desde el enlace de invitación.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <div className="mb-7">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
                  Define su nivel de acceso.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                  El rol determina qué podrá hacer dentro de las aplicaciones que le asignes.
                </p>
              </div>

              <div className="space-y-3">
                {roles.map((item) => {
                  const selected = role === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setError(""); setRole(item.id); }}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#ff4b0b] bg-orange-50/55 ring-1 ring-[#ff4b0b]/20"
                          : "border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/60"
                      }`}
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                        selected ? "bg-[#ff4b0b] text-white" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-zinc-950">{item.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">{item.description}</span>
                      </span>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border ${
                        selected ? "border-[#ff4b0b] bg-[#ff4b0b] text-white" : "border-zinc-300 text-transparent"
                      }`}>
                        <Check size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <div className="mb-7">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Users size={20} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
                  ¿Dónde podrá trabajar?
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                  Selecciona las aplicaciones que estarán disponibles para {email || "este usuario"}.
                </p>
              </div>

              {loadingApps ? (
                <div className="rounded-2xl border border-zinc-200/80 p-5 text-sm text-zinc-500">
                  Cargando aplicaciones disponibles…
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {apps.map((app) => {
                    const selected = selectedApps.includes(app.slug);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.slug)}
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-[#ff4b0b] bg-orange-50/45 ring-1 ring-[#ff4b0b]/15"
                            : "border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${app.tone}`}>
                            <Users size={16} />
                          </span>
                          <span className="min-w-0 flex-1 pr-5">
                            <span className="block text-sm font-extrabold text-zinc-950">{app.name}</span>
                            <span className="mt-1 block text-[11px] leading-5 text-zinc-500">{app.description}</span>
                          </span>
                          <span className={`absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border ${
                            selected ? "border-[#ff4b0b] bg-[#ff4b0b] text-white" : "border-zinc-300 text-transparent"
                          }`}>
                            <Check size={12} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                <span className="text-xs font-bold text-zinc-600">Aplicaciones seleccionadas</span>
                <span className="text-sm font-extrabold text-zinc-950">{selectedApps.length}</span>
              </div>
            </section>
          )}

          {step === 4 && !sent && (
            <section>
              <div className="mb-7">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Check size={20} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
                  Revisa la invitación.
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Comprueba los datos antes de enviar el acceso.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200/80">
                <div className="grid md:grid-cols-2">
                  <div className="border-b border-zinc-200/80 p-4 md:border-r">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Usuario</span>
                    <span className="mt-1 block truncate text-sm font-bold text-zinc-950">{email}</span>
                    {inviteTenantName && (
                      <span className="mt-0.5 block truncate text-[11px] font-semibold text-zinc-500">{inviteTenantName}</span>
                    )}
                  </div>
                  <div className="border-b border-zinc-200/80 p-4">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Rol</span>
                    <span className="mt-1 block text-sm font-bold text-zinc-950">{roleLabel}</span>
                  </div>
                  <div className="p-4 md:col-span-2">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Aplicaciones</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedObjects.map((app) => (
                        <span key={app.slug} className="rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-700">
                          {app.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4">
                <Mail size={16} className="mt-0.5 shrink-0 text-zinc-500" />
                <p className="text-xs leading-5 text-zinc-500">
                  Se enviará un correo de invitación a la dirección indicada.
                </p>
              </div>
            </section>
          )}

          {step === 4 && sent && (
            <section className="py-6 text-center md:py-10">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={30} />
              </div>
              <div className="mx-auto mt-6 max-w-lg">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600">
                  INVITACIÓN ENVIADA
                </span>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">
                  Ya está en camino.
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Enviamos la invitación a <strong className="text-zinc-950">{email}</strong>.
                  La persona podrá completar su acceso desde el enlace recibido.
                </p>
              </div>
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-zinc-500 shadow-xs">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-zinc-950">{email}</div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">
                      {roleLabel} · {selectedApps.length} {selectedApps.length === 1 ? "aplicación" : "aplicaciones"}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700">
              {error}
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between border-t border-zinc-200/80 bg-white px-5 py-4 md:px-8">
          {!sent ? (
            <>
              <button
                type="button"
                onClick={step === 1 ? () => onClose?.() : back}
                disabled={sending}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50"
              >
                <ArrowLeft size={15} />
                {step === 1 ? "Cancelar" : "Atrás"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={
                    (step === 1 && !validEmail) ||
                    (step === 3 && !selectedApps.length) ||
                    loadingApps
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-extrabold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Continuar <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendInvite}
                  disabled={sending}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-xs font-extrabold text-white hover:bg-[#e94408] disabled:opacity-50"
                >
                  {sending ? "Enviando…" : "Enviar invitación"}
                  {!sending && <ArrowRight size={15} />}
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-extrabold text-white hover:bg-zinc-800"
            >
              Listo <ArrowRight size={15} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
