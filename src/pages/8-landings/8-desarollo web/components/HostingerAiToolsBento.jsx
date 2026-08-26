import { Bot, Compass, FileText, Image as ImageIcon, Sparkles, TrendingUp, Wand2 } from "lucide-react";

const tools = [
  {
    icon: Wand2,
    title: "Creador de Logos con IA",
    desc: "Diseña la identidad gráfica de tu marca en segundos con iconos vectoriales y tipografía personalizada.",
    tag: "Branding Instantáneo",
  },
  {
    icon: FileText,
    title: "Redactor de Artículos SEO",
    desc: "Crea entradas de blog optimizadas para palabras clave relevantes y atrae tráfico orgánico a tu web.",
    tag: "Posicionamiento",
  },
  {
    icon: TrendingUp,
    title: "Mapas de Calor con IA",
    desc: "Analiza el comportamiento visual de tus usuarios y optimiza la ubicación de tus botones de compra.",
    tag: "CRO & Ventas",
  },
];

export function HostingerAiToolsBento() {
  return (
    <section id="herramientas" style={{ padding: "90px 0", background: "#ffffff" }}>
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Una suite completa de Inteligencia Artificial para tu negocio</h2>
          <p>Potencia tu estrategia digital con herramientas inteligentes integradas en tu panel.</p>
        </div>

        <div className="h-bento-suite-grid">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="h-bento-suite-card">
                <div className="h-bento-icon-box">
                  <Icon size={26} />
                </div>
                <span className="h-discount-badge" style={{ marginBottom: "12px", display: "inline-block" }}>
                  {t.tag}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1d1e24", marginBottom: "10px" }}>
                  {t.title}
                </h3>
                <p style={{ color: "#727586", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
