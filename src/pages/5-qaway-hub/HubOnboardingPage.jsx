import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { convertirAWebp, esImagenWebpValida } from "@/lib/imagenToWebp";
import { PAISES } from "@/config/paises";

const steps = ["Tu cuenta", "Tu empresa", "Tu Hub", "Tu equipo", "Listo"];

const apps = [
  ["crm", "CRM Comercial", "Clientes, oportunidades y seguimiento comercial."],
  ["agenda", "Qaway Agenda", "Reservas, disponibilidad y citas."],
  ["inventory", "Inventario & ERP", "Productos, stock y operaciones."],
  ["marketing", "Marketing Studio", "Campañas y herramientas de marketing."],
];
const RUBROS = [
  "Veterinaria",
  "Salud Clínica",
  "Retail",
  "Gastronomía",
  "Contabilidad",
  "Finanzas",
  "Tecnología",
  "Educación",
  "Turismo",
  "Hospedaje",
  "Construcción",
  "Inmobiliaria",
  "Transporte",
  "Logística",
  "Manufactura",
  "Servicios profesionales",
  "Otro",
];
const LBL = {
  name: "Nombre comercial",
  country: "País",
  phone: "Teléfono / WhatsApp",
  email: "Correo de contacto",
  legal: "Razón social",
  ruc: "RUC / identificación fiscal",
};

// Modo prueba al confirmar apps: trial corto si el catálogo define uno,
// y un respaldo generoso solo para las marcas que arrancan sin pricing.
const TRIAL_DIAS = 5;
const TRIAL_DIAS_FALLBACK = 14;

function Field({ label, placeholder, type = "text", value, onChange, lock, disabled, required, invalid, maxLength }) {
  return (
    <label className={`field ${invalid ? "invalid" : ""}`}>
      <span>{label}{required ? <b className="req"> *</b> : null}{lock ? " 🔒" : ""}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} readOnly={lock} disabled={disabled} maxLength={maxLength} className={lock ? "locked" : ""} />
    </label>
  );
}

function SelectField({ label, value, onChange, required, invalid, placeholder, disabled, children }) {
  return (
    <label className={`field ${invalid ? "invalid" : ""}`}>
      <span>{label}{required ? <b className="req"> *</b> : null}</span>
      <select value={value} onChange={onChange} disabled={disabled}>
        <option value="">{placeholder}</option>
        {children}
      </select>
    </label>
  );
}

function splitPhone(phone) {
  const v = (phone || "").trim();
  if (!v) return { prefix: "", digits: "" };
  const p = PAISES.find((x) => v.startsWith(x.dial));
  if (p) return { prefix: p.dial, digits: v.slice(p.dial.length).trim().replace(/\D/g, "") };
  const m = v.match(/^(?:\+|00)(\d{1,4})\s*(.*)$/);
  if (m) return { prefix: "+" + m[1], digits: m[2].replace(/\D/g, "") };
  return { prefix: "", digits: v.replace(/\D/g, "") };
}

