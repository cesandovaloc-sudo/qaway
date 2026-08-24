import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Carlos Mendoza",
    role: "Emprendedor Gastronómico",
    comment: "Pude crear la web de mi restaurante en 10 minutos con el generador de IA. La velocidad con LiteSpeed es increíble, los clientes cargan el menú al instante.",
    rating: 5,
  },
  {
    name: "Lucía Fernández",
    role: "Diseñadora Freelance",
    comment: "La función de Staging en 1 clic y el asistente SEO me ahorran horas de trabajo con cada cliente de WordPress. Totalmente recomendado.",
    rating: 5,
  },
  {
    name: "Andrés Silva",
    role: "Director de Agencia",
    comment: "Migramos más de 40 sitios a los planes Business de Hostinger. El soporte técnico en español responde en menos de 3 minutos cualquier duda.",
    rating: 5,
  },
];

export function HostingerTestimonialsSlider() {
  return (
    <section style={{ padding: "80px 0", background: "var(--h-color-neutral-50)", borderTop: "1px solid var(--h-color-neutral-200)" }}>
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Más de 2.5 millones de creadores confían en Hostinger</h2>
          <p>Mira lo que opinan los usuarios que ya crearon su presencia online con nosotros.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {reviews.map((r) => (
            <div
              key={r.name}
              style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: "12px",
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#00b67a" color="#00b67a" />
                ))}
              </div>
              <p style={{ color: "#2f303a", fontSize: "14.5px", lineHeight: "1.6", fontStyle: "italic", flexGrow: 1, margin: "0 0 20px" }}>
                "{r.comment}"
              </p>
              <div>
                <strong style={{ fontSize: "15px", color: "#1d1e24", display: "block" }}>{r.name}</strong>
                <small style={{ color: "#727586", fontSize: "13px" }}>{r.role}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
