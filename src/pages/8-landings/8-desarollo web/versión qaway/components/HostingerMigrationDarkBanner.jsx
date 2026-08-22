export function HostingerMigrationDarkBanner() {
  return (
    <section className="h-dark-banner-migration">
      <div className="h-container">
        <div style={{ maxWidth: "700px" }}>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.7rem)", fontWeight: "800", color: "#ffffff", marginBottom: "16px" }}>
            Migraciones rápidas, gratuitas e ilimitadas
          </h2>
          <p style={{ color: "#a0a3bd", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px" }}>
            ¿Ya tienes un sitio de WordPress alojado en otro lugar? Transfiere todo a Hostinger sin afectar tu posicionamiento SEO ni el rendimiento de tu sitio, incluyendo los sitios de ecommerce.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "8px", color: "#e2e5e9", fontSize: "14px" }}>
            <li>• Sin impacto en la disponibilidad del sitio</li>
            <li>• El 85% de las migraciones se completan en menos de 5 minutos</li>
            <li>• Asistencia experta disponible si es necesario</li>
          </ul>

          <a
            href="#precios"
            style={{
              background: "#ffffff",
              color: "#12131a",
              padding: "12px 32px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14.5px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Migrar tu sitio
          </a>
        </div>
      </div>
    </section>
  );
}
