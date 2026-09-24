import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";

const steps = ["Tu cuenta", "Tu empresa", "Tu Hub", "Tu equipo", "Listo"];

const apps = [
  ["crm", "CRM Comercial", "Clientes, oportunidades y seguimiento comercial."],
  ["agenda", "Qaway Agenda", "Reservas, disponibilidad y citas."],
  ["inventory", "Inventario & ERP", "Productos, stock y operaciones."],
  ["marketing", "Marketing Studio", "Campañas y herramientas de marketing."],
];

function Field({ label, placeholder, type = "text", value, onChange, lock }) {
  return (
    <label className="field">
      <span>{label}{lock ? " 🔒" : ""}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} readOnly={lock} className={lock ? "locked" : ""} />
    </label>
  );
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

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(session ? 2 : 1, s - 1));
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
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
            setForm({
              name: t.name || "", legal: t.legal_name || "", ruc: "",
              country: contact.country || "", rubro: (t.features || {}).rubro || "",
              phone: contact.phone || "", email: contact.email || "",
            });
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

  async function saveEmpresa(goNext) {
    setNote("");
    try {
      if (!tenant) {
        // Sin marca: crearla (quedo admin). Slug derivado del nombre.
        const slug = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const { data, error } = await supabase.functions.invoke("register-brand", {
          body: { name: form.name, slug, plans: [] },
        });
        if (error || data?.error) throw new Error(data?.error || error.message);
        setTenant(data.tenant);
      } else {
        const contact = { email: form.email, phone: form.phone, address: "", country: form.country };
        const { error } = await supabase.from("tenants").update({
          name: form.name,
          legal_name: form.legal || null,
          content: { tagline: "", contact },
          features: { ...(tenant.features || {}), rubro: form.rubro },
        }).eq("id", tenant.id);
        if (error) throw error;
        setTenant({ ...tenant, name: form.name });
      }
      if (goNext) next();
    } catch (e) {
      setNote("No se pudo guardar: " + e.message);
    }
  }

  async function saveApps(goNext) {
    setNote("");
    try {
      if (!tenant) throw new Error("Primero registra tu empresa.");
      void appsDb;
      const alias = { inventory: "inventario" };
      for (const raw of selected) {
        const slug = alias[raw] || raw;
        const { data: app } = await supabase.from("app_catalog").select("id").eq("slug", slug).single();
        if (!app) continue;
        await supabase.from("tenant_app_subscriptions").upsert(
          { tenant_id: tenant.id, app_id: app.id, plan: "basico", status: "pending" },
          { onConflict: "tenant_id,app_id" },
        );
      }
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
      body: { email: inviteEmail, tenant_id: tenant.id, role: "viewer", app_slugs: selected },
    });
    if (error || data?.error) {
      setNote("No se pudo invitar: " + (data?.error || error.message));
      return;
    }
    setNote("Invitación enviada a " + inviteEmail + ".");
    setInviteEmail("");
  }

  async function uploadLogo(file) {
    if (!file || !tenant) return;
    setNote("");
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `logos/${tenant.id}/logo.${ext}`;
      const { error: upErr } = await supabase.storage.from("resources").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("resources").getPublicUrl(path);
      const branding = { ...(tenant.branding || {}), logo_url: data.publicUrl };
      const { error } = await supabase.from("tenants").update({ branding }).eq("id", tenant.id);
      if (error) throw error;
      setTenant({ ...tenant, branding });
      setNote("Logo actualizado.");
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

        {loading && <div style={{ textAlign: "center", padding: "60px 0 30px", color: "#999", fontSize: 14 }}>Cargando…</div>}

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
              <div>+</div><section><b>Logo de tu empresa</b><small>Opcional · PNG, JPG o SVG</small></section>
              <button onClick={() => document.getElementById("hb-logo-file").click()}>Subir logo</button>
              <input id="hb-logo-file" type="file" accept=".png,.jpg,.jpeg,.svg" style={{ display: "none" }} onChange={(e) => uploadLogo(e.target.files && e.target.files[0])} />
            </div>

            <div className="grid">
              <Field label="Nombre comercial" placeholder="Ej. CoraVet" value={form.name} onChange={setF("name")} />
              <Field label="Razón social" placeholder="Nombre legal de la empresa" value={form.legal} onChange={setF("legal")} />
              <Field label="RUC / identificación fiscal" placeholder="Ingresa tu identificación" value={form.ruc} onChange={setF("ruc")} />
              <Field label="País" placeholder="Perú" value={form.country} onChange={setF("country")} />
              <Field label="Rubro / actividad" placeholder="Ej. Veterinaria" value={form.rubro} onChange={setF("rubro")} />
              <Field label="Teléfono / WhatsApp" placeholder="+51 ..." value={form.phone} onChange={setF("phone")} />
            </div>
            <Field label="Correo de contacto" placeholder="contacto@empresa.com" type="email" value={form.email} onChange={setF("email")} />

            {note !== "" && <p style={{ fontSize: 11, color: "#666" }}>{note}</p>}
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" onClick={() => saveEmpresa(true)}>Continuar →</button></div>
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

            <div className="note"><b>Tu espacio se adapta a ti.</b><span>Podrás ampliar tus aplicaciones posteriormente.</span></div>
            {note !== "" && <p style={{ fontSize: 11, color: "#666" }}>{note}</p>}
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
            {note !== "" && <p style={{ fontSize: 11, color: "#666" }}>{note}</p>}
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
        .check{display:flex;gap:8px;font-size:11px;color:#666;margin:5px 0 23px}.check input{accent-color:#ff4b0b}
        .primary,.secondary{height:48px;border-radius:9px;padding:0 19px;font-size:12px;font-weight:800}.primary{background:#111;color:#fff;border:0}.primary:hover{background:#ff4b0b}.primary:disabled{background:#a9a9ad;cursor:not-allowed;color:#fff}.secondary{background:#fff;border:1px solid #dddde2}.actions{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
        .logoUpload{display:flex;align-items:center;gap:12px;border:1px dashed #d6d6db;border-radius:12px;padding:13px;margin-bottom:22px}.logoUpload>div{width:48px;height:48px;border-radius:9px;background:#f3f3f5;display:grid;place-items:center;font-size:22px;color:#999}.logoUpload section{display:flex;flex-direction:column;gap:3px}.logoUpload section b{font-size:12px}.logoUpload section small{font-size:10px;color:#999}.logoUpload button{margin-left:auto;border:1px solid #ddd;background:#fff;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700}
        .apps{display:grid;grid-template-columns:1fr 1fr;gap:11px}.app{display:flex;align-items:flex-start;gap:11px;text-align:left;background:#fff;border:1px solid #e0e0e5;border-radius:12px;padding:15px}.app.selected{border-color:#ff4b0b;box-shadow:0 0 0 1px #ff4b0b}.appIcon{width:35px;height:35px;border-radius:9px;background:#fff0ea;color:#ff4b0b;display:grid;place-items:center;font-weight:900;flex:none}.app span{display:flex;flex-direction:column;gap:4px}.app span b{font-size:12px}.app span small{font-size:10px;color:#85858c;line-height:1.4}.app>i{margin-left:auto;width:19px;height:19px;border:1px solid #ccc;border-radius:50%;font-style:normal;font-size:10px;display:grid;place-items:center}.app.selected>i{background:#ff4b0b;border-color:#ff4b0b;color:#fff}
        .note{background:#f7f7f8;border-radius:10px;padding:12px 14px;margin-top:17px;display:flex;flex-direction:column;gap:3px}.note b{font-size:11px}.note span{font-size:10px;color:#777}
        .invite{border:1px solid #e5e5e8;border-radius:11px;padding:13px}.invite button{border:0;background:none;color:#ff4b0b;font-size:11px;font-weight:800;margin-top:10px}
        .success{width:62px;height:62px;border-radius:50%;background:#eaf8ef;color:#159b4e;display:grid;place-items:center;font-size:28px;font-weight:900;margin:0 auto 20px}.summary{border:1px solid #e6e6ea;border-radius:11px;text-align:left;margin-top:22px}.summary div{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #eee}.summary div:last-child{border:0}.summary span{font-size:10px;color:#888}.summary b{font-size:11px}.full{width:100%;margin-top:20px}
        footer{height:60px;border-top:1px solid #e8e8eb;display:flex;justify-content:space-between;align-items:center;padding:0 6vw;color:#999;font-size:10px}
        @media(max-width:700px){main{padding-top:25px}.progress{justify-content:flex-start;overflow:auto}.step span{display:none}.bar{width:24px}.card{padding:27px 21px}h1{font-size:31px}.grid,.apps{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
