import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/config/supabase";

export function QawayLeadContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("S/ 500 – S/ 1.500");
  const [selectedTimeline, setSelectedTimeline] = useState("1 mes");

  const budgetOptions = ["< S/ 500", "S/ 500 – S/ 1.500", "S/ 1.500 – S/ 4.000", "+ S/ 4.000"];
  const timelineOptions = ["< 2 semanas", "1 mes", "2 – 3 meses", "Flexible"];

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const fd = new FormData(e.currentTarget);
    const lead = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim().toLowerCase(),
      company: String(fd.get("company") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      budget: selectedBudget,
      timeline: selectedTimeline,
      message: String(fd.get("message") || "").trim(),
      source: "Desarrollo Web",
    };

    try {
      const { error } = await supabase.from("leads").insert([
        {
          client_name: lead.name,
          contact_info: lead.phone,
          source: lead.source,
          stage: "new",
          metadata: {
            email: lead.email,
            company: lead.company,
            budget: lead.budget,
            timeline: lead.timeline,
            message: lead.message || "Sin mensaje adicional",
          },
        },
      ]);
      if (error) throw error;

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_PROYECTOS_KEY || "",
          subject: `Nuevo Lead Desarrollo Web: ${lead.name} (${lead.company || "Sin empresa"})`,
          from_name: "Qaway Lab Web Leads",
          name: lead.name,
          email: lead.email,
          empresa: lead.company || "No especificada",
          whatsapp: lead.phone,
          presupuesto: lead.budget,
          plazo_estimado: lead.timeline,
          mensaje: lead.message || "Sin mensaje adicional",
        }),
      });

      setSubmitted(true);
      e.currentTarget.reset();

      const contactMsg = encodeURIComponent(
        `Hola Qaway, mi nombre es ${lead.name} de ${lead.company || "mi empresa"}. Mi presupuesto estimado es ${lead.budget} y fecha estimada ${lead.timeline}. Me gustaría cotizar mi proyecto web. ${lead.message ? "Detalles: " + lead.message : ""}`
      );
      const waUrl = `https://wa.me/51930756781?text=${contactMsg}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      setSubmitError("Hubo un error al enviar tu solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => setSubmitted(false);

  return (
    <section id="contacto" style={{ padding: "105px 0 115px", background: "#f8f9fc", borderTop: "1px solid #e4e4e7" }}>
      <div className="h-container" style={{ maxWidth: "1260px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "56px", alignItems: "center" }}>
          
          {/* Columna Izquierda: Información y Garantías */}
          <div style={{ paddingRight: "10px" }}>
            <span className="qw-kicker-capsule">
              CONTACTO
            </span>

            <h2
              style={{
                fontSize: "clamp(2.1rem, 3.4vw, 3rem)",
                fontWeight: "700",
                color: "#111111",
                margin: "0 0 18px",
                lineHeight: "1.18",
                letterSpacing: "-0.02em",
              }}
            >
              Cuéntanos tu proyecto y te enviamos una propuesta.
            </h2>

            <p style={{ color: "#52525b", fontSize: "16px", lineHeight: "1.6", margin: "0 0 36px" }}>
              Completa el formulario y recibirás alcance, plazos y precio cerrado. Sin llamadas de venta interminables.
            </p>

            <div style={{ width: "100%", height: "1px", background: "#e4e4e7", marginBottom: "36px" }} />

            {/* 3 Viñetas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "15.5px", color: "#111111", display: "block" }}>Propuesta en 24 h</strong>
                  <span style={{ color: "#71717a", fontSize: "13.5px" }}>Con alcance y precio detallado.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "15.5px", color: "#111111", display: "block" }}>Prototipo antes de pagar el total</strong>
                  <span style={{ color: "#71717a", fontSize: "13.5px" }}>Apruebas el diseño primero.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "15.5px", color: "#111111", display: "block" }}>Código propio, sin plantillas</strong>
                  <span style={{ color: "#71717a", fontSize: "13.5px" }}>Tú eres dueño de tu web.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Formulario Optimizada */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "24px",
              padding: "48px 42px",
              boxShadow: "0 14px 40px rgba(0,0,0,0.05)",
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fe6612", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Check size={30} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 8px" }}>¡Solicitud enviada!</h3>
                <p style={{ color: "#71717a", fontSize: "14.5px", margin: "0 0 20px" }}>Nos pondremos en contacto contigo en menos de 24 horas.</p>
                <button type="button" onClick={resetForm} style={{ background: "transparent", border: "none", borderBottom: "2px solid #fe6612", color: "#111111", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                
                {/* Nombre y Email */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>NOMBRE</label>
                    <input type="text" name="name" required placeholder="Carlos Sandoval" style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>EMAIL</label>
                    <input type="email" name="email" required placeholder="hola@empresa.com" style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none" }} />
                  </div>
                </div>

                {/* Empresa y WhatsApp */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>EMPRESA O MARCA</label>
                    <input type="text" name="company" placeholder="Mi Marca SAC" style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>WHATSAPP</label>
                    <input type="tel" name="phone" required placeholder="+51 999 999 999" style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none" }} />
                  </div>
                </div>

                {/* Presupuesto Estimado (Píldoras) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>PRESUPUESTO ESTIMADO</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {budgetOptions.map((b) => {
                      const active = selectedBudget === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBudget(b)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: active ? "700" : "500",
                            border: active ? "1px solid #fe6612" : "1px solid #e4e4e7",
                            background: active ? "rgba(254, 102, 18, 0.08)" : "#fcfcfd",
                            color: active ? "#fe6612" : "#71717a",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Plazo de Lanzamiento */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>¿PARA CUÁNDO NECESITAS TU PROYECTO?</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {timelineOptions.map((t) => {
                      const active = selectedTimeline === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTimeline(t)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: active ? "700" : "500",
                            border: active ? "1px solid #fe6612" : "1px solid #e4e4e7",
                            background: active ? "rgba(254, 102, 18, 0.08)" : "#fcfcfd",
                            color: active ? "#fe6612" : "#71717a",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mensaje */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>CUÉNTANOS DEL PROYECTO</label>
                  <textarea name="message" rows={3} placeholder="Objetivo, referencias, funcionalidades clave..." style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none", resize: "vertical" }} />
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "52px",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#fe6612",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: submitting ? "wait" : "pointer",
                    boxShadow: "0 8px 22px rgba(254, 102, 18, 0.28)",
                  }}
                >
                  <span>{submitting ? "Enviando solicitud..." : "Enviar solicitud"}</span>
                  <ArrowRight size={18} />
                </button>

                <p style={{ color: "#71717a", fontSize: "12px", textAlign: "center", margin: 0 }}>
                  Respuesta en menos de 24 h. Sin compromiso.
                </p>

                {submitError && <p style={{ color: "#dc2626", fontSize: "12.5px", textAlign: "center", margin: 0 }}>{submitError}</p>}
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
