import { useEffect } from "react";
import { HostingerHeader } from "./components/HostingerHeader.jsx";
import { HostingerHeroReal } from "./components/HostingerHeroReal.jsx";
import { HostingerTrustBar } from "./components/HostingerTrustBar.jsx";
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
import "./styles/hostinger.css";

export default function HostingerLandingPage() {
  useEffect(() => {
    document.title = "Hosting administrado para WordPress | Rápido y accesible | Hostinger";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hostinger-landing-root">
      <HostingerHeader />
      <main>
        <HostingerHeroReal />
        <HostingerTrustBar />
        <HostingerAiCards />
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
