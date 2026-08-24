import { useEffect } from "react";
import { HostingerHeader } from "./components/HostingerHeader.jsx";
import { HostingerHeroReal } from "./components/HostingerHeroReal.jsx";
import { HeroVariantGraphite } from "./components/HeroVariantGraphite.jsx";
import { HeroVariantSoftWarm } from "./components/HeroVariantSoftWarm.jsx";
import { HeroVariantSolidOrange } from "./components/HeroVariantSolidOrange.jsx";
import { HostingerAiCards } from "./components/HostingerAiCards.jsx";
import { HostingerEmailMarketing } from "./components/HostingerEmailMarketing.jsx";
import { HostingerFastPerformance } from "./components/HostingerFastPerformance.jsx";
import { HostingerKodeeAi } from "./components/HostingerKodeeAi.jsx";
import { HostingerSecurityGrid } from "./components/HostingerSecurityGrid.jsx";
import { HostingerMigrationDarkBanner } from "./components/HostingerMigrationDarkBanner.jsx";
import { HostingerTestimonialsSlider } from "./components/HostingerTestimonialsSlider.jsx";
import { HostingerEcommerceBanner } from "./components/HostingerEcommerceBanner.jsx";
import { HostingerPricingReal } from "./components/HostingerPricingReal.jsx";
import { HostingerFAQReal } from "./components/HostingerFAQReal.jsx";
import { HostingerFooterFull } from "./components/HostingerFooterFull.jsx";
import { QawayDesignPillarsSection } from "./components/QawayDesignPillarsSection.jsx";
import "./styles/qaway-landing.css";

export default function DesarrolloWebQawayPage() {
  useEffect(() => {
    document.title = "Desarrollo Web & Landings de Alta Conversión | Qaway Lab";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="qaway-landing-root">
      <HostingerHeader />
      <main>
        {/* 1. HERO */}
        <HostingerHeroReal />

        {/* 2. TIPOS DE WEB */}
        <HostingerAiCards />

        {/* 3. PILARES DE DISEÑO */}
        <QawayDesignPillarsSection />

        {/* 4. TESTIMONIOS */}
        <HostingerTestimonialsSlider />

        {/* 5. SOPORTE & GESTIÓN INTEGRAL */}
        <HostingerSecurityGrid />

        {/* 6. CANALES DE VENTA & AUTOMATIZACIÓN */}
        <HostingerEmailMarketing />

        {/* 7. PLANES Y PRECIOS */}
        <HostingerPricingReal />

        {/* 8. PREGUNTAS FRECUENTES */}
        <HostingerFAQReal />
      </main>
      <HostingerFooterFull />
    </div>
  );
}
