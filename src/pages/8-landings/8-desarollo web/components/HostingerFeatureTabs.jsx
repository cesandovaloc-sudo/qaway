import { useState } from "react";
import { Bot, Check, Gauge, Layers, ShieldCheck, Sparkles, Wand2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tabsData = [
  {
    id: "builder",
    label: "Creador con IA",
    icon: Wand2,
    badge: "100% Automático",
    title: "Crea tu web sin programar ni tocar una sola línea de código",
    desc: "El creador de WordPress con IA de Hostinger diseña páginas completas, adapta textos con tono persuasivo y configura formularios de contacto en menos de 2 minutos.",
    bullets: [
      "Generación instantánea de páginas, menús y formularios",
      "Redacción automática de artículos con asistente SEO",
      "Selección inteligente de imágenes de alta definición libres de derechos",
      "Editor visual intuitivo para personalizar cualquier elemento con arrastrar y soltar",
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "litespeed",
    label: "Velocidad LiteSpeed",
    icon: Zap,
    badge: "Aceleración NVMe",
    title: "Tiempos de carga récord para posicionar en el #1 de Google",
    desc: "Los servidores con servidor web LiteSpeed Enterprise y almacenamiento NVMe ofrecen hasta 3 veces más velocidad que el hosting tradicional con Apache.",
    bullets: [
      "Plugin LSCache preconfigurado para WordPress",
      "99/100 en Google PageSpeed Insights garantizado",
      "Tiempo de respuesta inicial (TTFB) inferior a 150ms",
      "Red de distribución de contenidos (CDN) global integrada",
    ],
    isGauge: true,
  },
  {
    id: "security",
    label: "Seguridad y Staging",
    icon: ShieldCheck,
    badge: "Protección 24/7",
    title: "Entorno de pruebas y protección total contra ataques",
    desc: "Prueba cambios, actualizaciones de plugins y nuevo diseño en un clon privado con la herramienta de Staging en 1 clic antes de publicar en tu sitio web en vivo.",
    bullets: [
      "Copias de seguridad automáticas diarias y bajo demanda",
      "Certificados SSL ilimitados gratuitos para todos tus dominios",
      "Escáner automático de malware y cortafuegos Cloudflare",
      "Restauración total con 1 solo clic en caso de emergencia",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
  },
];

export function HostingerFeatureTabs() {
  const [activeTab, setActiveTab] = useState("builder");
  const current = tabsData.find((t) => t.id === activeTab) || tabsData[0];

  return (
    <section id="features" className="h-tabs-section">
      <div className="hostinger-container">
        <div className="h-section-header">
          <h2>Todo el poder de WordPress impulsado por Inteligencia Artificial</h2>
          <p>Herramientas de nivel profesional para creadores, freelancers y empresas en crecimiento.</p>
        </div>

        {/* Tab Buttons */}
        <div className="h-tabs-nav">
          {tabsData.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                className={`h-tab-button ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} color={isActive ? "#5025d1" : "#727586"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-tab-content-card"
          >
            <div className="h-tab-text-side">
              <span className="h-discount-badge" style={{ marginBottom: "14px", display: "inline-block" }}>
                {current.badge}
              </span>
              <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#1d1e24", marginBottom: "16px", lineHeight: "1.2" }}>
                {current.title}
              </h3>
              <p style={{ color: "#727586", fontSize: "15.5px", lineHeight: "1.6", marginBottom: "24px" }}>
                {current.desc}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {current.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#2f303a" }}>
                    <Check size={16} strokeWidth={2.5} color="#00b090" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <a href="#precios" className="h-btn-primary">
                Ver planes de WordPress
              </a>
            </div>

            <div className="h-tab-media-side">
              {current.isGauge ? (
                <div className="h-gauge-wrap">
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", color: "#673de6", fontWeight: "700", fontSize: "13px" }}>
                    <Gauge size={18} />
                    <span>Google Core Web Vitals Benchmark</span>
                  </div>
                  <div className="h-gauge-score tabular-nums">99/100</div>
                  <p style={{ color: "#00b090", fontWeight: "700", fontSize: "15px", margin: "0 0 16px" }}>
                    Rendimiento Excelente • Carga en 0.4s
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", textAlign: "left" }}>
                    <div style={{ background: "#f8f9fa", padding: "14px", borderRadius: "10px", border: "1px solid #e2e5e9" }}>
                      <small style={{ color: "#727586", display: "block" }}>Hostinger LiteSpeed</small>
                      <strong style={{ fontSize: "18px", color: "#00b090" }}>120 ms TTFB</strong>
                    </div>
                    <div style={{ background: "#f8f9fa", padding: "14px", borderRadius: "10px", border: "1px solid #e2e5e9" }}>
                      <small style={{ color: "#727586", display: "block" }}>Hosting Estándar</small>
                      <strong style={{ fontSize: "18px", color: "#eb2f5d" }}>850 ms TTFB</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ borderRadius: "18px", overflow: "hidden", border: "1px solid #e2e5e9", boxShadow: "0 16px 40px rgba(0,0,0,0.06)" }}>
                  <img src={current.image} alt={current.title} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
