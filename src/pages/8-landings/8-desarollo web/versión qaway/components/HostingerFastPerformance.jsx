import { useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";

const performanceItems = [
  {
    title: "Tiempos de carga más rápidos",
    content: "Mantén tu sitio web ágil con servidores LiteSpeed y caché inteligente. Consigue una mejora de velocidad de hasta un 40% con la minimización de código, la optimización automática de imágenes y el redireccionamiento global.",
  },
  {
    title: "Sin tiempo de inactividad, sin perder visitantes",
    content: "Garantizamos un 99.9% de tiempo de actividad con infraestructura en la nube redundante para que tu negocio siempre esté disponible.",
  },
  {
    title: "Posicionamientos más altos y visibilidad en IA",
    content: "La velocidad de carga y los Core Web Vitals impecables impulsan tu clasificación en Google y en los motores de búsqueda impulsados por IA.",
  },
  {
    title: "Más conversiones",
    content: "Cada segundo de carga ahorrado incrementa tu tasa de conversión en hasta un 7%, reteniendo a compradores potenciales.",
  },
];

export function HostingerFastPerformance() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="rendimiento" style={{ padding: "80px 0", background: "#f8f9fc" }}>
      <div className="h-container">
        <div className="h-split-grid">
          {/* Izquierda */}
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#56596e", letterSpacing: "0.08em", textTransform: "uppercase", background: "#e6e8ee", padding: "4px 10px", borderRadius: "4px", display: "inline-block", marginBottom: "16px" }}>
              HOSTING ADMINISTRADO PARA WORDPRESS
            </span>
            <h2 style={{ margin: 0 }}>
              Rendimiento ultrarrápido y tiempo de actividad en el que puedes confiar
            </h2>
          </div>

          {/* Derecha: Acordeón */}
          <div className="h-accordion-list">
            {performanceItems.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={item.title} className="h-accordion-item-custom">
                  <button className="h-accordion-header-custom" onClick={() => toggle(idx)}>
                    <span>{item.title}</span>
                    {isOpen ? <Minus size={18} color="#673de6" /> : <Plus size={18} color="#84879c" />}
                  </button>
                  {isOpen && (
                    <div className="h-accordion-body-custom">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
