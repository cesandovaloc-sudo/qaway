export function formatPrice(priceCents: number | null) {
  if (priceCents == null) return "Precio por confirmar";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(priceCents / 100);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
