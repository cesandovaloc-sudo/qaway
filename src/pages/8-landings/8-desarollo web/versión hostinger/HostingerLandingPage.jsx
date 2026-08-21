import { useEffect } from "react";
import { HostingerTopBanner } from "./components/HostingerTopBanner.jsx";
import { HostingerNavbar } from "./components/HostingerNavbar.jsx";
import { HostingerHeroInteractive } from "./components/HostingerHeroInteractive.jsx";
import { HostingerFeatureTabs } from "./components/HostingerFeatureTabs.jsx";
import { HostingerPricingMatrix } from "./components/HostingerPricingMatrix.jsx";
import { HostingerAiToolsBento } from "./components/HostingerAiToolsBento.jsx";
import { HostingerTestimonialsSlider } from "./components/HostingerTestimonialsSlider.jsx";
import { HostingerFAQAccordion } from "./components/HostingerFAQAccordion.jsx";
import { HostingerFooterFull } from "./components/HostingerFooterFull.jsx";
import "./styles/hostinger.css";

export default function HostingerLandingPage() {
  useEffect(() => {
    document.title = "Hosting Administrado para WordPress con IA | Rápido y Seguro | Hostinger";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hostinger-landing-root">
      <HostingerTopBanner />
      <HostingerNavbar />
      <main>
        <HostingerHeroInteractive />
        <HostingerFeatureTabs />
        <HostingerPricingMatrix />
        <HostingerAiToolsBento />
        <HostingerTestimonialsSlider />
        <HostingerFAQAccordion />
      </main>
      <HostingerFooterFull />
    </div>
  );
}
