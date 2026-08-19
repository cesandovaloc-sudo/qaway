import React, { useEffect } from 'react';
import './josue-landing.css';
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

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Bakery",
      "@id": "https://josuepanaderia.pe/#bakery",
      name: "Josué Panadería",
      description: "Pan fresco, panes tradicionales, bocaditos y pedidos especiales horneados todos los días en San Miguel, Lima.",
      url: "https://josuepanaderia.pe",
      image: "https://josuepanaderia.pe/assets/og/home.webp",
      telephone: "+51 987 654 3210",
      email: "hola@josuepanaderia.pe",
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
        latitude: "-12.0781",
        longitude: "-77.0884",
      },
      hasMap: "https://www.google.com/maps/search/?api=1&query=Av.%20La%20Marina%20123456%2C%20San%20Miguel%2C%20Lima",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "06:00",
          closes: "20:00",
        },
      ],
      areaServed: ["San Miguel", "Pueblo Libre", "Magdalena"],
      sameAs: ["https://www.google.com/maps/search/?api=1&query=Av.%20La%20Marina%20123456%2C%20San%20Miguel%2C%20Lima"],
    },
    {
      "@type": "WebSite",
      "@id": "https://josuepanaderia.pe/#website",
      url: "https://josuepanaderia.pe",
      name: "Josué Panadería",
      inLanguage: "es-PE",
      publisher: { "@id": "https://josuepanaderia.pe/#bakery" },
    },
  ],
};

export default function PanaderiaPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="josue-landing">
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
      </main>
      <Footer />
    </div>
  );
}
