import React, { useEffect } from "react";
import SEO from "@/components/seo/SEO";
import "./dental-landing.css";
import { DentalLandingPage } from "./src/pages/DentalLandingPage";

const dentalSchema = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "name": "Sonrisa Clínica Dental",
  "image": "/src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/3-Dental/src/assets/generated/hero-clean.webp",
  "telephone": "+51 987 654 321",
  "email": "citas@sonrisadental.pe",
  "url": "https://qawaylab.com/proyectos/dental",
  "description": "Especialistas en ortodoncia personalizada, alineadores invisibles y estética dental con tecnología avanzada.",
  "openingHours": "Mo-Fr 09:00-19:00, Sa 09:00-14:00",
  "priceRange": "$$",
  "medicalSpecialty": "Dentistry",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Principal 123",
    "addressLocality": "San Isidro",
    "addressRegion": "Lima",
    "addressCountry": "PE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-12.0970",
    "longitude": "-77.0360"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1200",
    "bestRating": "5"
  },
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
