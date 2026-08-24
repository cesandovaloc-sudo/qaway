import { useState } from "react";
import { Send, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function QawayLeadContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const lead = {
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim().toLowerCase(),
      profile: String(form.get("profile") || "").trim(),
      interest: String(form.get("interest") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };

    try {
      const { error } = await supabase.from("leads").insert([
        {
          client_name: lead.name,
          contact_info: lead.phone,
          source: "Desarrollo Web",
          stage: "new",
          metadata: {
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || "Sin mensaje adicional",
          },
        },
      ]);
      if (error) throw error;

      const apiKey = import.meta.env.VITE_WEB3FORMS_PROYECTOS_KEY || "";
      if (apiKey.trim()) {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: apiKey.trim(),
            subject: `Nueva consulta Web: ${lead.interest || "Orientación"}`,
            from_name: "Qaway Lab Web",
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            profile: lead.profile,
            interest: lead.interest,
            message: lead.message || "Sin mensaje adicional",
          }),
        });
      }

      const backupKey = import.meta.env.VITE_WEB3FORMS_BACKUP_KEY || "";
      if (backupKey.trim()) {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: backupKey.trim(),
            subject: `[Copia] Nueva consulta Web: ${lead.interest || "Orientación"}`,
            from_name: "Qaway Lab Web",
            to_email: "qaway.myc@gmail.com",
          }),
        });
      }
      setSubmitted(true);
      formElement.reset();

      const contactMsg = encodeURIComponent(
        `Hola Qaway, mi nombre es ${lead.name}, mi perfil es: ${lead.profile}. Me interesa: ${lead.interest} (Desarrollo Web). ${lead.message ? "Mensaje: " + lead.message : ""}`
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
    <section id="contacto" style={{ padding: "95px 0 105px", background: "#f8f9fc", borderTop: "1px solid #e4e4e7" }}>
      <div className="h-container" style={{ maxWidth: "860px" }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <span
            style={{
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#56596e",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#e6e8ee",
              padding: "4px 12px",
              borderRadius: "4px",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            CONTACTO
          </span>

          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.7rem)",
              fontWeight: "700",
              color: "#111111",
              margin: 0,
              lineHeight: "1.2",
            }}
          >
            Hablemos de tu <span style={{ color: "#fe6612" }}>proyecto.</span>
          </h2>
        </div>

        {/* Formulario Estilo Estudio */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "20px",
            padding: "clamp(24px, 5vw, 48px)",
            boxShadow: "0 10px 35px rgba(0,0,0,0.04)",
          }}
        >
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 20px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#fe6612",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Check size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#111111", margin: "0 0 10px" }}>
                ¡Consulta enviada con éxito!
              </h3>
              <p style={{ color: "#71717a", fontSize: "15px", maxWidth: "460px", margin: "0 0 24px", lineHeight: "1.6" }}>
                Te responderemos lo antes posible para ayudarte a elegir y cotizar el siguiente paso de tu web.
              </p>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid #fe6612",
                  color: "#111111",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: "0 0 4px",
                }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Nombre */}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label htmlFor="qw-name" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                  ¿Cómo te llamas?
                </label>
                <input
                  type="text"
                  id="qw-name"
                  name="name"
                  required
                  placeholder="Tu nombre completo"
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    border: "1px solid #d4d4d8",
                    background: "#fcfcfd",
                    fontSize: "14.5px",
                    color: "#18181b",
                    outline: "none",
                  }}
                />
              </div>

              {/* Teléfono y Correo */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label htmlFor="qw-phone" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="qw-phone"
                    name="phone"
                    required
                    placeholder="+51 999 999 999"
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 16px",
                      borderRadius: "10px",
                      border: "1px solid #d4d4d8",
                      background: "#fcfcfd",
                      fontSize: "14.5px",
                      color: "#18181b",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label htmlFor="qw-email" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="qw-email"
                    name="email"
                    required
                    placeholder="tucorreo@empresa.com"
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 16px",
                      borderRadius: "10px",
                      border: "1px solid #d4d4d8",
                      background: "#fcfcfd",
                      fontSize: "14.5px",
                      color: "#18181b",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Perfil e Interés */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label htmlFor="qw-profile" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                    ¿A qué te dedicas?
                  </label>
                  <select
                    id="qw-profile"
                    name="profile"
                    required
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1px solid #d4d4d8",
                      background: "#fcfcfd",
                      fontSize: "14px",
                      color: "#18181b",
                      outline: "none",
                    }}
                  >
                    <option value="">Selecciona tu perfil</option>
                    <option value="Profesional">Profesional</option>
                    <option value="Emprendedor o dueño de negocio">Emprendedor o dueño de negocio</option>
                    <option value="Marca personal">Marca personal</option>
                    <option value="Creador de contenido">Creador de contenido</option>
                    <option value="Equipo comercial o de marketing">Equipo comercial o de marketing</option>
                    <option value="Empresa o institución">Empresa o institución</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  <label htmlFor="qw-interest" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                    ¿En qué servicio estás interesado/a?
                  </label>
                  <select
                    id="qw-interest"
                    name="interest"
                    required
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1px solid #d4d4d8",
                      background: "#fcfcfd",
                      fontSize: "14px",
                      color: "#18181b",
                      outline: "none",
                    }}
                  >
                    <option value="">Selecciona un interés</option>
                    <option value="Landing Pages de Captación">Landing Pages de Captación</option>
                    <option value="Sitios Web Corporativos">Sitios Web Corporativos</option>
                    <option value="Tiendas Online (E-commerce)">Tiendas Online (E-commerce)</option>
                    <option value="Rediseño & Optimización Web">Rediseño & Optimización Web</option>
                    <option value="Branding & Identidad">Branding & Identidad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Mensaje */}
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label htmlFor="qw-message" style={{ fontSize: "13px", fontWeight: "700", color: "#3f3f46" }}>
                  Cuéntanos un poco más
                </label>
                <textarea
                  id="qw-message"
                  name="message"
                  rows={4}
                  placeholder="¿Qué quieres lograr o qué dificultad estás intentando resolver con tu web?"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid #d4d4d8",
                    background: "#fcfcfd",
                    fontSize: "14.5px",
                    color: "#18181b",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "flex",
                  width: "100%",
                  height: "52px",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#fe6612",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  fontWeight: "700",
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 8px 20px rgba(254, 102, 18, 0.28)",
                  transition: "background 0.2s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e5560b")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fe6612")}
              >
                <span>{submitting ? "ENVIANDO CONSULTA..." : "QUIERO ORIENTACIÓN"}</span>
                <Send size={18} />
              </button>

              {submitError && (
                <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", margin: "6px 0 0" }} role="alert">
                  {submitError}
                </p>
              )}
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
