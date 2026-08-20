import { useEffect } from "react";
import { Navbar } from "./components/Navbar.jsx";
import { Hero } from "./components/Hero.jsx";
import { ShowcaseBento } from "./components/ShowcaseBento.jsx";
import { InteractiveMetrics } from "./components/InteractiveMetrics.jsx";
import { StickyProcess } from "./components/StickyProcess.jsx";
import { PricingSection } from "./components/PricingSection.jsx";
import { TestimonialsEditorial } from "./components/TestimonialsEditorial.jsx";
import { FAQSection } from "./components/FAQSection.jsx";
import { FooterSuperpower } from "./components/FooterSuperpower.jsx";
import "./styles/superpower.css";

export default function DesarrolloWebSuperpowerPage() {
  useEffect(() => {
    document.title = "Desarrollo Web & UI Editorial 2026 | Qaway Lab";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="superpower-landing-root">
      <Navbar />
      <main>
        <Hero />
        <ShowcaseBento />
        <InteractiveMetrics />
        <StickyProcess />
        <PricingSection />
        <TestimonialsEditorial />
        <FAQSection />
      </main>
      <FooterSuperpower />
    </div>
  );
}
