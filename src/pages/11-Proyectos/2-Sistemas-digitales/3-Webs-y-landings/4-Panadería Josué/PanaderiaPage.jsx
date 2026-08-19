import React, { useEffect } from 'react';
import './josue-landing.css';
import { Header } from './josue-panaderia-nextjs/components/Header.jsx';
import { Hero } from './josue-panaderia-nextjs/components/Hero.jsx';
import { Benefits } from './josue-panaderia-nextjs/components/Benefits.jsx';
import { Products } from './josue-panaderia-nextjs/components/Products.jsx';
import { BestSellers } from './josue-panaderia-nextjs/components/BestSellers.jsx';
import { PromiseSection } from './josue-panaderia-nextjs/components/PromiseSection.jsx';
import { ProcessSection } from './josue-panaderia-nextjs/components/ProcessSection.jsx';
import { Neighborhood } from './josue-panaderia-nextjs/components/Neighborhood.jsx';
import { Testimonials } from './josue-panaderia-nextjs/components/Testimonials.jsx';
import { SpecialOrder } from './josue-panaderia-nextjs/components/SpecialOrder.jsx';
import { Contact } from './josue-panaderia-nextjs/components/Contact.jsx';
import { Footer } from './josue-panaderia-nextjs/components/Footer.jsx';

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
