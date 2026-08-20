import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { Products } from "@/components/Products";
import { BestSellers } from "@/components/BestSellers";
import { PromiseSection } from "@/components/PromiseSection";
import { ProcessSection } from "@/components/ProcessSection";
import { Neighborhood } from "@/components/Neighborhood";
import { Testimonials } from "@/components/Testimonials";
import { SpecialOrder } from "@/components/SpecialOrder";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://josuepanaderia.pe";

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
        streetAddress: "Av. La Marina 1234",
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

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
