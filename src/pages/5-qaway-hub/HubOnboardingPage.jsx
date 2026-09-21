import React, { useState } from "react";

const steps = ["Tu cuenta", "Tu empresa", "Tu Hub", "Tu equipo", "Listo"];

const apps = [
  ["crm", "CRM Comercial", "Clientes, oportunidades y seguimiento comercial."],
  ["agenda", "Qaway Agenda", "Reservas, disponibilidad y citas."],
  ["inventory", "Inventario & ERP", "Productos, stock y operaciones."],
  ["marketing", "Marketing Studio", "Campañas y herramientas de marketing."],
];

function Field({ label, placeholder, type = "text" }) {
  return <label className="field"><span>{label}</span><input type={type} placeholder={placeholder} /></label>;
}

export default function HubOnboardingPage() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(["crm", "agenda"]);

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="onboarding">
      <header>
        <div className="logo">Qaway<span>Lab</span></div>
        <div className="login">¿Ya tienes una cuenta? <b>Acceder</b></div>
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

        {step === 1 && (
          <section className="card">
            <small className="eyebrow">EMPECEMOS</small>
            <h1>Crea tu cuenta.</h1>
            <p>Primero necesitamos tus datos personales. Después registrarás tu empresa y crearás tu espacio en Qaway Hub.</p>
            <div className="grid">
              <Field label="Nombre" placeholder="Carlos" />
              <Field label="Apellidos" placeholder="Tu apellido" />
            </div>
            <Field label="Correo electrónico" placeholder="nombre@empresa.com" type="email" />
            <Field label="Contraseña" placeholder="Crea una contraseña segura" type="password" />
            <label className="check"><input type="checkbox" /> Acepto los términos y condiciones.</label>
            <button className="primary" onClick={next}>Continuar →</button>
          </section>
        )}

        {step === 2 && (
          <section className="card wide">
            <small className="eyebrow">TU EMPRESA</small>
            <h1>Ahora cuéntanos sobre tu marca.</h1>
            <p>Esta información será la base de tu espacio de trabajo. Podrás completarla o modificarla después.</p>

            <div className="logoUpload">
              <div>+</div><section><b>Logo de tu empresa</b><small>Opcional · PNG, JPG o SVG</small></section>
              <button>Subir logo</button>
            </div>

            <div className="grid">
              <Field label="Nombre comercial" placeholder="Ej. CoraVet" />
              <Field label="Razón social" placeholder="Nombre legal de la empresa" />
              <Field label="RUC / identificación fiscal" placeholder="Ingresa tu identificación" />
              <Field label="País" placeholder="Perú" />
              <Field label="Rubro / actividad" placeholder="Ej. Veterinaria" />
              <Field label="Teléfono / WhatsApp" placeholder="+51 ..." />
            </div>

            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" onClick={next}>Continuar →</button></div>
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
            <div className="actions"><button className="secondary" onClick={back}>← Atrás</button><button className="primary" onClick={next}>Continuar →</button></div>
          </section>
        )}

        {step === 4 && (
          <section className="card">
            <small className="eyebrow">TU EQUIPO</small>
            <h1>¿Trabajarás con otras personas?</h1>
            <p>Puedes invitar a tu equipo ahora o hacerlo después desde el panel de administración.</p>
            <div className="invite">
              <input placeholder="correo@empresa.com" />
              <button>+ Añadir otra persona</button>
            </div>
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
              <div><span>Empresa</span><b>Tu empresa</b></div>
              <div><span>Administrador</span><b>Tú</b></div>
              <div><span>Aplicaciones</span><b>CRM Comercial · Agenda</b></div>
            </div>
            <button className="primary full">Entrar a mi Hub →</button>
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
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.field{display:block;margin-bottom:14px}.field span{display:block;font-size:11px;font-weight:800;margin-bottom:7px}.field input,.invite input{width:100%;height:47px;border:1px solid #dddde2;border-radius:9px;padding:0 13px;outline:none}.field input:focus,.invite input:focus{border-color:#111}
        .check{display:flex;gap:8px;font-size:11px;color:#666;margin:5px 0 23px}.check input{accent-color:#ff4b0b}
        .primary,.secondary{height:48px;border-radius:9px;padding:0 19px;font-size:12px;font-weight:800}.primary{background:#111;color:#fff;border:0}.primary:hover{background:#ff4b0b}.secondary{background:#fff;border:1px solid #dddde2}.actions{display:flex;justify-content:space-between;align-items:center;margin-top:24px}
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
