import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { DigitalCountdown } from "./DigitalCountdown";

export function HostingerPricingReal() {
  const plans = [
    {
      id: "web-comercial",
      name: "Web Comercial",
      price: "290",
      oldPrice: "S/ 490",
      discount: "-40% OFF",
      prefix: "S/ ",
      desc: "Una web completa para negocios que necesitan presentar sus servicios y generar consultas.",
      popular: false,
      btnText: "Quiero mi Web Comercial",
      btnClass: "h-btn-plan-dark",
      features: [
        "Hasta 5 páginas principales",
        "Diseño personalizado",
        "Responsive para celulares",
        "WhatsApp y formularios",
        "Google Maps integrado",
        "SEO y analítica básica",
        "Publicación online",
      ],
    },
    {
      id: "one-web",
      name: "One Web",
      price: "79.90",
      oldPrice: "S/ 149",
      discount: "-46% OFF",
      prefix: "S/ ",
      desc: "Una web de una sola página para presentar un producto, servicio o proyecto.",
      popular: true,
      badge: "Más elegido",
      btnText: "Quiero mi One Web",
      btnClass: "h-btn-plan-orange",
      features: [
        "1 página de alto impacto",
        "Diseño adaptado",
        "Responsive para celulares",
        "WhatsApp integrado",
        "Formulario básico",
        "SEO básico",
        "Publicación online",
      ],
    },
    {
      id: "tienda-online",
      name: "Tienda Online",
      price: "490",
      oldPrice: "S/ 890",
      discount: "-45% OFF",
      prefix: "S/ ",
      desc: "Una tienda online para mostrar productos y gestionar ventas desde la web.",
      popular: false,
      btnText: "Quiero mi Tienda Online",
      btnClass: "h-btn-plan-dark",
      features: [
        "Catálogo de productos",
        "Carrito de compras",
        "Integración de pagos",
        "Gestión de pedidos",
        "Diseño responsive",
        "WhatsApp integrado",
        "SEO básico",
        "Publicación online",
      ],
    },
  ];

  return (
    <section id="precios" style={{ padding: "95px 0 100px", background: "#fbfbfc" }}>
      <div className="h-container" style={{ maxWidth: "1200px" }}>
        
        {/* Encabezado Principal */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 44px" }}>
          <span className="qw-kicker-capsule">
            TARIFARIO & PRECIOS
          </span>

          <h2 style={{ fontSize: "clamp(2rem, 3.4vw, 2.7rem)", fontWeight: "700", color: "#111111", margin: "0 0 14px", lineHeight: "1.15", letterSpacing: "-0.03em" }}>
            Planes transparentes con descuento de lanzamiento
          </h2>
          
          <p style={{ color: "#71717a", fontSize: "15.5px", lineHeight: "1.55", margin: "0 0 28px" }}>
            Precio cerrado antes de empezar. Sin mensualidades ocultas ni llamadas de venta.
          </p>

          {/* Temporizador de Oferta de Lanzamiento Estilo Bloques */}
          <div style={{ margin: "0 auto 10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#e0281b", fontSize: "13px", fontWeight: "800", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Flame size={16} fill="#e0281b" />
              <span>La oferta de lanzamiento expira en:</span>
            </div>
            <DigitalCountdown targetDays={4} />
          </div>
        </div>

        {/* Grid de 3 Tarjetas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "28px", alignItems: "stretch" }}>
          {plans.map((p, idx) => {
            const isEmpresarial = p.popular;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
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
                  {/* Top Row: Nombre del Plan y Badges */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "28px", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111111", margin: 0, letterSpacing: "-0.02em" }}>
                      {p.name}
                    </h3>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {p.discount && (
                        <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "9999px" }}>
                          {p.discount}
                        </span>
                      )}
                      {p.badge && (
                        <span style={{ background: "#fe6612", color: "#ffffff", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "9999px", letterSpacing: "0.02em" }}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Precio */}
                  <div style={{ marginBottom: "12px", display: "flex", alignItems: "baseline", flexWrap: "wrap" }}>
                    {p.prefix && (
                      <span style={{ fontSize: "21px", fontWeight: "700", color: "#111111", marginRight: "4px" }}>
                        {p.prefix}
                      </span>
                    )}
                    <span style={{ fontSize: "38px", fontWeight: "800", color: "#111111", letterSpacing: "-0.04em" }}>
                      {p.price}
                    </span>
                    {p.oldPrice && (
                      <span style={{ fontSize: "15px", fontWeight: "600", textDecoration: "line-through", color: "#a1a1aa", marginLeft: "10px" }}>
                        {p.oldPrice}
                      </span>
                    )}
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
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
