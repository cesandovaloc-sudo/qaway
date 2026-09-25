import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { convertirAWebp, esImagenWebpValida } from "@/lib/imagenToWebp";
import { PAISES } from "@/config/paises";

const steps = ["Tu cuenta", "Tu empresa", "Tu Hub", "Tu equipo", "Listo"];
const SLUGS = ["tu-cuenta", "tu-empresa", "tu-hub", "tu-equipo", "listo"];

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
// Modo prueba al confirmar apps: trial corto si el catálogo define uno,
// y un respaldo generoso solo para las marcas que arrancan sin pricing.
const TRIAL_DIAS = 5;
const TRIAL_DIAS_FALLBACK = 14;

function Field({ label, placeholder, type = "text", value, onChange, lock, disabled, required, invalid, maxLength, error }) {
  return (
    <label className={`field ${invalid ? "invalid" : ""}`}>
      <span>{label}{required ? <b className="req"> *</b> : null}{lock ? " 🔒" : ""}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} readOnly={lock} disabled={disabled} maxLength={maxLength} className={lock ? "locked" : ""} />
      {error ? <em className="field-error">{error}</em> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, required, invalid, placeholder, disabled, error, children }) {
  return (
    <label className={`field ${invalid ? "invalid" : ""}`}>
      <span>{label}{required ? <b className="req"> *</b> : null}</span>
      <select value={value} onChange={onChange} disabled={disabled}>
        <option value="">{placeholder}</option>
        {children}
      </select>
      {error ? <em className="field-error">{error}</em> : null}
    </label>
  );
}

