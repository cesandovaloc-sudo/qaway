import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
import { FloatingWhatsAppButton } from "./components/FloatingWhatsAppButton.jsx";
import "./styles/qaway-landing.css";

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://qawaylab.com/#organization",
      "name": "Qaway Lab",
      "url": "https://qawaylab.com",
      "logo": "https://qawaylab.com/assets/logo-qaway.png",
      "description": "Estudio de desarrollo de páginas web, landing pages y tiendas online de alto impacto visual y conversión en Perú.",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PE"
      },
      "areaServed": "PE"
    },
    {
      "@type": "WebPage",
      "@id": "https://qawaylab.com/landings/desarrollo-web-qaway/#webpage",
      "url": "https://qawaylab.com/landings/desarrollo-web-qaway",
      "name": "Desarrollo Web & Landings de Alta Conversión 2026 | Qaway Lab",
      "description": "Creamos páginas web, landing pages y tiendas online que transmiten confianza, cargan en menos de 1 segundo y convierten visitantes en clientes por WhatsApp.",
      "inLanguage": "es-PE"
    },
    {
      "@type": "OfferCatalog",
      "name": "Planes de Desarrollo Web Qaway Lab",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "One Web (Landing Page de Alto Impacto)",
          "price": "79.90",
          "priceCurrency": "PEN",
          "description": "1 página todo en uno con mensaje directo, conexión a WhatsApp y diseño responsive optimizado."
        },
        {
          "@type": "Offer",
          "name": "Web Comercial",
          "price": "290.00",
          "priceCurrency": "PEN",
          "description": "Sitio web corporativo de hasta 5 páginas/secciones, diseño corporativo, WhatsApp y formulario de contacto."
        },
        {
          "@type": "Offer",
          "name": "Tienda Online Autoadministrable",
          "price": "490.00",
          "priceCurrency": "PEN",
          "description": "Catálogo digital interactivo con carrito, panel autoadministrable de productos/stock y checkout por WhatsApp."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Qué tipo de web necesita mi negocio?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Depende de tu objetivo comercial: si buscas una presencia rápida, todo en uno y directa para captar clientes en campañas, One Web o una Landing Page es ideal. Si necesitas mostrar varios servicios y dar una imagen corporativa sólida, elige Web Comercial. Si buscas vender productos las 24 horas con carrito, tu opción es Tienda Online."
          }
        },
        {
          "@type": "Question",
          "name": "¿El dominio y el hosting están incluidos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Si estás iniciando, para la publicación de tu sitio podemos utilizar infraestructura gratuita o de muy bajo costo según lo permita el proyecto. Luego, a medida que tu negocio escale, te asesoramos para adquirir tu propio dominio (.com o .pe) directamente a tu nombre."
          }
        },
        {
          "@type": "Question",
          "name": "¿Puedo conectar WhatsApp y formularios de contacto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí. Todos los planes cuentan con conexión directa a WhatsApp para captar clientes al instante. Además, integramos formularios de contacto adaptados a tu flujo de trabajo."
          }
        },
        {
          "@type": "Question",
          "name": "¿Puedo empezar con una One Web y ampliarla después?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Totalmente. Tu web se construye con arquitectura escalable: puedes iniciar hoy con una versión base y luego incorporar nuevas páginas, catálogo, CRM o automatizaciones según las necesidades de tu negocio."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuánto tiempo demora la entrega de mi web?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Una One Web suele estar lista en 3 a 5 días hábiles. Una Web Comercial toma entre 7 a 12 días, y una Tienda Online de 12 a 20 días."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo es el proceso de trabajo y pago?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Definimos los requerimientos y el presupuesto final desde el primer día, sin costos ocultos. Iniciamos con un anticipo del 50%, desarrollamos la propuesta para tu revisión y, tras tu aprobación final y publicación, se cancela el saldo restante."
          }
        }
      ]
    }
  ]
};

export default function DesarrolloWebQawayPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="qaway-landing-root">
      <Helmet>
        <title>Desarrollo Web & Landings de Alta Conversión 2026 | Qaway Lab</title>
        <meta name="description" content="Diseño y desarrollo de páginas web, landing pages y tiendas online en Perú. Carga ultrarrápida, alta conversión a WhatsApp y diseño visual de alto impacto." />
        <link rel="canonical" href="https://qawaylab.com/landings/desarrollo-web-qaway" />
        
        {/* OpenGraph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://qawaylab.com/landings/desarrollo-web-qaway" />
        <meta property="og:title" content="Desarrollo Web & Landings de Alta Conversión | Qaway Lab" />
        <meta property="og:description" content="Páginas web y tiendas digitales de alto impacto visual y conversión directa a WhatsApp. Planes desde S/ 79.90." />
        <meta property="og:image" content="https://qawaylab.com/assets/og-desarrollo-web.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Desarrollo Web & Landings de Alta Conversión | Qaway Lab" />
        <meta name="twitter:description" content="Páginas web y tiendas online diseñadas para convertir visitas en ventas. Qaway Lab." />
        <meta name="twitter:image" content="https://qawaylab.com/assets/og-desarrollo-web.png" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaJsonLd)}
        </script>
      </Helmet>

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

      {/* Botón Flotante Permanente de WhatsApp */}
      <FloatingWhatsAppButton />
    </div>
  );
}
