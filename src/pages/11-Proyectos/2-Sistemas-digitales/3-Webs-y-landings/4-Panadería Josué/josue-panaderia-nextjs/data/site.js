const address = "Av. La Marina 123456, San Miguel, Lima";

export const site = {
  whatsapp: "519876543210",
  phone: "+51 987 654 3210",
  email: "hola@josuepanaderia.pe",
  address,
  schedule: "Lunes a Domingo · 6:00 a. m. - 8:00 p. m.",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  geo: {
    latitude: "-12.0781",
    longitude: "-77.0884",
  },
};

export const whatsappUrl = (message) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
