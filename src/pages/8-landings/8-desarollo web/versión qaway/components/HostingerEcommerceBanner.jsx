export function HostingerEcommerceBanner() {
  return (
    <section style={{ padding: "0 24px 60px" }}>
      <div
        className="h-container"
        style={{
          background: "linear-gradient(135deg, #181926 0%, #201547 100%)",
          borderRadius: "12px",
          padding: "60px 40px",
          textAlign: "center",
          color: "#ffffff",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>
          Crear un imperio de ecommerce ahora es más fácil
        </h2>
        <p style={{ color: "#a0a3bd", fontSize: "15px", marginBottom: "28px" }}>
          Hosting administrado para WooCommerce: rendimiento prémium a un precio increíble.
        </p>
        <a href="#planes" className="h-btn-cta-purple h-btn-cta-orange" style={{ padding: "14px 42px" }}>
          Comenzar ahora
        </a>
      </div>
    </section>
  );
}
