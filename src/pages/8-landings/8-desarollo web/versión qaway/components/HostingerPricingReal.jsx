import { Check } from "lucide-react";

export function HostingerPricingReal() {
  const plans = [
    {
      id: "landing",
      name: "Landing",
      price: "$490",
      prefix: "",
      desc: "Una página de alto impacto para campañas y lanzamientos.",
      popular: false,
      btnText: "Empezar con Landing",
      btnClass: "h-btn-plan-dark",
      features: [
        "1 página con hasta 7 secciones",
        "Diseño a medida + copy guiado",
        "Formulario y WhatsApp",
        "SEO básico y velocidad optimizada",
        "Entrega en 7 días",
      ],
    },
    {
      id: "empresarial",
      name: "Empresarial",
      price: "$1.290",
      prefix: "",
      desc: "El estándar para empresas que necesitan presencia sólida.",
      popular: true,
      badge: "Más elegido",
      btnText: "Empezar con Empresarial",
      btnClass: "h-btn-plan-orange",
      features: [
        "Hasta 7 páginas internas",
        "Blog y panel autoadministrable",
        "SEO técnico completo",
        "Integración analítica y píxeles",
        "Soporte 60 días",
      ],
    },
    {
      id: "ecommerce",
      name: "E-commerce",
      price: "$2.490",
      prefix: "Desde ",
      desc: "Tienda completa lista para vender y escalar.",
      popular: false,
      btnText: "Empezar con E-commerce",
      btnClass: "h-btn-plan-dark",
      features: [
        "Catálogo y pasarela de pagos",
        "Carrito, cupones y envíos",
        "Automatización de correos",
        "Capacitación del equipo",
        "Soporte 90 días",
      ],
    },
  ];

  return (
    <section id="planes" style={{ padding: "95px 0 100px", background: "#fbfbfc" }}>
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Principal */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 52px" }}>
          <span className="qw-kicker-capsule">
            PRECIOS
          </span>

          <h2 style={{ fontSize: "clamp(2rem, 3.4vw, 2.7rem)", fontWeight: "700", color: "#111111", margin: "0 0 14px", lineHeight: "1.15", letterSpacing: "-0.03em" }}>
            Planes transparentes, sin sorpresas.
          </h2>
          
          <p style={{ color: "#71717a", fontSize: "15.5px", lineHeight: "1.55", margin: 0 }}>
            Precio cerrado antes de empezar. Incluye dominio guiado, hosting el primer año y capacitación.
          </p>
        </div>

        {/* Grid de 3 Tarjetas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "28px", alignItems: "stretch" }}>
          {plans.map((p) => {
            const isEmpresarial = p.popular;
            return (
              <div
                key={p.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  border: isEmpresarial ? "2px solid #fe6612" : "1px solid #e4e4e7",
                  boxShadow: isEmpresarial ? "0 18px 40px rgba(254, 102, 18, 0.12)" : "0 4px 20px rgba(0,0,0,0.03)",
                  padding: "36px 30px 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                <div>
                  {/* Top Row: Nombre del Plan y Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "28px", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111111", margin: 0, letterSpacing: "-0.02em" }}>
                      {p.name}
                    </h3>
                    {p.badge && (
                      <span style={{ background: "#fe6612", color: "#ffffff", fontSize: "11px", fontWeight: "700", padding: "3px 11px", borderRadius: "9999px", letterSpacing: "0.02em" }}>
                        {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Precio */}
                  <div style={{ marginBottom: "12px", display: "flex", alignItems: "baseline" }}>
                    {p.prefix && (
                      <span style={{ fontSize: "21px", fontWeight: "700", color: "#111111", marginRight: "4px" }}>
                        {p.prefix}
                      </span>
                    )}
                    <span style={{ fontSize: "38px", fontWeight: "800", color: "#111111", letterSpacing: "-0.04em" }}>
                      {p.price}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p style={{ fontSize: "13.5px", color: "#71717a", lineHeight: "1.5", margin: "0 0 26px", minHeight: "40px" }}>
                    {p.desc}
                  </p>

                  <div style={{ width: "100%", height: "1px", background: "#f4f4f5", marginBottom: "26px" }} />

                  {/* Lista de Características */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 34px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13.5px", color: "#3f3f46", lineHeight: "1.4" }}>
                        <Check size={16} strokeWidth={2.6} style={{ color: "#fe6612", flexShrink: 0, marginTop: "2px" }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón CTA */}
                <a
                  href="#contacto"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "13px 20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    background: isEmpresarial ? "#fe6612" : "#18181b",
                    color: "#ffffff",
                    boxShadow: isEmpresarial ? "0 6px 18px rgba(254, 102, 18, 0.35)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isEmpresarial) {
                      e.currentTarget.style.background = "#e55708";
                    } else {
                      e.currentTarget.style.background = "#27272a";
                    }
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    if (isEmpresarial) {
                      e.currentTarget.style.background = "#fe6612";
                    } else {
                      e.currentTarget.style.background = "#18181b";
                    }
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  {p.btnText}
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
