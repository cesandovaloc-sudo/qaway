import React, { useEffect } from "react";
import SEO from "@/components/seo/SEO";
import "./dental-landing.css";
import { DentalLandingPage } from "./src/pages/DentalLandingPage";

const dentalSchema = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "Sonrisa Clínica Dental",
  "description": "Especialistas en ortodoncia personalizada, alineadores invisibles y estética dental con tecnología avanzada.",
  "openingHours": "Mo-Fr 09:00-19:00, Sa 09:00-14:00",
  "priceRange": "$$",
  "medicalSpecialty": "Dentistry",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tratamientos Odontológicos",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Ortodoncia y Alineadores Invisibles"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Evaluación Diagnóstica Digital"
        }
      }
    ]
  }
};

export default function DentalPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dental-landing">
      <SEO
        title="Sonrisa Clínica Dental | Ortodoncia y Alineadores Invisibles"
        description="Transforma tu sonrisa con especialistas certificados en ortodoncia, brackets estéticos y alineadores invisibles. Agenda tu evaluación diagnóstica sin costo."
        canonical="/proyectos/dental"
        schema={dentalSchema}
      />
      <DentalLandingPage />
    </div>
  );
}
