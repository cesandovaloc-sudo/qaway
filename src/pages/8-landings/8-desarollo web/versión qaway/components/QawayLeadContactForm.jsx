import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Zap, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/config/supabase";

export function QawayLeadContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("S/ 250 – S/ 400 (Web Comercial)");
  const [selectedTimeline, setSelectedTimeline] = useState("1 a 2 semanas");

  const budgetOptions = [
    "S/ 80 – S/ 150 (One Web)",
    "S/ 250 – S/ 400 (Web Comercial)",
    "S/ 450 – S/ 700 (Tienda Online)",
    "+ S/ 800 (A Medida / Corporativo)",
  ];
  const timelineOptions = [
    "⚡ Urgente / Inmediato (< 48 h)",
    "1 a 2 semanas",
    "1 mes",
    "Flexible / En planificación",
  ];

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
      // 1. Enviar a Supabase (de fondo sin bloquear si hay restricción de RLS)
      try {
        await supabase.from("leads").insert([
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
      } catch (spErr) {
        console.warn("Supabase insert warning:", spErr);
      }

      // 2. Enviar por correo con Web3Forms (Proyectos + Respaldo)
      const primaryKey = import.meta.env.VITE_WEB3FORMS_PROYECTOS_KEY || "b1022349-bf06-41b2-b110-5beb1cd2a1a0";
      const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || "d1e5eb0e-95c3-4cba-8029-b9e5ef8f8d49";

      const mailBody = {
        access_key: primaryKey,
        subject: `Nuevo Lead Desarrollo Web: ${lead.name} (${lead.company || "Sin empresa"})`,
        from_name: "Qaway Lab Web Leads",
        name: lead.name,
        email: lead.email,
        empresa: lead.company || "No especificada",
        whatsapp: lead.phone,
        presupuesto: lead.budget,
        plazo_estimado: lead.timeline,
        mensaje: lead.message || "Sin mensaje adicional",
      };

      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(mailBody),
      });

      if (backupKey && backupKey !== primaryKey) {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...mailBody,
            access_key: backupKey,
            subject: `[Copia] Nuevo Lead Web: ${lead.name}`,
          }),
        }).catch(() => {});
      }

      setSubmitted(true);
      e.currentTarget.reset();

      // 3. Abrir WhatsApp directamente con mensaje estructurado
      const contactMsg = encodeURIComponent(
        `Hola Qaway Lab, quiero cotizar mi proyecto web:\n\n• Nombre: ${lead.name}\n• Empresa: ${lead.company || "No especificada"}\n• WhatsApp: ${lead.phone}\n• Email: ${lead.email}\n• Presupuesto: ${lead.budget}\n• Plazo: ${lead.timeline}\n• Mensaje: ${lead.message || "Solicito cotización"}`
      );
      const waUrl = `https://wa.me/51930756781?text=${contactMsg}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error al enviar formulario:", err);
      setSubmitError("Hubo un problema de conexión. Puedes escribirnos directamente por WhatsApp.");
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
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{ paddingRight: "10px" }}
          >
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
              Completa el formulario y recibirás alcance, plazos y una propuesta personalizada para tu proyecto.
            </p>

            <div style={{ width: "100%", height: "1px", background: "#e4e4e7", marginBottom: "36px" }} />

            {/* Viñetas de Garantía */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "15.5px", color: "#111111", display: "block" }}>Propuesta en 24 h</strong>
                  <span style={{ color: "#71717a", fontSize: "13.5px" }}>Con alcance y precio detallado sin compromiso.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fe6612", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: "15.5px", color: "#111111", display: "block" }}>Prototipo antes de pagar el total</strong>
                  <span style={{ color: "#71717a", fontSize: "13.5px" }}>Apruebas el diseño primero antes de la publicación final.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Tarjeta de Formulario Optimizada */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
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

                {/* Fila Única: Presupuesto y Plazo en Opciones Desplegables */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>PRESUPUESTO ESTIMADO</label>
                    <select
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none", cursor: "pointer" }}
                    >
                      {budgetOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>¿PARA CUÁNDO LO NECESITAS?</label>
                    <select
                      value={selectedTimeline}
                      onChange={(e) => setSelectedTimeline(e.target.value)}
                      style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none", cursor: "pointer" }}
                    >
                      {timelineOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mensaje */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#71717a", letterSpacing: "0.08em" }}>CUÉNTANOS DEL PROYECTO</label>
                  <textarea name="message" rows={3} placeholder="Objetivo, referencias, funcionalidades clave..." style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e4e4e7", background: "#fcfcfd", fontSize: "14px", color: "#18181b", outline: "none", resize: "vertical" }} />
                </div>

                {/* Botón */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={submitting ? {} : { y: -2, backgroundColor: "#ff7527", boxShadow: "0 12px 28px rgba(254, 102, 18, 0.38)" }}
                  whileTap={submitting ? {} : { scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
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
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Enviando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar solicitud</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <p style={{ color: "#71717a", fontSize: "12px", textAlign: "center", margin: 0 }}>
                  Respuesta en menos de 24 h. Sin compromiso.
                </p>

                {submitError && <p style={{ color: "#dc2626", fontSize: "12.5px", textAlign: "center", margin: 0 }}>{submitError}</p>}
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