export default function HubOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(["crm", "agenda"]);
  // Cableado SaaS (solo comportamiento; diseño intacto).
  const [session, setSession] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [appsDb, setAppsDb] = useState([]);
  const [form, setForm] = useState({ name: "", legal: "", ruc: "", country: "", rubro: "", phone: "", email: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [note, setNote] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [constituida, setConstituida] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [prefix, setPrefix] = useState("+51");

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));
  const noteIsError = note.startsWith("No se pudo") || note.startsWith("Escribe") || note.startsWith("Formato");
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const paisSel = PAISES.find((p) => p.nombre === form.country) || null;
  // Identidad del usuario autenticado (para la carátula "Tu cuenta" bloqueada).
  const meta = (session?.user?.user_metadata) || {};
  const fullName = meta.full_name || "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const identity = {
    first: nameParts[0] || "",
    last: meta.last_name || nameParts.slice(1).join(" ") || "",
    email: session?.user?.email || "",
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        setSession(s || null);
        if (s?.user?.email) setAdminEmail(s.user.email);
        // Ya autenticado: la carátula "Tu cuenta" no aplica, se salta directo a "Tu empresa".
        if (s) setStep((st) => Math.max(st, 2));
        if (!s) return;
        const { data: me } = await supabase.from("users").select("tenant_id").eq("id", s.user.id).single();
        if (me?.tenant_id) {
          const { data: t } = await supabase.from("tenants").select("*").eq("id", me.tenant_id).single();
          if (t) {
            setTenant(t);
            const c = t.content || {};
            const contact = c.contact || {};
            const { prefix: pfx, digits } = splitPhone(contact.phone || "");
            setPrefix(pfx || "+51");
            setForm({
              name: t.name || "", legal: t.legal_name || "", ruc: (c.tax_id || "").replace(/\D/g, ""),
              country: contact.country || "", rubro: (t.features || {}).rubro || "",
              phone: digits, email: contact.email || "",
            });
            setConstituida(!!(t.legal_name || c.tax_id));
          }
        }
        const { data: catalog } = await supabase.from("app_catalog").select("slug");
        if (catalog) setAppsDb(catalog.map((a) => a.slug));
      } catch (e) {
        setNote("No se pudo cargar tu cuenta. Comprueba tu conexión e intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function conTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Tiempo de espera agotado. Revisa tu conexión e intenta de nuevo.")), ms);
      promise.then(
        (v) => { clearTimeout(t); resolve(v); },
        (e) => { clearTimeout(t); reject(e); },
      );
    });
  }

  async function leerErrorEdge(error) {
    if (error && typeof error.context?.json === "function") {
      try {
        const j = await error.context.json();
        if (j?.error) return j.error;
      } catch { /* ignorar */ }
    }
    return error?.message || "Error desconocido";
  }

  async function subirLogo(tenantId, blob, baseBranding = {}) {
    const path = `logos/${tenantId}/logo.webp`;
    const { error: upErr } = await supabase.storage.from("resources").upload(path, blob, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("resources").getPublicUrl(path);
    const branding = { ...(baseBranding || {}), logo_url: data.publicUrl };
    const { error } = await supabase.from("tenants").update({ branding }).eq("id", tenantId);
    if (error) throw error;
    setTenant((prev) => (prev ? { ...prev, branding } : prev));
    setLogoPreview(data.publicUrl);
    setNote("Logo actualizado.");
  }

  function validar() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Escribe el nombre comercial de tu empresa.";
    if (!form.country) errs.country = "Selecciona tu país.";
    const pais = PAISES.find((p) => p.nombre === form.country) || null;
    if (!form.phone) errs.phone = "Escribe tu teléfono / WhatsApp.";
    else if (form.phone.length < (pais?.minDigitos || 6)) errs.phone = `El número necesita al menos ${pais?.minDigitos || 6} dígitos.`;
    if (!form.email.trim()) errs.email = "Escribe el correo de contacto.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Escribe un correo válido (ej. nombre@empresa.com).";
    if (constituida) {
      if (!form.legal.trim()) errs.legal = "Escribe la razón social de la empresa.";
      const ruc = form.ruc.trim();
      if (!ruc) errs.ruc = "Escribe el RUC / identificación fiscal.";
      else if (pais?.rucDigitos && ruc.length !== pais.rucDigitos) errs.ruc = `El RUC de ${pais.nombre} tiene exactamente ${pais.rucDigitos} dígitos.`;
    }
    return errs;
  }

  function handleCountryChange(e) {
    const v = e.target.value;
    const pais = PAISES.find((p) => p.nombre === v);
    setForm((f) => ({ ...f, country: v }));
    if (pais) setPrefix(pais.dial);
  }

  function handlePhoneChange(e) {
    setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }));
  }

  function handleRucChange(e) {
    const max = paisSel?.rucDigitos || 20;
    setForm((f) => ({ ...f, ruc: e.target.value.replace(/\D/g, "").slice(0, max) }));
  }

  async function saveEmpresa(goNext) {
    setNote("");
    setFieldErrors({});
    const errs = validar();
    const claves = Object.keys(errs);
    if (claves.length) {
      setFieldErrors(errs);
      setNote("Completa los campos señalados: " + claves.map((k) => LBL[k] || k).join(", ") + ".");
      return;
    }
    setSaving(true);
    try {
      const phoneFull = `${prefix} ${form.phone}`.trim();
      const contact = { email: form.email.trim(), phone: phoneFull, address: "", country: form.country };
      let newTenantId = tenant?.id || null;
      if (!tenant) {
        // Sin marca: crearla (quedo admin). Slug derivado del nombre.
        const slug = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const { data, error } = await conTimeout(
          supabase.functions.invoke("register-brand", {
            body: { name: form.name, slug, plans: [] },
          }),
          25000,
        );
        if (error || data?.error) throw new Error((await leerErrorEdge(error)) || data?.error);
        const nuevoTenant = data.tenant;
        newTenantId = nuevoTenant.id;
        const { error: updErr } = await supabase.from("tenants").update({
          name: form.name,
          legal_name: form.legal || null,
          content: { tagline: "", contact, tax_id: form.ruc || null },
          features: { ...(nuevoTenant.features || {}), rubro: form.rubro.trim() || null },
        }).eq("id", newTenantId);
        if (updErr) throw updErr;
        setTenant({ ...nuevoTenant, name: form.name, legal_name: form.legal || null, content: { tagline: "", contact, tax_id: form.ruc || null } });
        if (pendingLogo) {
          await subirLogo(newTenantId, pendingLogo, nuevoTenant.branding);
          setPendingLogo(null);
        }
      } else {
        const { error } = await supabase.from("tenants").update({
          name: form.name,
          legal_name: form.legal || null,
          content: { tagline: "", contact, tax_id: form.ruc || null },
          features: { ...(tenant.features || {}), rubro: form.rubro },
        }).eq("id", tenant.id);
        if (error) throw error;
        setTenant({ ...tenant, name: form.name });
      }
      if (goNext) next();
    } catch (e) {
      setNote("No se pudo guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveApps(goNext) {
    setNote("");
    try {
      if (!tenant) throw new Error("Primero registra tu empresa.");
      void appsDb;
      const alias = { inventory: "inventario" };
      const { data: precios } = await supabase
        .from("app_plan_pricing")
        .select("app_id, plan, trial_days, is_available")
        .eq("plan", "basico");
      const ahora = new Date();
      for (const raw of selected) {
        const slug = alias[raw] || raw;
        const { data: app } = await supabase.from("app_catalog").select("id").eq("slug", slug).single();
        if (!app) continue;
        const precio = (precios || []).find((p) => p.app_id === app.id);
        const trialDias = (precio && precio.is_available === true && precio.trial_days > 0)
          ? precio.trial_days
          : (precio ? TRIAL_DIAS : TRIAL_DIAS_FALLBACK);
        const trialEnds = new Date(ahora.getTime() + trialDias * 864e5).toISOString();
        const { error: subErr } = await supabase.from("tenant_app_subscriptions").upsert(
          {
            tenant_id: tenant.id,
            app_id: app.id,
            plan: "basico",
            status: "trialing",
            trial_started_at: ahora.toISOString(),
            trial_ends_at: trialEnds,
            current_period_start: ahora.toISOString(),
            current_period_end: trialEnds,
          },
          { onConflict: "tenant_id,app_id" },
        );
        if (subErr) throw subErr;
      }
      // La marca pasa de borrador a activa al confirmar sus apps (modo prueba):
      // así la invitación y las apps funcionan ya; el pago se decide después.
      if (tenant.status !== "active") {
        const { data: edgeData, error: edgeErr } = await conTimeout(
          supabase.functions.invoke("activate-brand", { body: { tenant_id: tenant.id } }),
          15000,
        );
        if (edgeErr || edgeData?.error) throw new Error((await leerErrorEdge(edgeErr)) || edgeData?.error);
      }
      setTenant((prev) => (prev ? { ...prev, status: "active" } : prev));
      if (goNext) next();
    } catch (e) {
      setNote("No se pudo guardar: " + e.message);
    }
  }

  async function sendInvite() {
    setNote("");
    if (!inviteEmail || !tenant) {
      setNote("Escribe un correo válido.");
      return;
    }
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: {
        email: inviteEmail,
        tenant_id: tenant.id,
        role: "viewer",
        app_slugs: selected.map((raw) => ({ inventory: "inventario" }[raw] || raw)),
      },
    });
    if (error || data?.error) {
      setNote("No se pudo invitar: " + (data?.error || error.message));
      return;
    }
    setNote("Invitación enviada a " + inviteEmail + ".");
    setInviteEmail("");
  }

  async function uploadLogo(file) {
    setNote("");
    if (!file) return;
    if (!esImagenWebpValida(file)) {
      setNote("Formato no permitido: usa PNG, JPG o WebP.");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    const webp = await convertirAWebp(file, { scale: 1, quality: 0.92, maxEdge: 1200 });
    if (!webp) {
      setNote("No se pudo convertir la imagen a WebP.");
      return;
    }
    if (!tenant) {
      // La marca aún no existe: se sube automáticamente al crear la empresa.
      setPendingLogo(webp);
      setNote("Logo listo: se subirá al guardar tu empresa.");
      return;
    }
    try {
      await subirLogo(tenant.id, webp, tenant.branding);
    } catch (e) {
      setNote("No se pudo subir el logo: " + e.message);
    }
  }

  return (
    <div className="onboarding">
      <header>
        <div className="logo">Qaway<span>Lab</span></div>
        <div className="login">{!session && <>¿Ya tienes una cuenta? <b onClick={() => navigate("/login")}>Acceder</b></>}</div>
      </header>

      <main>
        <div className="progress">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className={step >= i + 1 ? "step active" : "step"}>
                <i>{i + 1}</i><span>{label}</span>
              </div>
              {i < 4 && <em className={step > i + 1 ? "bar active" : "bar"} />}
            </React.Fragment>
          ))}
        </div>

        {loading && (
          <section className="card wide onboarding-skeleton">
            <div className="sk-line sk-eyebrow" />
            <div className="sk-line sk-title" />
            <div className="sk-line sk-desc" />
            <div className="sk-upload" />
            <div className="grid">
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
              <div className="sk-field"><div className="sk-line sk-label" /><div className="sk-input" /></div>
            </div>
            <div className="sk-field" style={{ marginTop: 14 }}><div className="sk-line sk-label" /><div className="sk-input" /></div>
            <div className="actions" style={{ marginTop: 24 }}><div className="sk-line sk-btn" /><div className="sk-line sk-btn" /></div>
          </section>
        )}

        {!loading && step === 1 && (
          <section className="card">
            <small className="eyebrow">{session ? "TU CUENTA" : "EMPECEMOS"}</small>
            <h1>{session ? "Tu cuenta" : "Crea tu cuenta."}</h1>
            <p>{session
              ? "Estos datos se leen de tu cuenta y están bloqueados. No se pueden modificar desde aquí."
              : "Primero necesitamos tus datos personales. Después registrarás tu empresa y crearás tu espacio en Qaway Hub."}</p>
            <div className="grid">
              <Field label="Nombre" placeholder="Carlos" value={session ? identity.first : undefined} lock={!!session} />
              <Field label="Apellidos" placeholder="Tu apellido" value={session ? identity.last : undefined} lock={!!session} />
            </div>
            <Field label="Correo electrónico" placeholder="nombre@empresa.com" type="email" value={session ? identity.email : undefined} lock={!!session} />
            <Field label="Contraseña" placeholder="Crea una contraseña segura" type="password" value={session ? "••••••••" : undefined} lock={!!session} />
            {!session && (
              <label className="check"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> Acepto los términos y condiciones.</label>
            )}
            <button className="primary" disabled={!session && !terms} onClick={() => { if (session) { next(); } else { navigate("/login"); } }}>Continuar →</button>
          </section>
        )}

        {step === 2 && (
          <section className="card wide">
            <small className="eyebrow">TU EMPRESA</small>
            <h1>Ahora cuéntanos sobre tu marca.</h1>
            <p>Esta información será la base de tu espacio de trabajo. Podrás completarla o modificarla después.</p>

            <div className="logoUpload">
              {logoPreview
                ? <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 9, border: "1px solid #e3e3e8" }} />
                : <div>+</div>}
              <section><b>Logo de tu empresa</b><small>PNG, JPG o WebP · se convierte a WebP automáticamente</small></section>
              <button onClick={() => document.getElementById("hb-logo-file").click()}>Subir logo</button>
              <input id="hb-logo-file" type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: "none" }} onChange={(e) => uploadLogo(e.target.files && e.target.files[0])} />
            </div>

            <Field label="Nombre comercial" placeholder="Ej. CoraVet" value={form.name} onChange={setF("name")} required invalid={!!fieldErrors.name} />

            <label className="check constituida">
              <input type="checkbox" checked={constituida} onChange={(e) => setConstituida(e.target.checked)} />
              <span>¿Es una empresa constituida?<small>De serlo, la Razón social y el RUC serán obligatorios.</small></span>
            </label>

            <div className="grid">
              <Field label="Razón social" placeholder="Nombre legal de la empresa" value={form.legal} onChange={setF("legal")} disabled={!constituida} required={constituida} invalid={!!fieldErrors.legal} />
              <Field label="RUC / identificación fiscal" placeholder="Ingresa tu identificación" value={form.ruc} onChange={handleRucChange} maxLength={paisSel?.rucDigitos || 40} disabled={!constituida} required={constituida} invalid={!!fieldErrors.ruc} />
              <SelectField label="País" value={form.country} onChange={handleCountryChange} required invalid={!!fieldErrors.country} placeholder="Selecciona tu país…">
                {PAISES.map((p) => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}
              </SelectField>
              <SelectField label="Rubro / actividad" value={form.rubro} onChange={setF("rubro")} placeholder="Opcional — selecciona…">
                {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
              </SelectField>
              <label className={`field ${fieldErrors.phone ? "invalid" : ""}`}>
                <span>Teléfono / WhatsApp<b className="req"> *</b></span>
                <div className="phoneRow">
                  <input className="phonePrefix" value={prefix} onChange={(e) => setPrefix(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 6))} maxLength={6} placeholder="+51" inputMode="tel" />
                  <input type="tel" value={form.phone} onChange={handlePhoneChange} placeholder="999 999 999" inputMode="tel" maxLength={15} />
                </div>
              </label>
              <Field label="Correo de contacto" placeholder="contacto@empresa.com" type="email" value={form.email} onChange={setF("email")} required invalid={!!fieldErrors.email} />
            </div>

            {note !== "" && <p style={{ fontSize: 13, color: noteIsError ? "#c0392b" : "#666", fontWeight: noteIsError ? 600 : 400 }}>{note}</p>}
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" disabled={saving} onClick={() => saveEmpresa(true)}>{saving ? "Creando tu espacio…" : "Continuar →"}</button></div>
          </section>
        )}

        {step === 3 && (
          <section className="card wider">
            <small className="eyebrow">CONFIGURACIÓN INICIAL</small>
            <h1>¿Qué quieres gestionar desde Qaway?</h1>
            <p>Selecciona las aplicaciones que quieres tener disponibles en tu espacio.</p>

            <div className="apps">
              {apps.map(([id, name, desc]) => (
                <button key={id} className={selected.includes(id) ? "app selected" : "app"}
                  onClick={() => setSelected(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id])}>
                  <div className="appIcon">Q</div>
                  <span><b>{name}</b><small>{desc}</small></span>
                  <i>{selected.includes(id) ? "✓" : ""}</i>
                </button>
              ))}
            </div>

            <div className="note"><b>Sin costo ahora, en modo prueba.</b><span>Estás reservando tus apps: se activarán al continuar sin pedir tarjeta. Terminado el periodo de prueba decides el plan desde el panel; nada se cobra automáticamente.</span></div>
            {note !== "" && <p style={{ fontSize: 13, color: noteIsError ? "#c0392b" : "#666", fontWeight: noteIsError ? 600 : 400 }}>{note}</p>}
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" onClick={() => saveApps(true)}>Continuar →</button></div>
          </section>
        )}

        {step === 4 && (
          <section className="card">
            <small className="eyebrow">TU EQUIPO</small>
            <h1>¿Trabajarás con otras personas?</h1>
            <p>Puedes invitar a tu equipo ahora o hacerlo después desde el panel de administración.</p>
            <div className="invite">
              <input placeholder="correo@empresa.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <button onClick={sendInvite}>+ Añadir otra persona</button>
            </div>
            {note !== "" && <p style={{ fontSize: 13, color: noteIsError ? "#c0392b" : "#666", fontWeight: noteIsError ? 600 : 400 }}>{note}</p>}
            <div className="note"><b>Tú serás el administrador de la empresa.</b><span>Después podrás asignar aplicaciones, roles y permisos.</span></div>
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" onClick={next}>Crear mi espacio →</button></div>
          </section>
        )}

        {step === 5 && (
          <section className="card done">
            <div className="success">✓</div>
            <small className="eyebrow">TODO LISTO</small>
            <h1>Bienvenido a Qaway Hub.</h1>
            <p>Tu espacio de trabajo está preparado. Desde aquí podrás gestionar tus aplicaciones, equipo y operación digital.</p>
            <div className="summary">
              <div><span>Empresa</span><b>{tenant?.name || form.name || "Tu empresa"}</b></div>
              <div><span>Administrador</span><b>{adminEmail || "Tú"}</b></div>
              <div><span>Aplicaciones</span><b>{selected.join(" · ")}</b></div>
            </div>
            <button className="primary full" onClick={() => navigate("/hub/panel")}>Entrar a mi Hub →</button>
          </section>
        )}
      </main>

      <footer><b>Qaway Hub</b><span>Tu espacio de trabajo digital</span></footer>

      <style>{`
        *{box-sizing:border-box}body{margin:0;background:#f7f7f8;color:#111;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        button,input{font:inherit}button{cursor:pointer}
        .onboarding{min-height:100vh;display:flex;flex-direction:column}
        header{height:76px;background:#fff;border-bottom:1px solid #e9e9ec;padding:0 6vw;display:flex;align-items:center;justify-content:space-between}
        .logo{font-size:23px;font-weight:800;letter-spacing:-1px}.logo span{color:#ff4b0b}.login{font-size:13px;color:#777}.login b{color:#111;margin-left:5px}
        main{width:min(820px,92vw);margin:auto;padding:42px 0 65px;flex:1}
        .progress{display:flex;justify-content:center;align-items:center;margin-bottom:34px}.step{display:flex;align-items:center;gap:7px;color:#aaa}.step i{font-style:normal;width:27px;height:27px;border:1px solid #d8d8dd;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;background:white}.step span{font-size:11px;font-weight:700}.step.active{color:#111}.step.active i{background:#111;color:#fff;border-color:#111}.bar{height:1px;width:48px;background:#ddd;margin:0 11px}.bar.active{background:#111}
        .card{background:#fff;border:1px solid #e5e5e9;border-radius:20px;padding:40px;box-shadow:0 15px 45px rgba(0,0,0,.045)}.card.wide{max-width:800px}.card.wider{max-width:900px}.card.done{text-align:center}
        .eyebrow{display:block;color:#ff4b0b;font-size:10px;font-weight:800;letter-spacing:1.6px;margin-bottom:12px}
        h1{font-size:38px;line-height:1.04;letter-spacing:-1.8px;margin:0 0 12px}p{color:#73737b;font-size:14px;line-height:1.65;margin:0 0 27px;max-width:650px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.field{display:block;margin-bottom:14px}.field span{display:block;font-size:11px;font-weight:800;margin-bottom:7px}.field input,.invite input{width:100%;height:47px;border:1px solid #dddde2;border-radius:9px;padding:0 13px;outline:none}.field input:focus,.invite input:focus{border-color:#111}.field input.locked{background:#f6f6f7;color:#555;cursor:not-allowed;border-color:#e7e7eb}
        .field select{width:100%;height:47px;border:1px solid #dddde2;border-radius:9px;padding:0 34px 0 13px;outline:none;background:#fff url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;appearance:none;cursor:pointer}.field select:focus{border-color:#111}
        .phoneRow{display:flex;gap:8px}.phoneRow input{flex:1}.phoneRow .phonePrefix{flex:none;width:88px;background:#f6f6f7;color:#333;text-align:center;font-variant-numeric:tabular-nums}
        .check{display:flex;gap:8px;font-size:11px;color:#666;margin:5px 0 23px}.check input{accent-color:#ff4b0b}
        .check.constituida{align-items:flex-start}.check.constituida span{flex:1;min-width:0;line-height:1.5}.check.constituida small{display:block;color:#999;font-weight:400;font-size:11px;margin-top:3px;line-height:1.5}
        .req{color:#c0392b;font-weight:800;font-size:12px}
        .field.invalid input,.field.invalid select{border-color:#c0392b!important}
        .field input:disabled{background:#f6f6f7;color:#999;cursor:not-allowed}
        .primary,.secondary{height:48px;border-radius:9px;padding:0 19px;font-size:12px;font-weight:800}.primary{background:#111;color:#fff;border:0}.primary:hover{background:#ff4b0b}.primary:disabled{background:#a9a9ad;cursor:not-allowed;color:#fff}.secondary{background:#fff;border:1px solid #dddde2}.actions{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
        .logoUpload{display:flex;align-items:center;gap:12px;border:1px dashed #d6d6db;border-radius:12px;padding:13px;margin-bottom:22px}.logoUpload>div{width:48px;height:48px;border-radius:9px;background:#f3f3f5;display:grid;place-items:center;font-size:22px;color:#999}.logoUpload section{display:flex;flex-direction:column;gap:3px}.logoUpload section b{font-size:12px}.logoUpload section small{font-size:10px;color:#999}.logoUpload button{margin-left:auto;border:1px solid #ddd;background:#fff;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700}
        .apps{display:grid;grid-template-columns:1fr 1fr;gap:11px}.app{display:flex;align-items:flex-start;gap:11px;text-align:left;background:#fff;border:1px solid #e0e0e5;border-radius:12px;padding:15px}.app.selected{border-color:#ff4b0b;box-shadow:0 0 0 1px #ff4b0b}.appIcon{width:35px;height:35px;border-radius:9px;background:#fff0ea;color:#ff4b0b;display:grid;place-items:center;font-weight:900;flex:none}.app span{display:flex;flex-direction:column;gap:4px}.app span b{font-size:12px}.app span small{font-size:10px;color:#85858c;line-height:1.4}.app>i{margin-left:auto;width:19px;height:19px;border:1px solid #ccc;border-radius:50%;font-style:normal;font-size:10px;display:grid;place-items:center}.app.selected>i{background:#ff4b0b;border-color:#ff4b0b;color:#fff}
        .note{background:#f7f7f8;border-radius:10px;padding:12px 14px;margin-top:17px;display:flex;flex-direction:column;gap:3px}.note b{font-size:11px}.note span{font-size:10px;color:#777}
        .invite{border:1px solid #e5e5e8;border-radius:11px;padding:13px}.invite button{border:0;background:none;color:#ff4b0b;font-size:11px;font-weight:800;margin-top:10px}
        .success{width:62px;height:62px;border-radius:50%;background:#eaf8ef;color:#159b4e;display:grid;place-items:center;font-size:28px;font-weight:900;margin:0 auto 20px}.summary{border:1px solid #e6e6ea;border-radius:11px;text-align:left;margin-top:22px}.summary div{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #eee}.summary div:last-child{border:0}.summary span{font-size:10px;color:#888}.summary b{font-size:11px}.full{width:100%;margin-top:20px}
        @keyframes skPulse{0%,100%{opacity:1}50%{opacity:.45}}
        .onboarding-skeleton{animation:skPulse 1.4s ease-in-out infinite}
        .sk-line{background:#eaeaee;border-radius:6px}
        .sk-eyebrow{width:90px;height:10px;margin-bottom:14px}
        .sk-title{width:min(320px,80%);height:32px;margin-bottom:14px}
        .sk-desc{width:min(480px,95%);height:16px;margin-bottom:27px}
        .sk-upload{height:74px;border-radius:12px;background:#f3f3f5;margin-bottom:22px}
        .sk-field{margin-bottom:14px}
        .sk-label{width:90px;height:11px;margin-bottom:7px}
        .sk-input{height:47px;border-radius:9px;background:#f3f3f5}
        .sk-btn{width:110px;height:48px;border-radius:9px;background:#eaeaee}
        footer{height:60px;border-top:1px solid #e8e8eb;display:flex;justify-content:space-between;align-items:center;padding:0 6vw;color:#999;font-size:10px}
        @media(max-width:700px){main{padding-top:25px}.progress{justify-content:flex-start;overflow:auto}.step span{display:none}.bar{width:24px}.card{padding:27px 21px}h1{font-size:31px}.grid,.apps{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
