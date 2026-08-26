import { Sparkles } from "lucide-react";

export function HostingerBanner() {
  return (
    <div className="h-top-banner">
      <Sparkles size={16} color="#ffb800" />
      <span>
        ¡Aprovecha la Oferta Especial! <strong>Hasta 75% de descuento</strong> en Hosting WordPress + Dominio gratis.
      </span>
      <a href="#precios">Ver planes</a>
    </div>
  );
}
