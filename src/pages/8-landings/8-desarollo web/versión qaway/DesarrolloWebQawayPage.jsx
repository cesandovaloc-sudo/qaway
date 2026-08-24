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
        {/* 1. HERO ACTUAL (Fondo Blanco Limpio) */}
        <HostingerHeroReal />

        {/* 2. ALTERNATIVA 1: HERO FLOTANTE GRAFITO CARBÓN */}
        <HeroVariantGraphite />

        {/* 3. ALTERNATIVA 2: HERO FLOTANTE WARM GLOW / NARANJA SUAVE */}
        <HeroVariantSoftWarm />

        {/* 4. ALTERNATIVA 3: HERO FLOTANTE NARANJA SÓLIDO */}
        <HeroVariantSolidOrange />

        <HostingerAiCards />
        <QawayDesignPillarsSection />
        <HostingerEmailMarketing />
        <HostingerFastPerformance />
        <HostingerKodeeAi />
        <HostingerSecurityGrid />
        <HostingerMigrationDarkBanner />
        <HostingerTestimonialsSlider />
        <HostingerEcommerceBanner />
        <HostingerPricingReal />
        <HostingerFAQReal />
      </main>
      <HostingerFooterFull />
    </div>
  );
}
