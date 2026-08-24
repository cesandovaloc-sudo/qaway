export function QawayBrandsMarquee() {
  const row1 = [
    { name: "Google Cloud", icon: "🌐", cat: "Infraestructura" },
    { name: "Vercel", icon: "▲", cat: "Edge Hosting" },
    { name: "Meta Business", icon: "♾️", cat: "Píxel & Ads" },
    { name: "Stripe", icon: "💳", cat: "Pagos Online" },
    { name: "WordPress", icon: "⚡", cat: "CMS Flexible" },
    { name: "Cloudflare", icon: "🛡️", cat: "Seguridad & CDN" },
    { name: "Shopify", icon: "🛍️", cat: "E-commerce" },
    { name: "Next.js", icon: "⚛️", cat: "Frontend Moderno" },
  ];

  const row2 = [
    { name: "LiteSpeed Web", icon: "🚀", cat: "Carga Ultrarrápida" },
    { name: "Figma", icon: "🎨", cat: "Diseño UI/UX" },
    { name: "Mercado Pago", icon: "🤝", cat: "Pasarela LATAM" },
    { name: "Tailwind CSS", icon: "🌊", cat: "Estilos a Medida" },
    { name: "Amazon AWS", icon: "☁️", cat: "Cloud Services" },
    { name: "HubSpot", icon: "📊", cat: "CRM & Formularios" },
    { name: "Yape & Plin", icon: "📱", cat: "Pagos Móviles" },
    { name: "Google Analytics 4", icon: "📈", cat: "Métricas de Conversión" },
  ];

  const track1 = [...row1, ...row1, ...row1, ...row1];
  const track2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section
      style={{
        padding: "60px 0 70px",
        background: "#ffffff",
        overflow: "hidden",
        position: "relative",
        borderTop: "1px solid #f4f4f5",
        borderBottom: "1px solid #f4f4f5",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "120px",
          height: "100%",
          background: "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "100%",
          background: "linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", marginBottom: "32px", padding: "0 16px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "800",
            color: "#71717a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: "8px",
          }}
        >
          TECNOLOGÍAS & ESTÁNDARES GLOBALES
        </span>
        <h3
          style={{
            fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
            fontWeight: "600",
            color: "#111111",
            margin: 0,
          }}
        >
          Desarrollamos con el ecosistema tecnológico de los líderes digitales
        </h3>
      </div>

      <div className="qaway-marquee-wrapper" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-left">
            {track1.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                style={{
                  background: "#f8f9fc",
                  border: "1px solid #e4e4e7",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                  cursor: "default",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#111111", display: "block" }}>{item.name}</strong>
                  <span style={{ fontSize: "10.5px", color: "#71717a", fontWeight: "600" }}>{item.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflow: "hidden", display: "flex" }}>
          <div className="qaway-marquee-row qaway-marquee-right">
            {track2.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                style={{
                  background: "#f8f9fc",
                  border: "1px solid #e4e4e7",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                  cursor: "default",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#111111", display: "block" }}>{item.name}</strong>
                  <span style={{ fontSize: "10.5px", color: "#71717a", fontWeight: "600" }}>{item.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
