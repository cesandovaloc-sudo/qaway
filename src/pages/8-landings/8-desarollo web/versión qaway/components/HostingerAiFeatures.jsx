import { Bot, Gauge, Layers, Sparkles, Wand2, Zap } from "lucide-react";

export function HostingerAiFeatures() {
  return (
    <section id="features" className="h-features-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Todo lo que necesitas para tu web de WordPress con IA</h2>
          <p>Herramientas automáticas que te ahorran horas de trabajo técnico.</p>
        </div>

        {/* Fila 1 */}
        <div className="h-feature-row">
          <div className="h-feature-text">
            <div style={{ color: "#673de6", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>
              Generador Inteligente
            </div>
            <h3>Crea sitios web completos con un solo prompt</h3>
            <p>
              Describe tu negocio o proyecto en pocas palabras y la Inteligencia Artificial creará la estructura, los textos persuasivos, los menús y seleccionará imágenes de alta resolución automáticamente.
            </p>
            <a href="#precios" className="h-btn-primary">
              Probar creador con IA
            </a>
          </div>
          <div className="h-feature-image">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
              alt="Generación con IA de Hostinger"
              style={{ width: "100%", borderRadius: "16px", border: "1px solid #e2e5e9" }}
            />
          </div>
        </div>

        {/* Fila 2 */}
        <div className="h-feature-row">
          <div className="h-feature-text">
            <div style={{ color: "#673de6", fontWeight: "700", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>
              Asistente de Contenido y SEO
            </div>
            <h3>Redacta artículos y optimiza tu SEO en segundos</h3>
            <p>
              El asistente de IA integrado en el panel de WordPress te ayuda a escribir entradas de blog, descripciones de productos y sugerencias de palabras clave optimizadas para los primeros lugares de Google.
            </p>
            <a href="#precios" className="h-btn-primary">
              Optimizar con IA
            </a>
          </div>
          <div className="h-feature-image">
            <img
              src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80"
              alt="Asistente SEO con IA de Hostinger"
              style={{ width: "100%", borderRadius: "16px", border: "1px solid #e2e5e9" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
