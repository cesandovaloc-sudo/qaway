import { Sparkles, Timer } from "lucide-react";

export function HostingerTopBanner() {
  return (
    <div className="h-top-banner">
      <Sparkles size={16} color="#ffb800" />
      <span>
        ¡Oferta de Temporada! <strong>Hasta 75% de descuento</strong> en Hosting WordPress Administrado + Dominio gratis.
      </span>
      <a href="#precios" className="h-top-banner-link">
        Aprovechar oferta →
      </a>
    </div>
  );
}