function Notice({ error, children }) {
  if (!children) return null;
  return <div className={`notice ${error ? "notice-error" : "notice-ok"}`}>{children}</div>;
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
  const { paso } = useParams();
  const slugIdx = paso ? SLUGS.indexOf(String(paso).toLowerCase()) : -1;
  const validPaso = slugIdx >= 0 ? slugIdx + 1 : null;
  const [step, setStep] = useState(() => validPaso || 1);
  const [selected, setSelected] = useState(["crm", "agenda"]);
  // Cableado SaaS (solo comportamiento; diseño intacto).
  const [session, setSession] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [appsDb, setAppsDb] = useState([]);
  const [form, setForm] = useState({ name: "", legal: "", ruc: "", country: "", rubro: "", phone: "", email: "" });
  const [customRubro, setCustomRubro] = useState("");
  const [inviteEmails, setInviteEmails] = useState([""]);
  const [note, setNote] = useState("");
  const [logoNote, setLogoNote] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [constituida, setConstituida] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [prefix, setPrefix] = useState("+51");

  const next = () => navigate(`/onboarding/${SLUGS[Math.min(5, step + 1) - 1]}`);
  const back = () => navigate(`/onboarding/${SLUGS[Math.max(1, step - 1) - 1]}`);
  const noteIsError = note.startsWith("No se pudo") || note.startsWith("Escribe") || note.startsWith("Formato") || note.startsWith("Tiempo");
  const setF = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((fe) => { const n = { ...fe }; n[k] = undefined; return n; });
    if (note.startsWith("Completa los campos")) setNote("");
  };
  const paisSel = PAISES.find((p) => p.nombre === form.country) || null;
  const maxPhoneDigitos = paisSel?.maxDigitos || Math.max(paisSel?.minDigitos || 9, 9);
  // Identidad del usuario autenticado (para la carátula "Tu cuenta" bloqueada).
  const meta = (session?.user?.user_metadata) || {};
  const fullName = meta.full_name || "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const identity = {
    first: nameParts[0] || "",
    last: meta.last_name || nameParts.slice(1).join(" ") || "",
    email: session?.user?.email || "",
  };

  const addInviteField = () => {
    if (inviteEmails.length >= 5) return;
    setInviteEmails((prev) => [...prev, ""]);
  };
  const removeInviteField = (index) => {
    setInviteEmails((prev) => prev.filter((_, i) => i !== index));
  };
  const updateInviteEmail = (index, value) => {
    setInviteEmails((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        setSession(s || null);
        if (s?.user?.email) setAdminEmail(s.user.email);
        if (!s) {
          setLoading(false);
          return;
        }

        const { data: me } = await supabase.from("users").select("tenant_id").eq("id", s.user.id).single();
        if (me?.tenant_id) {
          const { data: t } = await supabase.from("tenants").select("*").eq("id", me.tenant_id).single();
          if (t) {
            setTenant(t);
            const c = t.content || {};
            const contact = c.contact || {};
            const { prefix: pfx, digits } = splitPhone(contact.phone || "");
            setPrefix(pfx || "+51");
            const savedRubro = (t.features || {}).rubro || "";
            const isStandard = RUBROS.includes(savedRubro);
            setForm({
              name: t.name || "", legal: t.legal_name || "", ruc: (c.tax_id || "").replace(/\D/g, ""),
              country: contact.country || "", rubro: isStandard ? savedRubro : (savedRubro ? "Otro" : ""),
              phone: digits, email: contact.email || "",
            });
            if (!isStandard && savedRubro) setCustomRubro(savedRubro);
            setConstituida(!!(t.legal_name || c.tax_id));

            // Si no viene con paso explícito en URL, retomar desde el paso pendiente:
            if (!validPaso) {
              const { data: currentSubs } = await supabase.from("tenant_app_subscriptions").select("app_id").eq("tenant_id", t.id);
              if (t.status === "active") {
                setStep(5);
              } else if (currentSubs && currentSubs.length > 0) {
                setStep(4);
              } else {
                setStep(3);
              }
            }
          }
        } else {
          // No tiene empresa aún: ir directo al Paso 2 (Tu empresa)
          if (!validPaso) setStep(2);
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

  // El paso vive en la URL (/onboarding/:paso): atrás/adelante del navegador
  // y enlaces directos funcionan de verdad al cambiar el parámetro.
  useEffect(() => {
    if (validPaso) setStep(validPaso);
  }, [paso]);

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
    setLogoNote("Logo actualizado.");
  }

  function validar() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Escribe el nombre comercial de tu empresa.";
    if (!form.country) errs.country = "Selecciona tu país.";
    const pais = PAISES.find((p) => p.nombre === form.country) || null;
    if (!form.rubro) errs.rubro = "Selecciona el rubro de tu empresa.";
    else if (form.rubro === "Otro" && !customRubro.trim()) errs.customRubro = "Escribe tu rubro o actividad específica.";
    if (!form.phone) errs.phone = "Escribe tu teléfono / WhatsApp.";
    else if (form.phone.length < (pais?.minDigitos || 6)) errs.phone = `El número necesita al menos ${pais?.minDigitos || 6} dígitos.`;
    else if (pais?.maxDigitos && form.phone.length > pais.maxDigitos) errs.phone = `El número de ${pais.nombre} tiene como máximo ${pais.maxDigitos} dígitos.`;
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
    if (fieldErrors.country) setFieldErrors((fe) => { const n = { ...fe }; n.country = undefined; return n; });
    if (note.startsWith("Completa los campos")) setNote("");
  }

  function handlePhoneChange(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, maxPhoneDigitos);
    setForm((f) => ({ ...f, phone: v }));
    if (fieldErrors.phone) setFieldErrors((fe) => { const n = { ...fe }; n.phone = undefined; return n; });
    if (note.startsWith("Completa los campos")) setNote("");
  }

  function handleRucChange(e) {
    const max = paisSel?.rucDigitos || 20;
    setForm((f) => ({ ...f, ruc: e.target.value.replace(/\D/g, "").slice(0, max) }));
    if (fieldErrors.ruc) setFieldErrors((fe) => { const n = { ...fe }; n.ruc = undefined; return n; });
    if (note.startsWith("Completa los campos")) setNote("");
  }

  async function saveEmpresa(goNext) {
    setNote("");
    setFieldErrors({});
    const errs = validar();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setNote("Completa los campos marcados para continuar.");
      return;
    }
    setSaving(true);
    try {
      const phoneFull = `${prefix} ${form.phone}`.trim();
      const contact = { email: form.email.trim(), phone: phoneFull, address: "", country: form.country };
      const finalRubro = form.rubro === "Otro" ? customRubro.trim() : form.rubro;
      let newTenantId = tenant?.id || null;
      if (!tenant) {
        // Sin marca: crearla (quedo admin). Slug derivado del nombre.
        const slug = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const { data, error } = await conTimeout(
          supabase.functions.invoke("register-brand", {
            body: { name: form.name, slug, plans: [] },
          }),
          45000,
        );
        const errMsg = (error && (await leerErrorEdge(error))) || data?.error;
        if (error || data?.error) {
          // Recuperación: si una vuelta anterior agotó el tiempo (25s hoy) pero
          // el edge igual creó la marca, este reintento da "Slug en uso". En vez
          // de bloquear, reutilizamos esa marca ya creada.
          if (/slug en uso/i.test(String(errMsg || ""))) {
            const { data: me2 } = await supabase
              .from("users").select("tenant_id").eq("id", session?.user?.id || "").single();
            const { data: t2 } = me2?.tenant_id
              ? await supabase.from("tenants").select("*").eq("id", me2.tenant_id).single()
              : { data: null };
            if (t2) {
              const c2 = t2.content || {};
              const c2t = c2.contact || {};
              const { prefix: pfx2, digits: dg2 } = splitPhone(c2t.phone || "");
              if (pfx2) setPrefix(pfx2);
              const savedR = (t2.features || {}).rubro || "";
              const isStd = RUBROS.includes(savedR);
              setForm((f) => ({
                ...f,
                name: t2.name || f.name,
                country: c2t.country || f.country,
                rubro: isStd ? savedR : (savedR ? "Otro" : ""),
                phone: dg2,
                email: c2t.email || f.email,
                legal: t2.legal_name || f.legal,
                ruc: (c2.tax_id || "").replace(/\D/g, "") || f.ruc,
              }));
              if (!isStd && savedR) setCustomRubro(savedR);
              setConstituida(!!(t2.legal_name || c2.tax_id));
              setTenant(t2);
              newTenantId = t2.id;
            }
          }
          if (!newTenantId) throw new Error(errMsg || "No se pudo registrar la marca.");
        } else {
          if (!data?.tenant) throw new Error("No se pudo registrar la marca.");
          const nuevoTenant = data.tenant;
          newTenantId = nuevoTenant.id;
          const { error: updErr } = await supabase.from("tenants").update({
            name: form.name,
            legal_name: form.legal || null,
            content: { tagline: "", contact, tax_id: form.ruc || null },
            features: { ...(nuevoTenant.features || {}), rubro: finalRubro || null },
          }).eq("id", newTenantId);
          if (updErr) throw updErr;
          setTenant({ ...nuevoTenant, name: form.name, legal_name: form.legal || null, content: { tagline: "", contact, tax_id: form.ruc || null } });
          if (pendingLogo) {
            await subirLogo(newTenantId, pendingLogo, nuevoTenant.branding);
            setPendingLogo(null);
          }
        }
      } else {
        const { error } = await supabase.from("tenants").update({
          name: form.name,
          legal_name: form.legal || null,
          content: { tagline: "", contact, tax_id: form.ruc || null },
          features: { ...(tenant.features || {}), rubro: finalRubro },
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
    setSaving(true);
    try {
      if (!tenant) throw new Error("Primero registra tu empresa.");
      const alias = { inventory: "inventario" };
      const selectedSlugs = selected.map((raw) => alias[raw] || raw);

      const [preciosRes, appsRes] = await Promise.all([
        supabase.from("app_plan_pricing").select("app_id, plan, trial_days, is_available").eq("plan", "basico"),
        supabase.from("app_catalog").select("id, slug").in("slug", selectedSlugs),
      ]);

      const precios = preciosRes.data || [];
      const catalogApps = appsRes.data || [];
      const ahora = new Date();

      const upsertPromises = selectedSlugs.map((slug) => {
        const app = catalogApps.find((a) => a.slug === slug);
        if (!app) return Promise.resolve();
        const precio = precios.find((p) => p.app_id === app.id);
        const trialDias = (precio && precio.is_available === true && precio.trial_days > 0)
          ? precio.trial_days
          : (precio ? TRIAL_DIAS : TRIAL_DIAS_FALLBACK);
        const trialEnds = new Date(ahora.getTime() + trialDias * 864e5).toISOString();
        return supabase.from("tenant_app_subscriptions").upsert(
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
      });

      await Promise.all(upsertPromises);

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
    } finally {
      setSaving(false);
    }
  }

  async function finishEquipoAndNext() {
    setNote("");
    const validEmails = inviteEmails.map((e) => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const invalid = validEmails.find((e) => !emailRegex.test(e));
    if (invalid) {
      setNote(`El correo "${invalid}" no tiene un formato válido.`);
      return;
    }
    if (validEmails.length > 0 && tenant) {
      setSending(true);
      try {
        const alias = { inventory: "inventario" };
        const appSlugs = selected.map((raw) => alias[raw] || raw);
        await Promise.all(
          validEmails.map((email) =>
            supabase.functions.invoke("invite-user", {
              body: {
                email,
                tenant_id: tenant.id,
                role: "viewer",
                app_slugs: appSlugs,
              },
            })
          )
        );
      } catch (err) {
        console.error("Error enviando invitaciones:", err);
      } finally {
        setSending(false);
      }
    }
    next();
  }

  async function uploadLogo(file) {
    setNote("");
    setLogoNote("");
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
      setLogoNote("Logo listo: se subirá al guardar tu empresa.");
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
            <div className="actions" style={{ justifyContent: "flex-end" }}>
              <button className="primary" disabled={!session && !terms} onClick={() => { if (session) { next(); } else { navigate("/login"); } }}>Continuar →</button>
            </div>
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
              <section><b>Logo de tu empresa</b><small>PNG, JPG o WebP · se convierte a WebP automáticamente</small>{logoNote ? <em className="logo-note">✓ {logoNote}</em> : null}</section>
              <button onClick={() => document.getElementById("hb-logo-file").click()}>Subir logo</button>
              <input id="hb-logo-file" type="file" accept=".png,.jpg,.jpeg,.webp" style={{ display: "none" }} onChange={(e) => uploadLogo(e.target.files && e.target.files[0])} />
            </div>

            <Field label="Nombre comercial" placeholder="Ej. CoraVet" value={form.name} onChange={setF("name")} required invalid={!!fieldErrors.name} error={fieldErrors.name} />

            <label className="check constituida">
              <input type="checkbox" checked={constituida} onChange={(e) => setConstituida(e.target.checked)} />
              <span>¿Es una empresa constituida?<small>De serlo, la Razón social y el RUC serán obligatorios.</small></span>
            </label>

            <div className="grid">
              <Field label="Razón social" placeholder="Nombre legal de la empresa" value={form.legal} onChange={setF("legal")} disabled={!constituida} required={constituida} invalid={!!fieldErrors.legal} error={fieldErrors.legal} />
              <Field label="RUC / identificación fiscal" placeholder="Ingresa tu identificación" value={form.ruc} onChange={handleRucChange} maxLength={paisSel?.rucDigitos || 40} disabled={!constituida} required={constituida} invalid={!!fieldErrors.ruc} error={fieldErrors.ruc} />
              <SelectField label="País" value={form.country} onChange={handleCountryChange} required invalid={!!fieldErrors.country} error={fieldErrors.country} placeholder="Selecciona tu país…">
                {PAISES.map((p) => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}
              </SelectField>
              <SelectField label="Rubro / actividad" value={form.rubro} onChange={setF("rubro")} required invalid={!!fieldErrors.rubro} error={fieldErrors.rubro} placeholder="Selecciona tu rubro…">
                {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
              </SelectField>
              {form.rubro === "Otro" && (
                <Field label="Especifica tu rubro" placeholder="Ej. Consultoría, Arquitectura..." value={customRubro} onChange={(e) => { setCustomRubro(e.target.value); if (fieldErrors.customRubro) setFieldErrors(fe => ({ ...fe, customRubro: undefined })); }} required invalid={!!fieldErrors.customRubro} error={fieldErrors.customRubro} />
              )}
              <label className={`field ${fieldErrors.phone ? "invalid" : ""}`}>
                <span>Teléfono / WhatsApp<b className="req"> *</b></span>
                <div className="phoneRow">
                  <input className="phonePrefix" value={prefix} onChange={(e) => setPrefix(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 6))} maxLength={6} placeholder="+51" inputMode="tel" />
                  <input type="tel" value={form.phone} onChange={handlePhoneChange} placeholder="999 999 999" inputMode="tel" maxLength={maxPhoneDigitos} />
                </div>
                {fieldErrors.phone ? <em className="field-error">{fieldErrors.phone}</em> : null}
              </label>
              <Field label="Correo de contacto" placeholder="contacto@empresa.com" type="email" value={form.email} onChange={setF("email")} required invalid={!!fieldErrors.email} error={fieldErrors.email} />
            </div>

            <Notice error={noteIsError}>{note}</Notice>
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
                  <span><b>{name}</b>{selected.includes(id) && <em className="trialTag">En prueba · sin costo</em>}<small>{desc}</small></span>
                  <i>{selected.includes(id) ? "✓" : ""}</i>
                </button>
              ))}
            </div>

            <div className="note trial-box">
              <div className="trial-badge">✓ PRUEBA GRATUITA POR 14 DÍAS · ACCESO TOTAL</div>
              <b>Empieza tu prueba gratuita sin tarjeta de crédito</b>
              <span>Tus aplicaciones seleccionadas se activan <b>100% GRATIS hoy</b>. Al finalizar los 14 días nada se cobra automáticamente: tú tienes el control total y decides en tu panel qué plan mantener.</span>
              <small className="trial-footer">Transparencia garantizada · Consulta tarifas y planes vigentes desde tu panel en cualquier momento.</small>
            </div>

            <Notice error={noteIsError}>{note}</Notice>
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" disabled={saving} onClick={() => saveApps(true)}>{saving ? "Guardando…" : "Continuar →"}</button></div>
          </section>
        )}

        {step === 4 && (
          <section className="card">
            <small className="eyebrow">TU EQUIPO</small>
            <h1>¿Trabajarás con otras personas?</h1>
            <p>Puedes invitar a personas de tu equipo ahora o hacerlo después desde tu panel de administración.</p>

            <div className="invite-box">
              {inviteEmails.map((email, idx) => (
                <div key={idx} className="invite-row">
                  <input
                    type="email"
                    placeholder={`correo-${idx + 1}@empresa.com`}
                    value={email}
                    onChange={(e) => updateInviteEmail(idx, e.target.value)}
                  />
                  {inviteEmails.length > 1 && (
                    <button type="button" className="btn-remove-invite" onClick={() => removeInviteField(idx)} title="Eliminar fila">
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {inviteEmails.length < 5 ? (
                <button type="button" className="btn-add-invite" onClick={addInviteField}>
                  + Añadir otra persona ({inviteEmails.length}/5)
                </button>
              ) : (
                <p className="invite-max-hint">Llegaste al límite inicial de 5 personas. Podrás invitar a todo tu equipo desde el panel sin límites.</p>
              )}
            </div>

            <Notice error={noteIsError}>{note}</Notice>

            <div className="note admin-role-box">
              <div className="role-badge">ADMINISTRADOR DEL ESPACIO</div>
              <b>Tú eres el administrador de la empresa</b>
              <span>Tendrás el control total sobre las aplicaciones activas, facturación y la asignación de roles o permisos para cada miembro de tu equipo.</span>
            </div>

            <div className="actions">
              <button className="secondary" onClick={back}>← Atrás</button>
              <button className="primary" disabled={sending} onClick={finishEquipoAndNext}>
                {sending ? "Invitando equipo…" : "Crear mi espacio →"}
              </button>
            </div>
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
            <div className="actions" style={{ marginTop: 24 }}>
              <button className="secondary" onClick={back}>← Atrás</button>
              <button className="primary" style={{ flex: 1, marginLeft: 12 }} onClick={() => navigate("/hub/panel")}>
                Entrar a mi Hub →
              </button>
            </div>
          </section>
        )}
      </main>

      <footer><b>Qaway Hub</b><span>Tu espacio de trabajo digital</span></footer>

      <style>{`
        *{box-sizing:border-box}body{margin:0;background:#f7f7f8;color:#111;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        button,input{font:inherit}button{cursor:pointer}
        .onboarding{min-height:100vh;display:flex;flex-direction:column}
        header{height:76px;background:#fff;border-bottom:1px solid #e9e9ec;padding:0 6vw;display:flex;align-items:center;justify-content:space-between}
        .logo{font-size:23px;font-weight:800;letter-spacing:-1px}.logo span{color:#ff4b0b}.login{font-size:14px;color:#64748b}.login b{color:#111;margin-left:5px;cursor:pointer}
        main{width:min(820px,92vw);margin:auto;padding:42px 0 65px;flex:1}
        .progress{display:flex;justify-content:center;align-items:center;margin-bottom:34px}.step{display:flex;align-items:center;gap:7px;color:#94a3b8}.step i{font-style:normal;width:29px;height:29px;border:1px solid #d8d8dd;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:white}.step span{font-size:13px;font-weight:700}.step.active{color:#0f172a}.step.active i{background:#0f172a;color:#fff;border-color:#0f172a}.bar{height:1px;width:48px;background:#cbd5e1;margin:0 11px}.bar.active{background:#0f172a}
        .card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:40px;box-shadow:0 15px 45px rgba(0,0,0,.045)}.card.wide{max-width:800px}.card.wider{max-width:900px}.card.done{text-align:center}
        .eyebrow{display:block;color:#ff4b0b;font-size:11px;font-weight:800;letter-spacing:1.5px;margin-bottom:12px}
        h1{font-size:34px;line-height:1.1;letter-spacing:-1.2px;margin:0 0 12px;color:#0f172a}p{color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 27px;max-width:650px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.field{display:block;margin-bottom:14px}.field span{display:block;font-size:13px;font-weight:700;color:#1e293b;margin-bottom:7px}.field input{width:100%;height:48px;border:1px solid #cbd5e1;border-radius:9px;padding:0 13px;font-size:14.5px;outline:none}.field input:focus{border-color:#0f172a}.field input.locked{background:#f8fafc;color:#475569;cursor:not-allowed;border-color:#e2e8f0}
        .field select{width:100%;height:48px;border:1px solid #cbd5e1;border-radius:9px;padding:0 34px 0 13px;font-size:14.5px;outline:none;background:#fff url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;appearance:none;cursor:pointer}.field select:focus{border-color:#0f172a}
        .phoneRow{display:flex;gap:8px}.phoneRow input{flex:1}.phoneRow .phonePrefix{flex:none;width:88px;background:#f8fafc;color:#1e293b;text-align:center;font-variant-numeric:tabular-nums;font-weight:600}
        .check{display:flex;gap:8px;font-size:14px;color:#475569;margin:5px 0 23px}.check input{accent-color:#ff4b0b;width:16px;height:16px;margin-top:2px}
        .check.constituida{align-items:flex-start}.check.constituida span{flex:1;min-width:0;line-height:1.5}.check.constituida small{display:block;color:#64748b;font-weight:400;font-size:13px;margin-top:3px;line-height:1.5}
        .req{color:#c0392b;font-weight:800;font-size:13px}
        .field.invalid input,.field.invalid select{border-color:#e0aba1!important}
        .field input:disabled{background:#f8fafc;color:#94a3b8;cursor:not-allowed}
        .primary,.secondary{height:48px;border-radius:9px;padding:0 22px;font-size:14px;font-weight:700}.primary{background:#0f172a;color:#fff;border:0}.primary:hover{background:#ff4b0b}.primary:disabled{background:#94a3b8;cursor:not-allowed;color:#fff}.secondary{background:#fff;border:1px solid #cbd5e1;color:#1e293b}.secondary:hover{background:#f8fafc}.actions{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
        .logoUpload{display:flex;align-items:center;gap:12px;border:1px dashed #cbd5e1;border-radius:12px;padding:14px;margin-bottom:22px}.logoUpload>div{width:48px;height:48px;border-radius:9px;background:#f1f5f9;display:grid;place-items:center;font-size:22px;color:#64748b}.logoUpload section{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}.logoUpload section b{font-size:14px;color:#0f172a}.logoUpload section small{font-size:13px;color:#64748b}.logoUpload button{margin-left:auto;border:1px solid #cbd5e1;background:#fff;border-radius:7px;padding:8px 12px;font-size:13px;font-weight:700;color:#1e293b}
        .apps{display:grid;grid-template-columns:1fr 1fr;gap:11px}.app{display:flex;align-items:flex-start;gap:11px;text-align:left;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px}.app.selected{border-color:#ff4b0b;box-shadow:0 0 0 1px #ff4b0b}.appIcon{width:36px;height:36px;border-radius:9px;background:#fff0ea;color:#ff4b0b;display:grid;place-items:center;font-weight:900;flex:none}.app span{display:flex;flex-direction:column;gap:4px}.app span b{font-size:15px;color:#0f172a}.app span small{font-size:13.5px;color:#64748b;line-height:1.4}.app>i{margin-left:auto;width:20px;height:20px;border:1px solid #cbd5e1;border-radius:50%;font-style:normal;font-size:11px;display:grid;place-items:center}.app.selected>i{background:#ff4b0b;border-color:#ff4b0b;color:#fff}
        .note{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-top:20px;box-shadow:0 4px 16px rgba(0,0,0,.03);display:flex;flex-direction:column;gap:6px}
        .note b{font-size:15px;color:#0f172a;font-weight:700}
        .note span{font-size:14px;color:#475569;line-height:1.55}
        .trial-box{border:1px solid #d1fae5;background:linear-gradient(180deg,#f0fdf4 0%,#ffffff 100%)}
        .trial-badge{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.3px;color:#166534;background:#dcfce7;border:1px solid #bbf7d0;border-radius:999px;padding:3px 10px;margin-bottom:4px}
        .trial-footer{font-size:12.5px;color:#64748b;margin-top:4px}
        .admin-role-box{border:1px solid #e2e8f0;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)}
        .role-badge{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.4px;color:#334155;background:#e2e8f0;border-radius:999px;padding:3px 10px;margin-bottom:4px}
        .invite-box{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
        .invite-row{display:flex;gap:8px;align-items:center}
        .invite-row input{flex:1;height:48px;border:1px solid #cbd5e1;border-radius:9px;padding:0 13px;font-size:14.5px;outline:none}
        .invite-row input:focus{border-color:#0f172a}
        .btn-remove-invite{width:36px;height:36px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;display:grid;place-items:center;font-size:13px;cursor:pointer;transition:all .15s}
        .btn-remove-invite:hover{background:#fee2e2;color:#dc2626;border-color:#fca5a5}
        .btn-add-invite{align-self:flex-start;border:0;background:none;color:#ff4b0b;font-size:13px;font-weight:800;cursor:pointer;padding:6px 0}
        .btn-add-invite:hover{text-decoration:underline}
        .invite-max-hint{font-size:12.5px;color:#64748b;margin:4px 0 0}
        .field-error{display:block;margin-top:6px;font-size:12.5px;color:#b91c1c;font-weight:500;line-height:1.45}
        .notice{display:flex;gap:8px;align-items:flex-start;margin-top:16px;padding:12px 16px;border-radius:10px;font-size:13.5px;line-height:1.55}
        .notice-error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-weight:600}
        .notice-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-weight:600}
        .logo-note{display:block;font-style:normal;margin-top:5px;font-size:12px;font-weight:700;color:#16a34a}
        .trialTag{align-self:flex-start;margin-top:1px;font-style:normal;font-size:11px;font-weight:700;letter-spacing:.2px;color:#166534;background:#dcfce7;border:1px solid #bbf7d0;border-radius:999px;padding:3px 8px}
        .success{width:64px;height:64px;border-radius:50%;background:#eaf8ef;color:#159b4e;display:grid;place-items:center;font-size:30px;font-weight:900;margin:0 auto 20px}.summary{border:1px solid #e2e8f0;border-radius:11px;text-align:left;margin-top:22px}.summary div{display:flex;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f1f5f9}.summary div:last-child{border:0}.summary span{font-size:13px;color:#64748b}.summary b{font-size:14px;color:#0f172a}.full{width:100%;margin-top:20px}
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
        footer{height:60px;border-top:1px solid #e8e8eb;display:flex;justify-content:space-between;align-items:center;padding:0 6vw;color:#64748b;font-size:13px}
        @media(max-width:700px){main{padding-top:25px}.progress{justify-content:flex-start;overflow:auto}.step span{display:none}.bar{width:24px}.card{padding:27px 21px}h1{font-size:28px}.grid,.apps{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
