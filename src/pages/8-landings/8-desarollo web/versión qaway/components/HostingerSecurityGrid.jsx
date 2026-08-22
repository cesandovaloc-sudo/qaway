import { CheckCircle2, CloudLightning, FileCode2, Lock, Shield, ShieldCheck } from "lucide-react";

export function HostingerSecurityGrid() {
  return (
    <section id="seguridad" style={{ padding: "80px 0", background: "#f8f9fc" }}>
      <div className="h-container">
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
          <h2 style={{ marginBottom: "12px" }}>
            Máxima protección del sitio web
          </h2>
          <p style={{ color: "#56596e", fontSize: "15.5px", margin: 0 }}>
            Mantén tu sitio web seguro con una protección totalmente administrada y siempre activa, sin necesidad de realizar ninguna configuración por tu parte.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Card 1 */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5e9", borderRadius: "16px", padding: "28px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Shield size={22} color="#673de6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#12131a", marginBottom: "10px" }}>
              Eliminación automática de malware
            </h3>
            <p style={{ color: "#56596e", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Mantén tu sitio web limpio y seguro: analizamos continuamente en busca de amenazas y eliminamos archivos maliciosos antes de que puedan causar daños.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5e9", borderRadius: "16px", padding: "28px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Lock size={22} color="#673de6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#12131a", marginBottom: "10px" }}>
              Protección avanzada de firewall
            </h3>
            <p style={{ color: "#56596e", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Protege tu sitio web de ataques: nuestro firewall de aplicaciones web (WAF) bloquea las amenazas antes de que lleguen al sitio.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5e9", borderRadius: "16px", padding: "28px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <CloudLightning size={22} color="#673de6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#12131a", marginBottom: "10px" }}>
              Mitigación de DDoS
            </h3>
            <p style={{ color: "#56596e", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Asegúrate de que tu sitio web permanezca en línea: filtramos el tráfico malicioso para evitar que ataques a gran escala saturen su sitio.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e5e9", borderRadius: "16px", padding: "28px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f4f0ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <CheckCircle2 size={22} color="#673de6" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#12131a", marginBottom: "10px" }}>
              Seguridad totalmente gestionada
            </h3>
            <p style={{ color: "#56596e", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
              Su sitio web permanece protegido: administramos todas las operaciones de seguridad en segundo plano, por lo que no tienes que ocuparte de nada manualmente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
