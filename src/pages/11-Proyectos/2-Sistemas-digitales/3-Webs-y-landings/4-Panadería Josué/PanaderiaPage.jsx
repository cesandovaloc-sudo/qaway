import React, { useEffect } from 'react';
import './josue-panaderia.css';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { Benefits } from './components/Benefits.jsx';
import { Products } from './components/Products.jsx';
import { BestSellers } from './components/BestSellers.jsx';
import { PromiseSection } from './components/PromiseSection.jsx';
import { ProcessSection } from './components/ProcessSection.jsx';
import { Neighborhood } from './components/Neighborhood.jsx';
import { Testimonials } from './components/Testimonials.jsx';
import { SpecialOrder } from './components/SpecialOrder.jsx';
import { Contact } from './components/Contact.jsx';
import { Footer } from './components/Footer.jsx';
import JosueStudioSignature from '@/components/studio/JosueStudioSignature.jsx';
import { site } from './data/site.js';

const siteUrl = "https://josuepanaderia.pe";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Bakery",
      "@id": `${siteUrl}/#bakery`,
      name: "Josué Panadería",
      description:
        "Pan fresco, panes tradicionales, bocaditos y pedidos especiales horneados todos los días en San Miguel, Lima.",
      url: siteUrl,
      image: `${siteUrl}/assets/og/home.webp`,
      telephone: site.phone,
      email: site.email,
      priceRange: "S/",
      servesCuisine: ["Peruana", "Repostería", "Panadería"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. La Marina 123456",
        addressLocality: "San Miguel",
        addressRegion: "Lima",
        addressCountry: "PE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.geo.latitude,
        longitude: site.geo.longitude,
      },
      hasMap: site.mapsUrl,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "06:00",
          closes: "20:00",
        },
      ],
      areaServed: ["San Miguel", "Pueblo Libre", "Magdalena"],
      sameAs: [site.mapsUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Josué Panadería",
      inLanguage: "es-PE",
      publisher: { "@id": `${siteUrl}/#bakery` },
    },
  ],
};

export default function PanaderiaPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="josue-panaderia-root josue-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Products />
        <BestSellers />
        <PromiseSection />
        <ProcessSection />
        <Neighborhood />
        <Testimonials />
        <SpecialOrder />
        <Contact />
        <JosueStudioSignature />
      </main>
      <Footer />
    </div>
  );
}
