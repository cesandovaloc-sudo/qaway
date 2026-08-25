import { useEffect } from "react";
import { HostingerHeader } from "./components/HostingerHeader.jsx";
import { HostingerHeroReal } from "./components/HostingerHeroReal.jsx";
import { HeroVariantGraphite } from "./components/HeroVariantGraphite.jsx";
import { HeroVariantSoftWarm } from "./components/HeroVariantSoftWarm.jsx";
import { HeroVariantSolidOrange } from "./components/HeroVariantSolidOrange.jsx";
import { HostingerAiCards } from "./components/HostingerAiCards.jsx";
import { HostingerFastPerformance } from "./components/HostingerFastPerformance.jsx";
import { HostingerKodeeAi } from "./components/HostingerKodeeAi.jsx";
import { HostingerSecurityGrid } from "./components/HostingerSecurityGrid.jsx";
import { HostingerSecurityGridTaste } from "./components/HostingerSecurityGridTaste.jsx";
import { HostingerEmailMarketing } from "./components/HostingerEmailMarketing.jsx";
import { HostingerSalesAutomationTaste } from "./components/HostingerSalesAutomationTaste.jsx";
import { HostingerMigrationDarkBanner } from "./components/HostingerMigrationDarkBanner.jsx";
import { HostingerTestimonialsSlider } from "./components/HostingerTestimonialsSlider.jsx";
import { HostingerEcommerceBanner } from "./components/HostingerEcommerceBanner.jsx";
import { HostingerPricingReal } from "./components/HostingerPricingReal.jsx";
import { HostingerFAQReal } from "./components/HostingerFAQReal.jsx";
import { QawayLeadContactForm } from "./components/QawayLeadContactForm.jsx";
import { HostingerFooterFull } from "./components/HostingerFooterFull.jsx";
import { QawayDesignPillarsSection } from "./components/QawayDesignPillarsSection.jsx";
import { ExitIntentModal } from "./components/ExitIntentModal.jsx";
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

        {/* 4. MARCAS & TESTIMONIOS (UNIFICADO) */}
        <HostingerTestimonialsSlider />

        {/* SECCIÓN DE SOPORTE & GARANTÍA (Pausada para después)
        <HostingerSecurityGrid />
        <HostingerSecurityGridTaste />
        */}

        {/* 5. CANALES DE VENTA & AUTOMATIZACIÓN (BENTO GRID TASTE) */}
        <HostingerSalesAutomationTaste />

        {/* 6. PLANES Y PRECIOS */}
        <HostingerPricingReal />

        {/* 7. PREGUNTAS FRECUENTES (Resuelve dudas) */}
        <HostingerFAQReal />

        {/* 8. FORMULARIO DE CONTACTO & ASESORÍA (Cierre final) */}
        <QawayLeadContactForm />
      </main>
      <HostingerFooterFull />
      
      {/* Pop-up de Intento de Salida (Exit-Intent) */}
      <ExitIntentModal />
    </div>
  );
}
