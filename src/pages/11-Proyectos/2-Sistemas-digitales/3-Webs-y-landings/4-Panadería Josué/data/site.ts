const address = "Av. La Marina 123456, San Miguel, Lima";

export const site = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "519876543210",
  phone: "+51 987 654 3210",
  email: "hola@josuepanaderia.pe",
  address,
  schedule: "Lunes a Domingo · 6:00 a. m. - 8:00 p. m.",
  mapsUrl:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  geo: {
    latitude: process.env.NEXT_PUBLIC_MAP_LAT ?? "-12.0781",
    longitude: process.env.NEXT_PUBLIC_MAP_LNG ?? "-77.0884",
  },
};

export const whatsappUrl = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
