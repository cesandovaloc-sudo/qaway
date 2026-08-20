import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://josuepanaderia.pe";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Josué Panadería | Pan fresco en San Miguel", template: "%s | Josué Panadería" },
  description:
    "Pan fresco, panes tradicionales, bocaditos y pedidos especiales horneados todos los días en San Miguel, Lima. Encuéntranos y haz tu pedido por WhatsApp.",
  applicationName: "Josué Panadería",
  keywords: [
    "panadería San Miguel",
    "pan fresco Lima",
    "panes tradicionales",
    "bocaditos",
    "pedidos especiales de pan",
    "pan de leche",
    "pan francés",
    "tortas de aceite",
    "panadería de barrio Lima",
  ],
  authors: [{ name: "Josué Panadería" }],
  creator: "Josué Panadería",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Josué Panadería",
    url: siteUrl,
    locale: "es_PE",
    title: "Josué Panadería | Pan fresco en San Miguel",
    description: "Pan fresco todos los días. Panes tradicionales, bocaditos y pedidos especiales en San Miguel, Lima.",
    images: [{ url: "/assets/og/home.webp", width: 1200, height: 630, alt: "Josué Panadería, pan fresco en San Miguel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Josué Panadería | Pan fresco en San Miguel",
    description: "Pan fresco todos los días. Haz tu pedido por WhatsApp.",
    images: ["/assets/og/home.webp"],
  },
  category: "Panadería",
  icons: {
    icon: "/assets/logo/favicon.svg",
    apple: "/assets/logo/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
